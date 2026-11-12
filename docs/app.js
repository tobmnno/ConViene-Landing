const stores = [
  { id: 'coto', name: 'Coto', logo: 'coto.svg' },
  { id: 'carrefour', name: 'Carrefour', logo: 'carrefour.svg' },
  { id: 'lagallega', name: 'La Gallega', logo: 'la-gallega.svg' },
  { id: 'jumbo', name: 'Jumbo', logo: 'jumbo_official.png', badge: 'green' },
  { id: 'lareina', name: 'La Reina', logo: 'la_reina_official.png', badge: 'reina' },
  { id: 'dar', name: 'DAR', logo: 'dar.svg', badge: 'red' }
];

// Fotos de productos reales, importes ficticios. La demo nunca consulta el backend.
const products = [
  { id: 'leche', name: 'Leche entera La Serenísima', size: '1 L', category: 'Lácteos', image: 'leche.jpg', prices: [1500, 1300, 1520, 1490, 1470, 1450] },
  { id: 'arroz', name: 'Arroz Gallo largo fino', size: '1 kg', category: 'Almacén', image: 'arroz.jpg', prices: [1700, 2000, 1780, 1900, 1850, 1800] },
  { id: 'yerba', name: 'Yerba Playadito', size: '1 kg', category: 'Almacén', image: 'yerba.webp', prices: [4200, 4100, 4300, 4500, 4350, 4250] },
  { id: 'aceite', name: 'Aceite de girasol Cocinero', size: '900 ml', category: 'Almacén', image: 'aceite.jpg', prices: [2900, 3100, 2950, 2850, null, 3050] },
  { id: 'fideos', name: 'Fideos Matarazzo tirabuzón', size: '500 g', category: 'Almacén', image: 'fideos.png', prices: [1100, 1050, 1120, 1090, 1150, 1040] },
  { id: 'cafe', name: 'Café Cabrales molido', size: '250 g', category: 'Desayuno', image: 'cafe.jpg', prices: [5200, 4990, null, 5350, 5100, 5250] }
];
const searchIcon = '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4.7 4.7"/></svg>';
const $ = id => document.getElementById(id);
const money = n => '$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
const norm = s => s.toLocaleLowerCase('es-AR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const productById = id => products.find(p => p.id === id);
const storeById = id => stores.find(s => s.id === id);
const state = { mode: 'guided', step: 0, view: 'search', query: '', productId: null, detailTab: 'prices', detailQuantity: 1, stores: new Set(stores.map(s => s.id)), cart: new Map(), cartNotice: '' };
function image(product, className = 'product-art') {
  return `<img class="${className}" src="./assets/products/${product.image}" alt="" loading="lazy">`;
}
function logo(store, className = '') {
  return `<span class="store-logo ${store.badge || ''} ${className}"><img src="./assets/${store.logo}" alt="" loading="lazy"></span>`;
}
function announce(text) { $('demo-announcement').textContent = text; }
function available(product) {
  return stores.map((store, i) => ({ store, price: product.prices[i] }))
    .filter(row => state.stores.has(row.store.id) && row.price !== null)
    .sort((a, b) => a.price - b.price);
}
function setView(view) {
  state.view = view;
  $('demo-catalog').hidden = view !== 'search';
  $('demo-detail').hidden = view !== 'detail';
  $('demo-cart-panel').hidden = view !== 'cart';
  document.querySelectorAll('.demo-bottom-nav button').forEach(button => {
    const active = button.dataset.view === (view === 'detail' ? 'search' : view);
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
  document.querySelector('.demo-scroll').scrollTop = 0;
}
function renderStores() {
  const cards = stores.map(store => `<div class="store-card">${logo(store)}<span>${store.name}</span></div>`).join('');
  $('store-grid').innerHTML = `<div class="store-marquee-group">${cards}</div><div class="store-marquee-group" aria-hidden="true">${cards}</div>`;
}
function renderFilters() {
  $('store-filters').innerHTML = stores.map(store => `<button type="button" class="store-chip ${state.stores.has(store.id) ? 'selected' : ''}" data-store="${store.id}" aria-pressed="${state.stores.has(store.id)}">${logo(store)}<span>${store.name}</span></button>`).join('');
  $('select-all-stores').disabled = state.stores.size === stores.length;
}
function renderProducts() {
  const matches = products.filter(product => norm(product.name + ' ' + product.size + ' ' + product.category).includes(norm(state.query)));
  $('catalog-count').textContent = matches.length + (matches.length === 1 ? ' producto' : ' productos');
  $('product-list').innerHTML = matches.length ? matches.map(product => {
    const prices = available(product);
    return `<article class="product-card"><button type="button" class="product-open" data-open="${product.id}" aria-label="Ver ${product.name} y comparar precios">${image(product)}<span class="product-meta"><strong>${product.name}</strong><small>${product.size} · ${product.category}</small><span class="product-price">${prices.length ? 'Desde ' + money(prices[0].price) : 'Sin precio'}</span></span><span class="product-chevron" aria-hidden="true">›</span></button></article>`;
  }).join('') : '<div class="empty-search">No hay productos de ejemplo con esa búsqueda.<br>Probá con leche, arroz o yerba.</div>';
}
function renderDetail() {
  const product = productById(state.productId);
  if (!product) return;
  const rows = stores.map((store, i) => ({ store, price: product.prices[i] })).filter(row => state.stores.has(row.store.id));
  const min = Math.min(...rows.filter(row => row.price !== null).map(row => row.price));
  $('demo-detail').innerHTML = `<button type="button" class="detail-back" id="detail-back">‹ Volver a resultados</button>
    <div class="detail-product">${image(product, 'detail-image')}<span class="demo-label">${product.category.toUpperCase()}</span><h3>${product.name}</h3><p>${product.size} · Producto de ejemplo</p></div>
    <div class="detail-quantity"><span>Cantidad</span><span class="detail-stepper"><button type="button" data-detail-quantity="-1" aria-label="Restar unidad" ${state.detailQuantity === 1 ? 'disabled' : ''}>−</button><strong>${state.detailQuantity}</strong><button type="button" data-detail-quantity="1" aria-label="Sumar unidad">+</button></span></div>
    <div class="detail-tabs"><button type="button" data-detail-tab="prices" class="${state.detailTab === 'prices' ? 'active' : ''}" aria-pressed="${state.detailTab === 'prices'}">Precios</button><button type="button" data-detail-tab="benefits" class="${state.detailTab === 'benefits' ? 'active' : ''}" aria-pressed="${state.detailTab === 'benefits'}">Beneficios</button></div>
    ${state.detailTab === 'prices' ? `<p class="detail-disclaimer">Precios simulados para mostrar el recorrido de la app.</p>
    ${rows.map(({ store, price }) => `<div class="detail-offer ${price === min ? 'best' : ''}">${price === min ? '<span class="detail-best">MENOR COSTO ESTIMADO</span>' : ''}<div class="detail-offer-row">${logo(store)}<strong class="detail-store-name">${store.name}</strong><b>${price === null ? 'Sin precio' : money(price * state.detailQuantity)}</b>${price === null ? '' : `<button type="button" class="offer-add" data-add="${product.id}" data-offer-store="${store.id}" aria-label="Agregar ${state.detailQuantity} ${product.name} de ${store.name} al changuito">🛒<span class="sr-only">Agregar</span></button>`}</div><span class="detail-source">${price === null ? 'Sin cotización en esta simulación' : 'Precio de ejemplo por unidad: ' + money(price)}</span>${price === null ? '<span class="detail-unavailable">Enlace directo no disponible</span>' : `<button type="button" class="official-link" data-official="${store.id}">Ver en sitio oficial ↗</button>`}</div>`).join('')}` : '<div class="demo-benefits-empty">La demo no consulta promociones ni medios de pago. En la app, esta pestaña muestra los beneficios verificados y sus condiciones.</div>'}
    <p class="detail-disclaimer">Estimación sujeta a stock, vigencia y condiciones. En la app, el enlace lleva a la ficha oficial cuando está disponible.</p>`;
}
function renderCart() {
  const items = [...state.cart.entries()].map(([id, item]) => ({ product: productById(id), ...item }));
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  $('cart-count').textContent = count;
  $('nav-cart-count').textContent = count;
  $('clear-cart').disabled = count === 0;
  $('cart-list').innerHTML = (items.length && state.cartNotice ? `<p class="cart-notice">${state.cartNotice}</p>` : '') + (items.length ? items.map(({ product, quantity, storeId }) => `<div class="cart-item">${image(product)}<div class="cart-item-meta"><strong>${product.name}</strong><small>${product.size} · ${storeById(storeId)?.name || 'Sin precio en tiendas seleccionadas'}</small></div><div class="qty-control"><button type="button" data-decrease="${product.id}" aria-label="Quitar una unidad de ${product.name}">−</button><span>${quantity}</span><button type="button" data-increase="${product.id}" aria-label="Agregar una unidad de ${product.name}">+</button></div><button type="button" class="remove-item" data-remove="${product.id}" aria-label="Quitar ${product.name} del changuito">×</button></div>`).join('') : '<div class="empty-cart">Tu changuito está vacío.<br>Buscá un producto y elegí dónde agregarlo.</div>');
  if (!items.length) { $('comparison').innerHTML = '<h4>Comparación</h4><p class="comparison-intro">Los totales aparecen al agregar productos.</p>'; return; }
  const rows = stores.filter(store => state.stores.has(store.id)).map(store => {
    const index = stores.indexOf(store);
    const found = items.filter(item => item.product.prices[index] !== null);
    return { store, total: found.reduce((sum, item) => sum + item.product.prices[index] * item.quantity, 0), found: found.length, complete: found.length === items.length };
  }).sort((a, b) => Number(b.complete) - Number(a.complete) || a.total - b.total);
  const mixItems = items.map(item => ({ ...item, best: available(item.product)[0] })).filter(item => item.best);
  const mixTotal = mixItems.reduce((sum, item) => sum + item.best.price * item.quantity, 0);
  const complete = rows.find(row => row.complete);
  const saving = complete && mixItems.length === items.length ? Math.max(0, complete.total - mixTotal) : null;
  const mixStores = new Set(mixItems.map(item => item.best.store.id)).size;
  const savingContext = saving !== null && saving > 0 ? `La diferencia es ${Math.round(saving / complete.total * 1000) / 10}% y requiere ${mixStores} ${mixStores === 1 ? 'supermercado' : 'supermercados'}. Decidí si compensa los traslados o envíos.` : '';
  $('comparison').innerHTML = `<h4>Compará tu compra</h4><p class="comparison-intro">Los subtotales parciales no compiten con compras completas.</p>${rows.map((row, index) => `<div class="comparison-row ${!row.complete ? 'partial' : index === 0 ? 'best-complete' : ''}">${logo(row.store)}<div class="comparison-name"><strong>${row.store.name}</strong><small>${row.complete ? 'Compra completa' : row.found + ' de ' + items.length + ' productos · parcial'}</small></div><div class="comparison-amount"><strong>${row.found ? money(row.total) : 'Sin precio'}</strong>${index === 0 && row.complete ? '<small>Mejor tienda</small>' : ''}</div></div>`).join('')}<div class="mix-card"><div class="mix-card-head"><div><span>✳ ${mixItems.length === items.length ? 'MEJOR COMBINACIÓN' : 'COMBINACIÓN PARCIAL'}</span><p>${mixItems.length === items.length ? 'El menor precio por producto.' : mixItems.length + ' de ' + items.length + ' productos con precio.'}</p></div><strong>${mixItems.length ? money(mixTotal) : 'Sin precio'}</strong></div><div class="mix-breakdown">${mixItems.map(item => `<div><span>${item.product.name} × ${item.quantity} · ${item.best.store.name}</span><span>${money(item.best.price * item.quantity)}</span></div>`).join('')}</div></div>${saving === null ? '<p class="comparison-empty">No hay una compra completa para calcular el ahorro.</p>' : saving > 0 ? `<p class="saving-line">Ahorro potencial: <strong>${money(saving)}</strong> frente a la tienda completa más barata. ${savingContext}</p>` : '<p class="comparison-empty">En este ejemplo, la combinación coincide con la tienda completa más barata.</p>'}`;
}
function syncCartSources() {
  let changed = false, missing = false;
  for (const [id, item] of state.cart) {
    if (item.storeId && state.stores.has(item.storeId)) continue;
    const replacement = available(productById(id))[0]?.store.id || null;
    if (replacement !== item.storeId) {
      state.cart.set(id, { ...item, storeId: replacement });
      changed = true;
    }
    if (!replacement) missing = true;
  }
  state.cartNotice = changed ? (missing ? 'Al cambiar los filtros, algunos productos quedaron sin precio en las tiendas seleccionadas.' : 'Al cambiar los filtros, actualizamos la tienda indicada en el changuito.') : '';
  if (changed) announce(state.cartNotice);
}
const guide = [
  { title: 'Buscá un producto', body: 'Empezá con una búsqueda entre artículos con fotos de sus envases.', action: 'Buscar leche' },
  { title: 'Encontrá lo que necesitás', body: 'Abrí la ficha para comparar la misma presentación en distintas tiendas.', action: 'Comparar precios' },
  { title: 'Compará y agregá', body: 'Ves el logo, el precio y el acceso a la ficha oficial como en la app. En esta demo el enlace no abre otra página.', action: 'Agregar leche' },
  { title: 'Completá tu lista', body: 'Para comparar una compra completa, se van a sumar estos productos de ejemplo:', preview: ['+1 leche', '+1 arroz', '+1 fideos', '+1 yerba'], action: 'Sumar estos productos' },
  { title: 'Elegí cómo comprar', body: 'Compará el total de toda la lista en cada súper con la opción de repartir productos. La app está en desarrollo: próximamente disponible.', action: 'Explorar libremente' }
];
function renderGuide() {
  $('guide-panel').classList.toggle('hidden', state.mode !== 'guided');
  if (state.mode !== 'guided') return;
  const step = guide[state.step];
  $('guide-panel').innerHTML = `<div class="guide-text"><span>PASO ${state.step + 1} DE ${guide.length}</span><strong>${step.title}</strong><p>${step.body}</p>${step.preview ? `<div class="guide-preview" aria-label="Productos que se agregarán">${step.preview.map(name => `<span>${name}</span>`).join('')}</div>` : ''}</div><div class="guide-controls"><button type="button" id="guide-back" ${state.step === 0 ? 'disabled' : ''}>Anterior</button><button type="button" id="guide-next">${step.action} →</button></div>`;
}
function renderMode() {
  const guided = state.mode === 'guided';
  $('guided-mode').classList.toggle('active', guided);
  $('free-mode').classList.toggle('active', !guided);
  $('guided-mode').setAttribute('aria-pressed', String(guided));
  $('free-mode').setAttribute('aria-pressed', String(!guided));
  renderGuide();
}
function renderAll() {
  $('product-search').value = state.query;
  renderMode(); renderFilters(); renderProducts(); renderDetail(); renderCart(); setView(state.view);
}
function reset() {
  state.step = 0; state.query = ''; state.productId = null; state.view = 'search'; state.detailTab = 'prices'; state.detailQuantity = 1;
  state.stores = new Set(stores.map(s => s.id)); state.cart = new Map(); state.cartNotice = '';
}
function guideTo(target) {
  reset();
  if (target >= 1) state.query = 'leche';
  if (target >= 2) state.productId = 'leche';
  if (target >= 3) state.cart.set('leche', { quantity: 1, storeId: 'carrefour' });
  if (target >= 4) {
    state.cart.set('leche', { quantity: 2, storeId: 'carrefour' });
    state.cart.set('arroz', { quantity: 1, storeId: 'coto' });
    state.cart.set('fideos', { quantity: 1, storeId: 'dar' });
    state.cart.set('yerba', { quantity: 1, storeId: 'carrefour' });
  }
  state.view = target === 2 ? 'detail' : target >= 3 ? 'cart' : 'search';
  state.step = target; renderAll();
  if (target === 4) $('comparison').scrollIntoView({ block: 'start', behavior: 'instant' });
  announce(guide[target].title);
}
function manual() { if (state.mode === 'guided') { state.mode = 'free'; renderMode(); } }
function addProduct(id, storeId) {
  const item = state.cart.get(id);
  state.cart.set(id, { quantity: Math.min(99, (item?.quantity || 0) + state.detailQuantity), storeId });
  state.cartNotice = '';
  renderCart(); setView('cart'); announce(`${productById(id).name} agregado desde ${storeById(storeId).name}.`);
}
function quantity(id, delta) {
  const item = state.cart.get(id);
  const next = Math.min(99, Math.max(0, item.quantity + delta));
  if (next) state.cart.set(id, { ...item, quantity: next }); else state.cart.delete(id);
  renderCart(); announce(`${productById(id).name}: ${next} unidades.`);
}
function heroPhone() {
  const milk = products[0], rice = products[1];
  const screens = [
    `<div class="hero-phone-content"><div class="hero-phone-brand"><span class="brand-icon"></span>ConViene</div><p class="hero-phone-label">HOLA, ¿QUÉ BUSCAMOS?</p><h3>Tu próxima compra empieza acá.</h3><div class="hero-phone-search">${searchIcon} &nbsp; Buscar producto...</div><div class="hero-phone-card"><strong>Compará precios cerca tuyo</strong><p>Productos de distintas cadenas en un lugar.</p><div class="hero-phone-stores">${stores.map(s => `<span class="hero-store-item" aria-label="${s.name}">${logo(s)}</span>`).join('')}</div></div><div class="phone-bottom-nav"><span>⌂<br>Inicio</span><span>${searchIcon}<br>Buscar</span><span>▣<br>Changuito</span></div></div>`,
    `<div class="hero-phone-content"><div class="hero-phone-brand"><span class="brand-icon"></span>ConViene</div><p class="hero-phone-label">RESULTADOS</p><h3>Leche entera</h3><div class="hero-phone-search">${searchIcon} &nbsp; Leche entera</div><div class="hero-phone-card">${image(milk)}<strong>${milk.name}</strong><small>1 L · Desde $ 1.300</small></div><div class="hero-phone-card">${image(rice)}<strong>${rice.name}</strong><small>1 kg · Desde $ 1.700</small></div><div class="phone-bottom-nav"><span>⌂<br>Inicio</span><span>${searchIcon}<br>Buscar</span><span>▣<br>Changuito</span></div></div>`,
    `<div class="hero-phone-content"><div class="hero-phone-brand"><span class="brand-icon"></span>ConViene</div><p class="hero-phone-label">PRODUCTO</p>${image(milk, 'hero-detail-image')}<h3>${milk.name}</h3><small>1 L · Precios</small><div class="hero-phone-card hero-offers">${stores.map((s,i) => `<div class="hero-offer" aria-label="${s.name}: ${money(milk.prices[i])}">${logo(s)}<strong>${money(milk.prices[i])}</strong></div>`).join('')}</div><div class="phone-bottom-nav"><span>⌂<br>Inicio</span><span>${searchIcon}<br>Buscar</span><span>▣<br>Changuito</span></div></div>`,
    `<div class="hero-phone-content"><div class="hero-phone-brand"><span class="brand-icon"></span>ConViene</div><p class="hero-phone-label">MI CHANGUITO</p><h3>Elegí cómo comprar.</h3><div class="hero-phone-card">${image(milk)}<strong>${milk.name}</strong><small>2 unidades</small></div><div class="hero-phone-card">${image(rice)}<strong>${rice.name}</strong><small>1 unidad</small></div><div class="hero-phone-summary"><small>MEJOR COMBINACIÓN</small><strong>$ 4.300</strong><p>Ahorrás $ 300 en esta simulación.</p></div><div class="phone-bottom-nav"><span>⌂<br>Inicio</span><span>${searchIcon}<br>Buscar</span><span>▣<br>Changuito</span></div></div>`
  ];
  let index = 0;
  const render = () => { $('phone-screen').innerHTML = screens[index]; $('phone-progress').innerHTML = screens.map((_, i) => `<span class="${i === index ? 'active' : ''}"></span>`).join(''); };
  render();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (!document.hidden) { index = (index + 1) % screens.length; render(); } }, 4200);
}
function setupTheme() {
  if (localStorage.getItem('conviene-landing-theme') === 'dark') document.documentElement.dataset.theme = 'dark';
  const refresh = () => $('theme-toggle').setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro');
  refresh();
  $('theme-toggle').addEventListener('click', () => { const dark = document.documentElement.dataset.theme !== 'dark'; document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('conviene-landing-theme', dark ? 'dark' : 'light'); refresh(); });
}
function reveal() {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { document.querySelectorAll('.reveal').forEach(n => n.classList.add('visible')); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(n => observer.observe(n));
}
renderStores(); renderAll(); heroPhone(); reveal(); setupTheme();
$('year').textContent = new Date().getFullYear();
$('product-search').addEventListener('input', e => { manual(); state.query = e.target.value; renderProducts(); });
$('product-search').addEventListener('keydown', e => { if (e.key === 'Escape') { state.query = ''; e.target.value = ''; renderProducts(); } });
document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); setView('search'); $('product-search').focus(); $('demo').scrollIntoView({ block: 'start' }); } });
$('store-filters').addEventListener('click', e => { const button = e.target.closest('[data-store]'); if (!button) return; const id = button.dataset.store; if (state.stores.has(id) && state.stores.size === 1) { announce('Elegí al menos un supermercado.'); return; } manual(); if (state.stores.has(id)) state.stores.delete(id); else state.stores.add(id); syncCartSources(); renderFilters(); renderProducts(); renderDetail(); renderCart(); });
$('select-all-stores').addEventListener('click', () => { manual(); state.stores = new Set(stores.map(s => s.id)); syncCartSources(); renderFilters(); renderProducts(); renderDetail(); renderCart(); });
$('product-list').addEventListener('click', e => { const button = e.target.closest('[data-open]'); if (!button) return; manual(); state.productId = button.dataset.open; state.detailTab = 'prices'; state.detailQuantity = 1; renderDetail(); setView('detail'); });
$('demo-detail').addEventListener('click', e => { if (e.target.closest('#detail-back')) { setView('search'); return; } const tab = e.target.closest('[data-detail-tab]'); if (tab) { state.detailTab = tab.dataset.detailTab; renderDetail(); return; } const stepper = e.target.closest('[data-detail-quantity]'); if (stepper) { state.detailQuantity = Math.min(99, Math.max(1, state.detailQuantity + Number(stepper.dataset.detailQuantity))); renderDetail(); return; } const add = e.target.closest('[data-add]'); if (add) { manual(); addProduct(add.dataset.add, add.dataset.offerStore); return; } if (e.target.closest('[data-official]')) { announce('En la app se abre la ficha oficial del producto. Esta demo usa precios simulados y no abre enlaces externos.'); const note = $('demo-link-note'); if (note) note.remove(); const p = document.createElement('p'); p.id = 'demo-link-note'; p.className = 'demo-link-note'; p.textContent = 'En la app este botón abre la ficha oficial. La demo no navega fuera de esta página.'; e.target.closest('.detail-offer').append(p); } });
$('cart-list').addEventListener('click', e => { const up = e.target.closest('[data-increase]'), down = e.target.closest('[data-decrease]'), remove = e.target.closest('[data-remove]'); if (!(up || down || remove)) return; manual(); if (up) quantity(up.dataset.increase, 1); if (down) quantity(down.dataset.decrease, -1); if (remove) { state.cart.delete(remove.dataset.remove); renderCart(); } });
$('clear-cart').addEventListener('click', () => { manual(); state.cart.clear(); renderCart(); });
$('guided-mode').addEventListener('click', () => { state.mode = 'guided'; guideTo(0); });
$('free-mode').addEventListener('click', () => { state.mode = 'free'; renderMode(); announce('Modo libre activado.'); });
$('reset-demo').addEventListener('click', () => { reset(); renderAll(); announce('Demo reiniciada.'); });
$('guide-panel').addEventListener('click', e => { if (e.target.closest('#guide-back')) guideTo(Math.max(0, state.step - 1)); if (e.target.closest('#guide-next')) { if (state.step === guide.length - 1) { state.mode = 'free'; renderMode(); } else guideTo(state.step + 1); } });
document.querySelector('.demo-bottom-nav').addEventListener('click', e => { const button = e.target.closest('[data-view]'); if (button) { manual(); setView(button.dataset.view); } });
$('menu-toggle').addEventListener('click', () => { const open = $('main-nav').classList.toggle('open'); $('menu-toggle').setAttribute('aria-expanded', String(open)); $('menu-toggle').setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); });
$('main-nav').addEventListener('click', e => { if (e.target.closest('a')) { $('main-nav').classList.remove('open'); $('menu-toggle').setAttribute('aria-expanded', 'false'); $('menu-toggle').setAttribute('aria-label', 'Abrir menú'); } });
