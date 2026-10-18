# Changelog

Every release is a git tag, so any of them can be opened, downloaded or restored.
See [Versions and restoring](README.md#versions-and-restoring).

The release number shown in the footer of every page comes from `release` in
`assets/js/config.js`. Change it together with this file when you cut a new release.
(`version: 'Draft v1'` is the draft stage of the whole site, not the release number.)

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
