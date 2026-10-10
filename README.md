# nwd-site

The website for NWD Consulting Network, live at [nwd-consulting.com](https://nwd-consulting.com).

Static pages, plus a blog with a browser-based editor, served by one Cloudflare Worker.

## Layout

```
public/       the site as served: HTML pages, styles, scripts, images
src/          the Worker: routing, blog, editor API, Google sign-in
migrations/   D1 schema for blog posts and editor sessions
scripts/      checks run in CI
```

The pages in `public/` were exported from the site's earlier WordPress version and are
edited in place. Their markup is WordPress block output.

## Develop

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

The site is at <http://localhost:8787>. To use the blog editor locally, visit
`/auth/dev?email=<an address in ALLOWED_EMAILS>`, then `/admin`.

## Test

```bash
npm run lint
```

`scripts/lint.py` catches broken references, unsafe filenames, dead WordPress UI and
other regressions; each check documents the bug it guards against. CI also serves
`public/` and fetches every page and asset (`scripts/check_served.py`).

## Deploy

Pull requests get a preview on the `nwd-site-preview` Worker. Merging to `main` deploys
production (`.github/workflows/deploy.yml`). Agent pull requests target `ai-main`.

Blog posts live in D1 and publish from `/admin` without a deploy. Editors are listed in
`ALLOWED_EMAILS` in `wrangler.toml`.
