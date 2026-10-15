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
      status: 'Prototype',
      // TODO: replace with the deployed tracker (repo: ccs-task-tracker)
      url: 'https://claude.ai/artifact/GFmMz7eTWijHALrP8HAiL5'
    },
    scgss: {
      name: 'Student Grants',
      system: 'CCS Student Conference Grant Support System',
      blurb: 'Apply, track approval and claim reimbursement.',
      status: 'Mockups',
      // TODO: replace with the deployed system (repo: ccs-scgss)
      url: 'https://claude.ai/artifact/7fnvRV15HkTWLbozYbrgk7'
    },
    design: {
      name: 'CCS Design System',
      system: 'Shared tokens',
      blurb: 'Colors, type, shape and motion shared by every CCS system.',
      status: 'Tokens in this repo',
      url: 'https://claude.ai/artifact/TBm4AVYAoDWUEKCww3mURv'
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
