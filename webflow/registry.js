/*!
 * Confidential Token Wrappers Registry — embeddable widget
 * Mount:  <div id="ct-registry"></div>
 *         <script src=".../webflow/registry.js" defer></script>
 *
 * Self-contained on purpose: no Tailwind, no Alpine, no global CSS.
 * Every rule is scoped under #ct-registry so it cannot affect the host page,
 * and the host page's resets cannot affect it.
 */
(function () {
  'use strict';

  var MOUNT_ID = 'ct-registry';
  var API = 'https://tvs-api.up.railway.app/v1/tvs/tokens';

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

  /* Only Ethereum has deployments today; the others render an empty state. */
  var DEPLOYED = { ethereum: TOKENS, polygon: [], sepolia: [], amoy: [] };

  var CATEGORIES = [
    { id: 'all',        label: 'All' },
    { id: 'stablecoin', label: 'Stablecoins' },
    { id: 'yield',      label: 'Yield-bearing' },
    { id: 'crypto',     label: 'Crypto' },
    { id: 'rwa',        label: 'Real-world assets' }
  ];

  var COLUMNS = [
    { key: 'name',       label: 'Name',             align: 'left'  },
    { key: 'tvs',        label: 'Shielded TVL',     align: 'right' },
    { key: 'holders',    label: 'Holders',          align: 'right' },
    { key: 'shielded',   label: 'Total Shielded',   align: 'right' },
    { key: 'unshielded', label: 'Total Unshielded', align: 'right' },
    { key: 'contract',   label: 'Contract',         align: 'right' }
  ];

  var state = {
    network: 'ethereum',
    query: '',
    category: 'all',
    sortKey: 'name',
    sortDir: 'asc',
    menuOpen: false,
    live: {},
    loadState: 'loading',
    updatedAt: ''
  };

  /* ---------- styles: scoped, no resets that could escape ---------- */
  /* Every rule is prefixed with the mount id. Two reasons:
     1. host-page element selectors (Webflow's `table{}`, `svg{}`, `td{}`) lose to it;
     2. component rules outrank the element resets below, which are also id-scoped —
        without this, `#ct-registry button{border:0}` would beat `.ctr-chip{border:1px}`. */
  var M = '#' + MOUNT_ID + ' ';
  var CSS = [
    '#' + MOUNT_ID + '{',
    '  --ctr-ink:#171717; --ctr-mute:#737373; --ctr-faint:#a3a3a3; --ctr-line:#e5e5e5;',
    '  --ctr-up:#047857; --ctr-down:#be123c; --ctr-surface:#ffffff; --ctr-control:#ffffff;',
    '  font-family:inherit; font-size:16px; color:var(--ctr-ink); text-align:left;',
    '  line-height:1.4; -webkit-font-smoothing:antialiased;',
    /* fill whatever Webflow gives us: display:block alone would shrink to
       content inside a row-flex parent, and min-width:0 stops a flex item
       refusing to shrink below its content and blowing out the layout */
    '  display:block; width:100%; max-width:100%; min-width:0;',
    '}',

    /* element resets, scoped — undo whatever the host page imposes */
    M + '*,' + M + '*::before,' + M + '*::after{box-sizing:border-box;}',
    M + 'button{font:inherit;color:inherit;background:none;border:0;margin:0;padding:0;cursor:pointer;text-align:inherit;}',
    M + 'input{font:inherit;margin:0;}',
    M + 'a{text-decoration:none;color:inherit;}',
    /* width/height:auto lets each icon honour its own width/height attributes */
    M + 'svg{display:block;flex:none;width:auto;height:auto;max-width:none;}',
    M + 'ul,' + M + 'li,' + M + 'p{list-style:none;margin:0;padding:0;}',
    M + 'table{width:100%;border-collapse:collapse;border-spacing:0;background:none;border:0;margin:0;}',
    M + 'th,' + M + 'td{border:0;padding:0;background:none;text-align:left;font-size:inherit;',
    '  font-weight:400;line-height:inherit;vertical-align:middle;}',
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
    '  box-shadow:0 1px 2px rgba(0,0,0,.04);transition:border-color .15s,background .15s;}',
    M + '.ctr-input::placeholder{color:var(--ctr-faint);opacity:1;}',
    M + '.ctr-input:hover{border-color:#a3a3a3;}',
    M + '.ctr-input:focus{outline:none;border-color:#737373;background:#fff;}',
    M + '.ctr-clear{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--ctr-faint);display:flex;}',
    M + '.ctr-clear:hover{color:var(--ctr-ink);}',

    /* network selector */
    M + '.ctr-net{position:relative;flex:none;}',
    M + '.ctr-net-btn{display:flex;align-items:center;gap:10px;border:1px solid #e5e5e5;',
    '  background:var(--ctr-control);border-radius:10px;padding:8px 16px;font-size:14px;font-weight:500;',
    '  color:#262626;box-shadow:0 1px 2px rgba(0,0,0,.04);transition:border-color .15s,background .15s;}',
    M + '.ctr-net-btn:hover{background:#fff;border-color:#a3a3a3;}',
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

    /* chips */
    M + '.ctr-chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:20px;}',
    M + '.ctr-chip{display:flex;align-items:center;gap:6px;border:1px solid #e5e5e5;',
    '  background:var(--ctr-control);border-radius:10px;padding:6px 12px;font-size:13px;',
    '  color:var(--ctr-mute);transition:border-color .15s,color .15s,background .15s;}',
    M + '.ctr-chip:hover{border-color:#a3a3a3;color:var(--ctr-ink);}',
    M + '.ctr-chip[aria-pressed="true"]{background:#171717;border-color:#171717;color:#fff;}',
    M + '.ctr-chip-n{font-size:11px;color:var(--ctr-faint);font-variant-numeric:tabular-nums;}',
    M + '.ctr-chip[aria-pressed="true"] .ctr-chip-n{color:rgba(255,255,255,.6);}',

    /* card + table */
    M + '.ctr-card{margin-top:20px;}',
    M + '.ctr-scroll{overflow-x:auto;border-radius:10px;background:var(--ctr-surface);',
    '  box-shadow:0 1px 2px rgba(23,23,23,.04),0 10px 30px -12px rgba(23,23,23,.12);',
    '  -webkit-overflow-scrolling:touch;}',
    M + '.ctr-table{min-width:820px;}',
    M + '.ctr-table thead tr{border-bottom:1px solid rgba(229,229,229,.7);}',
    M + '.ctr-table th{padding:14px 12px;}',
    M + '.ctr-table th:first-child{padding-left:16px;}',
    M + '.ctr-table th:last-child{padding-right:16px;}',
    M + '.ctr-th{display:flex;align-items:center;gap:6px;width:100%;font-size:13px;color:var(--ctr-mute);transition:color .15s;}',
    M + '.ctr-th:hover{color:var(--ctr-ink);}',
    M + '.ctr-th[data-active="true"]{color:var(--ctr-ink);}',
    M + '.ctr-th[data-align="right"]{justify-content:flex-end;}',
    M + '.ctr-arrow{color:#d4d4d4;transition:transform .15s,color .15s;}',
    M + '.ctr-th:hover .ctr-arrow{color:var(--ctr-mute);}',
    M + '.ctr-th[data-active="true"] .ctr-arrow{color:var(--ctr-ink);}',
    M + '.ctr-th[data-active="true"][data-dir="desc"] .ctr-arrow{transform:rotate(180deg);}',
    M + '.ctr-table tbody tr{transition:background .12s;}',
    M + '.ctr-table tbody tr+tr{border-top:1px solid rgba(229,229,229,.7);}',
    M + '.ctr-table tbody tr:hover{background:#fafafa;}',
    M + '.ctr-table td{padding:16px 12px;white-space:nowrap;font-size:15px;}',
    M + '.ctr-table td:first-child{padding-left:16px;}',
    M + '.ctr-table td:last-child{padding-right:16px;}',
    M + '.ctr-name{display:flex;align-items:center;gap:12px;}',
    M + '.ctr-id{display:flex;flex-direction:column;line-height:1.25;}',
    M + '.ctr-logo{width:38px;height:32px;display:flex;align-items:center;flex:none;}',
    M + '.ctr-logo img{height:32px;width:auto;display:block;}',
    M + '.ctr-full{font-size:15px;color:var(--ctr-ink);}',
    M + '.ctr-sym{font-size:12px;color:var(--ctr-faint);}',
    M + '.ctr-r{text-align:right;}',
    M + 'td.ctr-r > .ctr-addr{margin-left:auto;}',
    M + '.ctr-v{font-size:15px;font-weight:600;}',
    M + '.ctr-v.up{color:var(--ctr-up);}',
    M + '.ctr-v.down{color:var(--ctr-down);}',
    M + '.ctr-sub{font-size:12px;font-weight:400;color:var(--ctr-faint);margin-top:1px;}',
    M + '.ctr-none{font-size:15px;color:#d4d4d4;}',
    M + '.ctr-loading .ctr-none{animation:ctr-pulse 1.6s ease-in-out infinite;}',
    '@keyframes ctr-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
    '@media(prefers-reduced-motion:reduce){' + M + '.ctr-loading .ctr-none{animation:none;}}',
    /* Right-alignment must not depend on the cell's text-align: a host rule that
       forces `a` to display:flex/block turns this into a block-level box that
       fills the cell and drops its content to the left. inline-flex keeps the
       normal case; justify-content + margin-left:auto cover the forced case. */
    M + '.ctr-addr{display:inline-flex !important;align-items:center;gap:8px;color:#404040;',
    '  font-size:14px;justify-content:flex-end;margin-left:auto;width:auto;transition:color .15s;}',
    M + '.ctr-addr:hover{color:var(--ctr-ink);}',
    M + '.ctr-addr-ico{color:var(--ctr-faint);transition:color .15s;}',
    M + '.ctr-addr:hover .ctr-addr-ico{color:var(--ctr-ink);}',
    M + '.ctr-empty{padding:56px 24px;text-align:center;font-size:14px;color:var(--ctr-mute);white-space:normal;}',

    /* status */
    M + '.ctr-status{display:flex;align-items:center;justify-content:space-between;gap:12px;',
    '  min-height:20px;margin-top:12px;padding:0 4px;font-size:12px;color:var(--ctr-faint);}',
    M + '.ctr-retry{color:var(--ctr-down);font-size:12px;text-decoration:underline;text-underline-offset:2px;}'
  ].join('\n');

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function compact(v, prefix) {
    if (v == null || !isFinite(v) || v === 0) return '—';
    var a = Math.abs(v);
    if (a >= 1e9) return prefix + (v / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return prefix + (v / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return prefix + (v / 1e3).toFixed(2) + 'K';
    return prefix + v.toFixed(2);
  }
  var usd = function (v) { return compact(v, '$'); };
  var num = function (v) { return compact(v, ''); };
  function int(v) { return v == null ? '—' : v.toLocaleString('en-US'); }
  function shortAddr(a) { return a.slice(0, 6) + '…' + a.slice(-4); }
  function net() { return NETWORKS.filter(function (n) { return n.id === state.network; })[0]; }
  function tokens() { return DEPLOYED[state.network] || []; }

  /* The API reports Ethereum mainnet only — never show its figures on another chain. */
  function metrics(symbol) {
    if (!net().live) return null;
    var row = state.live[symbol];
    if (!row) return null;
    var c = row.cumulative || {};
    var price = parseFloat(c.price_usd);
    var sh = parseFloat(c.shielded_tokens);
    var un = parseFloat(c.unshielded_tokens);
    var n = function (v) { return isFinite(v) ? v : 0; };
    return {
      tvsUsd: n(parseFloat(c.tvs_onchain_usd)),
      tvsTok: n(parseFloat(row.tvs_onchain_human != null ? row.tvs_onchain_human : c.tvs_onchain_human)),
      holders: typeof row.holders_count === 'number' ? row.holders_count : null,
      shTok: n(sh), unTok: n(un),
      // no USD field is published for these two, so derive from spot price
      shUsd: n(sh) * n(price), unUsd: n(un) * n(price)
    };
  }

  function countFor(id) {
    var list = tokens();
    if (id === 'all') return list.length;
    return list.filter(function (t) { return t.category === id; }).length;
  }
  function shownCategories() {
    return CATEGORIES.filter(function (c) { return countFor(c.id) > 0; });
  }

  function visible() {
    var q = state.query.trim().toLowerCase();
    var rows = tokens().filter(function (t) {
      if (state.category !== 'all' && t.category !== state.category) return false;
      if (!q) return true;
      return t.name.toLowerCase().indexOf(q) > -1 ||
             t.symbol.toLowerCase().indexOf(q) > -1 ||
             t.address.toLowerCase().indexOf(q) > -1;
    });
    var dir = state.sortDir === 'asc' ? 1 : -1, key = state.sortKey;
    return rows.sort(function (a, b) {
      var va = valueOf(a, key), vb = valueOf(b, key);
      if (typeof va === 'string') return va.localeCompare(vb) * dir;
      if (va === vb) return a.symbol.localeCompare(b.symbol);
      return (va - vb) * dir;
    });
  }
  function valueOf(t, key) {
    if (key === 'name') return t.name.toLowerCase();
    if (key === 'contract') return t.address.toLowerCase();
    var m = metrics(t.symbol);
    if (!m) return -Infinity;
    if (key === 'tvs') return m.tvsUsd;
    if (key === 'holders') return m.holders == null ? -Infinity : m.holders;
    if (key === 'shielded') return m.shUsd;
    if (key === 'unshielded') return m.unUsd;
    return 0;
  }

  /* ---------- icons ---------- */
  var I = {
    search: '<svg class="ctr-search-ico" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="9" r="5.5"/><path d="M13.2 13.2L17 17" stroke-linecap="round"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l8 8M14 6l-8 8" stroke-linecap="round"/></svg>',
    caret: '<svg class="ctr-caret" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" style="color:#a3a3a3"><path d="M6 8l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg class="ctr-opt-check" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 10.5l3.5 3.5L15 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow: '<svg class="ctr-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 10V2M3 5l3-3 3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ext: '<svg class="ctr-addr-ico" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4h4v4M16 4l-7 7M14 12v3.5A1.5 1.5 0 0 1 12.5 17h-8A1.5 1.5 0 0 1 3 15.5v-8A1.5 1.5 0 0 1 4.5 6H8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- render ---------- */
  function cell(primary, sub, cls) {
    if (primary === '—') return '<span class="ctr-none">—</span>';
    return '<div class="ctr-num ctr-v ' + (cls || '') + '">' + primary + '</div>' +
           (sub && sub !== '—' ? '<div class="ctr-num ctr-sub">' + sub + '</div>' : '');
  }

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
          (n.type === 'testnet' ? '<span class="ctr-testnet">Testnet</span>' : '') +
          I.caret +
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

    html += '<div class="ctr-card"><div class="ctr-scroll"><table class="ctr-table"><thead><tr>' +
      COLUMNS.map(function (c) {
        return '<th scope="col"><button class="ctr-th" type="button" data-ctr="sort" data-id="' + c.key +
          '" data-align="' + c.align + '" data-active="' + (state.sortKey === c.key) +
          '" data-dir="' + state.sortDir + '" aria-sort="' +
          (state.sortKey === c.key ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none') +
          '"><span>' + esc(c.label) + '</span>' + I.arrow + '</button></th>';
      }).join('') + '</tr></thead><tbody>';

    if (!rows.length) {
      html += '<tr><td class="ctr-empty" colspan="' + COLUMNS.length + '">' +
        (tokens().length === 0
          ? 'No wrappers deployed on ' + esc(n.name) + ' yet.'
          : 'No token matches “' + esc(state.query) + '” on ' + esc(n.name) + '.') +
        '</td></tr>';
    } else {
      html += rows.map(function (t) {
        var m = metrics(t.symbol);
        return '<tr>' +
          '<td><div class="ctr-name">' +
            '<span class="ctr-logo"><img src="' + LOGO_BASE + t.logo + '" alt=""></span>' +
            '<span class="ctr-id"><span class="ctr-full">' + esc(t.name) + '</span>' +
            '<span class="ctr-sym">' + esc(t.symbol) + '</span></span>' +
          '</div></td>' +
          '<td class="ctr-r">' + (m ? cell(usd(m.tvsUsd), num(m.tvsTok)) : '<span class="ctr-none">—</span>') + '</td>' +
          '<td class="ctr-r">' + (m ? '<span class="ctr-num ctr-v">' + int(m.holders) + '</span>' : '<span class="ctr-none">—</span>') + '</td>' +
          '<td class="ctr-r">' + (m ? cell(usd(m.shUsd), num(m.shTok), 'up') : '<span class="ctr-none">—</span>') + '</td>' +
          '<td class="ctr-r">' + (m ? cell(usd(m.unUsd), num(m.unTok), 'down') : '<span class="ctr-none">—</span>') + '</td>' +
          '<td class="ctr-r"><a class="ctr-addr" href="' + n.explorer + '/address/' + t.address +
            '" target="_blank" rel="noopener" title="' + t.address + '">' +
            '<span class="ctr-num">' + shortAddr(t.address) + '</span>' + I.ext + '</a></td>' +
        '</tr>';
      }).join('');
    }

    html += '</tbody></table></div></div>';

    // Nothing is shown on success — only a retry affordance if the API failed,
    // since a table of dashes with no explanation is worse than a message.
    if (state.loadState === 'error') {
      html += '<div class="ctr-status"><span></span>' +
        '<button class="ctr-retry" type="button" data-ctr="retry">Live metrics unavailable — retry</button>' +
      '</div>';
    }

    root.className = state.loadState === 'loading' ? 'ctr-loading' : '';
    root.innerHTML = html;
  }

  /* ---------- data ---------- */
  function load(root) {
    state.loadState = 'loading';
    render(root);
    fetch(API, { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        var rows = (json && Array.isArray(json.data)) ? json.data : [];
        if (!rows.length) throw new Error('empty payload');
        var map = {}, newest = 0;
        rows.forEach(function (r) {
          if (!r || !r.symbol) return;
          map[r.symbol] = r;
          var s = Date.parse((r.cumulative || {}).updated_at || '');
          if (!isNaN(s) && s > newest) newest = s;
        });
        state.live = map;
        state.updatedAt = newest ? new Date(newest).toLocaleString('en-GB', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
        }) + ' UTC' : '';
        state.loadState = 'ready';
        render(root);
      })
      .catch(function (e) {
        // the registry still works without metrics — addresses are the point
        if (window.console) console.warn('[ct-registry] TVS API unavailable:', e.message);
        state.live = {};
        state.loadState = 'error';
        render(root);
      });
  }

  /* ---------- events (delegated, survives re-render) ---------- */
  function wire(root) {
    root.addEventListener('click', function (ev) {
      var el = ev.target.closest('[data-ctr]');
      if (!el || !root.contains(el)) return;
      /* Re-rendering detaches `el`, so by the time the document-level
         click-outside handler sees this same event its target is orphaned and
         `closest()` can no longer find the widget. Flag the event instead. */
      ev.ctrHandled = true;
      var kind = el.dataset.ctr;

      if (kind === 'menu') { state.menuOpen = !state.menuOpen; render(root); return; }
      if (kind === 'net') {
        state.network = el.dataset.id;
        state.menuOpen = false;
        if (countFor(state.category) === 0) state.category = 'all';
        render(root); return;
      }
      if (kind === 'cat') { state.category = el.dataset.id; render(root); return; }
      if (kind === 'sort') {
        var k = el.dataset.id;
        if (state.sortKey === k) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = k;
          state.sortDir = (k === 'name' || k === 'contract') ? 'asc' : 'desc';
        }
        render(root); return;
      }
      if (kind === 'clear') { state.query = ''; render(root); focusSearch(root); return; }
      if (kind === 'retry') { load(root); return; }
    });

    // re-rendering replaces the input, so restore focus and caret
    root.addEventListener('input', function (ev) {
      if (ev.target.dataset.ctr !== 'search') return;
      state.query = ev.target.value;
      render(root);
      focusSearch(root);
    });

    document.addEventListener('click', function (ev) {
      if (!state.menuOpen) return;
      if (ev.ctrHandled) return;                                  // originated inside the widget
      if (ev.target.closest && ev.target.closest('#' + MOUNT_ID)) return;
      state.menuOpen = false;
      render(root);
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
    if (root.dataset.ctrReady) return;      // guard against double-injection
    root.dataset.ctrReady = '1';

    var style = document.createElement('style');
    style.id = 'ctr-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    wire(root);
    load(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
