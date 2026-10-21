/* Vizion clickable prototypes — tiny screen router shared by every app.
   Markup:
     <section class="scr" id="home" data-tab-of="home">  one screen
     data-go="id"     push a screen          data-back        go back
     data-tab="id"    switch tab (clears the back stack)
     data-toast="…"   show a short message
   Each app may register hooks: Proto.on('screenId', fn) runs when that screen opens. */
(function () {
  const stack = [];
  const hooks = {};
  let toastTimer = 0;

  const screens = () => [...document.querySelectorAll('.scr')];
  const current = () => stack[stack.length - 1];

  function show(id, dir) {
    const next = document.getElementById(id);
    if (!next) return;
    screens().forEach(s => {
      const on = s === next;
      s.classList.toggle('on', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) {
        s.classList.remove('in-fwd', 'in-back');
        void s.offsetWidth;
        if (dir) s.classList.add(dir === 'back' ? 'in-back' : 'in-fwd');
        const body = s.querySelector('.body');
        if (body && dir !== 'back') body.scrollTop = 0;
      }
    });
    const tab = next.dataset.tabOf;
    document.querySelectorAll('[data-tab]').forEach(t => {
      const on = t.dataset.tab === tab;
      t.classList.toggle('active', on);
      if (t.closest('nav')) t.setAttribute('aria-current', on ? 'page' : 'false');
    });
    document.body.dataset.screen = id;
    (hooks[id] || []).forEach(fn => fn(next));
  }

  function go(id) { if (current() === id) return; stack.push(id); show(id, 'fwd'); }
  function back() { if (stack.length > 1) { stack.pop(); show(current(), 'back'); } }
  function tab(id) { stack.length = 0; stack.push(id); show(id); }

  function toast(msg) {
    let t = document.getElementById('proto-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'proto-toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  // Tapping somewhere that does nothing flashes what can be tapped, like a design tool's hotspots.
  function hint() {
    const scr = document.querySelector('.scr.on');
    const nav = document.querySelector('.tabbar, .side');
    [scr, nav].filter(Boolean).forEach(root => {
      root.querySelectorAll('[data-go],[data-back],[data-tab],[data-toast],button,a,input,label,select').forEach(el => {
        el.classList.remove('hot'); void el.offsetWidth; el.classList.add('hot');
      });
    });
  }

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-go],[data-back],[data-tab],[data-toast]');
    if (!el) {
      if (!e.target.closest('button,a,input,label,select,textarea')) hint();
      return;
    }
    if (el.dataset.toast) toast(el.dataset.toast);
    if (el.hasAttribute('data-back')) back();
    else if (el.dataset.tab) tab(el.dataset.tab);
    else if (el.dataset.go) go(el.dataset.go);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const el = e.target.closest('[role="button"][data-go],[role="button"][data-back],[role="button"][data-tab],[role="button"][data-toast]');
      if (el) { e.preventDefault(); el.click(); }
    }
  });

  // Date helpers for "Get it by 23 Oct" style promises.
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function inDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  const money = n => '$' + n.toFixed(2);

  window.Proto = {
    go, back, tab, toast, inDays, money,
    on(id, fn) { (hooks[id] = hooks[id] || []).push(fn); },
    start(id) {
      document.querySelectorAll('[data-go],[data-back],[data-tab],[data-toast]').forEach(el => {
        if (!/^(BUTTON|A|INPUT|LABEL|SELECT)$/.test(el.tagName)) {
          el.setAttribute('role', 'button');
          el.setAttribute('tabindex', '0');
        }
      });
      tab(id);
    },
  };
})();
