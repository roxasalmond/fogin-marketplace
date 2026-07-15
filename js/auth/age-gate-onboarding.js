/**
 * AGE GATE — soft disclaimer, non-authoritative
 * Real enforcement happens server-side (login + requireVerifiedCustomer).
 * This page only: (1) shows the legal disclaimer, (2) collects a birthdate
 * to carry into registration, (3) skips itself on repeat visits for UX only.
 */

import { showOnboarding, resetOnboarding } from './onboarding.js';

// ============================================
// POPULATE DATE DROPDOWNS  (unchanged)
// ============================================
function populateDateDropdowns() {
  const monthSelect = document.getElementById('age-month');
  const daySelect   = document.getElementById('age-day');
  const yearSelect  = document.getElementById('age-year');
  if (!monthSelect || !daySelect || !yearSelect) return;

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  for (let day = 1; day <= 31; day++) {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = day;
    daySelect.appendChild(option);
  }

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;
  const minYear = currentYear - 120;
  for (let year = maxYear; year >= minYear; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
}

// ============================================
// SOFT SKIP — cosmetic only, not a security check
// ============================================
function checkAgeVerification() {
  const verified = localStorage.getItem('ageVerified') || sessionStorage.getItem('ageVerified');
  if (verified) closeAgeGate();
}

function closeAgeGate() {
  const ageGate = document.querySelector('.age-gate');
  if (ageGate) ageGate.style.display = 'none';
}

function showError(message) {
  const errorDiv = document.querySelector('.age-gate__error');
  if (!errorDiv) return;
  errorDiv.textContent = message;
  errorDiv.classList.add('is-visible');
}

function clearError() {
  const errorDiv = document.querySelector('.age-gate__error');
  if (!errorDiv) return;
  errorDiv.textContent = '';
  errorDiv.classList.remove('is-visible');
}

function showExitScreen() {
  const form = document.querySelector('.age-gate__form');
  const exitScreen = document.querySelector('.age-gate__exit');
  if (form) form.style.display = 'none';
  if (exitScreen) exitScreen.classList.add('is-visible');
}

// ============================================
// INITIALIZE AGE GATE
// ============================================
function initAgeGate() {
  const ageForm = document.querySelector('.age-gate__form');
  const exitBtn = document.querySelector('[data-age-gate-exit]');
  const certifyCheckbox = document.getElementById('age-certify');
  const enterBtn = document.querySelector('.age-gate__form button[type="submit"]');

  if (!ageForm) return;

  populateDateDropdowns();
  checkAgeVerification();

  if (enterBtn) enterBtn.disabled = true;

  if (certifyCheckbox && enterBtn) {
    certifyCheckbox.addEventListener('change', () => {
      enterBtn.disabled = !certifyCheckbox.checked;
      if (certifyCheckbox.checked) clearError();
    });
  }

  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      window.location.href = 'https://google.com';
    });
  }

  ageForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    const month = document.getElementById('age-month').value;
    const day = document.getElementById('age-day').value;
    const year = document.getElementById('age-year').value;
    const remember = document.getElementById('age-remember').checked;

    if (!month || !day || !year) {
      showError('Please select your complete date of birth.');
      return;
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

    if (age >= 18) {
      // Cosmetic skip-next-time flag — NOT a security gate. The real check
      // happens at login via requireVerifiedCustomer on the backend; this
      // just avoids re-showing the disclaimer to the same browser.
      if (remember) {
        localStorage.setItem('ageVerified', 'true');
        localStorage.setItem('ageVerifiedDate', new Date().toISOString());
      } else {
        sessionStorage.setItem('ageVerified', 'true');
      }

      // Carry the entered birthdate into registration — sessionStorage
      // survives the age-gate.html → register.html navigation, unlike a
      // window global. ISO format (YYYY-MM-DD) to match the backend's
      // Joi.date().iso() validator on customer-register.
      const isoBirthdate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      sessionStorage.setItem('foginBirthdate', isoBirthdate);

      closeAgeGate();
      window.location.href = 'register.html';

    } else {
      showExitScreen();
    }
  });
}

function resetAgeVerification() {
  localStorage.removeItem('ageVerified');
  localStorage.removeItem('ageVerifiedDate');
  sessionStorage.removeItem('ageVerified');
  sessionStorage.removeItem('foginBirthdate');
}

window.resetAgeVerification = resetAgeVerification;
window.resetOnboarding = resetOnboarding;

document.addEventListener('DOMContentLoaded', initAgeGate);