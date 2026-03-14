/**
 * SHOPPING CART UTILITIES
 * Manages cart in localStorage
 */

export function addToCart(productId, quantity = 1) {
  // Get existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if product already exists in cart
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      quantity: quantity,
      addedAt: new Date().toISOString()
    });
  }
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart badge
  updateCartBadge();
  
  return cart;
}

export function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  return cart;
}

export function updateCartQuantity(productId, quantity) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
  }
  
  return cart;
}

export function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

export function clearCart() {
  localStorage.removeItem('cart');
  updateCartBadge();
}

export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function updateCartBadge() {
  const totalItems = getCartTotal();
  
  const badges = document.querySelectorAll('.btn-cart__badge');
  badges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

// Initialize cart badge on page load
export function initCart() {
  updateCartBadge();
  
  // Add to cart button handlers
  document.querySelectorAll('[data-add-to-cart]').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      if (productId) {
        addToCart(productId);
        
        // Import and show notification
        import('./notifications.js').then(({ showNotification }) => {
          showNotification('Added to cart!', 'success');
        });
      }
    });
  });
}