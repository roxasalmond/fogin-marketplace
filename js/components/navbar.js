/* ============================================
   NAVBAR COMPONENT
   js/components/navbar.js
   
   Usage: Add to any page
   
   HTML: <div id="navbar-placeholder"></div>
   JS:   <script type="module" src="../js/components/navbar.js"></script>
   
   For root index.html:
   JS:   <script type="module" src="js/components/navbar.js"></script>
============================================ */

// ─── CONFIG ───────────────────────────────────
// Define nav links and which path segments activate them
const NAV_LINKS = [
  { label: 'Shop',       href: 'shop/catalog.html',  match: ['catalog', 'product'] },
  { label: 'Categories', href: 'shop/catalog.html#categories', match: [] },
  { label: 'Vendors',    href: '#vendors',            match: [] },
  { label: 'Deals',      href: '#',                  match: ['deals'] },
];

// ─── HELPERS ──────────────────────────────────
function getCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('foginCart') || '[]');
    return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  } catch {
    return 0;
  }
}

function getActivePath() {
  return window.location.pathname.toLowerCase();
}

function isActiveLink(match) {
  if (!match.length) return false;
  const path = getActivePath();
  return match.some(segment => path.includes(segment));
}

// ─── RESOLVE PATHS ────────────────────────────
// Figures out the correct relative prefix based on page depth
function getBasePath() {
  const path = window.location.pathname;
  // Count folder depth relative to project root
  // Root (index.html) → no prefix needed
  // One level deep (auth/, shop/, etc.) → ../
  const segments = path.split('/').filter(Boolean);
  
  // If served from file system, last segment is the filename
  // We want to know how many directories deep we are
  const depth = segments.length - 1;
  
  if (depth <= 0) return './';
  return '../'.repeat(depth);
}

// ─── RENDER NAVBAR HTML ───────────────────────
function renderNavbar() {
  const base = getBasePath();
  const cartCount = getCartCount();
  const showBadge = cartCount > 0;

  // Pre-compute both link lists BEFORE the main template literal
  // Nested .map() inside template literals can cause silent rendering failures
  const navLinksHTML = NAV_LINKS.map(link => {
    const isActive = isActiveLink(link.match);
    const href = link.href.startsWith('#') ? link.href : `${base}${link.href}`;
    return `<a href="${href}" class="navbar__link${isActive ? ' navbar__link--active' : ''}">${link.label}</a>`;
  }).join('');

  const mobileLinksHTML = NAV_LINKS.map(link => {
    const isActive = isActiveLink(link.match);
    const href = link.href.startsWith('#') ? link.href : `${base}${link.href}`;
    return `<a href="${href}" class="navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}" role="menuitem">${link.label}</a>`;
  }).join('');

  return `
    <nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar__container">

        <!-- Logo -->
        <a href="${base}index.html" class="navbar__logo" aria-label="Fogin Home">
          <span class="navbar__logo-text">fogin</span>
          <span class="navbar__logo-dot">.ph</span>
        </a>

        <!-- Desktop nav links -->
        <div class="navbar__nav" role="menubar">
          ${navLinksHTML}
        </div>

        <!-- Search -->
        <div class="navbar__search">
          <svg class="navbar__search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
          </svg>
          <input
            type="search"
            class="navbar__search-input"
            id="navbarSearch"
            placeholder="Search products, brands…"
            aria-label="Search products"
            autocomplete="off"
          >
        </div>

        <!-- Desktop actions -->
        <div class="navbar__actions">
          <a href="${base}auth/login.html" class="navbar__action-btn navbar__action-btn--ghost">Log In</a>
          <a href="${base}auth/register.html" class="navbar__action-btn navbar__action-btn--primary">Sign Up</a>

          <!-- Cart -->
          <button class="navbar__cart" id="navbarCartBtn" aria-label="Shopping cart (${cartCount} items)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span class="navbar__cart-badge${showBadge ? ' navbar__cart-badge--visible' : ''}" id="navbarCartBadge">
              ${cartCount}
            </span>
          </button>
        </div>

        <!-- Mobile hamburger -->
        <button
          class="navbar__hamburger"
          id="navbarHamburger"
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="navbarMobile"
        >
          <span class="navbar__hamburger-line"></span>
          <span class="navbar__hamburger-line"></span>
          <span class="navbar__hamburger-line"></span>
        </button>

      </div>

      <!-- Mobile menu -->
      <div class="navbar__mobile" id="navbarMobile" aria-hidden="true">
        <div class="navbar__mobile-search">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
          </svg>
          <input
            type="search"
            class="navbar__search-input"
            placeholder="Search products, brands…"
            aria-label="Search products"
          >
        </div>

        <div class="navbar__mobile-links" role="menu">
          ${mobileLinksHTML}
        </div>

        <div class="navbar__mobile-actions">
          <a href="${base}auth/login.html" class="navbar__mobile-action navbar__mobile-action--ghost">Log In</a>
          <a href="${base}auth/register.html" class="navbar__mobile-action navbar__mobile-action--primary">Sign Up</a>
        </div>
      </div>
    </nav>
  `;
}

// ─── BIND EVENTS ──────────────────────────────
function bindNavbarEvents() {
  const hamburger = document.getElementById('navbarHamburger');
  const mobileMenu = document.getElementById('navbarMobile');
  const navbar = document.getElementById('navbar');

  // Mobile toggle
  hamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.toggle('navbar__mobile--open');
    hamburger.classList.toggle('navbar__hamburger--open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#navbar')) {
      mobileMenu?.classList.remove('navbar__mobile--open');
      hamburger?.classList.remove('navbar__hamburger--open');
      hamburger?.setAttribute('aria-expanded', 'false');
      mobileMenu?.setAttribute('aria-hidden', 'true');
    }
  });

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll('.navbar__mobile-link, .navbar__mobile-action').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('navbar__mobile--open');
      hamburger?.classList.remove('navbar__hamburger--open');
      hamburger?.setAttribute('aria-expanded', 'false');
      mobileMenu?.setAttribute('aria-hidden', 'true');
    });
  });

  // Sticky shadow on scroll
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('navbar--scrolled', window.scrollY > 10);
  }, { passive: true });

  // Search — redirect to catalog with query
  const base = getBasePath();
  document.querySelectorAll('.navbar__search-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.href = `${base}shop/catalog.html?q=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });

  // Cart button
  document.getElementById('navbarCartBtn')?.addEventListener('click', () => {
    window.location.href = `${base}shop/cart.html`;
  });
}

// ─── UPDATE CART BADGE ────────────────────────
// Call this from any page after cart changes
export function updateNavbarCart() {
  const count = getCartCount();
  const badge = document.getElementById('navbarCartBadge');
  const btn = document.getElementById('navbarCartBtn');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('navbar__cart-badge--visible', count > 0);
  }
  if (btn) {
    btn.setAttribute('aria-label', `Shopping cart (${count} items)`);
  }
}

// ─── INJECT ───────────────────────────────────
function injectNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) {
    console.warn('[Navbar] No #navbar-placeholder found on this page.');
    return;
  }
  placeholder.outerHTML = renderNavbar();
  bindNavbarEvents();
}



// Listen for cart updates from other modules
window.addEventListener('fogin:cart-updated', updateNavbarCart);

// ─── INIT ─────────────────────────────────────
// Auto-inject when DOM is ready
export function initNavbar() {
  injectNavbar();
}