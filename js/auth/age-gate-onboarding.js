/**
 * AGE GATE & ONBOARDING
 * Age verification with onboarding flow
 */

import { showOnboarding, resetOnboarding } from './onboarding.js';

// ============================================
// POPULATE DATE DROPDOWNS
// ============================================
function populateDateDropdowns() {
  const monthSelect = document.getElementById('age-month');
  const daySelect   = document.getElementById('age-day');
  const yearSelect  = document.getElementById('age-year');

  if (!monthSelect || !daySelect || !yearSelect) return;

  // Months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Days (1-31)
  for (let day = 1; day <= 31; day++) {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = day;
    daySelect.appendChild(option);
  }

  // Years — only years where user would be 18+
  const currentYear        = new Date().getFullYear();
  const maxYear            = currentYear - 18;
  const minYear            = currentYear - 120;

  for (let year = maxYear; year >= minYear; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
}

// ============================================
// CHECK AGE VERIFICATION
// ============================================
function checkAgeVerification() {
  const verified = localStorage.getItem('ageVerified') || sessionStorage.getItem('ageVerified');
  if (verified) closeAgeGate();
}

// ============================================
// CLOSE AGE GATE
// ============================================
function closeAgeGate() {
  const ageGate = document.querySelector('.age-gate');
  if (ageGate) ageGate.style.display = 'none';
}

// ============================================
// SHOW / HIDE ERROR
// ============================================
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

// ============================================
// SHOW EXIT SCREEN
// ============================================
function showExitScreen() {
  const form       = document.querySelector('.age-gate__form');
  const exitScreen = document.querySelector('.age-gate__exit');

  if (form) form.style.display = 'none';
  if (exitScreen) exitScreen.classList.add('is-visible');
}

// ============================================
// INITIALIZE AGE GATE
// ============================================
function initAgeGate() {
  const ageForm        = document.querySelector('.age-gate__form');
  const exitBtn        = document.querySelector('[data-age-gate-exit]');
  const certifyCheckbox = document.getElementById('age-certify');
  const enterBtn       = document.querySelector('.age-gate__form button[type="submit"]');

  if (!ageForm) return;

  // Populate dropdowns
  populateDateDropdowns();

  // Check if already verified
  checkAgeVerification();

  // ─── Enter button starts disabled ─────────
  if (enterBtn) enterBtn.disabled = true;

  // ─── Certify checkbox controls button state
  if (certifyCheckbox && enterBtn) {
    certifyCheckbox.addEventListener('change', () => {
      enterBtn.disabled = !certifyCheckbox.checked;
      if (certifyCheckbox.checked) clearError();
    });
  }

  // ─── Exit button ───────────────────────────
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      window.location.href = 'https://google.com';
    });
  }

  // ─── Form submit ───────────────────────────
  ageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    clearError();

    const month    = document.getElementById('age-month').value;
    const day      = document.getElementById('age-day').value;
    const year     = document.getElementById('age-year').value;
    const remember = document.getElementById('age-remember').checked;

    // Validate dropdowns
    if (!month || !day || !year) {
      showError('Please select your complete date of birth.');
      return;
    }

    // Calculate age
    const birthDate  = new Date(year, month - 1, day);
    const today      = new Date();
    let age          = today.getFullYear() - birthDate.getFullYear();
    const monthDiff  = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 18) {
      // Store verification
      if (remember) {
        localStorage.setItem('ageVerified', 'true');
        localStorage.setItem('ageVerifiedDate', new Date().toISOString());
      } else {
        sessionStorage.setItem('ageVerified', 'true');
      }

      closeAgeGate();

      // Show onboarding on first visit, else redirect
      if (!localStorage.getItem('onboardingCompleted')) {
        setTimeout(() => showOnboarding(), 300);
      } else {
        window.location.href = '../index.html';
      }

    } else {
      showExitScreen();
    }
  });
}

// ============================================
// RESET FUNCTIONS (for testing)
// ============================================
function resetAgeVerification() {
  localStorage.removeItem('ageVerified');
  localStorage.removeItem('ageVerifiedDate');
  sessionStorage.removeItem('ageVerified');
}

window.resetAgeVerification = resetAgeVerification;
window.resetOnboarding      = resetOnboarding;

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', initAgeGate);