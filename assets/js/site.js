/* CCS Compass: shared chrome (nav, side menu, search, footer), role preview and reveal. No dependencies. */
(function () {
  'use strict';
  var C = window.CCS;
  var root = document.documentElement;
  root.classList.add('js');

  var AREAS = [
    { href: 'academics.html', label: 'Academics', line: 'Study at CCS' },
    { href: 'community.html', label: 'Community', line: 'Belong at CCS' },
    { href: 'partnerships.html', label: 'Partnerships', line: 'Collaborate with CCS' },
    { href: 'research.html', label: 'Research & Innovation', line: 'Discover at CCS' }
  ];
  var SIDE = [
    { href: 'resources.html#news', label: 'News and updates', line: 'Stories tagged to an area' },
    { href: 'resources.html#events', label: 'Events', line: 'Post and browse events' },
    { href: 'resources.html#forms', label: 'Forms and downloads', line: 'Faculty and staff forms' },
    { href: 'resources.html#policies', label: 'Policies and guidelines', line: 'College policies' },
    { href: 'resources.html#how', label: 'How things work', line: 'Process workflows' }
  ];
  var INDEX = [
    ['Our degree programs', 'Academics', 'academics.html#programs'],
    ['What graduates can do', 'Academics: outcomes', 'academics.html#programs'],
    ['What you will study', 'Academics: courses and units', 'academics.html#programs'],
    ['How to apply', 'Academics: admission', 'academics.html#apply'],
    ['Finishing your degree', 'Academics: graduation', 'academics.html#apply'],
    ['Spotlight', 'Community: awards and recognition', 'community.html#spotlight'],
    ['Virtual Office', 'Community: register, join Zoom, knowledge base', 'community.html#virtual-office'],
    ['Student Grants', 'Community: apply, track, reimburse', 'community.html#services'],
    ['Request a Service', 'Community: Task Tracker', 'community.html#services'],
    ['Partner activity tracker', 'Partnerships', 'partnerships.html#tracker'],
    ['Agreements (MOA, MOU)', 'Partnerships', 'partnerships.html#agreements'],
    ['Publication highlights', 'Research & Innovation', 'research.html#publications'],
    ['Add your publication', 'Research & Innovation', 'research.html#add'],
    ['Grants summary and project status', 'Research & Innovation', 'research.html#projects'],
    ['News and updates', 'Side menu', 'resources.html#news'],
    ['Events', 'Side menu', 'resources.html#events'],
    ['Forms and downloads', 'Side menu', 'resources.html#forms'],
    ['Policies and guidelines', 'Side menu', 'resources.html#policies'],
    ['How things work', 'Side menu', 'resources.html#how'],
    ['Jubilee strategy', 'Home', 'index.html#jubilee'],
    ['Connected systems', 'Home', 'index.html#systems']
  ];

  var ICON = {
    mark: '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1l2.3 8.7L23 12l-8.7 2.3L12 23l-2.3-8.7L1 12l8.7-2.3z"/></svg>',
    search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/></svg>',
    menu: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 6h14M3 14h14"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>'
  };

  var page = (location.pathname.split('/').pop() || 'index.html');
  var role = 0;
  try { role = Math.min(4, Math.max(0, parseInt(localStorage.getItem('ccs-role') || '0', 10) || 0)); } catch (e) {}

  function roleSelect(id) {
    return '<label style="display:contents"><span class="sr">Preview the portal as</span>' +
      '<select class="role-select" id="' + id + '" aria-label="Preview the portal as">' +
      C.roles.map(function (r, i) { return '<option value="' + i + '"' + (i === role ? ' selected' : '') + '>Viewing as ' + r + '</option>'; }).join('') +
      '</select></label>';
  }

  /* ---------- chrome ---------- */
  var header = document.createElement('header');
  header.className = 'nav';
  header.innerHTML =
    '<div class="wrap">' +
    '<a class="brand" href="index.html" aria-label="' + C.name + ' home">' + ICON.mark + '<span>' + C.name + '</span></a>' +
    '<span class="tag">' + C.version + '</span>' +
    '<nav class="nav-links" aria-label="Areas">' +
    AREAS.map(function (a) { return '<a href="' + a.href + '"' + (a.href === page ? ' aria-current="page"' : '') + '>' + a.label + '</a>'; }).join('') +
    '</nav>' +
    '<div class="nav-tools">' +
    roleSelect('role-top') +
    '<button class="icon-btn" id="open-search" aria-label="Search (press /)">' + ICON.search + '</button>' +
    '<button class="icon-btn" id="open-menu" aria-label="Open menu" aria-expanded="false" aria-controls="sheet">' + ICON.menu + '</button>' +
    '<button class="btn small nav-signin" disabled title="Sign-in arrives with the roles build (blueprint step 2)">Sign in</button>' +
    '</div></div>';

  var sheet = document.createElement('div');
  sheet.innerHTML =
    '<div class="scrim" id="scrim"></div>' +
    '<aside class="sheet" id="sheet" aria-label="Menu" aria-hidden="true">' +
    '<div class="sheet-head"><b>Menu</b><button class="icon-btn" id="close-menu" aria-label="Close menu">' + ICON.close + '</button></div>' +
    '<nav aria-label="Menu"><div class="group">Areas</div>' +
    AREAS.map(function (a) { return '<a href="' + a.href + '"><b>' + a.label + '</b><span>' + a.line + '</span></a>'; }).join('') +
    '<div class="group">Across the college</div>' +
    SIDE.map(function (a) { return '<a href="' + a.href + '"><b>' + a.label + '</b><span>' + a.line + '</span></a>'; }).join('') +
    '</nav><div class="role-row"><span>Preview access</span>' + roleSelect('role-sheet') + '</div></aside>';

  var dlg = document.createElement('dialog');
  dlg.className = 'search';
  dlg.setAttribute('aria-label', 'Search the portal');
  dlg.innerHTML = '<input id="q" type="search" placeholder="Search pages, forms, services" autocomplete="off" aria-label="Search"><ul id="results" role="listbox"></ul>';

  var foot = document.createElement('footer');
  foot.className = 'foot';
  var mods = C.modules;
  foot.innerHTML =
    '<div class="wrap"><div><a class="brand" href="index.html">' + ICON.mark + '<span>' + C.name + '</span></a>' +
    '<p style="margin-top:12px;max-width:34ch">A central hub for the College of Computer Studies, built around the Jubilee strategy.</p></div>' +
    '<div><h4>Areas</h4>' + AREAS.map(function (a) { return '<a href="' + a.href + '">' + a.label + '</a>'; }).join('') + '</div>' +
    '<div><h4>Across the college</h4>' + SIDE.map(function (a) { return '<a href="' + a.href + '">' + a.label + '</a>'; }).join('') + '</div>' +
    '<div><h4>Systems</h4><a href="' + mods.tracker.url + '" target="_blank" rel="noopener">' + mods.tracker.name + '</a>' +
    '<a href="' + mods.scgss.url + '" target="_blank" rel="noopener">' + mods.scgss.name + '</a>' +
    '<a href="' + mods.design.url + '" target="_blank" rel="noopener">Design system</a>' +
    '<a href="' + mods.tracker.repo + '" target="_blank" rel="noopener">Task Tracker on GitHub</a>' +
    '<a href="' + mods.scgss.repo + '" target="_blank" rel="noopener">Grant Support on GitHub</a></div>' +
    '<p class="fine">' + C.name + ' ' + C.version + ' \u00B7 release v' + C.release + ' \u00B7 <a href="https://github.com/zefanonuevo/ccs-portal-website/blob/main/CHANGELOG.md" target="_blank" rel="noopener">Version history</a>. Draft for review: sample content is marked, access shown here is a preview and is not enforced until sign-in is built.</p></div>';

  var main = document.querySelector('main');
  if (main) { main.id = main.id || 'main'; }
  var skip = document.createElement('a');
  skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
  document.body.prepend(skip);
  skip.after(header);
  document.body.append(sheet, dlg, foot);

  /* ---------- side menu ---------- */
  var btnMenu = document.getElementById('open-menu');
  var sheetEl = document.getElementById('sheet');
  function setMenu(open) {
    document.body.classList.toggle('sheet-open', open);
    sheetEl.setAttribute('aria-hidden', String(!open));
    btnMenu.setAttribute('aria-expanded', String(open));
    if (open) { document.getElementById('close-menu').focus(); } else if (document.activeElement && sheetEl.contains(document.activeElement)) { btnMenu.focus(); }
  }
  btnMenu.addEventListener('click', function () { setMenu(true); });
  document.getElementById('close-menu').addEventListener('click', function () { setMenu(false); });
  document.getElementById('scrim').addEventListener('click', function () { setMenu(false); });
  sheetEl.addEventListener('click', function (e) { if (e.target.closest('a[href]')) setMenu(false); });

  /* ---------- search ---------- */
  var input = dlg.querySelector('#q'), list = dlg.querySelector('#results'), sel = 0, shown = [];
  function render() {
    var term = input.value.trim().toLowerCase();
    shown = INDEX.filter(function (r) { return !term || (r[0] + ' ' + r[1]).toLowerCase().indexOf(term) > -1; }).slice(0, 8);
    sel = 0;
    list.innerHTML = shown.length
      ? shown.map(function (r, i) { return '<li><a role="option" href="' + r[2] + '" aria-selected="' + (i === 0) + '">' + r[0] + '<span>' + r[1] + '</span></a></li>'; }).join('')
      : '<li class="none">Nothing matches. Try a service, a form, or an area name.</li>';
  }
  function openSearch() { if (!dlg.open) { dlg.showModal(); } input.value = ''; render(); input.focus(); }
  document.getElementById('open-search').addEventListener('click', openSearch);
  Array.prototype.forEach.call(document.querySelectorAll('[data-open-search]'), function (b) { b.addEventListener('click', openSearch); });
  input.addEventListener('input', render);
  dlg.addEventListener('keydown', function (e) {
    var items = list.querySelectorAll('a'); if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (a, i) { a.setAttribute('aria-selected', String(i === sel)); });
    } else if (e.key === 'Enter') { e.preventDefault(); location.href = items[sel].getAttribute('href'); }
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.addEventListener('keydown', function (e) {
    var t = e.target && e.target.tagName;
    if (e.key === '/' && t !== 'INPUT' && t !== 'SELECT' && t !== 'TEXTAREA' && !dlg.open) { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape' && document.body.classList.contains('sheet-open')) setMenu(false);
  });

  /* ---------- modules: data-module="tracker" fills href and target ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-module]'), function (a) {
    var m = C.modules[a.getAttribute('data-module')]; if (!m) return;
    a.href = m.url; a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------- pop-up form: data-popup="register" opens that module's Google Form in a dialog ----------
     The link keeps the form address as its href, so Ctrl/Cmd-click, middle-click, or no JavaScript opens it in a new tab. */
  var formDlg = null, formKey = null, formTrigger = null;
  function buildFormDialog() {
    var d = document.createElement('dialog');
    d.className = 'form-dialog';
    d.setAttribute('aria-labelledby', 'fd-title');
    d.innerHTML = '<div class="fd-bar">' + ICON.mark +
      '<div class="fd-head"><strong id="fd-title"></strong><span class="fd-sub"></span></div>' +
      '<button type="button" class="fd-close" aria-label="Close">\u00D7</button></div>' +
      '<ol class="fd-steps"><li><b>1</b>Fill in the form</li><li><b>2</b>Get your queue number</li><li><b>3</b>Join Zoom when called</li></ol>' +
      '<div class="fd-body"><iframe loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' +
      '<p class="fd-foot">Form not showing? <a class="fd-new" target="_blank" rel="noopener">Open it in a new tab \u2197</a></p>';
    d.querySelector('.fd-close').addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { if (formTrigger) formTrigger.focus({ preventScroll: true }); });   // back to the card, for keyboard users
    document.body.appendChild(d);
    return d;
  }
  function openForm(key) {
    var m = C.modules[key]; if (!m || typeof HTMLDialogElement === 'undefined') return false;
    if (!formDlg) formDlg = buildFormDialog();
    var frame = formDlg.querySelector('iframe');
    formDlg.querySelector('#fd-title').textContent = m.name;
    formDlg.querySelector('.fd-sub').textContent = m.sub || '';
    Array.prototype.forEach.call(formDlg.querySelectorAll('.fd-new'), function (l) { l.href = m.url; });
    frame.title = m.name + ' form';
    if (formKey !== key) { frame.src = m.url + (m.url.indexOf('?') < 0 ? '?' : '&') + 'embedded=true'; formKey = key; }   // loads once, kept if closed by accident
    formDlg.showModal();
    formDlg.querySelector('.fd-close').focus();
    return true;
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-popup]'), function (a) {
    var m = C.modules[a.getAttribute('data-popup')]; if (!m) return;
    a.href = m.url; a.target = '_blank'; a.rel = 'noopener';
    a.addEventListener('click', function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // let the browser open a new tab
      formTrigger = a;
      if (openForm(a.getAttribute('data-popup'))) e.preventDefault();
    });
  });

  /* ---------- role preview: data-access="grants" adds a badge ---------- */
  var TEXT = { View: 'You can view', Use: 'You can use', Manage: 'You can manage' };
  function applyRole() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-access]'), function (el) {
      var lvl = (C.access[el.getAttribute('data-access')] || [])[role] || 'View';
      var chip = el.querySelector('.access-chip');
      if (!chip) { chip = document.createElement('span'); el.appendChild(chip); }
      chip.className = 'chip access-chip' + (lvl === 'No' ? ' no' : '');
      chip.textContent = lvl === 'No' ? (role === 0 ? 'Sign in required' : 'Not available for your role') : TEXT[lvl];
    });
  }
  function setRole(v) {
    role = v;
    try { localStorage.setItem('ccs-role', String(v)); } catch (e) {}
    document.getElementById('role-top').value = v; document.getElementById('role-sheet').value = v;
    applyRole();
  }
  ['role-top', 'role-sheet'].forEach(function (id) { document.getElementById(id).addEventListener('change', function (e) { setRole(parseInt(e.target.value, 10)); }); });
  applyRole();

  /* ---------- scroll reveal ---------- */
  var els = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  } else { Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); }); }
})();
