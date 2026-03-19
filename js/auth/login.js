// ─────────────────────────────────────────────────────────
// login.js — Fogin login page
// ─────────────────────────────────────────────────────────

import { api, setTokens, setUser, getUser } from '../../../../fogin-shared/js/core/api.js';

// ── Redirect if already logged in ────────────────────────
const existingUser = getUser();
if (existingUser) redirectByRole(existingUser);

// ── DOM Elements ──────────────────────────────────────────
const form        = document.querySelector('#loginForm');
const emailInput  = document.querySelector('#email');
const passInput   = document.querySelector('#password');
const submitBtn   = document.querySelector('#loginBtn');
const btnText     = document.querySelector('#loginBtnText');
const spinner     = document.querySelector('#loginSpinner');
const alert       = document.querySelector('#loginAlert');
const alertMsg    = document.querySelector('#loginAlertMessage');

// ── Helpers ───────────────────────────────────────────────
const showError = (message) => {
  alertMsg.textContent = message;
  alert.hidden = false;
};

const hideError = () => {
  alert.hidden = true;
};

const setLoading = (loading) => {
  submitBtn.disabled = loading;
  btnText.textContent = loading ? 'Signing in...' : 'Sign In';
  spinner.hidden = !loading;
};

function redirectByRole(user) {
  switch (user.role) {
    case 'super_admin':
      window.location.href = '../../fogin-dashboard/admin/index.html';
      break;
    case 'vendor_admin':
      window.location.href = '../../fogin-dashboard/vendor/index.html';
      break;
    case 'branch_staff':
      window.location.href = '../../fogin-dashboard/vendor/pos.html';
      break;
    default:
      window.location.href = '../index.html';
  }
}

// ── Form Submit ───────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email    = emailInput.value.trim();
  const password = passInput.value;

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  setLoading(true);

  try {
    const res = await api.post('/auth/login', { email, password });

    if (!res.success) {
      showError(res.message || 'Invalid email or password.');
      return;
    }

    const { access_token, refresh_token, expires_at, user } = res.data;

    // Store tokens and user
    setTokens({ access_token, refresh_token, expires_at });
    setUser(user);

    // Redirect based on role
    redirectByRole(user);

  } catch (err) {
    showError('Something went wrong. Please try again.');
    console.error('[Login]', err);
  } finally {
    setLoading(false);
  }
});