# Cutover runbook — `nwd-consulting.com`

**Written 2026-08-10. Nothing in this file has been executed.** Every value below was read
from live DNS, WHOIS or the GitHub API on that date, not copied from an older document.

Do not run any of this until [§0 Decide the host](#0-decide-the-host) is answered and
[§1 Prerequisites](#1-prerequisites-none-of-which-are-dns) are all true.

---

## Read this before anything else

**The domain is `nwd-consulting.com`, with a hyphen.**

There is a second, similar domain and it is not ours to point anywhere:

| | `nwd-consulting.com` | `nwdconsulting.com` |
|---|---|---|
| Hyphen | yes | no |
| Nameservers | `grant.ns.cloudflare.com`, `uma.ns.cloudflare.com` | `megan.ns.cloudflare.com`, `ernest.ns.cloudflare.com` |
| A records | `192.0.78.24`, `192.0.78.25` (WordPress.com / Automattic) | `104.21.88.123`, `172.67.179.58` (Cloudflare proxy) |
| Serves | **the real, full NWD site** | a parked "Site is undergoing maintenance" page, © 2023 |
| This runbook | **applies** | does not apply |

Different nameserver pairs mean these are two zones on **two different Cloudflare
accounts**. Changing the wrong one does nothing useful and may break something nobody is
tracking.

**The zone is on Sarah's Cloudflare account. Jake has member access, not ownership.**
That is enough to edit DNS records; it is not enough to transfer the domain. Per the
2026-08-05 audit on NEW-12, the registrar is **Cloudflare Registrar** itself, and
Cloudflare Registrar **forbids third-party nameservers** — "You will not be able to change
to another DNS provider's nameservers while using Cloudflare Registrar." So:

- DNS **stays at Cloudflare** under every option below. Moving it to Google Cloud DNS,
  Route 53 or anywhere else is not available without first transferring the registration
  away, which is separately blocked until roughly **2026-09-15** by Cloudflare's 60-day
  post-transfer lock. A working session for that is already on the calendar for
  **2026-09-14**.
- Nothing in this runbook needs the transfer. Cutover and ownership are independent.

### Email: this changed since the last audit, and the ticket is now wrong

NEW-12's 2026-08-05 comment says *"No email risk in the cutover: the domain has no MX and
no TXT records, so repointing it cannot break anyone's mail."* **That is no longer true.**
Re-checked 2026-08-10:

```
MX   nwd-consulting.com   1 smtp.google.com.
TXT  nwd-consulting.com   "v=spf1 include:_spf.google.com ~all"
TXT  nwd-consulting.com   "google-site-verification=P62_cy3_l30l_PBnLj2PP0pdVCA87YtUvnu8GmzJT9Q"
CAA  nwd-consulting.com   (none)
```

Google Workspace has been set up on this domain since that audit — which matches the
"Google Workspace signup pending" note on the same ticket. **Live company mail now depends
on this zone.**

The cutover is still safe, because it only touches `A`, `AAAA` and `CNAME` records for the
apex and `www`. But the old "there is nothing to break here" reasoning is gone, so:

- **Do not delete the `MX` record.** Do not delete either `TXT` record.
- **Do not use any "delete all records and start clean" flow.**
- Under Option A, when Cloudflare Pages asks to manage the domain, let it create the
  CNAMEs — it will not touch MX or TXT. Verify that afterwards with §5, step 6.
- There is no `CAA` record, so neither GitHub nor Cloudflare will be blocked from issuing a
  certificate. Do not add one during the cutover.

---

## 0. Decide the host

This is the one genuinely open question, and it is Jake's call. Both records sets are
written out below; pick one and skip the other.

**Option A — Cloudflare Pages.** This is what NEW-12 currently records as the decision
(2026-08-06). Rationale on the ticket: GitHub Pages behind Cloudflare DNS breaks
certificate provisioning when the orange cloud is on, offers no configurable redirects,
and GitHub's terms discourage business sites. Cloudflare Pages manages its own DNS because
the zone is in the same account, and it gives `_redirects`, `_headers`, and a Function
that could accept the contact form directly — retiring the Google Form.

*Cost:* a Cloudflare Pages project does not exist yet. Creating it needs Jake in the
dashboard; the stored API token is DNS-scoped and cannot do it.

**Option B — GitHub Pages.** Already built, already configured, already public, and after
PR #6 it deploys on every push to `main` and verifies its own output. Custom domains on
GitHub Pages need the Cloudflare records to be **DNS-only (grey cloud)**, which is the
documented way to avoid the certificate problem in Option A's rationale — that objection
is real but it is avoidable rather than disqualifying.

*Cost:* no `_redirects`/`_headers`, and GitHub's ToS language about business sites remains
a genuine if rarely-enforced concern.

**Recommendation.** Option B is the shorter path to a correct public site today, and it is
reversible in minutes. Option A is the better long-term home and matches the recorded
decision. If Jake wants the site correct on the real domain this week, do B now and treat A
as a later, unhurried move — the repo is the source either way and nothing about B makes A
harder. If he would rather do it once, do A and accept that it is gated on him creating the
Pages project first.

---

## 1. Prerequisites, none of which are DNS

These are ordered. Do not skip to §2 with any of them unfinished.

1. **Merge PR #6** — https://github.com/nwd-consulting/nwd-site/pull/6.
   Without it `main` does not deploy at all, and cutting the domain over to a host that
   is serving one stale page and 29 404s would be strictly worse than the WordPress site
   it replaces. This is the single most important line in this document.
2. **Confirm the deploy is real.** After the merge, the workflow itself fetches every URL
   in `sitemap.xml` from the published address and fails if any is not 200. Check the run
   is green, then confirm independently:

   ```sh
   while read -r p; do
     printf '%s %s\n' "$(curl -sS -o /dev/null -m 20 -w '%{http_code}' \
       "https://nwd-consulting.github.io/nwd-site$p")" "$p"
   done < <(grep -o '<loc>[^<]*</loc>' sitemap.xml \
              | sed 's|<loc>https://nwd-consulting.com||; s|</loc>||; s|^$|/|') \
   | sort | uniq -c | sort -rn
   ```

   Expect `30` lines of `200`. Anything else, stop.
3. **Tell Sarah the cutover is happening**, before it happens rather than after. She built
   this site and the WordPress admin UI stops being how it is edited. NEW-89 is the
   replacement path and it is not built yet.
4. **Do not cancel the WordPress.com plan yet.** Two independent reasons: it is the only
   rollback target (§6), and `build.py` reads from it. Cancel only after §5 passes and
   after a few days of the new site being live.

---

## 2. Option A — Cloudflare Pages

### 2a. Create the project (Jake, dashboard, once)

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** →
`nwd-consulting/nwd-site`.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | **None** |
| Build command | *(leave empty)* |
| Build output directory | `/` |

The repo is the artifact; there is no build step. Leaving a build command in place is the
usual way this goes wrong.

Deploy once and confirm the `*.pages.dev` URL serves all 30 pages before touching DNS.

### 2b. Attach the domain

Pages project → **Custom domains** → **Set up a custom domain** → `nwd-consulting.com`.
Repeat for `www.nwd-consulting.com`.

Because the zone is in the same Cloudflare account, Cloudflare **writes the records
itself**. Do not hand-create them. What it creates:

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `nwd-consulting.com` | `nwd-site.pages.dev` | Proxied (orange) |
| CNAME | `www` | `nwd-site.pages.dev` | Proxied (orange) |

The apex CNAME is legitimate here — Cloudflare flattens it at the edge.

### 2c. Remove the WordPress records

**Only after 2b shows "Active".** In the Cloudflare DNS tab, delete:

| Type | Name | Content | Why |
|---|---|---|---|
| A | `nwd-consulting.com` | `192.0.78.24` | WordPress.com |
| A | `nwd-consulting.com` | `192.0.78.25` | WordPress.com |
| A / CNAME | `www` | *(whatever currently answers)* | WordPress.com |

Leaving these alongside the new CNAMEs is the specific failure NEW-12 warns about: DNS
round-robins between old and new, and the site appears to work intermittently, which is
much harder to diagnose than being plainly down.

### 2d. There is no CNAME file in this option

Cloudflare Pages ignores a `CNAME` file. Do not add one.

---

## 3. Option B — GitHub Pages

### 3a. Add the `CNAME` file (repo, first)

Do this **before** the DNS change, so GitHub is ready to answer for the name.

```sh
cd ~/workspace/nwd/site
git checkout main && git pull
printf 'nwd-consulting.com\n' > CNAME
git add CNAME && git commit -m "Serve at nwd-consulting.com" && git push
```

One line, apex only, no scheme, no trailing slash, trailing newline. Committing this
retargets the Pages site: `https://nwd-consulting.github.io/nwd-site/` will begin
redirecting to the custom domain, so the old URL stops being an independent check.

### 3b. The DNS records

In the Cloudflare DNS tab for `nwd-consulting.com`. **Every record must be DNS-only —
grey cloud, not orange.** Proxying breaks GitHub's certificate issuance, which is exactly
the objection Option A was chosen to avoid; setting the grey cloud is what removes it.

Delete the two WordPress `A` records, then create the apex records:

| Type | Name | Content | Proxy | TTL |
|---|---|---|---|---|
| A | `@` | `185.199.108.153` | **DNS only** | Auto |
| A | `@` | `185.199.109.153` | **DNS only** | Auto |
| A | `@` | `185.199.110.153` | **DNS only** | Auto |
| A | `@` | `185.199.111.153` | **DNS only** | Auto |
| AAAA | `@` | `2606:50c0:8000::153` | **DNS only** | Auto |
| AAAA | `@` | `2606:50c0:8001::153` | **DNS only** | Auto |
| AAAA | `@` | `2606:50c0:8002::153` | **DNS only** | Auto |
| AAAA | `@` | `2606:50c0:8003::153` | **DNS only** | Auto |

And replace the `www` record with:

| Type | Name | Content | Proxy | TTL |
|---|---|---|---|---|
| CNAME | `www` | `nwd-consulting.github.io` | **DNS only** | Auto |

The CNAME target is the **organisation** Pages host with no `/nwd-site` path and no
trailing dot in the Cloudflare UI. All four A and all four AAAA records are required —
they are GitHub's anycast set, not alternatives to choose between.

*These are GitHub's published apex addresses. They change rarely but they do change; if
this document is more than a few months old when you read it, re-check them against
GitHub's "Managing a custom domain for your GitHub Pages site" before pasting.*

### 3c. Enforce HTTPS

Repo → **Settings** → **Pages**. The custom domain should already show
`nwd-consulting.com` from the `CNAME` file, with a DNS check underneath it.

Wait for **"DNS check successful"**, then tick **Enforce HTTPS**.

The tickbox is greyed out until GitHub has issued the Let's Encrypt certificate, which
typically takes a few minutes and can take up to an hour. Do not un-tick and re-tick it;
that reruns provisioning from the start. If it is still greyed out after an hour, the
usual cause is a record left on the orange cloud.

---

## 4. Propagation — what to actually expect

Cloudflare serves the zone authoritatively, so the change is live at Cloudflare's edge
**within seconds**. What takes longer is other people's caches.

| | Time |
|---|---|
| Cloudflare's own edge | seconds |
| Most resolvers (TTL "Auto" = 300s) | ~5 minutes |
| Stubborn resolvers, corporate DNS, some ISPs | up to 24 hours |
| GitHub / Cloudflare certificate issuance | minutes, occasionally an hour |

Records with proxying disabled inherit the zone's default TTL. Nobody needs to lower TTLs
in advance here, because 300s is already short.

Old visitors may reach WordPress for a few minutes. That is normal and not a reason to
start changing things again — the most common way a cutover goes wrong is someone
"fixing" it during propagation.

---

## 5. Verify success

Run these from the machine, not from a browser with a warm cache. Do not declare the
cutover done until all five pass.

```sh
# 1. Apex resolves to the new host, and the WordPress IPs are GONE.
dig +short nwd-consulting.com A
#   Option A: expect Cloudflare proxy IPs (104.x / 172.67.x)
#   Option B: expect exactly 185.199.108-111.153
#   FAIL if 192.0.78.24 or .25 still appears

# 2. www resolves and does not dead-end.
dig +short www.nwd-consulting.com

# 3. HTTPS works and the certificate is for the right name.
curl -sSI https://nwd-consulting.com/ | head -1
echo | openssl s_client -connect nwd-consulting.com:443 -servername nwd-consulting.com 2>/dev/null \
  | openssl x509 -noout -subject -dates

# 4. It is OUR site, not WordPress. This is the check that matters most:
#    a 200 alone proves nothing, because WordPress also returns 200.
curl -sS https://nwd-consulting.com/ | grep -c 'wp-importmap'   # expect 1
curl -sSI https://nwd-consulting.com/ | grep -i 'host-header'   # expect NOTHING
#    'host-header: WordPress.com' means you are still on the old site.

# 5. All 30 pages, on the real domain.
while read -r p; do
  printf '%s %s\n' "$(curl -sS -o /dev/null -m 20 -w '%{http_code}' "https://nwd-consulting.com$p")" "$p"
done < <(grep -o '<loc>[^<]*</loc>' sitemap.xml \
           | sed 's|<loc>https://nwd-consulting.com||; s|</loc>||; s|^$|/|') \
| sort | uniq -c | sort -rn
#    expect: 30 lines of 200, and nothing else

# 6. Mail survived. Run this LAST, and treat a change here as an emergency.
dig +short nwd-consulting.com MX     # expect: 1 smtp.google.com.
dig +short nwd-consulting.com TXT    # expect: the SPF and google-site-verification records
```

Then look at it. Load the homepage, the About page and one bio in a real browser at desktop
and phone widths. Confirm the navigation is a horizontal bar and not an expanded vertical
list — that specific regression shipped once already and no automated check caught it until
someone compared screenshots.

---

## 6. Rollback

Rollback is fast and complete **for as long as the WordPress.com plan is still active**.
That is the reason §1.4 says not to cancel it.

**To roll back, restore the two A records and delete what replaced them:**

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `nwd-consulting.com` | `192.0.78.24` | DNS only |
| A | `nwd-consulting.com` | `192.0.78.25` | DNS only |

Then delete the Option A CNAMEs, or the Option B A/AAAA records, whichever you added. Put
`www` back to whatever it was — it currently resolves to the apex, so a CNAME to
`nwd-consulting.com` reproduces today's behaviour.

Effect is visible in about five minutes at the 300s TTL.

**Option B leaves one extra thing to undo:** delete the `CNAME` file from the repo and push,
or GitHub Pages keeps claiming the domain and the `github.io` URL keeps redirecting to a
name that no longer points at it.

**Take a snapshot first.** Before touching anything, save the current zone so rollback is a
restore rather than a reconstruction:

```sh
for r in A AAAA MX TXT CAA NS; do
  echo "--- $r ---"
  dig +noall +answer nwd-consulting.com "$r"
  dig +noall +answer www.nwd-consulting.com "$r"
done | tee ~/workspace/nwd/site/docs/zone-snapshot-$(date +%F).txt
```

Cloudflare's dashboard also offers **DNS → Records → Export**, which is better; use it if
Jake's member access exposes it.

---

## 7. After it is verified, and only then

1. Tell Sarah it is live, and that the WordPress admin is no longer how the site is edited.
2. Cancel the WordPress.com plan — after a few days, not the same afternoon. Note that
   `build.py` stops working at that moment, because its source disappears; from then on
   this repo is the source and content edits are edits to committed HTML.
3. Re-point `robots.txt` and `sitemap.xml` if the canonical host ever changes. Both already
   name `https://nwd-consulting.com`, so no change is needed for this cutover.
4. Close the NEW-12 checklist items: Pages project created, domain attached, WordPress A
   records confirmed gone, Sarah told.

---

## What Jake can do alone, and what needs Sarah

| Task | Jake alone? |
|---|---|
| Merge PR #6 | yes |
| Create the Cloudflare Pages project (Option A) | yes — dashboard, not the DNS-scoped token |
| Add the `CNAME` file (Option B) | yes |
| Edit DNS records in the zone | **yes** — member access is sufficient |
| Enforce HTTPS on GitHub Pages | yes |
| Cancel the WordPress.com plan | **no** — Sarah's account and Sarah's call |
| Transfer the domain registration | **no** — Sarah's, and blocked until ~2026-09-15 |

The cutover itself needs nobody but Jake. Only the WordPress cancellation and the
ownership transfer need Sarah, and neither is on this critical path.
