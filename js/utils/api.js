/**
 * FOGIN MARKETPLACE — API UTILITY
 * js/utils/api.js
 *
 * Thin fetch wrapper for public marketplace endpoints.
 * No auth header — all marketplace endpoints are public.
 */

const hostname = window.location.hostname;

const isLocalDev =
  hostname === 'localhost' ||
  hostname === '127.0.0.1';

const isLanDev =
  hostname.startsWith('192.168.') ||
  hostname.startsWith('10.') ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

const isDev = window.location.protocol === 'http:' && (isLocalDev || isLanDev);

const isStaging = hostname === 'staging.fogin.ph';

const devApiHost = isLocalDev
  ? 'localhost'
  : hostname;

const BASE_URL = isDev
  ? `http://${devApiHost}:3000/api/marketplace`
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

  const res  = await fetch(url.toString());
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

// ── Brands ─────────────────────────────────────────────────────────────────────

export async function fetchBrands({ category_id = null } = {}) {
  return request('/brands', { category_id });
}

// ── Products (list) ────────────────────────────────────────────────────────────

export async function fetchProducts({ page = 1, limit = 20, search = null, category_id = null, brand = null } = {}) {
  return request('/products', { page, limit, search, category_id, brand });
}

// ── Product (detail) ───────────────────────────────────────────────────────────

export async function fetchProductById(id) {
  return request(`/products/${id}`);
}