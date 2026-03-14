/**
 * FOGIN - Component Initialization Hub
 * Loads and initializes all interactive components
 */

import { initCart } from './utils/cart.js';
import { initFavorites } from './utils/favorites.js';
import { initModals } from '../../fogin-shared/js/core/modal.js';
import { initQuantitySelectors } from './ui/quantity-selector.js';
import { initNavbar } from './components/navbar.js';
import { initFooter } from './components/footer.js';

// Initialize all components
function initComponents() {
  initCart();
  initFavorites();
  initModals();
  initQuantitySelectors();
  initNavbar();
  initFooter();
  
  console.log('✅ Fogin components initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponents);
} else {
  initComponents();
}

// Export for external use
export { initComponents };
