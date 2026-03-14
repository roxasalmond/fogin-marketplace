/**
 * CHECKOUT PAGE
 * Multi-step checkout with validation
 * Sections: Delivery → Shipping → Payment → Review
 */

// ============================================
// VALIDATION HELPERS
// ============================================

function populateFromProfile() {
  // TODO: Replace with real API call to get user profile
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  const fields = {
    firstName:     profile.firstName,
    lastName:      profile.lastName,
    phone:         profile.phone,
    email:         profile.email,
    streetAddress: profile.streetAddress,
    barangay:      profile.barangay,
    city:          profile.city,
    province:      profile.province,
    zipCode:       profile.zipCode,
  };

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el && value) el.value = value;
  });
}

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.add('co-input--error');
  if (error) error.textContent = message;
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.remove('co-input--error');
  if (error) error.textContent = '';
}

function clearAllErrors(fieldIds) {
  fieldIds.forEach(id => clearError(id));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const cleaned = phone.replace(/\s/g, '');
  return /^9\d{9}$/.test(cleaned);
}

function isValidZip(zip) {
  return /^\d{4}$/.test(zip);
}

function isValidCardNumber(num) {
  return num.replace(/\s/g, '').length === 16;
}

function isValidExpiry(exp) {
  return /^\d{2}\s*\/\s*\d{2}$/.test(exp);
}

function isValidCvv(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

// ============================================
// SECTION MANAGEMENT
// ============================================

function lockSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.classList.add('checkout-section--locked');
}

function unlockSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.classList.remove('checkout-section--locked');
}

function collapseSection(formId, summaryId, summaryTextId) {
  const form    = document.getElementById(formId);
  const summary = document.getElementById(summaryId);
  const text    = document.getElementById(summaryTextId);
  if (form)    form.hidden    = true;
  if (summary) summary.hidden = false;
  return text;
}

function showEditButton(btnId) {
  const btn = document.getElementById(btnId);
  if (btn) btn.hidden = false;
}

function updateStep(stepNum) {
  document.querySelectorAll('.checkout-step').forEach(step => {
    const num = parseInt(step.dataset.step);
    step.classList.remove('checkout-step--active', 'checkout-step--done');
    if (num < stepNum)   step.classList.add('checkout-step--done');
    if (num === stepNum) step.classList.add('checkout-step--active');
  });
}

// ============================================
// SECTION 1: DELIVERY ADDRESS
// ============================================

function validateDelivery() {
  const fields = ['firstName', 'lastName', 'phone', 'email', 'streetAddress', 'barangay', 'city', 'province', 'zipCode'];
  clearAllErrors(fields);

  let valid = true;

  const firstName = document.getElementById('firstName').value.trim();
  if (!firstName) { showError('firstName', 'First name is required.'); valid = false; }
  else if (firstName.length < 2) { showError('firstName', 'First name must be at least 2 characters.'); valid = false; }

  const lastName = document.getElementById('lastName').value.trim();
  if (!lastName) { showError('lastName', 'Last name is required.'); valid = false; }
  else if (lastName.length < 2) { showError('lastName', 'Last name must be at least 2 characters.'); valid = false; }

  const phone = document.getElementById('phone').value.trim();
  if (!phone) { showError('phone', 'Phone number is required.'); valid = false; }
  else if (!isValidPhone(phone)) { showError('phone', 'Enter a valid PH number (9XX XXX XXXX).'); valid = false; }

  const email = document.getElementById('email').value.trim();
  if (!email) { showError('email', 'Email address is required.'); valid = false; }
  else if (!isValidEmail(email)) { showError('email', 'Enter a valid email address.'); valid = false; }

  const street = document.getElementById('streetAddress').value.trim();
  if (!street) { showError('streetAddress', 'Street address is required.'); valid = false; }

  const barangay = document.getElementById('barangay').value.trim();
  if (!barangay) { showError('barangay', 'Barangay is required.'); valid = false; }

  const city = document.getElementById('city').value.trim();
  if (!city) { showError('city', 'City / Municipality is required.'); valid = false; }

  const province = document.getElementById('province').value;
  if (!province) { showError('province', 'Please select a province.'); valid = false; }

  const zip = document.getElementById('zipCode').value.trim();
  if (!zip) { showError('zipCode', 'ZIP code is required.'); valid = false; }
  else if (!isValidZip(zip)) { showError('zipCode', 'ZIP code must be 4 digits.'); valid = false; }

  return valid;
}

function completeDelivery() {
  if (!validateDelivery()) return;

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const street   = document.getElementById('streetAddress').value.trim();
  const barangay = document.getElementById('barangay').value.trim();
  const city     = document.getElementById('city').value.trim();
  const province = document.getElementById('province').value;
  const zip      = document.getElementById('zipCode').value.trim();

  const fullName = `${firstName} ${lastName}`;
  const summaryText = collapseSection('addressForm', 'addressSummary', 'addressSummaryText');
  if (summaryText) {
    summaryText.textContent = `${fullName} · +63 ${phone} · ${street}, ${barangay}, ${city}, ${province} ${zip}`;
  }

  showEditButton('editAddress');
  unlockSection('sectionShipping');
  updateStep(2);
  document.getElementById('sectionShipping').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// SECTION 2: SHIPPING METHOD
// ============================================

function validateShipping() {
  const selected = document.querySelector('input[name="shipping"]:checked');
  if (!selected) return false;

  if (selected.value === 'pickup') {
    const store = document.getElementById('storeSelect').value;
    if (!store) {
      document.getElementById('storeSelect').classList.add('co-input--error');
      return false;
    }
  }

  return true;
}

function completeShipping() {
  if (!validateShipping()) return;

  const selected      = document.querySelector('input[name="shipping"]:checked');
  const shippingName  = selected.closest('.co-shipping-option').querySelector('.co-shipping-option__name').textContent.trim();
  const shippingPrice = selected.closest('.co-shipping-option').querySelector('.co-shipping-option__price').textContent.trim();

  const summaryText = collapseSection('shippingForm', 'shippingSummary', 'shippingSummaryText');
  if (summaryText) summaryText.textContent = `${shippingName} · ${shippingPrice}`;

  showEditButton('editShipping');
  unlockSection('sectionPayment');
  updateStep(3);
  document.getElementById('sectionPayment').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// SECTION 3: PAYMENT METHOD
// ============================================

function validatePayment() {
  const selected = document.querySelector('input[name="payment"]:checked');
  if (!selected) return false;

  if (selected.value === 'card') {
    let valid = true;

    const cardNumber = document.getElementById('cardNumber').value.trim();
    if (!isValidCardNumber(cardNumber)) { showError('cardNumber', 'Enter a valid 16-digit card number.'); valid = false; }

    const expiry = document.getElementById('cardExpiry').value.trim();
    if (!isValidExpiry(expiry)) { showError('cardExpiry', 'Enter expiry as MM / YY.'); valid = false; }

    const cvv = document.getElementById('cardCvv').value.trim();
    if (!isValidCvv(cvv)) { showError('cardCvv', 'Enter a valid CVV.'); valid = false; }

    const cardName = document.getElementById('cardName').value.trim();
    if (!cardName) { showError('cardName', 'Name on card is required.'); valid = false; }

    return valid;
  }

  return true;
}

function completePayment() {
  if (!validatePayment()) return;

  const selected    = document.querySelector('input[name="payment"]:checked');
  const paymentName = selected.closest('.co-payment-option').querySelector('.co-payment-option__name').textContent.trim();

  const summaryText = collapseSection('paymentForm', 'paymentSummary', 'paymentSummaryText');
  if (summaryText) summaryText.textContent = paymentName;

  showEditButton('editPayment');
  unlockSection('sectionReview');
  updateStep(4);
  buildReviewSection();
  document.getElementById('sectionReview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// SECTION 4: REVIEW
// ============================================

function buildReviewSection() {
  const details = document.getElementById('reviewDetails');
  if (!details) return;

  const fullName = document.getElementById('fullName').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const email    = document.getElementById('email').value.trim();
  const street   = document.getElementById('streetAddress').value.trim();
  const barangay = document.getElementById('barangay').value.trim();
  const city     = document.getElementById('city').value.trim();
  const province = document.getElementById('province').value;
  const zip      = document.getElementById('zipCode').value.trim();

  const shippingSelected = document.querySelector('input[name="shipping"]:checked');
  const shippingName     = shippingSelected.closest('.co-shipping-option').querySelector('.co-shipping-option__name').textContent.trim();

  const paymentSelected = document.querySelector('input[name="payment"]:checked');
  const paymentName     = paymentSelected.closest('.co-payment-option').querySelector('.co-payment-option__name').textContent.trim();

  details.innerHTML = `
    <div class="co-review-item">
      <div class="co-review-item__label">Deliver to</div>
      <div class="co-review-item__value">${fullName}<br>+63 ${phone}<br>${email}<br>${street}, ${barangay}, ${city}, ${province} ${zip}</div>
    </div>
    <div class="co-review-item">
      <div class="co-review-item__label">Shipping</div>
      <div class="co-review-item__value">${shippingName}</div>
    </div>
    <div class="co-review-item">
      <div class="co-review-item__label">Payment</div>
      <div class="co-review-item__value">${paymentName}</div>
    </div>
  `;
}

function initReviewCheckboxes() {
  const ageConfirm   = document.getElementById('ageConfirm');
  const termsConfirm = document.getElementById('termsConfirm');
  const placeBtn     = document.getElementById('placeOrderBtn');

  if (!ageConfirm || !termsConfirm || !placeBtn) return;

  function updatePlaceBtn() {
    placeBtn.disabled = !(ageConfirm.checked && termsConfirm.checked);
  }

  ageConfirm.addEventListener('change', updatePlaceBtn);
  termsConfirm.addEventListener('change', updatePlaceBtn);
}

// ============================================
// SHIPPING OPTIONS
// ============================================

function initShippingOptions() {
  const radios      = document.querySelectorAll('input[name="shipping"]');
  const storePicker = document.getElementById('storePicker');
  const storeSelect = document.getElementById('storeSelect');

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (storePicker) storePicker.hidden = radio.value !== 'pickup';
      if (storeSelect) storeSelect.classList.remove('co-input--error');
      updateShippingTotal();
    });
  });
}

function updateShippingTotal() {
  const selected   = document.querySelector('input[name="shipping"]:checked');
  if (!selected) return;

  const priceEl    = selected.closest('.co-shipping-option').querySelector('.co-shipping-option__price');
  const basePrice  = priceEl.dataset.basePrice;
  const coShipping = document.getElementById('coShipping');

  if (coShipping) {
    coShipping.textContent = basePrice ? `₱${parseInt(basePrice).toLocaleString()}` : 'FREE';
  }

  updateTotal();
}

// ============================================
// PAYMENT OPTIONS
// ============================================

function initPaymentOptions() {
  const radios    = document.querySelectorAll('input[name="payment"]');
  const cardForm  = document.getElementById('cardForm');
  const codNotice = document.getElementById('codNotice');

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (cardForm)  cardForm.hidden  = radio.value !== 'card';
      if (codNotice) codNotice.hidden = radio.value !== 'cod';
    });
  });
}

// ============================================
// CARD INPUT FORMATTING
// ============================================

function initCardFormatting() {
  const cardNumber = document.getElementById('cardNumber');
  const cardExpiry = document.getElementById('cardExpiry');

  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 2) val = val.substring(0, 2) + ' / ' + val.substring(2);
      e.target.value = val;
    });
  }
}

// ============================================
// TOTAL CALCULATION
// ============================================

function updateTotal() {
  const subtotalEl  = document.getElementById('coSubtotal');
  const shippingEl  = document.getElementById('coShipping');
  const totalEl     = document.getElementById('coTotal');
  const reviewTotal = document.getElementById('reviewTotal');

  if (!subtotalEl || !totalEl) return;

  const subtotal = parseFloat(subtotalEl.textContent.replace(/[₱,]/g, '')) || 0;
  const shipping = shippingEl?.textContent === 'FREE' ? 0 : (parseFloat(shippingEl?.textContent.replace(/[₱,]/g, '')) || 0);
  const total    = subtotal + shipping;

  totalEl.textContent = `₱${total.toLocaleString()}`;
  if (reviewTotal) reviewTotal.textContent = `₱${total.toLocaleString()}`;
}

// ============================================
// EDIT BUTTONS
// ============================================

function initEditButtons() {
  document.getElementById('editAddress')?.addEventListener('click', () => {
    document.getElementById('addressForm').hidden    = false;
    document.getElementById('addressSummary').hidden = true;
    updateStep(1);
  });

  document.getElementById('editShipping')?.addEventListener('click', () => {
    document.getElementById('shippingForm').hidden    = false;
    document.getElementById('shippingSummary').hidden = true;
    updateStep(2);
  });

  document.getElementById('editPayment')?.addEventListener('click', () => {
    document.getElementById('paymentForm').hidden    = false;
    document.getElementById('paymentSummary').hidden = true;
    updateStep(3);
  });
}

// ============================================
// PLACE ORDER
// ============================================

function initPlaceOrder() {
  const placeBtn = document.getElementById('placeOrderBtn');
  if (!placeBtn) return;

  placeBtn.addEventListener('click', async () => {
    placeBtn.disabled    = true;
    placeBtn.textContent = 'Placing order…';

    await new Promise(resolve => setTimeout(resolve, 1500));

    const orderNum = 'FG-' + Math.floor(100000 + Math.random() * 900000);
    const successOrderNum = document.getElementById('successOrderNum');
    if (successOrderNum) successOrderNum.textContent = `Order #${orderNum}`;

    const overlay = document.getElementById('successOverlay');
    if (overlay) overlay.hidden = false;
  });
}

// ============================================
// INLINE VALIDATION (on blur)
// ============================================

function initInlineValidation() {
  const rules = {
    firstName:     v => !v ? 'First name is required.' : v.length < 2 ? 'First name must be at least 2 characters.' : null,
    lastName:      v => !v ? 'Last name is required.' : v.length < 2 ? 'Last name must be at least 2 characters.' : null,
    phone:         v => !v ? 'Phone number is required.' : !isValidPhone(v) ? 'Enter a valid PH number (9XX XXX XXXX).' : null,
    email:         v => !v ? 'Email address is required.' : !isValidEmail(v) ? 'Enter a valid email address.' : null,
    streetAddress: v => v ? null : 'Street address is required.',
    barangay:      v => v ? null : 'Barangay is required.',
    city:          v => v ? null : 'City / Municipality is required.',
    province:      v => v ? null : 'Please select a province.',
    zipCode:       v => !v ? 'ZIP code is required.' : !isValidZip(v) ? 'ZIP code must be 4 digits.' : null,
  };

  Object.entries(rules).forEach(([id, validate]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('blur', () => {
      const error = validate(el.value.trim());
      error ? showError(id, error) : clearError(id);
    });

    el.addEventListener('input', () => {
      if (el.classList.contains('co-input--error')) {
        if (!validate(el.value.trim())) clearError(id);
      }
    });
  });
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initShippingOptions();
  initPaymentOptions();
  initCardFormatting();
  initEditButtons();
  initReviewCheckboxes();
  initPlaceOrder();
  initInlineValidation();

  document.getElementById('continueToShipping')?.addEventListener('click', completeDelivery);
  document.getElementById('continueToPayment')?.addEventListener('click', completeShipping);
  document.getElementById('continueToReview')?.addEventListener('click', completePayment);
});