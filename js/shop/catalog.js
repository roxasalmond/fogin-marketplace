/**
 * CATALOG PAGE
 * js/pages/catalog.js
 */

import { createPagination } from '../../fogin-shared/js/core/pagination.js';


const MOCK_PRODUCTS = [
  { id: 1, name: 'Vaporesso XROS 3',     vendor: 'VapeHub Manila',   category: 'pod-systems', price: 2499, originalPrice: null, emoji: '🔋', badge: 'New',  rating: 4.8, reviews: 97,  inStock: true },
  { id: 2, name: 'SMOK Nord 5',           vendor: 'VapeHub Manila',   category: 'pod-systems', price: 1899, originalPrice: 2199, emoji: '💨', badge: 'Sale', rating: 4.6, reviews: 54,  inStock: true },
  { id: 3, name: 'Uwell Caliburn G3',     vendor: 'VapeStation PH',   category: 'pod-systems', price: 1599, originalPrice: null, emoji: '🔵', badge: null,   rating: 4.7, reviews: 82,  inStock: true },
  { id: 4, name: 'Voopoo Drag 4',         vendor: 'CloudGuru Cebu',   category: 'mods',        price: 3299, originalPrice: null, emoji: '⚡', badge: null,   rating: 4.5, reviews: 41,  inStock: true },
  { id: 5, name: 'Mango Ice E-Liquid 60ml', vendor: 'PodMaster',      category: 'eliquids',    price: 399,  originalPrice: null, emoji: '🥭', badge: 'New',  rating: 4.9, reviews: 120, inStock: true },
];

function initCatalog() {
  initCatalogFilters();
  initViewToggle();
  initSortSelect();
  initMobileFilterToggle();
  renderProducts(MOCK_PRODUCTS);
  createPagination({
    containerId: "paginationContainer",
    totalItems: 5200,
    itemsPerPage: 20,
    onPageChange: (page) => {
      const from = (page - 1) * 20 + 1;
      const to = Math.min(page * 20, 5200);
      document.getElementById("paginationInfo").textContent =
        `Showing ${from} to ${to} of 5,200 products`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCatalog);
} else {
  initCatalog();
}

function initCatalogFilters() {
  document.querySelectorAll('[data-filter-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-cat]').forEach(b => b.classList.remove('sidebar-filter-btn--active'));
      btn.classList.add('sidebar-filter-btn--active');
    });
  });

  document.querySelectorAll('[data-filter-rating]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-rating]').forEach(b => b.classList.remove('sidebar-filter-btn--active'));
      btn.classList.add('sidebar-filter-btn--active');
    });
  });

  document.getElementById('applyPrice')?.addEventListener('click', () => {
    const min = document.getElementById('priceMin').value;
    const max = document.getElementById('priceMax').value;
    console.log('Price range:', min, max);
  });

  document.getElementById('clearFilters')?.addEventListener('click', () => {
    document.querySelectorAll('[data-filter-cat]').forEach(b => b.classList.remove('sidebar-filter-btn--active'));
    document.querySelector('[data-filter-cat="all"]')?.classList.add('sidebar-filter-btn--active');
    document.querySelectorAll('[data-filter-rating]').forEach(b => b.classList.remove('sidebar-filter-btn--active'));
    document.querySelectorAll('[data-brand]').forEach(cb => cb.checked = false);
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('inStockOnly').checked = false;
    document.getElementById('saleOnly').checked = false;
    document.getElementById('activeFilters').innerHTML = '';
  });
}

function initViewToggle() {
  const grid = document.getElementById('catalogGrid');
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('view-toggle__btn--active'));
      btn.classList.add('view-toggle__btn--active');
      const view = btn.dataset.view;
      grid?.classList.toggle('view-list', view === 'list');
    });
  });
}

function initSortSelect() {
  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    console.log('Sort by:', e.target.value);
  });
}

function initMobileFilterToggle() {
  const toggle  = document.getElementById('filterToggle');
  const sidebar = document.getElementById('catalogSidebar');
  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('catalog-sidebar--open');
  });
}



function renderProducts(products) {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;

  grid.innerHTML = products.map(p => `
    <article class="product-card" data-product-id="${p.id}">
      <div class="product-card__img-wrap">
        <div class="product-card__img-placeholder">${p.emoji}</div>
        ${p.badge ? `
          <div class="product-card__badge-wrap">
            <span class="product-card__badge product-card__badge--${p.badge.toLowerCase()}">${p.badge}</span>
          </div>` : ''}
        ${!p.inStock ? `
          <div class="product-card__badge-wrap">
            <span class="product-card__badge" style="background:#374151;color:#9ca3af;">Out of Stock</span>
          </div>` : ''}
        <button class="product-card__fav" aria-label="Wishlist" data-fav="${p.id}">
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
        <button class="product-card__add" data-add-to-cart="${p.id}" ${!p.inStock ? 'disabled' : ''}>
          ${p.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  `).join('');
}
