/* ============================================================
   Vizion Technologies — Main Script
   Requires GSAP + ScrollTrigger loaded before this file
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Injected Styles ──────────────────────────────────────── */
const _dynStyle = document.createElement('style');
_dynStyle.textContent = `
  /* Mouse spotlight on services grid */
  .services::before {
    content: ''; position: absolute; pointer-events: none;
    width: 640px; height: 640px; border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,.055) 0%, transparent 62%);
    left: var(--mx, -999px); top: var(--my, -999px);
    transform: translate(-50%,-50%);
    opacity: 0; transition: opacity .5s;
  }
  .services:hover::before { opacity: 1; }

  /* Hero card float */
  @keyframes vfloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .vis-float-1 { animation: vfloat 3.2s ease-in-out infinite; }
  .vis-float-2 { animation: vfloat 2.7s ease-in-out infinite 0.6s; }

  /* Hero blinking caret after headline lands */
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  .hero-caret {
    display: inline-block; width: 3px; height: 0.78em;
    background: #2563eb; margin-left: 4px;
    vertical-align: -0.1em; border-radius: 2px;
    animation: blink 1.1s step-end infinite;
  }

  /* Tilt card: instant on enter, spring on leave */
  .tilt-active { transition: box-shadow .25s, border-color .25s !important; }
  .tilt-reset  { transition: transform .65s cubic-bezier(.23,1,.32,1), box-shadow .25s, border-color .25s !important; }
`;
document.head.appendChild(_dynStyle);

/* ── 1. Custom Cursor ─────────────────────────────────────── */
const cur  = document.getElementById('cur');
const curf = document.getElementById('curf');

if (!prefersReducedMotion && cur && curf) {
  let mx = 0, my = 0, fx = 0, fy = 0, ticking = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        cur.style.left = mx + 'px';
        cur.style.top  = my + 'px';
        ticking = false;
      });
    }
  }, { passive: true });

  (function follow() {
    fx += (mx - fx) * .12;
    fy += (my - fy) * .12;
    curf.style.left = fx + 'px';
    curf.style.top  = fy + 'px';
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll('a, button, .svc-card, .proc-step, .stat-card, .test-card, .price-card, .ins-card, .faq-item, .cs-result, .proj-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hover');    curf.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); curf.classList.remove('hover'); });
  });
}

/* ── 2. Scroll Progress Bar ───────────────────────────────── */
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? Math.min(window.scrollY / max, 1) * 100 : 0) + '%';
  }, { passive: true });
}

/* ── 3. Nav Scroll State ──────────────────────────────────── */
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  mainNav?.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── 4. Nav Active State ──────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const sections  = document.querySelectorAll('section[id]');

if (sections.length && navLinks.length) {
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => sectionObs.observe(s));
}

/* ── 5. Mobile Nav ────────────────────────────────────────── */
window.toggleMob = function() {
  const mob = document.getElementById('mobNav');
  const btn = document.getElementById('navHamburger');
  if (!mob) return;
  const open = mob.classList.toggle('open');
  btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) mob.focus(); else btn?.focus();
};
window.closeMob = function() {
  const mob = document.getElementById('mobNav');
  const btn = document.getElementById('navHamburger');
  mob?.classList.remove('open');
  btn?.setAttribute('aria-expanded', 'false');
  btn?.focus();
};
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const mob = document.getElementById('mobNav');
    if (mob?.classList.contains('open')) closeMob();
  }
});

/* ── 6. Marquee ───────────────────────────────────────────── */
const mqItems = [
  'React', 'Node.js', 'React Native', 'PostgreSQL',
  'Custom Software', 'Web Apps', 'Mobile Apps', 'Fleet Systems',
  'POS & Inventory', 'Business Management', 'Harare · Zimbabwe',
  'Free Prototype', 'Flexible Pricing', 'TypeScript', 'MongoDB', 'Figma'
];
const mqTrack = document.getElementById('mqTrack');
if (mqTrack) {
  [...mqItems, ...mqItems].forEach(t => {
    const d = document.createElement('div');
    d.className = 'mq-item';
    d.innerHTML = '<span class="mq-dot" aria-hidden="true"></span>' + t;
    mqTrack.appendChild(d);
  });
}

/* ── 7. Hero GSAP Animations ──────────────────────────────── */
if (document.getElementById('hBadge')) {
  gsap.to('#hBadge',  { opacity: 1, y: 0, duration: .7,  delay: .25, ease: 'power2.out' });
  document.querySelectorAll('.hero-h1 .ln span').forEach((s, i) =>
    gsap.to(s, { y: '0%', duration: .95, delay: .45 + i * .13, ease: 'power3.out' })
  );
  gsap.to('#hH1',    { opacity: 1, duration: .1, delay: .45 });
  gsap.to('#hSub',   { opacity: 1, y: 0, duration: .8,  delay: .85,  ease: 'power2.out' });
  gsap.to('#hActs',  { opacity: 1, y: 0, duration: .8,  delay: 1.05, ease: 'power2.out' });
  gsap.to('#hTrust', { opacity: 1, y: 0, duration: .8,  delay: 1.25, ease: 'power2.out' });
  gsap.to('#hScroll',{ opacity: 1,        duration: .8,  delay: 1.6  });
  if (document.getElementById('hVis')) {
    gsap.fromTo('#hVis', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1.1, delay: .6, ease: 'power3.out' });
  }
}

/* ── 8. Blinking Caret After Hero Lands ───────────────────── */
if (!prefersReducedMotion) {
  setTimeout(() => {
    const fixSpan = document.querySelector('.hero-fix span');
    if (fixSpan && !fixSpan.querySelector('.hero-caret')) {
      const caret = document.createElement('span');
      caret.className = 'hero-caret';
      caret.setAttribute('aria-hidden', 'true');
      fixSpan.appendChild(caret);
    }
  }, 2800);
}

/* ── 9. Hero Blob Scroll Parallax ────────────────────────── */
if (!prefersReducedMotion) {
  const blob1 = document.querySelector('.hero-blob1');
  const blob2 = document.querySelector('.hero-blob2');
  if (blob1 || blob2) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (blob1) blob1.style.transform = `translateY(${y * 0.28}px)`;
      if (blob2) blob2.style.transform = `translateY(${y * -0.18}px)`;
    }, { passive: true });
  }
}

/* ── 10. ScrambleText on Section Titles ──────────────────── */
class ScrambleText {
  constructor(el) {
    this.el = el;
    this.originalHTML = el.innerHTML;
    this.plainText    = el.textContent;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%!&';
    this.frame = 0;
    this.raf   = null;
  }
  run() {
    cancelAnimationFrame(this.raf);
    this.frame = 0;
    const { el, plainText, chars, originalHTML } = this;
    const total = 26;
    const tick  = () => {
      const progress  = this.frame / total;
      const resolved  = Math.floor(progress * plainText.length);
      el.textContent  = plainText.split('').map((ch, i) => {
        if (ch === ' ' || ch === '\n') return ch;
        if (i < resolved) return ch;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      this.frame++;
      if (this.frame <= total) {
        this.raf = requestAnimationFrame(tick);
      } else {
        el.innerHTML = originalHTML;
      }
    };
    this.raf = requestAnimationFrame(tick);
  }
}

if (!prefersReducedMotion) {
  document.querySelectorAll('.s-title').forEach(el => {
    const sc = new ScrambleText(el);
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { sc.run(); obs.disconnect(); }
    }, { threshold: 0.4 });
    obs.observe(el);
  });
}

/* ── 11. Number Counter ──────────────────────────────────── */
function animateCount(el) {
  const html  = el.innerHTML;
  const text  = el.textContent;
  const num   = parseInt(text.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num) || num === 0) return;

  const prefix   = text.match(/^[^0-9]*/)?.[0] ?? '';
  const innerSpan= html.match(/<span[^>]*>.*?<\/span>/i)?.[0] ?? '';
  const suffix   = innerSpan ? '' : (text.match(/[^0-9]*$/)?.[0] ?? '');
  const dur      = 1600;
  const t0       = performance.now();

  const tick = (now) => {
    const p     = Math.min((now - t0) / dur, 1);
    const eased = 1 - (1 - p) ** 3;
    const val   = Math.round(eased * num);
    if (innerSpan) el.innerHTML   = prefix + val + innerSpan;
    else            el.textContent = prefix + val + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.innerHTML = html;
  };
  requestAnimationFrame(tick);
}

document.querySelectorAll('.stat-n, .cs-r-n').forEach(el => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCount(el); obs.disconnect(); }
  }, { threshold: 0.6 });
  obs.observe(el);
});

/* ── 12. Staggered Grid + Proc Reveals ───────────────────── */
// Items that get stagger treatment (remove .reveal so generic loop skips them)
const staggerGroups = [
  ['.stats-row',  '.stat-card'],
  ['.test-grid',  '.test-card'],
  ['.svc-grid',   '.svc-card'],
  ['.price-grid', '.price-card'],
  ['.ins-grid',   '.ins-card'],
];

staggerGroups.forEach(([gridSel, itemSel]) => {
  const grid  = document.querySelector(gridSel);
  if (!grid) return;
  const items = grid.querySelectorAll(itemSel);
  if (!items.length) return;
  items.forEach(el => el.classList.remove('reveal'));
  gsap.fromTo(items,
    { opacity: 0, y: 36 },
    { opacity: 1, y: 0, duration: .65, stagger: .1, ease: 'power2.out',
      scrollTrigger: { trigger: grid, start: 'top 86%' } }
  );
});

// Process steps stagger
const procStepEls = document.querySelectorAll('.proc-step');
if (procStepEls.length) {
  procStepEls.forEach(el => el.classList.remove('reveal'));
  gsap.fromTo(procStepEls,
    { opacity: 0, y: 36 },
    { opacity: 1, y: 0, duration: .65, stagger: .15, ease: 'power2.out',
      scrollTrigger: { trigger: '.proc-steps', start: 'top 82%' } }
  );
}

// Connector line "draw" animation
if (!prefersReducedMotion) {
  const connectors = document.querySelectorAll('.proc-connector');
  if (connectors.length) {
    gsap.set(connectors, { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
    gsap.to(connectors, {
      scaleX: 1, opacity: 1,
      duration: .45, stagger: .2, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.proc-steps', start: 'top 80%' }
    });
  }
}

// Generic reveal — everything else
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 36 },
    { opacity: 1, y: 0, duration: .8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } }
  );
});

/* ── 13. 3D Card Tilt ────────────────────────────────────── */
if (!prefersReducedMotion && window.innerWidth > 768) {
  document.querySelectorAll('.svc-card, .test-card, .price-card, .cs-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('tilt-active');
      card.classList.remove('tilt-reset');
    });
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const y  = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      const rX = -y * 7;
      const rY =  x * 7;
      card.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.025)`;
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilt-active');
      card.classList.add('tilt-reset');
      card.style.transform = '';
      setTimeout(() => card.classList.remove('tilt-reset'), 700);
    });
  });
}

/* ── 14. Magnetic Buttons ────────────────────────────────── */
if (!prefersReducedMotion && window.innerWidth > 900) {
  document.querySelectorAll('.btn-primary, .btn-white').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform .12s ease, background .2s, box-shadow .2s';
    });
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const x  = e.clientX - r.left - r.width  / 2;
      const y  = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28 - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .55s cubic-bezier(.23,1,.32,1), background .2s, box-shadow .2s';
      btn.style.transform = '';
      setTimeout(() => { btn.style.transition = ''; btn.style.transform = ''; }, 580);
    });
  });
}

/* ── 15. Mouse Spotlight on Services Grid ────────────────── */
const svcSection = document.querySelector('.services');
if (svcSection) {
  let spotRaf = null;
  let tx = -999, ty = -999;
  let cx = -999, cy = -999;

  svcSection.addEventListener('mousemove', e => {
    const r = svcSection.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    if (!spotRaf) {
      spotRaf = requestAnimationFrame(function lerp() {
        cx += (tx - cx) * .1;
        cy += (ty - cy) * .1;
        svcSection.style.setProperty('--mx', cx + 'px');
        svcSection.style.setProperty('--my', cy + 'px');
        if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
          spotRaf = requestAnimationFrame(lerp);
        } else {
          spotRaf = null;
        }
      });
    }
  }, { passive: true });
  svcSection.addEventListener('mouseleave', () => {
    cancelAnimationFrame(spotRaf);
    spotRaf = null;
    cx = ty = -999;
    svcSection.style.setProperty('--mx', '-999px');
    svcSection.style.setProperty('--my', '-999px');
  }, { passive: true });
}

/* ── 16. FAQ Smooth Accordion ────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(details => {
  const summary = details.querySelector('.faq-q');
  const content = details.querySelector('.faq-a');
  if (!summary || !content) return;

  summary.addEventListener('click', e => {
    e.preventDefault();

    if (details.open) {
      // Close: animate out
      const start = content.offsetHeight;
      content.style.height = start + 'px';
      content.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        content.style.transition = 'height .3s cubic-bezier(.4,0,.2,1), opacity .25s';
        content.style.height = '0';
        content.style.opacity = '0';
        content.addEventListener('transitionend', () => {
          details.removeAttribute('open');
          content.style = '';
        }, { once: true });
      });
    } else {
      // Open: set open first so content renders, measure, then animate
      details.setAttribute('open', '');
      const target = content.scrollHeight;
      content.style.height = '0';
      content.style.opacity = '0';
      content.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        content.style.transition = 'height .3s cubic-bezier(.4,0,.2,1), opacity .28s';
        content.style.height = target + 'px';
        content.style.opacity = '1';
        content.addEventListener('transitionend', () => {
          content.style = '';
        }, { once: true });
      });
    }
  });
});

/* ── 17. Scroll-Driven Section Glow ─────────────────────── */
if (!prefersReducedMotion) {
  ScrollTrigger.create({
    trigger: '.case-study',
    start: 'top 70%',
    onEnter: () => {
      gsap.fromTo('.cs-result',
        { opacity: 0, scale: .85, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: .6, stagger: .12, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: '.cs-results', start: 'top 82%' } }
      );
    }
  });

  // Pricing popular card entrance pop
  ScrollTrigger.create({
    trigger: '.pricing',
    start: 'top 70%',
    onEnter: () => {
      gsap.fromTo('.price-popular',
        { opacity: 0, y: 40, scale: .92 },
        { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '.price-grid', start: 'top 84%' } }
      );
    }
  });
}

/* ── 18. Contact Form (Formspree) ────────────────────────── */
const contactForm = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    let valid = true;
    contactForm.querySelectorAll('[required]').forEach((field, idx) => {
      const fg    = field.closest('.fg');
      const empty = !field.value.trim();
      field.classList.toggle('error', empty);
      fg?.classList.toggle('has-error', empty);
      const err = fg?.querySelector('.error-msg');
      if (err) {
        if (!err.id) err.id = 'err-' + (field.id || 'f' + idx);
        if (empty) field.setAttribute('aria-describedby', err.id);
        else field.removeAttribute('aria-describedby');
      }
      if (empty) valid = false;
    });
    if (!valid) return;

    const btn  = contactForm.querySelector('.btn-submit');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = 'Sending… <span style="display:inline-block;animation:spin .8s linear infinite">&#8635;</span>';

    const spinStyle = document.createElement('style');
    spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(spinStyle);

    const nextField = contactForm.querySelector('input[name="_next"]');
    if (nextField) nextField.value = window.location.href;

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        gsap.to(contactForm, { opacity: 0, y: -16, duration: .4, ease: 'power2.in', onComplete: () => {
          contactForm.style.display = 'none';
          if (formSuccess) {
            formSuccess.classList.add('show');
            formSuccess.setAttribute('aria-hidden', 'false');
            gsap.from(formSuccess, { opacity: 0, y: 20, duration: .5, ease: 'power2.out' });
            formSuccess.focus();
          }
        }});
      } else {
        btn.innerHTML = orig;
        btn.disabled  = false;
        btn.removeAttribute('aria-busy');
        // Shake the button to signal error
        gsap.to(btn, { x: [-8,8,-6,6,-3,3,0], duration: .5, ease: 'power2.inOut' });
      }
    } catch {
      btn.innerHTML = 'Error — try WhatsApp ↗';
      btn.disabled  = false;
      btn.removeAttribute('aria-busy');
    }
  });

  contactForm.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      field.closest('.fg')?.classList.remove('has-error');
    });
  });
}

/* ── 19. Portfolio Project Modal ──────────────────────────── */
const pfOverlay = document.getElementById('pfModalOverlay');
if (pfOverlay) {
  const pfThumb  = document.getElementById('pfModalThumb');
  const pfTags   = document.getElementById('pfModalTags');
  const pfTitle  = document.getElementById('pfModalTitle');
  const pfDesc   = document.getElementById('pfModalDesc');
  const pfExtra  = document.getElementById('pfModalExtra');
  const pfStatus = document.getElementById('pfModalStatus');
  const pfClose  = document.getElementById('pfModalClose');
  let pfLastFocused = null;

  function openProjectModal(card) {
    const thumb  = card.querySelector('.proj-thumb');
    const tags   = card.querySelector('.proj-tags');
    const title  = card.querySelector('h3');
    const desc   = card.querySelector('.proj-body > p');
    const status = card.querySelector('.proj-status');
    const detail = card.querySelector('.proj-detail');

    pfThumb.innerHTML = thumb ? thumb.innerHTML : '';
    pfThumb.querySelector('.proj-view-hint')?.remove();
    pfThumb.setAttribute('style', (thumb && thumb.getAttribute('style')) || '');
    pfTags.innerHTML   = tags   ? tags.innerHTML   : '';
    pfTitle.textContent = title ? title.textContent : '';
    pfDesc.textContent  = desc  ? desc.textContent  : '';
    pfExtra.innerHTML   = detail ? detail.innerHTML : '';
    pfStatus.innerHTML  = status ? status.innerHTML : '';

    pfLastFocused = document.activeElement;
    pfOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => pfOverlay.classList.add('open'));
    pfClose.focus();
  }

  function closeProjectModal() {
    pfOverlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { pfOverlay.hidden = true; }, 250);
    pfLastFocused?.focus();
  }

  document.querySelectorAll('.proj-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');

    card.addEventListener('click', e => {
      if (e.target.closest('.proj-link')) return;
      openProjectModal(card);
    });
    card.addEventListener('keydown', e => {
      if (e.target.closest('.proj-link')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProjectModal(card);
      }
    });
  });

  pfClose.addEventListener('click', closeProjectModal);
  pfOverlay.addEventListener('click', e => {
    if (e.target === pfOverlay) closeProjectModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !pfOverlay.hidden) closeProjectModal();
  });
}

/* ── 20. Cookie Notice ───────────────────────────────────── */
const cookieBar = document.getElementById('cookieBar');
const cookieBtn = document.getElementById('cookieAccept');
if (cookieBar && !localStorage.getItem('vzn_cookie_ok')) {
  setTimeout(() => cookieBar.classList.add('visible'), 1600);
}
if (cookieBtn) {
  cookieBtn.addEventListener('click', () => {
    localStorage.setItem('vzn_cookie_ok', '1');
    gsap.to(cookieBar, { opacity: 0, y: 20, duration: .35, onComplete: () => cookieBar.classList.remove('visible') });
  });
}
