/**
 * VALIDATION UTILITIES
 * Form validation helpers
 */

// Email validation
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
export function validatePassword(password) {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
}

// Password strength checker
export function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

// Check if passwords match
export function checkPasswordMatch(password, confirmPassword) {
  return password === confirmPassword;
}

export function initPasswordToggle() {
  document.querySelectorAll('.rg-toggle-pass').forEach(btn => {
        // Force fill on all SVGs inside the button
      btn.querySelectorAll('svg').forEach(svg => {
        svg.style.fill = 'rgba(255,255,255,0.5)';
      });
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.querySelector('.eye-show').style.display = isPass ? 'none' : 'block';
      btn.querySelector('.eye-hide').style.display = isPass ? 'block' : 'none';
    });
  });
}