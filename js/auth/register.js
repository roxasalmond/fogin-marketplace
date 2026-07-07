/* ============================================
   REGISTER PAGE
   js/auth/register.js
============================================ */

import { checkPasswordStrength, initPasswordToggle, validatePassword } from '../validation.js';

document.addEventListener('DOMContentLoaded', () => {

  // ─── Password visibility toggle ───────────
  initPasswordToggle();
  // ─── Password strength indicator ─────────
  const passwordInput = document.getElementById('password');
  const strengthBox   = document.getElementById('password-strength');
  const strengthFill  = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');

  if (passwordInput && strengthBox) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;

      if (!val) {
        strengthBox.hidden = true;
        return;
      }

      const strength = checkPasswordStrength(val);
      strengthBox.hidden = false;

      strengthFill.className = `session-strength__fill session-strength__fill--${strength}`;
      strengthLabel.className = `session-strength__label session-strength__label--${strength}`;
      strengthLabel.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
    });
  }

  // ─── Role switching ───────────────────────
  const roleInputs        = document.querySelectorAll('.session-role__input');
  const roleCards         = document.querySelectorAll('.session-role-card');
  const fieldsVendor      = document.getElementById('fields-vendor');
  const fieldsVendorAdmin = document.getElementById('fields-vendor-admin');

  function getSelectedRole() {
    return document.querySelector('.session-role__input:checked')?.value || 'customer';
  }

  function updateRoleUI(role) {
    // Card active state
    roleCards.forEach(card => {
      const input = card.querySelector('.session-role__input');
      if (input) card.classList.toggle('session-role-card--active', input.value === role);
    });

    // Toggle fieldsets
    fieldsVendor?.classList.toggle('session-fieldset--hidden',      role !== 'vendor');
    fieldsVendorAdmin?.classList.toggle('session-fieldset--hidden', role !== 'vendor_admin');

    // Toggle required on dynamic fields
    setRequired('business-name',    role === 'vendor');
    setRequired('business-address', role === 'vendor');
    setRequired('shop-code',        role === 'vendor_admin');
    setRequired('job-title',        role === 'vendor_admin');

    // Update submit label
    const labels = {
      customer:     'Create Account',
      vendor:       'Submit Vendor Application',
      vendor_admin: 'Submit Vendor Admin Application',
    };
    const submitBtnText = document.getElementById('submit-btn-text');
    if (submitBtnText) submitBtnText.textContent = labels[role] || 'Create Account';
  }

  function setRequired(id, required) {
    const el = document.getElementById(id);
    if (!el) return;
    el.required = required;
    if (!required) {
      el.value = '';
      clearError(id);
    }
  }

  roleInputs.forEach(input => {
    input.addEventListener('change', () => {
      roleCards.forEach(c => c.classList.remove('session-role-card--active'));
      input.closest('label')?.classList.add('session-role-card--active');
      updateRoleUI(input.value);
    });
  });

  // Init role UI
  updateRoleUI('customer');

  // ─── Validation helpers ───────────────────
  function showError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    input?.classList.add('session-input--error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    input?.classList.remove('session-input--error');
    if (errEl) errEl.textContent = '';
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validatePhone(val) {
    return /^9\d{9}$/.test(val.replace(/\s/g, ''));
  }

  // Live clear on input
  document.querySelectorAll('.session-input').forEach(input => {
    input.addEventListener('input', () => clearError(input.id));
  });

  ['age-check', 'terms-check'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => clearError(id));
  });

  const blurRules = {
  'first-name':       v => !v ? 'First name is required.' : v.length < 2 ? 'First name must be at least 2 characters.' : null,
  'last-name':        v => !v ? 'Last name is required.'  : v.length < 2 ? 'Last name must be at least 2 characters.'  : null,
  email:           v => !v ? 'Email address is required.' : !validateEmail(v) ? 'Enter a valid email address.' : null,
  phone:           v => !v ? 'Phone number is required.' : !validatePhone(v) ? 'Enter a valid PH mobile number (e.g. 9171234567).' : null,
  password:        v => !validatePassword(v) ? 'Min. 8 characters, 1 uppercase, 1 lowercase, 1 number.' : null,
  'confirm-password': v => v !== document.getElementById('password').value ? 'Passwords do not match.' : null,
  'business-name':    v => !v ? 'Business name is required.' : null,
  'business-address': v => !v ? 'Business address is required.' : null,
  'shop-code':        v => !v ? 'A valid shop invite code is required.' : null,
  'job-title':        v => !v ? 'Job title is required.' : null,
};

Object.entries(blurRules).forEach(([id, validate]) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    const err = validate(el.value.trim());
    err ? showError(id, err) : clearError(id);
  });
});

  // ─── Form validation ──────────────────────
  function validateForm() {
    let valid = true;
    const role = getSelectedRole();

    const firstName = document.getElementById('first-name').value.trim();
    if (!firstName) { showError('first-name', 'First name is required.'); valid = false; }
    else clearError('first-name');

    const lastName = document.getElementById('last-name').value.trim();
    if (!lastName) { showError('last-name', 'Last name is required.'); valid = false; }
    else clearError('last-name');

    const email = document.getElementById('email').value.trim();
    if (!validateEmail(email)) { showError('email', 'Enter a valid email address.'); valid = false; }
    else clearError('email');

    const phone = document.getElementById('phone').value.trim();
    if (!validatePhone(phone)) { showError('phone', 'Enter a valid PH mobile number (e.g. 9171234567).'); valid = false; }
    else clearError('phone');

    const password = document.getElementById('password').value;
    if (!validatePassword(password)) { showError('password', 'Min. 8 characters, 1 uppercase, 1 lowercase, 1 number.'); valid = false; }
    else clearError('password');

    const confirmPassword = document.getElementById('confirm-password').value;
    if (confirmPassword !== password) { showError('confirm-password', 'Passwords do not match.'); valid = false; }
    else clearError('confirm-password');

    if (role === 'vendor') {
      const businessName = document.getElementById('business-name').value.trim();
      if (!businessName) { showError('business-name', 'Business name is required.'); valid = false; }
      else clearError('business-name');

      const businessAddress = document.getElementById('business-address').value.trim();
      if (!businessAddress) { showError('business-address', 'Business address is required.'); valid = false; }
      else clearError('business-address');
    }

    if (role === 'vendor_admin') {
      const shopCode = document.getElementById('shop-code').value.trim();
      if (!shopCode) { showError('shop-code', 'A valid shop invite code is required.'); valid = false; }
      else clearError('shop-code');

      const jobTitle = document.getElementById('job-title').value.trim();
      if (!jobTitle) { showError('job-title', 'Job title is required.'); valid = false; }
      else clearError('job-title');
    }

    const ageCheck = document.getElementById('age-check').checked;
    if (!ageCheck) { showError('age-check', 'You must confirm you are 18 or older.'); valid = false; }
    else clearError('age-check');

    const termsCheck = document.getElementById('terms-check').checked;
    if (!termsCheck) { showError('terms-check', 'You must agree to the Terms of Service.'); valid = false; }
    else clearError('terms-check');

    return valid;
  }

  // ─── Submit ───────────────────────────────
  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const role    = getSelectedRole();
    const btn     = document.getElementById('submit-btn');
    const spinner = document.getElementById('submit-spinner');
    const label   = document.getElementById('submit-btn-text');

    btn.disabled   = true;
    label.hidden   = true;
    spinner.hidden = false;

    await new Promise(r => setTimeout(r, 1400));

    const firstName    = document.getElementById('first-name').value.trim();
    const lastName     = document.getElementById('last-name').value.trim();
    const email        = document.getElementById('email').value.trim();
    const businessName = document.getElementById('business-name')?.value.trim() || '';
    const shopCode     = document.getElementById('shop-code')?.value.trim() || '';

    if (role === 'customer') {
      localStorage.setItem('foginUser', JSON.stringify({ firstName, lastName, email }));
      window.location.href = '../customer/account.html';
      return;
    }

    showPendingScreen({ role, firstName, lastName, email, businessName, shopCode });
  });

  // ─── Pending screen ───────────────────────
  function showPendingScreen({ role, firstName, lastName, email, businessName, shopCode }) {
    document.getElementById('step-register').hidden = true;
    document.getElementById('step-pending').hidden  = false;

    const roleLabels = { vendor: 'Vendor', vendor_admin: 'Vendor Admin' };
    document.getElementById('pending-role').textContent = roleLabels[role] || role;

    document.getElementById('pending-name').textContent         = `${firstName} ${lastName}`;
    document.getElementById('pending-email').textContent        = email;
    document.getElementById('pending-email-confirm').textContent = email;

    const businessRow = document.getElementById('pending-business-row');
    const shopRow     = document.getElementById('pending-shop-row');

    if (role === 'vendor') {
      businessRow.hidden = false;
      shopRow.hidden     = true;
      document.getElementById('pending-business').textContent = businessName || '—';
    } else if (role === 'vendor_admin') {
      businessRow.hidden = true;
      shopRow.hidden     = false;
      document.getElementById('pending-shop').textContent = shopCode || '—';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

});