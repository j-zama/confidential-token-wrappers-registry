#!/usr/bin/env python3
"""
Build confidentialtoken-standalone.html — a single self-contained file.

Takes index.html and inlines everything it depends on:
  - Google Fonts link  -> @font-face with the Inter latin subset as a data URI
  - Tailwind CDN       -> the Play-CDN runtime, inline (so markup needs no changes)
  - Alpine CDN         -> inline, moved to end of <body> to preserve `defer` order
  - logo <img> paths   -> data URIs
  - live API fetch     -> a captured snapshot on window.__TVS_SNAPSHOT__

The result works offline, from file://, and inside a strict CSP (which is what
the published Artifact needs — it blocks every external host).

Usage:
    python3 build-standalone.py              # refresh snapshot, then build
    python3 build-standalone.py --offline    # reuse cached vendor files + snapshot

Vendor files and the snapshot are cached in .build-cache/ (gitignored), so the
second run needs no network.
"""

import base64
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / '.build-cache'
SRC = ROOT / 'index.html'
OUT = ROOT / 'confidentialtoken-standalone.html'

TVS_API = 'https://tvs-api.up.railway.app/v1/tvs/tokens'
ALPINE = 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js'
TAILWIND = 'https://cdn.tailwindcss.com'
INTER_CSS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
# Google serves woff2 only to browser-like clients
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')

OFFLINE = '--offline' in sys.argv


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        data = r.read()
    return data if binary else data.decode('utf-8')


def cached(name, url, binary=False):
    """Fetch once, then reuse. --offline requires the cache to exist."""
    path = CACHE / name
    if path.exists() and (OFFLINE or True):
        if OFFLINE:
            print(f'  [cache] {name}')
            return path.read_bytes() if binary else path.read_text()
    if OFFLINE:
        sys.exit(f'--offline but {path} is missing; run once online first')
    print(f'  [fetch] {name}')
    data = fetch(url, binary)
    CACHE.mkdir(exist_ok=True)
    path.write_bytes(data if binary else data.encode())
    return data


def inter_latin_woff2():
    """Pull the latin subset out of the Google Fonts CSS (the block covering U+0000-00FF)."""
    css = cached('inter.css', INTER_CSS)
    for block in re.findall(r'@font-face\s*\{(.*?)\}', css, re.S):
        rng = re.search(r'unicode-range:\s*([^;]+);', block)
        url = re.search(r'url\((https[^)]+)\)', block)
        if rng and url and 'U+0000-00FF' in rng.group(1):
            return cached('inter-latin.woff2', url.group(1), binary=True)
    sys.exit('could not find the Inter latin subset in the Google Fonts CSS')


def snapshot():
    path = CACHE / 'snapshot.json'
    if OFFLINE:
        if not path.exists():
            sys.exit(f'--offline but {path} is missing; run once online first')
        print('  [cache] snapshot.json')
        raw = path.read_text()
    else:
        print('  [fetch] snapshot.json')
        raw = fetch(TVS_API)
        CACHE.mkdir(exist_ok=True)
        path.write_text(raw)

    data = json.loads(raw)
    rows = data.get('data') or []
    if not rows:
        sys.exit('TVS API returned no tokens — refusing to bake an empty snapshot')
    for r in rows:
        if not r.get('symbol') or not r.get('cumulative'):
            sys.exit(f'malformed token row: {r.get("symbol", "?")}')
    newest = max(r['cumulative'].get('updated_at', '') for r in rows)
    print(f'          {len(rows)} tokens, freshest {newest}')
    # compact so it does not bloat the file, and cannot close the script tag
    compact = json.dumps(data, separators=(',', ':'))
    if '</script' in compact.lower():
        sys.exit('snapshot contains "</script" — would break out of the tag')
    return compact


def main():
    if not SRC.exists():
        sys.exit(f'missing {SRC}')
    html = SRC.read_text()
    print(f'source: index.html ({len(html):,} chars)\n')

    print('vendoring:')
    font_b64 = base64.b64encode(inter_latin_woff2()).decode()
    alpine_js = cached('alpine.js', ALPINE)
    tailwind_js = cached('tailwind.js', TAILWIND)
    snap = snapshot()
    print()

    # 1. font
    face = ("<style>\n@font-face{font-family:'Inter';font-style:normal;"
            "font-weight:100 900;font-display:swap;"
            f"src:url(data:font/woff2;base64,{font_b64}) format('woff2');}}\n</style>")
    for link in ('<link rel="preconnect" href="https://fonts.googleapis.com">\n',
                 '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'):
        html = html.replace(link, '')
    html, n = re.subn(r'<link href="https://fonts\.googleapis\.com[^>]*>', face, html)
    assert n == 1, f'expected 1 font link, replaced {n}'

    # 2. tailwind (inline, stays in <head> so styles resolve before first paint)
    before = html
    html = html.replace('<script src="https://cdn.tailwindcss.com"></script>',
                        '<script>/* tailwind play cdn, inlined */\n' + tailwind_js + '\n</script>')
    assert html != before, 'tailwind script tag not found'

    # 3. alpine (inline at end of body — `defer` meant it ran after parsing)
    before = html
    html = html.replace(
        '<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>\n', '')
    assert html != before, 'alpine script tag not found'
    html = html.replace('</body>', '<script>/* alpine 3, inlined */\n' + alpine_js + '\n</script>\n</body>')

    # 4. logos
    logos = sorted(set(re.findall(r"confidentialtoken-logos/[^']+", html)))
    assert logos, 'no logo paths found in index.html'
    for rel in logos:
        f = ROOT / rel
        if not f.exists():
            sys.exit(f'missing logo: {rel}')
        html = html.replace(rel, 'data:image/svg+xml;base64,' + base64.b64encode(f.read_bytes()).decode())
    print(f'inlined {len(logos)} logos')

    # 5. snapshot — index.html checks this global before falling back to fetch()
    before = html
    html = html.replace('<div class="mesh" aria-hidden="true">',
                        f'<script>window.__TVS_SNAPSHOT__ = {snap};</script>\n\n'
                        '<div class="mesh" aria-hidden="true">', 1)
    assert html != before, 'mesh div not found — cannot place the snapshot'

    leftover = re.findall(r'https?://(?:cdn\.|fonts\.)[^\s\'"]+', html)
    if leftover:
        sys.exit(f'external references remain: {leftover[:3]}')

    OUT.write_text(html)
    print(f'\nwrote {OUT.name}  ({OUT.stat().st_size / 1024:.0f}KB)')
    print('external references: none')
    print('\nPublish with the Artifact tool using this file path to update the same URL.')


if __name__ == '__main__':
    main()
