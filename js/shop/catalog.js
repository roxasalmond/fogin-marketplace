/**
 * CATALOG PAGE
 * js/shop/catalog.js
 */

import { fetchProducts, fetchCategories } from '../utils/api.js';
import { createPagination } from '../../fogin-shared/js/core/pagination.js';

// ── State ──────────────────────────────────────────────────────────────────────

const state = {
  page:        1,
  PAGE_SIZE:   20,
  search:      null,
  category_id: null,
  pagination:  null,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

function priceDisplay(product) {
  const min = parseFloat(product.price_min);
  const max = parseFloat(product.price_max);
  if (isNaN(min)) return '<span class="product-card__price">—</span>';
  if (min === max || isNaN(max)) return `<span class="product-card__price">${formatPrice(min)}</span>`;
  return `<span class="product-card__price">${formatPrice(min)} – ${formatPrice(max)}</span>`;
}

// ── Render ─────────────────────────────────────────────────────────────────────

function renderSkeletons() {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.innerHTML = Array(8).fill(`
    <div class="product-card product-card--skeleton">
      <div class="product-card__img-wrap product-skeleton"></div>
      <div class="product-card__body">
        <div class="product-skeleton" style="height:12px;width:60%;margin-bottom:8px"></div>
        <div class="product-skeleton" style="height:16px;width:80%;margin-bottom:8px"></div>
        <div class="product-skeleton" style="height:12px;width:40%"></div>
      </div>
    </div>
  `).join('');
}

function renderProducts(products) {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div class="catalog-empty">
        <p>No products found. Try adjusting your filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const hasImage = !!p.image_url;
    const inStock  = p.in_stock;

    return `
      <article class="product-card" data-product-id="${p.id}">
        <div class="product-card__img-wrap">
          ${hasImage
            ? `<img class="product-card__img" src="${p.image_url}" alt="${p.name}" loading="lazy">`
            : `<div class="product-card__img-placeholder">📦</div>`
          }
          ${p.on_sale ? `
            <div class="product-card__badge-wrap">
              <span class="product-card__badge product-card__badge--sale">Sale</span>
            </div>` : ''}
          ${!inStock ? `
            <div class="product-card__badge-wrap">
              <span class="product-card__badge product-card__badge--out">Out of Stock</span>
            </div>` : ''}
          <button class="product-card__fav" aria-label="Add to wishlist" data-fav="${p.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="product-card__body">
          <div class="product-card__vendor">${p.vendor_name}</div>
          <a href="product.html?id=${p.id}" class="product-card__name-link">
            <h3 class="product-card__name">${p.name}</h3>
          </a>
          <div class="product-card__price-row">
            ${priceDisplay(p)}
          </div>
        </div>
        <div class="product-card__footer">
          <button
            class="product-card__add"
            data-add-to-cart="${p.id}"
            ${!inStock ? 'disabled' : ''}
          >
            ${inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </article>
    `;
  }).join('');

  bindProductEvents();
}

function renderCategories(categories) {
  const list = document.getElementById('categoryFilters');
  if (!list) return;

  list.innerHTML = `
    <li>
      <button class="sidebar-filter-btn sidebar-filter-btn--active" data-filter-cat="">
        All Products
      </button>
    </li>
    ${categories.map(c => `
      <li>
        <button class="sidebar-filter-btn" data-filter-cat="${c.id}">
          ${c.name}
          <span class="sidebar-filter-count">${c.product_count}</span>
        </button>
      </li>
    `).join('')}
  `;

  // Rebind category filter clicks after render
  bindCategoryFilters();
}

function updateResultCount(total) {
  const el = document.getElementById('resultCount');
  if (el) el.innerHTML = `Showing <strong>${total}</strong> product${total !== 1 ? 's' : ''}`;
}

// ── Data loading ───────────────────────────────────────────────────────────────

async function loadPage(page = 1) {
  state.page = page;
  renderSkeletons();

  try {
    const data = await fetchProducts({
      page,
      limit:       state.PAGE_SIZE,
      search:      state.search,
      category_id: state.category_id,
    });

    renderProducts(data.items);
    updateResultCount(data.meta.total);
    state.pagination?.update(data.meta.total);

  } catch (err) {
    console.error('[catalog] Failed to load products:', err);
    const grid = document.getElementById('catalogGrid');
    if (grid) grid.innerHTML = `<div class="catalog-empty"><p>Failed to load products. Please try again.</p></div>`;
  }
}

async function loadCategories() {
  try {
    const categories = await fetchCategories();
    renderCategories(categories);
  } catch (err) {
    console.error('[catalog] Failed to load categories:', err);
  }
}

// ── Event binding ──────────────────────────────────────────────────────────────

function bindCategoryFilters() {
  document.querySelectorAll('[data-filter-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-cat]').forEach(b => b.classList.remove('sidebar-filter-btn--active'));
      btn.classList.add('sidebar-filter-btn--active');
      state.category_id = btn.dataset.filterCat || null;
      loadPage(1);
    });
  });
}

function bindProductEvents() {
  // Add to cart
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
    });
  });

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      const id = card.dataset.productId;
      window.location.href = `product.html?id=${id}`;
    });
  });

  // Wishlist
  document.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = e.currentTarget.dataset.fav;
      const favs = JSON.parse(localStorage.getItem('foginFavs') || '[]');
      const idx  = favs.indexOf(id);
      if (idx > -1) favs.splice(idx, 1);
      else favs.push(id);
      localStorage.setItem('foginFavs', JSON.stringify(favs));
      e.currentTarget.classList.toggle('is-active', favs.includes(id));
      const path = e.currentTarget.querySelector('svg path');
      if (path) {
        const active = favs.includes(id);
        path.setAttribute('fill', active ? '#ef4444' : 'none');
        path.setAttribute('stroke', active ? '#ef4444' : 'currentColor');
      }
    });
  });
}

function bindSearch() {
  // Read ?q= from URL on load
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) state.search = q;

  // Toolbar search (if added later)
  document.getElementById('catalogSearch')?.addEventListener('input', (e) => {
    state.search = e.target.value.trim() || null;
    loadPage(1);
  });
}

// function bindViewToggle() {
//   const grid = document.getElementById('catalogGrid');
//   document.querySelectorAll('[data-view]').forEach(btn => {
//     btn.addEventListener('click', () => {
//       document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('view-toggle__btn--active'));
//       btn.classList.add('view-toggle__btn--active');
//       grid?.classList.toggle('view-list', btn.dataset.view === 'list');
//     });
//   });
// }

function bindMobileFilterToggle() {
  document.getElementById('filterToggle')?.addEventListener('click', () => {
    document.getElementById('catalogSidebar')?.classList.toggle('catalog-sidebar--open');
  });
}

function bindClearFilters() {
  document.getElementById('clearFilters')?.addEventListener('click', () => {
    state.search      = null;
    state.category_id = null;
    document.querySelectorAll('[data-filter-cat]').forEach(b => b.classList.remove('sidebar-filter-btn--active'));
    document.querySelector('[data-filter-cat=""]')?.classList.add('sidebar-filter-btn--active');
    loadPage(1);
  });
}

// ── Init ───────────────────────────────────────────────────────────────────────

async function initCatalog() {
  bindSearch();
  bindMobileFilterToggle();
  bindClearFilters();

  state.pagination = createPagination({
    containerId: 'paginationContainer',
    pageSize:    state.PAGE_SIZE,
    onPageChange: (page) => {
      loadPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  // Load categories and first page in parallel
  await Promise.all([loadCategories(), loadPage(1)]);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCatalog);
} else {
  initCatalog();
}