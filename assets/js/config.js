/* Single place to wire the portal to the other CCS systems.
   Swap a url when a module gets its own deployment; nothing else changes. */
window.CCS = {
  name: 'CCS Compass',
  version: 'Draft v1',
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
    register: {
      name: 'Virtual Office Registration',
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
  /* Blueprint v2, "Who sees what". Order: guest, student, faculty, staff, admin. */
  roles: ['Guest', 'Student', 'Faculty', 'Staff', 'Admin'],
  access: {
    program: ['View', 'View', 'View', 'View', 'Manage'],
    syllabi: ['No', 'View', 'View', 'View', 'Manage'],
    news: ['View', 'View', 'Use', 'Use', 'Manage'],
    virtual: ['View', 'Use', 'Use', 'Use', 'Manage'],
    grants: ['No', 'Use', 'View', 'No', 'Manage'],
    service: ['No', 'Use', 'Use', 'Manage', 'Manage'],
    research: ['View', 'View', 'Use', 'View', 'Manage'],
    publish: ['No', 'No', 'Use', 'No', 'Manage'],
    agreements: ['No', 'No', 'View', 'View', 'Manage'],
    forms: ['No', 'View', 'Use', 'Use', 'Manage'],
    dashboards: ['No', 'No', 'No', 'No', 'Manage']
  }
};
