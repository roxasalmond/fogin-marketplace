/* ============================================
   PRODUCT DETAIL PAGE
   js/shop/product.js
============================================ */

import { fetchProductById, fetchProducts } from '../utils/api.js';

// ── State ──────────────────────────────────────────────────────────────────────

let product = null;
let currentImageIndex = 0;
let qty = 1;
let selectedVariants = {};
let visibleReviews = 3;
let wishlistActive = false;

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || null;
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

function starsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i)           html += '<span class="pdp-star">★</span>';
    else if (rating >= i - 0.5) html += '<span class="pdp-star">½</span>';
    else                        html += '<span class="pdp-star" style="opacity:.2">★</span>';
  }
  return html;
}

// ── API → product shape mapper ─────────────────────────────────────────────────
// Maps the marketplace API response to the shape the render functions expect

function mapApiProduct(data) {
  // Build images array from product image + variant images
  const images = [];
  if (data.image_url) images.push(data.image_url);
  data.variants?.forEach(v => {
    if (v.image_url && !images.includes(v.image_url)) images.push(v.image_url);
  });
  if (!images.length) images.push(null); // at least one slot for placeholder

  // Derive price from first in-stock variant, fallback to first variant
  const firstInStock = data.variants?.find(v => v.in_stock);
  const firstVariant = firstInStock || data.variants?.[0];
  const price        = parseFloat(firstVariant?.price) || 0;
  const originalPrice = firstVariant?.on_sale && firstVariant?.sale_price
    ? parseFloat(firstVariant.price)
    : null;
  const displayPrice = firstVariant?.on_sale && firstVariant?.sale_price
    ? parseFloat(firstVariant.sale_price)
    : price;

  // Total stock — count in-stock variants
  const inStockCount = data.variants?.filter(v => v.in_stock).length || 0;
  const stock = inStockCount > 0 ? inStockCount * 10 : 0; // approximate unit count

  // Map variants — group by attribute_slug into chip/dropdown selectors
  const variantGroups = buildVariantGroups(data.variants || []);

  return {
    id:           data.id,
    name:         data.name,
    slug:         data.slug,
    category:     data.category_name || 'Product',
    category_slug: data.category_slug,
    vendor:       data.vendor_name || '',
    vendor_slug:  data.vendor_slug,
    vendor_logo:  data.vendor_logo,
    vendor_city:  data.vendor_city,
    vendor_desc:  data.vendor_description,
    vendor_fb:    data.vendor_facebook,
    vendor_ig:    data.vendor_instagram,
    description:  data.description || '<p>No description available.</p>',
    price:        displayPrice,
    originalPrice,
    badge:        firstVariant?.on_sale ? 'sale' : null,
    rating:       4.8,        // placeholder — no reviews API yet
    reviewCount:  0,
    soldCount:    0,
    stock,
    images,
    imageEmoji:   '📦',
    variants:     variantGroups,
    specs:        buildSpecs(data.variants || []),
    _raw:         data,       // keep raw for vendor card
  };
}

function buildVariantGroups(variants) {
  if (!variants.length) return [];

  // Collect all unique attributes across all variants
  const attributeMap = new Map();

  variants.forEach(variant => {
    variant.attributes?.forEach(attr => {
      if (!attributeMap.has(attr.attribute_slug)) {
        attributeMap.set(attr.attribute_slug, {
          slug:       attr.attribute_slug,
          label:      attr.attribute_name,
          input_type: attr.input_type,
          options:    new Map(),
        });
      }
      const group = attributeMap.get(attr.attribute_slug);
      if (!group.options.has(attr.value)) {
        // Check if any variant with this attribute value is in stock
        const inStock = variants.some(v =>
          v.attributes?.some(a => a.attribute_slug === attr.attribute_slug && a.value === attr.value)
          && v.in_stock
        );
        group.options.set(attr.value, { label: attr.value, value: attr.value, available: inStock });
      }
    });
  });

  if (!attributeMap.size) return [];

  return Array.from(attributeMap.values()).map(group => {
    const options = Array.from(group.options.values());
    const firstAvailable = options.find(o => o.available) || options[0];

    // Color attribute → color chip type
    if (group.slug === 'color') {
      return {
        type:    'color',
        label:   group.label,
        options: options.map(o => ({
          label:     o.label,
          value:     o.value,
          color:     '#888888', // no hex in DB — use generic
          available: o.available,
        })),
        default: firstAvailable?.value,
      };
    }

    // Select input_type → dropdown
    if (group.input_type === 'select') {
      return {
        type:    'dropdown',
        label:   group.label,
        options: options.map(o => ({ label: o.label, value: o.value })),
        default: firstAvailable?.value,
      };
    }

    // Text or anything else → chip
    return {
      type:    'chip',
      label:   group.label,
      options,
      default: firstAvailable?.value,
    };
  });
}

function buildSpecs(variants) {
  if (!variants.length) return [];

  // Use first variant's attributes as specs
  const first = variants[0];
  return (first.attributes || []).map(attr => ({
    label: attr.attribute_name,
    value: attr.value,
  }));
}

// ── Gallery ────────────────────────────────────────────────────────────────────

function renderGallery() {
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

  const dots = document.getElementById('galleryDots');
  dots.innerHTML = product.images.map((_, i) => `
    <button class="pdp-gallery-dot ${i === 0 ? 'pdp-gallery-dot--active' : ''}" data-index="${i}" aria-label="Image ${i + 1}"></button>
  `).join('');

  const badges = document.getElementById('imageBadges');
  if (product.badge) {
    const labels = { new: 'New', sale: 'Sale', hot: '🔥 Hot', limited: 'Limited' };
    badges.innerHTML = `<span class="pdp-badge pdp-badge--${product.badge}">${labels[product.badge] || product.badge}</span>`;
  }

  setActiveImage(0);
}

function setActiveImage(idx) {
  currentImageIndex = idx;
  const img = product.images[idx];

  const placeholder = document.getElementById('mainImagePlaceholder');
  const inner       = document.getElementById('mainImageInner');

  if (img) {
    // Show real image
    let imgEl = inner.querySelector('.pdp-main-image');
    if (!imgEl) {
      imgEl = document.createElement('img');
      imgEl.className = 'pdp-main-image';
      imgEl.style.cssText = 'width:100%;height:100%;object-fit:contain;';
      inner.appendChild(imgEl);
    }
    imgEl.src = img;
    imgEl.alt = product.name;
    if (placeholder) placeholder.style.display = 'none';
  } else {
    if (placeholder) {
      placeholder.style.display = '';
      placeholder.textContent = product.imageEmoji;
    }
  }

  document.querySelectorAll('.pdp-thumb').forEach(t => {
    t.classList.toggle('pdp-thumb--active', Number(t.dataset.index) === idx);
  });
  document.querySelectorAll('.pdp-gallery-dot').forEach(d => {
    d.classList.toggle('pdp-gallery-dot--active', Number(d.dataset.index) === idx);
  });
}

function bindGalleryEvents() {
  document.getElementById('thumbStrip')?.addEventListener('click', e => {
    const thumb = e.target.closest('.pdp-thumb');
    if (thumb) setActiveImage(Number(thumb.dataset.index));
  });

  document.getElementById('galleryDots')?.addEventListener('click', e => {
    const dot = e.target.closest('.pdp-gallery-dot');
    if (dot) setActiveImage(Number(dot.dataset.index));
  });

  document.getElementById('prevImage')?.addEventListener('click', () => {
    const newIdx = (currentImageIndex - 1 + product.images.length) % product.images.length;
    setActiveImage(newIdx);
  });

  document.getElementById('nextImage')?.addEventListener('click', () => {
    const newIdx = (currentImageIndex + 1) % product.images.length;
    setActiveImage(newIdx);
  });
}

// ── Info section ───────────────────────────────────────────────────────────────

function renderInfo() {
  document.title = `${product.name} — Fogin`;

  document.getElementById('breadcrumbCategory').textContent = product.category;
  document.getElementById('breadcrumbCategory').href = `catalog.html?category_id=${product.category_slug}`;
  document.getElementById('breadcrumbName').textContent = product.name;

  document.getElementById('pdpCategory').textContent = product.category;
  document.getElementById('pdpVendor').textContent   = product.vendor;
  document.getElementById('pdpTitle').textContent    = product.name;

  document.getElementById('pdpStars').innerHTML = starsHTML(product.rating);

  if (product.reviewCount > 0) {
    document.getElementById('pdpRatingCount').textContent = `${product.reviewCount} reviews`;
  } else {
    document.getElementById('pdpRatingCount').textContent = 'No reviews yet';
  }

  if (product.soldCount > 0) {
    document.getElementById('pdpSoldCount').textContent = `${product.soldCount} sold`;
  } else {
    document.getElementById('pdpSoldCount').closest('.pdp-meta-sep')?.remove();
    document.getElementById('pdpSoldCount').style.display = 'none';
  }

  document.getElementById('pdpPrice').textContent = formatPrice(product.price);

  if (product.originalPrice) {
    document.getElementById('pdpOriginalPrice').textContent = formatPrice(product.originalPrice);
    document.getElementById('pdpOriginalPrice').hidden = false;
    const pct = Math.round((1 - product.price / product.originalPrice) * 100);
    document.getElementById('pdpDiscountBadge').textContent = `-${pct}%`;
    document.getElementById('pdpDiscountBadge').hidden = false;
  }

  const stockEl = document.getElementById('pdpStock');
  const dot     = stockEl?.querySelector('.pdp-stock-dot');
  const qtyEl   = document.getElementById('pdpStockQty');

  if (product.stock === 0) {
    if (dot) dot.className = 'pdp-stock-dot pdp-stock-dot--out';
    if (stockEl) stockEl.innerHTML = '<span class="pdp-stock-dot pdp-stock-dot--out"></span> Out of stock';
    const addBtn = document.getElementById('addToCartBtn');
    const buyBtn = document.getElementById('buyNowBtn');
    if (addBtn) addBtn.disabled = true;
    if (buyBtn) buyBtn.disabled = true;
  } else {
    if (qtyEl) qtyEl.textContent = 'In stock';
  }
}

// ── Variants ───────────────────────────────────────────────────────────────────

function renderVariants() {
  const container = document.getElementById('pdpVariants');
  if (!product.variants || !product.variants.length) {
    container.hidden = true;
    return;
  }

  container.innerHTML = product.variants.map(v => {
    selectedVariants[v.label] = v.default;

    if (v.type === 'color') {
      return `
        <div class="pdp-variant-group">
          <div class="pdp-variant-label">${v.label}: <span id="variantLabel-${v.label}">${v.options.find(o => o.value === v.default)?.label || ''}</span></div>
          <div class="pdp-color-chips" data-variant="${v.label}">
            ${v.options.map(o => `
              <button
                class="pdp-color-chip ${o.value === v.default ? 'pdp-color-chip--active' : ''} ${!o.available ? 'pdp-chip--out' : ''}"
                style="background:${o.color};"
                data-value="${o.value}"
                data-label="${o.label}"
                title="${o.label}${!o.available ? ' (Out of stock)' : ''}"
                ${!o.available ? 'disabled' : ''}
                aria-label="${o.label}"
              ></button>
            `).join('')}
          </div>
        </div>`;
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
        </div>`;
    }

    if (v.type === 'dropdown') {
      return `
        <div class="pdp-variant-group">
          <div class="pdp-variant-label">${v.label}</div>
          <select class="pdp-variant-select" data-variant="${v.label}">
            ${v.options.map(o => `<option value="${o.value}" ${o.value === v.default ? 'selected' : ''}>${o.label}</option>`).join('')}
          </select>
        </div>`;
    }

    return '';
  }).join('');
}

function bindVariantEvents() {
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

  document.querySelectorAll('.pdp-variant-select').forEach(select => {
    select.addEventListener('change', () => {
      selectedVariants[select.dataset.variant] = select.value;
    });
  });
}

// ── Quantity ───────────────────────────────────────────────────────────────────

function bindQtyEvents() {
  const decBtn = document.getElementById('qtyDec');
  const incBtn = document.getElementById('qtyInc');
  const valEl  = document.getElementById('qtyVal');

  decBtn?.addEventListener('click', () => {
    if (qty > 1) { qty--; valEl.textContent = qty; decBtn.disabled = qty <= 1; }
  });

  incBtn?.addEventListener('click', () => {
    qty++;
    valEl.textContent = qty;
    if (decBtn) decBtn.disabled = false;
  });
}

// ── Cart actions ───────────────────────────────────────────────────────────────

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
    window.location.href = 'cart.html';
  });

  document.getElementById('wishlistBtn')?.addEventListener('click', e => {
    wishlistActive = !wishlistActive;
    e.currentTarget.classList.toggle('pdp-btn-wishlist--active', wishlistActive);
    const svg = e.currentTarget.querySelector('svg');
    svg?.setAttribute('fill', wishlistActive ? 'currentColor' : 'none');
    showToast(wishlistActive ? 'Added to wishlist' : 'Removed from wishlist');
  });
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

function renderDescription() {
  const el = document.getElementById('pdpDescription');
  if (el) el.innerHTML = product.description;
}

function renderSpecs() {
  const el = document.getElementById('pdpSpecs');
  if (!el) return;
  if (!product.specs.length) {
    el.innerHTML = '<p>No specifications available.</p>';
    return;
  }
  const rows = product.specs.map(s => `<tr><td>${s.label}</td><td>${s.value}</td></tr>`).join('');
  el.innerHTML = `<table class="pdp-spec-table">${rows}</table>`;
}

function renderReviews() {
  document.getElementById('reviewTabBadge').textContent = product.reviewCount || '0';
  document.getElementById('reviewTotal').textContent    = `${product.reviewCount} reviews`;
  document.getElementById('bigScore').textContent       = product.rating.toFixed(1);
  document.getElementById('bigStars').innerHTML         = starsHTML(product.rating);

  const list = document.getElementById('reviewsList');
  if (list) list.innerHTML = '<p style="color:var(--color-text-muted);padding:16px 0">No reviews yet. Be the first to review this product.</p>';

  const btn = document.getElementById('loadMoreReviews');
  if (btn) btn.hidden = true;

  const bars = document.getElementById('reviewBars');
  if (bars) bars.innerHTML = '';
}

function renderVendorCard() {
  document.getElementById('pdpVendor').textContent = product.vendor;
  const section = document.getElementById('vendorSection');
  if (!section) return;

  const initials = product.vendor.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  section.innerHTML = `
    <div class="pdp-vendor-avatar">${initials}</div>
    <div class="pdp-vendor-info">
      <div class="pdp-vendor-name">${product.vendor}</div>
      <div class="pdp-vendor-meta">
        ${product.vendor_city ? `<span class="pdp-vendor-stat">📍 ${product.vendor_city}</span>` : ''}
        <span class="pdp-vendor-stat">✅ Verified vendor</span>
        ${product.vendor_fb  ? `<span class="pdp-vendor-stat"><a href="${product.vendor_fb}" target="_blank">Facebook</a></span>` : ''}
        ${product.vendor_ig  ? `<span class="pdp-vendor-stat"><a href="${product.vendor_ig}" target="_blank">Instagram</a></span>` : ''}
      </div>
      ${product.vendor_desc ? `<p class="pdp-vendor-desc">${product.vendor_desc}</p>` : ''}
    </div>
    <a href="catalog.html?vendor=${product.vendor_slug}" class="pdp-vendor-visit">Visit Store</a>
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
}

// ── Related products ───────────────────────────────────────────────────────────

async function renderRelated() {
  const grid = document.getElementById('relatedGrid');
  if (!grid) return;

  try {
    const data = await fetchProducts({
      page:        1,
      limit:       5,
      category_id: product._raw.category_slug ? null : null,
    });

    const related = (data.items || []).filter(p => p.id !== product.id).slice(0, 4);

    if (!related.length) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = related.map(p => `
      <a href="product.html?id=${p.id}" class="pdp-related-card">
        <div class="pdp-related-card__img">
          ${p.image_url
            ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;">`
            : '📦'}
        </div>
        <div class="pdp-related-card__body">
          <div class="pdp-related-card__cat">${p.category_name}</div>
          <div class="pdp-related-card__name">${p.name}</div>
          <div class="pdp-related-card__price">${p.price_min ? '₱' + parseFloat(p.price_min).toLocaleString('en-PH') : '—'}</div>
        </div>
      </a>
    `).join('');
  } catch (err) {
    console.error('[product] Failed to load related products:', err);
    grid.innerHTML = '';
  }
}

// ── FBT ───────────────────────────────────────────────────────────────────────

function renderFBT() {
  // Hide FBT section — no FBT data from API yet
  const section = document.querySelector('.pdp-fbt-section');
  if (section) section.hidden = true;
}

// ── Loading state ──────────────────────────────────────────────────────────────

function showLoadingState() {
  document.getElementById('pdpTitle').textContent = 'Loading…';
  document.getElementById('pdpPrice').textContent = '—';
}

function showErrorState(message) {
  document.getElementById('pdpTitle').textContent = message || 'Product not found';
  document.getElementById('pdpPrice').textContent = '—';
  document.getElementById('pdpStock').innerHTML   = '';
  const addBtn = document.getElementById('addToCartBtn');
  const buyBtn = document.getElementById('buyNowBtn');
  if (addBtn) addBtn.disabled = true;
  if (buyBtn) buyBtn.disabled = true;
}

// ── Init ───────────────────────────────────────────────────────────────────────

async function init() {
  const id = getProductId();

  if (!id) {
    showErrorState('No product specified.');
    return;
  }

  showLoadingState();

  try {
    const data = await fetchProductById(id);
    product = mapApiProduct(data);

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

  } catch (err) {
    console.error('[product] Failed to load product:', err);
    showErrorState(err.status === 404 ? 'Product not found.' : 'Failed to load product.');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}