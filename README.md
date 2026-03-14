# Fogin Marketplace

**Philippines' multi-vendor vape marketplace** — public-facing storefront built with vanilla HTML, CSS, and JavaScript.

---

## Overview

Fogin is a multi-vendor e-commerce platform for the Philippine vape market. This repo contains the public-facing pages: homepage, product catalog, shopping cart, checkout, and customer account.

The platform connects verified vape vendors with customers across the Philippines, with built-in age verification and legal compliance features.

---

## Pages

| Page | Path | Description |
|---|---|---|
| Homepage | `index.html` | Landing page with featured products |
| Catalog | `shop/catalog.html` | Product listing with filters |
| Product | `shop/product.html` | Single product detail |
| Cart | `shop/cart.html` | Shopping cart |
| Checkout | `shop/checkout.html` | Checkout flow |
| Account | `customer/account.html` | Customer dashboard |
| Login | `auth/login.html` | Sign in |
| Register | `auth/register.html` | Sign up |
| Age Gate | `auth/age-gate.html` | 18+ age verification (DTI compliant) |

---

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — modular via [fogin-shared](https://github.com/roxasalmond/fogin-shared)
- **JavaScript (ES6+)** — vanilla, no frameworks

---

## Project Structure

```
fogin-marketplace/
├── auth/               # Authentication & age gate pages
├── customer/           # Customer account pages
├── shop/               # Product catalog, cart, checkout
├── images/             # Product and UI images
├── assets/             # Icons, fonts, other static assets
├── js/                 # Page-specific JavaScript modules
│   ├── components/     # Navbar, footer
│   ├── pages/          # Page-specific logic
│   ├── shop/           # Cart, catalog, checkout logic
│   ├── customer/       # Account management
│   ├── auth/           # Login, register, age gate
│   └── utils/          # Shared utilities
└── index.html          # Homepage
```

> CSS and core JS are shared via [fogin-shared](https://github.com/roxasalmond/fogin-shared).

---

## Related Repos

| Repo | Description |
|---|---|
| [fogin-shared](https://github.com/roxasalmond/fogin-shared) | Shared CSS and JS (design system, utilities) |
| fogin-dashboard *(private)* | Admin and vendor dashboards |
| fogin-backend *(private)* | Node.js + Express + PostgreSQL API |

---

## Legal Compliance

- Age gate required under Philippine DTI regulations for tobacco/vape products
- Minimum age: 18 years
- Verification stored in localStorage (session-based option available)

---

## Status

🚧 **Frontend complete** — Backend integration in progress.

---

Built for the Philippine vape market 🇵🇭
