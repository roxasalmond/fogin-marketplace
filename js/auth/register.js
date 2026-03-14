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
  const strengthBox   = document.getElementById('passwordStrength');
  const strengthFill  = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');

  if (passwordInput && strengthBox) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;

      if (!val) {
        strengthBox.hidden = true;
        return;
      }

      const strength = checkPasswordStrength(val);
      strengthBox.hidden = false;

      strengthFill.className = `rg-strength-fill rg-strength-fill--${strength}`;
      strengthLabel.className = `rg-strength-label rg-strength-label--${strength}`;
      strengthLabel.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
    });
  }

  // ─── Role switching ───────────────────────
  const roleInputs        = document.querySelectorAll('.rg-role-input');
  const roleCards         = document.querySelectorAll('.rg-role-card');
  const fieldsVendor      = document.getElementById('fieldsVendor');
  const fieldsVendorAdmin = document.getElementById('fieldsVendorAdmin');

  function getSelectedRole() {
    return document.querySelector('.rg-role-input:checked')?.value || 'customer';
  }

  function updateRoleUI(role) {
    // Card active state
    roleCards.forEach(card => {
      const input = card.querySelector('.rg-role-input');
      if (input) card.classList.toggle('rg-role-card--active', input.value === role);
    });

    // Toggle fieldsets
    fieldsVendor?.classList.toggle('rg-fieldset--hidden',      role !== 'vendor');
    fieldsVendorAdmin?.classList.toggle('rg-fieldset--hidden', role !== 'vendor_admin');

    // Toggle required on dynamic fields
    setRequired('businessName',    role === 'vendor');
    setRequired('businessAddress', role === 'vendor');
    setRequired('shopCode',        role === 'vendor_admin');
    setRequired('jobTitle',        role === 'vendor_admin');

    // Update submit label
    const labels = {
      customer:     'Create Account',
      vendor:       'Submit Vendor Application',
      vendor_admin: 'Submit Vendor Admin Application',
    };
    const submitBtnText = document.getElementById('submitBtnText');
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
      roleCards.forEach(c => c.classList.remove('rg-role-card--active'));
      input.closest('label')?.classList.add('rg-role-card--active');
      updateRoleUI(input.value);
    });
  });

  // Init role UI
  updateRoleUI('customer');

  // ─── Validation helpers ───────────────────
  function showError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    input?.classList.add('rg-input--error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    input?.classList.remove('rg-input--error');
    if (errEl) errEl.textContent = '';
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validatePhone(val) {
    return /^9\d{9}$/.test(val.replace(/\s/g, ''));
  }

  // Live clear on input
  document.querySelectorAll('.rg-input').forEach(input => {
    input.addEventListener('input', () => clearError(input.id));
  });

  ['ageCheck', 'termsCheck'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => clearError(id));
  });

  const blurRules = {
  firstName:       v => !v ? 'First name is required.' : v.length < 2 ? 'First name must be at least 2 characters.' : null,
  lastName:        v => !v ? 'Last name is required.'  : v.length < 2 ? 'Last name must be at least 2 characters.'  : null,
  email:           v => !v ? 'Email address is required.' : !validateEmail(v) ? 'Enter a valid email address.' : null,
  phone:           v => !v ? 'Phone number is required.' : !validatePhone(v) ? 'Enter a valid PH mobile number (e.g. 9171234567).' : null,
  password:        v => !validatePassword(v) ? 'Min. 8 characters, 1 uppercase, 1 lowercase, 1 number.' : null,
  confirmPassword: v => v !== document.getElementById('password').value ? 'Passwords do not match.' : null,
  businessName:    v => !v ? 'Business name is required.' : null,
  businessAddress: v => !v ? 'Business address is required.' : null,
  shopCode:        v => !v ? 'A valid shop invite code is required.' : null,
  jobTitle:        v => !v ? 'Job title is required.' : null,
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

    const firstName = document.getElementById('firstName').value.trim();
    if (!firstName) { showError('firstName', 'First name is required.'); valid = false; }
    else clearError('firstName');

    const lastName = document.getElementById('lastName').value.trim();
    if (!lastName) { showError('lastName', 'Last name is required.'); valid = false; }
    else clearError('lastName');

    const email = document.getElementById('email').value.trim();
    if (!validateEmail(email)) { showError('email', 'Enter a valid email address.'); valid = false; }
    else clearError('email');

    const phone = document.getElementById('phone').value.trim();
    if (!validatePhone(phone)) { showError('phone', 'Enter a valid PH mobile number (e.g. 9171234567).'); valid = false; }
    else clearError('phone');

    const password = document.getElementById('password').value;
    if (!validatePassword(password)) { showError('password', 'Min. 8 characters, 1 uppercase, 1 lowercase, 1 number.'); valid = false; }
    else clearError('password');

    const confirmPassword = document.getElementById('confirmPassword').value;
    if (confirmPassword !== password) { showError('confirmPassword', 'Passwords do not match.'); valid = false; }
    else clearError('confirmPassword');

    if (role === 'vendor') {
      const businessName = document.getElementById('businessName').value.trim();
      if (!businessName) { showError('businessName', 'Business name is required.'); valid = false; }
      else clearError('businessName');

      const businessAddress = document.getElementById('businessAddress').value.trim();
      if (!businessAddress) { showError('businessAddress', 'Business address is required.'); valid = false; }
      else clearError('businessAddress');
    }

    if (role === 'vendor_admin') {
      const shopCode = document.getElementById('shopCode').value.trim();
      if (!shopCode) { showError('shopCode', 'A valid shop invite code is required.'); valid = false; }
      else clearError('shopCode');

      const jobTitle = document.getElementById('jobTitle').value.trim();
      if (!jobTitle) { showError('jobTitle', 'Job title is required.'); valid = false; }
      else clearError('jobTitle');
    }

    const ageCheck = document.getElementById('ageCheck').checked;
    if (!ageCheck) { showError('ageCheck', 'You must confirm you are 18 or older.'); valid = false; }
    else clearError('ageCheck');

    const termsCheck = document.getElementById('termsCheck').checked;
    if (!termsCheck) { showError('termsCheck', 'You must agree to the Terms of Service.'); valid = false; }
    else clearError('termsCheck');

    return valid;
  }

  // ─── Submit ───────────────────────────────
  document.getElementById('registerForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const role    = getSelectedRole();
    const btn     = document.getElementById('loginBtn');
    const spinner = document.getElementById('submitSpinner');
    const label   = document.getElementById('submitBtnText');

    btn.disabled   = true;
    label.hidden   = true;
    spinner.hidden = false;

    await new Promise(r => setTimeout(r, 1400));

    const firstName    = document.getElementById('firstName').value.trim();
    const lastName     = document.getElementById('lastName').value.trim();
    const email        = document.getElementById('email').value.trim();
    const businessName = document.getElementById('businessName')?.value.trim() || '';
    const shopCode     = document.getElementById('shopCode')?.value.trim() || '';

    if (role === 'customer') {
      localStorage.setItem('foginUser', JSON.stringify({ firstName, lastName, email }));
      window.location.href = '../customer/account.html';
      return;
    }

    showPendingScreen({ role, firstName, lastName, email, businessName, shopCode });
  });

  // ─── Pending screen ───────────────────────
  function showPendingScreen({ role, firstName, lastName, email, businessName, shopCode }) {
    document.getElementById('stepRegister').hidden = true;
    document.getElementById('stepPending').hidden  = false;

    const roleLabels = { vendor: 'Vendor', vendor_admin: 'Vendor Admin' };
    document.getElementById('pendingRole').textContent = roleLabels[role] || role;

    document.getElementById('pendingName').textContent         = `${firstName} ${lastName}`;
    document.getElementById('pendingEmail').textContent        = email;
    document.getElementById('pendingEmailConfirm').textContent = email;

    const businessRow = document.getElementById('pendingBusinessRow');
    const shopRow     = document.getElementById('pendingShopRow');

    if (role === 'vendor') {
      businessRow.hidden = false;
      shopRow.hidden     = true;
      document.getElementById('pendingBusiness').textContent = businessName || '—';
    } else if (role === 'vendor_admin') {
      businessRow.hidden = true;
      shopRow.hidden     = false;
      document.getElementById('pendingShop').textContent = shopCode || '—';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

});