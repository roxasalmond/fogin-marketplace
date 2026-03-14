/**
 * FOOTER COMPONENT
 * Injects footer into all pages
 */

export function initFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  placeholder.innerHTML = `
    <div class="footer__container">
      <div class="footer__brand">
        <div class="footer__logo">fogin<span>.ph</span></div>
        <p class="footer__tagline">Philippines' leading vape marketplace.</p>
        <p class="footer__age-notice">🔞 For adults 18 and above only.</p>
      </div>
      <div class="footer__links">
        <div class="footer__col">
          <h4 class="footer__col-title">Shop</h4>
          <a href="#">Pod Systems</a>
          <a href="#">Mods & Kits</a>
          <a href="#">E-Liquids</a>
        </div>
        <div class="footer__col">
          <h4 class="footer__col-title">Vendors</h4>
          <a href="#">Sell on Fogin</a>
          <a href="#">Dashboard</a>
        </div>
        <div class="footer__col">
          <h4 class="footer__col-title">Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Contact</a>
        </div>
        <div class="footer__col">
          <h4 class="footer__col-title">Legal</h4>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <p>© 2025 fogin.ph All rights reserved.</p>
      <p>For adults 18+ only</p>
    </div>
  `;
}