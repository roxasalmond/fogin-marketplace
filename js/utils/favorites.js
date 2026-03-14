/**
 * FAVORITES MANAGEMENT
 * Manages favorite products in localStorage
 */

export function toggleFavorite(productId) {
  let favorites = getFavorites();
  
  if (favorites.includes(productId)) {
    favorites = favorites.filter(id => id !== productId);
  } else {
    favorites.push(productId);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  return favorites.includes(productId);
}

export function addToFavorites(productId) {
  let favorites = getFavorites();
  
  if (!favorites.includes(productId)) {
    favorites.push(productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  
  return true;
}

export function removeFromFavorites(productId) {
  let favorites = getFavorites();
  favorites = favorites.filter(id => id !== productId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  return true;
}

export function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

export function isFavorite(productId) {
  const favorites = getFavorites();
  return favorites.includes(productId);
}

export function clearFavorites() {
  localStorage.removeItem('favorites');
}

// Initialize favorite buttons
export function initFavorites() {
  document.querySelectorAll('.product-card__favorite').forEach(button => {
    const productCard = button.closest('.product-card');
    const productId = productCard?.getAttribute('data-product-id');
    
    // Set initial state
    if (productId && isFavorite(productId)) {
      button.classList.add('product-card__favorite--active');
    }
    
    // Add click handler
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (productId) {
        const isNowFavorite = toggleFavorite(productId);
        button.classList.toggle('product-card__favorite--active', isNowFavorite);
        
        // Import and show notification
        import('./notifications.js').then(({ showNotification }) => {
          showNotification(
            isNowFavorite ? 'Added to favorites!' : 'Removed from favorites',
            'success'
          );
        });
      }
    });
  });
}