/* ============================================
   HOME PAGE — JavaScript
   Fogin Vape Marketplace
   ============================================ */

// ─── NOTICE BANNER ──────────────────────────
const notice = document.getElementById('siteNotice');
const dismissBtn = document.getElementById('dismissNotice');
const navbar = document.querySelector('.navbar');

if (dismissBtn && notice) {
  // Restore dismissed state
  if (sessionStorage.getItem('noticeDismissed')) {
    notice.remove();
    navbar?.classList.add('notice-dismissed');
  }

  dismissBtn.addEventListener('click', () => {
    notice.classList.add('is-dismissing');
    sessionStorage.setItem('noticeDismissed', '1');
    setTimeout(() => {
      notice.remove();
      navbar?.classList.add('notice-dismissed');
    }, 320);
  });
}

// ─── MOBILE NAV ─────────────────────────────
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');

navToggle?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile nav on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar')) {
    mobileNav?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});

// ─── STICKY NAV SHADOW ──────────────────────
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
}, { passive: true });

// ─── PRODUCT DATA (Static — replace with API) 
const PRODUCTS = [
  {
    id: 1,
    name: 'Vaporesso XROS 4 Mini',
    vendor: 'VapeHub Manila',
    category: 'Pod Systems',
    price: 2499,
    originalPrice: null,
    emoji: '🔋',
    badge: 'New',
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 2,
    name: 'Relx Infinity 2',
    vendor: 'VapeStation PH',
    category: 'Pod Systems',
    price: 1899,
    originalPrice: 2199,
    emoji: '💨',
    badge: 'Sale',
    rating: 4.7,
    reviews: 89,
  },
  {
    id: 3,
    name: 'Voopoo Drag S Pro',
    vendor: 'CloudGuru Cebu',
    category: 'Mods',
    price: 4299,
    originalPrice: null,
    emoji: '⚡',
    badge: null,
    rating: 4.8,
    reviews: 52,
  },
  {
    id: 4,
    name: 'Naked 100 Lava Flow',
    vendor: 'PodMaster',
    category: 'E-Liquids',
    price: 599,
    originalPrice: 799,
    emoji: '💧',
    badge: 'Sale',
    rating: 4.9,
    reviews: 204,
  },
];

// ─── RENDER PRODUCTS ────────────────────────
function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = products.map(p => `
    <article class="product-card" data-product-id="${p.id}">
      <div class="product-card__img-wrap">
        <div class="product-card__img-placeholder">${p.emoji}</div>
        ${p.badge ? `
          <div class="product-card__badge-wrap">
            <span class="product-card__badge product-card__badge--${p.badge.toLowerCase()}">${p.badge}</span>
          </div>
        ` : ''}
        <button class="product-card__fav" aria-label="Add to wishlist" data-fav="${p.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="product-card__body">
        <div class="product-card__vendor">${p.vendor}</div>
        <h3 class="product-card__name">${p.name}</h3>
        <div class="product-card__rating">
          <span class="product-card__stars">★</span>
          ${p.rating} <span>(${p.reviews})</span>
        </div>
        <div class="product-card__price-row">
          <span class="product-card__price">₱${p.price.toLocaleString()}</span>
          ${p.originalPrice ? `<span class="product-card__original-price">₱${p.originalPrice.toLocaleString()}</span>` : ''}
        </div>
      </div>
      <div class="product-card__footer">
        <button class="product-card__add" data-add-to-cart="${p.id}">Add to Cart</button>
      </div>
    </article>
  `).join('');

  bindProductActions();
}

// ─── PRODUCT ACTIONS ─────────────────────────
function bindProductActions() {
  // Add to cart
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.addToCart;
      addToCart(id);
    });
  });

  // Wishlist
  document.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('is-active');
      const svg = e.currentTarget.querySelector('svg path');
      if (e.currentTarget.classList.contains('is-active')) {
        svg.setAttribute('fill', '#ef4444');
        svg.setAttribute('stroke', '#ef4444');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    });
  });
}

// ─── CART ─────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('foginCart') || '[]');

function addToCart(productId) {
  const existing = cart.find(i => i.id == productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  localStorage.setItem('foginCart', JSON.stringify(cart));
  updateCartUI();
  showToast('Added to cart!');
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  badge.textContent = total;
  badge.classList.toggle('has-items', total > 0);
}

// ─── TOAST NOTIFICATION ──────────────────────
function showToast(message, type = 'success') {
  const existing = document.querySelector('.fogin-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'fogin-toast';
  toast.innerHTML = `
    <span>${message}</span>
  `;

  // Inline styles for toast (self-contained)
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: type === 'success' ? '#C8FF00' : '#ef4444',
    color: '#1a1a1a',
    padding: '12px 20px',
    borderRadius: '10px',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: '700',
    fontSize: '14px',
    zIndex: '9999',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    animation: 'toastIn 0.3s ease',
  });

  // Inject animation if not already there
  if (!document.getElementById('toastStyles')) {
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
      @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ─── TABS ─────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
    btn.classList.add('tab-btn--active');
    // In a real app, filter products by tab
    // For now, just re-render same products with skeleton flash
    const grid = document.getElementById('productGrid');
    if (grid) {
      grid.innerHTML = '<div class="product-skeleton"></div>'.repeat(4);
      setTimeout(() => renderProducts(PRODUCTS), 400);
    }
  });
});

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  // Small delay for skeleton effect
  setTimeout(() => renderProducts(PRODUCTS), 600);
});
