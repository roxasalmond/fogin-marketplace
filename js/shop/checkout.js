/* ============================================
   CHECKOUT PAGE
   js/pages/checkout.js
============================================ */

import { fetchProductById } from '../utils/api.js';
import { mapCartProduct } from '../utils/cart-product.js';

// ─── Constants ────────────────────────────
const CART_KEY = 'foginCart';
const USER_KEY = 'foginUser';

const SHIPPING_COSTS = {
  standard:  150,
  express:   299,
  sameday:   199,
  scheduled: 0,
  pickup:    0,
};

const SHIPPING_LABELS = {
  standard:  'Standard Delivery (3–5 days)',
  express:   'Express Delivery (1–2 days)',
  sameday:   'Same Day Delivery',
  scheduled: 'Scheduled Delivery (FREE)',
  pickup:    'Pick Up In Store (FREE)',
};

const PAYMENT_LABELS = {
  gcash: 'GCash',
  maya:  'Maya',
  card:  'Credit / Debit Card',
  cod:   'Cash on Delivery',
};

// ─── State ────────────────────────────────
let currentStep = 1;
let shippingMethod = 'standard';
let paymentMethod = 'gcash';
let cartItems = [];
let addressData = {};

// ─── Helpers ──────────────────────────────
function formatPrice(n) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function getSavedUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}

function generateOrderId() {
  return 'FG-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// FIX: previously looked up entry.id against a hardcoded local PRODUCTS_DB
// with fake integer ids 1-8, same bug as cart.js had - real cart entries
// carry real database ids that never matched, so checkout always saw an
// empty cart and redirected back to cart.html regardless of what was
// actually in localStorage. Now fetches each item from the real API.
async function buildCartItems() {
  const raw = getCart();
  const results = await Promise.all(raw.map(async entry => {
    try {
      const data = await fetchProductById(entry.id);
      return { ...mapCartProduct(data), qty: entry.qty || 1 };
    } catch (err) {
      console.error(`[checkout] Failed to load product ${entry.id}:`, err);
      return null;
    }
  }));
  return results.filter(Boolean);
}

function calcTotals() {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = SHIPPING_COSTS[shippingMethod] ?? 150;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

// ─── Pre-populate address from saved user ─
// FIX: keys must be the real HTML element IDs (kebab-case for multi-word
// fields). 'fullName' removed entirely - there is no combined-name input,
// the form only has separate first-name/last-name fields, so this key
// never matched anything and never prefilled.
function prefillAddress() {
  const user = getSavedUser();
  if (!user) return;

  const map = {
    phone:              user.phone || '',
    email:              user.email || '',
    'street-address':   user.streetAddress || user.address || '',
    barangay:           user.barangay || '',
    city:               user.city || '',
    province:           user.province || '',
    'zip-code':         user.zipCode || user.zip || '',
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  });
}

// ─── Render order summary (right panel) ───
function renderSummary() {
  const { subtotal, shipping, total } = calcTotals();

  // Items
  const itemsEl = document.getElementById('summary-items');
  if (itemsEl) {
    itemsEl.innerHTML = cartItems.map(item => `
      <div class="checkout-summary-item">
        <div class="checkout-summary-item__img">📦</div>
        <div class="checkout-summary-item__info">
          <div class="checkout-summary-item__name">${item.name}</div>
          <div class="checkout-summary-item__qty">Qty: ${item.qty}</div>
        </div>
        <div class="checkout-summary-item__price">${formatPrice(item.price * item.qty)}</div>
      </div>
    `).join('');
  }

  // Totals
  const shippingEl = document.getElementById('co-shipping');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);

  const subtotalEl = document.getElementById('co-subtotal');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

  const totalEl = document.getElementById('co-total');
  if (totalEl) totalEl.textContent = formatPrice(total);

  // Review total
  const reviewTotal = document.getElementById('review-total');
  if (reviewTotal) reviewTotal.textContent = formatPrice(total);
}

// ─── Step management ──────────────────────
function unlockSection(id) {
  const section = document.getElementById(id);
  section?.classList.remove('checkout-section--locked');
  section?.classList.add('checkout-section--unlocked');
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function collapseSection(bodyId, summaryId, summaryText, editBtnId) {
  document.getElementById(bodyId).hidden = true;
  const summary = document.getElementById(summaryId);
  summary.hidden = false;
  document.getElementById(summaryText).textContent = buildSummaryText(summaryId);
  document.getElementById(editBtnId).hidden = false;
}

function buildSummaryText(summaryId) {
  if (summaryId === 'address-summary') {
    const v = f => document.getElementById(f)?.value || '';
    return `${v('first-name')} · ${v('street-address')}, ${v('barangay')}, ${v('city')}, ${v('province')} ${v('zip-code')}`;
  }
  if (summaryId === 'shipping-summary') {
    return SHIPPING_LABELS[shippingMethod] || shippingMethod;
  }
  if (summaryId === 'payment-summary') {
    return PAYMENT_LABELS[paymentMethod] || paymentMethod;
  }
  return '';
}

function expandSection(bodyId, summaryId, editBtnId) {
  document.getElementById(bodyId).hidden = false;
  document.getElementById(summaryId).hidden = true;
  document.getElementById(editBtnId).hidden = true;
}

function updateStepIndicator(step) {
  document.querySelectorAll('.checkout-step').forEach(el => {
    const n = Number(el.dataset.step);
    el.classList.remove('checkout-step--active', 'checkout-step--done');
    if (n < step) el.classList.add('checkout-step--done');
    if (n === step) el.classList.add('checkout-step--active');
  });
}

// ─── Validate address form ─────────────────
function validateAddress() {
  const fields = [
    { id: 'first-name',     label: 'First name' },
    { id: 'last-name',      label: 'Last name' },
    { id: 'phone',          label: 'Phone number' },
    { id: 'email',          label: 'Email address' },
    { id: 'street-address', label: 'Street address' },
    { id: 'barangay',       label: 'Barangay' },
    { id: 'city',           label: 'City / Municipality' },
    { id: 'province',       label: 'Province' },
    { id: 'zip-code',       label: 'ZIP code' },
  ];

  let valid = true;

  fields.forEach(({ id, label }) => {
    const el = document.getElementById(id);
    const err = document.getElementById(`${id}-error`);
    if (!el) return;

    const val = el.value.trim();
    if (!val) {
      el.classList.add('checkout-input--error');
      if (err) err.textContent = `${label} is required.`;
      valid = false;
    } else {
      el.classList.remove('checkout-input--error');
      if (err) err.textContent = '';
    }
  });

  // Email format
  const emailEl = document.getElementById('email');
  if (emailEl?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('checkout-input--error');
    document.getElementById('email-error').textContent = 'Enter a valid email address.';
    valid = false;
  }

  // Phone — PH format
  const phoneEl = document.getElementById('phone');
  if (phoneEl?.value && !/^9\d{9}$/.test(phoneEl.value.replace(/\s/g, ''))) {
    phoneEl.classList.add('checkout-input--error');
    document.getElementById('phone-error').textContent = 'Enter a valid PH number (e.g. 9171234567).';
    valid = false;
  }

  // ZIP — 4 digits
  const zipEl = document.getElementById('zip-code');
  if (zipEl?.value && !/^\d{4}$/.test(zipEl.value.trim())) {
    zipEl.classList.add('checkout-input--error');
    document.getElementById('zip-code-error').textContent = 'ZIP code must be 4 digits.';
    valid = false;
  }

  return valid;
}

// ─── Collect address data ──────────────────
// FIX: store camelCase keys on addressData so they match what renderReview()
// reads back (addressData.streetAddress, .fullName, .zipCode, etc.) —
// previously this wrote kebab-case/bracket keys ('street-address',
// 'full-name') that renderReview never actually read, so every review field
// silently rendered as undefined.
function collectAddress() {
  addressData.phone         = document.getElementById('phone')?.value?.trim() || '';
  addressData.email         = document.getElementById('email')?.value?.trim() || '';
  addressData.streetAddress = document.getElementById('street-address')?.value?.trim() || '';
  addressData.barangay      = document.getElementById('barangay')?.value?.trim() || '';
  addressData.city          = document.getElementById('city')?.value?.trim() || '';
  addressData.province      = document.getElementById('province')?.value?.trim() || '';
  addressData.zipCode       = document.getElementById('zip-code')?.value?.trim() || '';
  addressData.deliveryNotes = document.getElementById('delivery-notes')?.value?.trim() || '';

  const first = document.getElementById('first-name')?.value?.trim() || '';
  const last  = document.getElementById('last-name')?.value?.trim() || '';
  addressData.fullName = `${first} ${last}`.trim();
}

// ─── Render review section ─────────────────
function renderReview() {
  const { subtotal, shipping, total } = calcTotals();

  const blocks = [
    {
      label: 'Delivery Address',
      value: `${addressData.fullName}<br>${addressData.streetAddress}, ${addressData.barangay}<br>${addressData.city}, ${addressData.province} ${addressData.zipCode}<br>${addressData.phone}`,
    },
    {
      label: 'Shipping Method',
      value: SHIPPING_LABELS[shippingMethod] + `<br><strong>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</strong>`,
    },
    {
      label: 'Payment Method',
      value: PAYMENT_LABELS[paymentMethod],
    },
    {
      label: 'Order Total',
      value: `Subtotal: ${formatPrice(subtotal)}<br>Shipping: ${shipping === 0 ? 'FREE' : formatPrice(shipping)}<br><strong class="text-primary">Total: ${formatPrice(total)}</strong>`,
    },
  ];

  const container = document.getElementById('review-details');
  if (container) {
    container.innerHTML = blocks.map(b => `
      <div class="checkout-review-block">
        <div class="checkout-review-block__label">${b.label}</div>
        <div class="checkout-review-block__value">${b.value}</div>
      </div>
    `).join('');
  }
}

// ─── Place order ───────────────────────────
function placeOrder() {
  const orderId = generateOrderId();

  // Clear cart
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('fogin:cart-updated'));

  // Show success overlay
  const overlay = document.getElementById('success-overlay');
  const orderNum = document.getElementById('success-order-num');
  if (overlay) overlay.hidden = false;
  if (orderNum) orderNum.textContent = `Order #${orderId}`;
}

// ─── Card number formatting ────────────────
function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = val.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 4);
  if (val.length >= 3) val = val.slice(0, 2) + ' / ' + val.slice(2);
  input.value = val;
}

// ─── Event binding ─────────────────────────
function bindEvents() {

  // ── Step 1: Address → Shipping ──
  // FIX: all four IDs below were camelCase, real HTML IDs are kebab-case.
  document.getElementById('continue-to-shipping')?.addEventListener('click', () => {
    if (!validateAddress()) return;
    collectAddress();
    collapseSection('address-form', 'address-summary', 'address-summary-text', 'edit-address');
    unlockSection('section-shipping');
    currentStep = 2;
    updateStepIndicator(2);
    renderSummary();
  });

  document.getElementById('edit-address')?.addEventListener('click', () => {
    expandSection('address-form', 'address-summary', 'edit-address');
  });

  // ── Step 2: Shipping → Payment ──
  document.getElementById('continue-to-payment')?.addEventListener('click', () => {
    // Validate store picker if pickup
    if (shippingMethod === 'pickup') {
      const store = document.getElementById('store-select')?.value;
      if (!store) {
        alert('Please select a pickup store.');
        return;
      }
    }
    collapseSection('shipping-form', 'shipping-summary', 'shipping-summary-text', 'edit-shipping');
    unlockSection('section-payment');
    currentStep = 2;
    updateStepIndicator(2);
    renderSummary();
  });

  document.getElementById('edit-shipping')?.addEventListener('click', () => {
    expandSection('shipping-form', 'shipping-summary', 'edit-shipping');
  });

  // ── Step 3: Payment → Review ──
  document.getElementById('continue-to-review')?.addEventListener('click', () => {
    collapseSection('payment-form', 'payment-summary', 'payment-summary-text', 'edit-payment');
    // NOTE: HTML's review section id="sectionReview" (camelCase) - unlike
    // section-shipping/section-payment above, this one is NOT kebab-case in
    // the HTML itself, so it's left as-is here to match. Worth reconciling
    // as part of a future full ID-naming pass, out of scope for this fix.
    unlockSection('sectionReview');
    currentStep = 3;
    updateStepIndicator(3);
    renderReview();
    renderSummary();
  });

  document.getElementById('edit-payment')?.addEventListener('click', () => {
    expandSection('payment-form', 'payment-summary', 'edit-payment');
  });

  // ── Shipping method change ──
  document.querySelectorAll('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', () => {
      shippingMethod = radio.value;
      const storePicker = document.getElementById('store-picker');
      if (storePicker) storePicker.hidden = shippingMethod !== 'pickup';
      renderSummary();
    });
  });

  // ── Payment method change ──
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      paymentMethod = radio.value;
      document.getElementById('card-form').hidden = paymentMethod !== 'card';
      document.getElementById('cod-notice').hidden = paymentMethod !== 'cod';
    });
  });

  // ── Card formatting ──
  document.getElementById('card-number')?.addEventListener('input', e => formatCardNumber(e.target));
  document.getElementById('card-expiry')?.addEventListener('input', e => formatExpiry(e.target));

  // ── Confirmation checkboxes → enable place order ──
  const ageBox   = document.getElementById('age-confirm');
  const termsBox = document.getElementById('terms-confirm');
  const placeBtn = document.getElementById('place-order-btn');

  function checkConfirms() {
    if (placeBtn) placeBtn.disabled = !(ageBox?.checked && termsBox?.checked);
  }

  ageBox?.addEventListener('change', checkConfirms);
  termsBox?.addEventListener('change', checkConfirms);

  // ── Place order ──
  document.getElementById('place-order-btn')?.addEventListener('click', placeOrder);

  // ── ZIP — numbers only ──
  document.getElementById('zip-code')?.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
  });

  // ── Phone — numbers only ──
  document.getElementById('phone')?.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
  });

  // ── Clear errors on input ──
  // FIX: was `${input.id}Error` (camelCase concat), real error span IDs are
  // kebab-case (e.g. "first-name-error"), same pattern validateAddress()
  // already uses correctly above.
  document.querySelectorAll('.checkout-input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('checkout-input--error');
      const err = document.getElementById(`${input.id}-error`);
      if (err) err.textContent = '';
    });
  });
}

// ─── Init ─────────────────────────────────
async function init() {
  cartItems = await buildCartItems();

  if (cartItems.length === 0) {
    // Nothing in cart — redirect back
    window.location.href = 'cart.html';
    return;
  }

  prefillAddress();
  renderSummary();
  bindEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}