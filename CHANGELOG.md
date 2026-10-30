# Changelog

Every release is a git tag, so any of them can be opened, downloaded or restored.
See [Versions and restoring](README.md#versions-and-restoring).

The release number shown in the footer of every page comes from `release` in
`assets/js/config.js`. Change it together with this file when you cut a new release.
(`version: 'Draft v1'` is the draft stage of the whole site, not the release number.)

## 0.14.2 - Production look: preview switch, hidden-items note and Draft v1 removed (2026-10-30)
- **The "Viewing as" preview switch is removed** (top bar and side menu), and so is the note "Some items are hidden because...", on every page.
  Signed out, a visitor is a Guest. Signed in, the role comes from the server. The header shows the signed-in name and role.
- **"Draft v1" is removed** from the top bar and from the footer, so the site looks like production while parts are still being fixed.
  The footer still says that sample content is marked. `version` in `config.js` is kept but no longer shown.
- Release number raised to 0.14.2 so cached copies are replaced. Not tagged.

## 0.14.1 - Home page: Connected systems section removed (2026-10-30)
- **The "Connected systems" section is removed from the home page**, at the owner's request, together with its search entry. The Task Tracker and Student Grants
  are still linked from the home quick actions and from Services. The card linking to the shared design system is gone from the home page.
  Release number raised to 0.14.1 so cached copies of `site.js` and the pages are replaced. Not tagged.

## 0.14.0 - Sign-in server and release number (2026-10-30)
- **Release number raised from 0.13.0 to 0.14.0** so browsers and Cloudflare fetch the new `config.js` and `site.js`. The CCS domain is behind Cloudflare,
  which kept serving the old 0.13.0 copies (a 7-day cache) and so kept showing the sample sign-in instead of Google sign-in.
  The 0.14.0 section also covers the changes listed below that were on `main` as Unreleased (2026-10-20). Not tagged: tag only when the owner asks.
- **Server for the CCS VM (Proposed, branch `google-auth-server`).** New `server/` folder: a Node.js and Express server that verifies Google sign-in
  (DLSU accounts only), keeps roles, sessions and an audit log in SQLite, and refuses files under `protected/` unless a rule allows the role.
  Only the pages and `assets/` are public. `site.js` in server mode asks the server who is signed in (`/api/me`) and signs out on the server.
  Tested with a stubbed Google check only (13 tests); **not** run on the VM or against real Google. Setup: `server/README.md`.
  `.gitignore` now also ignores `server/data/` and database files.
- **Real visitor addresses behind Cloudflare (Proposed).** `server/deploy/cloudflare-remoteip.sh` builds an Apache `mod_remoteip` config from Cloudflare's published ranges, so
  the sign-in rate limit and audit log see each visitor's address instead of Cloudflare's. Tested only with sample lists. Steps: `server/README.md`.
- **The first door is named Academics again** (line: "Study at CCS"), at the owner's request. `academics.html` is the page; the old
  `study.html` address now redirects to it. Menu, search, home page and links follow. This reverses the Study name from Blueprint 1.2.
- **Access matrix updated** to the owner's table of 2026-10-20: finer rows for outcomes, flowcharts, course descriptions, syllabi (students: No),
  application and graduation requirements, and administrators (guests: View). The Course guide card is split into Course guide and Course syllabi.
  Rows for content the table does not yet cover are listed in `docs/PRD.md` with values left to be decided.
- **Content that is No for the chosen role is now hidden** (cards, quick actions, tiles), together with the matching menu, side-menu, search and footer links,
  any group or section left empty, and a short note saying items are hidden and why. Guests, who see the least, can use Sign in or the Viewing as menu to see more.
  This is a preview in the browser only: the hidden content is still in the page source, so it is **not** protection (see docs/PRD.md section 2.1 and Architecture.md W7).
- **Access matrix replaced by the owner's detailed table** (grouped by door; 31 keys). Examples: Students can no longer open Request a Service; Staff and Faculty can use Student
  Grants; Guests can register for the Virtual Office and see Forms; Staff can view the Virtual Office dashboard. Pages and menu links follow the new keys. See docs/PRD.md section 2.1.
- Documentation set added: `AGENTS.md` and `docs/` (PRD, Architecture, Module-Specifications, Implementation-Plan, DESIGN as the UI/UX guidelines).

## 0.13.0 - Sign-in prototype (2026-10-19, branch google-signin-prototype)
- **Proposed, not for `main` until approved.** The "Sign in" button now opens a pop-up. By default it offers
  **sample accounts** (fictional) so reviewers can see each role. Nothing is checked and nothing is protected.
- When `signin.clientId` and `signin.apiUrl` are set in `assets/js/config.js`, the pop-up uses Google sign-in
  and a Google Apps Script backend that checks the token and reads a Users sheet. Setup and gaps:
  `prototypes/google-signin/README.md`. Real mode has not been run against Google.
- Signed in, the "Viewing as" switch is locked to the signed-in role. Signed out, it is still a preview.
- Needs decisions before merge: Google script loaded from `accounts.google.com` (rule 1), who owns the user
  list (D5), guest rights (D7), DLSU IT and data privacy approval.

## 0.12.0 - Interactive dot background (2026-10-18)
- A quiet grid of dots sits behind every page. Near the pointer the dots part, light up in the accent
  color and settle back on a spring when the pointer moves on.
- Mouse and pen only. Touch screens and people who prefer reduced motion get a still grid. It never
  blocks a click, and it follows light and dark mode. The animation runs only while something moves.
- New file `assets/js/dots.js`, loaded by `site.js`.

## 0.11.0 - College content from the old CCS site (2026-10-18)
Content summarized from old.dlsu.edu.ph/colleges/ccs and marked to be confirmed with the Office of the Dean.
- New **About the College** page (`about.html`): vision, mission, accreditation (PAASCU, CHED Center of
  Excellence) and the College office address and phone. The address and phone also appear in the footer.
- New **Leadership and departments** page (`departments.html`): the Office of the Dean, the three
  departments, their chairs and their practicum, thesis and graduate studies coordinators.
- **Student groups** on People: Student Research and Development Program, Peer Tutors, SPRINT.
- **Research centers** on Research: the ten AdRIC centers and labs, with focus and lead.
- The five **strategic goals** on Jubilee Progress.
- **Latest from CCS**: 16 recent College stories on Resources, tagged to a door, replacing the sample
  stories on the home page.
- Study gets a "Behind the programs" section (recognition and departments). Menu and search follow.
- Not migrated: the faculty list (needs faculty consent), quick links, and the College's empty
  Equipment and Facilities page.

## 0.10.0 - Program pop-ups (2026-10-18)
- Each program on **Our degree programs** now opens a pop-up with its details: what you will study,
  where it can lead, who can apply, the unit breakdown, graduation requirements and good-to-know notes.
  Programs with majors (BS CS and BS IE) show a major picker. A program can be shared as a link,
  for example `programs.html#ds`.
- The "Official program page" links are removed. The details are summarized from the College's
  program pages and marked to be confirmed with the program chairs.

## 0.9.0 - Our degree programs (2026-10-18)
- New page, **Our degree programs** (`programs.html`), under Study. Seven undergraduate and seven
  graduate programs from the College's program pages, each with its majors, units where stated,
  and a link to the official page. A filter switches between All, Undergraduate and Graduate.
- The Study page, the Study menu and search now point to it.
- Details come from old.dlsu.edu.ph and are marked to be confirmed with the program chairs.

## 0.8.0 - Five doors, CCS Commons and Jubilee Progress (2026-10-18)
Follows *CCS Commons Blueprint 1.2*.
- The portal is now called **CCS Commons**. The tagline is "Where CCS comes together."
- Five doors replace the four areas: **Study** (was Academics), **Services**, **Research**
  (was Research & Innovation), **Partners** (was Partnerships) and **People**. Community is
  split: Request a Service, Student Grants, the Virtual Office and equipment move to Services;
  Spotlight, committees and community engagement move to People.
- New **Jubilee Progress** page, linked from a band on the home page and from the menu.
- New **I'm a...** entry points on the home page, and a **Start a partnership** card under Partners.
- New addresses: `study.html`, `services.html`, `partners.html`, `people.html`, `jubilee.html`.
  The old `academics.html`, `community.html` and `partnerships.html` redirect, and keep their anchors.
- Menu, search and footer follow the new structure.

## 0.7.0 - Research dashboard link (2026-10-18)
- Research & Innovation now links to the Research dashboard (https://zefanonuevo.github.io/ccs/).
  The Research dashboard card opens it in a new tab.
- Stylesheets and scripts carry the new release in their address, so returning visitors
  get this release straight away.

## 0.6.1 - New palette and cache refresh (2026-10-18)
- New colour palette across the portal: Ink for headings and text, Forest for primary
  actions, Mint for soft panels, Paper for the page background, and Amber for attention.
  Dark mode is retuned to match. The shared design tokens are unchanged.
- Amber marks the draft *Suggested* tags and the internal-only label on Partnerships.
- Stylesheets and scripts carry the new release in their address, so returning visitors
  get the new colours and this release number straight away.

## 0.6.0 - Registration pop-up redesign (2026-10-17)
- New look for the Register and join Zoom pop-up: forest-green header with the CCS mark,
  a three-step strip (fill in the form, get your queue number, join Zoom when called),
  and the form below. Same green, white and black palette; works in light and dark.

## 0.5.1 - Pop-up fallback and touch fixes (2026-10-17)
- The registration pop-up always shows a *Form not showing? Open it in a new tab* link
  under the form, in case a browser blocks the embedded form.
- Page files carry a version in their address, so a new release is never hidden by a
  cached copy of the old one.
- Touch screens: logo, header icons, footer links and Sign in are at least 44px tall.
- The page behind the open side menu no longer scrolls.

## 0.5.0 - Registration pop-up (2026-10-17)
- **Register and join Zoom** (Community, Virtual Office) now opens the Virtual Office
  registration Google Form in a pop-up, with an *Open in a new tab* link and a close
  button. Ctrl/Cmd-click, or no JavaScript, opens the form in a new tab. Esc and the
  backdrop close it, and phones get a full-screen sheet. The form address is
  `modules.register` in `config.js`.
- Release number and a *Version history* link in the footer, and this changelog.
- Briefly an inline embed (`d7fedc3`); replaced by the pop-up in the same release.

## 0.4.0 - Usage dashboard link (2026-10-17)
- The **Usage dashboard** card (Community, Virtual Office) links to the Virtual Office
  Dashboard (`modules.vo`) and opens it in a new tab.

## 0.3.0 - Same palette and type as the other CCS systems (2026-10-15)
- Loads `ccs-design` v2 (green, white and black) and uses its system font stack. No
  web fonts are downloaded.

## 0.2.0 - Connected systems (2026-10-15)
- Links to the Task Tracker (Request a Service) and the Grant Support System (Student
  Grants), and loads the shared `ccs-design` tokens. The addresses are in `config.js`.

## 0.1.0 - Draft v1 (2026-10-15)
- First draft, built from CCS Portal Blueprint v2: home, the four areas, the side
  menu, search, and the "Viewing as" role preview.
