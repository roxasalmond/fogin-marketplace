/**
 * LOGIN PAGE
 * js/auth/login.js
 */

import { initPasswordToggle, validateEmail } from '../validation.js';

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initBlurValidation();

  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
});

// ============================================
// SUBMIT
// ============================================

async function handleLogin(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const email      = document.getElementById('email').value.trim();
  const password   = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  hideAlert('loginAlert');
  setLoading(true);

  try {
    // TODO: Replace with real API call
    await simulateAPICall();

    if (email === 'admin@fogin.ph' && password === 'Admin@123') {
      window.location.href = '../dashboard/admin/index.html';
    } else if (email === 'vendor@test.com' && password === 'Vendor@123') {
      window.location.href = '../dashboard/vendor/index.html';
    } else if (email === 'employee@test.com' && password === 'Employee@123') {
      window.location.href = '../dashboard/vendor/pos.html';
    } else if (email === 'customer@test.com' && password === 'Customer@123') {
      window.location.href = '../index.html';
    } else {
      throw new Error('Invalid credentials');
    }

  } catch (error) {
    console.error('Login error:', error);
    showAlert('loginAlert', 'Invalid email or password. Please try again.');
  } finally {
    setLoading(false);
  }
}

// ============================================
// VALIDATION
// ============================================

function validateForm() {
  let valid = true;

  const email = document.getElementById('email').value.trim();
  if (!email)                     { showError('email', 'Email address is required.'); valid = false; }
  else if (!validateEmail(email)) { showError('email', 'Enter a valid email address.'); valid = false; }
  else clearError('email');

  const password = document.getElementById('password').value;
  if (!password) { showError('password', 'Password is required.'); valid = false; }
  else clearError('password');

  return valid;
}

function initBlurValidation() {
  const blurRules = {
    email:    v => !v ? 'Email address is required.' : !validateEmail(v) ? 'Enter a valid email address.' : null,
    password: v => !v ? 'Password is required.' : null,
  };

  Object.entries(blurRules).forEach(([id, validate]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => { const err = validate(el.value.trim()); err ? showError(id, err) : clearError(id); });
    el.addEventListener('input', () => { if (el.classList.contains('rg-input--error') && !validate(el.value.trim())) clearError(id); });
  });
}

// ============================================
// HELPERS
// ============================================

function showError(fieldId, msg) {
  document.getElementById(fieldId)?.classList.add('rg-input--error');
  const errEl = document.getElementById(`err-${fieldId}`);
  if (errEl) errEl.textContent = msg;
}

function clearError(fieldId) {
  document.getElementById(fieldId)?.classList.remove('rg-input--error');
  const errEl = document.getElementById(`err-${fieldId}`);
  if (errEl) errEl.textContent = '';
}

function showAlert(alertId, message) {
  const alert = document.getElementById(alertId);
  const msgEl = document.getElementById(`${alertId}Message`);
  if (alert && msgEl) { msgEl.textContent = message; alert.hidden = false; }
}

function hideAlert(alertId) {
  const alert = document.getElementById(alertId);
  if (alert) alert.hidden = true;
}

function setLoading(isLoading) {
  const btn     = document.getElementById('loginBtn');
  const btnText = document.getElementById('loginBtnText');
  const spinner = document.getElementById('loginSpinner');
  if (!btn) return;
  btn.disabled   = isLoading;
  btnText.hidden = isLoading;
  spinner.hidden = !isLoading;
}

function simulateAPICall() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}