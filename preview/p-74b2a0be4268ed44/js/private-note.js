/*
 * private-note.js — "private preview" bar shown at the top of every page.
 * Sits outside #app, so dc-lite re-renders never touch it.
 * Dismissal lasts for the browser tab (sessionStorage).
 */
(function () {
  var KEY = 'pt_private_note_closed';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}

  var css = document.createElement('style');
  css.textContent =
    '.pt-private{display:flex;align-items:center;gap:12px;padding:10px 16px;background:#0D1B2A;color:#fff;' +
    'font:500 13.5px/1.5 "Plus Jakarta Sans",system-ui,sans-serif}' +
    '.pt-private-in{flex:1;max-width:1100px;margin:0 auto;display:flex;align-items:flex-start;gap:10px}' +
    '.pt-private-ico{flex:none;font-size:15px;line-height:1.4}' +
    '.pt-private strong{font-weight:700}' +
    '.pt-private button{flex:none;background:transparent;border:1px solid rgba(255,255,255,.35);color:#fff;' +
    'border-radius:999px;width:28px;height:28px;font-size:16px;line-height:1;cursor:pointer}' +
    '.pt-private button:hover{background:rgba(255,255,255,.12)}' +
    '.pt-private button:focus-visible{outline:2px solid #fff;outline-offset:2px}';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'pt-private';
  bar.setAttribute('role', 'note');
  bar.innerHTML =
    '<div class="pt-private-in">' +
      '<span class="pt-private-ico" aria-hidden="true">&#128274;</span>' +
      '<span><strong>Private preview for Pride Transport.</strong> This redesign is not public: it isn\'t linked ' +
      'from any website and is hidden from Google and other search engines. Only people who have this exact link ' +
      'can open it, so please keep it within your team. Prepared by Vizion Technologies.</span>' +
    '</div>' +
    '<button type="button" aria-label="Hide this note">&times;</button>';
  bar.querySelector('button').addEventListener('click', function () {
    bar.remove();
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  });
  document.body.insertBefore(bar, document.body.firstChild);
})();
