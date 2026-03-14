/**
 * CUSTOMER ACCOUNT PAGE
 * js/customer/account.js
 * Full account page: tabs, orders, profile, addresses, wishlist + validation
 */

// ============================================
// MOCK DATA
// ============================================

import { initPasswordToggle } from '../validation.js';

const MOCK_USER = {
  firstName: 'Juan',
  lastName:  'dela Cruz',
  email:     'juan@email.com',
  phone:     '9171234567',
  birthdate: '1995-06-15',
  gender:    'male',
};

const MOCK_ORDERS = [
  {
    id: 'FG-A3KX2Q',
    date: 'Feb 15, 2025',
    status: 'shipped',
    total: 5497,
    shipping: 'Express Delivery',
    payment: 'GCash',
    address: '123 Rizal St., Brgy. Poblacion, Makati City, Metro Manila 1210',
    items: [
      { name: 'Vaporesso XROS 3',   category: 'Pod System', price: 2499, qty: 1, emoji: '🔵' },
      { name: 'Mango Ice E-Liquid', category: 'E-Liquid',   price: 399,  qty: 3, emoji: '🥭' },
    ],
    tracking: [
      { label: 'Order Placed',      date: 'Feb 15, 9:12 AM',  done: true  },
      { label: 'Payment Confirmed', date: 'Feb 15, 9:14 AM',  done: true  },
      { label: 'Packed & Ready',    date: 'Feb 15, 2:00 PM',  done: true  },
      { label: 'Out for Delivery',  date: 'Feb 16, 10:30 AM', done: true, active: true },
      { label: 'Delivered',         date: 'Expected Feb 16',  done: false },
    ],
  },
  {
    id: 'FG-B7ZM9P',
    date: 'Feb 10, 2025',
    status: 'delivered',
    total: 3499,
    shipping: 'Standard Delivery',
    payment: 'COD',
    address: '123 Rizal St., Brgy. Poblacion, Makati City, Metro Manila 1210',
    items: [
      { name: 'Voopoo Drag S Pro', category: 'Mod Kit', price: 3499, qty: 1, emoji: '⚫' },
    ],
    tracking: [
      { label: 'Order Placed',      date: 'Feb 10, 11:05 AM', done: true },
      { label: 'Payment Confirmed', date: 'Feb 10, 11:05 AM', done: true },
      { label: 'Packed & Ready',    date: 'Feb 11, 9:00 AM',  done: true },
      { label: 'Out for Delivery',  date: 'Feb 13, 11:00 AM', done: true },
      { label: 'Delivered',         date: 'Feb 13, 3:45 PM',  done: true },
    ],
  },
  {
    id: 'FG-C2QR5T',
    date: 'Jan 30, 2025',
    status: 'processing',
    total: 2199,
    shipping: 'Same Day',
    payment: 'Maya',
    address: '123 Rizal St., Brgy. Poblacion, Makati City, Metro Manila 1210',
    items: [
      { name: 'Smok Nord 5', category: 'Pod System', price: 2199, qty: 1, emoji: '🔴' },
    ],
    tracking: [
      { label: 'Order Placed',      date: 'Jan 30, 8:45 AM', done: true  },
      { label: 'Payment Confirmed', date: 'Jan 30, 8:47 AM', done: true, active: true },
      { label: 'Packed & Ready',    date: 'Pending',          done: false },
      { label: 'Out for Delivery',  date: 'Pending',          done: false },
      { label: 'Delivered',         date: 'Pending',          done: false },
    ],
  },
];

const MOCK_ADDRESSES = [
  {
    id: 'a1',
    label: 'Home',
    isDefault: true,
    text: '123 Rizal Street, Brgy. Poblacion\nMakati City, Metro Manila 1210',
  },
  {
    id: 'a2',
    label: 'Work',
    isDefault: false,
    text: '8th Floor, BGC Tower, 32nd St.\nBonifacio Global City, Taguig 1634',
  },
];

const MOCK_WISHLIST = [
  { id: 7, name: 'Freemax Maxus 200W',   category: 'Mod Kit',    price: 4999, emoji: '🟤' },
  { id: 3, name: 'Voopoo Drag S Pro',    category: 'Mod Kit',    price: 3499, emoji: '⚫' },
  { id: 8, name: 'Nasty Juice Slow Blow',category: 'E-Liquid',   price: 449,  emoji: '🍹' },
  { id: 6, name: 'Smok Nord 5',          category: 'Pod System', price: 2199, emoji: '🔴' },
];

// ============================================
// STATE
// ============================================

let addresses         = [...MOCK_ADDRESSES];
let wishlist          = [...MOCK_WISHLIST];
let activeOrderFilter = 'all';
let editingAddressId  = null;
let toastTimer        = null;

// ============================================
// HELPERS
// ============================================

function formatPrice(n) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('foginCart') || '[]'); } catch { return []; }
}

function saveCart(items) {
  localStorage.setItem('foginCart', JSON.stringify(items));
  window.dispatchEvent(new Event('fogin:cart-updated'));
}

function addToCart(id, qty = 1) {
  const raw = getCart();
  const existing = raw.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else raw.push({ id, qty });
  saveCart(raw);
}

function getStatusClass(status) {
  return { processing: 'processing', shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled' }[status] || 'processing';
}

function getStatusLabel(status) {
  return { processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }[status] || status;
}

// ============================================
// VALIDATION HELPERS
// ============================================

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.add('acc-input--error');
  if (error) error.textContent = message;
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.remove('acc-input--error');
  if (error) error.textContent = '';
}

function clearAllErrors(fieldIds) {
  fieldIds.forEach(id => clearError(id));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^9\d{9}$/.test(phone.replace(/\s/g, ''));
}

function isValidZip(zip) {
  return /^\d{4}$/.test(zip);
}

function isStrongPassword(pass) {
  return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);
}

// ============================================
// TOAST
// ============================================

function showToast(message) {
  const toast    = document.getElementById('accToast');
  const toastMsg = document.getElementById('accToastMsg');
  if (!toast || !toastMsg) return;

  if (toastTimer) clearTimeout(toastTimer);
  toastMsg.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('acc-toast--visible'));

  toastTimer = setTimeout(() => {
    toast.classList.remove('acc-toast--visible');
    setTimeout(() => { toast.hidden = true; }, 300);
  }, 2800);
}

// ============================================
// TABS
// ============================================

function initTabs() {
  document.querySelectorAll('.acc-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.goto));
  });

  // Check URL hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash) switchTab(hash);
}

function switchTab(name) {
  document.querySelectorAll('.acc-tab').forEach(t => {
    t.classList.toggle('acc-tab--active', t.dataset.tab === name);
    t.setAttribute('aria-selected', t.dataset.tab === name ? 'true' : 'false');
  });

  document.querySelectorAll('.acc-panel').forEach(p => {
    p.hidden = p.id !== `tab-${name}`;
  });

  history.replaceState(null, '', `#${name}`);
}

// ============================================
// HERO
// ============================================

function renderHero() {
  const initials = (MOCK_USER.firstName[0] + MOCK_USER.lastName[0]).toUpperCase();
  document.getElementById('accAvatar').textContent      = initials;
  document.getElementById('accHeroName').textContent    = `${MOCK_USER.firstName} ${MOCK_USER.lastName}`;
  document.getElementById('accHeroEmail').textContent   = MOCK_USER.email;
  document.getElementById('profileAvatar').textContent  = initials;
}

// ============================================
// DASHBOARD
// ============================================

function renderDashboard() {
  document.getElementById('statTotalOrders').textContent = MOCK_ORDERS.length;
  document.getElementById('statPending').textContent     = MOCK_ORDERS.filter(o => o.status === 'shipped' || o.status === 'processing').length;
  document.getElementById('statWishlist').textContent    = wishlist.length;

  const total = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);
  document.getElementById('statSpent').textContent = formatPrice(total);

  // Recent orders (last 2)
  const container = document.getElementById('dashRecentOrders');
  container.innerHTML = MOCK_ORDERS.slice(0, 2).map(o => renderOrderCardHTML(o, true)).join('');
  bindOrderCardEvents(container);

  // Wishlist preview (first 4)
  const wlPreview = document.getElementById('dashWishlistPreview');
  wlPreview.innerHTML = wishlist.slice(0, 4).map(item => `
    <a href="../shop/product.html?id=${item.id}" style="display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none;">
      <div style="width:72px;height:72px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:30px;">${item.emoji}</div>
      <span style="font-size:11px;color:rgba(255,255,255,0.5);text-align:center;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</span>
      <span style="font-size:12px;font-weight:700;color:var(--color-primary,#C8FF00);">${formatPrice(item.price)}</span>
    </a>
  `).join('');
}

// ============================================
// ORDERS
// ============================================

function renderOrders() {
  const filtered = activeOrderFilter === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === activeOrderFilter);

  const container = document.getElementById('ordersList');
  container.innerHTML = filtered.length
    ? filtered.map(o => renderOrderCardHTML(o, false)).join('')
    : `<div style="text-align:center;padding:48px;color:rgba(255,255,255,0.3);font-size:14px;">No orders found.</div>`;

  bindOrderCardEvents(container);
}

function renderOrderCardHTML(order, compact) {
  const statusClass = getStatusClass(order.status);
  const statusLabel = getStatusLabel(order.status);
  const canCancel   = order.status === 'processing';
  const canReturn   = order.status === 'delivered';

  const itemsHTML = order.items.map(item => `
    <div class="acc-order-item">
      <div class="acc-order-item__img">${item.emoji}</div>
      <div class="acc-order-item__info">
        <div class="acc-order-item__name">${item.name}</div>
        <div class="acc-order-item__meta">${item.category} · Qty: ${item.qty}</div>
      </div>
      <div class="acc-order-item__price">${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join('');

  return `
    <div class="acc-order-card">
      <div class="acc-order-card__header">
        <span class="acc-order-id">${order.id}</span>
        <span class="acc-order-date">${order.date}</span>
        <span class="acc-order-status acc-order-status--${statusClass}">${statusLabel}</span>
      </div>
      <div class="acc-order-card__items">${itemsHTML}</div>
      <div class="acc-order-card__footer">
        <div class="acc-order-total">Total: <span>${formatPrice(order.total)}</span></div>
        <div class="acc-order-actions">
          <button class="acc-order-btn acc-order-btn--details" data-order-id="${order.id}">View Details</button>
          <button class="acc-order-btn acc-order-btn--reorder" data-reorder-id="${order.id}">Reorder</button>
          ${canCancel ? `<button class="acc-order-btn acc-order-btn--cancel" data-cancel-id="${order.id}">Cancel</button>` : ''}
          ${canReturn ? `<button class="acc-order-btn acc-order-btn--cancel" data-return-id="${order.id}">Return</button>` : ''}
          <button class="acc-order-btn acc-order-btn--receipt" data-receipt-id="${order.id}">Receipt</button>
        </div>
      </div>
      ${!compact && order.status === 'shipped' ? renderTrackingHTML(order) : ''}
    </div>
  `;
}

function renderTrackingHTML(order) {
  const steps = order.tracking.map(step => `
    <div class="acc-timeline-step ${step.done ? 'acc-timeline-step--done' : ''} ${step.active ? 'acc-timeline-step--active' : ''}">
      <div class="acc-timeline-dot"></div>
      <div class="acc-timeline-info">
        <div class="acc-timeline-label">${step.label}</div>
        <div class="acc-timeline-date">${step.date}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="acc-tracking">
      <div class="acc-tracking-title">Order Tracking</div>
      <div class="acc-timeline">${steps}</div>
    </div>
  `;
}

function bindOrderCardEvents(container) {
  container.addEventListener('click', e => {
    const detailBtn  = e.target.closest('[data-order-id]');
    const reorderBtn = e.target.closest('[data-reorder-id]');
    const cancelBtn  = e.target.closest('[data-cancel-id]');
    const returnBtn  = e.target.closest('[data-return-id]');
    const receiptBtn = e.target.closest('[data-receipt-id]');

    if (detailBtn)  { openOrderModal(detailBtn.dataset.orderId); return; }

    if (reorderBtn) {
      const order = MOCK_ORDERS.find(o => o.id === reorderBtn.dataset.reorderId);
      if (order) {
        order.items.forEach(item => addToCart(item.id, item.qty));
        showToast(`${order.items.length} item(s) added to cart`);
      }
      return;
    }

    if (cancelBtn)  { showToast('Cancellation request submitted.'); return; }
    if (returnBtn)  { showToast('Return request submitted. We\'ll be in touch.'); return; }
    if (receiptBtn) { showToast('Downloading receipt…'); return; }
  });
}

function bindOrderFilters() {
  document.querySelectorAll('.acc-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.acc-filter-btn').forEach(b => b.classList.remove('acc-filter-btn--active'));
      btn.classList.add('acc-filter-btn--active');
      activeOrderFilter = btn.dataset.status;
      renderOrders();
    });
  });
}

// ============================================
// ORDER MODAL
// ============================================

function openOrderModal(orderId) {
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('orderModalTitle').textContent = `Order ${order.id}`;

  const itemsHTML = order.items.map(item => `
    <div class="acc-order-item" style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <div class="acc-order-item__img">${item.emoji}</div>
      <div class="acc-order-item__info">
        <div class="acc-order-item__name">${item.name}</div>
        <div class="acc-order-item__meta">Qty: ${item.qty}</div>
      </div>
      <div class="acc-order-item__price">${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join('');

  document.getElementById('orderModalBody').innerHTML = `
    <div class="acc-order-detail-section">
      <div class="acc-order-detail-section-title">Order Info</div>
      <div class="acc-order-detail-grid">
        <div class="acc-order-detail-row">
          <span class="acc-order-detail-label">Order ID</span>
          <span class="acc-order-detail-value" style="font-family:monospace">${order.id}</span>
        </div>
        <div class="acc-order-detail-row">
          <span class="acc-order-detail-label">Date Placed</span>
          <span class="acc-order-detail-value">${order.date}</span>
        </div>
        <div class="acc-order-detail-row">
          <span class="acc-order-detail-label">Status</span>
          <span class="acc-order-status acc-order-status--${getStatusClass(order.status)}" style="display:inline-block">${getStatusLabel(order.status)}</span>
        </div>
        <div class="acc-order-detail-row">
          <span class="acc-order-detail-label">Payment</span>
          <span class="acc-order-detail-value">${order.payment}</span>
        </div>
        <div class="acc-order-detail-row" style="grid-column:1/-1">
          <span class="acc-order-detail-label">Delivery Address</span>
          <span class="acc-order-detail-value">${order.address}</span>
        </div>
        <div class="acc-order-detail-row">
          <span class="acc-order-detail-label">Shipping Method</span>
          <span class="acc-order-detail-value">${order.shipping}</span>
        </div>
      </div>
    </div>
    <div class="acc-order-detail-section">
      <div class="acc-order-detail-section-title">Items Ordered</div>
      ${itemsHTML}
      <div style="display:flex;justify-content:space-between;padding:12px 0 0;font-size:15px;font-weight:700;color:#fff;">
        <span>Total</span>
        <span style="color:var(--color-primary,#C8FF00)">${formatPrice(order.total)}</span>
      </div>
    </div>
    <div class="acc-order-detail-section">
      <div class="acc-order-detail-section-title">Tracking</div>
      <div class="acc-timeline">
        ${order.tracking.map(step => `
          <div class="acc-timeline-step ${step.done ? 'acc-timeline-step--done' : ''} ${step.active ? 'acc-timeline-step--active' : ''}">
            <div class="acc-timeline-dot"></div>
            <div class="acc-timeline-info">
              <div class="acc-timeline-label">${step.label}</div>
              <div class="acc-timeline-date">${step.date}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('orderModal').hidden = false;
}

function initOrderModal() {
  document.getElementById('closeOrderModal')?.addEventListener('click', () => {
    document.getElementById('orderModal').hidden = true;
  });
  document.getElementById('orderModalBackdrop')?.addEventListener('click', () => {
    document.getElementById('orderModal').hidden = true;
  });
}

// ============================================
// PROFILE FORM + VALIDATION
// ============================================

function validateProfile() {
  clearAllErrors(['pFirstName', 'pLastName', 'pEmail', 'pPhone', 'pCurrentPass', 'pNewPass', 'pConfirmPass']);
  let valid = true;

  const firstName = document.getElementById('pFirstName').value.trim();
  if (!firstName)           { showError('pFirstName', 'First name is required.'); valid = false; }
  else if (firstName.length < 2) { showError('pFirstName', 'First name must be at least 2 characters.'); valid = false; }

  const lastName = document.getElementById('pLastName').value.trim();
  if (!lastName)           { showError('pLastName', 'Last name is required.'); valid = false; }
  else if (lastName.length < 2) { showError('pLastName', 'Last name must be at least 2 characters.'); valid = false; }

  const email = document.getElementById('pEmail').value.trim();
  if (!email)                  { showError('pEmail', 'Email address is required.'); valid = false; }
  else if (!isValidEmail(email)) { showError('pEmail', 'Enter a valid email address.'); valid = false; }

  const phone = document.getElementById('pPhone').value.trim();
  if (!phone)                  { showError('pPhone', 'Phone number is required.'); valid = false; }
  else if (!isValidPhone(phone)) { showError('pPhone', 'Enter a valid PH number (9XX XXX XXXX).'); valid = false; }

  // Password — only validate if any field is filled
  const currentPass = document.getElementById('pCurrentPass').value;
  const newPass     = document.getElementById('pNewPass').value;
  const confirmPass = document.getElementById('pConfirmPass').value;

  if (currentPass || newPass || confirmPass) {
    if (!currentPass) { showError('pCurrentPass', 'Current password is required.'); valid = false; }
    if (!newPass)     { showError('pNewPass', 'New password is required.'); valid = false; }
    else if (!isStrongPassword(newPass)) { showError('pNewPass', 'Min. 8 characters, 1 uppercase, 1 number.'); valid = false; }
    if (!confirmPass)         { showError('pConfirmPass', 'Please confirm your new password.'); valid = false; }
    else if (newPass !== confirmPass) { showError('pConfirmPass', 'Passwords do not match.'); valid = false; }
  }

  return valid;
}

function initProfile() {
  document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
    if (!validateProfile()) return;

    // Update hero with new name/email
    const firstName = document.getElementById('pFirstName').value.trim();
    const lastName  = document.getElementById('pLastName').value.trim();
    const email     = document.getElementById('pEmail').value.trim();

    document.getElementById('accHeroName').textContent  = `${firstName} ${lastName}`;
    document.getElementById('accHeroEmail').textContent = email;
    document.getElementById('accAvatar').textContent    = (firstName[0] + lastName[0]).toUpperCase();
    document.getElementById('profileAvatar').textContent = (firstName[0] + lastName[0]).toUpperCase();

    // Clear password fields
    document.getElementById('pCurrentPass').value = '';
    document.getElementById('pNewPass').value     = '';
    document.getElementById('pConfirmPass').value = '';

    // TODO: Replace with real API call
    showToast('Profile updated successfully.');
  });

  document.getElementById('cancelProfileBtn')?.addEventListener('click', () => {
    document.getElementById('pFirstName').value = MOCK_USER.firstName;
    document.getElementById('pLastName').value  = MOCK_USER.lastName;
    document.getElementById('pEmail').value     = MOCK_USER.email;
    document.getElementById('pPhone').value     = MOCK_USER.phone;
    clearAllErrors(['pFirstName', 'pLastName', 'pEmail', 'pPhone', 'pCurrentPass', 'pNewPass', 'pConfirmPass']);
  });

  // Blur validation
  const blurRules = {
    pFirstName:   v => !v ? 'First name is required.' : v.length < 2 ? 'First name must be at least 2 characters.' : null,
    pLastName:    v => !v ? 'Last name is required.'  : v.length < 2 ? 'Last name must be at least 2 characters.'  : null,
    pEmail:       v => !v ? 'Email address is required.' : !isValidEmail(v) ? 'Enter a valid email address.' : null,
    pPhone:       v => !v ? 'Phone number is required.'  : !isValidPhone(v) ? 'Enter a valid PH number (9XX XXX XXXX).' : null,
    pCurrentPass: v => {
    const newPass     = document.getElementById('pNewPass').value;
    const confirmPass = document.getElementById('pConfirmPass').value;
    return (newPass || confirmPass) && !v ? 'Current password is required.' : null;
    },
    pNewPass:     v => v && !isStrongPassword(v) ? 'Min. 8 characters, 1 uppercase, 1 number.' : null,
    pConfirmPass: v => {
      const newPass = document.getElementById('pNewPass').value;
      return v && v !== newPass ? 'Passwords do not match.' : null;
    },
  };

  Object.entries(blurRules).forEach(([id, validate]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => { const err = validate(el.value.trim()); err ? showError(id, err) : clearError(id); });
    el.addEventListener('input', () => { if (el.classList.contains('acc-input--error') && !validate(el.value.trim())) clearError(id); });
  });
}

// ============================================
// ADDRESSES
// ============================================

function renderAddresses() {
  const grid = document.getElementById('addressesGrid');

  grid.innerHTML = addresses.map(addr => `
    <div class="acc-address-card ${addr.isDefault ? 'acc-address-card--default' : ''}">
      <div class="acc-address-card__label">
        ${addr.label}
        ${addr.isDefault ? '<span class="acc-address-card__default-badge">Default</span>' : ''}
      </div>
      <div class="acc-address-card__text">${addr.text.replace(/\n/g, '<br>')}</div>
      <div class="acc-address-card__actions">
        <button class="acc-address-card__btn acc-address-card__btn--edit" data-edit-addr="${addr.id}">Edit</button>
        ${!addr.isDefault ? `<button class="acc-address-card__btn acc-address-card__btn--default" data-default-addr="${addr.id}">Set Default</button>` : ''}
        ${!addr.isDefault ? `<button class="acc-address-card__btn acc-address-card__btn--delete"  data-delete-addr="${addr.id}">Delete</button>` : ''}
      </div>
    </div>
  `).join('');

  // Add new card
  grid.innerHTML += `
    <div
      class="acc-address-card"
      id="addNewAddressCard"
      style="border:2px dashed rgba(255,255,255,0.1);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:140px;cursor:pointer;transition:border-color .2s;"
      onmouseenter="this.style.borderColor='rgba(200,255,0,0.3)'"
      onmouseleave="this.style.borderColor='rgba(255,255,255,0.1)'"
    >
      <span style="font-size:28px;opacity:.3;">+</span>
      <span style="font-size:13px;color:rgba(255,255,255,0.3);font-weight:600;">Add New Address</span>
    </div>
  `;

  document.getElementById('addNewAddressCard')?.addEventListener('click', () => openAddressModal());
}

function validateAddress() {
  clearAllErrors(['addrLabel', 'addrStreet', 'addrBarangay', 'addrCity', 'addrProvince', 'addrZip']);
  let valid = true;

  const label    = document.getElementById('addrLabel').value.trim();
  const street   = document.getElementById('addrStreet').value.trim();
  const barangay = document.getElementById('addrBarangay').value.trim();
  const city     = document.getElementById('addrCity').value.trim();
  const province = document.getElementById('addrProvince').value.trim();
  const zip      = document.getElementById('addrZip').value.trim();

  if (!label)    { showError('addrLabel',    'Address label is required.');      valid = false; }
  if (!street)   { showError('addrStreet',   'Street address is required.');     valid = false; }
  if (!barangay) { showError('addrBarangay', 'Barangay is required.');           valid = false; }
  if (!city)     { showError('addrCity',     'City / Municipality is required.'); valid = false; }
  if (!province) { showError('addrProvince', 'Province is required.');           valid = false; }
  if (!zip)      { showError('addrZip',      'ZIP code is required.');           valid = false; }
  else if (!isValidZip(zip)) { showError('addrZip', 'ZIP code must be 4 digits.'); valid = false; }

  return valid;
}

function openAddressModal(id = null) {
  editingAddressId = id;
  const modal = document.getElementById('addressModal');
  const title = document.getElementById('addressModalTitle');

  // Clear form + errors
  ['addrLabel','addrStreet','addrBarangay','addrCity','addrProvince','addrZip'].forEach(fId => {
    const el = document.getElementById(fId);
    if (el) el.value = '';
  });
  document.getElementById('addrDefault').checked = false;
  clearAllErrors(['addrLabel', 'addrStreet', 'addrBarangay', 'addrCity', 'addrProvince', 'addrZip']);

  if (editingAddressId) {
    const addr = addresses.find(a => a.id === editingAddressId);
    title.textContent = 'Edit Address';
    if (addr) {
      document.getElementById('addrLabel').value = addr.label;
      const lines  = addr.text.split('\n');
      const parts  = lines[0].split(', ');
      document.getElementById('addrStreet').value   = parts[0] || '';
      document.getElementById('addrBarangay').value = parts[1] || '';
      const parts2 = (lines[1] || '').split(', ');
      document.getElementById('addrCity').value = parts2[0] || '';
      const provZip = (parts2[1] || '').split(' ');
      document.getElementById('addrProvince').value = provZip[0] || '';
      document.getElementById('addrZip').value      = provZip[1] || '';
      document.getElementById('addrDefault').checked = addr.isDefault;
    }
  } else {
    title.textContent = 'Add New Address';
  }

  modal.hidden = false;
}

function closeAddressModal() {
  document.getElementById('addressModal').hidden = true;
  editingAddressId = null;
  clearAllErrors(['addrLabel', 'addrStreet', 'addrBarangay', 'addrCity', 'addrProvince', 'addrZip']);
}

function initAddresses() {
  document.getElementById('addAddressBtn')?.addEventListener('click', () => openAddressModal());
  document.getElementById('closeAddressModal')?.addEventListener('click', closeAddressModal);
  document.getElementById('cancelAddressModal')?.addEventListener('click', closeAddressModal);
  document.getElementById('addressModalBackdrop')?.addEventListener('click', closeAddressModal);

  document.getElementById('addressesGrid')?.addEventListener('click', e => {
    const editBtn    = e.target.closest('[data-edit-addr]');
    const deleteBtn  = e.target.closest('[data-delete-addr]');
    const defaultBtn = e.target.closest('[data-default-addr]');

    if (editBtn)    { openAddressModal(editBtn.dataset.editAddr); }
    if (deleteBtn)  { addresses = addresses.filter(a => a.id !== deleteBtn.dataset.deleteAddr); renderAddresses(); showToast('Address deleted.'); }
    if (defaultBtn) { addresses.forEach(a => { a.isDefault = a.id === defaultBtn.dataset.defaultAddr; }); renderAddresses(); showToast('Default address updated.'); }
  });

  document.getElementById('saveAddressBtn')?.addEventListener('click', () => {
    if (!validateAddress()) return;

    const label     = document.getElementById('addrLabel').value.trim();
    const street    = document.getElementById('addrStreet').value.trim();
    const barangay  = document.getElementById('addrBarangay').value.trim();
    const city      = document.getElementById('addrCity').value.trim();
    const province  = document.getElementById('addrProvince').value.trim();
    const zip       = document.getElementById('addrZip').value.trim();
    const isDefault = document.getElementById('addrDefault').checked;
    const text      = `${street}, ${barangay}\n${city}, ${province} ${zip}`;

    if (editingAddressId) {
      const addr = addresses.find(a => a.id === editingAddressId);
      if (addr) {
        addr.label = label;
        addr.text  = text;
        if (isDefault) { addresses.forEach(a => a.isDefault = false); addr.isDefault = true; }
      }
    } else {
      if (isDefault) addresses.forEach(a => a.isDefault = false);
      addresses.push({ id: 'a' + Date.now(), label, text, isDefault });
    }

    closeAddressModal();
    renderAddresses();
    showToast(editingAddressId ? 'Address updated.' : 'New address saved.');
  });

  // Blur validation for address fields
  const blurRules = {
    addrLabel:    v => v ? null : 'Address label is required.',
    addrStreet:   v => v ? null : 'Street address is required.',
    addrBarangay: v => v ? null : 'Barangay is required.',
    addrCity:     v => v ? null : 'City / Municipality is required.',
    addrProvince: v => v ? null : 'Province is required.',
    addrZip:      v => !v ? 'ZIP code is required.' : !isValidZip(v) ? 'ZIP code must be 4 digits.' : null,
  };

  Object.entries(blurRules).forEach(([id, validate]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => { const err = validate(el.value.trim()); err ? showError(id, err) : clearError(id); });
    el.addEventListener('input', () => { if (el.classList.contains('acc-input--error') && !validate(el.value.trim())) clearError(id); });
  });
}

// ============================================
// WISHLIST
// ============================================

function renderWishlist() {
  document.getElementById('wishlistBadge').textContent = wishlist.length;
  document.getElementById('statWishlist').textContent  = wishlist.length;
  document.getElementById('wishlistCount').textContent = `(${wishlist.length} item${wishlist.length !== 1 ? 's' : ''})`;

  const grid = document.getElementById('wishlistGrid');
  if (!wishlist.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:rgba(255,255,255,0.3);font-size:14px;">Your wishlist is empty. <a href="../shop/catalog.html" style="color:var(--color-primary,#C8FF00);">Browse products</a></div>`;
    return;
  }

  grid.innerHTML = wishlist.map(item => `
    <div class="acc-wishlist-card" data-wish-id="${item.id}">
      <a href="../shop/product.html?id=${item.id}" style="text-decoration:none;">
        <div class="acc-wishlist-card__img">${item.emoji}</div>
      </a>
      <div class="acc-wishlist-card__body">
        <div class="acc-wishlist-card__cat">${item.category}</div>
        <div class="acc-wishlist-card__name">${item.name}</div>
        <div class="acc-wishlist-card__price-row">
          <span class="acc-wishlist-card__price">${formatPrice(item.price)}</span>
        </div>
        <div class="acc-wishlist-card__actions">
          <button class="acc-wishlist-card__add-btn" data-wish-add="${item.id}">Add to Cart</button>
          <button class="acc-wishlist-card__remove-btn" data-wish-remove="${item.id}" aria-label="Remove from wishlist">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function initWishlist() {
  document.getElementById('wishlistGrid')?.addEventListener('click', e => {
    const addBtn    = e.target.closest('[data-wish-add]');
    const removeBtn = e.target.closest('[data-wish-remove]');

    if (addBtn) {
      addToCart(Number(addBtn.dataset.wishAdd), 1);
      showToast('Added to cart');
    }

    if (removeBtn) {
      wishlist = wishlist.filter(w => w.id !== Number(removeBtn.dataset.wishRemove));
      renderWishlist();
      renderDashboard();
      showToast('Removed from wishlist');
    }
  });

  document.getElementById('addAllToCartBtn')?.addEventListener('click', () => {
    wishlist.forEach(item => addToCart(item.id, 1));
    showToast(`${wishlist.length} items added to cart`);
  });
}

// ============================================
// LOGOUT
// ============================================

function initLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    // TODO: Replace with real API call
    localStorage.removeItem('foginUser');
    sessionStorage.removeItem('ageVerified');
    window.location.href = '../auth/login.html';
  });
}

// ============================================
// INIT
// ============================================

function init() {
  renderHero();
  renderDashboard();
  renderOrders();
  initProfile();
  initPasswordToggle();
  renderAddresses();
  initAddresses();
  renderWishlist();
  initWishlist();
  bindOrderFilters();
  initOrderModal();
  initTabs();
  initLogout();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
