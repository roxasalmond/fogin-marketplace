/**
 * ONBOARDING COMPONENT
 * First-time visitor welcome flow
 */

export function showOnboarding() {
  // Check if already completed
  if (localStorage.getItem('onboardingCompleted')) {
    return;
  }
  
  // Inject onboarding HTML
  const onboardingHTML = `
    <div class="onboarding">
      <div class="onboarding__container">
        <!-- Close button -->
        <button class="close-btn onboarding__close" data-onboarding-close>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <!-- Slides -->
        <div class="onboarding__slides">
          <!-- Slide 1: Welcome -->
          <div class="onboarding__slide">
            <div class="onboarding__icon">👋</div>
            <h2 class="onboarding__title">Welcome to Fogin!</h2>
            <p class="onboarding__description">
              The Philippines' premier vape and e-cigarette marketplace. Discover quality products from trusted sellers across the nation.
            </p>
          </div>
          
          <!-- Slide 2: Features -->
          <div class="onboarding__slide">
            <div class="onboarding__icon">✨</div>
            <h2 class="onboarding__title">Why Choose Fogin?</h2>
            <div class="onboarding__features">
              <div class="onboarding__feature">
                <div class="onboarding__feature-icon">🛡️</div>
                <div class="onboarding__feature-text">
                  <div class="onboarding__feature-title">Authentic Products</div>
                  <div class="onboarding__feature-description">100% genuine products from verified sellers</div>
                </div>
              </div>
              
              <div class="onboarding__feature">
                <div class="onboarding__feature-icon">🚚</div>
                <div class="onboarding__feature-text">
                  <div class="onboarding__feature-title">Fast Delivery</div>
                  <div class="onboarding__feature-description">Same-day delivery in Metro Manila</div>
                </div>
              </div>
              
              <div class="onboarding__feature">
                <div class="onboarding__feature-icon">💬</div>
                <div class="onboarding__feature-text">
                  <div class="onboarding__feature-title">Expert Support</div>
                  <div class="onboarding__feature-description">24/7 customer service ready to help</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Slide 3: How it Works -->
          <div class="onboarding__slide">
            <div class="onboarding__icon">🛒</div>
            <h2 class="onboarding__title">Shopping Made Easy</h2>
            <div class="onboarding__features">
              <div class="onboarding__feature">
                <div class="onboarding__feature-icon">1</div>
                <div class="onboarding__feature-text">
                  <div class="onboarding__feature-title">Browse Products</div>
                  <div class="onboarding__feature-description">Explore thousands of vape products</div>
                </div>
              </div>
              
              <div class="onboarding__feature">
                <div class="onboarding__feature-icon">2</div>
                <div class="onboarding__feature-text">
                  <div class="onboarding__feature-title">Add to Cart</div>
                  <div class="onboarding__feature-description">Select your favorite items</div>
                </div>
              </div>
              
              <div class="onboarding__feature">
                <div class="onboarding__feature-icon">3</div>
                <div class="onboarding__feature-text">
                  <div class="onboarding__feature-title">Secure Checkout</div>
                  <div class="onboarding__feature-description">Pay safely and get instant confirmation</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Slide 4: Get Started -->
          <div class="onboarding__slide onboarding__slide--final">
            <div class="onboarding__icon">🚀</div>
            <h2 class="onboarding__title">Ready to Start?</h2>
            <p class="onboarding__description">
              Join thousands of satisfied customers and experience the best vape shopping in the Philippines!
            </p>
          </div>
        </div>
        
        <!-- Indicators -->
        <div class="onboarding__indicators">
          <button class="onboarding__indicator"></button>
          <button class="onboarding__indicator"></button>
          <button class="onboarding__indicator"></button>
          <button class="onboarding__indicator"></button>
        </div>
        
        <!-- Navigation -->
        <div class="onboarding__navigation">
          <button class="btn btn-secondary onboarding__nav-button onboarding__nav-button--prev" data-onboarding-prev>
            Previous
          </button>
          
          <button class="btn btn-tertiary onboarding__nav-button onboarding__nav-button--skip" data-onboarding-skip>
            Skip
          </button>
          
          <button class="btn btn-primary onboarding__nav-button" data-onboarding-next>
            Next
          </button>
          
          <button class="btn btn-primary onboarding__nav-button" data-onboarding-finish style="display: none;">
            Get Started
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Inject into page
  document.body.insertAdjacentHTML('beforeend', onboardingHTML);
  
  // Initialize controls
  initOnboardingControls();
}

function initOnboardingControls() {
  const onboarding = document.querySelector('.onboarding');
  const slides = onboarding.querySelectorAll('.onboarding__slide');
  const indicators = onboarding.querySelectorAll('.onboarding__indicator');
  const prevBtn = onboarding.querySelector('[data-onboarding-prev]');
  const nextBtn = onboarding.querySelector('[data-onboarding-next]');
  const skipBtn = onboarding.querySelector('[data-onboarding-skip]');
  const finishBtn = onboarding.querySelector('[data-onboarding-finish]');
  const closeBtn = onboarding.querySelector('[data-onboarding-close]');
  
  let currentSlide = 0;
  
  function updateSlide() {
    // Update slides
    slides.forEach((slide, index) => {
      slide.style.display = index === currentSlide ? 'block' : 'none';
    });
    
    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('onboarding__indicator--active', index === currentSlide);
    });
    
    // Update buttons
    prevBtn.style.display = currentSlide === 0 ? 'none' : 'block';
    nextBtn.style.display = currentSlide === slides.length - 1 ? 'none' : 'block';
    finishBtn.style.display = currentSlide === slides.length - 1 ? 'block' : 'none';
    skipBtn.style.display = currentSlide === slides.length - 1 ? 'none' : 'block';
  }
  
  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, slides.length - 1));
    updateSlide();
  }
  
  function complete() {
    localStorage.setItem('onboardingCompleted', 'true');
    onboarding.remove();
    window.location.href = '../index.html'; // Redirect to homepage
  }
  
  // Event listeners
  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  skipBtn.addEventListener('click', complete);
  finishBtn.addEventListener('click', complete);
  closeBtn.addEventListener('click', complete);
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
  });
  
  // Initialize
  updateSlide();
}

export function resetOnboarding() {
  localStorage.removeItem('onboardingCompleted');
}