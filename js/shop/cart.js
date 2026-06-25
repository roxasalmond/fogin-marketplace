/* ============================================
   CART PAGE
   js/pages/cart.js
============================================ */

// ─── Constants ────────────────────────────
const CART_KEY = 'foginCart';
const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 150;

// ─── Sample product data (replace with API later) ────
const PRODUCTS_DB = [
  { id: 1,  name: 'Vaporesso XROS 3',       category: 'Pod System',  price: 2499, image: null, vendor: 'VapeHub Manila',    vendorId: 'v1' },
  { id: 2,  name: 'Uwell Caliburn G3',       category: 'Pod System',  price: 1899, image: null, vendor: 'VapeHub Manila',    vendorId: 'v1' },
  { id: 3,  name: 'Voopoo Drag S Pro',       category: 'Mod Kit',     price: 3499, image: null, vendor: 'CloudChasers PH',  vendorId: 'v2' },
  { id: 4,  name: 'Mango Ice E-Liquid',      category: 'E-Liquid',    price: 399,  image: null, vendor: 'LiquidLab PH',     vendorId: 'v3' },
  { id: 5,  name: 'Strawberry Milk E-Liquid',category: 'E-Liquid',    price: 399,  image: null, vendor: 'LiquidLab PH',     vendorId: 'v3' },
  { id: 6,  name: 'Smok Nord 5',            category: 'Pod System',   price: 2199, image: null, vendor: 'CloudChasers PH',  vendorId: 'v2' },
  { id: 7,  name: 'Freemax Maxus 200W',     category: 'Mod Kit',      price: 4999, image: null, vendor: 'VapeHub Manila',   vendorId: 'v1' },
  { id: 8,  name: 'Nasty Juice Slow Blow',  category: 'E-Liquid',     price: 449,  image: null, vendor: 'LiquidLab PH',     vendorId: 'v3' },
];

// Featured products for empty state
const FEATURED_PRODUCTS = PRODUCTS_DB.slice(0, 4);

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

function getProductById(id) {
  return PRODUCTS_DB.find(p => p.id === Number(id)) || null;
}

function getVendorInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Build cart items with product data ───
function buildCartItems() {
  const raw = getCart();
  return raw.map(entry => {
    const product = getProductById(entry.id);
    if (!product) return null;
    return { ...product, qty: entry.qty || 1 };
  }).filter(Boolean);
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
    ? `<img src="${item.image}" alt="${item.name}" class="cart-item__image">`
    : `<div class="cart-item__image-placeholder">📦</div>`;

  return `
    <div class="cart-item" data-id="${item.id}">
      <input
        type="checkbox"
        class="cart-item__checkbox"
        data-id="${item.id}"
        aria-label="Select ${item.name}"
        ${isSelected ? 'checked' : ''}
      >

      <div class="cart-item__image-wrap">
        ${imageHTML}
      </div>

      <div class="cart-item__info">
        <span class="cart-item__category">${item.category}</span>
        <span class="cart-item__name">${item.name}</span>
        <span class="cart-item__variant">In stock</span>
        <span class="cart-item__price-mobile">${formatPrice(item.price * item.qty)}</span>
      </div>

      <div class="cart-item__actions">
        <span class="cart-item__price">${formatPrice(item.price * item.qty)}</span>
        <span class="cart-item__original-price">${formatPrice(item.price)} each</span>

        <div class="cart-qty">
          <button class="cart-qty__btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
          <span class="cart-qty__value" aria-label="Quantity">${item.qty}</span>
          <button class="cart-qty__btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>

        <button class="cart-item__remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">
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
        <span class="cart-vendor-name">${group.vendorName}</span>
        <span class="cart-vendor-badge">Verified Vendor</span>
      </div>
      ${itemsHTML}
    </div>
  `;
}

function renderEmptyFeatured() {
  return FEATURED_PRODUCTS.map(p => `
    <div class="product-card" style="background:var(--color-surface,#2B2B2B);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;cursor:pointer;" onclick="addToCartFromEmpty(${p.id})">
      <div style="height:120px;background:rgba(255,255,255,0.04);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:40px;margin-bottom:12px;">📦</div>
      <div style="font-size:11px;color:var(--color-primary,#C8FF00);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">${p.category}</div>
      <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:15px;font-weight:700;color:var(--color-primary,#C8FF00);">${formatPrice(p.price)}</span>
        <button style="padding:6px 12px;background:var(--color-primary,#C8FF00);color:#1a1a1a;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">Add</button>
      </div>
    </div>
  `).join('');
}

// ─── Update UI ────────────────────────────
function updateSummary() {
  const { subtotal, shipping, discount, total } = calcTotals(cartItems);

  document.getElementById('summarySubtotal').textContent = formatPrice(subtotal);
  document.getElementById('summaryShipping').textContent = shipping === 0 && subtotal > 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('summaryTotal').textContent = formatPrice(total);

  // Discount row
  const discountRow = document.getElementById('discountRow');
  if (discount > 0) {
    document.getElementById('summaryDiscount').textContent = `-${formatPrice(discount)}`;
    discountRow.style.display = 'flex';
  } else {
    discountRow.style.display = 'none';
  }

  // Free shipping progress
  const progress = document.getElementById('freeShippingProgress');
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');

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
  const checkoutBtn = document.getElementById('checkoutBtn');
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
  const el = document.getElementById('cartItemCount');
  if (el) el.textContent = `${total} item${total !== 1 ? 's' : ''}`;
}

function updateSelectAll() {
  const selectAll = document.getElementById('selectAllItems');
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

function render() {
  const container = document.getElementById('cartItemsContainer');
  const layout = document.getElementById('cartLayout');
  const emptyState = document.getElementById('cartEmpty');
  const bulkActions = document.getElementById('cartBulkActions');

  if (cartItems.length === 0) {
    layout.style.display = 'none';
    emptyState.hidden = false;
    bulkActions.style.display = 'none';

    // Render featured products
    const featuredContainer = document.getElementById('emptyCartProducts');
    if (featuredContainer) {
      featuredContainer.innerHTML = renderEmptyFeatured();
    }
    return;
  }

  layout.style.display = 'grid';
  emptyState.hidden = true;
  bulkActions.style.display = 'flex';

  const groups = groupByVendor(cartItems);
  container.innerHTML = groups.map(renderVendorGroup).join('');

  updateSummary();
  updateItemCount();
  updateSelectAll();
  bindItemEvents();
}

// ─── Item Actions ─────────────────────────
function updateQty(id, delta) {
  const raw = getCart();
  const idx = raw.findIndex(i => i.id === Number(id));
  if (idx === -1) return;
  raw[idx].qty = Math.max(1, (raw[idx].qty || 1) + delta);
  saveCart(raw);
  cartItems = buildCartItems();
  render();
}

function removeItem(id) {
  const raw = getCart().filter(i => i.id !== Number(id));
  selectedIds.delete(Number(id));
  saveCart(raw);
  cartItems = buildCartItems();
  render();
}

function removeSelected() {
  if (selectedIds.size === 0) return;
  const raw = getCart().filter(i => !selectedIds.has(Number(i.id)));
  selectedIds.clear();
  saveCart(raw);
  cartItems = buildCartItems();
  render();
}

// ─── Bind item-level events after render ──
function bindItemEvents() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === 'increase') updateQty(id, 1);
    if (action === 'decrease') updateQty(id, -1);
    if (action === 'remove') removeItem(id);
  });

  container.addEventListener('change', (e) => {
    const checkbox = e.target.closest('.cart-item__checkbox');
    if (!checkbox) return;
    const id = Number(checkbox.dataset.id);
    if (checkbox.checked) selectedIds.add(id);
    else selectedIds.delete(id);
    updateSelectAll();
  });
}

// ─── Global for empty state add to cart ───
window.addToCartFromEmpty = function(id) {
  const raw = getCart();
  const existing = raw.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    raw.push({ id, qty: 1 });
  }
  saveCart(raw);
  cartItems = buildCartItems();
  render();
};

// ─── Voucher ──────────────────────────────
function bindVoucherEvents() {
  const applyBtn = document.getElementById('applyVoucher');
  const input = document.getElementById('voucherInput');
  const msg = document.getElementById('voucherMsg');
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
  const selectAll = document.getElementById('selectAllItems');
  const clearBtn = document.getElementById('clearSelectedBtn');

  selectAll?.addEventListener('change', () => {
    if (selectAll.checked) {
      cartItems.forEach(i => selectedIds.add(i.id));
    } else {
      selectedIds.clear();
    }
    // Re-check all checkboxes
    document.querySelectorAll('.cart-item__checkbox').forEach(cb => {
      cb.checked = selectedIds.has(Number(cb.dataset.id));
    });
    updateSelectAll();
  });

  clearBtn?.addEventListener('click', removeSelected);
}

// ─── Checkout ─────────────────────────────
function bindCheckout() {
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cartItems.length === 0) return;
    window.location.href = 'checkout.html';
  });
}

// ─── Init ─────────────────────────────────
function init() {
  cartItems = buildCartItems();

  // Pre-select all by default
  cartItems.forEach(i => selectedIds.add(i.id));

  render();
  bindVoucherEvents();
  bindBulkActions();
  bindCheckout();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
