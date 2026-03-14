/**
 * QUANTITY SELECTOR
 * Increase/decrease quantity inputs
 */

export function initQuantitySelectors() {
  document.querySelectorAll('[data-quantity-input]').forEach(input => {
    const decreaseBtn = input.parentElement.querySelector('[data-quantity-decrease]');
    const increaseBtn = input.parentElement.querySelector('[data-quantity-increase]');
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || 1;
        const min = parseInt(input.getAttribute('min')) || 1;
        if (currentValue > min) {
          input.value = currentValue - 1;
          input.dispatchEvent(new Event('change'));
        }
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || 1;
        const max = parseInt(input.getAttribute('max')) || 999;
        if (currentValue < max) {
          input.value = currentValue + 1;
          input.dispatchEvent(new Event('change'));
        }
      });
    }
  });
}

export function setQuantity(input, value) {
  const min = parseInt(input.getAttribute('min')) || 1;
  const max = parseInt(input.getAttribute('max')) || 999;
  
  value = Math.max(min, Math.min(max, value));
  input.value = value;
  input.dispatchEvent(new Event('change'));
}

export function increaseQuantity(input) {
  const currentValue = parseInt(input.value) || 1;
  setQuantity(input, currentValue + 1);
}

export function decreaseQuantity(input) {
  const currentValue = parseInt(input.value) || 1;
  setQuantity(input, currentValue - 1);
}