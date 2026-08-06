#!/usr/bin/env python3
"""Check this static site for the failure modes that have actually bitten it.

    ./lint.py            # report and exit non-zero on failure
    ./lint.py --quiet    # only print failures

Every rule here exists because the corresponding bug shipped, or came within one
merge of shipping. None of them are hypothetical.

  filenames     wget baked query strings into asset names, so stylesheets lived at
                paths containing literal ? % and &. Python's http.server serves
                those; most servers percent-decode first and 404. The site would
                have deployed completely unstyled and no local test would show it.

  references    A relative-path bug silently flattened "../../../../../s2.wp.com"
                to "../s2.wp.com", which only broke on pages four levels deep.

  navigation    119 internal links pointed at nwdconsulting.wordpress.com. Real
                navigation between bio and service pages, which would have broken
                the day that subscription lapsed.

  externals     Fonts and scripts loaded from wordpress.com CDNs. Same failure
                mode, slower: fine until someone cancels a plan.

  dead UI       Subscribe boxes and comment forms that POST to a server we do not
                own. They render, they look real, they silently do nothing.
"""

from __future__ import annotations

import argparse
import html as html_lib
import re
import sys
import urllib.parse
from pathlib import Path

# Defaults to the script's own directory, which is right when CI runs it in a
# checkout. Overridable so the same checks can be pointed at a worktree or a
# build output directory - without that, the linter cannot be tested against
# anything but the tree it happens to be sitting in.
ROOT = Path(__file__).resolve().parent

# Characters that must never appear in a filename. '?' and '#' delimit URLs;
# '%' starts an escape sequence a server will decode before looking on disk.
UNSAFE_NAME_CHARS = set('?%&=#"\'<>|*')

# Hosts that must not appear in src/href on any page. These are things that stop
# working when the WordPress.com subscription ends.
FORBIDDEN_HOSTS = {
    "nwdconsulting.wordpress.com",
    "subscribe.wordpress.com",
    "stats.wp.com",
    "pixel.wp.com",
    "widgets.wp.com",
}

# Markup that only functions with a WordPress backend behind it.
DEAD_UI = {
    "wp-comments-post": "comment form posting to a server we do not own",
    "subscribe.wordpress.com": "subscribe form with no list behind it",
    'id="actionbar"': "WordPress admin action bar",
    "jp-carousel-comment-form\"": "Jetpack carousel comment form",
}

SKIP_DIRS = {".git", ".github", "node_modules"}
# The mirror captured WordPress.com's own marketing pages under the CDN
# hostnames. They are not ours and are not served.
SKIP_PAGE_DIRS = {"s0.wp.com", "s1.wp.com", "s2.wp.com"}


def pages() -> list[Path]:
    return [p for p in ROOT.rglob("*.html")
            if not (SKIP_DIRS | SKIP_PAGE_DIRS) & set(p.relative_to(ROOT).parts)]


def all_files() -> list[Path]:
    return [p for p in ROOT.rglob("*")
            if p.is_file() and not SKIP_DIRS & set(p.relative_to(ROOT).parts)]


def check_filenames() -> list[str]:
    bad = []
    for f in all_files():
        offenders = UNSAFE_NAME_CHARS & set(f.name)
        if offenders:
            bad.append(f"{f.relative_to(ROOT)}  contains {''.join(sorted(offenders))}")
    return bad


def local_refs(page: Path):
    """Yield (raw, resolved_path) for every same-site reference on a page."""
    text = page.read_text(encoding="utf-8", errors="replace")
    for m in re.finditer(r"""(?:src|href)=(["'])([^"']+)\1""", text):
        raw = html_lib.unescape(m.group(2))
        if raw.startswith(("http://", "https://", "//", "#", "mailto:", "data:", "javascript:")):
            continue
        if raw.startswith("context.") or "{" in raw:      # Interactivity API directives
            continue
        path = urllib.parse.unquote(raw.split("#")[0].split("?")[0])
        if not path:
            continue
        yield raw, (page.parent / path).resolve()


def check_references() -> list[str]:
    bad = []
    for page in pages():
        for raw, target in local_refs(page):
            try:
                target.relative_to(ROOT)
            except ValueError:
                bad.append(f"{page.relative_to(ROOT)}  escapes the repo: {raw[:70]}")
                continue
            if not target.exists() and not (target / "index.html").exists():
                bad.append(f"{page.relative_to(ROOT)}  -> missing: {raw[:70]}")
    return bad


def check_external_hosts() -> list[str]:
    bad = []
    for page in pages():
        text = page.read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r"""(?:src|href)=(["'])((?:https?:)?//[^"']+)\1""", text):
            host = html_lib.unescape(m.group(2)).split("//", 1)[1].split("/")[0]
            if host in FORBIDDEN_HOSTS:
                bad.append(f"{page.relative_to(ROOT)}  links to {host}")
    return sorted(set(bad))


def check_external_assets() -> list[str]:
    """Fonts and scripts must be served from this repo, not someone else's CDN."""
    bad = []
    for page in pages():
        text = page.read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r"""<script[^>]+src=(["'])((?:https?:)?//[^"']+)\1""", text):
            bad.append(f"{page.relative_to(ROOT)}  external script: {m.group(2)[:60]}")
        for m in re.finditer(r"""url\((['"]?)((?:https?:)?//[^)'"]+\.woff2?)\1\)""", text):
            bad.append(f"{page.relative_to(ROOT)}  external font: {m.group(2)[:60]}")
    return sorted(set(bad))


def check_dead_ui() -> list[str]:
    bad = []
    for page in pages():
        text = page.read_text(encoding="utf-8", errors="replace")
        for needle, why in DEAD_UI.items():
            if needle in text:
                bad.append(f"{page.relative_to(ROOT)}  {why}")
    return sorted(set(bad))


def check_meta_content() -> list[str]:
    """og:image and friends live in content=, which src/href checks never see.

    Every page's social preview pointed at s0.wp.com/i/blank.jpg - a blank
    placeholder on the host being retired - so every share rendered an empty box.
    Invisible to the reference checks and invisible in a browser.
    """
    bad = []
    for page in pages():
        text = page.read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r'<meta[^>]+content=(["\'])((?:https?:)?//[^"\']+)\1', text):
            host = html_lib.unescape(m.group(2)).split("//", 1)[1].split("/")[0]
            if host.endswith(("wp.com", "wordpress.com")):
                bad.append(f"{page.relative_to(ROOT)}  meta content -> {host}")
    return sorted(set(bad))


def check_srcset() -> list[str]:
    """A malformed srcset is invisible: browsers fall back to src and render fine.

    wget's --convert-links overwrites in place when the replacement is shorter
    than the original, which is what absolute->relative conversion always is. It
    corrupted all 108 srcset attributes in this mirror, producing candidates like
    "...allow_lossy=1sy=1 15../wp-content/..." - and every page still looked right.
    """
    bad = []
    for page in pages():
        text = page.read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r'srcset=(["\'])([^"\']*)\1', text):
            for candidate in html_lib.unescape(m.group(2)).split(","):
                candidate = candidate.strip()
                if not candidate:
                    continue
                parts = candidate.split()
                # A well-formed candidate is "url" or "url 123w" / "url 2x".
                if len(parts) > 2 or (len(parts) == 2 and not re.fullmatch(r"\d+(\.\d+)?[wx]", parts[1])):
                    bad.append(f"{page.relative_to(ROOT)}  malformed srcset: {candidate[:60]}")
                    break
    return sorted(set(bad))


def check_deploy_surface() -> list[str]:
    """Files a static host expects, which a crawl of a CMS never produces."""
    missing = []
    for name, why in [
        ("404.html", "unmatched paths get the host's branded error page instead of ours"),
        ("robots.txt", "crawlers get no guidance"),
        ("sitemap.xml", "the only authoritative list of what exists"),
    ]:
        if not (ROOT / name).is_file():
            missing.append(f"{name} missing — {why}")
    return missing


CHECKS = [
    ("filenames are URL-safe", check_filenames),
    ("local references resolve", check_references),
    ("no links to retiring hosts", check_external_hosts),
    ("fonts and scripts are self-hosted", check_external_assets),
    ("no dead WordPress UI", check_dead_ui),
    ("meta content avoids retiring hosts", check_meta_content),
    ("srcset is well-formed", check_srcset),
    ("deploy surface is present", check_deploy_surface),
]


def main() -> int:
    global ROOT
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--root", type=Path, default=ROOT,
                    help="directory to check (default: this script's directory)")
    args = ap.parse_args()
    ROOT = args.root.resolve()
    if not ROOT.is_dir():
        print(f"not a directory: {ROOT}", file=sys.stderr)
        return 2

    failed = 0
    for name, fn in CHECKS:
        problems = fn()
        if problems:
            failed += 1
            print(f"FAIL  {name}  ({len(problems)})")
            for p in problems[:20]:
                print(f"        {p}")
            if len(problems) > 20:
                print(f"        ... and {len(problems) - 20} more")
        elif not args.quiet:
            print(f"ok    {name}")

    if failed:
        print(f"\n{failed} of {len(CHECKS)} checks failed")
        return 1
    if not args.quiet:
        print(f"\nall {len(CHECKS)} checks passed over {len(pages())} pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
