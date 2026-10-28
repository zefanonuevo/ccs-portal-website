/* CCS Commons: shared chrome (nav, side menu, search, footer), role preview and reveal. No dependencies. */
(function () {
  'use strict';
  var C = window.CCS;
  var root = document.documentElement;
  root.classList.add('js');

  var AREAS = [
    { href: 'academics.html', label: 'Academics', line: 'Study at CCS' },
    { href: 'services.html', label: 'Services', line: 'Ask, apply, register' },
    { href: 'research.html', label: 'Research', line: 'Discover at CCS' },
    { href: 'partners.html', label: 'Partners', line: 'Work with CCS' },
    { href: 'people.html', label: 'People', line: 'Meet CCS' }
  ];
  var SIDE = [
    { href: 'jubilee.html', label: 'Jubilee Progress', line: 'Approved highlights from every door' },
    { href: 'resources.html#news', label: 'News and updates', line: 'Stories tagged to a door' },
    { href: 'resources.html#events', label: 'Events', line: 'Post and browse events' },
    { href: 'resources.html#forms', label: 'Forms and downloads', line: 'Faculty and staff forms' },
    { href: 'resources.html#policies', label: 'Policies and guidelines', line: 'College policies' },
    { href: 'resources.html#how', label: 'How things work', line: 'Process workflows' }
  ];
  var INDEX = [
    ['Our degree programs', 'Academics: undergraduate and graduate', 'programs.html'],
    ['Undergraduate programs', 'Academics: BS CS, DS, InfoSec, IS, IT, IE', 'programs.html#undergraduate'],
    ['Graduate programs', 'Academics: MSCS, MSDS, MSIT, MIT, MINFSEC, PhD, DIT', 'programs.html#graduate'],
    ['What graduates can do', 'Academics: outcomes', 'academics.html#programs'],
    ['What you will study', 'Academics: courses and units', 'academics.html#programs'],
    ['How to apply', 'Academics: admission', 'academics.html#apply'],
    ['Finishing your degree', 'Academics: graduation', 'academics.html#apply'],
    ['Request a Service', 'Services: Task Tracker', 'services.html#services'],
    ['Student Grants', 'Services: apply, track, reimburse', 'services.html#services'],
    ['Virtual Office', 'Services: register, join Zoom, knowledge base', 'services.html#virtual-office'],
    ['Equipment and inventory', 'Services', 'services.html#more'],
    ['Publication highlights', 'Research', 'research.html#publications'],
    ['Add your publication', 'Research', 'research.html#add'],
    ['Grants summary and project status', 'Research', 'research.html#projects'],
    ['Start a partnership', 'Partners', 'partners.html#start'],
    ['Partner activity tracker', 'Partners', 'partners.html#tracker'],
    ['Agreements (MOA, MOU)', 'Partners', 'partners.html#agreements'],
    ['Spotlight', 'People: awards and recognition', 'people.html#spotlight'],
    ['Faculty and staff directory', 'People', 'people.html#directory'],
    ['Committees', 'People', 'people.html#committees'],
    ['Jubilee Progress', 'Jubilee strategy', 'jubilee.html'],
    ['Strategic goals', 'Jubilee Progress', 'jubilee.html#goals'],
    ['About the College', 'People: vision, mission, recognition', 'about.html'],
    ['Accreditation', 'PAASCU and CHED Center of Excellence', 'about.html#recognition'],
    ['Contact the College office', 'Address and phone', 'about.html#contact'],
    ['Leadership and departments', 'People: Office of the Dean', 'departments.html'],
    ['Department chairs and coordinators', 'Practicum, thesis, graduate studies', 'departments.html#departments'],
    ['Student groups', 'People: SRDP, Peer Tutors, SPRINT', 'people.html#student-groups'],
    ['AdRIC research centers', 'Research: ten centers and labs', 'research.html#research-centers'],
    ['Latest from CCS', 'Recent stories', 'resources.html#news-feed'],
    ['News and updates', 'Across the college', 'resources.html#news'],
    ['Events', 'Across the college', 'resources.html#events'],
    ['Forms and downloads', 'Across the college', 'resources.html#forms'],
    ['Policies and guidelines', 'Across the college', 'resources.html#policies'],
    ['How things work', 'Across the college', 'resources.html#how'],
    ['Connected systems', 'Home', 'index.html#systems']
  ];

  /* Mega menu: sub-menus for each area, built from the area pages' sections and cards. */
  var MEGA = [
    { key: 'academics', href: 'academics.html', label: 'Academics', line: 'Study at CCS, plan your path and finish your degree.', groups: [
      { title: 'Your program', items: [
        { href: 'programs.html', label: 'Our degree programs', line: 'Undergraduate and graduate programs' },
        { href: 'academics.html#outcomes', label: 'What graduates can do', line: 'Graduate attributes and outcomes' },
        { href: 'academics.html#curriculum', label: 'What you will study', line: 'Units and the list of courses' },
        { href: 'academics.html#path', label: 'Your path, term by term', line: 'Course flowcharts for each program' },
        { href: 'academics.html#course-guide', label: 'Course guide', line: 'Course descriptions and syllabi' }
      ] },
      { title: 'Apply and finish', items: [
        { href: 'academics.html#how-to-apply', label: 'How to apply', line: 'Admission steps' },
        { href: 'academics.html#finishing', label: 'Finishing your degree', line: 'Graduation requirements' }
      ] },
      { title: 'Tools', items: [
        { href: 'academics.html#dashboard', label: 'Academic dashboard', line: 'Your progress and records' },
        { href: 'academics.html#behind', label: 'Departments and who to ask', line: 'Chairs and coordinators' }
      ] }
    ] },
    { key: 'services', href: 'services.html', label: 'Services', line: 'Ask, apply, register: everything here is something you do.', groups: [
      { title: 'Ask and apply', items: [
        { href: 'services.html#request-service', label: 'Request a service', line: 'Submit a request and follow it' },
        { href: 'services.html#grants', label: 'Student grants', line: 'Apply, track and claim reimbursement' }
      ] },
      { title: 'Virtual Office', items: [
        { href: 'services.html#register', label: 'Register and join Zoom', line: 'Registration and your queue number' },
        { href: 'services.html#knowledge-base', label: 'Knowledge base and chatbot', line: 'Answers to common questions' },
        { href: 'services.html#usage', label: 'Usage dashboard', line: 'Who registered and who joined' }
      ] },
      { title: 'Equipment and forms', items: [
        { href: 'services.html#equipment', label: 'Equipment and inventory', line: 'Inventory for the college' },
        { href: 'services.html#forms-link', label: 'Forms and downloads', line: 'Faculty and staff forms' }
      ] }
    ] },
    { key: 'research', href: 'research.html', label: 'Research', line: 'Discover at CCS: publications, faculty work and projects.', groups: [
      { title: 'Publications', items: [
        { href: 'research.html#publication-highlights', label: 'Publication highlights', line: 'Recent faculty and student work' },
        { href: 'research.html#faculty-records', label: 'Faculty records', line: 'Research profiles of faculty' },
        { href: 'research.html#add', label: 'Add your publication', line: 'Submit a publication for listing' }
      ] },
      { title: 'Projects', items: [
        { href: 'research.html#project-highlights', label: 'Project highlights', line: 'Current and completed projects' },
        { href: 'research.html#grants-summary', label: 'Grants summary', line: 'Funding across projects' },
        { href: 'research.html#project-status', label: 'Project status', line: 'Progress of active projects' }
      ] },
      { title: 'Research centers', items: [
        { href: 'research.html#research-centers', label: 'AdRIC research centers', line: 'Ten centers and labs' }
      ] }
    ] },
    { key: 'partners', href: 'partners.html', label: 'Partners', line: 'Work with CCS: industry and community partners.', groups: [
      { title: 'Work with us', items: [
        { href: 'partners.html#start', label: 'Start a partnership', line: 'Who to talk to and what CCS offers' },
        { href: 'partners.html#directory', label: 'Partner directory', line: 'Searchable by field and status' },
        { href: 'partners.html#highlights', label: 'Partner highlights', line: 'Stories and results from partner work' }
      ] },
      { title: 'Internal', items: [
        { href: 'partners.html#tracker', label: 'Partner activity tracker', line: 'Engagement activities over time' },
        { href: 'partners.html#agreements', label: 'Agreements', line: 'MOA and MOU, scope and duration' }
      ] }
    ] },
    { key: 'people', href: 'people.html', label: 'People', line: 'Meet CCS: the people and the stories of the college.', groups: [
      { title: 'The College', items: [
        { href: 'about.html', label: 'About the College', line: 'Vision, mission, recognition, contact' },
        { href: 'departments.html', label: 'Leadership and departments', line: 'Dean\'s office, chairs and coordinators' },
        { href: 'people.html#student-groups', label: 'Student groups', line: 'Research program, peer tutors, SPRINT' }
      ] },
      { title: 'People and stories', items: [
        { href: 'people.html#spotlight', label: 'Spotlight', line: 'Awards and recognition' },
        { href: 'people.html#directory', label: 'Faculty and staff directory', line: 'Who is who at CCS' },
        { href: 'people.html#committees', label: 'Committees', line: 'Committee involvement' },
        { href: 'people.html#serving', label: 'Serving the community', line: 'Community engagement' }
      ] }
    ] }
  ];
  /* Links that lead to content governed by an access row. Mirrors the data-access tags on the pages.
     A link is hidden when its row is No for the current role. Keep both in step (see docs/PRD.md section 2.1). */
  var LINK_ACCESS = {
    'What graduates can do': 'outcomes', 'Your path, term by term': 'flowcharts', 'Course guide': 'courses',
    'How to apply': 'admission', 'Finishing your degree': 'graduation',
    'Academic dashboard': 'dashboards', 'Usage dashboard': 'vodash',
    'Departments and who to ask': 'leadership', 'Department chairs and coordinators': 'leadership',
    'Request a Service': 'service', 'Request a service': 'service',
    'Student Grants': 'grants', 'Student grants': 'grants',
    'Virtual Office': 'virtual', 'Register and join Zoom': 'virtual', 'Knowledge base and chatbot': 'kb',
    'Equipment and inventory': 'inventory',
    'Publication highlights': 'pubhighlights', 'Faculty records': 'pubrecords', 'Project highlights': 'projhighlights',
    'Grants summary': 'grantsum', 'Grants summary and project status': 'grantsum', 'Project status': 'projstatus',
    'AdRIC research centers': 'centers', 'Add your publication': 'publish',
    'Partner directory': 'partnerdir', 'Partner highlights': 'partnerhl', 'Start a partnership': 'partnerstart',
    'Agreements': 'agreements', 'Agreements (MOA, MOU)': 'agreements', 'Partner activity tracker': 'partnertracker',
    'Faculty and staff directory': 'directory', 'Spotlight': 'spotlight',
    'Forms and downloads': 'forms', 'Policies and guidelines': 'forms', 'How things work': 'forms',
    'News and updates': 'news', 'Events': 'news', 'Committees': 'news', 'Serving the community': 'news'
  };
  function levelFor(key) { return (C.access[key] || [])[role] || 'View'; }
  function linkHidden(label) { var k = LINK_ACCESS[label]; return !!k && levelFor(k) === 'No'; }
  function accAttr(label) { var k = LINK_ACCESS[label]; return k ? ' data-acc="' + k + '"' : ''; }

  var CHEV = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var ICON = {
    mark: '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1l2.3 8.7L23 12l-8.7 2.3L12 23l-2.3-8.7L1 12l8.7-2.3z"/></svg>',
    search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/></svg>',
    menu: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 6h14M3 14h14"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>'
  };

  var page = (location.pathname.split('/').pop() || 'index.html');
  var role = 0;
  try { role = Math.min(4, Math.max(0, parseInt(localStorage.getItem('ccs-role') || '0', 10) || 0)); } catch (e) {}
  /* Sign-in prototype session (tab only). When present it sets the role and the preview switch is locked. */
  var session = null;
  try { session = JSON.parse(sessionStorage.getItem('ccs-session')); } catch (e) {}
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function roleIndex(name) {
    var i = C.roles.map(function (r) { return r.toLowerCase(); }).indexOf(String(name || '').toLowerCase());
    return i < 0 ? 0 : i;
  }
  if (session) role = roleIndex(session.role);

  function roleSelect(id) {
    return '<label style="display:contents"><span class="sr">Preview the portal as</span>' +
      '<select class="role-select" id="' + id + '" aria-label="Preview the portal as"' + (session ? ' disabled title="Your role comes from signing in"' : '') + '>' +
      C.roles.map(function (r, i) { return '<option value="' + i + '"' + (i === role ? ' selected' : '') + '>' + (session ? 'Signed in as ' : 'Viewing as ') + r + '</option>'; }).join('') +
      '</select></label>';
  }

  function megaItem(m) {
    var id = 'mega-' + m.key;
    return '<div class="mega-item" data-key="' + m.key + '">' +
      '<button type="button" class="mega-trigger' + (m.href === page ? ' is-current' : '') + '" aria-expanded="false" aria-controls="' + id + '">' + m.label + CHEV + '</button>' +
      '<div class="mega-panel" id="' + id + '" hidden><div class="wrap">' +
      '<div class="mega-head"><div><p class="mega-title">' + m.label + '</p><p>' + m.line + '</p></div>' +
      '<a href="' + m.href + '">Open ' + m.label + ' &rarr;</a></div>' +
      '<div class="mega-cols">' + m.groups.map(function (g) {
        return '<div class="mega-col"><p class="mega-group">' + g.title + '</p>' + g.items.map(function (it) {
          return '<a href="' + it.href + '"' + accAttr(it.label) + '><b>' + it.label + '</b><span>' + it.line + '</span></a>';
        }).join('') + '</div>';
      }).join('') + '</div>' +
      '<div class="mega-strip"><span class="mega-group">Across the college</span>' +
      SIDE.map(function (s) { return '<a href="' + s.href + '"' + accAttr(s.label) + '>' + s.label + '</a>'; }).join('') +
      '</div></div></div></div>';
  }

  /* ---------- chrome ---------- */
  var header = document.createElement('header');
  header.className = 'nav';
  header.innerHTML =
    '<div class="wrap">' +
    '<a class="brand" href="index.html" aria-label="' + C.name + ' home">' + ICON.mark + '<span>' + C.name + '</span></a>' +
    '<span class="tag">' + C.version + '</span>' +
    '<nav class="nav-links" aria-label="Doors">' + MEGA.map(megaItem).join('') + '</nav>' +
    '<div class="nav-tools">' +
    roleSelect('role-top') +
    '<button class="icon-btn" id="open-search" aria-label="Search (press /)">' + ICON.search + '</button>' +
    '<button class="icon-btn" id="open-menu" aria-label="Open menu" aria-expanded="false" aria-controls="sheet">' + ICON.menu + '</button>' +
    (session ? '<span class="nav-who">' + esc(session.name || session.email) + '</span>' : '') +
    '<button class="btn small nav-signin" id="signin-btn" type="button">' + (session ? 'Sign out' : 'Sign in') + '</button>' +
    '</div></div>';

  var sheet = document.createElement('div');
  sheet.innerHTML =
    '<div class="scrim" id="scrim"></div>' +
    '<aside class="sheet" id="sheet" aria-label="Menu" aria-hidden="true">' +
    '<div class="sheet-head"><b>Menu</b><button class="icon-btn" id="close-menu" aria-label="Close menu">' + ICON.close + '</button></div>' +
    '<nav aria-label="Menu"><div class="group">Doors</div>' +
    AREAS.map(function (a) { return '<a href="' + a.href + '"><b>' + a.label + '</b><span>' + a.line + '</span></a>'; }).join('') +
    '<div class="group">Across the college</div>' +
    SIDE.map(function (a) { return '<a href="' + a.href + '"' + accAttr(a.label) + '><b>' + a.label + '</b><span>' + a.line + '</span></a>'; }).join('') +
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
    '<p style="margin-top:12px;max-width:34ch">A central hub for the College of Computer Studies, built around the Jubilee strategy.</p>' +
    '<p style="margin-top:12px;max-width:34ch">10th Floor, Br. Andrew Gonzalez Hall, 2401 Taft Avenue, Manila<br>(632) 8524-4611 loc. 300</p></div>' +
    '<div><h4>Doors</h4>' + AREAS.map(function (a) { return '<a href="' + a.href + '">' + a.label + '</a>'; }).join('') + '</div>' +
    '<div><h4>Across the college</h4>' + SIDE.map(function (a) { return '<a href="' + a.href + '"' + accAttr(a.label) + '>' + a.label + '</a>'; }).join('') + '</div>' +
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

  /* ---------- decorative dot field (assets/js/dots.js), loaded after the page is usable ---------- */
  var dots = document.createElement('script');
  dots.src = 'assets/js/dots.js?v=' + C.release;
  dots.defer = true;
  document.head.appendChild(dots);

  /* ---------- mega menu ---------- */
  var megaItems = header.querySelectorAll('.mega-item');
  var canHover = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  function setMega(item, open) {
    item.querySelector('.mega-panel').hidden = !open;
    item.querySelector('.mega-trigger').setAttribute('aria-expanded', String(open));
    item.classList.toggle('is-open', open);
  }
  function closeMega(except) {
    megaItems.forEach(function (item) { if (item !== except && item.classList.contains('is-open')) { setMega(item, false); } });
  }
  megaItems.forEach(function (item) {
    var btn = item.querySelector('.mega-trigger');
    btn.addEventListener('click', function () {
      var open = canHover || btn.getAttribute('aria-expanded') !== 'true';
      closeMega(item);
      setMega(item, open);
    });
    if (canHover) {
      var closeTimer;
      item.addEventListener('mouseenter', function () { clearTimeout(closeTimer); closeMega(item); setMega(item, true); });
      item.addEventListener('mouseleave', function () { closeTimer = setTimeout(function () { setMega(item, false); }, 200); });
    }
    item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) { setMega(item, false); } });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.mega-item')) { closeMega(null); } });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    megaItems.forEach(function (item) {
      if (item.classList.contains('is-open')) { setMega(item, false); item.querySelector('.mega-trigger').focus(); }
    });
  });

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
    shown = INDEX.filter(function (r) { return !linkHidden(r[0]) && (!term || (r[0] + ' ' + r[1]).toLowerCase().indexOf(term) > -1); }).slice(0, 8);
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
  var CONTAINERS = '.grid, .two, .quick, .bento, .mega-col';
  function applyRole() {
    var hiddenCount = 0;
    /* 1. tagged content: hide when the row is No, otherwise show a badge */
    Array.prototype.forEach.call(document.querySelectorAll('[data-access]'), function (el) {
      var lvl = levelFor(el.getAttribute('data-access'));
      var chip = el.querySelector('.access-chip');
      if (lvl === 'No') {
        el.hidden = true; hiddenCount++;
        if (chip) { chip.remove(); }
        return;
      }
      el.hidden = false;
      if (el.tagName === 'SECTION') { return; }
      if (!chip) { chip = document.createElement('span'); el.appendChild(chip); }
      chip.className = 'chip access-chip';
      chip.textContent = TEXT[lvl];
    });
    /* 2. menu, search and footer links */
    Array.prototype.forEach.call(document.querySelectorAll('[data-acc]'), function (a) {
      a.hidden = levelFor(a.getAttribute('data-acc')) === 'No';
    });
    /* 3. groups that lost all their items */
    Array.prototype.forEach.call(document.querySelectorAll(CONTAINERS), function (c) {
      var kids = Array.prototype.slice.call(c.children).filter(function (k) { return k.tagName !== 'P'; });
      var gated = kids.some(function (k) { return k.hasAttribute('data-access') || k.hasAttribute('data-acc'); });
      var anyShown = kids.some(function (k) { return !k.hidden; });
      if (gated && !anyShown) { c.hidden = true; c.setAttribute('data-noaccess-empty', ''); }
      else if (c.hasAttribute('data-noaccess-empty')) { c.hidden = false; c.removeAttribute('data-noaccess-empty'); }
    });
    /* 4. page sections left with nothing to show (their heading goes too) */
    Array.prototype.forEach.call(document.querySelectorAll('main section.block'), function (sec) {
      var wrap = sec.querySelector('.wrap') || sec;
      var hasGated = sec.querySelector('[data-access]');
      var anyShown = Array.prototype.some.call(wrap.children, function (k) { return !k.hidden && !k.classList.contains('sec-head'); });
      if (hasGated && !anyShown) { sec.hidden = true; sec.setAttribute('data-noaccess-empty', ''); }
      else if (sec.hasAttribute('data-noaccess-empty')) { sec.hidden = false; sec.removeAttribute('data-noaccess-empty'); }
    });
    /* 5. one quiet line, so people know something is hidden and why */
    var main = document.querySelector('main'), note = document.getElementById('access-note');
    if (main && hiddenCount) {
      if (!note) {
        note = document.createElement('div'); note.id = 'access-note'; note.className = 'wrap';
        note.innerHTML = '<p class="note"></p>'; main.appendChild(note);
      }
      note.querySelector('p').textContent = role === 0
        ? 'Some items are hidden because they need you to sign in. Use Sign in, or the Viewing as menu, to see what your role can open.'
        : 'Some items are hidden because they are not available to your role (' + C.roles[role] + ').';
      note.hidden = false;
    } else if (note) { note.hidden = true; }
  }
  function setRole(v) {
    role = v;
    try { localStorage.setItem('ccs-role', String(v)); } catch (e) {}
    document.getElementById('role-top').value = v; document.getElementById('role-sheet').value = v;
    applyRole();
  }
  ['role-top', 'role-sheet'].forEach(function (id) { document.getElementById(id).addEventListener('change', function (e) { setRole(parseInt(e.target.value, 10)); }); });
  applyRole();

  /* ---------- sign-in PROTOTYPE: sample accounts, or Google plus the Apps Script backend when configured ---------- */
  (function () {
    var S = C.signin || {};
    var real = !!(S.clientId && S.apiUrl);
    var btn = document.getElementById('signin-btn');
    if (!btn) return;
    function saveSession(o) {
      try { sessionStorage.setItem('ccs-session', JSON.stringify(o)); } catch (e) {}
      location.reload();
    }
    if (session) {
      btn.addEventListener('click', function () {
        try { sessionStorage.removeItem('ccs-session'); } catch (e) {}
        try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) {}
        location.reload();
      });
      return;
    }
    var d = document.createElement('dialog');
    d.className = 'signin-dialog';
    d.setAttribute('aria-labelledby', 'si-title');
    d.innerHTML =
      '<form method="dialog" class="si-head"><h2 id="si-title">Sign in</h2><button class="icon-btn" aria-label="Close sign-in">' + ICON.close + '</button></form>' +
      '<div class="si-body" id="si-body"></div>';
    document.body.appendChild(d);
    var body = d.querySelector('#si-body');
    function fail(msg) { var e = body.querySelector('.si-error') || body.insertAdjacentElement('afterbegin', document.createElement('p')); e.className = 'si-error'; e.setAttribute('role', 'alert'); e.textContent = msg; }
    function sampleView() {
      body.innerHTML =
        '<p class="fine">Prototype. These are <b>sample accounts</b> to show how each role sees the portal. Nothing is checked and nothing is protected.</p>' +
        '<form id="si-form"><fieldset class="si-list"><legend class="sr">Choose a sample account</legend>' +
        (S.sample || []).map(function (u, i) {
          return '<label class="si-option"><input type="radio" name="si" value="' + i + '"' + (i === 0 ? ' checked' : '') + '><span><b>' + esc(u.name) + '</b> <em>Sample</em><br><small>Becomes ' + esc(u.role) + '</small></span></label>';
        }).join('') + '</fieldset><button class="btn" type="submit">Continue</button></form>';
      body.querySelector('#si-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var u = S.sample[parseInt(e.target.si.value, 10)];
        saveSession({ name: u.name, email: u.email, role: u.role, mode: 'sample' });
      });
    }
    function realView() {
      body.innerHTML = '<p class="fine">Use your DLSU Google account. Your role comes from the CCS user list.</p><div id="si-g"></div>';
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onerror = function () { fail('Could not load Google sign-in. Check your connection.'); };
      s.onload = function () {
        google.accounts.id.initialize({ client_id: S.clientId, callback: function (r) {
          fetch(S.apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'login', idToken: r.credential }) })
            .then(function (x) { return x.json(); })
            .then(function (o) { if (!o.ok) throw new Error(o.error || 'Sign-in was refused'); saveSession({ name: o.name, email: o.email, role: o.role, mode: 'google' }); })
            .catch(function (err) { fail(err.message); });
        } });
        google.accounts.id.renderButton(body.querySelector('#si-g'), { theme: 'outline', size: 'large', width: 280 });
      };
      document.head.appendChild(s);
    }
    btn.addEventListener('click', function () {
      if (!body.firstChild) (real ? realView : sampleView)();
      d.showModal();
    });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  })();

  /* ---------- scroll reveal ---------- */
  var els = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  } else { Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); }); }
})();
