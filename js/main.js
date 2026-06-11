/* ============================================================
   Vizion Technology Solutions — Main Script
   Requires GSAP + ScrollTrigger loaded before this file
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── Custom Cursor ────────────────────────────────────────────── */
const cur  = document.getElementById('cur');
const curf = document.getElementById('curf');

if (cur && curf) {
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function follow() {
    fx += (mx - fx) * .12;
    fy += (my - fy) * .12;
    curf.style.left = fx + 'px';
    curf.style.top  = fy + 'px';
    requestAnimationFrame(follow);
  })();

  document.querySelectorAll('a, button, .svc, .w-item, .s-pill, .proj-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hover');    curf.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); curf.classList.remove('hover'); });
  });
}

/* ── Scroll Progress Bar ──────────────────────────────────────── */
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const max     = document.documentElement.scrollHeight - window.innerHeight;
    const pct     = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

/* ── Nav Scroll State ─────────────────────────────────────────── */
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  mainNav?.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Nav Active State (IntersectionObserver) ──────────────────── */
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
const sections = document.querySelectorAll('section[id]');

if (sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));
}

/* ── Mobile Nav ───────────────────────────────────────────────── */
window.toggleMob = function() { document.getElementById('mobNav')?.classList.toggle('open'); };
window.closeMob  = function() { document.getElementById('mobNav')?.classList.remove('open'); };

/* ── Marquee ──────────────────────────────────────────────────── */
const mqs = [
  'React', 'Node.js', 'React Native', 'PostgreSQL',
  'Custom Software', 'Web Apps', 'Mobile Apps', 'Fleet Systems',
  'Business Management', 'Harare Zimbabwe', 'Free Prototype', 'Flexible Pricing'
];
const mqTrack = document.getElementById('mqTrack');
if (mqTrack) {
  [...mqs, ...mqs].forEach(t => {
    const d = document.createElement('div');
    d.className = 'mq-item';
    d.innerHTML = '<span class="mq-dot" aria-hidden="true"></span>' + t;
    mqTrack.appendChild(d);
  });
}

/* ── Hero Canvas Particle Field ───────────────────────────────── */
const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  let W, H, pts = [];

  function resizeCanvas() { W = heroCanvas.width = innerWidth; H = heroCanvas.height = innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - .5) * .3;
    this.vy = (Math.random() - .5) * .3;
    this.r  = Math.random() * 1.2 + .3;
    this.a  = Math.random() * .35 + .05;
  }
  Particle.prototype.tick = function() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
      this.x = Math.random() * W; this.y = Math.random() * H;
    }
  };

  for (let i = 0; i < 100; i++) pts.push(new Particle());

  (function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.tick();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(46,134,193,' + p.a + ')';
      ctx.fill();
    });
    pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(46,134,193,' + (0.05 * (1 - dist / 130)) + ')';
        ctx.lineWidth = .5;
        ctx.stroke();
      }
    }));
    requestAnimationFrame(drawFrame);
  })();
}

/* ── Hero GSAP Animations ─────────────────────────────────────── */
if (document.getElementById('hTag')) {
  gsap.to('#hTag', { opacity: 1, y: 0, duration: .7, delay: .3, ease: 'power2.out' });
  document.querySelectorAll('.hero-h1 .ln span').forEach((s, i) =>
    gsap.to(s, { y: '0%', duration: .9, delay: .5 + i * .12, ease: 'power3.out' })
  );
  gsap.to('#hH1',   { opacity: 1, duration: .1, delay: .5 });
  gsap.to('#hSub',  { opacity: 1, y: 0, duration: .8, delay: .9,  ease: 'power2.out' });
  gsap.to('#hActs', { opacity: 1, y: 0, duration: .8, delay: 1.1, ease: 'power2.out' });
  gsap.to('#hScroll', { opacity: 1, duration: .8, delay: 1.5 });
}

/* ── Scroll Reveal Animations ─────────────────────────────────── */
gsap.utils.toArray('.reveal').forEach(el =>
  gsap.fromTo(el,
    { opacity: 0, y: 36 },
    { opacity: 1, y: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } }
  )
);

/* ── Contact Form (Formspree) ─────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Client-side validation — highlight empty required fields
    let valid = true;
    contactForm.querySelectorAll('[required]').forEach(field => {
      const fg = field.closest('.fg');
      const empty = !field.value.trim();
      field.classList.toggle('error', empty);
      fg?.classList.toggle('has-error', empty);
      if (empty) valid = false;
    });
    if (!valid) return;

    const btn = contactForm.querySelector('.btn-sub');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        contactForm.style.display = 'none';
        formSuccess?.classList.add('show');
      } else {
        btn.textContent = 'Send failed — try WhatsApp ↗';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Error — try WhatsApp ↗';
      btn.disabled = false;
    }
  });

  // Clear validation state as user types
  contactForm.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      field.closest('.fg')?.classList.remove('has-error');
    });
  });
}

/* ── Cookie Notice ────────────────────────────────────────────── */
const cookieBar = document.getElementById('cookieBar');
const cookieBtn = document.getElementById('cookieAccept');

if (cookieBar && !localStorage.getItem('vzn_cookie_ok')) {
  setTimeout(() => cookieBar.classList.add('visible'), 1400);
}
if (cookieBtn) {
  cookieBtn.addEventListener('click', () => {
    localStorage.setItem('vzn_cookie_ok', '1');
    cookieBar?.classList.remove('visible');
  });
}
