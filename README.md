# NWD Consulting Network — website

Clean, responsive static site for the New World Disorder (NWD) consulting collective.
Rebuilt off the old WordPress site (`nwdconsulting.wordpress.com`). No frameworks, no
build toolchain required to serve — just static HTML/CSS/JS.

## Structure

```
index.html          Home (hero, capabilities, testimonials, CTA)
about.html          Mission + team grid (rendered live from data/team.json)
services.html       Five service areas + intake CTA
people/<slug>.html  Full bio pages (generated from team.json)
data/team.json      ← THE editable team directory (single source of truth)
assets/css/styles.css
assets/js/team.js   Fetches team.json and renders the team grid
build_bios.py       Regenerates people/*.html from team.json
```

## Editing the team ("sheet-fed team page")

Everything about the team lives in **`data/team.json`**. Each person is one object:

```json
{
  "slug": "jane-doe",
  "name": "Jane Doe, Ph.D.",
  "group": "Founders",
  "title": "Role | Role | Role",
  "bio": "Optional full prose. If present, a bio page is generated."
}
```

- The **team grid on `/about`** updates automatically from this file — no rebuild, no code change. (This is the MVP of the sheet-fed page; the next step is pointing `assets/js/team.js` at a Google Sheet published-to-web CSV.)
- If a person has a `bio`, regenerate their full page: `python3 build_bios.py`.
- `groupOrder` controls the order of the group headings.

## Local preview

The team grid uses `fetch()`, which browsers block on `file://`. Serve over HTTP:

```bash
cd nwd-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Hosted on **GitHub Pages** from the repo root via GitHub Actions
(`.github/workflows/pages.yml`). Push to `main` and Pages publishes automatically.

## Photos

The old site had no headshots, so cards use generated initial-avatars as placeholders.
To add real photos, add a `photo` field per person and extend the card/bio templates.
