/* Finishers Point Africa – clickable prototype (shared by desktop.html and mobile.html).
   Hash routes:  #/  #/shop?cat=&q=  #/product/:id  #/cart  #/order/:ref  #/materials  #/info/:page
                 #/admin/login  #/admin/:section  (desktop only)                                       */
(function () {
  'use strict';

  // One responsive build: below 760px the phone layout (html.m) is used, and it switches live on resize.
  const mq = window.matchMedia('(max-width: 760px)');
  let M = mq.matches;
  document.documentElement.classList.toggle('m', M);
  const app = document.getElementById('app');
  const screen = document.getElementById('screen');
  const toastRoot = document.getElementById('toast-root');
  const modalRoot = document.getElementById('modal-root');
  const drawerRoot = document.getElementById('drawer-root');

  /* ---------------- helpers ---------------- */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => 'TSh ' + Math.round(n).toLocaleString('en-US');
  const short = (n) => n >= 1e6 ? 'TSh ' + (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? 'TSh ' + Math.round(n / 1e3) + 'k' : fmt(n);
  const IMG = (n) => 'images/' + n + '.jpg';
  const KEY = 'fpa_v2_';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* storage unavailable: keep in memory */ } }
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const now = () => { const d = new Date(); return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
  const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const toTop = () => { if (screen) screen.scrollTop = 0; else window.scrollTo(0, 0); };
  const go = (h) => { if (location.hash === h) render(); else location.hash = h; };

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cart: '<path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>',
    wa: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/>', left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    home: '<path d="M3 10 12 4l9 6v10H3zM9 20v-6h6v6"/>', cash: '<path d="M3 6h18v12H3zM3 10h18M7 15h3"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    list: '<path d="M9 5h10M9 12h10M9 19h10M4 5h.01M4 12h.01M4 19h.01"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', grid: '<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>', box: '<path d="M12 3 3 7.5 12 12l9-4.5zM3 7.5V16l9 5 9-5V7.5M12 12v9"/>',
    tag: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>', stock: '<path d="M3 7h18v13H3zM3 7l3-4h12l3 4M9 12h6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', users: '<path d="M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>',
    logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>', pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', mail: '<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>', download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>', refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>'
  };
  const ic = (n, s) => `<svg class="i" viewBox="0 0 24 24" width="${s || 20}" height="${s || 20}" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------------- data ---------------- */
  const SEED_CATS = [
    { slug: 'cement', name: 'Cement & building', img: 'cat-cement', blurb: 'Cement, blocks and building essentials for every stage of the build.' },
    { slug: 'paint', name: 'Paint & finishes', img: 'cat-paint', blurb: 'Interior and exterior paints, primers, rollers and brushes.' },
    { slug: 'tiles', name: 'Tiles & flooring', img: 'cat-tiles', blurb: 'Porcelain, ceramic and decorative tiles for floors and walls.' },
    { slug: 'electrical', name: 'Electrical', img: 'cat-electrical', blurb: 'Cables, distribution boards, sockets and switches.' },
    { slug: 'lighting', name: 'Lighting', img: 'cat-lighting', blurb: 'LED bulbs, pendants and fittings for homes, shops and offices.' },
    { slug: 'plumbing', name: 'Plumbing', img: 'cat-plumbing', blurb: 'PPR and copper pipes, fittings and water supply parts.' },
    { slug: 'tools', name: 'Tools & hardware', img: 'cat-tools', blurb: 'Hand tools, power tools and site hardware for fundis and DIY.' },
    { slug: 'roofing', name: 'Roofing', img: 'cat-roofing', blurb: 'Roofing sheets, tiles and accessories built for the weather.' }
  ];
  const DESC = {
    cement: 'General-purpose building material for foundations, columns, slabs, blockwork and plastering. Store bags off the ground in a dry place and use within three months.',
    paint: 'Durable, washable finish for interior and exterior walls, doors and trim. Coverage depends on the surface and number of coats.',
    tiles: 'Hard-wearing tile for living areas, kitchens and bathrooms. Order about 10% extra to allow for cuts and breakages.',
    electrical: 'Quality electrical supply for homes and commercial sites. Installation should be done by a qualified electrician.',
    lighting: 'Energy-efficient lighting for homes, shops and offices.',
    plumbing: 'Reliable plumbing supply for hot and cold water systems.',
    tools: 'Professional-grade tools for builders, fundis and DIY projects.',
    roofing: 'Weather-resistant roofing for homes and commercial buildings.'
  };
  const SEED_PRODUCTS = [
    { id: 1, cat: 'cement', brand: 'Twiga', name: 'Portland Cement 42.5R', unit: '50 kg bag', price: 18500, qty: 240, low: 40, img: 'cement-stack', photos: ['cement-stack', 'cement-sack', 'cement-bags', 'bricks-worker'], variants: [['50 kg bag', 18500], ['25 kg bag', 10500]], spec: [['Strength class', '42.5R'], ['Cement type', 'CEM I Portland'], ['Standard', '[CONFIRM STANDARD]']], best: true },
    { id: 2, cat: 'paint', brand: 'Sadolin', name: 'Super Gloss Paint, White 4 L', unit: 'tin', price: 52000, qty: 4, low: 10, img: 'paint-open', photos: ['paint-open', 'paint-shelves', 'paint-rollers'], spec: [['Finish', 'High gloss'], ['Coverage', '[CONFIRM] m² per litre']], best: true },
    { id: 3, cat: 'tiles', brand: 'Generic', name: 'Marble-look Porcelain Tile 60×60', unit: 'm²', price: 32000, qty: 18, low: 20, img: 'tiles-marble', photos: ['tiles-marble', 'hero-interior'], spec: [['Size', '60 × 60 cm'], ['Finish', 'Polished']], best: true },
    { id: 4, cat: 'lighting', brand: 'Philips', name: 'Filament LED Bulb 8W E27', unit: 'piece', price: 6500, qty: 85, low: 20, img: 'bulb', photos: ['bulb', 'pendant'], spec: [['Power', '8 W'], ['Fitting', 'E27 screw']], best: true },
    { id: 5, cat: 'electrical', brand: 'EA Cables', name: 'House Wire 2.5 mm², 100 m', unit: 'roll', price: 145000, qty: 26, low: 8, img: 'wires-bundle', photos: ['wires-bundle', 'wires-switch'], spec: [['Cross-section', '2.5 mm²'], ['Length', '100 m']], best: true },
    { id: 6, cat: 'lighting', brand: 'Lumen', name: 'Brass Dome Pendant Light', unit: 'piece', price: 85000, qty: 12, low: 4, img: 'pendant', photos: ['pendant', 'hero-interior'], spec: [['Finish', 'Brushed brass'], ['Bulb', 'E27, not included']], best: true },
    { id: 7, cat: 'tools', brand: 'Stanley', name: 'Claw Hammer & Plier Set', unit: 'set', price: 38000, qty: 30, low: 6, img: 'tools-hammer', photos: ['tools-hammer', 'tools-rack'], spec: [['Contents', 'Hammer, pliers, screwdriver']], best: true },
    { id: 8, cat: 'paint', brand: 'Hamilton', name: 'Paint Roller Kit 9"', unit: 'kit', price: 12000, qty: 6, low: 10, img: 'paint-rollers', photos: ['paint-rollers', 'paint-shelves'], spec: [['Roller width', '9 inch'], ['Includes', 'Tray and extension']], best: true },
    { id: 9, cat: 'tiles', brand: 'Ceramica', name: 'Hand-glazed Wall Tile', unit: 'm²', price: 41000, qty: 60, low: 15, img: 'tiles-grid', photos: ['tiles-grid'], spec: [['Size', '20 × 20 cm'], ['Use', 'Walls, splashbacks']], best: true },
    { id: 10, cat: 'electrical', brand: 'Schneider', name: 'Distribution Board 12-way', unit: 'piece', price: 165000, qty: 9, low: 3, img: 'wires-switch', photos: ['wires-switch', 'wires-bundle'], spec: [['Ways', '12'], ['Mounting', 'Surface']], best: true },
    { id: 11, cat: 'roofing', brand: 'Kiboko', name: 'Stone-coated Roofing Sheet', unit: 'sheet', price: 27500, qty: 140, low: 30, img: 'roof', photos: ['roof', 'hero-site'], spec: [['Gauge', '[CONFIRM]'], ['Colour', 'Charcoal']] },
    { id: 12, cat: 'plumbing', brand: 'Plasco', name: 'PPR Pipe 25 mm, 4 m', unit: 'length', price: 6500, qty: 0, low: 50, img: 'pipe-white', photos: ['pipe-white', 'pipes-wall'], spec: [['Diameter', '25 mm'], ['Length', '4 m']] },
    { id: 13, cat: 'cement', brand: 'Twiga', name: 'Plaster Cement 32.5N', unit: '50 kg bag', price: 16500, qty: 180, low: 40, img: 'cement-bags', photos: ['cement-bags', 'cement-sack'], spec: [['Strength class', '32.5N'], ['Use', 'Plastering, blockwork']] },
    { id: 14, cat: 'tools', brand: 'Generic', name: 'Workshop Tool Wall Kit', unit: 'set', price: 195000, qty: 3, low: 4, img: 'tools-rack', photos: ['tools-rack', 'tools-hammer'], spec: [['Pieces', '40+']] },
    { id: 15, cat: 'plumbing', brand: 'Plasco', name: 'Pipe Fittings Set', unit: 'set', price: 24000, qty: 40, low: 10, img: 'pipes-wall', photos: ['pipes-wall', 'pipe-white'], spec: [['Contents', 'Elbows, tees, sockets']] },
    { id: 16, cat: 'cement', brand: 'Generic', name: 'Building Blocks 6 inch', unit: 'piece', price: 1200, qty: 5000, low: 800, img: 'bricks-worker', photos: ['bricks-worker', 'hero-site'], spec: [['Size', '6 inch hollow']] }
  ];
  const SEED_ORDERS = [
    { ref: 'FPA-7KQ3-2941', name: 'Neema Mushi', phone: '+255 7XX XXX 214', mode: 'delivery', area: 'Ilemela – Buswelu', note: 'Near Buswelu market, blue gate. Site behind the church.', items: [[1, 10], [2, 2], [4, 6]], status: 'Pending', time: '9:42 AM', date: 'Today', fee: 15000, log: [['9:42', 'Order submitted online']] },
    { ref: 'FPA-3MZ8-1187', name: 'Juma Construction Ltd', phone: '+255 7XX XXX 908', mode: 'delivery', area: 'Nyamagana – Mkuyuni', note: 'Deliver to site gate. Ask for the foreman.', items: [[1, 100], [16, 400], [11, 30]], status: 'Pending', time: '9:15 AM', date: 'Today', fee: 60000, log: [['9:15', 'Order submitted online']] },
    { ref: 'FPA-9TR2-6620', name: 'Grace Kweka', phone: '+255 6XX XXX 331', mode: 'pickup', area: '', note: '', items: [[8, 2], [2, 1]], status: 'Pending', time: '8:51 AM', date: 'Today', fee: 0, log: [['8:51', 'Order submitted online']] },
    { ref: 'FPA-5QW1-4402', name: 'Baraka Mollel', phone: '+255 7XX XXX 772', mode: 'delivery', area: 'Ilemela – Kiseke', note: '', items: [[3, 12], [9, 4]], status: 'Confirmed', time: 'Yesterday', date: 'Yesterday', fee: 20000, log: [['Yesterday', 'Order submitted online'], ['Yesterday', 'Confirmed by Asha J. · stock reserved']] },
    { ref: 'FPA-2HN6-9015', name: 'Mwanza Retail Hub', phone: '+255 7XX XXX 050', mode: 'delivery', area: 'Nyamagana – City centre', note: 'Shop delivery, back entrance.', items: [[4, 60], [6, 4], [5, 2]], status: 'Preparing', time: 'Yesterday', date: 'Yesterday', fee: 15000, log: [['Yesterday', 'Order submitted online'], ['Yesterday', 'Confirmed by Asha J. · stock reserved'], ['Yesterday', 'Preparing']] },
    { ref: 'FPA-8LD4-3378', name: 'Said Hamisi', phone: '+255 6XX XXX 619', mode: 'delivery', area: 'Nyamagana – Buhongwa', note: '', items: [[1, 30]], status: 'Out for delivery', time: 'Yesterday', date: 'Yesterday', fee: 25000, log: [['Yesterday', 'Order submitted online'], ['Yesterday', 'Confirmed by Daudi M.'], ['Today', 'Out for delivery']] },
    { ref: 'FPA-6CV9-7741', name: 'Rehema Paul', phone: '+255 7XX XXX 488', mode: 'pickup', area: '', note: '', items: [[7, 1]], status: 'Delivered', time: '24 Oct', date: '24 Oct', fee: 0, log: [['24 Oct', 'Order submitted online'], ['24 Oct', 'Collected at shop']] },
    { ref: 'FPA-4BX7-2290', name: 'Peter Otieno', phone: '+255 7XX XXX 125', mode: 'delivery', area: 'Misungwi', note: '', items: [[12, 200]], status: 'Rejected', time: '24 Oct', date: '24 Oct', fee: 0, reason: 'PPR pipe out of stock; customer will reorder next week.', log: [['24 Oct', 'Order submitted online'], ['24 Oct', 'Rejected by Asha J.']] }
  ];
  const SEED_MOVES = [
    { t: 'Today 8:10', pid: 1, type: 'Stock in', delta: 200, note: 'Supplier delivery · Twiga', by: 'Daudi M.' },
    { t: 'Yesterday', pid: 4, type: 'Order reserved', delta: -60, note: 'FPA-2HN6-9015', by: 'Asha J.' },
    { t: 'Yesterday', pid: 2, type: 'Damaged / lost', delta: -2, note: 'Dented tins', by: 'Asha J.' },
    { t: '24 Oct', pid: 12, type: 'Correction', delta: -5, note: 'Stock count', by: 'Daudi M.' }
  ];
  const SEED_PAYMENTS = [
    { ref: 'FPA-6CV9-7741', method: 'Cash at shop', amount: 38000, txn: '—', by: 'Asha J.', date: '24 Oct' },
    { ref: 'FPA-1KS5-0081', method: 'M-Pesa', amount: 412000, txn: 'QJ7XXXXXX2', by: 'Daudi M.', date: '23 Oct' },
    { ref: 'FPA-0PL2-5532', method: 'Bank transfer', amount: 1250000, txn: 'CRDB-XXXX-881', by: 'Asha J.', date: '22 Oct' }
  ];
  const SEED_USERS = [
    { name: 'Asha J.', email: 'asha@[shop-domain]', role: 'Administrator', status: 'Active', last: 'Now' },
    { name: 'Daudi M.', email: 'daudi@[shop-domain]', role: 'Administrator', status: 'Active', last: 'Today 8:10' }
  ];

  let CATS = store.get('cats', clone(SEED_CATS));
  let PRODUCTS = store.get('products', clone(SEED_PRODUCTS));
  let ORDERS = store.get('orders', clone(SEED_ORDERS));
  let MOVES = store.get('moves', clone(SEED_MOVES));
  let PAYMENTS = store.get('payments', clone(SEED_PAYMENTS));
  let USERS = store.get('users', clone(SEED_USERS));
  let CART = store.get('cart', [{ id: 1, v: 0, qty: 10 }, { id: 2, v: null, qty: 2 }, { id: 4, v: null, qty: 6 }]);
  let CO = store.get('checkout', { name: '', phone: '', email: '', mode: 'delivery', area: 'Ilemela – Buswelu', addr: '', notes: '' });
  let FAVS = new Set(store.get('favs', []));
  const save = () => {
    store.set('cats', CATS); store.set('products', PRODUCTS); store.set('orders', ORDERS); store.set('moves', MOVES);
    store.set('payments', PAYMENTS); store.set('users', USERS); store.set('cart', CART); store.set('checkout', CO); store.set('favs', [...FAVS]);
  };

  const byId = (id) => PRODUCTS.find((p) => p.id === +id);
  const catOf = (slug) => CATS.find((c) => c.slug === slug) || { slug, name: slug, img: 'store-shelves', blurb: '' };
  const live = () => PRODUCTS.filter((p) => p.published !== false);
  const sku = (p) => 'FPA-' + p.cat.slice(0, 3).toUpperCase() + '-' + String(p.id).padStart(3, '0');
  const stockOf = (p) => p.qty <= 0 ? { label: 'Out of stock', cls: 'b-grey', dot: 'x', txt: 't-grey' }
    : p.qty <= p.low ? { label: 'Low stock', cls: 'b-amber', dot: 'a', txt: 't-amber' } : { label: 'In stock', cls: 'b-green', dot: 'g', txt: 't-green' };
  const unitPrice = (p, v) => (p.variants && v != null && p.variants[v]) ? p.variants[v][1] : p.price;
  const unitLabel = (p, v) => (p.variants && v != null && p.variants[v]) ? p.variants[v][0] : p.unit;
  const cartLines = () => CART.map((l) => ({ ...l, p: byId(l.id) })).filter((l) => l.p);
  const cartCount = () => CART.length;
  const cartSub = () => cartLines().reduce((s, l) => s + unitPrice(l.p, l.v) * l.qty, 0);
  const orderItems = (o) => o.items.map(([id, q]) => ({ p: byId(id), q })).filter((x) => x.p);
  const orderSub = (o) => orderItems(o).reduce((s, x) => s + x.p.price * x.q, 0) + (o.extra || 0);
  const orderTotal = (o) => orderSub(o) + (o.fee || 0);
  const ST = { 'Pending': 'b-amber', 'Confirmed': 'b-blue', 'Preparing': 'b-purple', 'Ready for delivery': 'b-grey', 'Out for delivery': 'b-dark', 'Delivered': 'b-green', 'Rejected': 'b-red', 'Cancelled': 'b-red' };
  const NEXT = { 'Confirmed': 'Preparing', 'Preparing': 'Ready for delivery', 'Ready for delivery': 'Out for delivery', 'Out for delivery': 'Delivered' };
  const badge = (s) => `<span class="badge ${ST[s] || 'b-grey'}">${esc(s)}</span>`;
  const nextLabel = (o) => ({ 'Confirmed': 'Start preparing', 'Preparing': o.mode === 'pickup' ? 'Mark ready for pickup' : 'Mark ready for delivery', 'Ready for delivery': o.mode === 'pickup' ? 'Mark collected' : 'Dispatch – out for delivery', 'Out for delivery': 'Mark delivered' })[o.status];
  const nextStatus = (o) => (o.mode === 'pickup' && o.status === 'Ready for delivery') ? 'Delivered' : NEXT[o.status];
  const paidFor = (ref) => PAYMENTS.filter((p) => p.ref === ref).reduce((s, p) => s + p.amount, 0);

  /* ---------------- toast + modal ---------------- */
  function toast(html, ms) {
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status'); el.innerHTML = html;
    toastRoot.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms || 3000);
  }
  const okToast = (msg) => toast(`<span class="tic">${ic('check', 18)}</span><span>${msg}</span>`);
  const badToast = (msg) => toast(`<span class="tic warn">${ic('x', 18)}</span><span>${msg}</span>`, 4200);
  let modalSave = null;
  function openModal(title, body, saveLabel, onSave) {
    modalRoot.innerHTML = `<div class="mback" data-act="closeModal"></div><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">
      <div class="mhead"><h2 id="mt">${title}</h2><button type="button" class="icon-btn" data-act="closeModal" aria-label="Close">${ic('x')}</button></div>
      <form class="mbody" data-form="modal" novalidate>${body}<div class="merr" id="merr" role="alert"></div>
      <div class="mfoot"><button type="button" class="btn btn-outline" data-act="closeModal">Cancel</button><button class="btn btn-primary" type="submit">${saveLabel}</button></div></form></div>`;
    modalSave = onSave; modalRoot.classList.add('open');
    setTimeout(() => { const f = $('.modal input:not([type=hidden]), .modal select, .modal textarea'); if (f) f.focus(); }, 60);
  }
  function closeModal() { modalRoot.classList.remove('open'); modalRoot.innerHTML = ''; modalSave = null; }

  /* ---------------- shared chrome ---------------- */
  function header() {
    const r = route(); const n = cartCount();
    const cur = r.parts[0] === 'shop' ? (r.q.cat || '') : '';
    const brand = `<a href="#/" class="logo" aria-label="Finishers Point Africa home"><span class="logo-mark">F</span><span class="logo-text"><b>FINISHERS POINT</b><span>AFRICA</span></span></a>`;
    const search = `<form class="search" data-form="search" role="search">${ic('search')}<label class="sr" for="q">Search products</label><input id="q" name="q" type="search" placeholder="Search cement, paint, tiles, cables…" value="${esc(r.q.q || '')}">${M ? '' : '<button class="btn btn-dark btn-sm" type="submit">Search</button>'}</form>`;
    if (M) {
      const msg = '<span>Delivery across Mwanza</span><span style="color:#F2A900;font-weight:600">Pay on delivery or at pickup</span><span>Contractor orders welcome</span><span style="color:#F2A900;font-weight:600">Call or WhatsApp to confirm</span>';
      return `<div class="topbar"><div class="marquee">${msg}${msg}</div></div>
      <header class="header"><div class="wrap header-row"><button class="icon-btn" data-act="menu" aria-label="Open menu">${ic('menu', 24)}</button>${brand}
      <a href="#/cart" class="icon-btn" aria-label="Cart, ${n} items">${ic('cart', 24)}<span class="count" id="cartCount">${n}</span></a></div>
      <div class="wrap search-row">${search}</div></header>`;
    }
    return `<div class="topbar"><div class="wrap"><span>Delivery across Mwanza · <b>Pay on delivery or at pickup</b></span><span>Call / WhatsApp [PHONE NUMBER] · Mon–Sat [OPENING HOURS]</span></div></div>
    <header class="header"><div class="wrap header-row">${brand}${search}
      <a href="#/info/contact" class="btn btn-outline">${ic('wa')}WhatsApp</a>
      <a href="#/cart" class="btn btn-primary">${ic('cart')}Cart<span class="count" id="cartCount">${n}</span></a></div>
      <nav class="wrap catnav" aria-label="Categories">${CATS.map((c) => `<a class="nl${cur === c.slug ? ' on' : ''}" href="#/shop?cat=${c.slug}">${esc(c.name)}</a>`).join('')}<a class="nl special" href="#/materials">Contractor orders</a></nav></header>`;
  }
  function drawer() {
    return `<div class="drawer-back" data-act="menu"></div><aside class="drawer" aria-label="Menu">
      <div class="drawer-head"><a href="#/" class="logo"><span class="logo-mark" style="width:34px;height:34px;font-size:19px">F</span><span class="logo-text"><b style="font-size:15px">FINISHERS POINT</b><span>AFRICA</span></span></a><button class="icon-btn" data-act="menu" aria-label="Close menu">${ic('x')}</button></div>
      <h4>SHOP</h4><nav>${CATS.map((c) => `<a href="#/shop?cat=${c.slug}"><img src="${IMG(c.img)}" alt="">${esc(c.name)}</a>`).join('')}<a href="#/shop">${ic('grid')}All products</a></nav>
      <h4>HELP</h4><nav><a href="#/materials">${ic('list')}Contractor orders</a><a href="#/info/how">${ic('info')}How ordering works</a><a href="#/info/delivery">${ic('truck')}Delivery policy</a><a href="#/info/contact">${ic('phone')}Contact us</a><a href="#/admin/login">${ic('users')}Staff login</a></nav></aside>`;
  }
  function footer() {
    return `<footer class="footer"><div class="wrap fcols">
      <div><a href="#/" class="flogo">FINISHERS POINT AFRICA</a><p>Hardware, building materials and finishing products in Mwanza, Tanzania.</p>
        <button class="btn btn-sm btn-ghost-light no-print" data-act="print" style="margin-top:8px">${ic('print', 18)}Save this page as PDF</button></div>
      <div><strong>Shop</strong>${CATS.slice(0, 5).map((c) => `<a class="nl" href="#/shop?cat=${c.slug}">${esc(c.name)}</a>`).join('')}<a class="nl" href="#/shop">All products</a></div>
      <div><strong>Help</strong><a class="nl" href="#/info/how">How ordering works</a><a class="nl" href="#/info/delivery">Delivery policy</a><a class="nl" href="#/info/returns">Returns &amp; cancellations</a><a class="nl" href="#/info/privacy">Privacy</a><a class="nl" href="#/info/contact">Contact us</a></div>
      <div><strong>Visit us</strong><span>[SHOP ADDRESS], Mwanza</span><span>[PHONE NUMBER]</span><span>Mon–Sat, [OPENING HOURS]</span>
        <a class="nl" href="#/admin/login">Staff login</a></div>
    </div><div class="wrap fbottom"><span>© 2026 Finishers Point Africa · prototype with sample data</span><button class="nl no-print" data-act="printAll">Save all store pages as one PDF</button></div></footer>`;
  }
  const shell = (body, cls) => `${header()}<main class="page${cls ? ' ' + cls : ''}">${body}</main>${footer()}`;

  function pcard(p) {
    const s = stockOf(p);
    return `<article class="pcard lift"><a href="#/product/${p.id}" class="ph"><img src="${IMG(p.img)}" alt="${esc(p.name)}"><span class="badge ${s.cls}">${s.label}</span>${M ? '' : '<span class="quick">View details</span>'}</a>
      <div class="bd"><span class="brand">${esc(p.brand)}</span><a href="#/product/${p.id}" class="nm">${esc(p.name)}</a>
      <div class="ft"><span><span class="price">${fmt(p.price)}</span><br><span class="unit">per ${esc(p.unit)}</span></span>${addBtn(p)}</div></div></article>`;
  }
  function addBtn(p) {
    if (p.qty <= 0) return `<button class="add" disabled>${M ? ic('x', 18) : 'Sold out'}</button>`;
    return `<button class="add" data-act="add" data-id="${p.id}" aria-label="Add ${esc(p.name)} to cart">${ic('plus', 18)}${M ? '' : '<span>Add</span>'}</button>`;
  }

  /* ---------------- storefront pages ---------------- */
  const SLIDES = [
    { img: 'hero-site', alt: 'Builders working on a roof', kicker: 'Build', title: 'Cement, steel and roofing for every site.', body: 'Order bags or truckloads online. We confirm stock by phone and deliver across Mwanza.', cta: 'Shop building materials', href: '#/shop?cat=cement' },
    { img: 'hero-interior', alt: 'Modern finished living room', kicker: 'Finish', title: 'Tiles, paint and lighting for the final touch.', body: 'Porcelain tiles, premium paints and modern fittings, all in one place.', cta: 'Shop finishes', href: '#/shop?cat=tiles' },
    { img: 'hero-store', alt: 'Well-stocked hardware aisle', kicker: 'Order online', title: 'Your hardware shop, now open online.', body: 'Add to cart and submit. The shop calls you to confirm. No online payment needed.', cta: 'Start shopping', href: '#/shop' }
  ];
  const heroCopy = (i) => { const s = SLIDES[i]; return `<span class="kicker light">${s.kicker}</span><h1>${s.title}</h1><p>${s.body}</p><div class="hero-btns"><a class="btn btn-primary btn-lg" href="${s.href}">${s.cta}</a><a class="btn btn-ghost-light btn-lg" href="#/materials">Send a materials list</a></div>`; };

  function vHome() {
    const best = live().filter((p) => p.best);
    return shell(`<section class="wrap">
      <div class="hero" id="hero" aria-roledescription="carousel">
        ${SLIDES.map((s, i) => `<div class="hero-slide${i ? '' : ' on'}"><img src="${IMG(s.img)}" alt="${s.alt}"></div>`).join('')}
        <div class="hero-shade"></div><div class="hero-copy" id="heroCopy">${heroCopy(0)}</div>
        <div class="hero-ctrl no-print"><div class="dots">${SLIDES.map((s, i) => `<button class="dot${i ? '' : ' on'}" data-act="hero" data-i="${i}" aria-label="Show slide ${i + 1}"><span></span></button>`).join('')}</div>
          <span class="hero-no" id="heroNo">01 / 03</span>
          <button class="circ" data-act="heroStep" data-d="-1" aria-label="Previous slide">${ic('left')}</button><button class="circ" data-act="heroStep" data-d="1" aria-label="Next slide">${ic('right')}</button></div>
      </div>
      <div class="usps">
        <div class="usp"><span class="ic">${ic('truck')}</span><span><b>Delivery across Mwanza</b>Fee confirmed before dispatch</span></div>
        <div class="usp"><span class="ic">${ic('cash')}</span><span><b>No online payment</b>Pay on delivery or at pickup</span></div>
        <div class="usp"><span class="ic">${ic('phone')}</span><span><b>Shop confirms every order</b>We call to check stock and total</span></div>
        <div class="usp"><span class="ic">${ic('list')}</span><span><b>Contractor orders</b>Bulk lists, one confirmed total</span></div>
      </div></section>
    <section class="wrap section"><div class="sec-head"><div><span class="kicker">Categories</span><h2>Everything to build and finish</h2></div><a class="nl" href="#/shop">View all products →</a></div>
      <div class="cat-grid">${CATS.map((c) => `<a href="#/shop?cat=${c.slug}" class="tile lift"><img src="${IMG(c.img)}" alt=""><span class="cap"><span><b>${esc(c.name)}</b><small>${PRODUCTS.filter((p) => p.cat === c.slug && p.published !== false).length} products</small></span><span class="arrow">${ic('arrow', 18)}</span></span></a>`).join('')}</div></section>
    <section class="wrap section"><div class="sec-head"><div><span class="kicker">Best sellers</span><h2>What Mwanza is building with</h2></div>
      <div class="row-arrows no-print"><button class="circ" data-act="row" data-d="-1" id="rowPrev" aria-label="Scroll left">${ic('left')}</button><button class="circ" data-act="row" data-d="1" id="rowNext" aria-label="Scroll right">${ic('right')}</button></div></div>
      <div class="row-wrap"><div class="row-track" id="rowTrack">${best.map(pcard).join('')}</div></div></section>
    <section class="wrap section"><div class="sec-head"><div><span class="kicker">How it works</span><h2>Order in three steps</h2></div><a class="nl" href="#/info/how">Read more →</a></div>
      <div class="steps">
        <div class="step"><span class="n">1</span><b>Add items to your cart</b><p>Browse by category or search. All prices in TSh.</p></div>
        <div class="step"><span class="n">2</span><b>Submit your order</b><p>Name, phone and delivery details. No account and no online payment.</p></div>
        <div class="step"><span class="n">3</span><b>We call to confirm</b><p>The shop checks stock and the delivery fee, then confirms and delivers.</p></div>
      </div></section>
    <section class="wrap section"><div class="promo"><div class="txt"><span class="kicker light">For contractors &amp; retailers</span><h2>Send one list. Get one confirmed order.</h2>
      <p>Upload or type your bill of materials. The shop checks stock, suggests substitutes, and calls you with a single confirmed total and delivery date.</p>
      <div class="hero-btns"><a class="btn btn-primary" href="#/materials">Send a materials list</a><a class="btn btn-ghost-light" href="#/info/contact">Talk to the shop</a></div></div>
      <div class="pic"><img src="${IMG('bricks-worker')}" alt="Builders on a site in progress"></div></div></section>
    <div class="brands"><div class="marquee">${'<span>TWIGA</span><span>SADOLIN</span><span>PHILIPS</span><span>DANGOTE</span><span>CROWN PAINTS</span><span>SCHNEIDER</span><span>STANLEY</span>'.repeat(2)}</div></div>`, 'flush');
  }
  let heroI = 0, rowI = 0;
  function heroGo(i) {
    const hero = $('#hero'); if (!hero) return;
    heroI = (i + SLIDES.length) % SLIDES.length;
    $$('.hero-slide', hero).forEach((s, k) => s.classList.toggle('on', k === heroI));
    $$('.dot', hero).forEach((d, k) => d.classList.toggle('on', k === heroI));
    $('#heroCopy').innerHTML = heroCopy(heroI);
    $('#heroNo').textContent = '0' + (heroI + 1) + ' / 03';
  }
  function rowGo(i) {
    const track = $('#rowTrack'); if (!track || M) return;
    const n = track.children.length; const vis = Math.max(1, Math.floor(track.parentElement.clientWidth / 300));
    rowI = Math.max(0, Math.min(n - vis, i));
    track.style.transform = `translateX(-${rowI * 300}px)`;
    $('#rowPrev').disabled = rowI === 0; $('#rowNext').disabled = rowI >= n - vis;
  }
  function mountHome() {
    heroI = 0; rowI = 0; rowGo(0);
    timers.push(setInterval(() => heroGo(heroI + 1), 6000));
  }

  /* shop / search */
  let shopF = null;
  function vShop(q) {
    const cat = CATS.find((c) => c.slug === q.cat);
    const text = (q.q || '').trim();
    shopF = { cats: new Set(cat ? [cat.slug] : CATS.map((c) => c.slug)), max: 200000, stock: false, sort: 'popular', q: text };
    const top = cat
      ? `<div class="cat-hero"><img src="${IMG(cat.img)}" alt=""><div><span class="kicker light">Category</span><h1>${esc(cat.name)}</h1><p>${esc(cat.blurb)}</p></div></div>`
      : `<div class="page-title"><span class="kicker">${text ? 'Search' : 'Shop'}</span><h1>${text ? `Results for “${esc(text)}”` : 'All products'}</h1></div>`;
    const inner = `<div class="f-in"><div class="f-head"><h3>Filter</h3><button class="linkbtn" data-act="resetFilters">Reset</button></div>
      <fieldset><legend>Category</legend>${CATS.map((c) => `<label class="chk"><input type="checkbox" data-filter="cat" value="${c.slug}"${shopF.cats.has(c.slug) ? ' checked' : ''}><span>${esc(c.name)}</span><em>${live().filter((p) => p.cat === c.slug).length}</em></label>`).join('')}</fieldset>
      <div class="range"><div class="rh"><label for="maxp">Max price</label><b id="maxOut">${fmt(shopF.max)}</b></div><input id="maxp" type="range" min="5000" max="200000" step="5000" value="${shopF.max}" data-filter="max"><div class="rl"><span>TSh 5k</span><span>TSh 200k</span></div></div>
      <label class="chk"><input type="checkbox" data-filter="stock"><span>In stock only</span></label></div>`;
    return shell(`<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><span>${cat ? esc(cat.name) : text ? 'Search' : 'All products'}</span></nav>${top}
      <div class="shop">${M ? `<details class="panel filters"><summary>${ic('list')}Filters &amp; sort</summary>${inner}</details>` : `<aside class="panel filters">${inner}</aside>`}
      <div class="results"><div class="res-head"><h2 id="resCount"></h2><label class="muted" style="display:flex;align-items:center;gap:8px">Sort <select class="select sm" data-filter="sort"><option value="popular">Most popular</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name A–Z</option></select></label></div>
      <div class="pgrid" id="results">${shopResults()}</div></div></div></div>`);
  }
  function shopMatches() {
    const t = shopF.q.toLowerCase();
    let list = live().filter((p) => shopF.cats.has(p.cat) && p.price <= shopF.max && (!shopF.stock || p.qty > 0)
      && (!t || (p.name + ' ' + p.brand + ' ' + catOf(p.cat).name + ' ' + p.cat).toLowerCase().includes(t)));
    if (shopF.sort === 'low') list = list.slice().sort((a, b) => a.price - b.price);
    if (shopF.sort === 'high') list = list.slice().sort((a, b) => b.price - a.price);
    if (shopF.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (shopF.sort === 'popular') list = list.slice().sort((a, b) => (b.best ? 1 : 0) - (a.best ? 1 : 0));
    return list;
  }
  function shopResults() {
    const list = shopMatches();
    setTimeout(() => { const c = $('#resCount'); if (c) c.textContent = list.length + (list.length === 1 ? ' product' : ' products'); }, 0);
    return list.length ? list.map(pcard).join('') : `<div class="empty" style="grid-column:1/-1">${ic('search', 28)}<b>No products match</b><span>Try another search, raise the max price or add a category.</span><button class="btn btn-outline btn-sm" data-act="resetFilters">Clear filters</button></div>`;
  }
  const refreshShop = () => { const r = $('#results'); if (r) r.innerHTML = shopResults(); };

  /* product */
  let pdp = {};
  function vProduct(id) {
    const p = byId(id); if (!p || p.published === false) return vNotFound();
    if (pdp.id !== p.id) pdp = { id: p.id, photo: 0, v: p.variants ? 0 : null, qty: p.cat === 'cement' ? 10 : 1, tab: 'desc', anim: false };
    const photos = p.photos && p.photos.length ? p.photos : [p.img];
    const price = unitPrice(p, pdp.v), s = stockOf(p);
    const quick = p.unit.includes('bag') ? [10, 25, 50, 100] : p.unit === 'piece' && p.price < 5000 ? [100, 500, 1000] : [1, 5, 10];
    const related = live().filter((x) => x.id !== p.id && x.cat === p.cat).concat(live().filter((x) => x.cat !== p.cat && x.best)).slice(0, 4);
    const tabBody = pdp.tab === 'specs'
      ? `<div class="spec-grid">${[['Brand', p.brand], ['Category', catOf(p.cat).name], ['Unit', unitLabel(p, pdp.v)], ['SKU', sku(p)]].concat(p.spec || []).map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`
      : pdp.tab === 'delivery'
        ? `<div class="info-cards"><div><b>Delivery in Mwanza</b>Fee depends on location and load. The shop confirms it when they call you.</div><div><b>Free pickup</b>Collect from the shop once your order is confirmed.</div><div><b>Bulk orders</b>Large orders go by truck, usually the next working day.</div></div>`
        : `<p class="lead" style="max-width:820px">${esc(p.desc || DESC[p.cat] || '')}</p>`;
    return shell(`<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/shop?cat=${p.cat}">${esc(catOf(p.cat).name)}</a><span>/</span><span>${esc(p.name)}</span></nav>
      <section class="pdp">
        <div class="gallery">
          ${photos.length > 1 ? `<div class="thumbs">${photos.map((ph, i) => `<button class="thumb${i === pdp.photo ? ' on' : ''}" data-act="photo" data-i="${i}" aria-label="Show photo ${i + 1}"><img src="${IMG(ph)}" alt=""></button>`).join('')}</div>` : ''}
          <div class="main-photo"><img class="${pdp.anim ? 'swap' : ''}" src="${IMG(photos[pdp.photo])}" alt="${esc(p.name)}">
            ${p.best ? '<span class="badge b-amber tl">Best seller</span>' : ''}<span class="badge b-dark tr">${M ? '' : 'Hover to zoom · '}${pdp.photo + 1} / ${photos.length}</span>
            ${photos.length > 1 ? `<div class="ph-nav no-print"><button class="circ" data-act="photoStep" data-d="-1" aria-label="Previous photo">${ic('left')}</button><button class="circ" data-act="photoStep" data-d="1" aria-label="Next photo">${ic('right')}</button></div>` : ''}</div>
        </div>
        <div class="buy">
          <span class="sku">${esc(p.brand)} · SKU ${sku(p)}</span><h1>${esc(p.name)}</h1>
          <div class="pr"><span class="price big">${fmt(price)}</span><span class="muted">per ${esc(unitLabel(p, pdp.v))}</span></div>
          <div class="stockline"><span class="dotp ${s.dot}"></span><b class="${s.txt}">${s.label}</b><span class="muted">· ${p.qty > 0 ? p.qty.toLocaleString() + ' available' : 'restock expected'} · availability confirmed by the shop</span></div>
          <p class="lead">${esc((p.desc || DESC[p.cat] || '').split('. ')[0])}.</p>
          ${p.variants ? `<div class="opt"><span class="ol">Pack size</span><div class="pills">${p.variants.map((v, i) => `<button class="pill${i === pdp.v ? ' on' : ''}" data-act="variant" data-i="${i}">${esc(v[0])}<small>${fmt(v[1])}</small></button>`).join('')}</div></div>` : ''}
          <div class="opt"><span class="ol">Quantity</span><div class="qtyrow"><div class="stepper"><button data-act="pdpQty" data-d="-1" aria-label="Decrease quantity">−</button><span aria-live="polite">${pdp.qty}</span><button data-act="pdpQty" data-d="1" aria-label="Increase quantity">+</button></div>
            ${quick.map((n) => `<button class="chip${n === pdp.qty ? ' on' : ''}" data-act="pdpSet" data-n="${n}">${n.toLocaleString()}</button>`).join('')}</div></div>
          <div class="subtotal"><span class="muted">Subtotal (${pdp.qty.toLocaleString()} × ${esc(unitLabel(p, pdp.v))})</span><span class="price">${fmt(price * pdp.qty)}</span></div>
          <div class="buyrow">${p.qty <= 0 ? '<button class="btn btn-lg grow" disabled>Out of stock – ask the shop</button>' : `<button class="btn btn-primary btn-lg grow" data-act="pdpAdd" id="pdpAdd">${ic('cart')}<span>Add to cart</span></button>`}
            <button class="icon-btn fav${FAVS.has(p.id) ? ' on' : ''}" data-act="fav" data-id="${p.id}" aria-label="Save to favourites" aria-pressed="${FAVS.has(p.id)}">${ic('heart', 22)}</button></div>
          <a class="btn btn-outline btn-block" href="#/info/contact">${ic('wa')}Ask about this product on WhatsApp</a>
          <div class="mini-cards"><div>${ic('truck')}<span><b>Delivery in Mwanza</b>Fee confirmed by phone</span></div><div>${ic('home')}<span><b>Free pickup</b>Collect after confirmation</span></div></div>
        </div>
      </section>
      <section class="panel tabs-panel"><div class="tabs" role="tablist">${[['desc', 'Overview'], ['specs', 'Specifications'], ['delivery', 'Delivery & pickup']].map(([k, l]) => `<button class="tab${pdp.tab === k ? ' on' : ''}" role="tab" aria-selected="${pdp.tab === k}" data-act="tab" data-k="${k}">${l}</button>`).join('')}</div><div class="tab-body">${tabBody}</div></section>
      <section class="section"><div class="sec-head"><h2>Often bought together</h2></div><div class="pgrid">${related.map(pcard).join('')}</div></section></div>`);
  }

  /* cart + checkout */
  function vCart() {
    const lines = cartLines(); const sub = cartSub(); const del = CO.mode === 'delivery'; const err = CO.err || {};
    if (!lines.length) return shell(`<div class="wrap"><div class="page-title"><span class="kicker">Cart</span><h1>Your cart is empty</h1></div>
      <div class="empty">${ic('cart', 32)}<b>Nothing here yet</b><span>Browse the shop and add the materials you need.</span><a class="btn btn-primary" href="#/shop">Start shopping</a></div></div>`);
    return shell(`<div class="wrap"><div class="page-title"><span class="kicker">Checkout</span><h1>Cart &amp; checkout</h1></div>
      <div class="steps-bar"><span class="on">1 · Cart</span><span class="on">2 · Your details</span><span>3 · Submitted</span></div>
      <div class="cart-layout"><div class="cart-main">
        <section class="panel"><div class="sec-head" style="margin:0"><h2>Your cart</h2><span class="muted">${lines.reduce((s, l) => s + l.qty, 0).toLocaleString()} units</span></div>
          ${lines.map((l) => `<div class="line"><img src="${IMG(l.p.img)}" alt=""><div class="li"><small>${esc(catOf(l.p.cat).name)}</small><a href="#/product/${l.p.id}">${esc(l.p.name)}</a><span class="muted" style="font-size:13.5px">${fmt(unitPrice(l.p, l.v))} per ${esc(unitLabel(l.p, l.v))}</span></div>
            <div class="stepper sm"><button data-act="cartQty" data-k="${l.id}|${l.v}" data-d="-1" aria-label="Decrease">−</button><span>${l.qty}</span><button data-act="cartQty" data-k="${l.id}|${l.v}" data-d="1" aria-label="Increase">+</button></div>
            <span class="lt">${fmt(unitPrice(l.p, l.v) * l.qty)}</span><button class="icon-btn del" data-act="cartDel" data-k="${l.id}|${l.v}" aria-label="Remove ${esc(l.p.name)}">${ic('trash')}</button></div>`).join('')}
        </section>
        <form class="panel stack" data-form="checkout" novalidate><h2>Your details</h2>
          <div class="form-grid">
            <div class="field"><label for="coName">Full name</label><input class="input${err.name ? ' bad' : ''}" id="coName" data-co="name" value="${esc(CO.name)}" autocomplete="name">${err.name ? '<span class="err">Please enter your name.</span>' : ''}</div>
            <div class="field"><label for="coPhone">Phone number</label><div class="phone"><span class="cc">+255</span><input class="input${err.phone ? ' bad' : ''}" id="coPhone" type="tel" data-co="phone" value="${esc(CO.phone)}" placeholder="7XX XXX XXX" autocomplete="tel-national"></div>${err.phone ? '<span class="err">Enter a 9-digit phone number.</span>' : '<span class="hint">The shop will call or WhatsApp this number to confirm.</span>'}</div>
            <div class="field"><label for="coEmail">Email <small>(optional)</small></label><input class="input" id="coEmail" type="email" data-co="email" value="${esc(CO.email)}" placeholder="you@example.com" autocomplete="email"></div>
          </div>
          <div class="field"><span class="lbl">How do you want to receive it?</span><div class="seg">
            <button type="button" class="${del ? 'on' : ''}" data-act="coMode" data-m="delivery" aria-pressed="${del}">${ic('truck', 26)}<span><b>Delivery</b><small>Anywhere in Mwanza · fee confirmed by the shop</small></span></button>
            <button type="button" class="${del ? '' : 'on'}" data-act="coMode" data-m="pickup" aria-pressed="${!del}">${ic('home', 26)}<span><b>Pickup</b><small>Free · collect after confirmation</small></span></button></div></div>
          ${del ? `<div class="form-grid page">
            <div class="field"><label for="coArea">Area</label><select class="select" id="coArea" data-co="area">${['Ilemela – Buswelu', 'Ilemela – Kiseke', 'Nyamagana – Mkuyuni', 'Nyamagana – City centre', 'Nyamagana – Buhongwa', 'Other area in Mwanza'].map((a) => `<option${a === CO.area ? ' selected' : ''}>${a}</option>`).join('')}</select></div>
            <div class="field"><label for="coNotes">Delivery notes <small>(optional)</small></label><input class="input" id="coNotes" data-co="notes" value="${esc(CO.notes)}" placeholder="e.g. call on arrival, deliver before 2 pm"></div>
            <div class="field full"><label for="coAddr">Street, landmark or site description</label><textarea class="input${err.addr ? ' bad' : ''}" id="coAddr" rows="3" data-co="addr" placeholder="e.g. Near Buswelu market, blue gate">${esc(CO.addr)}</textarea>${err.addr ? '<span class="err">Tell us where to deliver.</span>' : ''}</div></div>` : ''}
          ${M ? summaryBox(sub, del, true) : ''}
        </form>
      </div>${M ? '' : `<aside class="cart-side">${summaryBox(sub, del)}</aside>`}</div></div>`);
  }
  function summaryBox(sub, del, inForm) {
    return `<div class="${inForm ? '' : 'panel '}stack"><h2>Order summary</h2>
      <div class="sumrow"><span class="muted">Items subtotal</span><b>${fmt(sub)}</b></div>
      <div class="sumrow"><span class="muted">${del ? 'Delivery fee' : 'Pickup'}</span><b>${del ? 'Confirmed by shop' : 'Free'}</b></div>
      <div class="sumtotal"><b>Estimated total</b><span class="price">${fmt(sub)}</span></div>
      <div class="note">${ic('info')}<span>No payment now. The shop rechecks prices and stock, then calls you with the final total. Pay on delivery or at pickup.</span></div>
      <button class="btn btn-primary btn-lg btn-block" ${inForm ? 'type="submit"' : 'data-act="submitOrder"'}>Submit order</button>
      <span class="muted" style="font-size:12.5px;text-align:center">By submitting you agree to the shop’s <a href="#/info/delivery" style="text-decoration:underline">delivery</a> and <a href="#/info/returns" style="text-decoration:underline">returns</a> policy.</span>
      <div class="ticks"><span>${ic('check')}No account needed</span><span>${ic('check')}Order reference shown instantly</span><span>${ic('check')}Shop confirms by phone or WhatsApp</span></div></div>`;
  }
  function submitOrder() {
    const err = {};
    if (!CO.name.trim()) err.name = 1;
    if (CO.phone.replace(/\D/g, '').length < 9) err.phone = 1;
    if (CO.mode === 'delivery' && !CO.addr.trim()) err.addr = 1;
    if (Object.keys(err).length) { CO.err = err; render(true); badToast('Please complete the highlighted details.'); const f = $('.input.bad'); if (f) f.focus(); return; }
    delete CO.err;
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const pick = () => A[Math.floor(Math.random() * A.length)];
    const ref = 'FPA-' + pick() + pick() + pick() + pick() + '-' + String(Math.floor(1000 + Math.random() * 9000));
    const extra = cartLines().reduce((s, l) => s + (unitPrice(l.p, l.v) - l.p.price) * l.qty, 0);
    ORDERS.unshift({ ref, name: CO.name.trim(), phone: '+255 ' + CO.phone.trim(), mode: CO.mode, area: CO.mode === 'delivery' ? CO.area : '', note: CO.mode === 'delivery' ? [CO.addr, CO.notes].filter(Boolean).join(' · ') : '', email: CO.email, items: CART.map((l) => [l.id, l.qty]), extra, status: 'Pending', time: now(), date: 'Today', fee: 0, fresh: true, log: [[now(), 'Order submitted online']] });
    CART = []; save(); go('#/order/' + ref);
  }
  function vOrder(ref) {
    const o = ORDERS.find((x) => x.ref === ref);
    if (!o) return shell(`<div class="wrap"><div class="empty" style="margin-top:40px"><b>Order not found</b><a class="btn btn-primary" href="#/">Back to the shop</a></div></div>`);
    const flow = ['Pending', 'Confirmed', o.mode === 'pickup' ? 'Ready for delivery' : 'Out for delivery', 'Delivered'];
    const labels = ['Pending', 'Confirmed', o.mode === 'pickup' ? 'Ready for pickup' : 'Out for delivery', o.mode === 'pickup' ? 'Collected' : 'Delivered'];
    const order = ['Pending', 'Confirmed', 'Preparing', 'Ready for delivery', 'Out for delivery', 'Delivered'];
    const at = order.indexOf(o.status);
    const rejected = o.status === 'Rejected' || o.status === 'Cancelled';
    return shell(`<div class="done-wrap">
      <div class="ring">${rejected ? `<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>` : `<svg class="i" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`}</div>
      <div class="rise1" style="text-align:center;display:flex;flex-direction:column;gap:8px"><h1 style="font-size:${M ? 30 : 40}px">${rejected ? 'Order not accepted' : o.status === 'Pending' ? 'Order received' : 'Order ' + o.status.toLowerCase()}</h1>
        <p class="muted" style="font-size:17px">${rejected ? esc(o.reason || 'The shop could not accept this order.') : o.status === 'Pending' ? `Your order is <b style="color:#16191C">awaiting shop confirmation</b>. We will call ${esc(o.phone)} shortly to confirm stock, delivery fee and your final total.` : 'The shop has updated your order. You will get a call before delivery.'}</p></div>
      <div class="refcard rise2"><span style="display:flex;flex-direction:column"><small>ORDER REFERENCE</small><span class="ref">${esc(o.ref)}</span></span><span style="display:flex;flex-direction:column;text-align:right"><span style="font-size:13px;color:#C9CED4">Estimated total</span><span class="price" style="font-size:24px">${fmt(orderTotal(o))}</span></span></div>
      ${rejected ? '' : `<div class="panel rise3"><div class="timeline">${flow.map((s, i) => { const idx = order.indexOf(s); return `<div class="${at > idx ? 'ok' : at === idx || (s === 'Out for delivery' && at === 3) ? 'on' : ''}"><i></i><b>${labels[i]}</b><small>${['Shop reviews your order', 'We call with the final total', o.mode === 'pickup' ? 'Collect at the shop' : 'On the way to ' + esc(o.area || 'you'), 'Pay on delivery or at pickup'][i]}</small></div>`; }).join('')}</div></div>`}
      <div class="panel stack"><h2 style="font-size:18px">Items</h2>${orderItems(o).map((x) => `<div class="ritem"><img src="${IMG(x.p.img)}" alt=""><span><b>${x.q.toLocaleString()} × ${esc(x.p.name)}</b></span><b>${fmt(x.p.price * x.q)}</b></div>`).join('')}</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center"><a class="btn btn-outline" href="#/info/contact">${ic('wa')}Message the shop</a><a class="btn btn-primary" href="#/">Continue shopping</a></div>
      <p class="muted no-print" style="text-align:center;font-size:13px">Prototype tip: sign in to the <a href="#/admin/orders?ref=${o.ref}" style="text-decoration:underline">admin dashboard</a> to confirm this order, then come back to see the status change.</p></div>`);
  }

  /* materials list */
  let matSent = null;
  function vMaterials() {
    if (matSent) {
      const ref = matSent;
      return shell(`<div class="done-wrap"><div class="ring"><svg class="i" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>
        <div class="rise1" style="text-align:center;display:flex;flex-direction:column;gap:8px"><h1 style="font-size:${M ? 30 : 40}px">List received</h1><p class="muted" style="font-size:17px">Thank you. The shop will check stock and call you with one confirmed quote. Your reference is <b style="color:#16191C">${ref}</b>.</p></div>
        <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center"><button class="btn btn-outline" data-act="matAgain">Send another list</button><a class="btn btn-primary" href="#/shop">Browse products</a></div></div>`);
    }
    return shell(`<div class="wrap"><nav class="crumbs"><a href="#/">Home</a><span>/</span><span>Contractor orders</span></nav>
      <div class="cat-hero"><img src="${IMG('bricks-worker')}" alt=""><div><span class="kicker light">Contractors &amp; retailers</span><h1>Send your materials list</h1><p>One list, one confirmed quote. We check stock, suggest substitutes and call you back.</p></div></div>
      <div class="cart-layout"><form class="cart-main panel stack" data-form="materials" novalidate><h2>Your list</h2>
        <div class="field"><label for="mList">Materials and quantities</label><textarea class="input" id="mList" name="list" rows="8" placeholder="e.g.&#10;Portland Cement 42.5R – 120 bags&#10;Y12 steel bars – 60 pieces&#10;Roofing sheets, charcoal – 45 sheets"></textarea></div>
        <label class="dropzone" for="mFile">${ic('upload', 28)}<b>Or upload a photo / PDF of your list</b><span id="mFileName">Click to choose a file (not sent anywhere in this prototype)</span><input id="mFile" type="file" class="sr" data-act="file"></label>
        <div class="form-grid"><div class="field"><label for="mName">Name or company</label><input class="input" id="mName" name="name" placeholder="e.g. Juma Construction Ltd"></div>
          <div class="field"><label for="mPhone">Phone number</label><div class="phone"><span class="cc">+255</span><input class="input" id="mPhone" name="phone" type="tel" placeholder="7XX XXX XXX"></div></div>
          <div class="field"><label for="mSite">Site location</label><input class="input" id="mSite" name="site" placeholder="Area and landmark"></div>
          <div class="field"><label for="mWhen">Needed by</label><select class="select" id="mWhen" name="when"><option>As soon as possible</option><option>This week</option><option>Next week</option><option>Not sure yet</option></select></div></div>
        <div class="merr" id="matErr" role="alert"></div>
        <button class="btn btn-primary btn-lg" type="submit">Send list to the shop</button></form>
        <aside class="cart-side panel stack"><h2>What happens next</h2>
          <div class="ticks" style="border:0;padding:0"><span>${ic('check')}We check stock for every line</span><span>${ic('check')}We suggest substitutes if something is out</span><span>${ic('check')}You get one total including delivery</span><span>${ic('check')}Nothing is charged until you agree</span></div>
          <div class="note green">${ic('phone')}<span>Prefer to talk? Call or WhatsApp <b>[PHONE NUMBER]</b>.</span></div></aside></div></div>`);
  }

  /* info pages */
  const INFO = {
    how: ['How ordering works', `<p>Finishers Point Africa lets you order hardware and building materials online without paying online.</p>
      <h2>1. Add items to your cart</h2><p>Browse by category or search. Prices are in TSh and shown per unit (bag, tin, m², piece…).</p>
      <h2>2. Submit your order</h2><p>Give your name, phone number and delivery or pickup details. You get an order reference straight away.</p>
      <h2>3. The shop confirms</h2><p>We check stock and the delivery fee, then call or WhatsApp you with the final total. Nothing is reserved until we confirm.</p>
      <h2>4. Delivery or pickup</h2><p>Pay on delivery or at the shop using the methods the shop accepts.</p>`],
    delivery: ['Delivery policy', `<p>We deliver across Mwanza. The delivery fee depends on location and load and is confirmed by phone before dispatch.</p>
      <ul><li>Areas served: [CONFIRM AREAS]</li><li>Typical delivery time: [CONFIRM TIMES]</li><li>Large orders go by truck; someone must be on site to receive them.</li><li>Pickup from the shop is free once your order is confirmed.</li></ul>`],
    returns: ['Returns & cancellations', `<p>You can cancel an order free of charge until it is out for delivery. Call the shop with your order reference.</p>
      <ul><li>Unopened items: returnable within [CONFIRM] days with proof of purchase.</li><li>Cement and mixed paint cannot be returned once delivered.</li><li>Damaged on delivery: tell the driver and the shop the same day.</li></ul><p class="muted">Final policy to be confirmed by the shop.</p>`],
    privacy: ['Privacy', `<p>We only collect what we need to process your order: your name, phone number, optional email and delivery details.</p>
      <ul><li>Your details are only seen by shop staff.</li><li>We use your number to confirm and deliver your order.</li><li>No card details are collected; there is no online payment.</li></ul><p class="muted">Full privacy notice to be confirmed by the shop.</p>`],
    contact: ['Contact us', `<div class="contact-cards"><a href="#/info/contact">${ic('phone')}<b>Call</b><span>[PHONE NUMBER]</span></a><a href="#/info/contact">${ic('wa')}<b>WhatsApp</b><span>[WHATSAPP NUMBER]</span></a><div>${ic('pin')}<b>Visit the shop</b><span>[SHOP ADDRESS], Mwanza, Tanzania</span></div><div>${ic('clock')}<b>Opening hours</b><span>Mon–Sat, [OPENING HOURS]</span></div></div>
      <h2>Send us a message</h2><form class="stack" data-form="contact" novalidate><div class="form-grid"><div class="field"><label for="cName">Name</label><input class="input" id="cName" name="name"></div><div class="field"><label for="cPhone">Phone</label><input class="input" id="cPhone" name="phone" type="tel" placeholder="+255 7XX XXX XXX"></div><div class="field full"><label for="cMsg">Message</label><textarea class="input" id="cMsg" name="msg" rows="4"></textarea></div></div><div><button class="btn btn-primary" type="submit">Send message</button></div></form>`]
  };
  function vInfo(slug) {
    const page = INFO[slug] || INFO.how;
    return shell(`<div class="wrap"><nav class="crumbs"><a href="#/">Home</a><span>/</span><span>${page[0]}</span></nav><div class="page-title"><span class="kicker">Help</span><h1>${page[0]}</h1></div>
      <div class="info-layout"><nav class="info-nav" aria-label="Help pages">${Object.keys(INFO).map((k) => `<a href="#/info/${k}" class="${k === (INFO[slug] ? slug : 'how') ? 'on' : ''}">${INFO[k][0]}</a>`).join('')}</nav><div class="info-main panel"><div class="prose">${page[1]}</div></div></div></div>`);
  }
  const vNotFound = () => shell(`<div class="wrap"><div class="empty" style="margin-top:40px">${ic('search', 32)}<b>Page not found</b><a class="btn btn-primary" href="#/">Back to the shop</a></div></div>`);

  /* ---------------- admin ---------------- */
  const ADMIN_NAV = [['dashboard', 'Dashboard', 'grid'], ['orders', 'Orders', 'receipt'], ['products', 'Products', 'box'], ['categories', 'Categories', 'tag'], ['inventory', 'Inventory', 'stock'], ['deliveries', 'Deliveries', 'truck'], ['sales', 'Sales & payments', 'cash'], ['reports', 'Reports', 'chart'], ['users', 'Admin users', 'users']];
  const aS = { filter: 'All', sel: null, psearch: '', range: '7d' };
  function vLogin() {
    return `<div class="login"><div class="pic"><img src="${IMG('store-shelves')}" alt=""><div><span class="kicker light">Staff dashboard</span><h2>Manage orders, stock and sales in one place.</h2><p style="color:#D9DDE1">Finishers Point Africa · Mwanza</p></div></div>
      <div class="form"><form data-form="login" novalidate><a href="#/" class="logo"><span class="logo-mark">F</span><span class="logo-text"><b>FINISHERS POINT</b><span>AFRICA</span></span></a>
        <div><h1 style="font-size:30px">Sign in</h1><p class="muted">Each staff member has their own account.</p></div>
        <div class="field"><label for="lEmail">Email</label><input class="input" id="lEmail" type="email" autocomplete="off" placeholder="name@shop-domain"></div>
        <div class="field"><label for="lPass">Password</label><input class="input" id="lPass" type="password" autocomplete="off"></div>
        <button class="btn btn-primary btn-lg" type="submit">Sign in</button>
        <p class="muted" style="font-size:13px">Prototype: no real sign-in. Leave the fields empty and press Sign in.</p>
        <a class="nl" href="#/">← Back to the store</a></form></div></div>`;
  }
  function vAdmin(sec, q) {
    if (!ADMIN_NAV.find((n) => n[0] === sec)) sec = 'dashboard';
    const pending = ORDERS.filter((o) => o.status === 'Pending').length;
    const low = PRODUCTS.filter((p) => p.qty <= p.low).length;
    const counts = { orders: pending, inventory: low };
    const title = ADMIN_NAV.find((n) => n[0] === sec)[1];
    const body = { dashboard: aDash, orders: aOrders, products: aProducts, categories: aCats, inventory: aInventory, deliveries: aDeliveries, sales: aSales, reports: aReports, users: aUsers }[sec](q);
    return `<div class="admin"><aside class="side no-print"><a href="#/admin" class="logo"><span class="logo-mark">F</span><span class="logo-text"><b>FINISHERS POINT</b><span>ADMIN</span></span></a>
      ${ADMIN_NAV.map(([k, l, i]) => `<a href="#/admin/${k}" class="navi${k === sec ? ' on' : ''}">${ic(i, 18)}<span class="grow">${l}</span>${counts[k] ? `<span class="count">${counts[k]}</span>` : ''}</a>`).join('')}
      <div class="side-foot"><span class="avatar">AJ</span><span><b>Asha J.</b><small>Administrator</small></span></div></aside>
      <main class="amain"><div class="atop"><div><h1>${title}</h1><span class="live">Live · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · sample data</span></div>
        <div class="atop-r no-print"><a class="btn btn-outline btn-sm" href="#/" target="_blank" rel="noopener">${ic('ext', 18)}View store</a><button class="btn btn-outline btn-sm" data-act="print">${ic('print', 18)}PDF</button><button class="btn btn-outline btn-sm" data-act="resetDemo">${ic('refresh', 18)}Reset demo data</button><button class="btn btn-outline btn-sm" data-act="logout">${ic('logout', 18)}Sign out</button></div></div>
        <div class="page stack" style="gap:20px">${body}</div></main></div>`;
  }
  const kpi = (label, val, note, cls, href) => `<${href ? `a href="${href}"` : 'div'} class="kpi"><span>${label}</span><b>${val}</b><small class="${cls || ''}">${note}</small></${href ? 'a' : 'div'}>`;
  const SALES = { '7d': [['Tue', 1.2], ['Wed', 2.4], ['Thu', 1.8], ['Fri', 3.1], ['Sat', 3.9], ['Sun', 0.6], ['Mon', 2.2]], '30d': [['Wk 1', 9.8], ['Wk 2', 12.4], ['Wk 3', 11.1], ['Wk 4', 15.2]], '12m': [['Nov', 31], ['Dec', 42], ['Jan', 28], ['Feb', 30], ['Mar', 35], ['Apr', 33], ['May', 38], ['Jun', 41], ['Jul', 44], ['Aug', 47], ['Sep', 45], ['Oct', 52]] };
  const bars = (data) => { const max = Math.max(...data.map((d) => d[1])); return `<div class="bars">${data.map(([l, v], i) => `<div class="bar"><b>${v}M</b><i style="height:${Math.round(v / max * 170)}px;animation-delay:${i * 50}ms"></i><small>${l}</small></div>`).join('')}</div>`; };
  const orderRow = (o, sel) => `<tr class="click${sel ? ' sel' : ''}" data-act="aSel" data-ref="${o.ref}" tabindex="0"><td class="refc">${o.ref}${o.fresh ? ' <span class="badge b-blue">New</span>' : ''}</td><td><b>${esc(o.name)}</b><span class="sub">${esc(o.phone)}</span></td><td>${o.items.length} items · ${o.items.reduce((s, i) => s + i[1], 0).toLocaleString()} units</td><td>${o.mode === 'pickup' ? 'Pickup' : 'Delivery · ' + esc(o.area.split(' – ')[0])}</td><td class="r nw"><b>${fmt(orderTotal(o))}</b></td><td class="nw">${badge(o.status)}</td><td class="muted nw">${esc(o.time)}</td></tr>`;
  const ORDER_HEAD = '<thead><tr><th>Reference</th><th>Customer</th><th>Items</th><th>Receive</th><th class="r">Est. total</th><th>Status</th><th>Submitted</th></tr></thead>';

  function aDash() {
    const pending = ORDERS.filter((o) => o.status === 'Pending');
    const low = PRODUCTS.filter((p) => p.qty <= p.low);
    const week = PAYMENTS.reduce((s, p) => s + p.amount, 0);
    const out = ORDERS.filter((o) => o.status === 'Out for delivery').length;
    return `<div class="kpis">${kpi('Pending review', pending.length, pending.length ? 'Waiting for confirmation →' : 'All caught up', pending.length ? 'warn' : '', '#/admin/orders')}${kpi('Out for delivery', out, 'View deliveries →', '', '#/admin/deliveries')}${kpi('Payments recorded', short(week), 'Manual records, last 7 days', '', '#/admin/sales')}${kpi('Low-stock products', low.length, 'Check inventory →', low.length ? 'bad' : '', '#/admin/inventory')}</div>
      <div class="grid2"><div class="box"><div class="box-head"><h2>Sales, last 7 days</h2><a class="nl" href="#/admin/reports">Reports →</a></div>${bars(SALES['7d'])}</div>
        <div class="box"><div class="box-head"><h2>Low stock</h2><a class="nl" href="#/admin/inventory">Inventory →</a></div><div class="hbars">${low.length ? low.map((p) => `<div class="hbar"><div><span class="prodcell"><img src="${IMG(p.img)}" alt="" style="width:32px;height:32px;border-radius:8px">${esc(p.name)}</span><b class="${p.qty ? 't-amber' : 't-grey'}">${p.qty} left</b></div><i><i style="width:${Math.min(100, Math.round(p.qty / Math.max(1, p.low) * 100))}%;background:${p.qty ? '#F2A900' : '#9AA1A8'}"></i></i></div>`).join('') : '<p class="muted">Nothing is low on stock.</p>'}</div></div></div>
      <div class="box"><div class="box-head"><h2>Latest orders</h2><a class="nl" href="#/admin/orders">All orders →</a></div><div class="tscroll"><table>${ORDER_HEAD}<tbody>${ORDERS.slice(0, 5).map((o) => orderRow(o)).join('')}</tbody></table></div></div>`;
  }
  function aOrders(q) {
    if (q.ref && ORDERS.find((o) => o.ref === q.ref) && aS.sel !== q.ref && !aS.selFromQuery) { aS.sel = q.ref; aS.filter = 'All'; aS.selFromQuery = true; }
    const tabs = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready for delivery', 'Out for delivery', 'Delivered', 'Rejected'];
    const list = ORDERS.filter((o) => aS.filter === 'All' || o.status === aS.filter);
    if (!aS.sel || !ORDERS.find((o) => o.ref === aS.sel)) aS.sel = (list[0] || ORDERS[0]).ref;
    const o = ORDERS.find((x) => x.ref === aS.sel);
    return `<div class="split"><div class="box"><div class="box-head"><div class="ftabs">${tabs.map((t) => `<button class="ftab${aS.filter === t ? ' on' : ''}" data-act="aFilter" data-f="${t}">${t}<em>${t === 'All' ? ORDERS.length : ORDERS.filter((x) => x.status === t).length}</em></button>`).join('')}</div></div>
      <div class="tscroll"><table style="min-width:880px">${ORDER_HEAD}<tbody>${list.length ? list.map((x) => orderRow(x, x.ref === aS.sel)).join('') : '<tr><td colspan="7" class="muted" style="text-align:center;padding:30px">No orders with this status.</td></tr>'}</tbody></table></div>
      <div class="box-foot"><span>Showing ${list.length} of ${ORDERS.length} orders</span><button class="btn btn-outline btn-sm" data-act="csv">${ic('download', 18)}Export CSV</button></div></div>
      ${reviewPanel(o)}</div>`;
  }
  function reviewPanel(o) {
    const items = orderItems(o);
    const actions = o.status === 'Pending'
      ? `<div class="field"><label for="fee">Delivery fee (TSh)</label><input class="input" id="fee" type="number" min="0" step="1000" value="${o.fee || 0}" data-act-input="fee" ${o.mode === 'pickup' ? 'disabled' : ''}></div>
         <div style="display:flex;gap:10px"><button class="btn btn-danger grow" data-act="aReject">Reject…</button><button class="btn btn-primary" style="flex:2" data-act="aConfirm">Confirm &amp; reserve stock</button></div>
         <span class="muted" style="font-size:12.5px">Confirming deducts stock and records Asha J. as the approver. The customer is then called with the final total.</span>`
      : NEXT[o.status] || (o.mode === 'pickup' && o.status === 'Ready for delivery')
        ? `<button class="btn btn-primary btn-block" data-act="aNext">${nextLabel(o)}</button>`
        : o.status === 'Delivered'
          ? (paidFor(o.ref) >= orderTotal(o) ? '<div class="note green">' + ic('check') + '<span>Delivered and fully paid.</span></div>' : `<button class="btn btn-primary btn-block" data-act="aPay" data-ref="${o.ref}">${ic('cash')}Record payment</button>`)
          : `<div class="note">${ic('info')}<span>${esc(o.reason || 'This order was not accepted.')}</span></div>`;
    return `<aside class="review" aria-label="Order review" id="review"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><span class="muted" style="font-size:12px;font-weight:700;letter-spacing:.06em">REVIEW ORDER</span><h2>${o.ref}</h2></div>${badge(o.status)}</div>
      <div class="cust"><b>${esc(o.name)}</b><span>${esc(o.phone)}</span><span>${o.mode === 'pickup' ? 'Pickup at the shop' : 'Delivery · ' + esc(o.area)}</span>${o.note ? `<span class="muted" style="font-size:13px">“${esc(o.note)}”</span>` : ''}
        <div style="display:flex;gap:8px;margin-top:6px"><button class="btn btn-outline btn-sm" data-act="noop" data-msg="In the live system this opens the phone dialler.">${ic('phone', 16)}Call</button><button class="btn btn-outline btn-sm" data-act="noop" data-msg="In the live system this opens WhatsApp with the order reference.">${ic('wa', 16)}WhatsApp</button></div></div>
      <div>${items.map((x) => { const enough = x.p.qty >= x.q; return `<div class="ritem"><img src="${IMG(x.p.img)}" alt=""><span><b>${x.q.toLocaleString()} × ${esc(x.p.name)}</b><small class="${o.status !== 'Pending' ? 'muted' : enough ? (x.p.qty - x.q <= x.p.low ? 't-amber' : 't-green') : 't-amber'}">${o.status !== 'Pending' ? fmt(x.p.price) + ' each' : enough ? 'In stock · ' + x.p.qty.toLocaleString() + ' available' : 'Not enough stock · only ' + x.p.qty + ' available'}</small></span><b class="nw">${fmt(x.p.price * x.q)}</b></div>`; }).join('')}</div>
      <div class="stack" style="gap:6px;font-size:14px"><div class="sumrow"><span class="muted">Items</span><span>${fmt(orderSub(o))}</span></div><div class="sumrow"><span class="muted">Delivery</span><span id="feeOut">${o.mode === 'pickup' ? 'Pickup' : fmt(o.fee || 0)}</span></div>
        <div class="sumtotal"><b>${o.status === 'Pending' ? 'Total to confirm' : 'Order total'}</b><span class="price" id="totOut" style="font-size:22px">${fmt(orderTotal(o))}</span></div>${paidFor(o.ref) ? `<div class="sumrow"><span class="muted">Paid</span><span class="t-green"><b>${fmt(paidFor(o.ref))}</b></span></div>` : ''}</div>
      ${actions}
      <div><span class="muted" style="font-size:12px;font-weight:700;letter-spacing:.06em">HISTORY</span><div class="log" style="margin-top:8px">${o.log.slice().reverse().map(([t, s]) => `<div><i></i><span><b>${esc(t)}</b> · ${esc(s)}</span></div>`).join('')}</div></div></aside>`;
  }
  function confirmOrder() {
    const o = ORDERS.find((x) => x.ref === aS.sel);
    const short = orderItems(o).filter((x) => x.p.qty < x.q);
    if (short.length) { badToast(`Not enough stock for ${short.map((x) => esc(x.p.name)).join(', ')}. Call the customer to change the order.`); return; }
    orderItems(o).forEach((x) => { x.p.qty -= x.q; MOVES.unshift({ t: 'Today ' + now(), pid: x.p.id, type: 'Order reserved', delta: -x.q, note: o.ref, by: 'Asha J.' }); });
    o.status = 'Confirmed'; o.fresh = false; o.log.push([now(), 'Confirmed by Asha J. · stock reserved']);
    save(); render(true); okToast(`${o.ref} confirmed. Stock reserved for ${o.items.length} items.`);
  }
  function rejectOrder() {
    const o = ORDERS.find((x) => x.ref === aS.sel);
    openModal('Reject ' + o.ref, `<div class="field"><label for="rr">Reason</label><select class="select" id="rr" name="reason"><option>Out of stock</option><option>Delivery area not served</option><option>Customer could not be reached</option><option>Duplicate order</option><option>Other</option></select></div>
      <div class="field"><label for="rn">Note for the customer <small>(optional)</small></label><textarea class="input" id="rn" name="note" rows="3"></textarea></div>`, 'Reject order', (d) => {
      o.status = 'Rejected'; o.fresh = false; o.reason = d.reason + (d.note ? ': ' + d.note : '.'); o.log.push([now(), 'Rejected by Asha J. · ' + d.reason]);
      save(); setTimeout(() => { render(true); okToast(o.ref + ' rejected. No stock was reserved.'); });
    });
  }
  function aProducts() {
    return `<div class="box"><div class="box-head"><div class="search" style="max-width:360px;height:42px">${ic('search')}<label class="sr" for="ps">Search products</label><input id="ps" data-act-input="psearch" placeholder="Search name, brand or SKU" value="${esc(aS.psearch)}"></div><button class="btn btn-primary btn-sm" data-act="prodEdit">${ic('plus', 18)}Add product</button></div>
      <div class="tscroll"><table style="min-width:860px"><thead><tr><th>Product</th><th>Category</th><th class="r">Price</th><th class="r">Stock</th><th>Status</th><th>Published</th><th></th></tr></thead><tbody id="prodBody">${prodRows()}</tbody></table></div>
      <div class="box-foot"><span>${PRODUCTS.length} products</span><span>Products used by past orders are archived, not deleted.</span></div></div>`;
  }
  function prodRows() {
    const t = aS.psearch.toLowerCase();
    return PRODUCTS.filter((p) => !t || (p.name + ' ' + p.brand + ' ' + sku(p)).toLowerCase().includes(t)).map((p) => { const s = stockOf(p); return `<tr><td><span class="prodcell"><img src="${IMG(p.img)}" alt=""><span><b>${esc(p.name)}</b><span class="sub">${esc(p.brand)} · ${sku(p)}</span></span></span></td><td>${esc(catOf(p.cat).name)}</td><td class="r nw"><b>${fmt(p.price)}</b><span class="sub">per ${esc(p.unit)}</span></td><td class="r">${p.qty.toLocaleString()}</td><td>${`<span class="badge ${s.cls}">${s.label}</span>`}</td>
      <td><button class="switch${p.published === false ? '' : ' on'}" data-act="publish" data-id="${p.id}" role="switch" aria-checked="${p.published !== false}" aria-label="Published on the store"></button></td><td class="r"><button class="btn btn-outline btn-sm" data-act="prodEdit" data-id="${p.id}">${ic('edit', 16)}Edit</button></td></tr>`; }).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:30px">No products match.</td></tr>';
  }
  const IMAGES = ['cement-stack', 'cement-sack', 'cement-bags', 'bricks-worker', 'paint-open', 'paint-shelves', 'paint-rollers', 'tiles-marble', 'tiles-grid', 'bulb', 'pendant', 'wires-bundle', 'wires-switch', 'pipe-white', 'pipes-wall', 'tools-hammer', 'tools-rack', 'roof', 'store-shelves', 'cat-cement', 'cat-paint', 'cat-tiles', 'cat-electrical', 'cat-lighting', 'cat-plumbing', 'cat-tools', 'cat-roofing'];
  function editProduct(id) {
    const p = id ? byId(id) : { name: '', brand: '', cat: CATS[0].slug, unit: 'piece', price: '', qty: 0, low: 5, img: 'store-shelves' };
    openModal(id ? 'Edit product' : 'Add product', `<div class="form-grid"><div class="field full"><label for="pn">Product name</label><input class="input" id="pn" name="name" value="${esc(p.name)}"></div>
      <div class="field"><label for="pb">Brand</label><input class="input" id="pb" name="brand" value="${esc(p.brand)}"></div>
      <div class="field"><label for="pc">Category</label><select class="select" id="pc" name="cat">${CATS.map((c) => `<option value="${c.slug}"${c.slug === p.cat ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="pp">Price (TSh)</label><input class="input" id="pp" name="price" type="number" min="0" value="${p.price}"></div>
      <div class="field"><label for="pu">Unit</label><select class="select" id="pu" name="unit">${['piece', 'bag', '50 kg bag', 'tin', 'm²', 'metre', 'roll', 'box', 'litre', 'kilogram', 'sheet', 'set', 'kit', 'length'].map((u) => `<option${u === p.unit ? ' selected' : ''}>${u}</option>`).join('')}</select></div>
      <div class="field"><label for="pq">${id ? 'Stock on hand' : 'Opening stock'}</label><input class="input" id="pq" name="qty" type="number" min="0" value="${p.qty}" ${id ? 'disabled' : ''}>${id ? '<span class="hint">Change stock from Inventory so it is logged.</span>' : ''}</div>
      <div class="field"><label for="pl">Low-stock alert at</label><input class="input" id="pl" name="low" type="number" min="0" value="${p.low}"></div>
      <div class="field full"><label for="pi">Photo</label><select class="select" id="pi" name="img">${IMAGES.map((i) => `<option${i === p.img ? ' selected' : ''}>${i}</option>`).join('')}</select></div></div>`, id ? 'Save changes' : 'Add product', (d) => {
      if (!d.name.trim()) return 'Enter a product name.';
      if (!(+d.price > 0)) return 'Enter a price above zero.';
      if (id) Object.assign(p, { name: d.name.trim(), brand: d.brand.trim() || 'Generic', cat: d.cat, price: +d.price, unit: d.unit, low: +d.low || 0, img: d.img, photos: [d.img].concat((p.photos || []).filter((x) => x !== d.img)) });
      else { const np = { id: Math.max(...PRODUCTS.map((x) => x.id)) + 1, name: d.name.trim(), brand: d.brand.trim() || 'Generic', cat: d.cat, price: +d.price, unit: d.unit, qty: +d.qty || 0, low: +d.low || 0, img: d.img, photos: [d.img] }; PRODUCTS.push(np); if (np.qty) MOVES.unshift({ t: 'Today ' + now(), pid: np.id, type: 'Opening stock', delta: np.qty, note: 'New product', by: 'Asha J.' }); }
      save(); setTimeout(() => { render(true); okToast(id ? 'Product updated.' : 'Product added and published on the store.'); });
    });
  }
  function aCats() {
    return `<div style="display:flex;justify-content:flex-end"><button class="btn btn-primary btn-sm" data-act="catEdit">${ic('plus', 18)}Add category</button></div>
      <div class="cat-cards">${CATS.map((c) => `<div class="ccard lift"><img src="${IMG(c.img)}" alt=""><div><span><b>${esc(c.name)}</b><span class="sub muted" style="display:block;font-size:13px">${PRODUCTS.filter((p) => p.cat === c.slug).length} products · <a href="#/shop?cat=${c.slug}" target="_blank" rel="noopener" style="text-decoration:underline">view</a></span></span><button class="btn btn-outline btn-sm" data-act="catEdit" data-slug="${c.slug}">${ic('edit', 16)}Edit</button></div></div>`).join('')}</div>`;
  }
  function editCat(slug) {
    const c = slug ? CATS.find((x) => x.slug === slug) : { name: '', blurb: '', img: 'store-shelves' };
    openModal(slug ? 'Edit category' : 'Add category', `<div class="field"><label for="cn">Name</label><input class="input" id="cn" name="name" value="${esc(c.name)}"></div>
      <div class="field"><label for="cb">Short description</label><input class="input" id="cb" name="blurb" value="${esc(c.blurb)}"></div>
      <div class="field"><label for="ci">Photo</label><select class="select" id="ci" name="img">${IMAGES.map((i) => `<option${i === c.img ? ' selected' : ''}>${i}</option>`).join('')}</select></div>`, slug ? 'Save' : 'Add category', (d) => {
      if (!d.name.trim()) return 'Enter a category name.';
      if (slug) Object.assign(c, { name: d.name.trim(), blurb: d.blurb, img: d.img });
      else { const s = d.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); if (CATS.find((x) => x.slug === s)) return 'A category with this name already exists.'; CATS.push({ slug: s, name: d.name.trim(), blurb: d.blurb, img: d.img }); }
      save(); setTimeout(() => { render(true); okToast('Category saved.'); });
    });
  }
  function aInventory() {
    const low = PRODUCTS.filter((p) => p.qty > 0 && p.qty <= p.low).length, out = PRODUCTS.filter((p) => p.qty <= 0).length;
    return `<div class="kpis">${kpi('Products tracked', PRODUCTS.length, 'All active SKUs')}${kpi('Low stock', low, 'At or below alert level', low ? 'warn' : '')}${kpi('Out of stock', out, 'Hidden from ordering', out ? 'bad' : '')}${kpi('Movements logged', MOVES.length, 'Every change is recorded')}</div>
      <div class="box"><div class="box-head"><h2>Stock levels</h2><span class="muted" style="font-size:13px">Stock can never go below zero.</span></div><div class="tscroll"><table style="min-width:760px"><thead><tr><th>Product</th><th class="r">On hand</th><th class="r">Alert at</th><th>Status</th><th></th></tr></thead><tbody>
      ${PRODUCTS.slice().sort((a, b) => a.qty / Math.max(1, a.low) - b.qty / Math.max(1, b.low)).map((p) => { const s = stockOf(p); return `<tr><td><span class="prodcell"><img src="${IMG(p.img)}" alt=""><span><b>${esc(p.name)}</b><span class="sub">${sku(p)} · per ${esc(p.unit)}</span></span></span></td><td class="r"><b>${p.qty.toLocaleString()}</b></td><td class="r muted">${p.low}</td><td><span class="badge ${s.cls}">${s.label}</span></td><td class="r"><button class="btn btn-outline btn-sm" data-act="adjust" data-id="${p.id}">Adjust stock</button></td></tr>`; }).join('')}</tbody></table></div></div>
      <div class="box"><div class="box-head"><h2>Stock movements</h2></div><div class="tscroll"><table style="min-width:760px"><thead><tr><th>When</th><th>Product</th><th>Type</th><th class="r">Change</th><th>Reason / reference</th><th>By</th></tr></thead><tbody>
      ${MOVES.slice(0, 12).map((m) => { const p = byId(m.pid); return `<tr><td class="nw muted">${esc(m.t)}</td><td>${p ? esc(p.name) : '—'}</td><td>${esc(m.type)}</td><td class="r"><b class="${m.delta > 0 ? 't-green' : 't-amber'}">${m.delta > 0 ? '+' : ''}${m.delta.toLocaleString()}</b></td><td>${esc(m.note)}</td><td class="muted">${esc(m.by)}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  }
  function adjustStock(id) {
    const p = byId(id);
    openModal('Adjust stock · ' + esc(p.name), `<p class="muted">On hand now: <b style="color:#16191C">${p.qty.toLocaleString()} ${esc(p.unit)}</b></p>
      <div class="field"><label for="at">Type</label><select class="select" id="at" name="type"><option value="in">Stock in (supplier delivery)</option><option value="out">Damaged / lost</option><option value="count">Correction after stock count</option></select></div>
      <div class="field"><label for="aq">Quantity</label><input class="input" id="aq" name="qty" type="number" min="0" step="1"><span class="hint">For a stock count, enter the new total you counted.</span></div>
      <div class="field"><label for="an">Reason or reference</label><input class="input" id="an" name="note" placeholder="e.g. Delivery note #, supplier name"></div>`, 'Save movement', (d) => {
      const q = Math.floor(+d.qty);
      if (!(q >= 0) || d.qty === '') return 'Enter a quantity.';
      let delta = d.type === 'in' ? q : d.type === 'out' ? -q : q - p.qty;
      if (p.qty + delta < 0) return `Stock cannot go below zero. Only ${p.qty} on hand.`;
      if (delta === 0) return 'This would not change the stock.';
      p.qty += delta;
      MOVES.unshift({ t: 'Today ' + now(), pid: p.id, type: { in: 'Stock in', out: 'Damaged / lost', count: 'Correction' }[d.type], delta, note: d.note || '—', by: 'Asha J.' });
      save(); setTimeout(() => { render(true); okToast(`${p.name}: ${delta > 0 ? '+' : ''}${delta} logged. Now ${p.qty.toLocaleString()} on hand.`); });
    });
  }
  function aDeliveries() {
    const cols = ['Preparing', 'Ready for delivery', 'Out for delivery', 'Delivered'];
    const del = ORDERS.filter((o) => o.mode === 'delivery'); const pick = ORDERS.filter((o) => o.mode === 'pickup' && !['Rejected', 'Cancelled', 'Pending'].includes(o.status));
    return `<div class="kanban">${cols.map((c) => { const list = del.filter((o) => o.status === c || (c === 'Preparing' && o.status === 'Confirmed')); return `<div class="kcol"><h3>${c}<span class="count" style="background:#fff;color:#16191C">${list.length}</span></h3>${list.map((o) => `<div class="kcard"><div style="display:flex;justify-content:space-between;gap:8px"><span class="refc">${o.ref}</span>${o.status === 'Confirmed' ? badge('Confirmed') : ''}</div><b>${esc(o.name)}</b><span class="muted">${ic('pin', 14)} ${esc(o.area)}</span><span class="muted">${o.items.reduce((s, i) => s + i[1], 0).toLocaleString()} units · ${fmt(orderTotal(o))}</span>
      ${nextStatus(o) ? `<button class="btn btn-outline btn-sm" data-act="kNext" data-ref="${o.ref}">${nextLabel(o)} →</button>` : `<a class="nl" href="#/admin/orders?ref=${o.ref}">Open order</a>`}</div>`).join('') || '<span class="muted" style="font-size:13px;padding:4px">Nothing here.</span>'}</div>`; }).join('')}</div>
      <div class="box"><div class="box-head"><h2>Pickup orders</h2></div><div class="tscroll"><table>${ORDER_HEAD}<tbody>${pick.map((o) => orderRow(o)).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:24px">No pickup orders.</td></tr>'}</tbody></table></div></div>`;
  }
  function aSales() {
    const total = PAYMENTS.reduce((s, p) => s + p.amount, 0);
    const unpaid = ORDERS.filter((o) => o.status === 'Delivered' && paidFor(o.ref) < orderTotal(o));
    const open = ORDERS.filter((o) => ['Confirmed', 'Preparing', 'Ready for delivery', 'Out for delivery'].includes(o.status)).reduce((s, o) => s + orderTotal(o), 0);
    return `<div class="note">${ic('info')}<span>Submitted orders are not sales. A sale is recorded when payment is received. Version 1 records payments manually; nothing here is verified by a payment provider.</span></div>
      <div class="kpis">${kpi('Payments recorded', short(total), PAYMENTS.length + ' payments')}${kpi('Delivered, awaiting payment', unpaid.length, unpaid.length ? 'Record when paid' : 'All settled', unpaid.length ? 'warn' : '')}${kpi('Confirmed orders in progress', short(open), 'Not yet revenue')}${kpi('Average payment', short(total / Math.max(1, PAYMENTS.length)), 'Per order')}</div>
      <div class="box"><div class="box-head"><h2>Recorded payments</h2><button class="btn btn-primary btn-sm" data-act="aPay">${ic('plus', 18)}Record payment</button></div><div class="tscroll"><table style="min-width:760px"><thead><tr><th>Order</th><th>Method</th><th>Transaction ref.</th><th class="r">Amount</th><th>Recorded by</th><th>Date</th><th>Source</th></tr></thead><tbody>
      ${PAYMENTS.map((p) => `<tr><td class="refc">${esc(p.ref)}</td><td>${esc(p.method)}</td><td class="muted">${esc(p.txn)}</td><td class="r"><b>${fmt(p.amount)}</b></td><td>${esc(p.by)}</td><td class="muted">${esc(p.date)}</td><td><span class="badge b-grey">Manual entry</span></td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function recordPayment(ref) {
    const opts = ORDERS.filter((o) => !['Rejected', 'Cancelled', 'Pending'].includes(o.status) && paidFor(o.ref) < orderTotal(o));
    if (!opts.length) { okToast('Every accepted order is already fully paid.'); return; }
    const sel = ref && opts.find((o) => o.ref === ref) ? ref : opts[0].ref;
    const due = (r) => { const o = ORDERS.find((x) => x.ref === r); return orderTotal(o) - paidFor(r); };
    openModal('Record payment', `<div class="field"><label for="po">Order</label><select class="select" id="po" name="ref">${opts.map((o) => `<option value="${o.ref}"${o.ref === sel ? ' selected' : ''}>${o.ref} · ${esc(o.name)} · ${fmt(orderTotal(o) - paidFor(o.ref))} due</option>`).join('')}</select></div>
      <div class="form-grid"><div class="field"><label for="pm">Method</label><select class="select" id="pm" name="method"><option>Cash on delivery</option><option>Cash at shop</option><option>M-Pesa</option><option>Tigo Pesa</option><option>Airtel Money</option><option>Bank transfer</option></select></div>
      <div class="field"><label for="pa">Amount (TSh)</label><input class="input" id="pa" name="amount" type="number" min="1" value="${due(sel)}"></div>
      <div class="field full"><label for="pt">Transaction reference <small>(if any)</small></label><input class="input" id="pt" name="txn" placeholder="e.g. mobile money code"></div></div>`, 'Record payment', (d) => {
      const a = Math.round(+d.amount);
      if (!(a > 0)) return 'Enter an amount above zero.';
      if (a > due(d.ref)) return `That is more than the ${fmt(due(d.ref))} due on this order.`;
      PAYMENTS.unshift({ ref: d.ref, method: d.method, amount: a, txn: d.txn || '—', by: 'Asha J.', date: today() });
      const o = ORDERS.find((x) => x.ref === d.ref); o.log.push([now(), `Payment recorded · ${fmt(a)} via ${d.method}`]);
      save(); setTimeout(() => { render(true); okToast(`Payment of ${fmt(a)} recorded for ${d.ref}.`); });
    });
  }
  function aReports() {
    const data = SALES[aS.range];
    const top = {}; ORDERS.filter((o) => !['Rejected', 'Cancelled'].includes(o.status)).forEach((o) => orderItems(o).forEach((x) => { top[x.p.id] = (top[x.p.id] || 0) + x.p.price * x.q; }));
    const topList = Object.entries(top).map(([id, v]) => [byId(id), v]).sort((a, b) => b[1] - a[1]).slice(0, 6); const tmax = topList.length ? topList[0][1] : 1;
    const statuses = Object.keys(ST).map((s) => [s, ORDERS.filter((o) => o.status === s).length]).filter((x) => x[1]); const smax = Math.max(...statuses.map((s) => s[1]));
    return `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center"><div class="ftabs">${[['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['12m', 'Last 12 months']].map(([k, l]) => `<button class="ftab${aS.range === k ? ' on' : ''}" data-act="aRange" data-r="${k}">${l}</button>`).join('')}</div><button class="btn btn-outline btn-sm" data-act="csv">${ic('download', 18)}Export orders CSV</button></div>
      <div class="kpis">${kpi('Sales (recorded payments)', 'TSh ' + data.reduce((s, d) => s + d[1], 0).toFixed(1) + 'M', 'Sample figures')}${kpi('Orders received', ORDERS.length, 'All statuses')}${kpi('Acceptance rate', Math.round(ORDERS.filter((o) => !['Rejected', 'Cancelled', 'Pending'].includes(o.status)).length / Math.max(1, ORDERS.filter((o) => o.status !== 'Pending').length) * 100) + '%', 'Confirmed vs rejected')}${kpi('Low-stock products', PRODUCTS.filter((p) => p.qty <= p.low).length, 'Right now', 'warn')}</div>
      <div class="box"><div class="box-head"><h2>Sales (TSh millions)</h2></div>${bars(data)}</div>
      <div class="grid2"><div class="box"><div class="box-head"><h2>Top products by order value</h2></div><div class="hbars">${topList.map(([p, v]) => `<div class="hbar"><div><span>${esc(p.name)}</span><b>${short(v)}</b></div><i><i style="width:${Math.round(v / tmax * 100)}%"></i></i></div>`).join('')}</div></div>
        <div class="box"><div class="box-head"><h2>Orders by status</h2></div><div class="hbars">${statuses.map(([s, n]) => `<div class="hbar"><div><span>${badge(s)}</span><b>${n}</b></div><i><i style="width:${Math.round(n / smax * 100)}%;background:#16191C"></i></i></div>`).join('')}</div></div></div>`;
  }
  function aUsers() {
    return `<div class="note">${ic('info')}<span>Version 1 has one role (Administrator), but each person gets their own named account so every change is traceable. Sales and inventory roles can be added later.</span></div>
      <div class="box"><div class="box-head"><h2>Team</h2><button class="btn btn-primary btn-sm" data-act="invite">${ic('plus', 18)}Invite user</button></div><div class="tscroll"><table style="min-width:680px"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last active</th><th>Active</th></tr></thead><tbody>
      ${USERS.map((u, i) => `<tr><td><span class="prodcell"><span class="avatar lt">${esc(u.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase())}</span><b>${esc(u.name)}</b></span></td><td class="muted">${esc(u.email)}</td><td>${esc(u.role)}</td><td><span class="badge ${u.status === 'Active' ? 'b-green' : u.status === 'Invited' ? 'b-blue' : 'b-grey'}">${esc(u.status)}</span></td><td class="muted">${esc(u.last)}</td>
        <td>${i === 0 ? '<span class="muted" style="font-size:13px">You</span>' : `<button class="switch${u.status === 'Disabled' ? '' : ' on'}" data-act="userToggle" data-i="${i}" role="switch" aria-checked="${u.status !== 'Disabled'}" aria-label="Account active"></button>`}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function invite() {
    openModal('Invite user', `<div class="field"><label for="un">Full name</label><input class="input" id="un" name="name"></div><div class="field"><label for="ue">Email</label><input class="input" id="ue" name="email" type="email"></div>
      <div class="field"><label for="ur">Role</label><select class="select" id="ur" name="role"><option>Administrator</option><option disabled>Sales staff (planned)</option><option disabled>Inventory staff (planned)</option></select></div>`, 'Send invite', (d) => {
      if (!d.name.trim()) return 'Enter a name.';
      if (!/^\S+@\S+\.\S+$/.test(d.email)) return 'Enter a valid email address.';
      USERS.push({ name: d.name.trim(), email: d.email.trim(), role: d.role, status: 'Invited', last: '—' });
      save(); setTimeout(() => { render(true); okToast('Invite created for ' + esc(d.name.trim()) + '. (No email is sent in this prototype.)'); });
    });
  }
  function exportCsv() {
    const rows = [['Reference', 'Customer', 'Phone', 'Receive', 'Area', 'Status', 'Items', 'Total TSh', 'Submitted']].concat(ORDERS.map((o) => [o.ref, o.name, o.phone, o.mode, o.area, o.status, o.items.map(([id, q]) => q + ' x ' + (byId(id) || {}).name).join('; '), orderTotal(o), o.time]));
    const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'finishers-orders.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000); okToast('Orders exported as finishers-orders.csv');
  }

  /* ---------------- staff session (prototype only: any details sign in) ---------------- */
  let afterLogin = '';
  const signedIn = () => { try { return sessionStorage.getItem('fpa_staff') === '1'; } catch (e) { return !!window.__fpaStaff; } };
  const setSignedIn = (on) => { try { if (on) sessionStorage.setItem('fpa_staff', '1'); else sessionStorage.removeItem('fpa_staff'); } catch (e) { window.__fpaStaff = on; } };

  /* ---------------- router ---------------- */
  let timers = [];
  function route() {
    const h = location.hash.replace(/^#/, '') || '/'; const i = h.indexOf('?');
    const p = i < 0 ? h : h.slice(0, i); const qs = i < 0 ? '' : h.slice(i + 1);
    const q = {}; new URLSearchParams(qs).forEach((v, k) => { q[k] = v; });
    return { parts: p.split('/').filter(Boolean), q };
  }
  function render(keep) {
    timers.forEach(clearInterval); timers = [];
    if (drawerRoot) drawerRoot.classList.remove('open');
    const r = route(); const [a, b, c] = r.parts; let html, mount = null, title = 'Finishers Point Africa';
    if (a === 'admin') {
      if (b === 'login') { html = vLogin(); title = 'Staff sign in'; }
      else if (!signedIn()) { afterLogin = location.hash; location.replace('#/admin/login'); return; }
      else { html = vAdmin(b || 'dashboard', r.q); title = 'Admin · ' + (b || 'dashboard'); }
    } else {
      if (!a) { html = vHome(); mount = mountHome; }
      else if (a === 'shop') { html = vShop(r.q); title = 'Shop'; }
      else if (a === 'product') { html = vProduct(b); title = (byId(b) || {}).name || 'Product'; }
      else if (a === 'cart') { html = vCart(); title = 'Cart'; }
      else if (a === 'order') { html = vOrder(b); title = 'Order ' + b; }
      else if (a === 'materials') { html = vMaterials(); title = 'Contractor orders'; }
      else if (a === 'info') { html = vInfo(b); title = (INFO[b] || INFO.how)[0]; }
      else html = vNotFound();
    }
    if (a !== 'admin' || b !== 'orders') aS.selFromQuery = false;
    if (a !== 'materials') matSent = null;
    app.innerHTML = html;
    document.title = title + ' · Finishers Point Africa';
    if (drawerRoot) drawerRoot.innerHTML = drawer();
    if (!keep) toTop();
    if (mount) mount(r);
    void c;
  }
  window.addEventListener('hashchange', () => render());
  const onBreakpoint = () => { M = mq.matches; document.documentElement.classList.toggle('m', M); render(true); };
  if (mq.addEventListener) mq.addEventListener('change', onBreakpoint); else mq.addListener(onBreakpoint);

  /* ---------------- events ---------------- */
  function bumpCart() {
    const el = $('#cartCount'); if (!el) return;
    el.textContent = cartCount(); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }
  function addToCart(id, qty, v) {
    const p = byId(id); if (!p || p.qty <= 0) return;
    const line = CART.find((l) => l.id === p.id && l.v === (v == null ? null : v));
    if (line) line.qty += qty; else CART.push({ id: p.id, v: v == null ? null : v, qty });
    save(); bumpCart();
    toast(`<img src="${IMG(p.img)}" alt=""><span><b>Added to cart</b><br>${qty.toLocaleString()} × ${esc(p.name)}</span><a href="#/cart">View cart</a>`);
  }
  const flash = (btn, html, ms) => {
    if (btn.dataset.flashing) return;
    const old = btn.innerHTML; btn.dataset.flashing = '1'; btn.innerHTML = html; btn.classList.add('done');
    setTimeout(() => { if (btn.isConnected) { btn.innerHTML = old; btn.classList.remove('done'); delete btn.dataset.flashing; } }, ms || 1600);
  };

  const ACT = {
    add(t) { if (t.dataset.flashing) return; addToCart(+t.dataset.id, 1, null); flash(t, ic('check', 18) + (M ? '' : '<span>Added</span>')); },
    hero(t) { heroGo(+t.dataset.i); restartHero(); },
    heroStep(t) { heroGo(heroI + +t.dataset.d); restartHero(); },
    row(t) { rowGo(rowI + +t.dataset.d); },
    photo(t) { pdp.photo = +t.dataset.i; pdp.anim = true; render(true); pdp.anim = false; },
    photoStep(t) { const p = byId(pdp.id); const n = (p.photos || [p.img]).length; pdp.photo = (pdp.photo + +t.dataset.d + n) % n; pdp.anim = true; render(true); pdp.anim = false; },
    variant(t) { pdp.v = +t.dataset.i; render(true); },
    pdpQty(t) { pdp.qty = Math.max(1, pdp.qty + +t.dataset.d); render(true); },
    pdpSet(t) { pdp.qty = +t.dataset.n; render(true); },
    pdpAdd(t) { if (t.dataset.flashing) { go('#/cart'); return; } addToCart(pdp.id, pdp.qty, pdp.v); flash(t, ic('check') + `<span>${pdp.qty.toLocaleString()} added · view cart</span>`, 2600); },
    fav(t) { const id = +t.dataset.id; if (FAVS.has(id)) FAVS.delete(id); else FAVS.add(id); save(); t.classList.toggle('on'); t.setAttribute('aria-pressed', FAVS.has(id)); okToast(FAVS.has(id) ? 'Saved to favourites.' : 'Removed from favourites.'); },
    tab(t) { pdp.tab = t.dataset.k; render(true); },
    cartQty(t) { const [id, v] = t.dataset.k.split('|'); const l = CART.find((x) => x.id === +id && String(x.v) === v); if (l) { l.qty = Math.max(1, l.qty + +t.dataset.d); save(); render(true); } },
    cartDel(t) { const [id, v] = t.dataset.k.split('|'); const p = byId(id); CART = CART.filter((x) => !(x.id === +id && String(x.v) === v)); save(); render(true); okToast(esc(p.name) + ' removed from your cart.'); },
    coMode(t) { CO.mode = t.dataset.m; save(); render(true); },
    submitOrder() { submitOrder(); },
    resetFilters() { shopF.cats = new Set(CATS.map((c) => c.slug)); shopF.max = 200000; shopF.stock = false; shopF.q = ''; $$('[data-filter=cat]').forEach((i) => { i.checked = true; }); const m = $('#maxp'); if (m) m.value = 200000; $('#maxOut').textContent = fmt(200000); const s = $('[data-filter=stock]'); if (s) s.checked = false; refreshShop(); },
    menu() { drawerRoot.classList.toggle('open'); },
    matAgain() { matSent = null; render(); },
    print() { window.print(); },
    printAll() { printAll(); },
    closeModal() { closeModal(); },
    noop(t) { okToast(t.dataset.msg || 'Not wired in this prototype.'); },
    aSel(t) { aS.sel = t.dataset.ref; if (route().parts[1] !== 'orders') go('#/admin/orders?ref=' + t.dataset.ref); else render(true); },
    aFilter(t) { aS.filter = t.dataset.f; const first = ORDERS.find((o) => aS.filter === 'All' || o.status === aS.filter); if (first) aS.sel = first.ref; render(true); },
    aConfirm() { confirmOrder(); },
    aReject() { rejectOrder(); },
    aNext() { advance(aS.sel); },
    kNext(t) { advance(t.dataset.ref); },
    aPay(t) { recordPayment(t.dataset.ref); },
    aRange(t) { aS.range = t.dataset.r; render(true); },
    csv() { exportCsv(); },
    prodEdit(t) { editProduct(t.dataset.id ? +t.dataset.id : null); },
    publish(t) { const p = byId(t.dataset.id); p.published = p.published === false; save(); t.classList.toggle('on', p.published); t.setAttribute('aria-checked', p.published); okToast(p.published ? esc(p.name) + ' is visible on the store.' : esc(p.name) + ' is hidden from the store.'); },
    catEdit(t) { editCat(t.dataset.slug); },
    adjust(t) { adjustStock(+t.dataset.id); },
    invite() { invite(); },
    logout() { setSignedIn(false); go('#/admin/login'); okToast('Signed out.'); },
    userToggle(t) { const u = USERS[+t.dataset.i]; u.status = u.status === 'Disabled' ? 'Active' : 'Disabled'; save(); render(true); okToast(esc(u.name) + (u.status === 'Disabled' ? ' can no longer sign in.' : ' can sign in again.')); },
    resetDemo() { ['cats', 'products', 'orders', 'moves', 'payments', 'users', 'cart', 'checkout', 'favs'].forEach((k) => { try { localStorage.removeItem(KEY + k); } catch (e) { /* ignore */ } }); location.reload(); }
  };
  function advance(ref) {
    const o = ORDERS.find((x) => x.ref === ref); const n = nextStatus(o); if (!n) return;
    const label = nextLabel(o); o.status = n; o.log.push([now(), (n === 'Delivered' && o.mode === 'pickup' ? 'Collected at shop' : n) + ' · by Asha J.']); save(); render(true);
    if (n === 'Delivered') toast(`<span class="tic">${ic('check', 18)}</span><span><b>${o.ref} ${o.mode === 'pickup' ? 'collected' : 'delivered'}</b><br>Record the payment when it is received.</span><a href="#/admin/sales">Sales →</a>`, 4500);
    else okToast(`${o.ref}: ${label.toLowerCase()} done.`);
  }
  function restartHero() { timers.forEach(clearInterval); timers = [setInterval(() => heroGo(heroI + 1), 6000)]; }
  function printAll() {
    const keepHash = location.hash; const prevPdp = pdp; pdp = {};
    const pages = [vHome(), vShop({}), vProduct(1), vCart(), vMaterials(), vInfo('how')];
    pdp = prevPdp;
    app.innerHTML = pages.join('<div class="pb"></div>');
    const imgs = $$('img', app);
    Promise.all(imgs.map((i) => i.complete ? 1 : new Promise((res) => { i.onload = i.onerror = res; }))).then(() => {
      setTimeout(() => { window.print(); if (location.hash === keepHash) render(); }, 200);
    });
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const fn = ACT[t.dataset.act]; if (!fn) return;
    if (t.tagName === 'A' && t.getAttribute('href') === '#') e.preventDefault();
    if (t.tagName === 'LABEL' || t.type === 'file') return;
    fn(t, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (modalRoot.classList.contains('open')) closeModal(); if (drawerRoot) drawerRoot.classList.remove('open'); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-act]')) { e.preventDefault(); ACT.aSel(e.target); }
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.co) { CO[t.dataset.co] = t.value; if (CO.err && CO.err[t.dataset.co]) { delete CO.err[t.dataset.co]; t.classList.remove('bad'); } save(); return; }
    if (t.dataset.filter === 'max') { shopF.max = +t.value; $('#maxOut').textContent = fmt(shopF.max); refreshShop(); return; }
    if (t.dataset.actInput === 'psearch') { aS.psearch = t.value; $('#prodBody').innerHTML = prodRows(); return; }
    if (t.dataset.actInput === 'fee') { const o = ORDERS.find((x) => x.ref === aS.sel); o.fee = Math.max(0, +t.value || 0); save(); $('#feeOut').textContent = fmt(o.fee); $('#totOut').textContent = fmt(orderTotal(o)); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.co) { CO[t.dataset.co] = t.value; save(); return; }
    if (t.dataset.filter === 'cat') { if (t.checked) shopF.cats.add(t.value); else shopF.cats.delete(t.value); refreshShop(); }
    if (t.dataset.filter === 'stock') { shopF.stock = t.checked; refreshShop(); }
    if (t.dataset.filter === 'sort') { shopF.sort = t.value; refreshShop(); }
    if (t.dataset.act === 'file') { const n = $('#mFileName'); if (n) n.textContent = t.files[0] ? t.files[0].name + ' attached' : 'Click to choose a file'; }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target; const kind = f.dataset.form; if (!kind) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (kind === 'search') { const v = (d.q || '').trim(); go(v ? '#/shop?q=' + encodeURIComponent(v) : '#/shop'); }
    else if (kind === 'checkout') submitOrder();
    else if (kind === 'modal') { if (!modalSave) return; const err = modalSave(d); if (err) $('#merr').textContent = err; else closeModal(); }
    else if (kind === 'login') { setSignedIn(true); const to = afterLogin && afterLogin !== '#/admin/login' ? afterLogin : '#/admin/dashboard'; afterLogin = ''; go(to); }
    else if (kind === 'materials') {
      if (!(d.list || '').trim() && !$('#mFile').files.length) { $('#matErr').textContent = 'Type your list or attach a file.'; return; }
      if ((d.phone || '').replace(/\D/g, '').length < 9) { $('#matErr').textContent = 'Enter a phone number so the shop can call you back.'; return; }
      matSent = 'LIST-' + String(Math.floor(1000 + Math.random() * 9000)); render();
    } else if (kind === 'contact') {
      if (!(d.msg || '').trim()) { badToast('Please write a message.'); return; }
      f.reset(); okToast('Message sent. The shop will reply by phone or WhatsApp.');
    }
  });

  render();
})();
