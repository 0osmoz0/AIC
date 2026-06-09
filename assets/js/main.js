/* ═══════════════════════════════════════════════════════════
   PASSERELLES — JavaScript principal
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────── Navbar scroll ──────────────── */
(function initNavbar() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ──────────────── Hamburger menu ──────────────── */
(function initHamburger() {
  const toggle  = document.getElementById('navToggle');
  const menu    = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  const open  = () => {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer le menu');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? close() : open();
  });

  // Close on nav link click
  menu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) close();
  });
})();

/* ──────────────── Scroll-triggered animations ──────────────── */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ──────────────── Animated counters ──────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.count-num[data-target]');
  if (!counters.length) return;

  const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const value    = Math.round(eased * target);

      el.textContent = value.toLocaleString('fr-FR');

      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('fr-FR');
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ──────────────── Testimonials carousel ──────────────── */
(function initTestimonials() {
  const track  = document.getElementById('testimonialsTrack');
  const prev   = document.getElementById('testiPrev');
  const next   = document.getElementById('testiNext');
  const dotsEl = document.getElementById('testiDots');
  if (!track || !prev || !next || !dotsEl) return;

  const cards = Array.from(track.querySelectorAll('.testi-card'));
  const dots  = Array.from(dotsEl.querySelectorAll('.testi-dot'));
  const total = cards.length;
  let current = 0;
  let autoTimer;

  const isMobile = () => window.innerWidth <= 1024;

  const showCard = (index) => {
    if (!isMobile()) return; // on desktop all cards are visible

    cards.forEach((c, i) => {
      c.style.display = i === index ? 'flex' : 'none';
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
      d.setAttribute('aria-selected', String(i === index));
    });
    current = index;
  };

  const goTo = (i) => {
    current = ((i % total) + total) % total;
    showCard(current);
  };

  const startAuto = () => {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  };
  const stopAuto = () => clearInterval(autoTimer);

  prev.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  next.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  dots.forEach((d, i) => {
    d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });

  const reset = () => {
    if (isMobile()) {
      showCard(current);
      startAuto();
    } else {
      cards.forEach(c => { c.style.display = ''; });
      stopAuto();
    }
  };

  window.addEventListener('resize', reset);
  reset();
})();

/* ──────────────── Donation amount selector ──────────────── */
(function initDonation() {
  const btns   = document.querySelectorAll('.don-btn');
  const infoEl = document.getElementById('donInfo');
  if (!btns.length || !infoEl) return;

  const formatAmount = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const amount = parseFloat(btn.dataset.amount);
      if (!isNaN(amount)) {
        const afterTax = formatAmount(amount * 0.34);
        infoEl.innerHTML = `Soit seulement <strong>${afterTax}&nbsp;€</strong> après déduction fiscale de 66%`;
      } else {
        infoEl.innerHTML = `Entrez le montant de votre choix et bénéficiez de la déduction fiscale de 66%`;
      }
    });
  });
})();

/* ──────────────── Back to top ──────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ──────────────── Active nav link on scroll ──────────────── */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__link');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(l => {
          const active = l.getAttribute('href') === `#${id}`;
          l.style.fontWeight = active ? '700' : '';
          l.style.color = active ? '' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ──────────────── Contact form (UI feedback) ──────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('[type=submit]');

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const original = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="animation:spin .8s linear infinite" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-dasharray="30" stroke-dashoffset="10"/>
      </svg>
      Envoi en cours…
    `;
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Message envoyé !
      `;
      submitBtn.style.background = 'var(--c-teal)';

      setTimeout(() => {
        submitBtn.innerHTML = original;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        form.reset();
      }, 3500);
    }, 1800);
  });

  // Inline validation on blur
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach(field => {
    field.addEventListener('blur', () => {
      if (!field.checkValidity()) {
        field.style.borderColor = 'var(--c-rose)';
      } else {
        field.style.borderColor = 'var(--c-teal)';
      }
    });
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
})();

/* ──────────────── Newsletter form ──────────────── */
(function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input  = form.querySelector('input[type=email]');
    const btn    = form.querySelector('button');
    if (!input.value || !input.checkValidity()) { input.focus(); return; }

    const orig = btn.textContent;
    btn.textContent = '✓ Inscrit !';
    btn.style.background = 'var(--c-teal)';

    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      input.value = '';
    }, 3000);
  });
})();

/* ──────────────── Smooth scroll for anchor links ──────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('header')?.offsetHeight ?? 80;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();

/* ──────────────── CSS keyframe for spin (form loading) ──────────────── */
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);
