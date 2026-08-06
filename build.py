#!/usr/bin/env python3
"""Build the static NWD site from a mirror of the live WordPress site.

    ./build.py            # build into the repo root
    ./build.py --check    # report what would happen, write nothing

Source: ~/workspace/archive/nwd-site-mirror-2026-08-06/
        Captured 2026-08-06 from the sitemap (30 pages), because an earlier
        2026-07-22 mirror turned out to be both stale and incomplete: it had
        skipped 18 of 24 images, and predated the Tutoring / Custom Software /
        Web Hosting services and Jake's article. See that directory's
        PROVENANCE.md.

Three things this does beyond copying:

1. Collapses the mirror's host directories. wget wrote pages under
   nwd-consulting.com/ and shared assets under s0/s1/s2.wp.com/ as siblings,
   with links like "../s2.wp.com/...". Pages move to the repo root, so every
   such link loses exactly one "../".

2. Renames images. The originals are image-3.png, image-12.png, 300x300dunno.png
   and so on. The person/image mapping was derived from the wp-block-columns
   structure on the About page (heading and <img> inside the same block), which
   agreed with an independent positional derivation, and Jake confirmed
   image-12.png is Henno Kotze. Renaming rewrites every reference including
   srcset variants and the ?w= query forms wget saved to disk.

3. Removes what needs a WordPress server, and replaces the one piece of real
   functionality:

     stats/pixel/bilmur       analytics beacons for a blog we no longer own
     gravatar hovercards      third-party script, no gravatars in use
     subscribe forms          POST to subscribe.wordpress.com; no list behind it
     comment forms            POST to wp-comments-post.php
     "Log In"                 WordPress admin
     the Jetpack intake form  -> Google Form (Name/Email/Message, matching the
                                 original's fields exactly)
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
import urllib.parse
import html as html_lib
from pathlib import Path

REPO = Path(__file__).resolve().parent
MIRROR = Path.home() / "workspace/archive/nwd-site-mirror-2026-08-06"
SITE = MIRROR / "nwd-consulting.com"
HOST_DIRS = ["s0.wp.com", "s1.wp.com", "s2.wp.com"]

INTAKE_FORM_URL = (
    "https://docs.google.com/forms/d/e/"
    "1FAIpQLScQF5HryeH5XERr7Jloifa_rWwmwag60oV--TZd8mtIFhxtrQ/viewform"
)

# old upload basename -> new basename. Query-string variants on disk
# (image-12.png?w=150&allow_lossy=1) are renamed alongside their base.
RENAMES = {
    # people, from the About page block structure
    "image-16.png": "sarah-maestrales.png",
    "image-3.png": "ifeyinwa-onyenekwu.png",
    "image-7.png": "travis-wichert.png",
    "zak.jpg": "zak-hickman.jpg",
    "mirra.jpg": "jake-mirra.jpg",
    "image-4.png": "sadie-gunnink.png",
    "image-8.png": "kari-beth-krieger.png",
    "whatsapp-image-2026-05-26-at-2.01.54-pm-2.jpeg": "antonio-triunfo.jpeg",
    "image-11.png": "davi-deconti.png",
    "image-12.png": "henno-kotze.png",
    "image.png": "gordon-tai.png",
    "image-5.png": "sarah-heany.png",
    "image-10.png": "gordon-tai-hiring.png",   # second Gordon image, on his bio page
    # artwork and photos
    "newworlddisorder.png": "illus-globe.png",
    "whatsappbot.jpeg": "illus-robot.jpeg",
    "smtheatermoji.jpg": "illus-presenter.jpg",
    "presurveyedit2.jpg": "illus-student-survey.jpg",
    "interviewtoon.jpg": "illus-intake-interview.jpg",
    "20190614_135610.jpg": "photo-chemistry-lab.jpg",
    # post featured images
    "karin.jpg": "post-next-level-biology.jpg",
    "300x300dunno.png": "post-patent-announcement.png",
    # branding
    "nwd-logo-edited.png": "nwd-logo.png",
}

SKIP_FILES = {"contact-sheet.html", "osd.xml"}

# wget saved CDN assets with the query string baked into the filename, e.g.
#   _static/index.html%3F%3F-eJy...&cssminify=yes.css
# Python's http.server happens to serve these, because it strips the query before
# percent-decoding. Most servers and CDNs do it the other way round, in which case
# every stylesheet 404s and the site ships unstyled. Rather than deploy and find
# out, sanitise every '?', '&' and '=' out of filenames and rewrite the references.
# '%' has to go as well as '?&='. wget left literal '%2F' sequences in filenames;
# a server percent-decodes those back into '/' and then looks for a nested path
# that does not exist. Stripping '?&=' alone leaves the stylesheets still 404ing.
UNSAFE_IN_NAME = str.maketrans({"?": "_", "&": "_", "=": "_", "%": "_"})
KEEP_AT_ROOT = {".git", ".github", ".gitignore", ".nojekyll", "README.md", "build.py"}


def is_junk(p: Path) -> bool:
    n = p.name
    return (n in SKIP_FILES or "share=" in n or n.startswith("xmlrpc")
            or any(part in {"feed", "tag", "category", "author", "comments"}
                   for part in p.parts))


def clear_repo() -> None:
    for child in REPO.iterdir():
        if child.name in KEEP_AT_ROOT:
            continue
        shutil.rmtree(child) if child.is_dir() else child.unlink()


def copy_tree() -> int:
    n = 0
    for src in SITE.rglob("*"):
        if not src.is_file() or is_junk(src.relative_to(SITE)):
            continue
        dst = REPO / src.relative_to(SITE)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        n += 1
    for h in HOST_DIRS:
        if (MIRROR / h).is_dir():
            shutil.copytree(MIRROR / h, REPO / h, dirs_exist_ok=True)
    return n


def sanitise_filenames() -> dict:
    """Rename every file whose name contains ? & or =, and return old->new basenames."""
    mapping: dict[str, str] = {}
    for f in sorted(REPO.rglob("*"), key=lambda p: -len(p.parts)):
        if not f.is_file() or f.name == "build.py":
            continue
        if not any(c in f.name for c in "?&=%"):
            continue
        new = f.name.translate(UNSAFE_IN_NAME)
        target = f.with_name(new)
        if target.exists():
            f.unlink()          # identical asset already landed under the safe name
        else:
            f.rename(target)
        mapping[f.name] = new
    return mapping


def rewrite_sanitised(html: str, mapping: dict, stats: dict) -> str:
    """Point references at the sanitised filenames.

    The reference in the markup is not a simple encoding of the filename on disk:
    wget wrote names containing a literal '%2F', which the HTML then double-encodes
    to '%252F', alongside '%3F' for '?' and '&amp;' for '&'. Guessing at string
    variants misses that. So decode each reference once - HTML entities, then
    percent-encoding - which yields exactly the on-disk name, and look that up.
    """
    n = 0

    def sub(m):
        nonlocal n
        attr, quote, value = m.group(1), m.group(2), m.group(3)
        decoded = urllib.parse.unquote(html_lib.unescape(value))
        base = decoded.rsplit("/", 1)[-1]
        if base not in mapping:
            return m.group(0)
        n += 1
        head = decoded[: len(decoded) - len(base)]
        return f"{attr}={quote}{head}{mapping[base]}{quote}"

    # WordPress emits <link href='…'> with single quotes and <img src="…"> with
    # double. Matching only one of them silently leaves every stylesheet broken.
    html = re.sub(r"""(src|href)=(["'])([^"']+)\2""", sub, html)
    if n:
        stats["sanitised_refs"] = stats.get("sanitised_refs", 0) + n
    return html


def strip_wordpress_chrome(html: str, stats: dict) -> str:
    """Remove leftovers that only make sense with a WordPress server behind them."""
    def bump(k, c=1):
        if c:
            stats[k] = stats.get(k, 0) + c

    # The hidden action bar: invisible, but it 404s three times per page and links
    # at subscribe.wordpress.com and the Reader.
    html, c = strip_block(html, r'<div[^>]*id=[\'"]actionbar[\'"]', "div")
    bump("actionbar", c)
    html, c = re.subn(r'<script[^>]*>[^<]*actionbar[^<]*</script>', "", html, flags=re.I | re.S)
    bump("actionbar_js", c)

    # Jetpack lightbox comment form - unreachable, its script is never loaded.
    html, c = strip_block(html, r'<form[^>]*id=[\'"]jp-carousel-comment-form[\'"]', "form")
    bump("carousel_form", c)

    # Jetpack Likes: a hidden iframe to widgets.wp.com on every page, plus its
    # postMessage listener. The feature is gone with WordPress, so it is a
    # third-party frame loading on every pageview for nothing.
    html, c = re.subn(r'<iframe[^>]*widgets\.wp\.com[^>]*>\s*</iframe>', "", html, flags=re.I | re.S)
    bump("likes_iframe", c)
    html, c = re.subn(r'<iframe[^>]*widgets\.wp\.com[^>]*/?>', "", html, flags=re.I | re.S)
    bump("likes_iframe", c)
    html, c = re.subn(r'<div[^>]*id=[\'"]likes-other-gravatars[\'"].*?</div>', "", html, flags=re.I | re.S)
    bump("likes_gravatars", c)

    # Jetpack Likes on blog posts hides behind three different forms, which is why
    # stripping <iframe> alone left it in place: an external stylesheet for the
    # comment editor, a wrapper div holding the iframe URL in data-src for lazy
    # loading, and inline JS config. The feature dies with WordPress, and the
    # stylesheet is a genuine external dependency on a host we are leaving.
    html, c = re.subn(r'<link[^>]+widgets\.wp\.com[^>]*>', "", html, flags=re.I)
    bump("widgets_css", c)
    # NB single quotes: WordPress emits class='...' here and class="..." elsewhere.
    # Matching only double quotes is what left this in place the first two times.
    html, c = strip_block(
        html, r"""<div[^>]*class=["'][^"']*jetpack-likes-widget-wrapper""", "div")
    bump("likes_widget", c)

    # DNS-prefetch and preconnect hints for WordPress.com hosts. Inert, but they
    # ask the browser to resolve hosts this site no longer uses.
    html, c = re.subn(
        r'<link[^>]+rel=[\'"](?:dns-prefetch|preconnect)[\'"][^>]+(?:wp\.com|wordpress\.com)[^>]*>',
        "", html, flags=re.I)
    bump("dns_prefetch", c)

    # Metadata pointing at the WordPress install we are retiring.
    for pat, key in [
        (r'<link[^>]+rel=[\'"]EditURI[\'"][^>]*>', "editURI"),
        (r'<link[^>]+public-api\.wordpress\.com[^>]*>', "oembed"),
        (r'<link[^>]+rel=[\'"]search[\'"][^>]+opensearch[^>]*>', "opensearch"),
        (r'<link[^>]+rel=[\'"]modulepreload[\'"][^>]+https://nwd-consulting\.com[^>]*>', "modulepreload"),
    ]:
        html, c = re.subn(pat, "", html, flags=re.I)
        bump(key, c)
    return html


def apply_renames() -> int:
    """Rename upload files, carrying any ?query suffix onto the new name."""
    n = 0
    uploads = REPO / "wp-content/uploads"
    if not uploads.is_dir():
        return 0
    for f in list(uploads.rglob("*")):
        if not f.is_file():
            continue
        base, sep, query = f.name.partition("?")
        if base in RENAMES:
            f.rename(f.with_name(RENAMES[base] + sep + query))
            n += 1
    return n


def clean(html: str, prefix: str, stats: dict) -> str:
    def bump(k, c=1):
        stats[k] = stats.get(k, 0) + c

    # 1. host-dir collapse. Pages move up out of nwd-consulting.com/, so every
    #    "../…/sN.wp.com/" loses exactly ONE level — not all of them. A greedy
    #    (\.\./)* only captures its final repetition, which silently flattened
    #    five levels to one and broke deep blog posts.
    def drop_one_level(m):
        ups = m.group(0).count("../")
        return "../" * (ups - 1) + m.group("host")

    html, c = re.subn(r'(?:\.\./)+(?P<host>s[0-9]\.wp\.com/)', drop_one_level, html)
    if c:
        bump("hostpaths", c)

    # 2. renames, across src, srcset, data-orig-file, everything
    for old, new in RENAMES.items():
        if old in html:
            c = html.count(old)
            html = html.replace(old, new)
            bump("renamed_refs", c)

    # 2b. One image was hotlinked from Sarah's personal blog (pigtailz.wordpress.com)
    #     rather than uploaded to this site. It is the only load-bearing external
    #     image, and it would vanish if she ever deleted that blog. Point it local.
    html, c = re.subn(
        r'https://pigtailz\.wordpress\.com/wp-content/uploads/2026/02/'
        r'whatsapp-image-2026-02-01-at-5\.51\.04-pm\.jpeg(\?[^"\']*)?',
        prefix + 'wp-content/uploads/2026/02/sarah-maestrales-alt.jpeg', html)
    if c:
        bump("delinked_image", c)

    # 2b-ii. Drop srcset/sizes entirely. wget's --convert-links corrupts srcset
    #        when the replacement string is shorter than the original, which is
    #        exactly what absolute->relative conversion does. The damage is
    #        in-place overwriting, so values end up like
    #          "...png%3Fw=150&allow_lossy=1sy=1 15../wp-content/..."
    #        with fragments of the next candidate bleeding into the previous one.
    #        Every srcset in the mirror is affected. Browsers silently fall back to
    #        src, which is why the pages looked correct and nothing caught it.
    #        Rebuilding these from disk is possible but not worth it for
    #        400x400 headshots; dropping them costs a little bandwidth and
    #        removes a whole class of silent wrongness.
    html, c = re.subn(r'\s+srcset=(["\'])[^"\']*\1', "", html)
    bump("srcset_dropped", c)
    html, c = re.subn(r'\s+sizes=(["\'])[^"\']*\1', "", html)
    bump("sizes_dropped", c)

    # 2b-iii. Social preview images pointed at s0.wp.com/i/blank.jpg - a literally
    #         blank placeholder, on the host being retired. Every share of this
    #         site on Slack, LinkedIn or iMessage rendered an empty box. Social
    #         scrapers require an absolute URL, so this is the one place a
    #         hard-coded domain is correct rather than lazy.
    html, c = re.subn(
        r'(<meta[^>]+(?:property|name)=["\'](?:og:image|twitter:image)[^>]*content=["\'])'
        r'https://s[0-9]\.wp\.com/[^"\']*(["\'])',
        r'\1https://nwd-consulting.com/wp-content/uploads/2026/07/nwd-logo.png\2',
        html, flags=re.I)
    bump("og_image", c)

    # 2c. Internal navigation still pointing at the old WordPress host. These are
    #     real links between pages of this site - bio pages, service pages, posts -
    #     that would break the day the WordPress.com plan is cancelled. Rewrite them
    #     to the local copy, at the right depth for this page.
    def relocalise(m):
        path = m.group(1).strip("/")
        return f'"{prefix}{path}/"' if path else f'"{prefix}"'

    html, c = re.subn(r'"https://nwdconsulting\.wordpress\.com/([^"]*)"', relocalise, html)
    if c:
        bump("relocalised_links", c)

    # 3. trackers and third-party scripts
    for pat, key in [
        (r'<script[^>]+src=[\'"][^\'"]*stats\.wp\.com[^\'"]*[\'"][^>]*>\s*</script>', "stats"),
        (r'<script[^>]+src=[\'"][^\'"]*gravatar\.com[^\'"]*[\'"][^>]*>\s*</script>', "gravatar"),
        (r'<script[^>]+src=[\'"][^\'"]*bilmur[^\'"]*[\'"][^>]*>\s*</script>', "bilmur"),
        (r'<img[^>]+src=[\'"][^\'"]*pixel\.wp\.com[^\'"]*[\'"][^>]*>', "pixel"),
    ]:
        html, c = re.subn(pat, "", html, flags=re.I | re.S)
        if c:
            bump(key, c)

    # 4. forms that need WordPress
    html, c = strip_block(html, r'<form[^>]*action=[\'"]https://subscribe\.wordpress\.com[\'"]', "form")
    bump("subscribe", c)
    html, c = strip_block(html, r'<form[^>]*action=[\'"][^\'"]*wp-comments-post\.php[\'"]', "form")
    bump("comments", c)

    # Stripping the <form> leaves Jetpack's wrapper behind, so the dead email
    # field and SUBSCRIBE button still render. Remove the whole block, and the
    # prompt paragraph that only exists to introduce it.
    html, c = strip_block(
        html, r'<div[^>]*class="[^"]*wp-block-jetpack-subscriptions(?:__supports-newline)?[^"]*"', "div")
    bump("subscribe_block", c)
    html, c = re.subn(r'<p[^>]*>\s*Stay up to date with the latest from our blog\.?\s*</p>',
                      "", html, flags=re.I)
    if c:
        bump("subscribe_prompt", c)

    # Same story for comments: removing the <form> leaves a "Leave a comment"
    # heading with nothing beneath it. Take the whole respond block.
    html, c = strip_block(html, r'<div[^>]*class="[^"]*comment-respond[^"]*"', "div")
    bump("comment_block", c)

    # 5. intake form -> Google Form, replaced in place
    html, c = replace_intake(html)
    bump("intake", c)

    html, c = re.subn(r'<a[^>]*>\s*Log\s*In\s*</a>', "", html, flags=re.I)
    if c:
        bump("login", c)
    return html


def strip_block(html: str, start_pat: str, tag: str) -> tuple[str, int]:
    """Remove <tag>…</tag> blocks whose opening tag matches, honouring nesting."""
    out, removed, pos = [], 0, 0
    for m in re.finditer(start_pat, html):
        if m.start() < pos:
            continue
        depth, end = 0, None
        for t in re.finditer(rf"</?{tag}\b", html[m.start():]):
            depth += -1 if t.group(0).startswith("</") else 1
            if depth == 0:
                close = html.find(">", m.start() + t.end())
                end = close + 1 if close > 0 else m.end()
                break
        if end is None:
            continue
        out.append(html[pos:m.start()])
        pos, removed = end, removed + 1
    out.append(html[pos:])
    return "".join(out), removed


def replace_intake(html: str) -> tuple[str, int]:
    """Swap the Jetpack contact form for a link to the Google Form, in place."""
    cta = (
        '<div class="wp-block-buttons nwd-intake">'
        '<div class="wp-block-button">'
        f'<a class="wp-block-button__link wp-element-button" href="{INTAKE_FORM_URL}" '
        'target="_blank" rel="noopener">Schedule an intake interview</a>'
        '</div></div>'
    )
    count = 0
    while True:
        m = re.search(r'<form[^>]*class=[\'"][^\'"]*contact-form[^\'"]*[\'"]', html)
        if not m:
            break
        depth, end = 0, None
        for t in re.finditer(r"</?form\b", html[m.start():]):
            depth += -1 if t.group(0).startswith("</") else 1
            if depth == 0:
                close = html.find(">", m.start() + t.end())
                end = close + 1 if close > 0 else m.end()
                break
        if end is None:
            break
        html = html[:m.start()] + cta + html[end:]
        count += 1
    return html, count


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    if not SITE.is_dir():
        print(f"mirror not found: {SITE}", file=sys.stderr)
        return 1

    pages = [p for p in SITE.rglob("index.html")
             if "wp-content" not in p.parts and not is_junk(p.relative_to(SITE))]
    if args.check:
        print(f"mirror : {MIRROR}")
        print(f"pages  : {len(pages)}")
        print(f"uploads: {len(list((SITE / 'wp-content/uploads').rglob('*')))}")
        print(f"renames: {len(RENAMES)}")
        return 0

    clear_repo()
    copied = copy_tree()

    # The mirror picked up WordPress.com's own marketing homepage under each CDN
    # hostname - 350KB each, unreferenced, and carrying all the tracking cruft.
    strays = 0
    for h in HOST_DIRS:
        p = REPO / h / "index.html"
        if p.is_file():
            p.unlink()
            strays += 1

    renamed = apply_renames()
    mapping = sanitise_filenames()

    stats: dict = {}
    for f in REPO.rglob("*.html"):
        if any(p in {"wp-content", "s0.wp.com", "s1.wp.com", "s2.wp.com"} for p in f.parts):
            continue
        text = f.read_text(encoding="utf-8", errors="replace")
        depth = len(f.relative_to(REPO).parts) - 1
        prefix = '../' * depth
        text = clean(text, prefix, stats)
        text = strip_wordpress_chrome(text, stats)
        text = rewrite_sanitised(text, mapping, stats)
        f.write_text(text, encoding="utf-8")

    # Relocalising internal links can expose links that were already broken on the
    # original site. /2026/05/19/edumetrix-ecosystem-education-partners/ 404s
    # upstream and is absent from the sitemap, so rewriting it to a local path
    # turned a broken external link into a broken internal one. Unwrap any anchor
    # whose target does not exist in the build, keeping the link text.
    dead = 0
    for f in REPO.rglob("*.html"):
        if any(p in {"wp-content", "s0.wp.com", "s1.wp.com", "s2.wp.com"} for p in f.parts):
            continue
        text = f.read_text(encoding="utf-8", errors="replace")

        def unwrap(m, _f=f):
            nonlocal dead
            href = html_lib.unescape(m.group(1))
            if href.startswith(("http", "//", "#", "mailto:", "data:")) or "{" in href:
                return m.group(0)
            target = (_f.parent / urllib.parse.unquote(href.split("#")[0])).resolve()
            if target.exists() or (target / "index.html").exists():
                return m.group(0)
            dead += 1
            return m.group(2)

        text = re.sub(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', unwrap, text, flags=re.S)
        f.write_text(text, encoding="utf-8")
    if dead:
        print(f"dead links unwrapped: {dead}")

    # robots.txt still advertises WordPress.com sitemaps that don't exist here.
    (REPO / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: https://nwd-consulting.com/sitemap.xml\n",
        encoding="utf-8")

    # A sitemap listing the pages that actually exist. The mirror's robots.txt
    # advertised WordPress.com's, which this build does not have.
    urls = sorted(
        "https://nwd-consulting.com/" + str(p.parent.relative_to(REPO)).replace(".", "").lstrip("/")
        for p in REPO.rglob("index.html")
        if not {"s0.wp.com", "s1.wp.com", "s2.wp.com", ".git"} & set(p.parts))
    body = "\n".join(f"  <url><loc>{u.rstrip('/')}/</loc></url>" for u in urls)
    (REPO / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n</urlset>\n", encoding="utf-8")

    # GitHub Pages serves 404.html for unmatched paths. Without it visitors get
    # GitHub's own branded 404, which looks like the site is broken rather than
    # the link being wrong. Built from the real homepage so it carries the site's
    # styling rather than being an unstyled orphan.
    home = (REPO / "index.html").read_text(encoding="utf-8", errors="replace")
    notfound = re.sub(
        r"<title>[^<]*</title>", "<title>Page not found — NWD Consulting Network</title>",
        home, count=1)
    (REPO / "404.html").write_text(notfound, encoding="utf-8")

    print(f"files copied      : {copied}")
    print(f"stray CDN pages   : {strays} deleted")
    print(f"images renamed    : {renamed}")
    print(f"filenames sanitised: {len(mapping)}")
    for k in sorted(stats):
        print(f"  {k}: {stats[k]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
