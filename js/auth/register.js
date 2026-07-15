/* ============================================
   REGISTER PAGE — customer only
   js/auth/register.js
============================================ */

import { checkPasswordStrength, initPasswordToggle, validatePassword } from '../validation.js';
import { api } from '../../fogin-shared/js/core/api.js';
import { auth } from '../../fogin-shared/js/core/auth.js';
import { uploadToCloudinary } from '../../fogin-shared/js/core/upload.js';

document.addEventListener('DOMContentLoaded', () => {

  const birthdate = sessionStorage.getItem('foginBirthdate');
  if (!birthdate) {
    window.location.href = 'age-gate.html';
    return;
  }

  initPasswordToggle();

  const passwordInput = document.getElementById('password');
  const strengthBox   = document.getElementById('password-strength');
  const strengthFill  = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');

  passwordInput?.addEventListener('input', () => {
    const val = passwordInput.value;
    if (!val) { strengthBox.hidden = true; return; }
    const strength = checkPasswordStrength(val);
    strengthBox.hidden = false;
    strengthFill.className = `session-strength__fill session-strength__fill--${strength}`;
    strengthLabel.className = `session-strength__label session-strength__label--${strength}`;
    strengthLabel.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
  });

  function showError(fieldId, msg) {
    document.getElementById(fieldId)?.classList.add('session-input--error');
    const errEl = document.getElementById(`err-${fieldId}`);
    if (errEl) errEl.textContent = msg;
  }

  function clearError(fieldId) {
    document.getElementById(fieldId)?.classList.remove('session-input--error');
    const errEl = document.getElementById(`err-${fieldId}`);
    if (errEl) errEl.textContent = '';
  }

  function validateEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }
  function validatePhone(val) { return /^9\d{9}$/.test(val.replace(/\s/g, '')); }

  document.querySelectorAll('.session-input').forEach(input => {
    input.addEventListener('input', () => clearError(input.id));
  });
  ['age-check', 'terms-check'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => clearError(id));
  });

  const blurRules = {
    'first-name':       v => !v ? 'First name is required.' : v.length < 2 ? 'First name must be at least 2 characters.' : null,
    'last-name':        v => !v ? 'Last name is required.'  : v.length < 2 ? 'Last name must be at least 2 characters.'  : null,
    email:              v => !v ? 'Email address is required.' : !validateEmail(v) ? 'Enter a valid email address.' : null,
    phone:              v => !v ? 'Phone number is required.' : !validatePhone(v) ? 'Enter a valid PH mobile number (e.g. 9171234567).' : null,
    password:           v => !validatePassword(v) ? 'Min. 8 characters, 1 uppercase, 1 lowercase, 1 number.' : null,
    'confirm-password': v => v !== document.getElementById('password').value ? 'Passwords do not match.' : null,
  };

  Object.entries(blurRules).forEach(([id, validate]) => {
    document.getElementById(id)?.addEventListener('blur', function () {
      const err = validate(this.value.trim());
      err ? showError(id, err) : clearError(id);
    });
  });

  function validateRegisterForm() {
    let valid = true;
    Object.entries(blurRules).forEach(([id, validate]) => {
      const val = document.getElementById(id).value.trim();
      const err = validate(val);
      if (err) { showError(id, err); valid = false; } else clearError(id);
    });

    if (!document.getElementById('age-check').checked) {
      showError('age-check', 'You must confirm you are 18 or older.'); valid = false;
    } else clearError('age-check');

    if (!document.getElementById('terms-check').checked) {
      showError('terms-check', 'You must agree to the Terms of Service.'); valid = false;
    } else clearError('terms-check');

    return valid;
  }

  let registeredUser = { firstName: '', lastName: '', email: '' };

  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    const btn     = document.getElementById('submit-btn');
    const spinner = document.getElementById('submit-spinner');
    const label   = document.getElementById('submit-btn-text');
    btn.disabled = true; label.hidden = true; spinner.hidden = false;

    const firstName = document.getElementById('first-name').value.trim();
    const lastName  = document.getElementById('last-name').value.trim();
    const email     = document.getElementById('email').value.trim();
    const phone     = document.getElementById('phone').value.trim();
    const password  = document.getElementById('password').value;

    try {
      const session = await api.post('/auth/customer-register', {
        email,
        password,
        full_name: `${firstName} ${lastName}`,
        phone,
        birthdate: window.__foginBirthdate, // set by age-gate-onboarding.js before this page is reachable
        declaration_accepted: true
      });

      auth.saveSession(session);
      registeredUser = { firstName, lastName, email };

      document.getElementById('step-register').hidden = true;
      document.getElementById('step-verify').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      showError('email', err.message || 'Registration failed. Please try again.');
    } finally {
      btn.disabled = false; label.hidden = false; spinner.hidden = true;
    }
  });

  // ─── Step 2: ID + selfie upload ───────────
  document.getElementById('verify-form')?.addEventListener('submit', async e => {
    e.preventDefault();

    const idType  = document.getElementById('id-type').value;
    const idLast4 = document.getElementById('id-last4').value.trim();
    const idFile  = document.getElementById('id-image').files[0];
    const selfieFile = document.getElementById('selfie-image').files[0];

    let valid = true;
    if (!idType) { showError('id-type', 'Select an ID type.'); valid = false; } else clearError('id-type');
    if (!/^[A-Za-z0-9]{4}$/.test(idLast4)) { showError('id-last4', 'Enter the last 4 characters of your ID number.'); valid = false; } else clearError('id-last4');
    if (!idFile) { showError('id-image', 'Upload a photo of your ID.'); valid = false; } else clearError('id-image');
    if (!selfieFile) { showError('selfie-image', 'Upload a selfie holding your ID.'); valid = false; } else clearError('selfie-image');
    if (!valid) return;

    const btn     = document.getElementById('verify-submit-btn');
    const spinner = document.getElementById('verify-submit-spinner');
    const label   = document.getElementById('verify-submit-btn-text');
    btn.disabled = true; label.hidden = true; spinner.hidden = false;

    try {
      const [idImageUrl, selfieImageUrl] = await Promise.all([
        uploadToCloudinary(idFile, 'fogin/age-verification'),
        uploadToCloudinary(selfieFile, 'fogin/age-verification')
      ]);

      await api.patch('/auth/customer-verification/documents', {
        id_type: idType,
        id_last4: idLast4,
        id_image_url: idImageUrl,
        selfie_image_url: selfieImageUrl
      });

      document.getElementById('pending-name').textContent  = `${registeredUser.firstName} ${registeredUser.lastName}`;
      document.getElementById('pending-email').textContent = registeredUser.email;
      document.getElementById('step-verify').hidden = true;
      document.getElementById('step-pending').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      showError('id-image', err.message || 'Upload failed. Please try again.');
    } finally {
      btn.disabled = false; label.hidden = false; spinner.hidden = true;
    }
  });

});