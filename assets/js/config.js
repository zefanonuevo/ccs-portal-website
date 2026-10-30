/* Single place to wire the portal to the other CCS systems.
   Swap a url when a module gets its own deployment; nothing else changes. */
window.CCS = {
  name: 'CCS Commons',
  version: 'Draft v1',
  release: '0.14.2',   // single source for the release number shown in the footer; keep in step with CHANGELOG.md
  modules: {
    tracker: {
      name: 'Request a Service',
      system: 'CCS Task Tracker',
      blurb: 'Ask the office for help and follow it to completion.',
      status: 'Live',
      repo: 'https://github.com/zefanonuevo/ccs-task-tracker',
      url: 'https://zefanonuevo.github.io/ccs-task-tracker/'
    },
    scgss: {
      name: 'Student Grants',
      system: 'CCS Student Conference Grant Support System',
      blurb: 'Apply, track approval and claim reimbursement.',
      status: 'Live',
      repo: 'https://github.com/zefanonuevo/ccs-scgss',
      url: 'https://zefanonuevo.github.io/ccs-scgss/'
    },
    vo: {
      name: 'Usage Dashboard',
      system: 'CCS Virtual Office Dashboard',
      blurb: 'Who registered, who joined, usage over time.',
      status: 'Live',
      repo: 'https://github.com/zefanonuevo/ccs-vo-dashboard',
      url: 'https://zefanonuevo.github.io/ccs-vo-dashboard/'
    },
    research: {
      name: 'Research Dashboard',
      system: 'CCS Research Dashboard',
      blurb: 'Update data sources and add faculty ranks.',
      status: 'Live',
      url: 'https://zefanonuevo.github.io/ccs/'
    },
    register: {
      name: 'Virtual Office Registration',
      sub: 'CCS Virtual Office waiting room',
      system: 'Google Form',
      blurb: 'Register to receive a queue number and be notified when it is your turn.',
      status: 'Live',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLScxxeeRJRwj0GbZBP6ahK0fUJOmgXz0ASjOI8aDNTrTBWj4QQ/viewform'
    },
    design: {
      name: 'CCS Design System',
      system: 'Shared tokens',
      blurb: 'Colors, type, shape and motion shared by every CCS system.',
      status: 'Shared',
      repo: 'https://github.com/zefanonuevo/ccs-design',
      css: 'https://zefanonuevo.github.io/ccs-design/ccs-tokens.css',
      url: 'https://github.com/zefanonuevo/ccs-design'
    }
  },
  /* Sign-in PROTOTYPE (off by default). With clientId and apiUrl empty, "Sign in" opens SAMPLE accounts only:
     it proves nothing about who someone is and enforces nothing. Real mode is described in prototypes/google-signin/README.md.
     The client ID is public by design; never put a secret here. Sample people are fictional. */
  signin: {
    clientId: '',
    apiUrl: '',
    sample: [
      { name: 'Sample Admin', email: 'admin.sample@example.test', role: 'Admin' },
      { name: 'Sample Faculty', email: 'faculty.sample@example.test', role: 'Faculty' },
      { name: 'Sample Staff', email: 'staff.sample@example.test', role: 'Staff' },
      { name: 'Sample Student', email: 'student.sample@example.test', role: 'Student' },
      { name: 'Not on the list', email: 'unlisted.sample@example.test', role: 'Guest' }
    ]
  },
  /* "Who sees what": owner-supplied table of 2026-10-20 (supersedes Blueprint v2). Order here: guest, student, faculty, staff, admin. */
  roles: ['Guest', 'Student', 'Faculty', 'Staff', 'Admin'],
  access: {
    program: ['View', 'View', 'View', 'View', 'Manage'],
    outcomes: ['No', 'View', 'View', 'View', 'Manage'],
    flowcharts: ['No', 'View', 'View', 'View', 'Manage'],
    courses: ['No', 'View', 'View', 'View', 'Manage'],
    syllabi: ['No', 'No', 'View', 'View', 'Manage'],
    admission: ['View', 'View', 'View', 'View', 'Manage'],
    graduation: ['View', 'View', 'View', 'View', 'Manage'],
    leadership: ['View', 'View', 'View', 'View', 'Manage'],
    service: ['No', 'No', 'Use', 'Use', 'Manage'],
    grants: ['No', 'Use', 'Use', 'Use', 'Manage'],
    virtual: ['Use', 'Use', 'Use', 'Use', 'Manage'],
    vodash: ['No', 'No', 'No', 'View', 'Manage'],
    kb: ['No', 'No', 'Use', 'Use', 'Manage'],
    inventory: ['No', 'No', 'Use', 'Use', 'Manage'],
    forms: ['View', 'Use', 'Use', 'Use', 'Manage'],
    pubhighlights: ['View', 'View', 'View', 'View', 'Manage'],
    pubrecords: ['No', 'No', 'Use', 'Use', 'Manage'],
    publish: ['No', 'No', 'Use', 'Use', 'Manage'],
    projhighlights: ['View', 'View', 'View', 'View', 'Manage'],
    projstatus: ['No', 'No', 'View', 'Use', 'Manage'],
    grantsum: ['No', 'No', 'View', 'Use', 'Manage'],
    centers: ['No', 'View', 'View', 'Use', 'Manage'],
    partnerhl: ['View', 'View', 'View', 'View', 'Manage'],
    partnerdir: ['No', 'No', 'View', 'Use', 'Manage'],
    partnertracker: ['No', 'No', 'Use', 'Use', 'Manage'],
    partnerstart: ['View', 'View', 'Use', 'Use', 'Manage'],
    spotlight: ['View', 'View', 'Use', 'Use', 'Manage'],
    news: ['View', 'View', 'View', 'Use', 'Manage'],
    directory: ['View', 'View', 'Use', 'Use', 'Manage'],
    agreements: ['No', 'No', 'View', 'Use', 'Manage'],
    dashboards: ['No', 'No', 'No', 'No', 'Manage']
    // Source: owner's detailed table (dated 2026-10-20, received 2026-10-28). See docs/PRD.md section 2.1.
    // No row yet (values pending, so no key): curriculum mapping, what you will study, equipment requests, Jubilee Progress.
  }
};
