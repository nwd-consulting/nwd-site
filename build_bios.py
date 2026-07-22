#!/usr/bin/env python3
"""Generate people/<slug>.html for every person in data/team.json that has a `bio`.

Run after editing bios:   python3 build_bios.py

The team GRID on /about updates live from team.json with no rebuild; only the
full bio pages are pre-rendered here (for SEO + no-JS access).
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "people")
os.makedirs(OUT, exist_ok=True)

with open(os.path.join(ROOT, "data", "team.json"), encoding="utf-8") as f:
    data = json.load(f)


def initials(name):
    c = re.sub(r",.*$", "", name).strip().split()
    first = c[0][0] if c else ""
    last = c[-1][0] if len(c) > 1 else ""
    return (first + last).upper()


def page(p):
    paras = "\n      ".join(
        f"<p>{html.escape(x)}</p>" for x in re.split(r"\n{2,}", p["bio"])
    )
    first_name = html.escape(re.sub(r",.*$", "", p["name"]))
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(p['name'])} — NWD Consulting Network</title>
  <meta name="description" content="{html.escape(p.get('title',''))}" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%232d3f8f'/><text x='16' y='22' font-size='15' font-family='Arial' font-weight='bold' fill='white' text-anchor='middle'>N</text></svg>" />
  <link rel="stylesheet" href="../assets/css/styles.css" />
</head>
<body>
  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="../index.html"><span class="mark">N</span> NWD Consulting</a>
      <nav class="nav-links">
        <a class="nav-hide" href="../about.html">About</a>
        <a class="nav-hide" href="../services.html">Services</a>
        <a class="btn" href="../services.html#intake">Schedule an intake</a>
      </nav>
    </div>
  </header>

  <section>
    <div class="wrap article">
      <p class="back"><a href="../about.html">&larr; Back to the team</a></p>
      <div class="bio-head">
        <div class="avatar" aria-hidden="true">{html.escape(initials(p['name']))}</div>
        <div><h1 style="margin:0">{html.escape(p['name'])}</h1></div>
      </div>
      <p class="role">{html.escape(p.get('title',''))}</p>
      {paras}
    </div>
  </section>

  <section class="alt">
    <div class="cta-band">
      <div class="wrap">
        <h2>Work with {first_name} and the NWD team</h2>
        <p>NWD is ready to take your collaborations and research to the next level.</p>
        <a class="btn" href="../services.html#intake">Schedule an intake interview</a>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="wrap foot">
      <a class="brand" href="../index.html"><span class="mark">N</span> NWD Consulting Network</a>
      <nav class="foot-links">
        <a href="../about.html">About</a>
        <a href="../services.html">Services</a>
        <a href="../services.html#intake">Schedule an intake</a>
      </nav>
    </div>
    <div class="wrap"><p class="muted">© 2026 NWD Consulting Network. Bridging education and technology around the world.</p></div>
  </footer>
</body>
</html>
"""


n = 0
for p in data["people"]:
    if not p.get("bio"):
        continue
    with open(os.path.join(OUT, p["slug"] + ".html"), "w", encoding="utf-8") as f:
        f.write(page(p))
    n += 1
print(f"Generated {n} bio pages in people/")
