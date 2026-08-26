# Confidential Token Wrappers Registry — Webflow embed

Two files ship to the site:

- `webflow/registry.js` — the whole widget (styles, markup, data, live API fetch)
- `confidentialtoken-logos/*.svg` — the token logos, fetched by URL

## 1. Host the files

Push this repo to GitHub, then serve it over jsDelivr — no build, no bundler:

    https://cdn.jsdelivr.net/gh/<org>/<repo>@<tag>/webflow/registry.js

Tag a release (e.g. `v1`) so the site pins a version. Bump the tag when you want
Webflow to pick up changes; `@main` would auto-update but gives you no rollback.

GitHub Pages works too, if you'd rather not use a CDN.

## 2. Paste the embed

In the Webflow Designer, drop an **HTML Embed** element into your section and
paste `webflow/embed.html`, replacing the two `<org>/<repo>@<tag>` URLs.

The snippet is 2.4KB — Webflow's Embed limit is 10,000 characters.

Custom code only runs on **Publish**. In the Designer the embed shows a grey
placeholder, so publish to a staging domain to see it.

## What the embed contains

    <div id="ct-registry"> ...static fallback... </div>
    <script src="..." data-logo-base="..." defer></script>

The `<div>` holds a plain list of the nine addresses. It is real HTML, so search
engines index it and it still renders if the script fails or JS is off.
`registry.js` replaces it entirely once it runs.

`data-logo-base` is optional — the script derives the logo folder from its own
URL. Set it only if you move the logos elsewhere.

## Container width

The table needs **860px** of content width for single-line headers. Below that it
still fits and never breaks the page — the surface scrolls horizontally on its own
— but at exactly 820px the "Total Shielded" / "Total Unshielded" headers wrap to
two lines. Give the wrapper div `max-width: 860px` or more (the section panel has
room for ~1000px) and they stay on one line.

## Design notes

- **Fonts are inherited** (`font-family: inherit`), so the table renders in
  Zama's typeface and reads as part of the site rather than as an embed. To force
  Inter instead, set `font-family` on `#ct-registry` in the CSS block.
- **Built for a solid-colour section.** Surfaces are opaque white with a neutral
  shadow, so it sits correctly on a flat background. It is not the translucent
  treatment from the standalone page, which needed a gradient behind it.
- **Colors are light-mode literals.** Dropping this into a dark section will
  need the `--ctr-*` variables at the top of the CSS block re-pointed.
- **Nothing leaks.** Every CSS rule is prefixed with `#ct-registry`, and there is
  no reset that escapes the widget. Verified against a host page with hostile
  global `table`/`svg`/`button`/`input` styles.
- The section heading, CTA buttons and footer links are **not** in the widget —
  build those natively in Webflow.

## Requirements

- `tvs-api.up.railway.app` must be reachable from the browser. It already sends
  `access-control-allow-origin: *`, so no proxy is needed.
- If zama.org sets a Content-Security-Policy, add the API host to `connect-src`,
  the CDN to `script-src`, and the logo host to `img-src`.

## Updating the token list

Edit the `TOKENS` array in `registry.js`, add the logo to
`confidentialtoken-logos/`, and tag a new release. Categories are
`stablecoin` / `yield` / `crypto` / `rwa`; `yield` renders the DeFi pill.

---

# Rebuilding the standalone / artifact file

`../build-standalone.py` regenerates `confidentialtoken-standalone.html` from
`index.html` — one self-contained file that works offline, from `file://`, and
inside a strict CSP.

    python3 build-standalone.py            # refresh the API snapshot, then build
    python3 build-standalone.py --offline  # reuse the cached vendor files + snapshot

It inlines the Inter subset, the Tailwind runtime, Alpine, all eight logos, and a
captured API response on `window.__TVS_SNAPSHOT__`. `index.html` checks that global
before falling back to a live `fetch`, so the deployed page is unaffected.

Vendor downloads cache in `.build-cache/` (gitignored); the first run needs network,
later runs don't. The script fails loudly rather than emitting a broken file if the
API returns nothing, a logo is missing, an expected tag isn't found, or any external
reference survives.

Note the snapshot freezes at build time, so the standalone file's figures drift.
Re-run before resharing it.
