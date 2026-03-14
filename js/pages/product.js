/* ============================================
   PRODUCT DETAIL PAGE
   js/pages/product.js
============================================ */

// ─── Sample Product Database ──────────────
// In production: fetch from API using ?id= query param
const PRODUCTS = [
  {
    id: 1,
    name: 'Vaporesso XROS 3',
    category: 'Pod System',
    vendor: 'VapeHub Manila',
    vendorId: 'v1',
    price: 2499,
    originalPrice: 2999,
    badge: 'sale',
    rating: 4.5,
    reviewCount: 128,
    soldCount: 342,
    stock: 24,
    description: `
      <p>The Vaporesso XROS 3 is the latest evolution in the beloved XROS series, delivering an elevated vaping experience with a refined design and powerful performance.</p>
      <h3>Why Vapers Love It</h3>
      <p>The XROS 3 features a new COREX heating technology that fires up instantly, giving you a smooth and consistent draw every time. Whether you're a beginner or a seasoned vaper, the XROS 3 adapts to your style.</p>
      <h3>Key Features</h3>
      <ul>
        <li>1000mAh built-in battery with fast USB-C charging</li>
        <li>COREX heating technology for rapid, consistent vapor</li>
        <li>2ml refillable pod with side-fill system</li>
        <li>Compatible with all XROS mesh coils (0.6Ω and 1.2Ω)</li>
        <li>Adjustable airflow for MTL and RDL vaping</li>
        <li>Auto-draw and button-activated firing</li>
        <li>LED battery indicator</li>
      </ul>
      <h3>What's in the Box</h3>
      <ul>
        <li>1× XROS 3 Device</li>
        <li>1× XROS Pod (0.6Ω pre-installed)</li>
        <li>1× USB-C charging cable</li>
        <li>1× User manual</li>
      </ul>
    `,
    specs: [
      { label: 'Battery',          value: '1000mAh' },
      { label: 'Output Power',     value: '11W – 16W' },
      { label: 'Pod Capacity',     value: '2ml' },
      { label: 'Coil Resistance',  value: '0.6Ω / 1.2Ω' },
      { label: 'Dimensions',       value: '112 × 24 × 12 mm' },
      { label: 'Weight',           value: '32g (without pod)' },
      { label: 'Charging',         value: 'USB-C, 5V/1A' },
      { label: 'Airflow',          value: 'Adjustable' },
      { label: 'Material',         value: 'Zinc alloy + PCTG' },
      { label: 'Colors Available', value: '6 colors' },
    ],
    // Color variants use chips
    variants: [
      {
        type: 'color',
        label: 'Color',
        options: [
          { label: 'Midnight Black', value: 'black',  color: '#1a1a1a',  available: true  },
          { label: 'Pearl White',    value: 'white',  color: '#f0f0e8',  available: true  },
          { label: 'Rose Gold',      value: 'rose',   color: '#c9a08c',  available: true  },
          { label: 'Sky Blue',       value: 'blue',   color: '#5b9bd5',  available: true  },
          { label: 'Forest Green',   value: 'green',  color: '#3a7d6e',  available: false },
          { label: 'Cyber Yellow',   value: 'yellow', color: '#C8FF00',  available: true  },
        ],
        default: 'black',
      },
    ],
    images: [null, null, null, null],  // null = placeholder emoji
    imageEmoji: '🔵',
  },
  {
    id: 4,
    name: 'Mango Ice E-Liquid',
    category: 'E-Liquid',
    vendor: 'LiquidLab PH',
    vendorId: 'v3',
    price: 399,
    originalPrice: null,
    badge: 'new',
    rating: 4.8,
    reviewCount: 64,
    soldCount: 890,
    stock: 3,
    description: `
      <p>LiquidLab's Mango Ice is a best-seller for good reason — fresh tropical mango layered with a crisp menthol finish that keeps every hit refreshing.</p>
      <h3>Flavor Profile</h3>
      <p>Inhale: Ripe, juicy mango bursting with tropical sweetness. Exhale: A cooling ice finish that lingers perfectly.</p>
      <h3>Best Enjoyed With</h3>
      <ul>
        <li>Pod systems at 1.0Ω–1.2Ω coils</li>
        <li>Mouth-to-lung (MTL) vaping style</li>
        <li>Wattage range: 10–16W</li>
      </ul>
    `,
    specs: [
      { label: 'Flavor',        value: 'Mango Ice' },
      { label: 'VG/PG Ratio',   value: '60/40' },
      { label: 'Nicotine',      value: 'Selectable (3mg, 6mg, 12mg, 18mg)' },
      { label: 'Bottle Size',   value: '30ml' },
      { label: 'Bottle Type',   value: 'Unicorn / dripper' },
      { label: 'Brand',         value: 'LiquidLab PH' },
      { label: 'Origin',        value: 'Philippines' },
    ],
    // Nicotine level via dropdown, bottle size via chips
    variants: [
      {
        type: 'dropdown',
        label: 'Nicotine Strength',
        options: [
          { label: '3mg — Light',      value: '3mg'  },
          { label: '6mg — Regular',    value: '6mg'  },
          { label: '12mg — Strong',    value: '12mg' },
          { label: '18mg — Very Strong', value: '18mg' },
        ],
        default: '6mg',
      },
      {
        type: 'chip',
        label: 'Bottle Size',
        options: [
          { label: '30ml',  value: '30ml',  available: true  },
          { label: '60ml',  value: '60ml',  available: true  },
          { label: '100ml', value: '100ml', available: false },
        ],
        default: '30ml',
      },
    ],
    images: [null, null, null],
    imageEmoji: '🥭',
  },
];

const RELATED_PRODUCTS = [
  { id: 2, name: 'Uwell Caliburn G3',        category: 'Pod System', price: 1899, emoji: '🟢' },
  { id: 3, name: 'Voopoo Drag S Pro',         category: 'Mod Kit',    price: 3499, emoji: '⚫' },
  { id: 6, name: 'Smok Nord 5',              category: 'Pod System',  price: 2199, emoji: '🔴' },
  { id: 8, name: 'Nasty Juice Slow Blow',    category: 'E-Liquid',    price: 449,  emoji: '🍹' },
];

const FBT_PRODUCTS = [
  { id: 4, name: 'Mango Ice E-Liquid', price: 399, emoji: '🥭' },
  { id: 9, name: 'XROS Mesh Coil (0.6Ω)',   price: 299, emoji: '⚙️' },
];

const REVIEWS_DATA = [
  { name: 'Carlos M.',    rating: 5, date: 'Jan 12, 2025', body: 'Absolutely love this device! The flavor is incredible and battery lasts all day. MTL draw is perfect.', variant: 'Midnight Black' },
  { name: 'Patricia L.',  rating: 5, date: 'Jan 5, 2025',  body: 'Best pod system I\'ve used. The COREX coil makes a huge difference compared to my previous device.', variant: 'Pearl White' },
  { name: 'RJ Santos',    rating: 4, date: 'Dec 28, 2024', body: 'Great build quality and satisfying vape. Only minor issue is the airflow could be a bit tighter for strict MTL.', variant: 'Midnight Black' },
  { name: 'Maria B.',     rating: 5, date: 'Dec 20, 2024', body: 'Shipped fast from VapeHub Manila. Packaging was sealed and authentic. Will buy again!', variant: 'Sky Blue' },
  { name: 'Joven T.',     rating: 4, date: 'Dec 14, 2024', body: 'Solid device. Switched from a refillable disposable and this is way better. The pod seal is excellent, no leaks.', variant: 'Midnight Black' },
];

// ─── State ────────────────────────────────
let product = null;
let currentImageIndex = 0;
let qty = 1;
let selectedVariants = {};
let visibleReviews = 3;
let wishlistActive = false;

// ─── Helpers ──────────────────────────────
function formatPrice(n) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id')) || 1;
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('foginCart') || '[]'); }
  catch { return []; }
}

function saveCart(items) {
  localStorage.setItem('foginCart', JSON.stringify(items));
  window.dispatchEvent(new Event('fogin:cart-updated'));
}

function addToCart(id, quantity) {
  const raw = getCart();
  const existing = raw.find(i => i.id === id);
  if (existing) existing.qty += quantity;
  else raw.push({ id, qty: quantity });
  saveCart(raw);
}

function starsHTML(rating, size = 'sm') {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i)          html += '<span class="pdp-star">★</span>';
    else if (rating >= i - 0.5) html += '<span class="pdp-star">⭑</span>';
    else                       html += '<span class="pdp-star" style="opacity:.2">★</span>';
  }
  return html;
}

// ─── Gallery ──────────────────────────────
function renderGallery() {
  const count = product.images.length;

  // Thumbs
  const thumbStrip = document.getElementById('thumbStrip');
  thumbStrip.innerHTML = product.images.map((img, i) => `
    <div
      class="pdp-thumb ${i === 0 ? 'pdp-thumb--active' : ''}"
      data-index="${i}"
      role="listitem"
      aria-label="View image ${i + 1}"
    >
      ${img ? `<img src="${img}" alt="Product angle ${i + 1}">` : product.imageEmoji}
    </div>
  `).join('');

  // Dots
  const dots = document.getElementById('galleryDots');
  dots.innerHTML = product.images.map((_, i) => `
    <button class="pdp-gallery-dot ${i === 0 ? 'pdp-gallery-dot--active' : ''}" data-index="${i}" aria-label="Image ${i + 1}"></button>
  `).join('');

  // Image badge
  const badges = document.getElementById('imageBadges');
  if (product.badge) {
    const labels = { new: 'New', sale: 'Sale', hot: '🔥 Hot', limited: 'Limited' };
    badges.innerHTML = `<span class="pdp-badge pdp-badge--${product.badge}">${labels[product.badge] || product.badge}</span>`;
  }

  setActiveImage(0);
}

function setActiveImage(idx) {
  currentImageIndex = idx;

  // Update placeholder emoji
  const placeholder = document.getElementById('mainImagePlaceholder');
  if (placeholder) placeholder.textContent = product.imageEmoji;

  // Update thumbs
  document.querySelectorAll('.pdp-thumb').forEach(t => {
    t.classList.toggle('pdp-thumb--active', Number(t.dataset.index) === idx);
  });

  // Update dots
  document.querySelectorAll('.pdp-gallery-dot').forEach(d => {
    d.classList.toggle('pdp-gallery-dot--active', Number(d.dataset.index) === idx);
  });
}

function bindGalleryEvents() {
  // Thumb clicks
  document.getElementById('thumbStrip')?.addEventListener('click', e => {
    const thumb = e.target.closest('.pdp-thumb');
    if (thumb) setActiveImage(Number(thumb.dataset.index));
  });

  // Dot clicks
  document.getElementById('galleryDots')?.addEventListener('click', e => {
    const dot = e.target.closest('.pdp-gallery-dot');
    if (dot) setActiveImage(Number(dot.dataset.index));
  });

  // Prev / Next
  document.getElementById('prevImage')?.addEventListener('click', () => {
    const newIdx = (currentImageIndex - 1 + product.images.length) % product.images.length;
    setActiveImage(newIdx);
  });

  document.getElementById('nextImage')?.addEventListener('click', () => {
    const newIdx = (currentImageIndex + 1) % product.images.length;
    setActiveImage(newIdx);
  });

  // Zoom on hover
  const wrap = document.getElementById('mainImageWrap');
  const lens = document.getElementById('zoomLens');
  const preview = document.getElementById('zoomPreview');

  if (wrap && lens && preview) {
    const LENS_SIZE = 80;

    wrap.addEventListener('mouseenter', () => {
      lens.hidden = false;
      preview.hidden = false;
      // Show large emoji in preview
      preview.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:120px;">${product.imageEmoji}</div>`;
    });

    wrap.addEventListener('mouseleave', () => {
      lens.hidden = true;
      preview.hidden = true;
    });

    wrap.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      let x = e.clientX - rect.left - LENS_SIZE / 2;
      let y = e.clientY - rect.top  - LENS_SIZE / 2;
      x = Math.max(0, Math.min(x, rect.width  - LENS_SIZE));
      y = Math.max(0, Math.min(y, rect.height - LENS_SIZE));
      lens.style.left   = x + 'px';
      lens.style.top    = y + 'px';
      lens.style.width  = LENS_SIZE + 'px';
      lens.style.height = LENS_SIZE + 'px';
    });
  }
}

// ─── Info section ─────────────────────────
function renderInfo() {
  document.title = `${product.name} — Fogin`;

  document.getElementById('breadcrumbCategory').textContent = product.category;
  document.getElementById('breadcrumbCategory').href = `catalog.html?category=${encodeURIComponent(product.category)}`;
  document.getElementById('breadcrumbName').textContent = product.name;

  document.getElementById('pdpCategory').textContent = product.category;
  document.getElementById('pdpVendor').textContent = product.vendor;
  document.getElementById('pdpTitle').textContent = product.name;

  // Stars
  document.getElementById('pdpStars').innerHTML = starsHTML(product.rating);
  document.getElementById('pdpRatingCount').textContent = `${product.reviewCount} reviews`;
  document.getElementById('pdpSoldCount').textContent = `${product.soldCount} sold`;

  // Price
  document.getElementById('pdpPrice').textContent = formatPrice(product.price);
  if (product.originalPrice) {
    document.getElementById('pdpOriginalPrice').textContent = formatPrice(product.originalPrice);
    document.getElementById('pdpOriginalPrice').hidden = false;
    const pct = Math.round((1 - product.price / product.originalPrice) * 100);
    document.getElementById('pdpDiscountBadge').textContent = `-${pct}%`;
    document.getElementById('pdpDiscountBadge').hidden = false;
  }

  // Stock
  const stockEl = document.getElementById('pdpStock');
  const dot = stockEl.querySelector('.pdp-stock-dot');
  const qtyEl = document.getElementById('pdpStockQty');
  if (product.stock === 0) {
    dot.className = 'pdp-stock-dot pdp-stock-dot--out';
    stockEl.innerHTML = '<span class="pdp-stock-dot pdp-stock-dot--out"></span> Out of stock';
    document.getElementById('addToCartBtn').disabled = true;
    document.getElementById('buyNowBtn').disabled = true;
  } else if (product.stock <= 5) {
    dot.className = 'pdp-stock-dot pdp-stock-dot--low';
    qtyEl.textContent = `Only ${product.stock} left!`;
  } else {
    qtyEl.textContent = `${product.stock} units`;
  }
}

// ─── Variants ─────────────────────────────
function renderVariants() {
  const container = document.getElementById('pdpVariants');
  if (!product.variants || product.variants.length === 0) {
    container.hidden = true;
    return;
  }

  container.innerHTML = product.variants.map(v => {
    // Set default
    selectedVariants[v.label] = v.default;

    if (v.type === 'color') {
      return `
        <div class="pdp-variant-group">
          <div class="pdp-variant-label">${v.label}: <span id="variantLabel-${v.label}">${v.options.find(o => o.value === v.default)?.label || ''}</span></div>
          <div class="pdp-color-chips" data-variant="${v.label}">
            ${v.options.map(o => `
              <button
                class="pdp-color-chip ${o.value === v.default ? 'pdp-color-chip--active' : ''} ${!o.available ? 'pdp-chip--out' : ''}"
                style="background: ${o.color};"
                data-value="${o.value}"
                data-label="${o.label}"
                title="${o.label}${!o.available ? ' (Out of stock)' : ''}"
                ${!o.available ? 'disabled' : ''}
                aria-label="${o.label}"
              ></button>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (v.type === 'chip') {
      return `
        <div class="pdp-variant-group">
          <div class="pdp-variant-label">${v.label}: <span id="variantLabel-${v.label}">${v.default}</span></div>
          <div class="pdp-chips" data-variant="${v.label}">
            ${v.options.map(o => `
              <button
                class="pdp-chip ${o.value === v.default ? 'pdp-chip--active' : ''} ${!o.available ? 'pdp-chip--out' : ''}"
                data-value="${o.value}"
                ${!o.available ? 'disabled' : ''}
              >${o.label}</button>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (v.type === 'dropdown') {
      return `
        <div class="pdp-variant-group">
          <div class="pdp-variant-label">${v.label}</div>
          <select class="pdp-variant-select" data-variant="${v.label}">
            ${v.options.map(o => `
              <option value="${o.value}" ${o.value === v.default ? 'selected' : ''}>${o.label}</option>
            `).join('')}
          </select>
        </div>
      `;
    }

    return '';
  }).join('');
}

function bindVariantEvents() {
  // Chip clicks
  document.querySelectorAll('.pdp-chips').forEach(group => {
    group.addEventListener('click', e => {
      const chip = e.target.closest('.pdp-chip');
      if (!chip || chip.disabled) return;
      const variantName = group.dataset.variant;
      group.querySelectorAll('.pdp-chip').forEach(c => c.classList.remove('pdp-chip--active'));
      chip.classList.add('pdp-chip--active');
      selectedVariants[variantName] = chip.dataset.value;
      const label = document.getElementById(`variantLabel-${variantName}`);
      if (label) label.textContent = chip.dataset.value;
    });
  });

  // Color chip clicks
  document.querySelectorAll('.pdp-color-chips').forEach(group => {
    group.addEventListener('click', e => {
      const chip = e.target.closest('.pdp-color-chip');
      if (!chip || chip.disabled) return;
      const variantName = group.dataset.variant;
      group.querySelectorAll('.pdp-color-chip').forEach(c => c.classList.remove('pdp-color-chip--active'));
      chip.classList.add('pdp-color-chip--active');
      selectedVariants[variantName] = chip.dataset.value;
      const label = document.getElementById(`variantLabel-${variantName}`);
      if (label) label.textContent = chip.dataset.label;
    });
  });

  // Dropdown changes
  document.querySelectorAll('.pdp-variant-select').forEach(select => {
    select.addEventListener('change', () => {
      selectedVariants[select.dataset.variant] = select.value;
    });
  });
}

// ─── Quantity ─────────────────────────────
function bindQtyEvents() {
  const decBtn = document.getElementById('qtyDec');
  const incBtn = document.getElementById('qtyInc');
  const valEl  = document.getElementById('qtyVal');

  decBtn?.addEventListener('click', () => {
    if (qty > 1) {
      qty--;
      valEl.textContent = qty;
      decBtn.disabled = qty <= 1;
    }
  });

  incBtn?.addEventListener('click', () => {
    if (qty < product.stock) {
      qty++;
      valEl.textContent = qty;
      document.getElementById('qtyDec').disabled = false;
    }
  });
}

// ─── Cart actions ──────────────────────────
let toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('pdpToast');
  const msgEl = document.getElementById('pdpToastMsg');
  if (!toast) return;
  if (toastTimer) clearTimeout(toastTimer);
  msgEl.textContent = msg;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('pdp-toast--visible'));
  toastTimer = setTimeout(() => {
    toast.classList.remove('pdp-toast--visible');
    setTimeout(() => { toast.hidden = true; }, 260);
  }, 3000);
}

function bindActions() {
  document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    addToCart(product.id, qty);
    showToast(`${product.name} added to cart`);
  });

  document.getElementById('buyNowBtn')?.addEventListener('click', () => {
    addToCart(product.id, qty);
    window.location.href = 'checkout.html';
  });

  document.getElementById('wishlistBtn')?.addEventListener('click', e => {
    wishlistActive = !wishlistActive;
    e.currentTarget.classList.toggle('pdp-btn-wishlist--active', wishlistActive);
    const svg = e.currentTarget.querySelector('svg');
    svg.setAttribute('fill', wishlistActive ? 'currentColor' : 'none');
    showToast(wishlistActive ? 'Added to wishlist' : 'Removed from wishlist');
  });
}

// ─── Tabs ──────────────────────────────────
function renderDescription() {
  document.getElementById('pdpDescription').innerHTML = product.description;
}

function renderSpecs() {
  const rows = product.specs.map(s => `
    <tr>
      <td>${s.label}</td>
      <td>${s.value}</td>
    </tr>
  `).join('');
  document.getElementById('pdpSpecs').innerHTML = `<table class="pdp-spec-table">${rows}</table>`;
}

function renderReviews() {
  // Review tab badge
  document.getElementById('reviewTabBadge').textContent = product.reviewCount;
  document.getElementById('reviewTotal').textContent = `${product.reviewCount} reviews`;
  document.getElementById('bigScore').textContent = product.rating.toFixed(1);
  document.getElementById('bigStars').innerHTML = starsHTML(product.rating, 'lg');

  // Breakdown bars (mock distribution)
  const dist = { 5: 78, 4: 29, 3: 12, 2: 6, 1: 3 };
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  document.getElementById('reviewBars').innerHTML = [5, 4, 3, 2, 1].map(n => `
    <div class="pdp-reviews-bar-row">
      <span class="pdp-reviews-bar-label">${n}★</span>
      <div class="pdp-reviews-bar-track">
        <div class="pdp-reviews-bar-fill" style="width: ${(dist[n] / total * 100).toFixed(1)}%"></div>
      </div>
      <span class="pdp-reviews-bar-count">${dist[n]}</span>
    </div>
  `).join('');

  renderReviewCards();
}

function renderReviewCards() {
  const list = document.getElementById('reviewsList');
  const visible = REVIEWS_DATA.slice(0, visibleReviews);
  list.innerHTML = visible.map(r => `
    <div class="pdp-review-card">
      <div class="pdp-review-card__top">
        <div class="pdp-review-card__avatar">${r.name.charAt(0)}</div>
        <div class="pdp-review-card__meta">
          <div class="pdp-review-card__name">${r.name}</div>
          <div class="pdp-review-card__date">${r.date}</div>
        </div>
        <div class="pdp-review-card__stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      </div>
      <div class="pdp-review-card__body">
        ${r.body}
        ${r.variant ? `<span class="pdp-review-card__variant">Variant: ${r.variant}</span>` : ''}
      </div>
    </div>
  `).join('');

  const btn = document.getElementById('loadMoreReviews');
  if (btn) btn.hidden = visibleReviews >= REVIEWS_DATA.length;
}

function renderVendorCard() {
  document.getElementById('pdpVendor').textContent = product.vendor;
  document.getElementById('vendorSection').innerHTML = `
    <div class="pdp-vendor-avatar">${product.vendor.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
    <div class="pdp-vendor-info">
      <div class="pdp-vendor-name">${product.vendor}</div>
      <div class="pdp-vendor-meta">
        <span class="pdp-vendor-stat">⭐ 4.8 seller rating</span>
        <span class="pdp-vendor-stat">📦 98% positive feedback</span>
        <span class="pdp-vendor-stat">🏪 Verified vendor</span>
      </div>
    </div>
    <a href="#" class="pdp-vendor-visit">Visit Store</a>
  `;
}

function bindTabEvents() {
  document.querySelectorAll('.pdp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      document.querySelectorAll('.pdp-tab').forEach(t => {
        t.classList.toggle('pdp-tab--active', t.dataset.tab === target);
        t.setAttribute('aria-selected', t.dataset.tab === target ? 'true' : 'false');
      });

      document.querySelectorAll('.pdp-tab-panel').forEach(panel => {
        panel.hidden = panel.id !== `tab-${target}`;
      });
    });
  });

  document.getElementById('loadMoreReviews')?.addEventListener('click', () => {
    visibleReviews += 3;
    renderReviewCards();
  });
}

// ─── FBT ──────────────────────────────────
function renderFBT() {
  const allItems = [
    { id: product.id, name: product.name, price: product.price, emoji: product.imageEmoji },
    ...FBT_PRODUCTS
  ];

  const totalPrice = allItems.reduce((s, i) => s + i.price, 0);

  const itemsHTML = allItems.map((item, idx) => `
    ${idx > 0 ? '<span class="pdp-fbt-sep">+</span>' : ''}
    <div class="pdp-fbt-item">
      <div class="pdp-fbt-img">${item.emoji}</div>
      <div class="pdp-fbt-name">${item.name}</div>
      <div class="pdp-fbt-price">${formatPrice(item.price)}</div>
    </div>
  `).join('');

  document.getElementById('fbtContainer').innerHTML = `
    ${itemsHTML}
    <div class="pdp-fbt-total">
      <span class="pdp-fbt-total-label">All ${allItems.length} items</span>
      <span class="pdp-fbt-total-price">${formatPrice(totalPrice)}</span>
      <button class="pdp-fbt-total-btn" id="fbtAddAll">Add All to Cart</button>
    </div>
  `;

  document.getElementById('fbtAddAll')?.addEventListener('click', () => {
    allItems.forEach(item => addToCart(item.id, 1));
    showToast(`${allItems.length} items added to cart`);
  });
}

// ─── Related products ──────────────────────
function renderRelated() {
  const grid = document.getElementById('relatedGrid');
  grid.innerHTML = RELATED_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4).map(p => `
    <a href="product.html?id=${p.id}" class="pdp-related-card">
      <div class="pdp-related-card__img">${p.emoji}</div>
      <div class="pdp-related-card__body">
        <div class="pdp-related-card__cat">${p.category}</div>
        <div class="pdp-related-card__name">${p.name}</div>
        <div class="pdp-related-card__price">${formatPrice(p.price)}</div>
      </div>
    </a>
  `).join('');
}

// ─── Init ─────────────────────────────────
function init() {
  const id = getProductId();
  product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  renderGallery();
  bindGalleryEvents();

  renderInfo();
  renderVariants();
  bindVariantEvents();
  bindQtyEvents();
  bindActions();

  renderDescription();
  renderSpecs();
  renderReviews();
  renderVendorCard();
  bindTabEvents();

  renderFBT();
  renderRelated();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
