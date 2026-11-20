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
   GOOGLE SHEETS WEB APP ENDPOINT CONFIGURATION
   ==========================================================================
   To connect your Google Sheet:
   1. Follow instructions in google-sheets-script.js
   2. Replace the URL below with your deployed Web App URL
   ========================================================================== */
const GOOGLE_SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwwasyp5SUcWDOx7mKKI7BS4Dy_z2SiZKhBgexxNCffj2dRh0j80PvOZd_Cjz2Z0L1X/exec';

/* ==========================================================================
   LEAD CAPTURE FORMS (Hero & Quick Modal with CAPTCHA & Google Sheets)
   ========================================================================== */
function initLeadForms() {
  const forms = [
    document.getElementById('hero-lead-form'),
    document.getElementById('modal-lead-form')
  ];

  // Helper to generate dynamic anti-spam math challenge
  function refreshCaptcha(form) {
    const challengeEl = form.querySelector('.hero-captcha-challenge, .modal-captcha-challenge');
    const inputEl = form.querySelector('.captcha-input');
    
    // Generate two random digits with sum between 5 and 18
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    const expected = a + b;
    form.dataset.expectedCaptcha = String(expected);

    if (challengeEl) {
      challengeEl.textContent = `${a} + ${b} =`;
    }
    if (inputEl) {
      inputEl.value = '';
      inputEl.classList.remove('error');
    }
  }

  forms.forEach(form => {
    if (!form) return;

    // Initialize CAPTCHA challenge
    refreshCaptcha(form);

    // Refresh button event listener
    const refreshBtn = form.querySelector('.captcha-refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      refreshCaptcha(form);
      form.querySelector('.captcha-input')?.focus();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // 1. Honeypot Bot Trap Check: Silent drop if automated spam script filled hidden field
      const honeypotVal = form.querySelector('input[name="_b_hp_check"]')?.value;
      if (honeypotVal) {
        console.warn('Spam bot trap triggered.');
        showToast('Welcome to the flock!');
        form.reset();
        refreshCaptcha(form);
        return;
      }
      
      const nameInput = form.querySelector('input[name="name"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const pincodeInput = form.querySelector('input[name="pincode"]');
      const captchaInput = form.querySelector('.captcha-input');

      const name = nameInput?.value.trim();
      const phone = phoneInput?.value.trim();
      const pincode = pincodeInput?.value.trim();
      const userCaptcha = parseInt(captchaInput?.value.trim(), 10);
      const expectedCaptcha = parseInt(form.dataset.expectedCaptcha, 10);

      // 2. Standard field validation
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

      // 3. CAPTCHA Math Verification Check
      if (isNaN(userCaptcha) || userCaptcha !== expectedCaptcha) {
        captchaInput?.classList.add('error');
        captchaInput?.focus();
        showToast('Security check failed: Please solve the math check (e.g. 4 + 3 = 7)');
        refreshCaptcha(form);
        return;
      }

      captchaInput?.classList.remove('error');

      // Clean pincode
      const cleanPin = pincode ? pincode.replace(/\D/g, '') : '';

      // Compute Unique VIP Pass Code
      const safeCode = name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'BIRD';
      const customCode = `${safeCode}-${cleanPhone.slice(-4)}`;
      const passCode = `TMB-${customCode}`;

      // 4. One Pass Per Customer Check: Verify if number already claimed on this device
      try {
        const existingLeads = JSON.parse(localStorage.getItem('tmb_flock_leads') || '[]');
        const alreadyClaimed = existingLeads.find(l => l.phone === cleanPhone);
        if (alreadyClaimed) {
          showToast(`VIP Pass already claimed for +91 ${cleanPhone}! Showing your pass.`);
          displayVipPassModal({
            name: alreadyClaimed.name,
            phone: alreadyClaimed.phone,
            pincode: alreadyClaimed.pincode,
            code: alreadyClaimed.code || customCode,
            rank: alreadyClaimed.rank || 1525
          });
          form.reset();
          refreshCaptcha(form);
          return;
        }
      } catch (e) {
        // Continue if localStorage is restricted
      }

      // Button Loading UI
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'LOCKING IN...';
      submitBtn.disabled = true;

      const sourceName = form.id === 'hero-lead-form' ? 'Hero Lead Card' : 'Modal VIP Pass';
      const deviceType = window.innerWidth <= 768 ? 'Mobile Safari/Chrome' : 'Desktop';

      // 5. Send Lead Data to Google Sheets Web App (with duplicate prevention)
      if (GOOGLE_SHEETS_WEBAPP_URL && !GOOGLE_SHEETS_WEBAPP_URL.includes('YOUR_SCRIPT_ID')) {
        const payload = new URLSearchParams();
        payload.append('name', name);
        payload.append('phone', cleanPhone);
        payload.append('pincode', cleanPin);
        payload.append('source', sourceName);
        payload.append('captcha_status', 'Verified Human');
        payload.append('device', deviceType);
        payload.append('pass_code', passCode);

        fetch(GOOGLE_SHEETS_WEBAPP_URL, {
          method: 'POST',
          mode: 'no-cors', // Standard for Google Apps Script Web Apps
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload.toString()
        }).catch(err => {
          console.warn('Google Sheets network sync note:', err);
        });
      } else {
        console.info('Google Sheets sync pending: Web App URL has not been set yet. Lead safely saved to localStorage.');
      }

      // 6. Increment live counters
      let nextRank = 1525;
      const counterElements = document.querySelectorAll('.live-waitlist-count');
      counterElements.forEach(el => {
        const val = parseInt(el.textContent.replace(/,/g, ''), 10) || 1428;
        nextRank = val + 1;
        el.textContent = nextRank.toLocaleString();
      });

      // 7. Always persist to localStorage backup so leads are NEVER lost
      try {
        const backupLeads = JSON.parse(localStorage.getItem('tmb_flock_leads') || '[]');
        backupLeads.push({
          timestamp: new Date().toISOString(),
          name,
          phone: cleanPhone,
          pincode: cleanPin,
          code: customCode,
          passCode: passCode,
          source: sourceName,
          device: deviceType,
          rank: nextRank,
          status: 'Verified Human'
        });
        localStorage.setItem('tmb_flock_leads', JSON.stringify(backupLeads));
      } catch (err) {
        // Fallback for private browsing
      }

      // Success State UI
      submitBtn.innerHTML = 'WELCOME TO THE FLOCK! ✓';

      // Update personalized referral link
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

      // Show Toast Notification
      showToast(`Welcome to the flock, ${name}! Your VIP Pass is ready.`);

      // Open Instant Digital VIP Pass Modal
      setTimeout(() => {
        displayVipPassModal({
          name,
          phone: cleanPhone,
          pincode: cleanPin,
          code: customCode,
          rank: nextRank
        });
      }, 500);

      // Reset form after delay
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();
        refreshCaptcha(form);
      }, 2500);
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
      resultContainer.innerHTML = '<span class="delivery-result-headline">PLEASE ENTER A 6-DIGIT PINCODE</span><span class="delivery-result-detail">Enter your 6-digit Indian postal code (e.g. 600028) to check delivery coverage.</span>';
      return;
    }

    if (pin.startsWith('600')) {
      const pinNum = parseInt(pin, 10);
      if (pinNum >= 600001 && pinNum <= 600130) {
        resultContainer.className = 'delivery-result-msg success';
        resultContainer.innerHTML = `<span class="delivery-result-headline">"WE'RE COMING TO YOU!"</span><span class="delivery-result-detail">Pincode <strong>${pin}</strong> is inside our Day-1 hot delivery kitchen zone in Chennai. You'll get your hot fried bird right from batch #01!</span>`;
      } else {
        resultContainer.className = 'delivery-result-msg success';
        resultContainer.innerHTML = `<span class="delivery-result-headline">"WE'RE COMING TO YOU!"</span><span class="delivery-result-detail">Pincode <strong>${pin}</strong> is inside our Greater Chennai launch perimeter. Join the flock to secure launch priority!</span>`;
      }
    } else {
      resultContainer.className = 'delivery-result-msg pending';
      resultContainer.innerHTML = `<span class="delivery-result-headline">"NOT YET, BUT WE'LL TELL YOU THE MOMENT WE DO."</span><span class="delivery-result-detail">Zone <strong>${pin}</strong> is currently on our expansion heat map. Drop your WhatsApp in the flock form above to vote for this area!</span>`;
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

  // VIP Pass Modal Handlers
  const vipModal = document.getElementById('vip-pass-modal');
  const vipCloseBtn = document.querySelector('.vip-pass-close-btn');
  const vipDismissBtn = document.getElementById('vip-dismiss-btn');
  const vipCopyBtn = document.getElementById('vip-copy-btn');

  const closeVipModal = () => {
    vipModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  vipCloseBtn?.addEventListener('click', closeVipModal);
  vipDismissBtn?.addEventListener('click', closeVipModal);

  vipModal?.addEventListener('click', (e) => {
    if (e.target === vipModal) {
      closeVipModal();
    }
  });

  vipCopyBtn?.addEventListener('click', () => {
    const code = document.getElementById('vip-card-code')?.textContent || '';
    if (code && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        vipCopyBtn.textContent = 'COPIED! ✓';
        setTimeout(() => {
          vipCopyBtn.textContent = 'COPY';
        }, 2000);
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal?.classList.contains('open')) closeModal();
      if (vipModal?.classList.contains('open')) closeVipModal();
    }
  });
}

/* ==========================================================================
   DISPLAY VIP PASS MODAL (Digital Founding Flock Pass)
   ========================================================================== */
function displayVipPassModal({ name, phone, pincode, code, rank }) {
  const modal = document.getElementById('vip-pass-modal');
  if (!modal) return;

  const cardName = document.getElementById('vip-card-name');
  const cardPhone = document.getElementById('vip-card-phone');
  const cardPincode = document.getElementById('vip-card-pincode');
  const cardRank = document.getElementById('vip-card-rank');
  const cardCode = document.getElementById('vip-card-code');
  const shareBtn = document.getElementById('vip-share-whatsapp-btn');

  if (cardName) cardName.textContent = name;
  if (cardPhone) cardPhone.textContent = phone ? `+91 ${phone}` : '+91 Verified';
  if (cardPincode) cardPincode.textContent = pincode || 'Chennai Central';
  if (cardRank) cardRank.textContent = `#${(rank || 1525).toLocaleString()} in Flock`;
  if (cardCode) cardCode.textContent = `TMB-${code}`;

  if (shareBtn) {
    const text = `Hey! I just locked in my Founding Flock VIP Pass (#TMB-${code}) for That's My Bird Chennai. Free Panag Fizz reserved! Lock in yours here: https://thatsmybird.in`;
    shareBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }

  // Close join modal if open
  const joinModal = document.getElementById('join-modal');
  if (joinModal?.classList.contains('open')) {
    joinModal.classList.remove('open');
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
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
