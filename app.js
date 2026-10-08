/**
 * THAT'S MY BIRD — INTERACTIVE CLIENT ENGINE
 * Handles:
 * - Centered Header & Mobile Navigation Drawer
 * - Hero & Modal Early Access Waitlist Validation
 * - Live Incremental Waitlist Counter
 * - Interactive Menu Categories Filter & Spice Selector
 * - Pincode Delivery Zone Checker with Synchronized Lead Sync
 * - Refer & Unlock Engine with Robust Multi-Platform Clipboard & WhatsApp Share
 * - FAQ Accordion
 * - Quick Join Modal with Keyboard Accessibility
 * - Global Toast Notification System
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initWaitlistCounter();
  initLeadForms();
  initMenuFilters();
  initSpiceSelector();
  initDeliveryChecker();
  initReferral();
  initFaqAccordion();
  initModal();
});

/* ==========================================================================
   HEADER & MOBILE NAVIGATION
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const closeBtn = document.querySelector('.mobile-close-btn');
  const drawer = document.querySelector('.mobile-menu-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-links a, .mobile-drawer-footer button');

  // Sticky header transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile drawer open
  toggleBtn?.addEventListener('click', () => {
    drawer?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  const closeDrawer = () => {
    drawer?.classList.remove('open');
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // ESC to close drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   LIVE WAITLIST COUNTER
   ========================================================================== */
function initWaitlistCounter() {
  const counterElements = document.querySelectorAll('.live-waitlist-count');
  let currentCount = 1428;

  const updateCounts = () => {
    counterElements.forEach(el => {
      el.textContent = currentCount.toLocaleString();
    });
  };

  updateCounts();

  // Natural organic increment to simulate live incoming signups
  setInterval(() => {
    if (Math.random() > 0.35) {
      currentCount += Math.floor(Math.random() * 2) + 1;
      updateCounts();
    }
  }, 10000);
}

/* ==========================================================================
   LEAD CAPTURE FORMS (Hero & Quick Modal)
   ========================================================================== */
function initLeadForms() {
  const forms = [
    document.getElementById('hero-lead-form'),
    document.getElementById('modal-lead-form')
  ];

  forms.forEach(form => {
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = form.querySelector('input[name="name"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const pincodeInput = form.querySelector('input[name="pincode"]');

      const name = nameInput?.value.trim();
      const phone = phoneInput?.value.trim();
      const pincode = pincodeInput?.value.trim();

      if (!name || !phone) {
        showToast('Please provide your full name and phone number');
        return;
      }

      // Clean phone number
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        showToast('Please provide a valid 10-digit WhatsApp number');
        return;
      }

      // Clean pincode
      const cleanPin = pincode ? pincode.replace(/\D/g, '') : '';

      // Success State UI
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'WELCOME TO THE FLOCK!';
      submitBtn.disabled = true;

      // Increment counters
      const counterElements = document.querySelectorAll('.live-waitlist-count');
      counterElements.forEach(el => {
        const val = parseInt(el.textContent.replace(/,/g, ''), 10) || 1428;
        el.textContent = (val + 1).toLocaleString();
      });

      // Show Toast Notification
      showToast(`Welcome to the flock, ${name}! Your free Panag Fizz voucher is reserved.`);

      // Update personalized referral link
      const safeCode = name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'BIRD';
      const customCode = `${safeCode}-${cleanPhone.slice(-4)}`;
      updateReferralCode(customCode);

      // Auto-validate pincode in delivery checker if provided
      if (cleanPin && cleanPin.length === 6) {
        const deliveryInput = document.getElementById('delivery-pincode-input');
        if (deliveryInput) {
          deliveryInput.value = cleanPin;
          const checkBtn = document.getElementById('check-pincode-btn');
          checkBtn?.click();
        }
      }

      // Reset form after delay
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();

        // Close modal if open
        const modal = document.getElementById('join-modal');
        if (modal?.classList.contains('open')) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }
      }, 3500);
    });
  });
}

/* ==========================================================================
   MENU FILTER TABS
   ========================================================================== */
function initMenuFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const menuCards = document.querySelectorAll('.menu-item-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.category;

      menuCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   SPICE CUSTOMIZER
   ========================================================================== */
function initSpiceSelector() {
  const spiceButtons = document.querySelectorAll('.spice-btn');
  const spiceFeedback = document.getElementById('spice-feedback-text');

  const spiceDescriptions = {
    'mild': 'MILD: Subtle Chettinad coriander & Tellicherry pepper warmth. Friendly acoustic crunch for everyone.',
    'medium': 'MEDIUM: Traditional Chennai street-kitchen kick. Fresh Guntur chilli crunch with aromatic Kalpasi stone flower.',
    'full': 'FULL CHETTINAD: Fiery teardrop spice! Stone-ground red chilli paste, crushed peppercorn, and wild roasted spices.'
  };

  spiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      spiceButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const level = btn.dataset.level;
      if (spiceFeedback && spiceDescriptions[level]) {
        spiceFeedback.textContent = spiceDescriptions[level];
      }
    });
  });
}

/* ==========================================================================
   CHECK DELIVERY (Interactive Pincode Validator)
   ========================================================================== */
function initDeliveryChecker() {
  const checkBtn = document.getElementById('check-pincode-btn');
  const pincodeInput = document.getElementById('delivery-pincode-input');
  const resultContainer = document.getElementById('delivery-result-msg');

  if (!checkBtn || !pincodeInput || !resultContainer) return;

  const performCheck = () => {
    const rawPin = pincodeInput.value.trim();
    const pin = rawPin.replace(/\D/g, '');

    if (!pin || pin.length !== 6) {
      resultContainer.className = 'delivery-result-msg pending';
      resultContainer.innerHTML = 'Please enter a valid 6-digit Indian postal code (e.g. 600028)';
      return;
    }

    if (pin.startsWith('600')) {
      const pinNum = parseInt(pin, 10);
      if (pinNum >= 600001 && pinNum <= 600130) {
        resultContainer.className = 'delivery-result-msg success';
        resultContainer.innerHTML = `<strong>"We're coming to you!"</strong> Pincode <strong>${pin}</strong> is inside our Day-1 hot delivery kitchen zone in Chennai. You'll get your hot fried bird right from batch #01!`;
      } else {
        resultContainer.className = 'delivery-result-msg success';
        resultContainer.innerHTML = `<strong>"We're coming to you!"</strong> Pincode <strong>${pin}</strong> is inside our Greater Chennai launch perimeter. Join the flock to secure launch priority!`;
      }
    } else {
      resultContainer.className = 'delivery-result-msg pending';
      resultContainer.innerHTML = `<strong>"Not yet, but we'll tell you the moment we do."</strong> Zone <strong>${pin}</strong> is currently on our expansion heat map. Drop your WhatsApp in the flock form above to vote for this area!`;
    }
  };

  checkBtn.addEventListener('click', performCheck);
  pincodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performCheck();
  });
}

/* ==========================================================================
   REFER & UNLOCK (Viral Loop with Robust Clipboard Fallback)
   ========================================================================== */
function initReferral() {
  const copyBtn = document.getElementById('copy-ref-btn');
  const whatsappShareBtn = document.getElementById('whatsapp-share-btn');
  const refUrlEl = document.getElementById('referral-url-text');

  copyBtn?.addEventListener('click', () => {
    const textToCopy = refUrlEl?.textContent.trim() || 'https://thatsmybird.in/join?ref=CHETTI-FLOCK';

    // Clipboard API with robust textarea fallback
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        handleCopySuccess(copyBtn);
      }).catch(() => {
        fallbackCopyText(textToCopy, copyBtn);
      });
    } else {
      fallbackCopyText(textToCopy, copyBtn);
    }
  });

  whatsappShareBtn?.addEventListener('click', () => {
    const link = refUrlEl?.textContent.trim() || 'https://thatsmybird.in/join?ref=CHETTI-FLOCK';
    const message = encodeURIComponent(`Check out That's My Bird! They're launching fresh, same-day Chettinad fried chicken in Chennai (never frozen!) + authentic Panag Fizz. Join the flock through my link and we both get free drinks:\n${link}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  });
}

function handleCopySuccess(btn) {
  showToast('Referral link copied to clipboard!');
  const prev = btn.textContent;
  btn.textContent = 'COPIED!';
  setTimeout(() => { btn.textContent = prev; }, 2500);
}

function fallbackCopyText(text, btn) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    handleCopySuccess(btn);
  } catch (err) {
    showToast(`Copy Link: ${text}`);
  }
  document.body.removeChild(textarea);
}

function updateReferralCode(newCode) {
  const refUrlEl = document.getElementById('referral-url-text');
  if (refUrlEl) {
    refUrlEl.textContent = `https://thatsmybird.in/join?ref=${newCode}`;
  }
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(other => other.classList.remove('active'));

      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   QUICK JOIN MODAL
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('join-modal');
  const openButtons = document.querySelectorAll('.trigger-join-modal');
  const closeBtn = document.querySelector('.modal-close-btn');

  const openModal = (e) => {
    e?.preventDefault();
    modal?.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      modal?.querySelector('input[name="name"]')?.focus();
    }, 120);
  };

  const closeModal = () => {
    modal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.classList.add('show');

  if (window._toastTimeout) {
    clearTimeout(window._toastTimeout);
  }

  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
