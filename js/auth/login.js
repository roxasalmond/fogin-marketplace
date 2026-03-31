// ─────────────────────────────────────────────────────────────
// login.js — Login page logic
// Calls backend API, never touches Supabase directly
// ─────────────────────────────────────────────────────────────

import { auth } from '../../../fogin-shared/js/core/auth.js';
import { config } from '../../../fogin-shared/js/core/config.js';

// ── Elements ──────────────────────────────────────────────────
const form      = document.querySelector('#loginForm');
const emailInput = document.querySelector('#email');
const passInput  = document.querySelector('#password');
const submitBtn  = document.querySelector('#loginBtn');
const btnText    = document.querySelector('#loginBtnText');
const spinner    = document.querySelector('#loginSpinner');
const alertEl    = document.querySelector('#loginAlert');
const alertMsg   = document.querySelector('#loginAlertMessage');

// ── Helpers ───────────────────────────────────────────────────
const showError  = (msg) => { alertMsg.textContent = msg; alertEl.hidden = false; };
const hideError  = ()    => { alertEl.hidden = true; };
const setLoading = (on)  => {
  submitBtn.disabled  = on;
  btnText.textContent = on ? 'Signing in...' : 'Sign In';
  spinner.hidden      = !on;
};

// ── Password toggle ───────────────────────────────────────────
document.querySelectorAll('.rg-toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input   = document.getElementById(btn.dataset.target);
    const isPass  = input.type === 'password';
    input.type    = isPass ? 'text' : 'password';
    btn.querySelector('.eye-show').style.display = isPass ? 'none'  : '';
    btn.querySelector('.eye-hide').style.display = isPass ? ''      : 'none';
  });
});

// ── Redirect by role ──────────────────────────────────────────
function redirectByRole(role) {
  switch (role) {
    case 'super_admin':  window.location.href = config.ADMIN_URL;  break;
    case 'vendor_admin': window.location.href = config.VENDOR_URL; break;
    case 'branch_staff': window.location.href = config.VENDOR_URL; break;
    default:             window.location.href = '../index.html';
  }
}

// ── If already logged in, redirect immediately ────────────────
(async () => {
  const user = await auth.init();
  if (user) redirectByRole(user.role);
})();

// ── Submit ────────────────────────────────────────────────────
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
    // Call backend — never Supabase directly
    const res = await fetch(`${config.API_BASE_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Invalid email or password.');
    }

    // Save session to localStorage via auth module
    auth.saveSession(json.data);

    // Redirect based on role
    redirectByRole(json.data.user.role);

  } catch (err) {
    console.error('[Login]', err);
    showError(err.message || 'Something went wrong. Please try again.');
    setLoading(false);
  }
});