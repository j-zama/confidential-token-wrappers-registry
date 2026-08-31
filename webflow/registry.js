/*!
 * Confidential Token Wrappers Registry — address list
 *
 * Names, symbols and contract addresses only. No API, no network requests
 * beyond the logos. Search, category filters and the network selector all
 * work offline.
 *
 * The version with live TVL / holders / shielded figures is parked in
 * registry-table.js — swap the Webflow <script src> to bring it back.
 *
 * Mount:  <div id="ct-registry"></div>
 *         <script src=".../webflow/registry.js" defer></script>
 */
(function () {
  'use strict';

  var MOUNT_ID = 'ct-registry';

  /* Resolve the logo folder from this script's own URL so the widget works
     from any host (GitHub Pages, jsDelivr, self-hosted) with no config.
     Override with <script data-logo-base="https://..."> if you move them. */
  var self = document.currentScript;
  var LOGO_BASE = (function () {
    if (self && self.dataset.logoBase) return self.dataset.logoBase.replace(/\/?$/, '/');
    var src = (self && self.src) || '';
    return src.replace(/webflow\/registry\.js.*$/, '') + 'confidentialtoken-logos/';
  })();

  var TOKENS = [
    { name: 'Confidential ZAMA',       symbol: 'cZAMA',       category: 'crypto',     address: '0x80CB147Fd86dC6dEe3Eee7e4Cee33d1397d98071', logo: 'cZAMA.svg' },
    { name: 'Confidential USDT',       symbol: 'cUSDT',       category: 'stablecoin', address: '0xAe0207C757Aa2B4019Ad96edD0092ddc63EF0c50', logo: 'cUSDT.svg' },
    { name: 'Confidential USDC',       symbol: 'cUSDC',       category: 'stablecoin', address: '0xe978F22157048E5DB8E5d07971376e86671672B2', logo: 'cUSDC.svg' },
    { name: 'Confidential WETH',       symbol: 'cWETH',       category: 'crypto',     address: '0xda9396b82634Ea99243cE51258B6A5Ae512D4893', logo: 'cWETH.svg' },
    { name: 'Confidential BRON',       symbol: 'cBRON',       category: 'crypto',     address: '0x85dE671c3bec1aDeD752c3Cea943521181C826bc', logo: 'cBRON.svg' },
    { name: 'Confidential tGBP',       symbol: 'ctGBP',       category: 'stablecoin', address: '0xa873750ccBafD5ec7Dd13bfD5237d7129832eDD9', logo: 'cTGBP.svg' },
    { name: 'Confidential XAUt',       symbol: 'cXAUt',       category: 'rwa',        address: '0x73cc9aF9d6BEFdb3c3fAf8a5E8c05Cb95FdaEEf1', logo: 'cXAUt.svg' },
    { name: 'Confidential bbqTGBP',    symbol: 'cbbqTGBP',    category: 'yield',      address: '0xBA4cFF6ED6F7Cb2A58776dECa4E984b498446762', logo: 'cTGBP.svg' },
    { name: 'Confidential steakcUSDC', symbol: 'csteakcUSDC', category: 'yield',      address: '0x66Bf74E96900D1a19c7070D939D124f2F565C458', logo: 'cSTEAKCUSDC.svg' }
  ];

  var NETWORKS = [
    { id: 'ethereum', name: 'Ethereum',         type: 'mainnet', color: '#627EEA', explorer: 'https://eth.blockscout.com',        live: true  },
    { id: 'polygon',  name: 'Polygon',          type: 'mainnet', color: '#8247E5', explorer: 'https://polygon.blockscout.com',    live: false },
    { id: 'sepolia',  name: 'Ethereum Sepolia', type: 'testnet', color: '#627EEA', explorer: 'https://eth-sepolia.blockscout.com', live: false },
    { id: 'amoy',     name: 'Polygon Amoy',     type: 'testnet', color: '#8247E5', explorer: 'https://amoy.polygonscan.com',      live: false }
  ];

  /* Sepolia testnet. The (Mock) entries wrap freely-mintable test tokens;
     ctGBP wraps a restricted-mint token. */
  var SEPOLIA_TOKENS = [
    { name: 'Confidential USDC (Mock)', symbol: 'cUSDCMock',   category: 'stablecoin',  address: '0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639', underlying: '0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF', mint: 'public',     logo: 'cUSDC.svg' },
    { name: 'Confidential USDT (Mock)', symbol: 'cUSDTMock',   category: 'stablecoin',  address: '0x4E7B06D78965594eB5EF5414c357ca21E1554491', underlying: '0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0', mint: 'public',     logo: 'cUSDT.svg' },
    { name: 'Confidential WETH (Mock)', symbol: 'cWETHMock',   category: 'crypto',      address: '0x46208622DA27d91db4f0393733C8BA082ed83158', underlying: '0xff54739b16576FA5402F211D0b938469Ab9A5f3F', mint: 'public',     logo: 'cWETH.svg' },
    { name: 'Confidential BRON (Mock)', symbol: 'cBRONMock',   category: 'crypto',      address: '0xaa5612FA27c927a0c7961f5AEFEE5ba3A0F9C891', underlying: '0xFf021fB13cA64e5354c62c954b949a88cfDEb25E', mint: 'public',     logo: 'cBRON.svg' },
    { name: 'Confidential ZAMA (Mock)', symbol: 'cZAMAMock',   category: 'crypto',      address: '0xf2D628d2598aF4eAF94CB76a437Ff86CA78FfbFB', underlying: '0x75355a85c6FB9df5f0C80FF54e8747EEe9a0BF57', mint: 'public',     logo: 'cZAMA.svg' },
    { name: 'Confidential tGBP (Mock)', symbol: 'ctGBPMock',   category: 'stablecoin',  address: '0xfCE5c7069c5525eF6c8C2b2E35A745bA20a2F7CC', underlying: '0x93c931278A2aad1916783F952f94276eA5111442', mint: 'public',     logo: 'cTGBP.svg' },
    { name: 'Confidential XAUt (Mock)', symbol: 'cXAUtMock',   category: 'rwa',         address: '0xe4FcF848739845BC81Dee1d5352cf3844F0a60C7', underlying: '0x24377AE4AA0C45ecEe71225007f17c5D423dd940', mint: 'public',     logo: 'cXAUt.svg' }
  ];

  /* Polygon Amoy testnet. Addresses from the public protocol registry. */
  var AMOY_TOKENS = [
    { name: 'Confidential USDC',        symbol: 'cUSDC',       category: 'stablecoin',  address: '0x7a1728f2A07cE4D62167dE1348af168509011b7b', underlying: '0x8516e725223e3F829537D6A877E1aAE954811B69', mint: 'public',     logo: 'cUSDC.svg' }
  ];

  /* Polygon mainnet. */
  var POLYGON_TOKENS = [
    { name: 'Confidential USDC',   symbol: 'cUSDC',  category: 'stablecoin',  address: '0xbC8d2F447d16A3a28B554C684659177245CEd8E3', logo: 'cUSDC.svg' }
  ];

  var DEPLOYED = { ethereum: TOKENS, polygon: POLYGON_TOKENS, sepolia: SEPOLIA_TOKENS, amoy: AMOY_TOKENS };

  var CATEGORIES = [
    { id: 'all',        label: 'All' },
    { id: 'stablecoin', label: 'Stablecoins' },
    { id: 'yield',      label: 'Yield-bearing' },
    { id: 'crypto',     label: 'Crypto' },
    { id: 'rwa',        label: 'Real-world assets' }
  ];

  var state = { network: 'ethereum', query: '', category: 'all', menuOpen: false };

  /* ---------- styles ---------- */
  var M = '#' + MOUNT_ID + ' ';
  var CSS = [
    '#' + MOUNT_ID + '{',
    '  --ctr-ink:#171717; --ctr-mute:#737373; --ctr-faint:#a3a3a3; --ctr-line:#e5e5e5;',
    '  --ctr-surface:#ffffff; --ctr-control:#ffffff;',
    '  font-family:inherit; font-size:16px; color:var(--ctr-ink); text-align:left;',
    '  line-height:1.4; -webkit-font-smoothing:antialiased;',
    '  display:block; width:100%; max-width:100%; min-width:0;',
    '}',
    M + '*,' + M + '*::before,' + M + '*::after{box-sizing:border-box;}',
    M + 'button{font:inherit;color:inherit;background:none;border:0;margin:0;padding:0;cursor:pointer;text-align:inherit;}',
    M + 'input{font:inherit;margin:0;}',
    M + 'a{text-decoration:none;color:inherit;}',
    M + 'svg{display:block;flex:none;width:auto;height:auto;max-width:none;}',
    M + 'ul,' + M + 'li,' + M + 'p{list-style:none;margin:0;padding:0;}',
    M + 'img{max-width:none;}',
    M + ':focus-visible{outline:2px solid #627EEA;outline-offset:2px;border-radius:10px;}',
    M + '.ctr-num{font-variant-numeric:tabular-nums;letter-spacing:-.01em;}',

    /* controls */
    M + '.ctr-controls{display:flex;flex-direction:column;align-items:stretch;gap:12px;}',
    '@media(min-width:640px){' + M + '.ctr-controls{flex-direction:row;align-items:center;}}',
    M + '.ctr-search{position:relative;flex:1 1 auto;min-width:0;}',
    M + '.ctr-search-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--ctr-faint);pointer-events:none;}',
    M + '.ctr-input{width:100%;border:1px solid #e5e5e5;background:var(--ctr-control);',
    '  border-radius:10px;padding:9px 36px 9px 40px;font-size:14px;color:var(--ctr-ink);',
    '  box-shadow:0 1px 2px rgba(0,0,0,.04);transition:border-color .15s;}',
    M + '.ctr-input::placeholder{color:var(--ctr-faint);opacity:1;}',
    M + '.ctr-input:hover{border-color:#a3a3a3;}',
    M + '.ctr-input:focus{outline:none;border-color:#737373;}',
    M + '.ctr-clear{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--ctr-faint);display:flex;}',
    M + '.ctr-clear:hover{color:var(--ctr-ink);}',
    M + '.ctr-net{position:relative;flex:none;}',
    M + '.ctr-net-btn{display:flex;align-items:center;gap:10px;border:1px solid #e5e5e5;',
    '  background:var(--ctr-control);border-radius:10px;padding:8px 16px;font-size:14px;font-weight:500;',
    '  color:#262626;box-shadow:0 1px 2px rgba(0,0,0,.04);transition:border-color .15s;}',
    M + '.ctr-net-btn:hover{border-color:#a3a3a3;}',
    M + '.ctr-dot{width:8px;height:8px;border-radius:10px;flex:none;}',
    M + '.ctr-testnet{background:#fef3c7;color:#b45309;border-radius:10px;padding:2px 6px;',
    '  font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.04em;}',
    M + '.ctr-caret{color:#a3a3a3;transition:transform .15s;}',
    M + '.ctr-net[data-open="true"] .ctr-caret{transform:rotate(180deg);}',
    M + '.ctr-menu{position:absolute;left:0;top:calc(100% + 8px);z-index:30;width:224px;background:#fff;',
    '  border:1px solid var(--ctr-line);border-radius:10px;padding:6px;',
    '  box-shadow:0 10px 30px rgba(23,23,23,.08);}',
    '@media(min-width:640px){' + M + '.ctr-menu{left:auto;right:0;}}',
    M + '.ctr-menu[hidden]{display:none;}',
    M + '.ctr-group-label{padding:10px 12px 4px;font-size:10px;font-weight:500;',
    '  text-transform:uppercase;letter-spacing:.12em;color:var(--ctr-faint);}',
    M + '.ctr-opt{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:10px;',
    '  font-size:14px;color:var(--ctr-mute);transition:background .12s;}',
    M + '.ctr-opt:hover{background:#f5f5f5;}',
    M + '.ctr-opt[aria-selected="true"]{color:var(--ctr-ink);font-weight:500;}',
    M + '.ctr-opt-check{margin-left:auto;}',
    M + '.ctr-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:20px;}',
    M + '.ctr-chip{display:flex;align-items:center;gap:6px;border:1px solid #e5e5e5;',
    '  background:var(--ctr-control);border-radius:10px;padding:6px 12px;font-size:13px;',
    '  color:var(--ctr-mute);transition:border-color .15s,color .15s,background .15s;}',
    M + '.ctr-chip:hover{border-color:#a3a3a3;color:var(--ctr-ink);}',
    M + '.ctr-chip[aria-pressed="true"]{background:#171717;border-color:#171717;color:#fff;}',
    M + '.ctr-chip-n{font-size:11px;color:var(--ctr-faint);font-variant-numeric:tabular-nums;}',
    M + '.ctr-chip[aria-pressed="true"] .ctr-chip-n{color:rgba(255,255,255,.6);}',

    /* list */
    M + '.ctr-card{margin-top:20px;border-radius:10px;background:var(--ctr-surface);overflow:hidden;',
    '  box-shadow:0 1px 2px rgba(23,23,23,.04),0 10px 30px -12px rgba(23,23,23,.12);}',
    M + '.ctr-row{display:flex;align-items:center;gap:16px;padding:16px 20px;transition:background .12s;}',
    M + '.ctr-row + ' + M.trim() + ' .ctr-row{border-top:1px solid rgba(229,229,229,.7);}',
    M + '.ctr-row:hover{background:#fafafa;}',
    M + '.ctr-logo{width:38px;height:32px;display:flex;align-items:center;flex:none;}',
    M + '.ctr-logo img{height:32px;width:auto;display:block;}',
    M + '.ctr-id{display:flex;flex-direction:column;line-height:1.25;flex:none;width:210px;min-width:0;}',
    M + '.ctr-full{font-size:15px;color:var(--ctr-ink);}',
    M + '.ctr-sym{font-size:12px;color:var(--ctr-faint);}',
    M + '.ctr-addr{flex:1 1 auto;min-width:0;font-size:14px;color:#404040;',
    '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    M + '.ctr-ext{color:var(--ctr-faint);flex:none;transition:color .15s;}',
    M + '.ctr-row:hover .ctr-ext{color:var(--ctr-ink);}',
    M + '.ctr-empty{padding:56px 24px;text-align:center;font-size:14px;color:var(--ctr-mute);}',
    /* narrow: address drops under the name */
    '@media(max-width:660px){',
    M + '.ctr-row{align-items:flex-start;gap:12px;padding:14px 16px;}',
    M + '.ctr-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 auto;}',
    M + '.ctr-id{width:auto;}',
    M + '.ctr-addr{font-size:12px;}',
    '}',
    '@media(min-width:661px){' + M + '.ctr-main{display:contents;}}'
  ].join('\n');

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function net() { return NETWORKS.filter(function (n) { return n.id === state.network; })[0]; }
  function tokens() { return DEPLOYED[state.network] || []; }
  function countFor(id) {
    var list = tokens();
    return id === 'all' ? list.length : list.filter(function (t) { return t.category === id; }).length;
  }
  function shownCategories() {
    return CATEGORIES.filter(function (c) { return countFor(c.id) > 0; });
  }
  function visible() {
    var q = state.query.trim().toLowerCase();
    return tokens().filter(function (t) {
      if (state.category !== 'all' && t.category !== state.category) return false;
      if (!q) return true;
      return t.name.toLowerCase().indexOf(q) > -1 ||
             t.symbol.toLowerCase().indexOf(q) > -1 ||
             t.address.toLowerCase().indexOf(q) > -1;
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  var I = {
    search: '<svg class="ctr-search-ico" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2L17 17" stroke-linecap="round"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l8 8M14 6l-8 8" stroke-linecap="round"/></svg>',
    caret: '<svg class="ctr-caret" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg class="ctr-opt-check" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 10.5l3.5 3.5L15 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ext: '<svg class="ctr-ext" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4h4v4M16 4l-7 7M14 12v3.5A1.5 1.5 0 0 1 12.5 17h-8A1.5 1.5 0 0 1 3 15.5v-8A1.5 1.5 0 0 1 4.5 6H8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- render ---------- */
  function render(root) {
    var n = net(), cats = shownCategories(), rows = visible();

    var html = '<div class="ctr-controls">' +
      '<div class="ctr-search">' + I.search +
        '<input class="ctr-input" type="text" autocomplete="off" spellcheck="false" ' +
        'placeholder="Search name, symbol or address" aria-label="Search confidential tokens" ' +
        'value="' + esc(state.query) + '" data-ctr="search">' +
        (state.query ? '<button class="ctr-clear" type="button" aria-label="Clear search" data-ctr="clear">' + I.x + '</button>' : '') +
      '</div>' +
      '<div class="ctr-net" data-open="' + state.menuOpen + '">' +
        '<button class="ctr-net-btn" type="button" aria-haspopup="listbox" aria-expanded="' + state.menuOpen + '" data-ctr="menu">' +
          '<span class="ctr-dot" style="background:' + n.color + '"></span>' +
          '<span>' + esc(n.name) + '</span>' +
          (n.type === 'testnet' ? '<span class="ctr-testnet">Testnet</span>' : '') + I.caret +
        '</button>' +
        '<ul class="ctr-menu" role="listbox"' + (state.menuOpen ? '' : ' hidden') + '>' +
          ['mainnet', 'testnet'].map(function (type) {
            var items = NETWORKS.filter(function (x) { return x.type === type; });
            if (!items.length) return '';
            return '<li><p class="ctr-group-label">' + (type === 'mainnet' ? 'Mainnet' : 'Testnet') + '</p><ul>' +
              items.map(function (x) {
                return '<li><button class="ctr-opt" type="button" role="option" aria-selected="' +
                  (x.id === state.network) + '" data-ctr="net" data-id="' + x.id + '">' +
                  '<span class="ctr-dot" style="background:' + x.color + '"></span><span>' + esc(x.name) + '</span>' +
                  (x.id === state.network ? I.check : '') + '</button></li>';
              }).join('') + '</ul></li>';
          }).join('') +
        '</ul>' +
      '</div>' +
    '</div>';

    if (cats.length > 1) {
      html += '<div class="ctr-chips">' + cats.map(function (c) {
        return '<button class="ctr-chip" type="button" aria-pressed="' + (state.category === c.id) +
          '" data-ctr="cat" data-id="' + c.id + '"><span>' + esc(c.label) +
          '</span><span class="ctr-chip-n">' + countFor(c.id) + '</span></button>';
      }).join('') + '</div>';
    }

    html += '<div class="ctr-card">';
    if (!rows.length) {
      html += '<p class="ctr-empty">' + (tokens().length === 0
        ? 'No wrappers deployed on ' + esc(n.name) + ' yet.'
        : 'No token matches “' + esc(state.query) + '” on ' + esc(n.name) + '.') + '</p>';
    } else {
      html += rows.map(function (t) {
        return '<a class="ctr-row" href="' + n.explorer + '/address/' + t.address + '" target="_blank" rel="noopener">' +
          '<span class="ctr-logo"><img src="' + LOGO_BASE + t.logo + '" alt=""></span>' +
          '<span class="ctr-main">' +
            '<span class="ctr-id">' +
              '<span class="ctr-full">' + esc(t.name) + '</span>' +
              '<span class="ctr-sym">' + esc(t.symbol) + '</span>' +
            '</span>' +
            '<span class="ctr-addr ctr-num">' + t.address + '</span>' +
          '</span>' + I.ext +
        '</a>';
      }).join('');
    }
    html += '</div>';
    root.innerHTML = html;
  }

  /* ---------- events ---------- */
  function wire(root) {
    root.addEventListener('click', function (ev) {
      var el = ev.target.closest('[data-ctr]');
      if (!el || !root.contains(el)) return;
      ev.ctrHandled = true;
      var k = el.dataset.ctr;
      if (k === 'menu') { state.menuOpen = !state.menuOpen; render(root); return; }
      if (k === 'net') {
        state.network = el.dataset.id; state.menuOpen = false;
        if (countFor(state.category) === 0) state.category = 'all';
        render(root); return;
      }
      if (k === 'cat') { state.category = el.dataset.id; render(root); return; }
      if (k === 'clear') { state.query = ''; render(root); focusSearch(root); return; }
    });
    root.addEventListener('input', function (ev) {
      if (ev.target.dataset.ctr !== 'search') return;
      state.query = ev.target.value; render(root); focusSearch(root);
    });
    document.addEventListener('click', function (ev) {
      if (!state.menuOpen || ev.ctrHandled) return;
      if (ev.target.closest && ev.target.closest('#' + MOUNT_ID)) return;
      state.menuOpen = false; render(root);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && state.menuOpen) { state.menuOpen = false; render(root); }
    });
  }
  function focusSearch(root) {
    var i = root.querySelector('[data-ctr="search"]');
    if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  }

  function init() {
    var root = document.getElementById(MOUNT_ID);
    if (!root) { if (window.console) console.warn('[ct-registry] no #' + MOUNT_ID + ' element found'); return; }
    if (root.dataset.ctrReady) return;
    root.dataset.ctrReady = '1';
    var style = document.createElement('style');
    style.id = 'ctr-style';
    style.textContent = CSS;
    document.head.appendChild(style);
    wire(root);
    render(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
