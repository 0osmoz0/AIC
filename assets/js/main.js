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

/* ═══════════════════════════════════════════════════════════
   INTERNATIONALISATION — i18n (FR / EN / AR / TR / ZH / ES)
   ═══════════════════════════════════════════════════════════ */

const translations = {
  fr: {
    nav: { mission:'Notre mission', actions:'Nos actions', how:'Comment ça marche', testimonials:'Témoignages', events:'Événements', contact:'Contact', join:'Nous rejoindre' },
    hero: {
      badge:"Association loi 1901 reconnue d'utilité publique",
      title:'Là où les cultures<br><em>se rencontrent,</em><br>les liens se créent',
      subtitle:"Nous accompagnons les personnes issues de cultures différentes dans leur parcours d'intégration en France — avec bienveillance, expertise et engagement.",
      cta1:'Découvrir nos actions', cta2:'Prendre contact',
      dropdown_title:'Langues disponibles avec nos bénévoles', dropdown_cta:'Nous contacter →'
    },
    stats: { people:'Personnes accompagnées', nationalities:'Nationalités représentées', volunteers:'Bénévoles engagés', years:'Créée en' },
    mission: {
      eyebrow:'Notre mission', titlePlain:'Bâtir des ponts', titleGradient:'entre les cultures',
      p1:"AIC est née d'un constat simple\u00a0: l'intégration ne se décrète pas, elle se construit. Ensemble. Depuis 2026, nous accompagnons des personnes dans leur parcours, avec une approche humaine et sur mesure.",
      p2:"Notre démarche repose sur trois piliers fondamentaux\u00a0: le <strong>respect</strong> des identités de chacun, la <strong>solidarité</strong> comme moteur du changement, et l'<strong>engagement</strong> pour une France véritablement inclusive.",
      cta:'Voir nos actions concrètes', chip1:'Respect', chip2:'Solidarité', chip3:'Engagement', chip4:'Inclusion'
    },
    services: { eyebrow:'Nos actions', titlePlain:'Un accompagnement', titleGradient:'complet et humain', desc:"De l'apprentissage de la langue à l'insertion professionnelle, nous vous accompagnons à chaque étape de votre parcours." },
    svc: {
      s1title:'Cours de français',         s1desc:"Ateliers FLE pour tous les niveaux — du débutant à l'avancé — adaptés à vos horaires et à vos besoins spécifiques.",
      s2title:'Aide administrative',        s2desc:"Accompagnement dans vos démarches\u00a0: titre de séjour, CAF, Pôle Emploi, accès aux droits fondamentaux.",
      s3title:'Ateliers interculturels',    s3desc:"Rencontres et ateliers pour valoriser vos cultures d'origine et tisser des liens durables avec la société française.",
      s4title:'Insertion professionnelle',  s4desc:"Aide à la rédaction de CV, préparation aux entretiens et mise en réseau avec des employeurs partenaires engagés.",
      s5title:'Accès au logement',          s5desc:"Orientation vers les structures d'hébergement, aide à la recherche de logement et accès aux dispositifs HLM.",
      s6title:'Soutien psychosocial',       s6desc:"Accompagnement psychologique individuel et en groupe, gestion du stress lié à l'exil et à l'adaptation culturelle."
    },
    steps: {
      eyebrow:'Comment ça marche', titlePlain:'Votre parcours', titleGradient:'en 4 étapes', desc:'Un accompagnement simple, transparent et adapté à chaque situation.',
      s1title:'Premier contact',         s1desc:"Contactez-nous par téléphone, email ou présentez-vous directement. Aucun rendez-vous nécessaire — nous sommes là.",
      s2title:'Entretien personnalisé',   s2desc:"Un conseiller vous reçoit en entretien confidentiel pour comprendre votre situation unique et définir vos besoins.",
      s3title:"Plan d'accompagnement",   s3desc:"Un parcours sur mesure est élaboré avec vous\u00a0: services, ateliers et suivi régulier adaptés à votre situation.",
      s4title:'Suivi & intégration',     s4desc:"Nous vous accompagnons tout au long de votre parcours avec des bilans réguliers, jusqu'à votre pleine autonomie."
    },
    testi:  { eyebrow:'Témoignages', titlePlain:'Ils ont franchi', titleGradient:'la passerelle', desc:'Leurs mots sont notre plus belle récompense.' },
    events: { eyebrow:'Agenda', titlePlain:'Prochains', titleGradient:'événements' },
    join: {
      vol_eyebrow:'Bénévolat', vol_title:'Devenez bénévole',
      vol_desc:"Partagez vos compétences et votre temps pour accompagner des personnes dans leur parcours. Chaque heure compte et chaque sourire aussi.",
      vol_li1:'Cours de français & alphabétisation', vol_li2:'Aide administrative et juridique', vol_li3:"Animation d'ateliers culturels", vol_li4:'Communication & digital',
      vol_cta:"Je veux m'engager",
      don_eyebrow:'Soutien financier', don_title:'Faites un don',
      don_desc:"Vos dons sont défiscalisés à 66%. Chaque euro contribue directement à nos programmes d'accompagnement sur le terrain.",
      don_cta:'Faire un don maintenant'
    },
    contact: {
      eyebrow:'Nous contacter', titlePlain:'Parlons', titleGradient:'de votre projet',
      desc:"Que vous souhaitiez bénéficier de nos services, rejoindre notre équipe ou nous soutenir, nous sommes là pour vous répondre.",
      f_nom:'Nom complet', f_email:'Adresse email', f_sujet:'Objet de votre message', f_message:'Votre message',
      f_nom_ph:'Votre nom et prénom', f_email_ph:'votre@email.fr', f_message_ph:'Décrivez votre situation ou votre demande...',
      f_sujet_opt0:'— Sélectionnez un sujet —', f_sujet_opt1:"Je cherche de l'aide pour mon intégration", f_sujet_opt2:'Je souhaite devenir bénévole',
      f_sujet_opt3:'Je souhaite faire un don', f_sujet_opt4:'Proposition de partenariat', f_sujet_opt5:'Demande presse / médias', f_sujet_opt6:'Autre demande',
      f_rgpd:"J'accepte que mes données soient traitées conformément à la <a href='#'>politique de confidentialité</a> afin de répondre à ma demande.",
      f_submit:'Envoyer le message', f_note:'Nous vous répondons sous 48h ouvrées'
    },
    footer: {
      desc:"Association loi 1901 reconnue d'utilité publique. Depuis 2026, nous construisons des ponts entre les cultures pour une France plus inclusive et solidaire.",
      col1:'L\'association', col2:'Nos actions', col3:'Nous rejoindre',
      nl_title:'Newsletter', nl_desc:'Restez informé de nos actualités et prochains événements.', nl_ph:'votre@email.fr', nl_btn:"S'abonner",
      copy:'© 2026 AIC — Association loi 1901 | SIRET 123 456 789 00010'
    }
  },

  en: {
    nav: { mission:'Our mission', actions:'Our programs', how:'How it works', testimonials:'Testimonials', events:'Events', contact:'Contact', join:'Join us' },
    hero: {
      badge:'Recognized public benefit nonprofit',
      title:'Where cultures<br><em>meet,</em><br>bonds are created',
      subtitle:'We support people from different cultural backgrounds in their integration journey in France — with compassion, expertise and commitment.',
      cta1:'Discover our programs', cta2:'Get in touch',
      dropdown_title:'Languages supported by our volunteers', dropdown_cta:'Contact us →'
    },
    stats: { people:'People supported', nationalities:'Nationalities represented', volunteers:'Committed volunteers', years:'Founded in' },
    mission: {
      eyebrow:'Our mission', titlePlain:'Building bridges', titleGradient:'between cultures',
      p1:'AIC was born from a simple observation: integration cannot be decreed, it must be built. Together. Since 2026, we have accompanied people on their journey with a human and personalized approach.',
      p2:'Our approach rests on three fundamental pillars: <strong>respect</strong> for each person\'s identity, <strong>solidarity</strong> as the engine of change, and <strong>commitment</strong> to a truly inclusive France.',
      cta:'See our concrete actions', chip1:'Respect', chip2:'Solidarity', chip3:'Commitment', chip4:'Inclusion'
    },
    services: { eyebrow:'Our programs', titlePlain:'Comprehensive and', titleGradient:'human support', desc:'From language learning to professional integration, we support you at every step of your journey.' },
    svc: {
      s1title:'French language courses',   s1desc:'FLE workshops for all levels — beginner to advanced — adapted to your schedule and specific needs.',
      s2title:'Administrative assistance', s2desc:'Support with your procedures: residence permit, CAF, France Travail, access to fundamental rights.',
      s3title:'Intercultural workshops',   s3desc:'Meetings and workshops to celebrate your cultures of origin and build lasting ties with French society.',
      s4title:'Professional integration',  s4desc:'Help with CV writing, interview preparation and networking with committed partner employers.',
      s5title:'Access to housing',         s5desc:'Guidance to housing structures, help finding accommodation and access to social housing.',
      s6title:'Psychosocial support',      s6desc:'Individual and group psychological support, stress management related to exile and cultural adaptation.'
    },
    steps: {
      eyebrow:'How it works', titlePlain:'Your journey', titleGradient:'in 4 steps', desc:'Simple, transparent support adapted to every situation.',
      s1title:'First contact',       s1desc:'Reach us by phone, email or walk in directly. No appointment needed — we are here for you.',
      s2title:'Personal interview',  s2desc:'A counselor meets you in a confidential interview to understand your unique situation and define your needs.',
      s3title:'Support plan',        s3desc:'A tailored pathway is built with you: services, workshops and regular follow-ups adapted to your situation.',
      s4title:'Follow-up & integration', s4desc:'We support you throughout your journey with regular check-ins, until you reach full autonomy.'
    },
    testi:  { eyebrow:'Testimonials', titlePlain:'They crossed', titleGradient:'the bridge', desc:'Their words are our greatest reward.' },
    events: { eyebrow:'Calendar', titlePlain:'Upcoming', titleGradient:'events' },
    join: {
      vol_eyebrow:'Volunteering', vol_title:'Become a volunteer',
      vol_desc:'Share your skills and time to support people on their journey. Every hour counts and every smile matters.',
      vol_li1:'French classes & literacy', vol_li2:'Administrative and legal assistance', vol_li3:'Cultural workshop facilitation', vol_li4:'Communication & digital',
      vol_cta:'I want to get involved',
      don_eyebrow:'Financial support', don_title:'Make a donation',
      don_desc:'Your donations are 66% tax deductible. Every euro directly supports our on-the-ground support programs.',
      don_cta:'Donate now'
    },
    contact: {
      eyebrow:'Contact us', titlePlain:"Let's talk about", titleGradient:'your project',
      desc:'Whether you want to benefit from our services, join our team or support us, we are here to answer you.',
      f_nom:'Full name', f_email:'Email address', f_sujet:'Subject', f_message:'Your message',
      f_nom_ph:'Your first and last name', f_email_ph:'your@email.com', f_message_ph:'Describe your situation or request...',
      f_sujet_opt0:'— Select a subject —', f_sujet_opt1:'I need help with my integration', f_sujet_opt2:'I want to volunteer',
      f_sujet_opt3:'I want to make a donation', f_sujet_opt4:'Partnership proposal', f_sujet_opt5:'Press / media inquiry', f_sujet_opt6:'Other request',
      f_rgpd:"I agree that my data will be processed in accordance with the <a href='#'>privacy policy</a> to respond to my request.",
      f_submit:'Send message', f_note:'We reply within 48 business hours'
    },
    footer: {
      desc:'Recognized public benefit nonprofit. Since 2026, we build bridges between cultures for a more inclusive and supportive France.',
      col1:'The association', col2:'Our programs', col3:'Get involved',
      nl_title:'Newsletter', nl_desc:'Stay informed about our news and upcoming events.', nl_ph:'your@email.com', nl_btn:'Subscribe',
      copy:'© 2026 AIC — Nonprofit organization | SIRET 123 456 789 00010'
    }
  },

  ar: {
    nav: { mission:'مهمتنا', actions:'برامجنا', how:'كيف يعمل', testimonials:'شهادات', events:'فعاليات', contact:'تواصل', join:'انضم إلينا' },
    hero: {
      badge:'جمعية معترف بها ذات منفعة عامة',
      title:'حيث تلتقي الثقافات<br><em>تتشكّل الروابط</em><br>وتزدهر الحياة',
      subtitle:'نرافق الأشخاص القادمين من ثقافات مختلفة في مسار اندماجهم في فرنسا — بتعاطف وخبرة والتزام.',
      cta1:'اكتشف برامجنا', cta2:'تواصل معنا',
      dropdown_title:'اللغات المتاحة مع متطوعينا', dropdown_cta:'تواصل معنا ←'
    },
    stats: { people:'شخص مرافق', nationalities:'جنسية ممثلة', volunteers:'متطوع ملتزم', years:'تأسست في' },
    mission: {
      eyebrow:'مهمتنا', titlePlain:'بناء الجسور', titleGradient:'بين الثقافات',
      p1:'وُلدت AIC من ملاحظة بسيطة: الاندماج لا يُفرض، بل يُبنى. معاً. منذ عام 2026، نرافق الأشخاص في مسارهم بنهج إنساني ومخصص.',
      p2:'تقوم مقاربتنا على ثلاثة ركائز أساسية: <strong>احترام</strong> هوية كل شخص، و<strong>التضامن</strong> كمحرك للتغيير، و<strong>الالتزام</strong> من أجل فرنسا شاملة حقاً.',
      cta:'اكتشف أعمالنا الملموسة', chip1:'احترام', chip2:'تضامن', chip3:'التزام', chip4:'إدماج'
    },
    services: { eyebrow:'برامجنا', titlePlain:'مرافقة شاملة', titleGradient:'وإنسانية', desc:'من تعلم اللغة إلى الإدماج المهني، نرافقك في كل خطوة من مسارك.' },
    svc: {
      s1title:'دروس اللغة الفرنسية',   s1desc:'ورش لجميع المستويات — من المبتدئ إلى المتقدم — مكيّفة مع جدولك واحتياجاتك.',
      s2title:'المساعدة الإدارية',      s2desc:'مساعدة في إجراءاتك: تصريح الإقامة، CAF، France Travail، الوصول إلى الحقوق الأساسية.',
      s3title:'ورش التبادل الثقافي',    s3desc:'لقاءات وورش للتعريف بثقافاتك الأصلية وبناء روابط متينة مع المجتمع الفرنسي.',
      s4title:'الإدماج المهني',          s4desc:'مساعدة في كتابة السيرة الذاتية، التحضير للمقابلات، والتواصل مع أصحاب العمل.',
      s5title:'الوصول إلى السكن',       s5desc:'التوجيه نحو هياكل الإيواء، المساعدة في البحث عن مسكن والوصول إلى السكن الاجتماعي.',
      s6title:'الدعم النفسي والاجتماعي', s6desc:'مرافقة نفسية فردية وجماعية، إدارة الضغط المرتبط بالمنفى والتكيف الثقافي.'
    },
    steps: {
      eyebrow:'كيف يعمل', titlePlain:'مسارك', titleGradient:'في 4 خطوات', desc:'مرافقة بسيطة وشفافة ومكيّفة مع كل وضع.',
      s1title:'التواصل الأول',   s1desc:'تواصل معنا عبر الهاتف أو البريد الإلكتروني أو قدم مباشرة. لا حاجة لموعد — نحن هنا.',
      s2title:'مقابلة شخصية',    s2desc:'يستقبلك مستشار في مقابلة سرية لفهم وضعك الفريد وتحديد احتياجاتك.',
      s3title:'خطة المرافقة',    s3desc:'يُعدّ مسار مخصص معك: خدمات وورش ومتابعة منتظمة مكيّفة مع وضعك.',
      s4title:'المتابعة والاندماج', s4desc:'نرافقك طوال مسارك مع تقييمات منتظمة، حتى تحقق استقلاليتك الكاملة.'
    },
    testi:  { eyebrow:'شهادات', titlePlain:'عبروا', titleGradient:'الجسر', desc:'كلماتهم هي أجمل مكافأة لنا.' },
    events: { eyebrow:'الأجندة', titlePlain:'الفعاليات', titleGradient:'القادمة' },
    join: {
      vol_eyebrow:'التطوع', vol_title:'كن متطوعاً',
      vol_desc:'شارك بمهاراتك ووقتك لمرافقة الأشخاص في مسارهم. كل ساعة تُحسب وكل ابتسامة تهم.',
      vol_li1:'دروس الفرنسية ومحو الأمية', vol_li2:'المساعدة الإدارية والقانونية', vol_li3:'تنشيط ورش التبادل الثقافي', vol_li4:'التواصل والرقمنة',
      vol_cta:'أريد الانخراط',
      don_eyebrow:'الدعم المالي', don_title:'تبرع الآن',
      don_desc:'تبرعاتك معفاة ضريبياً بنسبة 66%. كل يورو يساهم مباشرة في برامج المرافقة الميدانية.',
      don_cta:'تبرع الآن'
    },
    contact: {
      eyebrow:'تواصل معنا', titlePlain:'لنتحدث عن', titleGradient:'مشروعك',
      desc:'سواء أردت الاستفادة من خدماتنا أو الانضمام إلى فريقنا أو دعمنا، نحن هنا للرد عليك.',
      f_nom:'الاسم الكامل', f_email:'البريد الإلكتروني', f_sujet:'موضوع رسالتك', f_message:'رسالتك',
      f_nom_ph:'اسمك الكامل', f_email_ph:'بريدك@الإلكتروني.fr', f_message_ph:'اوصف وضعك أو طلبك...',
      f_sujet_opt0:'— اختر موضوعاً —', f_sujet_opt1:'أبحث عن مساعدة في الاندماج', f_sujet_opt2:'أريد أن أصبح متطوعاً',
      f_sujet_opt3:'أريد التبرع', f_sujet_opt4:'اقتراح شراكة', f_sujet_opt5:'طلب صحفي / إعلامي', f_sujet_opt6:'طلب آخر',
      f_rgpd:"أوافق على معالجة بياناتي وفقاً لـ<a href='#'>سياسة الخصوصية</a> للرد على طلبي.",
      f_submit:'إرسال الرسالة', f_note:'سنرد عليك في غضون 48 ساعة عمل'
    },
    footer: {
      desc:'جمعية معترف بها ذات منفعة عامة. منذ 2026، نبني جسوراً بين الثقافات من أجل فرنسا أكثر شمولاً وتضامناً.',
      col1:'الجمعية', col2:'برامجنا', col3:'انضم إلينا',
      nl_title:'النشرة الإخبارية', nl_desc:'ابقَ على اطلاع بأخبارنا وفعالياتنا القادمة.', nl_ph:'بريدك@الإلكتروني', nl_btn:'اشترك',
      copy:'© 2026 AIC — جمعية قانون 1901 | SIRET 123 456 789 00010'
    }
  },

  tr: {
    nav: { mission:'Misyonumuz', actions:'Programlarımız', how:'Nasıl çalışır', testimonials:'Referanslar', events:'Etkinlikler', contact:'İletişim', join:'Bize katılın' },
    hero: {
      badge:'Kamu yararına tanınan dernek',
      title:"Kültürlerin<br><em>buluştuğu yerde,</em><br>bağlar kurulur",
      subtitle:"Fransa'da farklı kültürlerden gelen kişileri entegrasyon süreçlerinde destekliyoruz — anlayış, uzmanlık ve bağlılıkla.",
      cta1:'Programlarımızı keşfedin', cta2:'İletişime geçin',
      dropdown_title:'Gönüllülerimizin desteklediği diller', dropdown_cta:'Bize yazın →'
    },
    stats: { people:'Desteklenen kişi', nationalities:'Temsil edilen milliyet', volunteers:'Gönüllü', years:'Kuruluş yılı' },
    mission: {
      eyebrow:'Misyonumuz', titlePlain:'Kültürler arası', titleGradient:'köprüler kurmak',
      p1:"AIC basit bir tespitle doğdu: entegrasyon emredilmez, inşa edilir. Birlikte. 2026'dan bu yana kişilere insani ve kişiselleştirilmiş bir yaklaşımla destek veriyoruz.",
      p2:"Yaklaşımımız üç temel sütuna dayanır: her bireyin kimliğine <strong>saygı</strong>, değişimin motoru olarak <strong>dayanışma</strong> ve gerçekten kapsayıcı bir Fransa için <strong>bağlılık</strong>.",
      cta:'Somut eylemlerimizi görün', chip1:'Saygı', chip2:'Dayanışma', chip3:'Bağlılık', chip4:'Kapsayıcılık'
    },
    services: { eyebrow:'Programlarımız', titlePlain:'Kapsamlı ve', titleGradient:'insani destek', desc:"Dil öğreniminden mesleki entegrasyona kadar yolculuğunuzun her adımında yanınızdayız." },
    svc: {
      s1title:'Fransızca kursları',        s1desc:"Başlangıçtan ileri seviyeye kadar FLE atölyeleri — programınıza ve özel ihtiyaçlarınıza uyarlanmış.",
      s2title:'İdari yardım',              s2desc:'Prosedürlerinizde destek: oturma izni, CAF, France Travail, temel haklara erişim.',
      s3title:'Kültürlerarası atölyeler',  s3desc:"Kültürlerinizi tanıtmak ve Fransız toplumuyla kalıcı bağlar kurmak için buluşmalar ve atölyeler.",
      s4title:'Mesleki entegrasyon',       s4desc:'CV yazımı, mülakat hazırlığı ve taahhütlü partner işverenlerle ağ kurma konusunda yardım.',
      s5title:'Konuta erişim',             s5desc:'Barınma yapılarına yönlendirme, konut arama yardımı ve sosyal konut programlarına erişim.',
      s6title:'Psikososyal destek',        s6desc:'Bireysel ve grup psikolojik eşlik, sürgün ve kültürel uyuma bağlı stres yönetimi.'
    },
    steps: {
      eyebrow:'Nasıl çalışır', titlePlain:'Yolculuğunuz', titleGradient:'4 adımda', desc:'Her duruma uyarlanmış basit, şeffaf destek.',
      s1title:'İlk temas',          s1desc:'Telefon, e-posta yoluyla veya doğrudan gelin. Randevu gerekmez — buradayız.',
      s2title:'Kişisel görüşme',    s2desc:'Bir danışman, benzersiz durumunuzu anlamak ve ihtiyaçlarınızı belirlemek için gizli bir görüşmede sizi kabul eder.',
      s3title:'Destek planı',       s3desc:'Sizinle birlikte kişiselleştirilmiş bir yol haritası oluşturulur: hizmetler, atölyeler ve düzenli takip.',
      s4title:'Takip ve entegrasyon', s4desc:"Tam özerkliğinize kavuşana kadar düzenli değerlendirmelerle yolculuğunuz boyunca yanınızdayız."
    },
    testi:  { eyebrow:'Referanslar', titlePlain:'Onlar geçti', titleGradient:'köprüden', desc:'Onların sözleri bizim en güzel ödülümüzdür.' },
    events: { eyebrow:'Takvim', titlePlain:'Yaklaşan', titleGradient:'etkinlikler' },
    join: {
      vol_eyebrow:'Gönüllülük', vol_title:'Gönüllü olun',
      vol_desc:'Yolculuklarında insanlara eşlik etmek için becerilerinizi ve zamanınızı paylaşın. Her saat önemli, her gülümseme de.',
      vol_li1:'Fransızca dersleri & okuryazarlık', vol_li2:'İdari ve hukuki yardım', vol_li3:'Kültürel atölye animasyonu', vol_li4:'İletişim & dijital',
      vol_cta:'Katılmak istiyorum',
      don_eyebrow:'Mali destek', don_title:'Bağış yapın',
      don_desc:'Bağışlarınız %66 oranında vergi indirimine tabidir. Her euro doğrudan saha destek programlarımıza katkıda bulunur.',
      don_cta:'Şimdi bağış yapın'
    },
    contact: {
      eyebrow:'Bize ulaşın', titlePlain:'Projeniz hakkında', titleGradient:'konuşalım',
      desc:"Hizmetlerimizden yararlanmak, ekibimize katılmak veya bizi desteklemek istiyorsanız size yanıt vermek için buradayız.",
      f_nom:'Ad Soyad', f_email:'E-posta adresi', f_sujet:'Konu', f_message:'Mesajınız',
      f_nom_ph:'Adınız ve soyadınız', f_email_ph:'siz@eposta.com', f_message_ph:'Durumunuzu veya talebinizi açıklayın...',
      f_sujet_opt0:'— Bir konu seçin —', f_sujet_opt1:'Entegrasyon konusunda yardıma ihtiyacım var', f_sujet_opt2:'Gönüllü olmak istiyorum',
      f_sujet_opt3:'Bağış yapmak istiyorum', f_sujet_opt4:'Ortaklık önerisi', f_sujet_opt5:'Basın / medya talebi', f_sujet_opt6:'Diğer talep',
      f_rgpd:"Talebime cevap vermek amacıyla verilerimin <a href='#'>gizlilik politikasına</a> uygun şekilde işlenmesini kabul ediyorum.",
      f_submit:'Mesaj gönder', f_note:'48 iş saati içinde yanıt veriyoruz'
    },
    footer: {
      desc:"Kamu yararına tanınan dernek. 2026'dan beri daha kapsayıcı ve dayanışmacı bir Fransa için kültürler arası köprüler kuruyoruz.",
      col1:'Dernek', col2:'Programlarımız', col3:'Katılın',
      nl_title:'Bülten', nl_desc:'Haberlerimiz ve yaklaşan etkinlikler hakkında bilgi alın.', nl_ph:'siz@eposta.com', nl_btn:'Abone ol',
      copy:'© 2026 AIC — Dernek | SIRET 123 456 789 00010'
    }
  },

  zh: {
    nav: { mission:'我们的使命', actions:'我们的行动', how:'如何运作', testimonials:'用户见证', events:'近期活动', contact:'联系我们', join:'加入我们' },
    hero: {
      badge:'认可的公益协会',
      title:'文化交汇之处<br><em>纽带由此诞生，</em><br>友谊从此开始',
      subtitle:'我们陪伴来自不同文化背景的人们在法国开启融合之旅 — 以善意、专业知识和承诺为依托。',
      cta1:'了解我们的行动', cta2:'联系我们',
      dropdown_title:'我们的志愿者所支持的语言', dropdown_cta:'联系我们 →'
    },
    stats: { people:'受帮助的人数', nationalities:'代表的国籍数', volunteers:'志愿者人数', years:'成立于' },
    mission: {
      eyebrow:'我们的使命', titlePlain:'搭建桥梁', titleGradient:'连接不同文化',
      p1:'AIC 源于一个简单的观察：融合不是命令，而是共同建设的成果。自2026年以来，我们以人性化和个性化的方式陪伴人们走过融合之路。',
      p2:'我们的方法建立在三大支柱之上：对每个人身份的<strong>尊重</strong>，作为变革动力的<strong>团结</strong>，以及为了真正包容的法国而做出的<strong>承诺</strong>。',
      cta:'查看我们的具体行动', chip1:'尊重', chip2:'团结', chip3:'承诺', chip4:'包容'
    },
    services: { eyebrow:'我们的行动', titlePlain:'全面且贴心的', titleGradient:'陪伴支持', desc:'从语言学习到职业融入，我们在您旅程的每一步都陪伴左右。' },
    svc: {
      s1title:'法语课程',     s1desc:'面向所有水平的法语课程 — 从初学者到高级 — 根据您的时间和需求量身定制。',
      s2title:'行政事务协助', s2desc:'协助处理手续：居留证、CAF、法国就业局、基本权利获取。',
      s3title:'跨文化工作坊', s3desc:'举办聚会和工作坊，展示您的原籍文化，与法国社会建立持久联系。',
      s4title:'职业融入',     s4desc:'协助撰写简历、准备面试，并与承诺的合作雇主建立联系网络。',
      s5title:'住房获取',     s5desc:'指导前往住房机构，协助寻找住所，获取社会住房项目。',
      s6title:'心理社会支持', s6desc:'个人和团体心理辅导，管理与流亡和文化适应相关的压力。'
    },
    steps: {
      eyebrow:'如何运作', titlePlain:'您的旅程', titleGradient:'分四步走', desc:'简单、透明、适应每种情况的支持。',
      s1title:'初次联系',   s1desc:'通过电话、电子邮件联系我们或直接来访。无需预约 — 我们随时在这里。',
      s2title:'个性化面谈', s2desc:'顾问将在保密面谈中接待您，了解您的独特情况并确定您的需求。',
      s3title:'支持计划',   s3desc:'与您共同制定个性化路径：适合您情况的服务、工作坊和定期跟进。',
      s4title:'跟进与融合', s4desc:'我们将通过定期评估陪伴您走完整个旅程，直到您完全自立。'
    },
    testi:  { eyebrow:'用户见证', titlePlain:'他们走过了', titleGradient:'这座桥', desc:'他们的话语是我们最美好的回报。' },
    events: { eyebrow:'活动日历', titlePlain:'即将举行的', titleGradient:'活动' },
    join: {
      vol_eyebrow:'志愿服务', vol_title:'成为志愿者',
      vol_desc:'分享您的技能和时间，陪伴人们走过融合之旅。每一小时都很重要，每一个微笑也是。',
      vol_li1:'法语课程及识字教育', vol_li2:'行政和法律协助', vol_li3:'文化工作坊活动策划', vol_li4:'沟通与数字化',
      vol_cta:'我想参与',
      don_eyebrow:'财务支持', don_title:'进行捐款',
      don_desc:'您的捐款享受66%的税收减免。每一欧元都直接支持我们的现场援助项目。',
      don_cta:'立即捐款'
    },
    contact: {
      eyebrow:'联系我们', titlePlain:'让我们谈谈', titleGradient:'您的项目',
      desc:'无论您是希望受益于我们的服务、加入我们的团队还是支持我们，我们都在这里为您解答。',
      f_nom:'全名', f_email:'电子邮件地址', f_sujet:'消息主题', f_message:'您的留言',
      f_nom_ph:'您的姓名', f_email_ph:'您的@邮箱.com', f_message_ph:'描述您的情况或需求...',
      f_sujet_opt0:'— 请选择主题 —', f_sujet_opt1:'我需要融合方面的帮助', f_sujet_opt2:'我想成为志愿者',
      f_sujet_opt3:'我想进行捐款', f_sujet_opt4:'合作提案', f_sujet_opt5:'媒体/新闻咨询', f_sujet_opt6:'其他请求',
      f_rgpd:"我同意根据<a href='#'>隐私政策</a>处理我的数据以回应我的请求。",
      f_submit:'发送消息', f_note:'我们将在48个工作小时内回复'
    },
    footer: {
      desc:'认可的公益协会。自2026年以来，我们在文化之间架桥，为建设更加包容和团结的法国而努力。',
      col1:'协会介绍', col2:'我们的行动', col3:'参与加入',
      nl_title:'电子通讯', nl_desc:'了解我们的最新动态和即将举行的活动。', nl_ph:'您的@邮箱.com', nl_btn:'订阅',
      copy:'© 2026 AIC — 非营利组织 | SIRET 123 456 789 00010'
    }
  },

  es: {
    nav: { mission:'Nuestra misión', actions:'Nuestros programas', how:'Cómo funciona', testimonials:'Testimonios', events:'Eventos', contact:'Contacto', join:'Únete a nosotros' },
    hero: {
      badge:'Asociación reconocida de utilidad pública',
      title:'Donde las culturas<br><em>se encuentran,</em><br>los lazos se crean',
      subtitle:'Acompañamos a personas de diferentes culturas en su proceso de integración en Francia — con benevolencia, experiencia y compromiso.',
      cta1:'Descubrir nuestros programas', cta2:'Ponerse en contacto',
      dropdown_title:'Idiomas apoyados por nuestros voluntarios', dropdown_cta:'Contáctanos →'
    },
    stats: { people:'Personas acompañadas', nationalities:'Nacionalidades representadas', volunteers:'Voluntarios comprometidos', years:'Fundada en' },
    mission: {
      eyebrow:'Nuestra misión', titlePlain:'Construir puentes', titleGradient:'entre las culturas',
      p1:'AIC nació de una observación simple: la integración no se decreta, se construye. Juntos. Desde 2026, acompañamos a personas en su camino con un enfoque humano y personalizado.',
      p2:'Nuestro enfoque se basa en tres pilares fundamentales: el <strong>respeto</strong> de la identidad de cada uno, la <strong>solidaridad</strong> como motor del cambio, y el <strong>compromiso</strong> por una Francia verdaderamente inclusiva.',
      cta:'Ver nuestras acciones concretas', chip1:'Respeto', chip2:'Solidaridad', chip3:'Compromiso', chip4:'Inclusión'
    },
    services: { eyebrow:'Nuestros programas', titlePlain:'Un acompañamiento', titleGradient:'completo y humano', desc:'Desde el aprendizaje del idioma hasta la inserción profesional, te acompañamos en cada etapa de tu recorrido.' },
    svc: {
      s1title:'Clases de francés',     s1desc:'Talleres de FLE para todos los niveles — de principiante a avanzado — adaptados a tu horario y necesidades.',
      s2title:'Ayuda administrativa',  s2desc:'Acompañamiento en tus trámites: permiso de residencia, CAF, France Travail, acceso a derechos fundamentales.',
      s3title:'Talleres interculturales', s3desc:'Encuentros y talleres para valorizar tus culturas de origen y tejer lazos duraderos con la sociedad francesa.',
      s4title:'Inserción profesional', s4desc:'Ayuda para redactar CV, preparación de entrevistas y networking con empleadores socios comprometidos.',
      s5title:'Acceso a la vivienda',  s5desc:'Orientación hacia estructuras de alojamiento, ayuda para buscar vivienda y acceso a vivienda social.',
      s6title:'Apoyo psicosocial',     s6desc:'Acompañamiento psicológico individual y en grupo, gestión del estrés vinculado al exilio y la adaptación cultural.'
    },
    steps: {
      eyebrow:'Cómo funciona', titlePlain:'Tu recorrido', titleGradient:'en 4 pasos', desc:'Un acompañamiento simple, transparente y adaptado a cada situación.',
      s1title:'Primer contacto',          s1desc:'Contáctanos por teléfono, correo o preséntate directamente. Sin necesidad de cita — estamos aquí.',
      s2title:'Entrevista personalizada', s2desc:'Un consejero te recibe en una entrevista confidencial para comprender tu situación y definir tus necesidades.',
      s3title:'Plan de acompañamiento',   s3desc:'Se elabora contigo un recorrido personalizado: servicios, talleres y seguimiento regular adaptado a tu situación.',
      s4title:'Seguimiento e integración', s4desc:'Te acompañamos durante todo tu recorrido con evaluaciones regulares, hasta alcanzar tu plena autonomía.'
    },
    testi:  { eyebrow:'Testimonios', titlePlain:'Cruzaron', titleGradient:'el puente', desc:'Sus palabras son nuestra más bella recompensa.' },
    events: { eyebrow:'Agenda', titlePlain:'Próximos', titleGradient:'eventos' },
    join: {
      vol_eyebrow:'Voluntariado', vol_title:'Conviértete en voluntario',
      vol_desc:'Comparte tus competencias y tiempo para acompañar a personas en su recorrido. Cada hora cuenta y cada sonrisa también.',
      vol_li1:'Clases de francés y alfabetización', vol_li2:'Asistencia administrativa y jurídica', vol_li3:'Animación de talleres culturales', vol_li4:'Comunicación y digital',
      vol_cta:'Quiero comprometerme',
      don_eyebrow:'Apoyo financiero', don_title:'Haz una donación',
      don_desc:'Tus donaciones son deducibles fiscalmente en un 66%. Cada euro contribuye directamente a nuestros programas de acompañamiento.',
      don_cta:'Donar ahora'
    },
    contact: {
      eyebrow:'Contáctanos', titlePlain:'Hablemos de', titleGradient:'tu proyecto',
      desc:'Tanto si deseas beneficiarte de nuestros servicios, unirte a nuestro equipo o apoyarnos, estamos aquí para responderte.',
      f_nom:'Nombre completo', f_email:'Dirección de correo', f_sujet:'Asunto', f_message:'Tu mensaje',
      f_nom_ph:'Tu nombre y apellidos', f_email_ph:'tu@correo.es', f_message_ph:'Describe tu situación o solicitud...',
      f_sujet_opt0:'— Selecciona un asunto —', f_sujet_opt1:'Busco ayuda para mi integración', f_sujet_opt2:'Quiero ser voluntario',
      f_sujet_opt3:'Quiero hacer una donación', f_sujet_opt4:'Propuesta de asociación', f_sujet_opt5:'Consulta de prensa / medios', f_sujet_opt6:'Otra solicitud',
      f_rgpd:"Acepto que mis datos sean tratados de acuerdo con la <a href='#'>política de privacidad</a> para responder a mi solicitud.",
      f_submit:'Enviar mensaje', f_note:'Respondemos en 48 horas hábiles'
    },
    footer: {
      desc:'Asociación reconocida de utilidad pública. Desde 2026, construimos puentes entre culturas por una Francia más inclusiva y solidaria.',
      col1:'La asociación', col2:'Nuestros programas', col3:'Únete',
      nl_title:'Boletín', nl_desc:'Mantente informado de nuestras noticias y próximos eventos.', nl_ph:'tu@correo.es', nl_btn:'Suscribirse',
      copy:'© 2026 AIC — Asociación sin ánimo de lucro | SIRET 123 456 789 00010'
    }
  }
};

/* ──────────────── Helpers ──────────────── */
function $q(sel)  { return document.querySelector(sel); }
function $qa(sel) { return Array.from(document.querySelectorAll(sel)); }

function setText(sel, val) {
  const el = $q(sel);
  if (el && val !== undefined) el.textContent = val;
}
function setHTML(sel, val) {
  const el = $q(sel);
  if (el && val !== undefined) el.innerHTML = val;
}
function setAttr(sel, attr, val) {
  const el = $q(sel);
  if (el && val !== undefined) el.setAttribute(attr, val);
}
// Met à jour uniquement le nœud texte d'un bouton contenant aussi un SVG
function setBtnText(sel, val) {
  const el = $q(sel);
  if (!el || val === undefined) return;
  el.childNodes.forEach(n => {
    if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) n.nodeValue = ' ' + val + ' ';
  });
}
// Met à jour le premier nœud texte d'une étiquette (label avec <span> *)
function setLabelText(forAttr, val) {
  const lbl = $q(`label[for="${forAttr}"]`);
  if (!lbl || val === undefined) return;
  lbl.childNodes.forEach(n => {
    if (n.nodeType === Node.TEXT_NODE) n.nodeValue = val + ' ';
  });
}

/* ──────────────── setLanguage ──────────────── */
function setLanguage(lang) {
  const t = translations[lang];
  if (!t) return;

  /* Direction & lang */
  const rtl = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir  = rtl ? 'rtl' : 'ltr';

  /* ── Navbar ── */
  setText('.nav__link[href="#mission"]',    t.nav.mission);
  setText('.nav__link[href="#services"]',   t.nav.actions);
  setText('.nav__link[href="#processus"]',  t.nav.how);
  setText('.nav__link[href="#temoignages"]',t.nav.testimonials);
  setText('.nav__link[href="#evenements"]', t.nav.events);
  setText('.nav__link[href="#contact"]',    t.nav.contact);
  setText('.nav__cta',                      t.nav.join);

  /* ── Hero badge ── */
  const badge = $q('.hero__badge');
  if (badge) {
    const tn = Array.from(badge.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim());
    if (tn) tn.nodeValue = '\n            ' + t.hero.badge + '\n          ';
  }
  /* Hero title, subtitle, CTAs */
  setHTML('#hero-title',          t.hero.title);
  setText('.hero__subtitle',      t.hero.subtitle);
  setBtnText('.hero__actions .btn--white',       t.hero.cta1);
  setText('.hero__actions .btn--ghost-white',    t.hero.cta2);

  /* ── Stats ── */
  const statLabels = $qa('.stats-strip__label');
  ['people','nationalities','volunteers','years'].forEach((k,i) => {
    if (statLabels[i]) statLabels[i].textContent = t.stats[k];
  });

  /* ── Mission ── */
  setText('.mission .eyebrow', t.mission.eyebrow);
  setHTML('#mission-title', t.mission.titlePlain + '<br><span class="gradient-text">' + t.mission.titleGradient + '</span>');
  const mPs = $qa('.mission__text-col p');
  if (mPs[0]) mPs[0].innerHTML = t.mission.p1;
  if (mPs[1]) mPs[1].innerHTML = t.mission.p2;
  setBtnText('.mission__text-col > a.btn', t.mission.cta);
  const chips = $qa('.chip');
  ['chip1','chip2','chip3','chip4'].forEach((k,i) => {
    if (!chips[i]) return;
    const svg = chips[i].querySelector('svg');
    chips[i].textContent = '';
    if (svg) chips[i].appendChild(svg);
    chips[i].appendChild(document.createTextNode('\n                ' + t.mission[k] + '\n              '));
  });

  /* ── Services ── */
  setText('.services .eyebrow', t.services.eyebrow);
  setHTML('#services-title', t.services.titlePlain + '<br><span class="gradient-text">' + t.services.titleGradient + '</span>');
  setText('.services .section-desc', t.services.desc);
  $qa('.svc-card').forEach((card, i) => {
    const k = 's' + (i+1);
    const h3 = card.querySelector('h3');
    const p  = card.querySelector('p');
    if (h3) h3.textContent = t.svc[k+'title'];
    if (p)  p.textContent  = t.svc[k+'desc'];
  });

  /* ── Steps ── */
  setText('.processus .eyebrow', t.steps.eyebrow);
  setHTML('#processus-title', t.steps.titlePlain + '<br><span class="gradient-text">' + t.steps.titleGradient + '</span>');
  setText('.processus .section-desc', t.steps.desc);
  $qa('.step-card').forEach((card, i) => {
    const k = 's' + (i+1);
    const h3 = card.querySelector('h3');
    const p  = card.querySelector('p');
    if (h3) h3.textContent = t.steps[k+'title'];
    if (p)  p.textContent  = t.steps[k+'desc'];
  });

  /* ── Témoignages ── */
  setText('.temoignages .eyebrow', t.testi.eyebrow);
  setHTML('#temoignages-title', t.testi.titlePlain + '<br><span class="gradient-text">' + t.testi.titleGradient + '</span>');
  setText('.temoignages .section-desc', t.testi.desc);

  /* ── Événements ── */
  setText('.evenements .eyebrow', t.events.eyebrow);
  setHTML('#evenements-title', t.events.titlePlain + '<br><span class="gradient-text">' + t.events.titleGradient + '</span>');

  /* ── Rejoindre ── */
  setText('.rejoindre__card--benevole .rejoindre__eyebrow', t.join.vol_eyebrow);
  setText('.rejoindre__card--benevole h3',    t.join.vol_title);
  setText('.rejoindre__card--benevole > p',   t.join.vol_desc);
  $qa('.rejoindre__list li').forEach((li, i) => {
    const k = 'vol_li' + (i+1);
    if (!t.join[k]) return;
    const svg = li.querySelector('svg');
    li.textContent = '';
    if (svg) li.appendChild(svg);
    li.appendChild(document.createTextNode(' ' + t.join[k]));
  });
  setText('.rejoindre__card--benevole .btn', t.join.vol_cta);
  setText('.rejoindre__card--don .rejoindre__eyebrow', t.join.don_eyebrow);
  setText('.rejoindre__card--don h3',   t.join.don_title);
  setText('.rejoindre__card--don > p',  t.join.don_desc);
  setText('.rejoindre__card--don .btn', t.join.don_cta);

  /* ── Contact ── */
  setText('.contact .eyebrow',   t.contact.eyebrow);
  setHTML('#contact-title', t.contact.titlePlain + '<br><span class="gradient-text">' + t.contact.titleGradient + '</span>');
  setText('.contact__info > p',  t.contact.desc);
  setLabelText('f-nom',     t.contact.f_nom);
  setLabelText('f-email',   t.contact.f_email);
  setLabelText('f-sujet',   t.contact.f_sujet);
  setLabelText('f-message', t.contact.f_message);
  setAttr('#f-nom',     'placeholder', t.contact.f_nom_ph);
  setAttr('#f-email',   'placeholder', t.contact.f_email_ph);
  setAttr('#f-message', 'placeholder', t.contact.f_message_ph);
  const sujet = $q('#f-sujet');
  if (sujet) Array.from(sujet.options).forEach((o, i) => {
    if (t.contact['f_sujet_opt'+i] !== undefined) o.text = t.contact['f_sujet_opt'+i];
  });
  const rgpdLabel = $q('label[for="f-rgpd"]');
  if (rgpdLabel) rgpdLabel.innerHTML = t.contact.f_rgpd;
  setBtnText('#contactForm .btn--primary', t.contact.f_submit);
  setText('#contactForm .form-note',       t.contact.f_note);

  /* ── Footer ── */
  setText('.footer__brand p', t.footer.desc);
  const fCols = $qa('.footer__col h4');
  if (fCols[0]) fCols[0].textContent = t.footer.col1;
  if (fCols[1]) fCols[1].textContent = t.footer.col2;
  if (fCols[2]) fCols[2].textContent = t.footer.col3;
  setText('.footer__newsletter h4',     t.footer.nl_title);
  setText('.footer__newsletter > p',    t.footer.nl_desc);
  setAttr('.newsletter-form input',     'placeholder', t.footer.nl_ph);
  setText('.newsletter-form button',    t.footer.nl_btn);
  setText('.footer__bottom p',          t.footer.copy);

  /* ── Dropdown +12 ── */
  setText('.lang-dropdown__title', t.hero.dropdown_title);
  const dropCta = $q('.lang-dropdown__cta');
  if (dropCta) dropCta.textContent = t.hero.dropdown_cta;

  localStorage.setItem('aic-lang', lang);
}

/* ──────────────── Initialisation du sélecteur de langue ──────────────── */
(function initI18n() {
  const switcher   = document.getElementById('langSwitcher');
  const dropdown   = document.getElementById('langDropdown');
  const moreBtn    = $q('.lang-btn--more');
  if (!switcher) return;

  /* Boutons de langue principale */
  $qa('.lang-btn[data-lang]').forEach(btn => {
    if (btn.dataset.lang === 'more') return;
    btn.addEventListener('click', () => {
      /* Activer le bouton cliqué */
      $qa('.lang-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      /* Fermer le dropdown +12 si ouvert */
      if (dropdown) { dropdown.hidden = true; moreBtn && moreBtn.setAttribute('aria-expanded','false'); }
      setLanguage(btn.dataset.lang);
    });
  });

  /* Bouton +12 — toggle dropdown */
  if (moreBtn && dropdown) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !dropdown.hidden;
      dropdown.hidden = open;
      moreBtn.setAttribute('aria-expanded', String(!open));
      moreBtn.classList.toggle('active', !open);
    });
    /* Fermer en cliquant ailleurs */
    document.addEventListener('click', (e) => {
      if (!dropdown.hidden && !dropdown.contains(e.target) && e.target !== moreBtn) {
        dropdown.hidden = true;
        moreBtn.setAttribute('aria-expanded','false');
        moreBtn.classList.remove('active');
      }
    });
    /* Fermer avec Echap */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !dropdown.hidden) {
        dropdown.hidden = true;
        moreBtn.setAttribute('aria-expanded','false');
        moreBtn.classList.remove('active');
        moreBtn.focus();
      }
    });
  }

  /* Restaurer la langue sauvegardée */
  const saved = localStorage.getItem('aic-lang');
  if (saved && translations[saved]) {
    const savedBtn = $q(`.lang-btn[data-lang="${saved}"]`);
    if (savedBtn && saved !== 'fr') {
      $qa('.lang-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      savedBtn.classList.add('active');
      savedBtn.setAttribute('aria-pressed','true');
      setLanguage(saved);
    }
  }
})();
