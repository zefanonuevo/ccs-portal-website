/* Single place to wire the portal to the other CCS systems.
   Swap a url when a module gets its own deployment; nothing else changes. */
window.CCS = {
  name: 'CCS Commons',
  version: 'Draft v1',
  release: '0.13.0',   // single source for the release number shown in the footer; keep in step with CHANGELOG.md
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
    program: ['View', 'View', 'View', 'View', 'Manage'],       // Degree programs (undergraduate and graduate)
    outcomes: ['No', 'View', 'View', 'View', 'Manage'],        // Graduate attributes and outcomes (PEOs, PLOs, PIs)
    flowcharts: ['No', 'View', 'View', 'View', 'Manage'],      // Course flowcharts and checklists
    courses: ['No', 'View', 'View', 'View', 'Manage'],         // Course descriptions
    syllabi: ['No', 'No', 'View', 'View', 'Manage'],           // Course syllabi and syllabi links
    admission: ['View', 'View', 'View', 'View', 'Manage'],     // Application requirements
    graduation: ['View', 'View', 'View', 'View', 'Manage'],    // Graduation requirements
    leadership: ['No', 'View', 'View', 'View', 'Manage'],      // Administrators: administrators, chairs, coordinators (not yet tagged on pages)
    news: ['View', 'View', 'Use', 'Use', 'Manage'],            // News, events, spotlight
    virtual: ['View', 'Use', 'Use', 'Use', 'Manage'],
    grants: ['No', 'Use', 'View', 'No', 'Manage'],
    service: ['No', 'Use', 'Use', 'Manage', 'Manage'],
    research: ['View', 'View', 'Use', 'View', 'Manage'],       // Research and faculty records
    publish: ['No', 'No', 'Use', 'No', 'Manage'],              // Not in the 2026-10-20 table; kept from Blueprint v2
    agreements: ['No', 'No', 'View', 'View', 'Manage'],        // Partnership agreements
    forms: ['No', 'View', 'Use', 'Use', 'Manage'],             // Forms and policies
    dashboards: ['No', 'No', 'No', 'No', 'Manage']             // Statistics dashboards
  }
};
