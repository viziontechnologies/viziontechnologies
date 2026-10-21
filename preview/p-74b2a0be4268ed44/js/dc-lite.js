/*
 * dc-lite.js — tiny template runtime for the Pride Transport site.
 * Renders the <template id="tpl"> markup with values from the page's
 * Component class, and re-renders when setState() is called.
 *
 * Template syntax:
 *   {{ path }}                          text or attribute value
 *   onClick="{{ fn }}"                   event handler (click / change / input)
 *   <sc-for list="{{ items }}" as="x">   repeat for each item
 *   <sc-if value="{{ flag }}">           show only when flag is true
 */
(function () {
  var app, tpl, inst, handlers = [], pending = false;
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var BOOL = { disabled: 1, checked: 1, readonly: 1, required: 1, hidden: 1, selected: 1 };
  var EVENTS = ['click', 'change', 'input'];

  window.DCLogic = function DCLogic(props) {
    this.props = props || {};
    this.state = {};
  };
  window.DCLogic.prototype.setState = function (patch) {
    var p = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    for (var k in p) this.state[k] = p[k];
    schedule();
  };
  window.DCLogic.prototype.forceUpdate = schedule;

  function schedule() {
    if (pending) return;
    pending = true;
    Promise.resolve().then(function () { pending = false; render(); });
  }

  function look(path, scope) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
    var v = scope;
    var parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }

  function stripHole(s) { var m = (s || '').match(WHOLE); return m ? m[1] : s; }

  function text(str, scope) {
    var m = str.match(WHOLE);
    if (m) { var v = look(m[1], scope); return v == null ? '' : String(v); }
    return str.replace(HOLE, function (_, p) { var v = look(p, scope); return v == null ? '' : String(v); });
  }

  function proc(node, scope, out) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      out.appendChild(document.createTextNode(t.indexOf('{{') >= 0 ? text(t, scope) : t));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    var i;

    if (tag === 'sc-for') {
      var list = look(stripHole(node.getAttribute('list')), scope) || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (item, idx) {
        var s = Object.create(scope);
        s[as] = item;
        s.$index = idx;
        for (i = 0; i < node.childNodes.length; i++) proc(node.childNodes[i], s, out);
      });
      return;
    }
    if (tag === 'sc-if') {
      if (look(stripHole(node.getAttribute('value')), scope)) {
        for (i = 0; i < node.childNodes.length; i++) proc(node.childNodes[i], scope, out);
      }
      return;
    }

    var el = node.cloneNode(false);
    var attrs = Array.prototype.slice.call(node.attributes);
    attrs.forEach(function (a) {
      var name = a.name, val = a.value;
      if (name.indexOf('hint-') === 0) { el.removeAttribute(name); return; }
      if (name.indexOf('on') === 0 && EVENTS.indexOf(name.slice(2)) >= 0) {
        el.removeAttribute(name);
        var fn = look(stripHole(val), scope);
        if (typeof fn === 'function') el.setAttribute('data-on-' + name.slice(2), handlers.push(fn) - 1);
        return;
      }
      if (val.indexOf('{{') < 0) return;
      var m = val.match(WHOLE);
      if (!m) { el.setAttribute(name, text(val, scope)); return; }
      var v = look(m[1], scope);
      if (name === 'value' && /^(select|input|textarea)$/.test(tag)) {
        el.removeAttribute('value');
        el.setAttribute('data-dc-value', v == null ? '' : String(v));
      } else if (BOOL[name]) {
        if (v) el.setAttribute(name, ''); else el.removeAttribute(name);
      } else if (v == null || (v === false && name.indexOf('aria-') !== 0)) {
        el.removeAttribute(name);
      } else {
        el.setAttribute(name, String(v));
      }
    });
    for (i = 0; i < node.childNodes.length; i++) proc(node.childNodes[i], scope, el);
    out.appendChild(el);
  }

  function render() {
    handlers = [];
    var vals = inst.renderVals();
    var next = document.createElement('div');
    var kids = tpl.content.childNodes;
    for (var i = 0; i < kids.length; i++) proc(kids[i], vals, next);
    morphdom(app, next, {
      childrenOnly: true,
      onBeforeElUpdated: function (from, to) {
        // keep what the visitor typed in fields that are not bound to state
        if ((from.tagName === 'INPUT' || from.tagName === 'TEXTAREA') && !to.hasAttribute('data-dc-value')) {
          if (from.type !== 'checkbox' && from.type !== 'radio') to.value = from.value;
        }
        return true;
      }
    });
    var bound = app.querySelectorAll('[data-dc-value]');
    for (var j = 0; j < bound.length; j++) {
      var want = bound[j].getAttribute('data-dc-value');
      if (bound[j].value !== want) bound[j].value = want;
    }
  }

  EVENTS.forEach(function (type) {
    document.addEventListener(type, function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-on-' + type + ']') : null;
      if (!el || !app || !app.contains(el)) return;
      var fn = handlers[+el.getAttribute('data-on-' + type)];
      if (fn) fn(e);
    });
  });

  window.DC = {
    mount: function (Component) {
      app = document.getElementById('app');
      tpl = document.getElementById('tpl');
      inst = new Component({});
      if (!inst.state) inst.state = {};
      render();
      if (inst.componentDidMount) inst.componentDidMount();
    }
  };
})();
