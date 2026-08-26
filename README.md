# Confidential Token Wrappers Registry

The live table of official ERC-7984 confidential token wrappers, embedded in a
section on the Zama website.

For each wrapper it shows the contract address plus its shielded TVL, holder
count, and total shielded / unshielded amounts.

## What's in here

| | |
|---|---|
| `webflow/registry.js` | the entire widget — styles, markup and data fetching in one file |
| `confidentialtoken-logos/` | the token logos |
| `webflow/embed.html` | the snippet that gets pasted into Webflow |
| `index.html` | a standalone version of the same table |

## How it's used

The website loads the widget from GitHub Pages with two lines:

```html
<div id="ct-registry"></div>
<script src="https://j-zama.github.io/confidential-token-wrappers-registry/webflow/registry.js" defer></script>
```

No build step and no dependencies — plain JavaScript and CSS. Every style is
scoped to `#ct-registry`, so the widget can't affect the rest of the page and
the page can't affect the widget.

## Where the numbers come from

The figures are fetched from the Zama TVS API on every page load:

```
https://tvs-api.up.railway.app/v1/tvs/tokens
```

Nothing is stored in this repo. If the API is unreachable, the table still
shows names, logos and contract addresses, with the numbers left blank.

## Adding or changing a token

1. Edit the `TOKENS` array near the top of `webflow/registry.js`
2. Add the logo to `confidentialtoken-logos/`
3. Commit — GitHub Pages redeploys in about a minute

The contract addresses also appear in `webflow/embed.html`, which is what
search engines read and what shows if JavaScript is off. Update them there too,
then re-paste that snippet into Webflow.
