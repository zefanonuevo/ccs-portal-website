/* Our degree programs: filter and the program pop-up. Reads the data block in programs.html. No dependencies. */
(function () {
  'use strict';
  var data = JSON.parse(document.getElementById('prog-data').textContent);
  var dlg = document.getElementById('pd');
  var body = document.getElementById('pd-body');
  var crumb = document.getElementById('pd-crumb');
  var trigger = null;

  /* ---------- filter ---------- */
  var btns = document.querySelectorAll('.seg button');
  var secs = document.querySelectorAll('section[data-level]');
  Array.prototype.forEach.call(btns, function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-show');
      Array.prototype.forEach.call(btns, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      Array.prototype.forEach.call(secs, function (s) { s.hidden = !(v === 'all' || s.getAttribute('data-level') === v); });
    });
  });

  /* ---------- pop-up ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function list(items) {
    var ul = el('ul', 'pd-list');
    items.forEach(function (t) { ul.appendChild(el('li', null, t)); });
    return ul;
  }
  function section(title, node) {
    var s = el('section', 'pd-sec');
    s.appendChild(el('h3', null, title));
    s.appendChild(node);
    return s;
  }
  function openBtn(id, label, cls) {
    var b = el('button', cls, label);
    b.type = 'button';
    b.addEventListener('click', function () { render(id); });
    return b;
  }

  function render(id) {
    var p = data[id];
    if (!p) return;
    body.textContent = '';
    crumb.textContent = '';
    if (p.parent) {
      crumb.appendChild(openBtn(p.parent, '← ' + data[p.parent].abbr, 'pd-back'));
    } else {
      crumb.textContent = p.level === 'ug' ? 'Undergraduate' : 'Graduate';
    }

    var head = el('div', 'pd-head');
    head.appendChild(el('span', 'abbr', p.abbr));
    var t = el('h2', null, p.name);
    t.id = 'pd-title';
    head.appendChild(t);
    body.appendChild(head);
    body.appendChild(el('p', 'pd-lead', p.lead));

    var facts = [['Length', p.duration], ['Units', p.units]].filter(function (f) { return f[1]; });
    if (facts.length) {
      var dl = el('dl', 'pd-facts');
      facts.forEach(function (f) {
        var d = el('div');
        d.appendChild(el('dt', null, f[0]));
        d.appendChild(el('dd', null, f[1]));
        dl.appendChild(d);
      });
      body.appendChild(dl);
    }

    if (p.majors) {
      var mj = el('div', 'pd-majors');
      p.majors.forEach(function (m) {
        var b = el('button', 'pd-major');
        b.type = 'button';
        b.appendChild(el('b', null, data[m].name.replace(/^.*major in /, '')));
        b.appendChild(el('span', null, data[m].short));
        b.addEventListener('click', function () { render(m); });
        mj.appendChild(b);
      });
      body.appendChild(section('Choose a major', mj));
    }
    if (p.study) body.appendChild(section('What you will study', list(p.study)));
    if (p.careers) body.appendChild(section('Where it can lead', list(p.careers)));
    if (p.admission) body.appendChild(section('Who can apply', list(p.admission)));
    if (p.breakdown) {
      var tb = el('table', 'pd-table');
      p.breakdown.forEach(function (r) {
        var tr = el('tr');
        tr.appendChild(el('td', null, r[0]));
        tr.appendChild(el('td', 'num', String(r[1])));
        tb.appendChild(tr);
      });
      var wrap = el('div');
      wrap.appendChild(tb);
      if (p.nonacad) wrap.appendChild(el('p', 'pd-note', p.nonacad));
      body.appendChild(section('Unit breakdown', wrap));
    }
    if (p.graduate) body.appendChild(section('To graduate', list(p.graduate)));
    if (p.good) body.appendChild(section('Good to know', list(p.good)));
    body.appendChild(el('p', 'pd-foot', 'Summarized from the College’s program pages. Confirm details with the program chair before you apply.'));
    body.scrollTop = 0;
    dlg.scrollTop = 0;
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
  }

  function open(id, from) {
    trigger = from || null;
    render(id);
    if (!dlg.open) dlg.showModal();
    document.getElementById('pd-close').focus();
  }
  function close() { if (dlg.open) dlg.close(); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-open]') : null;
    if (b && !dlg.contains(b)) open(b.getAttribute('data-open'), b);
  });
  document.getElementById('pd-close').addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  dlg.addEventListener('close', function () {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (trigger && trigger.focus) trigger.focus();
  });

  var h = (location.hash || '').slice(1);
  if (h && data[h]) open(h, null);
})();
