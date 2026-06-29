/* ============================================
   HOME PAGE — JavaScript
   Fogin Vape Marketplace
   ============================================ */

import { fetchProducts } from './utils/api.js';
import { showToast } from '../../fogin-shared/js/core/components/toast.js';
import { updateNavbarCart } from './components/navbar.js';
import { esc } from '../../fogin-shared/js/core/sanitize.js';

// ── Notice banner ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const notice     = document.getElementById('site-notice');
  const dismissBtn = document.getElementById('dismiss-notice');
  const navbar     = document.querySelector('.navbar');

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

  loadFeaturedProducts();
});

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

// ── Render products ────────────────────────────────────────────────────────────

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `<p class="text-muted">No products available yet.</p>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const hasImage = !!p.image_url;
    const price    = formatPrice(p.price_min);

    return `
      <article class="product-card" data-product-id="${esc(p.id)}">
        <a href="./shop/product.html?id=${esc(p.id)}" class="product-card__link" aria-label="${esc(p.name)}">
          <div class="product-card__img-wrap">
            ${hasImage
              ? `<img class="product-card__img" src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">`
              : `<div class="product-card__img-placeholder">📦</div>`
            }
            ${p.on_sale ? `
              <div class="product-card__badge-wrap">
                <span class="product-card__badge product-card__badge--sale">Sale</span>
              </div>` : ''}
            <button class="product-card__fav" aria-label="Add to wishlist" data-fav="${esc(p.id)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
          <div class="product-card__body">
            <div class="product-card__vendor">${esc(p.vendor_name)}</div>
            <h3 class="product-card__name">${esc(p.name)}</h3>
            <div class="product-card__price-row">
              ${price ? `<span class="product-card__price">${price}</span>` : ''}
            </div>
          </div>
        </a>
        <div class="product-card__footer">
          <button class="product-card__add" data-add-to-cart="${esc(p.id)}" ${!p.in_stock ? 'disabled' : ''}>
            ${p.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </article>
    `;
  }).join('');

  bindProductActions();
}

function renderSkeletons() {
  const grid = document.getElementById('product-grid');
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

// ── Tabs ───────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
    btn.classList.add('tab-btn--active');
    loadFeaturedProducts();
  });
});

// ── Cart badge ─────────────────────────────────────────────────────────────────

window.addEventListener('fogin:cart-updated', updateNavbarCart);

// ── Load featured products ─────────────────────────────────────────────────────

async function loadFeaturedProducts() {
  renderSkeletons();
  try {
    const data = await fetchProducts({ page: 1, limit: 4 });
    renderProducts(data.items);
  } catch (err) {
    console.error('[home] Failed to load featured products:', err);
    const grid = document.getElementById('product-grid');
    if (grid) grid.innerHTML = `<p class="text-muted">Could not load products.</p>`;
  }
}

// ── Init ───────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedProducts();
});