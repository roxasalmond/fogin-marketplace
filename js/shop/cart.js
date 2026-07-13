/* ============================================
   CART PAGE
   js/pages/cart.js
============================================ */

import { fetchProductById, fetchProducts } from '../utils/api.js';
import { mapCartProduct } from '../utils/cart-product.js';
import { esc } from '../../../fogin-shared/js/core/sanitize.js';

// ─── Constants ────────────────────────────
const CART_KEY = 'foginCart';
const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 150;

// ─── Cart State ───────────────────────────
let cartItems = [];
let selectedIds = new Set();
let appliedVoucher = null;

// ─── Voucher codes (static for now) ───────
const VOUCHERS = {
  'FOGIN10': { type: 'percent', value: 10, label: '10% off' },
  'WELCOME':  { type: 'flat',    value: 200, label: '₱200 off' },
};

// ─── Helpers ──────────────────────────────
function formatPrice(amount) {
  return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('fogin:cart-updated'));
}

function getVendorInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Build cart items from real product data ──────────────────────────
// FIX: previously looked up entry.id against a hardcoded local PRODUCTS_DB
// with fake integer ids 1-8. Real cart entries (added via catalog.js/
// product.js) carry real database ids, which never matched - every item
// was silently filtered out, leaving the cart page empty while the navbar
// badge (which just sums raw qty, no product lookup) showed the correct
// count. Now fetches each item's real data from the API, same as
// shop/product.js does for a single product.
async function buildCartItems() {
  const raw = getCart();
  const results = await Promise.all(raw.map(async entry => {
    try {
      const data = await fetchProductById(entry.id);
      return { ...mapCartProduct(data), qty: entry.qty || 1 };
    } catch (err) {
      console.error(`[cart] Failed to load product ${entry.id}:`, err);
      return null;
    }
  }));
  return results.filter(Boolean);
}

// ─── Totals ───────────────────────────────
function calcTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (subtotal === 0 ? 0 : SHIPPING_FEE);

  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') {
      discount = Math.round(subtotal * (appliedVoucher.value / 100));
    } else {
      discount = Math.min(appliedVoucher.value, subtotal);
    }
  }

  const total = Math.max(0, subtotal + shipping - discount);
  return { subtotal, shipping, discount, total };
}

// ─── Group items by vendor ─────────────────
function groupByVendor(items) {
  const groups = {};
  items.forEach(item => {
    if (!groups[item.vendorId]) {
      groups[item.vendorId] = { vendorId: item.vendorId, vendorName: item.vendor, items: [] };
    }
    groups[item.vendorId].items.push(item);
  });
  return Object.values(groups);
}

// ─── Render ───────────────────────────────
function renderCartItem(item) {
  const isSelected = selectedIds.has(item.id);
  const imageHTML = item.image
    ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" class="cart-item__image">`
    : `<div class="cart-item__image-placeholder">📦</div>`;

  return `
    <div class="cart-item" data-id="${esc(item.id)}">
      <input
        type="checkbox"
        class="cart-item__checkbox"
        data-id="${esc(item.id)}"
        aria-label="Select ${esc(item.name)}"
        ${isSelected ? 'checked' : ''}
      >

      <div class="cart-item__image-wrap">
        ${imageHTML}
      </div>

      <div class="cart-item__info">
        <span class="cart-item__category">${esc(item.category)}</span>
        <span class="cart-item__name">${esc(item.name)}</span>
        <span class="cart-item__variant">In stock</span>
        <span class="cart-item__price-mobile">${formatPrice(item.price * item.qty)}</span>
      </div>

      <div class="cart-item__actions">
        <span class="cart-item__price">${formatPrice(item.price * item.qty)}</span>
        <span class="cart-item__original-price">${formatPrice(item.price)} each</span>

        <div class="cart-qty">
          <button class="cart-qty__btn" data-action="decrease" data-id="${esc(item.id)}" aria-label="Decrease quantity" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
          <span class="cart-qty__value" aria-label="Quantity">${item.qty}</span>
          <button class="cart-qty__btn" data-action="increase" data-id="${esc(item.id)}" aria-label="Increase quantity">+</button>
        </div>

        <button class="cart-item__remove" data-action="remove" data-id="${esc(item.id)}" aria-label="Remove ${esc(item.name)}">
          <svg viewBox="0 0 16 16" fill="currentColor" width="12">
            <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 010-2h3.5a1 1 0 011-1h2a1 1 0 011 1H13.5a1 1 0 011 1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118z" clip-rule="evenodd"/>
          </svg>
          Remove
        </button>
      </div>
    </div>
  `;
}

function renderVendorGroup(group) {
  const itemsHTML = group.items.map(renderCartItem).join('');
  return `
    <div class="cart-vendor-group">
      <div class="cart-vendor-header">
        <div class="cart-vendor-avatar">${getVendorInitials(group.vendorName)}</div>
        <span class="cart-vendor-name">${esc(group.vendorName)}</span>
        <span class="cart-vendor-badge">Verified Vendor</span>
      </div>
      ${itemsHTML}
    </div>
  `;
}

// FIX: previously showed FEATURED_PRODUCTS = PRODUCTS_DB.slice(0, 4) - the
// same fake stub data. Clicking "Add to Cart" here would have re-added a
// fake id, perpetuating the exact bug this rewrite fixes. Now takes real
// items from fetchProducts(), same shape catalog.js already renders cards
// from (price_min, image_url, category_name).
function renderEmptyFeatured(products) {
  return products.map(p => `
    <article class="product-card" data-empty-add="${esc(p.id)}">
      <div class="product-card__img-wrap">
        ${p.image_url
          ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:contain;">`
          : `<div class="product-card__img-placeholder">📦</div>`}
      </div>
      <div class="product-card__body">
        <div class="product-card__vendor">${esc(p.category_name || '')}</div>
        <h3 class="product-card__name">${esc(p.name)}</h3>
        <div class="product-card__price-row">
          <span class="product-card__price">${p.price_min ? formatPrice(parseFloat(p.price_min)) : '—'}</span>
        </div>
      </div>
      <div class="product-card__footer">
        <button class="product-card__add" data-empty-add="${esc(p.id)}">Add to Cart</button>
      </div>
    </article>
  `).join('');
}

// ─── Update UI ────────────────────────────
function updateSummary() {
  const { subtotal, shipping, discount, total } = calcTotals(cartItems);

  document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('summary-shipping').textContent = shipping === 0 && subtotal > 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('summary-total').textContent = formatPrice(total);

  // Discount row
  const discountRow = document.getElementById('discount-row');
  if (discount > 0) {
    document.getElementById('summary-discount').textContent = `-${formatPrice(discount)}`;
    discountRow.classList.remove('is-hidden');
  } else {
    discountRow.classList.add('is-hidden');
  }

  // Free shipping progress
  const progress = document.getElementById('free-shipping-progress');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    fill.style.width = '100%';
    label.innerHTML = '🎉 You qualify for <strong>free shipping!</strong>';
  } else {
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    fill.style.width = `${pct}%`;
    label.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more for free shipping`;
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = cartItems.length === 0;
    checkoutBtn.textContent = '';
    checkoutBtn.innerHTML = `
      Proceed to Checkout · ${formatPrice(total)}
      <svg viewBox="0 0 20 20" fill="currentColor" width="16">
        <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
      </svg>
    `;
  }
}

function updateItemCount() {
  const total = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById('cart-item-count');
  if (el) el.textContent = `${total} item${total !== 1 ? 's' : ''}`;
}

function updateSelectAll() {
  const selectAll = document.getElementById('select-all-items');
  if (!selectAll) return;
  if (cartItems.length === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  } else if (selectedIds.size === cartItems.length) {
    selectAll.checked = true;
    selectAll.indeterminate = false;
  } else if (selectedIds.size > 0) {
    selectAll.indeterminate = true;
  } else {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }
}

async function render() {
  const container    = document.getElementById('cart-items-container');
  const layout       = document.getElementById('cart-layout');
  const emptyState   = document.getElementById('cart-empty');
  const bulkActions  = document.getElementById('cart-bulk-actions');

  if (cartItems.length === 0) {
    layout.classList.add('is-hidden');
    emptyState.hidden = false;
    bulkActions.classList.add('is-hidden');

    const featuredContainer = document.getElementById('empty-cart-products');
    if (featuredContainer) {
      try {
        const data = await fetchProducts({ limit: 4 });
        featuredContainer.innerHTML = renderEmptyFeatured(data.items || []);
        bindEmptyCartEvents(featuredContainer);
      } catch (err) {
        console.error('[cart] Failed to load featured products:', err);
        featuredContainer.innerHTML = '';
      }
    }
    return;
  }

  layout.classList.remove('is-hidden');
  emptyState.hidden = true;
  bulkActions.classList.remove('is-hidden');

  const groups = groupByVendor(cartItems);
  container.innerHTML = groups.map(renderVendorGroup).join('');

  updateSummary();
  updateItemCount();
  updateSelectAll();
  bindItemEvents();
}

// ─── Item Actions ─────────────────────────
// FIX: removed Number(id) coercion throughout this file. Cart entry ids are
// real database ids (strings, likely UUIDs) - Number('some-uuid') is NaN,
// which would never match anything even after the product-lookup fix above.
async function updateQty(id, delta) {
  const raw = getCart();
  const idx = raw.findIndex(i => i.id === id);
  if (idx === -1) return;
  raw[idx].qty = Math.max(1, (raw[idx].qty || 1) + delta);
  saveCart(raw);
  cartItems = await buildCartItems();
  await render();
}

async function removeItem(id) {
  const raw = getCart().filter(i => i.id !== id);
  selectedIds.delete(id);
  saveCart(raw);
  cartItems = await buildCartItems();
  await render();
}

async function removeSelected() {
  if (selectedIds.size === 0) return;
  const raw = getCart().filter(i => !selectedIds.has(i.id));
  selectedIds.clear();
  saveCart(raw);
  cartItems = await buildCartItems();
  await render();
}

// ─── Bind item-level events after render ──
function bindItemEvents() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'increase') await updateQty(id, 1);
    if (action === 'decrease') await updateQty(id, -1);
    if (action === 'remove') await removeItem(id);
  });

  container.addEventListener('change', (e) => {
    const checkbox = e.target.closest('.cart-item__checkbox');
    if (!checkbox) return;
    const id = checkbox.dataset.id;
    if (checkbox.checked) selectedIds.add(id);
    else selectedIds.delete(id);
    updateSelectAll();
  });
}

// ─── Global for empty state add to cart ───
function bindEmptyCartEvents(container) {
  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-empty-add]');
    if (!btn) return;
    const id = btn.dataset.emptyAdd;
    const raw = getCart();
    const existing = raw.find(i => i.id === id);
    if (existing) existing.qty += 1;
    else raw.push({ id, qty: 1 });
    saveCart(raw);
    cartItems = await buildCartItems();
    await render();
  });
}

// ─── Voucher ──────────────────────────────
function bindVoucherEvents() {
  const applyBtn = document.getElementById('apply-voucher');
  const input = document.getElementById('voucher-input');
  const msg = document.getElementById('voucher-msg');
  if (!applyBtn || !input) return;

  applyBtn.addEventListener('click', () => {
    const code = input.value.trim().toUpperCase();
    const voucher = VOUCHERS[code];
    if (!code) {
      showVoucherMsg(msg, 'Enter a voucher code.', 'error');
      return;
    }
    if (!voucher) {
      showVoucherMsg(msg, 'Invalid voucher code.', 'error');
      appliedVoucher = null;
      return;
    }
    appliedVoucher = voucher;
    showVoucherMsg(msg, `✓ ${voucher.label} applied!`, 'success');
    updateSummary();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyBtn.click();
  });
}

function showVoucherMsg(el, text, type) {
  el.textContent = text;
  el.className = `cart-voucher-msg cart-voucher-msg--${type}`;
}

// ─── Select all / clear ───────────────────
function bindBulkActions() {
  const selectAll = document.getElementById('select-all-items');
  const clearBtn = document.getElementById('clear-selected-btn');

  selectAll?.addEventListener('change', () => {
    if (selectAll.checked) {
      cartItems.forEach(i => selectedIds.add(i.id));
    } else {
      selectedIds.clear();
    }
    // Re-check all checkboxes
    document.querySelectorAll('.cart-item__checkbox').forEach(cb => {
      cb.checked = selectedIds.has(cb.dataset.id);
    });
    updateSelectAll();
  });

  clearBtn?.addEventListener('click', removeSelected);
}

// ─── Checkout ─────────────────────────────
function bindCheckout() {
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (cartItems.length === 0) return;
    window.location.href = 'checkout.html';
  });
}

// ─── Init ─────────────────────────────────
async function init() {
  cartItems = await buildCartItems();

  // Pre-select all by default
  cartItems.forEach(i => selectedIds.add(i.id));

  await render();
  bindVoucherEvents();
  bindBulkActions();
  bindCheckout();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}