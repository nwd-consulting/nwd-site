#!/usr/bin/env python3
"""Fetch every page and every locally referenced asset from a running server.

    python3 -m http.server 8000 --bind 127.0.0.1 --directory public &
    scripts/check_served.py http://127.0.0.1:8000

lint.py reasons about the filesystem. This checks the other half: that a real
HTTP server agrees the files are reachable. Python's http.server is unusually
tolerant of odd filenames, so a pass here is necessary but not sufficient, which
is why lint.py forbids those characters outright.
"""

from __future__ import annotations

import html
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "public"
SKIP = {"s0.wp.com", "s1.wp.com", "s2.wp.com"}
REF = re.compile(r"""(?:src|href)=(["'])([^"']+)\1""")


def status(url: str) -> int:
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except OSError:
        return 0


def pages() -> list[Path]:
    return [p for p in ROOT.rglob("*.html") if not SKIP & set(p.relative_to(ROOT).parts)]


def assets(pages: list[Path]) -> set[str]:
    refs = set()
    for page in pages:
        for m in REF.finditer(page.read_text(encoding="utf-8", errors="replace")):
            raw = html.unescape(m.group(2))
            if raw.startswith(("http", "//", "#", "mailto:", "data:", "javascript:", "context.")) or "{" in raw:
                continue
            path = raw.split("#")[0]
            if not path or path.endswith("/"):
                continue
            target = (page.parent / urllib.parse.unquote(path)).resolve()
            refs.add(target.relative_to(ROOT).as_posix())
    return refs


def main() -> int:
    base = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000").rstrip("/")
    found = pages()
    page_urls = [f"{base}/{p.relative_to(ROOT).as_posix()}".removesuffix("index.html") for p in found]
    asset_urls = [f"{base}/{urllib.parse.quote(a)}" for a in sorted(assets(found))]

    failed = 0
    for kind, urls in (("pages", page_urls), ("assets", asset_urls)):
        bad = [(code, u) for u in urls if (code := status(u)) != 200]
        for code, u in bad[:25]:
            print(f"::error::{code} {u}")
        print(f"{len(urls)} {kind} checked, {len(bad)} failed")
        failed += len(bad)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
