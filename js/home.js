/* ============================================
   HOME PAGE — JavaScript
   Fogin Vape Marketplace
   ============================================ */

import { fetchProducts } from './utils/api.js';

// ── Notice banner ──────────────────────────────────────────────────────────────

const notice    = document.getElementById('siteNotice');
const dismissBtn = document.getElementById('dismissNotice');
const navbar    = document.querySelector('.navbar');

if (dismissBtn && notice) {
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

// ── Render products ────────────────────────────────────────────────────────────

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `<p style="color:var(--color-text-muted)">No products available yet.</p>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const hasImage = !!p.image_url;
    const price    = formatPrice(p.price_min);

    return `
      <article class="product-card" data-product-id="${p.id}">
        <a href="./shop/product.html?id=${p.id}" class="product-card__link" aria-label="${p.name}">
          <div class="product-card__img-wrap">
            ${hasImage
              ? `<img class="product-card__img" src="${p.image_url}" alt="${p.name}" loading="lazy">`
              : `<div class="product-card__img-placeholder">📦</div>`
            }
            ${p.on_sale ? `
              <div class="product-card__badge-wrap">
                <span class="product-card__badge product-card__badge--sale">Sale</span>
              </div>` : ''}
            <button class="product-card__fav" aria-label="Add to wishlist" data-fav="${p.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
          <div class="product-card__body">
            <div class="product-card__vendor">${p.vendor_name}</div>
            <h3 class="product-card__name">${p.name}</h3>
            <div class="product-card__price-row">
              ${price ? `<span class="product-card__price">${price}</span>` : ''}
            </div>
          </div>
        </a>
        <div class="product-card__footer">
          <button class="product-card__add" data-add-to-cart="${p.id}" ${!p.in_stock ? 'disabled' : ''}>
            ${p.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </article>
    `;
  }).join('');

  bindProductActions();
}

function renderSkeletons() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = Array(4).fill(`<div class="product-skeleton"></div>`).join('');
}

// ── Product actions ────────────────────────────────────────────────────────────

function bindProductActions() {
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = e.currentTarget.dataset.addToCart;
      const cart = JSON.parse(localStorage.getItem('foginCart') || '[]');
      const existing = cart.find(i => i.id === id);
      if (existing) existing.qty++;
      else cart.push({ id, qty: 1 });
      localStorage.setItem('foginCart', JSON.stringify(cart));
      window.dispatchEvent(new Event('fogin:cart-updated'));
      showToast('Added to cart!');
    });
  });

  document.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.toggle('is-active');
      const path = e.currentTarget.querySelector('svg path');
      if (path) {
        const active = e.currentTarget.classList.contains('is-active');
        path.setAttribute('fill', active ? '#ef4444' : 'none');
        path.setAttribute('stroke', active ? '#ef4444' : 'currentColor');
      }
    });
  });
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const existing = document.querySelector('.fogin-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'fogin-toast';
  toast.textContent = message;

  Object.assign(toast.style, {
    position:   'fixed',
    bottom:     '24px',
    right:      '24px',
    background: type === 'success' ? '#C8FF00' : '#ef4444',
    color:      '#1a1a1a',
    padding:    '12px 20px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize:   '14px',
    zIndex:     '9999',
    boxShadow:  '0 8px 24px rgba(0,0,0,0.3)',
  });

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
    btn.classList.add('tab-btn--active');
    // Future: filter by tab category
    loadFeaturedProducts();
  });
});

// ── Cart badge ─────────────────────────────────────────────────────────────────

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart  = JSON.parse(localStorage.getItem('foginCart') || '[]');
  const total = cart.reduce((sum, i) => sum + (i.qty || 0), 0);
  badge.textContent = total;
  badge.classList.toggle('has-items', total > 0);
}

window.addEventListener('fogin:cart-updated', updateCartUI);

// ── Load featured products ─────────────────────────────────────────────────────

async function loadFeaturedProducts() {
  renderSkeletons();
  try {
    const data = await fetchProducts({ page: 1, limit: 4 });
    renderProducts(data.items);
  } catch (err) {
    console.error('[home] Failed to load featured products:', err);
    const grid = document.getElementById('productGrid');
    if (grid) grid.innerHTML = `<p style="color:var(--color-text-muted)">Could not load products.</p>`;
  }
}

// ── Init ───────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  loadFeaturedProducts();
});