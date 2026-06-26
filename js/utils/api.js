/**
 * FOGIN MARKETPLACE — API UTILITY
 * js/utils/api.js
 *
 * Thin fetch wrapper for public marketplace endpoints.
 * No auth header — all marketplace endpoints are public.
 */

const isDev     = window.location.hostname === 'localhost'
               || window.location.hostname === '127.0.0.1';
const isStaging = window.location.hostname === 'staging.fogin.ph';

const BASE_URL = isDev
  ? 'http://localhost:3000/api/marketplace'
  : isStaging
    ? 'https://staging-api.fogin.ph/api/marketplace'
    : 'https://api.fogin.ph/api/marketplace';

async function request(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);

  Object.entries(params).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') {
      url.searchParams.set(key, val);
    }
  });

  const res = await fetch(url.toString());
  const json = await res.json();

  if (!res.ok || !json.success) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    throw err;
  }

  return json.data;
}

// ── Categories ─────────────────────────────────────────────────────────────────

export async function fetchCategories() {
  return request('/categories');
}

// ── Products (list) ────────────────────────────────────────────────────────────

export async function fetchProducts({ page = 1, limit = 20, search = null, category_id = null } = {}) {
  return request('/products', { page, limit, search, category_id });
}

// ── Product (detail) ───────────────────────────────────────────────────────────

export async function fetchProductById(id) {
  return request(`/products/${id}`);
}