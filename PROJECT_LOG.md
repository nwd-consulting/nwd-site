# Project Log — nwd/site

Narrative log, newest entry first. One entry per work session.

**Status:** built, not published. The repo is complete; the deploy is broken and the
domain is not cut over.
**Pages URL:** https://nwd-consulting.github.io/nwd-site/ — serves 1 page (a stale
2026-07-22 homepage) and 404s the other 29. Fix is in PR #6, unmerged.
**Custom domain:** `nwd-consulting.com` — WITH a hyphen. Still serves WordPress.com
(A 192.0.78.24/.25). Note `nwdconsulting.com` without a hyphen is a *different* domain on
a *different* Cloudflare account serving a parked maintenance page; it is not this project.
**Linear:** NEW-12 (Migrate NWD site off WordPress, In Progress), NEW-15 (contact email +
intake form, Done), NEW-16, NEW-89.
**Repo:** https://github.com/nwd-consulting/nwd-site (public, org-owned).

## 2026-08-10 — the deploy was dead, and the nav was broken on every page

Two independent defects found by comparing the *rendered* site against the WordPress
original, which nobody had done since the rebuild.

**1. Nothing had deployed since 2026-07-22.** `.github/workflows/pages.yml` was deleted in
`987a96e` ("Move to Cloudflare Pages") inside PR #4, but the repo's Pages setting stayed at
`build_type: "workflow"`. No workflow plus that setting deploys nothing and reports no
error. Probing all 30 sitemap URLs: **1× 200, 29× 404**. The one 200 was the superseded
July homepage. Restored the workflow, and it now verifies its own output by fetching every
sitemap URL from the published address after deploying. PR #6.

**2. The site navigation was broken on all 31 pages.** It rendered as a permanently
expanded vertical list with a stray hamburger and close button, instead of the horizontal
bar the WordPress original shows. Two causes, both in the ES-module plumbing:

- Script filenames had lost their `.js` extension (`view.min.js?m=…` became
  `view.min.js_m_…`). Browsers apply a strict MIME check to `type="module"` scripts and
  refuse to run one served as text/plain. 18 files renamed, 172 references rewritten.
- **The importmap was never de-WordPressed at all** — still root-absolute paths with query
  strings, and it named two modules (`interactivity-router`, `a11y`) the mirror had never
  downloaded, because wget does not parse importmap JSON. Both fetched from the live site
  while the WordPress plan is still active; they would have been unrecoverable after
  cancellation. Importmap rewritten to depth-correct relative paths on all 31 pages.

Added a ninth lint check, `ES modules load and resolve`, and confirmed it fails when the
original bug is reintroduced. Every other check in that file reasons about `src`/`href`
attributes, so an importmap — JSON inside a `<script>` tag — was invisible to all of them.

Verified visually at 1440×900 and 390×844 against the live WordPress reference:
`docs/screenshots/`. Content parity re-confirmed the same day — the live WordPress
`sitemap.xml` and the repo's contain the same 30 URLs, zero drift, and `wp-content/uploads`
holds 155 files in both.

- Artifact: PR #6, `docs/screenshots/`, `DNS-CUTOVER.md`.
- Next: merge PR #6 (blocked — needs Jake), then the domain cutover per `DNS-CUTOVER.md`.

## 2026-08-09 — log created, dead URL corrected

- This file did not exist; `nwd/README.md` named it as a known gap. Reconstructed from
  `git log`, not from memory.
- **Correction:** both `~/workspace/README.md` and `nwd/README.md` advertised the site as
  published at `https://mazerakham.github.io/nwd-site/`. That URL **404s** — it is the old
  personal-account Pages address from before the repo moved to the `nwd-consulting` org.
  The live URL is `https://nwd-consulting.github.io/nwd-site/`. Both READMEs fixed.
- `https://nwd-consulting.com/` (hyphenated) is still the **old WordPress**, serving the
  full live site. The domain cutover is the open half of NEW-12.
- Artifact: this file; the two corrected READMEs.
- Next: point nwd-consulting.com at the new host (NEW-12).

## 2026-08-06 — CI guardrails

- `658adae` Add three checks for bugs that were invisible in a browser.
- `e583557` Add a lint suite and run it in CI (`.github/workflows/lint.yml`).
- `f6947b0` (#4) Faithful copy of the live WordPress site, de-WordPressed.
- Left on branch `chore/ci-guardrails`, clean and level with origin. **The working copy is
  not on `main`** — check GitHub, not this checkout, for what is deployed.

## 2026-07-22 — initial rebuild off WordPress

- `9dc28ef` Rebuild NWD site as clean static site off WordPress; `a2f9ea0` init.
- `7660f7c` (#1) merge the static-site rebuild.
- `2f7b395` Wire real intake email (jmirra1515@gmail.com) on the Services page — NEW-15.
- `71f9fee` NWD tree/circuit logo in header, footer, favicon.
- `5cb5534` Trim company/year parentheticals from the Jake Mirra bio.
- `fb0e077` (#2), `b664096`, `d55811f` Black-hole homepage variant with a co-rotating disk.

## Known gaps

- The custom domain still serves WordPress. The github.io URL will hold the rebuilt site
  only once PR #6 is merged; until then it serves a stale July homepage and 29 404s.
- `archive/nwd-site-mirror-2026-08-06/` — the mirror `build.py` reads — has **no
  `PROVENANCE.md`**, though both this repo's README and NEW-12 tell readers to see it.
  The older `archive/nwdconsulting-site/` does have one.
- The legacy WordPress mirror lives at `archive/nwdconsulting-site/` — superseded, kept.
