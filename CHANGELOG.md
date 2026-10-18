# Changelog

Every release is a git tag, so any of them can be opened, downloaded or restored.
See [Versions and restoring](README.md#versions-and-restoring).

The release number shown in the footer of every page comes from `release` in
`assets/js/config.js`. Change it together with this file when you cut a new release.
(`version: 'Draft v1'` is the draft stage of the whole site, not the release number.)

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
