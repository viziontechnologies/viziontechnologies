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

/* ── Hero Dashboard Tilt ─────────────────────────────────── */
const heroVisual = document.getElementById('hVis');
if (heroVisual && !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let tiltFrame = 0;
  heroVisual.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || tiltFrame) return;
    tiltFrame = requestAnimationFrame(() => {
      const bounds = heroVisual.getBoundingClientRect();
      const x = (e.clientX - bounds.left) / bounds.width - .5;
      const y = (e.clientY - bounds.top) / bounds.height - .5;
      heroVisual.style.setProperty('--tilt-x', `${x * 5}deg`);
      heroVisual.style.setProperty('--tilt-y', `${y * -5}deg`);
      tiltFrame = 0;
    });
  }, { passive: true });
  heroVisual.addEventListener('pointerleave', () => {
    if (tiltFrame) cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    heroVisual.style.setProperty('--tilt-x', '0deg');
    heroVisual.style.setProperty('--tilt-y', '0deg');
  });
}

/* ── 10. Word Reveal on Section Titles ───────────────────── */
// Each word rises out of a mask and sharpens, one after another, when the
// title scrolls into view. Only text nodes are wrapped, so coloured spans
// and <br>s inside titles keep working and the text stays readable.
function splitWords(el) {
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) return walk(child);
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(part));
        const word = document.createElement('span');
        word.className = 'st-word';
        const inner = document.createElement('span');
        inner.className = 'st-in';
        inner.style.setProperty('--i', i++);
        inner.textContent = part;
        word.appendChild(inner);
        frag.appendChild(word);
      });
      child.replaceWith(frag);
    });
  };
  walk(el);
}

if (!prefersReducedMotion) {
  document.querySelectorAll('.s-title').forEach(el => {
    el.classList.remove('reveal');               // the word reveal replaces the generic fade-up
    splitWords(el);
    el.classList.add('st-ready');
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { el.classList.add('st-on'); obs.disconnect(); }
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
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

function showFormFallback() {
  if (document.getElementById('formFallback')) return;
  const note = document.createElement('p');
  note.id = 'formFallback';
  note.setAttribute('role', 'alert');
  note.style.cssText = 'margin-top:1rem;font-size:.9rem;color:#b91c1c';
  note.innerHTML = "Sorry, that didn't send. Please <a href=\"https://wa.me/263778686550\" target=\"_blank\" rel=\"noopener\">WhatsApp us</a> or email <a href=\"mailto:viziontechnologies.zw@gmail.com\">viziontechnologies.zw@gmail.com</a> instead.";
  contactForm.appendChild(note);
}

// A paper plane takes off from the Send button when the message goes through.
function flyPaperPlane(from) {
  if (prefersReducedMotion || typeof gsap === 'undefined') return;
  const r = from.getBoundingClientRect();
  const plane = document.createElement('div');
  plane.className = 'paper-plane';
  plane.setAttribute('aria-hidden', 'true');
  plane.innerHTML = '<svg viewBox="0 0 64 64" width="56" height="56"><path d="M4 30 60 6 44 58 32 38Z" fill="#2563eb"/><path d="M60 6 32 38l-4 18 8-14" fill="#1d4ed8"/><path d="M4 30 32 38 60 6Z" fill="#60a5fa"/></svg>';
  plane.style.left = `${r.left + r.width / 2 - 28}px`;
  plane.style.top = `${r.top + r.height / 2 - 28}px`;
  document.body.appendChild(plane);
  gsap.timeline({ onComplete: () => plane.remove() })
    .fromTo(plane, { scale: .4, opacity: 0, rotateZ: -10 }, { scale: 1, opacity: 1, duration: .25, ease: 'back.out(2)' })
    .to(plane, { x: 140, y: -60, rotateZ: -25, rotateX: 25, duration: .45, ease: 'power1.in' })
    .to(plane, { x: 60, y: -220, rotateZ: -160, rotateY: 40, duration: .55, ease: 'sine.inOut' })    // the loop
    .to(plane, { x: window.innerWidth, y: -window.innerHeight * .6, rotateZ: -35, scale: .5, opacity: 0, duration: .9, ease: 'power2.in' });
}

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
    document.getElementById('formFallback')?.remove();

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
        flyPaperPlane(btn);
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
        showFormFallback();
      }
    } catch {
      btn.innerHTML = orig;
      btn.disabled  = false;
      btn.removeAttribute('aria-busy');
      showFormFallback();
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
    // Cards with data-case="work/<name>.html" open their case study instead of the pop-up.
    const caseUrl = card.dataset.case;
    const open = e => {
      if (!caseUrl) return openProjectModal(card);
      if (e.ctrlKey || e.metaKey || e.button === 1) window.open(caseUrl, '_blank', 'noopener');
      else window.location.href = caseUrl;
    };

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', caseUrl ? 'link' : 'button');
    if (caseUrl) {
      const hint = card.querySelector('.proj-view-hint');
      if (hint) hint.innerHTML = 'Read the case study &rarr;';
    } else {
      card.setAttribute('aria-haspopup', 'dialog');
    }

    card.addEventListener('click', e => {
      if (e.target.closest('.proj-link')) return;
      open(e);
    });
    card.addEventListener('auxclick', e => {
      if (caseUrl && e.button === 1 && !e.target.closest('.proj-link')) open(e);
    });
    card.addEventListener('keydown', e => {
      if (e.target.closest('.proj-link')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(e);
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

/* ── 21. Clickable Prototypes (portfolio) ─────────────────── */
const protoFrame = document.getElementById('protoFrame');
if (protoFrame) {
  const protoTabs = [...document.querySelectorAll('.proto-tab')];
  const protoStage = document.getElementById('protoStage');
  const protoDevices = document.getElementById('protoDevices');
  let lastKind = protoStage.dataset.kind;

  function setDevice(device) {
    protoStage.dataset.device = device;
    protoDevices.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.device === device ? 'true' : 'false'));
  }
  protoDevices.addEventListener('click', e => {
    const b = e.target.closest('button[data-device]');
    if (b) setDevice(b.dataset.device);
  });

  function selectProto(tab, focus) {
    protoTabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (protoFrame.getAttribute('src') !== tab.dataset.src) protoFrame.setAttribute('src', tab.dataset.src);
    // Frame and chrome follow the app: phone apps, desktop apps (title bar), web systems and websites (browser bar).
    protoStage.dataset.kind = tab.dataset.kind || 'phone';
    document.getElementById('protoUrl').textContent = tab.dataset.url || '';
    const devices = (tab.dataset.devices || 'phone').split(' ');
    protoDevices.hidden = devices.length < 2;
    protoDevices.querySelectorAll('button').forEach(b => { b.hidden = !devices.includes(b.dataset.device); });
    setDevice(devices.includes(protoStage.dataset.device) && devices.length > 1 && protoStage.dataset.kind === lastKind ? protoStage.dataset.device : devices[0]);
    lastKind = protoStage.dataset.kind;
    protoFrame.title = tab.dataset.name + ' clickable prototype';
    protoStage.classList.remove('is-used');        // show the "it's live" hint again for each app
    currentTab = tab;
    loadShots(tab);
    setView('proto');
    // Keep the address bar on this app (portfolio.html#try-<id>) so the link can be shared.
    history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
    if (focus) tab.focus();
  }

  // Prototype vs real screenshots. A tab with data-shots="<template id>" gets the
  // switch; the template holds the screenshot <img>s (personal details blurred).
  const protoView = document.getElementById('protoView');
  const protoShot = document.getElementById('protoShot');
  const protoShotCap = document.getElementById('protoShotCap');
  const protoFlag = document.getElementById('protoFlag');
  const protoFlagText = document.getElementById('protoFlagText');
  const protoFlagApk = document.getElementById('protoFlagApk');
  const protoFlagMail = document.getElementById('protoFlagMail');
  const protoFlagWa = document.getElementById('protoFlagWa');
  let currentTab = null, shots = [], shotIndex = 0;

  function loadShots(tab) {
    const tpl = tab.dataset.shots && document.getElementById(tab.dataset.shots);
    shots = tpl ? [...tpl.content.querySelectorAll('img')] : [];
    shotIndex = 0;
    protoView.hidden = !shots.length;
    document.getElementById('protoShotCount').textContent = shots.length ? `(${shots.length})` : '';
  }
  function showShot(i) {
    if (!shots.length) return;
    shotIndex = (i + shots.length) % shots.length;
    const s = shots[shotIndex];
    protoShot.src = s.getAttribute('src');
    protoShot.alt = s.alt;
    protoShotCap.textContent = `${shotIndex + 1} / ${shots.length} · ${s.dataset.cap || ''}`;
  }
  function setView(view) {
    if (view === 'shots' && !shots.length) view = 'proto';
    protoStage.dataset.view = view;
    protoView.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === view ? 'true' : 'false'));
    if (view === 'shots') showShot(shotIndex);
    updateFlag();
  }
  function updateFlag() {
    const shotsView = protoStage.dataset.view === 'shots';
    protoFlag.classList.toggle('is-shots', shotsView);
    protoFlagText.innerHTML = shotsView
      ? '<strong>Real screenshots</strong> from the app. Names and personal details are blurred.'
      : '<strong>This is a prototype</strong> with sample data, not the real app. The real app may be newer than this.';
    const app = currentTab && currentTab.dataset.apk;
    const ready = app && window.vznApkReady && window.vznApkReady.has(app);
    protoFlagApk.hidden = !ready;
    if (ready) protoFlagApk.href = `https://github.com/viziontechnologies/downloads/releases/download/${app}-latest/${app}.apk`;
    // "Ask us for access" links carry a ready-made message naming this prototype.
    const name = currentTab ? currentTab.dataset.name : 'one of your apps';
    const ask = `Hi Vizion, I tried the ${name} prototype on your website and I'd like access to the real app. Could you tell me how to get it?`;
    protoFlagMail.href = `mailto:viziontechnologies.zw@gmail.com?subject=${encodeURIComponent('Access request: ' + name)}&body=${encodeURIComponent(ask)}`;
    protoFlagWa.href = `https://wa.me/263778686550?text=${encodeURIComponent(ask)}`;
  }
  protoView.addEventListener('click', e => {
    const b = e.target.closest('button[data-view]');
    if (b) setView(b.dataset.view);
  });
  document.getElementById('protoShotPrev').addEventListener('click', () => showShot(shotIndex - 1));
  document.getElementById('protoShotNext').addEventListener('click', () => showShot(shotIndex + 1));
  document.getElementById('protoGallery').addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') showShot(shotIndex - 1);
    if (e.key === 'ArrowRight') showShot(shotIndex + 1);
  });
  document.addEventListener('vzn:apk', updateFlag);

  const protoCopy = document.getElementById('protoCopy');
  protoCopy.addEventListener('click', async () => {
    const url = location.origin + location.pathname + '#' + currentTab.getAttribute('aria-controls');
    try {
      await navigator.clipboard.writeText(url);
      protoCopy.textContent = 'Link copied';
    } catch {
      window.prompt('Copy this link:', url);
    }
    clearTimeout(protoCopy._t);
    protoCopy._t = setTimeout(() => { protoCopy.textContent = 'Copy link to this app'; }, 2000);
  });
  // "Live app" hint on the device: hidden once the visitor starts using it (pointer
  // over the screen, or focus moving into the iframe).
  const markUsed = () => protoStage.classList.add('is-used');
  protoFrame.addEventListener('pointerenter', () => setTimeout(markUsed, 1200));
  window.addEventListener('blur', () => { if (document.activeElement === protoFrame) markUsed(); });

  currentTab = protoTabs.find(t => t.getAttribute('aria-selected') === 'true') || protoTabs[0];
  loadShots(currentTab);
  updateFlag();

  protoTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectProto(tab));
    tab.addEventListener('keydown', e => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      selectProto(protoTabs[(i + step + protoTabs.length) % protoTabs.length], true);
    });
  });

  // Links like portfolio.html#try-tylliq (from the project cards) open that app's prototype.
  // The #try-<id> anchor is the text panel beside the phone, so the browser's own jump
  // lands mid-section. Scroll to the app tabs instead, just below the fixed nav.
  const protoTablist = document.querySelector('.proto-tabs');
  function scrollToProtos(behavior) {
    const navH = mainNav ? mainNav.offsetHeight : 0;
    window.scrollTo({ top: protoTablist.getBoundingClientRect().top + window.scrollY - navH - 16, behavior });
  }
  function protoFromHash(behavior) {
    const tab = protoTabs.find(t => '#' + t.getAttribute('aria-controls') === location.hash);
    if (!tab) return false;
    selectProto(tab);
    scrollToProtos(behavior);
    return true;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#try-"]');
    if (!a) return;
    history.replaceState(null, '', a.getAttribute('href'));
    if (protoFromHash('smooth')) e.preventDefault();
  });
  window.addEventListener('hashchange', () => protoFromHash('smooth'));
  if (protoFromHash('auto')) {
    // Run again once images and fonts have settled, and after the browser's own anchor jump.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.addEventListener('load', () => setTimeout(() => scrollToProtos('auto'), 50));
  }
}

/* ── 22. Portfolio Filters ───────────────────────────────── */
const pfFilters = [...document.querySelectorAll('.pf-filter')];
if (pfFilters.length) {
  // Projects with a full case study come first, with a small badge.
  const pfGrid = document.querySelector('.portfolio-grid');
  [...pfGrid.querySelectorAll('.proj-card[data-case]')].reverse().forEach(card => {
    pfGrid.prepend(card);
    const thumb = card.querySelector('.proj-thumb');
    if (thumb && !thumb.querySelector('.proj-case-badge')) {
      thumb.insertAdjacentHTML('beforeend', '<span class="proj-case-badge">Case study</span>');
    }
  });
  const pfCards = [...pfGrid.querySelectorAll('.proj-card')];
  const pfSearch = document.getElementById('pfSearch');
  const pfCount = document.getElementById('pfResultCount');
  const pfEmpty = document.getElementById('pfNoResults');
  const inCat = (card, f) => f === 'all' || (card.dataset.cat || '').split(' ').includes(f);
  const matchesSearch = (card, query) => !query || query.split(/\s+/).every(term =>
    (card.textContent + ' ' + (card.querySelector('.proj-detail')?.content.textContent || '')).toLowerCase().includes(term)
  );
  let activeFilter = 'all';

  // "All" with no search shows the first few projects and a "Show all" button.
  const PF_FIRST = 9;
  let pfExpanded = false;
  const pfMore = document.createElement('div');
  pfMore.className = 'pf-more';
  pfMore.innerHTML = '<button type="button" class="btn-ghost"></button>';
  pfGrid.after(pfMore);
  pfMore.querySelector('button').addEventListener('click', () => {
    pfExpanded = true;
    updatePortfolio();
    pfCards[PF_FIRST]?.querySelector('.proj-link, a')?.focus({ preventScroll: true });
  });

  function updatePortfolio() {
    const query = pfSearch ? pfSearch.value.trim().toLowerCase() : '';
    const limit = activeFilter === 'all' && !query && !pfExpanded ? PF_FIRST : Infinity;
    let matched = 0, visible = 0;
    pfCards.forEach(card => {
      const match = inCat(card, activeFilter) && matchesSearch(card, query);
      if (match) matched++;
      const show = match && matched <= limit;
      card.hidden = !show;
      if (show) {
        visible++;
        card.style.opacity = '';
        card.style.transform = '';
        if (window.gsap) gsap.set(card, { opacity: 1, y: 0 });
      }
    });
    if (pfCount) pfCount.textContent = `Showing ${visible} of ${pfCards.length} projects`;
    if (pfEmpty) pfEmpty.hidden = matched !== 0;
    pfMore.hidden = visible >= matched;
    pfMore.querySelector('button').textContent = `Show all ${matched} projects`;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  updatePortfolio();

  pfFilters.forEach(btn => {
    const n = pfCards.filter(c => inCat(c, btn.dataset.filter)).length;
    const count = btn.querySelector('span');
    if (count) count.textContent = n;
    btn.addEventListener('click', () => {
      pfFilters.forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      activeFilter = btn.dataset.filter;
      updatePortfolio();
    });
  });
  if (pfSearch) pfSearch.addEventListener('input', updatePortfolio);
}

/* ── 22b. App Store (apps.html) ──────────────────────────── */
// Platform tabs and search over .store-app tiles (data-platform="android web").
// Rows hide when none of their tiles match; rows with data-static="all windows"
// have no tiles and show only on those tabs, with no search typed.
const storeTabs = [...document.querySelectorAll('.store-tab')];
if (storeTabs.length) {
  const apps = [...document.querySelectorAll('.store-app')];
  const rows = [...document.querySelectorAll('.store-row')];
  const featured = document.getElementById('storeFeatured');
  const search = document.getElementById('storeSearch');
  const count = document.getElementById('storeCount');
  const empty = document.getElementById('storeEmpty');
  const onPlatform = (el, p) => p === 'all' || (el.dataset.platform || '').split(' ').includes(p);
  let platform = 'all';

  function updateStore() {
    const query = search ? search.value.trim().toLowerCase() : '';
    let shown = 0;
    apps.forEach(app => {
      const show = onPlatform(app, platform) && (!query || query.split(/\s+/).every(t => app.textContent.toLowerCase().includes(t)));
      app.hidden = !show;
      if (show) {
        shown++;
        if (window.gsap) gsap.set(app, { opacity: 1, y: 0 });
      }
    });
    rows.forEach(row => {
      if (row === featured) row.hidden = platform !== 'all' || !!query;
      else if (row.dataset.static) row.hidden = !!query || !row.dataset.static.split(' ').includes(platform) && platform !== 'all';
      else row.hidden = !row.querySelector('.store-app:not([hidden])');
    });
    if (count) count.textContent = query ? `${shown} ${shown === 1 ? 'app' : 'apps'} found` : '';
    if (empty) empty.hidden = shown !== 0 || !query;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  storeTabs.forEach(tab => {
    const n = apps.filter(a => onPlatform(a, tab.dataset.platform)).length;
    const badge = tab.querySelector('span');
    if (badge) badge.textContent = n;
    tab.addEventListener('click', () => {
      storeTabs.forEach(t => t.setAttribute('aria-pressed', t === tab ? 'true' : 'false'));
      platform = tab.dataset.platform;
      updateStore();
    });
  });
  if (search) search.addEventListener('input', updateStore);
  updateStore();
}

/* ── 22a. Phone Action Bar ───────────────────────────────── */
// On phones, WhatsApp and the free consultation stay one tap away at the
// bottom of the screen (CSS shows it only on small screens and hides the
// floating WhatsApp button there). The consultation link reuses the nav
// button's href, so it is right on every page.
(() => {
  const consult = document.querySelector('.nav-cta');
  if (!consult) return;
  const bar = document.createElement('div');        // not <nav>: the site's nav styles would pin it to the top
  bar.setAttribute('role', 'navigation');
  bar.className = 'mobile-bar';
  bar.setAttribute('aria-label', 'Quick contact');
  bar.innerHTML = `
    <a class="mobile-bar-wa" href="https://wa.me/263778686550" target="_blank" rel="noopener">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.5-4-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>
      WhatsApp us
    </a>
    <a class="mobile-bar-cta" href="${consult.getAttribute('href')}">Free consultation &rarr;</a>`;
  document.body.appendChild(bar);
  document.body.classList.add('has-mobile-bar');
})();

/* ── 23. APK Downloads ───────────────────────────────────── */
// Download buttons stay hidden until the app's version file exists in the
// public downloads repo (written by each app's release workflow), so the site
// never shows a link to a build that hasn't been published yet.
const apkTargets = document.querySelectorAll('[data-apk], [data-apk-show]');
if (apkTargets.length) {
  const apps = new Set([...apkTargets].map(el => el.dataset.apk || el.dataset.apkShow));
  apps.forEach(app => {
    fetch(`https://raw.githubusercontent.com/viziontechnologies/downloads/main/${app}/latest.json`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(m => {
        if (!m || !m.version || !m.apk_url) return;
        // Lets the prototype notice offer "Download the real app" (section 21).
        (window.vznApkReady = window.vznApkReady || new Set()).add(app);
        document.dispatchEvent(new CustomEvent('vzn:apk', { detail: app }));
        const mb = m.size_bytes ? ` · ${(m.size_bytes / 1048576).toFixed(1)} MB` : '';
        const date = m.released_at ? ` · ${new Date(m.released_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : '';
        document.querySelectorAll(`[data-apk="${app}"], [data-apk-show="${app}"]`).forEach(el => {
          el.hidden = false;
          el.querySelectorAll('[data-apk-meta]').forEach(x => { x.textContent = `Version ${m.version}${mb}${date} · Android`; });
          el.querySelectorAll('[data-apk-sha]').forEach(x => { if (m.sha256) x.textContent = `SHA-256 ${m.sha256}`; });
          if (el.matches('[data-apk-link]') && !el.title) el.title = `Version ${m.version}${mb}`;
        });
      })
      .catch(() => { /* not released yet, or offline: keep the buttons hidden */ });
  });
}
