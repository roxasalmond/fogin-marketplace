/* ============================================
   CHECKOUT PAGE
   js/pages/checkout.js
============================================ */

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

// ─── Sample product DB ────────────────────
const PRODUCTS_DB = [
  { id: 1,  name: 'Vaporesso XROS 3',        category: 'Pod System', price: 2499 },
  { id: 2,  name: 'Uwell Caliburn G3',        category: 'Pod System', price: 1899 },
  { id: 3,  name: 'Voopoo Drag S Pro',        category: 'Mod Kit',    price: 3499 },
  { id: 4,  name: 'Mango Ice E-Liquid',       category: 'E-Liquid',   price: 399  },
  { id: 5,  name: 'Strawberry Milk E-Liquid', category: 'E-Liquid',   price: 399  },
  { id: 6,  name: 'Smok Nord 5',             category: 'Pod System',  price: 2199 },
  { id: 7,  name: 'Freemax Maxus 200W',      category: 'Mod Kit',     price: 4999 },
  { id: 8,  name: 'Nasty Juice Slow Blow',   category: 'E-Liquid',    price: 449  },
];

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

function buildCartItems() {
  return getCart().map(entry => {
    const p = PRODUCTS_DB.find(x => x.id === Number(entry.id));
    return p ? { ...p, qty: entry.qty || 1 } : null;
  }).filter(Boolean);
}

function calcTotals() {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = SHIPPING_COSTS[shippingMethod] ?? 150;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

// ─── Pre-populate address from saved user ─
function prefillAddress() {
  const user = getSavedUser();
  if (!user) return;

  const map = {
    fullName:      user.fullName || user.name || '',
    phone:         user.phone || '',
    email:         user.email || '',
    streetAddress: user.streetAddress || user.address || '',
    barangay:      user.barangay || '',
    city:          user.city || '',
    province:      user.province || '',
    zipCode:       user.zipCode || user.zip || '',
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
  const itemsEl = document.getElementById('summaryItems');
  if (itemsEl) {
    itemsEl.innerHTML = cartItems.map(item => `
      <div class="co-summary-item">
        <div class="co-summary-item__img">📦</div>
        <div class="co-summary-item__info">
          <div class="co-summary-item__name">${item.name}</div>
          <div class="co-summary-item__qty">Qty: ${item.qty}</div>
        </div>
        <div class="co-summary-item__price">${formatPrice(item.price * item.qty)}</div>
      </div>
    `).join('');
  }

  // Totals
  const shippingEl = document.getElementById('coShipping');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);

  const subtotalEl = document.getElementById('coSubtotal');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

  const totalEl = document.getElementById('coTotal');
  if (totalEl) totalEl.textContent = formatPrice(total);

  // Review total
  const reviewTotal = document.getElementById('reviewTotal');
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
  if (summaryId === 'addressSummary') {
    const v = f => document.getElementById(f)?.value || '';
    return `${v('fullName')} · ${v('streetAddress')}, ${v('barangay')}, ${v('city')}, ${v('province')} ${v('zipCode')}`;
  }
  if (summaryId === 'shippingSummary') {
    return SHIPPING_LABELS[shippingMethod] || shippingMethod;
  }
  if (summaryId === 'paymentSummary') {
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
    { id: 'fullName',      label: 'Full name' },
    { id: 'phone',         label: 'Phone number' },
    { id: 'email',         label: 'Email address' },
    { id: 'streetAddress', label: 'Street address' },
    { id: 'barangay',      label: 'Barangay' },
    { id: 'city',          label: 'City / Municipality' },
    { id: 'province',      label: 'Province' },
    { id: 'zipCode',       label: 'ZIP code' },
  ];

  let valid = true;

  fields.forEach(({ id, label }) => {
    const el = document.getElementById(id);
    const err = document.getElementById(`${id}Error`);
    if (!el) return;

    const val = el.value.trim();
    if (!val) {
      el.classList.add('co-input--error');
      if (err) err.textContent = `${label} is required.`;
      valid = false;
    } else {
      el.classList.remove('co-input--error');
      if (err) err.textContent = '';
    }
  });

  // Email format
  const emailEl = document.getElementById('email');
  if (emailEl?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('co-input--error');
    document.getElementById('emailError').textContent = 'Enter a valid email address.';
    valid = false;
  }

  // Phone — PH format
  const phoneEl = document.getElementById('phone');
  if (phoneEl?.value && !/^9\d{9}$/.test(phoneEl.value.replace(/\s/g, ''))) {
    phoneEl.classList.add('co-input--error');
    document.getElementById('phoneError').textContent = 'Enter a valid PH number (e.g. 9171234567).';
    valid = false;
  }

  // ZIP — 4 digits
  const zipEl = document.getElementById('zipCode');
  if (zipEl?.value && !/^\d{4}$/.test(zipEl.value.trim())) {
    zipEl.classList.add('co-input--error');
    document.getElementById('zipCodeError').textContent = 'ZIP code must be 4 digits.';
    valid = false;
  }

  return valid;
}

// ─── Collect address data ──────────────────
function collectAddress() {
  const fields = ['fullName', 'phone', 'email', 'streetAddress', 'barangay', 'city', 'province', 'zipCode', 'deliveryNotes'];
  fields.forEach(id => {
    addressData[id] = document.getElementById(id)?.value?.trim() || '';
  });
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
      value: `Subtotal: ${formatPrice(subtotal)}<br>Shipping: ${shipping === 0 ? 'FREE' : formatPrice(shipping)}<br><strong style="color:var(--color-primary,#C8FF00)">Total: ${formatPrice(total)}</strong>`,
    },
  ];

  const container = document.getElementById('reviewDetails');
  if (container) {
    container.innerHTML = blocks.map(b => `
      <div class="co-review-block">
        <div class="co-review-block__label">${b.label}</div>
        <div class="co-review-block__value">${b.value}</div>
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
  const overlay = document.getElementById('successOverlay');
  const orderNum = document.getElementById('successOrderNum');
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
  document.getElementById('continueToShipping')?.addEventListener('click', () => {
    if (!validateAddress()) return;
    collectAddress();
    collapseSection('addressForm', 'addressSummary', 'addressSummaryText', 'editAddress');
    unlockSection('sectionShipping');
    currentStep = 2;
    updateStepIndicator(2);
    renderSummary();
  });

  document.getElementById('editAddress')?.addEventListener('click', () => {
    expandSection('addressForm', 'addressSummary', 'editAddress');
  });

  // ── Step 2: Shipping → Payment ──
  document.getElementById('continueToPayment')?.addEventListener('click', () => {
    // Validate store picker if pickup
    if (shippingMethod === 'pickup') {
      const store = document.getElementById('storeSelect')?.value;
      if (!store) {
        alert('Please select a pickup store.');
        return;
      }
    }
    collapseSection('shippingForm', 'shippingSummary', 'shippingSummaryText', 'editShipping');
    unlockSection('sectionPayment');
    currentStep = 2;
    updateStepIndicator(2);
    renderSummary();
  });

  document.getElementById('editShipping')?.addEventListener('click', () => {
    expandSection('shippingForm', 'shippingSummary', 'editShipping');
  });

  // ── Step 3: Payment → Review ──
  document.getElementById('continueToReview')?.addEventListener('click', () => {
    collapseSection('paymentForm', 'paymentSummary', 'paymentSummaryText', 'editPayment');
    unlockSection('sectionReview');
    currentStep = 3;
    updateStepIndicator(3);
    renderReview();
    renderSummary();
  });

  document.getElementById('editPayment')?.addEventListener('click', () => {
    expandSection('paymentForm', 'paymentSummary', 'editPayment');
  });

  // ── Shipping method change ──
  document.querySelectorAll('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', () => {
      shippingMethod = radio.value;
      const storePicker = document.getElementById('storePicker');
      if (storePicker) storePicker.hidden = shippingMethod !== 'pickup';
      renderSummary();
    });
  });

  // ── Payment method change ──
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      paymentMethod = radio.value;
      document.getElementById('cardForm').hidden = paymentMethod !== 'card';
      document.getElementById('codNotice').hidden = paymentMethod !== 'cod';
    });
  });

  // ── Card formatting ──
  document.getElementById('cardNumber')?.addEventListener('input', e => formatCardNumber(e.target));
  document.getElementById('cardExpiry')?.addEventListener('input', e => formatExpiry(e.target));

  // ── Confirmation checkboxes → enable place order ──
  const ageBox   = document.getElementById('ageConfirm');
  const termsBox = document.getElementById('termsConfirm');
  const placeBtn = document.getElementById('placeOrderBtn');

  function checkConfirms() {
    if (placeBtn) placeBtn.disabled = !(ageBox?.checked && termsBox?.checked);
  }

  ageBox?.addEventListener('change', checkConfirms);
  termsBox?.addEventListener('change', checkConfirms);

  // ── Place order ──
  document.getElementById('placeOrderBtn')?.addEventListener('click', placeOrder);

  // ── ZIP — numbers only ──
  document.getElementById('zipCode')?.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
  });

  // ── Phone — numbers only ──
  document.getElementById('phone')?.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
  });

  // ── Clear errors on input ──
  document.querySelectorAll('.co-input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('co-input--error');
      const err = document.getElementById(`${input.id}Error`);
      if (err) err.textContent = '';
    });
  });
}

// ─── Init ─────────────────────────────────
function init() {
  cartItems = buildCartItems();

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
