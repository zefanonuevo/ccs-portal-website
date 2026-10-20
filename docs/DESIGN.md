# CCS Commons: UI/UX Guidelines

This is the project's design document. It keeps the name `DESIGN.md` so links keep working, and it serves as the UI/UX guidelines.

**Status:** Updated 2026-10-19 (draft for approval). It keeps the earlier design notes and corrects them against the code.
Labels are defined in [PRD.md](PRD.md): **Existing (verified)** was read in code or computed on 2026-10-19; **Proposed** needs approval.

**What changed in this revision, and why**

| Change | Reason |
| --- | --- |
| Removed "No amber in v1" and added amber to the palette | `assets/css/tokens.css` and the Blueprint v2 brand slide both include Amber `#8a5a00`, "attention, sparingly". The earlier note was wrong. |
| Dark mode section rewritten | The latest commit forces the light theme on every page (`data-theme="light"`). The earlier note said the portal follows the system setting. |
| Added accessibility standards, component inventory, content rules and responsive rules | These were missing. Marked Proposed where not yet audited. |
| Kept the visual thesis, motion thesis, easing and access preview unchanged | Approved and consistent with the code. |

## 1. Visual thesis *(Existing)*

Apple-style restraint in green, black and white: big quiet headlines, generous space, rounded bento tiles, one dark band for contrast, and a translucent navigation bar. Nothing decorative that does not help someone find their way.

## 2. Color

Defined in `assets/css/tokens.css` (portal) on top of `ccs-design` v2. *(Existing, verified)*

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#111a15` | Text on light, dark band |
| Forest | `#0b5d45` | Primary actions, Academics tile |
| Mint | `#dcebe2` | Soft panels |
| Paper | `#f4f7f3` | Page background |
| White | `#ffffff` | Cards |
| Amber | `#8a5a00` | Attention. Sparingly: *Suggested* tags and the internal-only label. Soft fill `#f3e7cf`. |
| Muted | `#4d5d55` | Secondary text |
| Line | `#cfdbd3` | Borders |

**Rules.** Palette is green, black and white. Amber is for attention only and never the main color of a section.
Status is never shown by color alone: every status has a word. *(Approved, Blueprint v2)*

**Contrast, computed on 2026-10-19 from the token values** (WCAG 2.2: 4.5:1 body text, 3:1 large text and UI parts):

| Pair | Ratio | Result |
| --- | --- | --- |
| Ink on Paper | 16.45 | passes |
| Muted on Paper | 6.45 | passes |
| Muted on White | 6.97 | passes |
| Forest on Paper | 7.29 | passes |
| White on Forest | 7.88 | passes |
| Forest on Mint | 6.39 | passes |
| Amber on Paper | 5.49 | passes |
| Amber on soft amber | 4.84 | passes |
| Dark theme: text, muted, accent on background | 17.45, 8.51, 9.83 | passes |
| Dark theme: ink on accent | 8.51 | passes |

This checks the tokens, not every page. A page-level audit is **Proposed** (Implementation-Plan.md, Phase 2).

### Theme *(Existing, verified)*
The portal is **forced to the light theme** on all 14 pages (`data-theme="light"`, commit `f112eb8`). Dark tokens still exist in
`tokens.css` but the portal does not use them. The modules (tracker, grants, VO dashboard) still offer System, Light and Dark.
**Decision needed (D18):** keep the portal light-only, or return to following the system setting so portal and modules match.

### Single source *(Proposed)*
Today the portal and grants override the palette that `ccs-design` defines, so the README's claim that editing `ccs-design` changes
every site is not true. Proposed: define the full palette once in `ccs-design` (including amber), pin versions in each consumer, and keep
only portal-only tokens in `tokens.css` (Architecture.md section 9).

## 3. Type *(Existing)*

System font stack (SF Pro on Apple devices, Segoe UI on Windows) from `ccs-design`. No web fonts are downloaded. Same as the Task
Tracker and Grant Support System. Headings use tight tracking; body text keeps normal tracking. Minimum body size 16 px on phones.

## 4. Layout and responsive rules

- Content column up to 1180 px wide with side margins (`.wrap` in `site.css`). *(Existing, verified)*
- Breakpoints present in `site.css`: 1240, 980, 700, 600, 520, 420 and 380 px, plus `pointer: coarse` and `hover: hover` queries. *(Existing, verified)*
- No sideways scroll at 375 px. Mega menu on desktop only; phones use the side menu. *(Existing)*
- Print styles exist (`@media print`). *(Existing, verified)*
- Five doors in the top navigation, never more. New content goes inside a door. *(Approved, Blueprint 1.2)*

## 5. Component inventory *(Existing, from `site.css` and `site.js`)*

Navigation bar (translucent), mega menu, side menu sheet, search dialog, buttons (primary, quiet, small), chips, cards, bento tiles,
quick-action tiles, "I'm a..." chips, dark Jubilee band, lists, steps, program filter and program pop-up, registration pop-up, footer.
Every new component must reuse tokens and cover the five states in section 8.

## 6. Motion *(Existing)*

Calm and precise. Press feedback 160 ms (`scale(0.97)`), hover and color 200 ms, side menu 320 ms with a drawer curve, one scroll reveal (10 px rise and fade, 60 ms stagger, 420 ms). CSS only, no animation library. Only `transform`, `opacity` and color are animated.

Allowed patterns: translucent blurred nav, mega menu for the five doors (desktop only; phones use the side menu), bento tiles, dark Jubilee band, four-point star mark, scroll reveal, sample-content dashed borders.

Dot field: a decorative grid behind every page (`assets/js/dots.js`). Dots part around a mouse or pen pointer and return on a slightly underdamped spring (stiffness 220, damping 20), light up fast and fade slower. Still for touch and reduced motion. The frame loop stops when nothing moves. Resting dots stay at 20% opacity so text keeps its contrast.

Not animated on purpose: search opens instantly (keyboard-driven, used often). Reduced motion removes movement and keeps a short fade. Hover effects only apply on devices with a real pointer.

**Easing** *(Existing)*
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for press and reveal
- `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` for the side menu

**Rules for new motion** *(Proposed)*: it must have a purpose (feedback, state change, spatial continuity); no animation for actions repeated
many times a day; under 300 ms for UI feedback; never the only way to learn something.

## 7. Accessibility standards *(Proposed, target WCAG 2.2 AA)*

| Area | Standard | Today |
| --- | --- | --- |
| Keyboard | Everything reachable and operable; logical order; Esc closes pop-ups and menus | Code has focus styles and Esc handlers; not audited |
| Focus | Visible focus on every interactive element | `:focus-visible` rules exist (5 in `site.css`); not audited per page |
| Targets | At least 44 px on touch screens | Applied to header, footer and sign-in (v0.5.1); other elements not checked |
| Contrast | 4.5:1 text, 3:1 large text and controls | Token pairs pass (section 2); pages not audited |
| Motion | Respect reduced motion; no flashing | `prefers-reduced-motion` rules exist (5 blocks); not tested with the OS setting on |
| Structure | One `h1` per page, landmarks, skip link, alt text, labels on inputs | Skip link exists; rest not audited |
| Language | Plain words, acronyms spelled out on first use, "you" voice | Approved in Blueprint v2 |
| Screen readers | Names and roles for custom widgets (menu, dialog, pop-up) | Not tested |

## 8. Interaction states and patterns *(Proposed standard)*

Interactive elements define five states: default, hover (pointer devices only), focus, active (press), disabled.
Forms: label above input, error text next to the field with `role="alert"`, never color alone.
Pop-ups: focus moves in, Esc and backdrop close, focus returns to the trigger, background does not scroll.
Empty, loading and error states are designed, not left blank. Sample content is labelled "Sample" with a dashed border.

## 9. Content and voice *(Approved, Blueprint v2 and 1.2)*

Clear, warm and direct. Say "you". Replace jargon with plain labels, for example:

| Instead of | Use |
| --- | --- |
| Course Curriculum Breakdown | What you will study |
| Course Flowcharts | Your path, term by term |
| Admission Requirements | How to apply |
| Graduation Requirements | Finishing your degree |
| Process Workflows | How things work |

Door lines: Academics ("Study at CCS"), Services ("Ask, apply, register"), Research, Partners ("Work with CCS"), People ("Meet CCS").
The name "CCS Commons" still needs sign-off from the communications office (D8).

## 10. Modules and the shared look *(Proposed)*

Every module uses the shared tokens, the same header pattern (mark, name, version tag, sign-in and theme controls) and the same
component states. A module may add its own chart colors and status dots but not its own palette. The module header always links
back to the portal. The portal never embeds another module in an iframe (the registration form is the existing exception).

## 11. Access preview *(Existing)*

`data-access="key"` on any element adds a badge from the matrix in `config.js`. The matrix is the owner's table of 2026-10-20 (PRD.md section 2.1),
which supersedes the Blueprint v2 slide. The badge is a preview of View, Use and Manage and is **not access control**. Only tag content that the
row actually governs; do not tag content that is publicly readable today if the row says Guest No (see PRD D20).

## 12. Next steps

Tracked in [Implementation-Plan.md](Implementation-Plan.md). Design-specific: settle D18, move the palette into `ccs-design`, run a page-level
accessibility audit, and write a one-page component sheet per module before any new module is built.
