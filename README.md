# Confidential Token Wrappers Registry

The list of official ERC-7984 confidential token wrappers, embedded in a section
on the Zama website. Each entry shows the token name, symbol and its wrapper
contract address, linking through to the block explorer.

## What's in here

| | |
|---|---|
| `webflow/registry.js` | the entire widget — styles, markup and data in one file |
| `confidentialtoken-logos/` | the token logos |
| `webflow/embed.html` | the snippet that gets pasted into Webflow |

## How it's used

The website loads the widget from GitHub Pages with two lines:

```html
<div id="ct-registry"></div>
<script src="https://j-zama.github.io/confidential-token-wrappers-registry/webflow/registry.js" defer></script>
```

No build step and no dependencies — plain JavaScript and CSS, and no network
requests apart from the logos. Every style is scoped to `#ct-registry`, so the
widget can't affect the rest of the page and the page can't affect the widget.

Search, the category filters and the network selector all run client-side.

## Adding or changing a token

1. Edit the `TOKENS` array near the top of `webflow/registry.js`
2. Add the logo to `confidentialtoken-logos/`
3. Commit — GitHub Pages redeploys in about a minute

The contract addresses also appear in `webflow/embed.html`, which is what search
engines read and what shows if JavaScript is off. Update them there too, then
re-paste that snippet into Webflow.
