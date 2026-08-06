# NWD Consulting Network — website

The public site for the New World Disorder consulting collective, at
[nwd-consulting.com](https://nwd-consulting.com).

Static HTML. No framework, no build step to serve it. Deployed by **Cloudflare
Pages** from `main`.

## What this actually is

A faithful copy of the WordPress.com site Sarah built, with everything that
needed a WordPress server behind it removed. It is not a hand-written site and
should not be mistaken for one — the markup is WordPress block output, and it
reads like it.

That is a deliberate trade. The alternative, attempted in July 2026, was to
hand-write a replacement; it lost the design and every image on the site. This
approach keeps both.

**Treat this repo as a snapshot, not a codebase.** It is a good bridge off
WordPress and a poor foundation to build on. If NWD wants a site that developers
maintain, that is a separate project.

## Regenerating

    ./build.py            # rebuild from the mirror
    ./build.py --check    # report what it would do, write nothing

The source is a mirror at `~/workspace/archive/nwd-site-mirror-2026-08-06/`,
captured from `sitemap.xml` rather than by crawling — crawling alone missed ten
pages that nothing linked to. See that directory's `PROVENANCE.md`.

**`build.py` stops working when the WordPress.com plan is cancelled**, because
its source disappears. From that point this repo is the source, and edits are
edits to committed HTML.

## Checks

    ./lint.py                    # eight checks
    ./lint.py --root path/to/dir # against any tree

Every rule exists because the corresponding bug shipped, or came within one merge
of shipping. Each carries a comment naming the incident, so it doesn't get
deleted later as noise. CI runs the same suite on every pull request, then serves
the site and fetches every page and asset over real HTTP.

If you find a bug here, **add the check that would have caught it** in the same
change.

## Things worth knowing before you edit

- **Filenames must stay URL-safe.** wget originally saved assets with query
  strings baked into their names, so stylesheets lived at paths containing `?`,
  `%` and `&`. Windows cannot check out a repo containing those.
- **`srcset` is deliberately absent.** wget's `--convert-links` corrupted all 108
  of them, in a way browsers hide by falling back to `src`. Dropped rather than
  rebuilt; these are 400×400 headshots.
- **The intake form is a Google Form.** A static site cannot accept a POST. The
  link appears on the 8 pages that previously carried the Jetpack contact form.
- **Social preview images use absolute URLs.** Scrapers require it; this is the
  one place a hard-coded domain is correct.

## Contact and content changes

Editing this site currently means a pull request. That is a regression from
WordPress, where Sarah could edit through a UI, and it is tracked as
[NEW-89](https://linear.app/new-world-disorder/issue/NEW-89).
