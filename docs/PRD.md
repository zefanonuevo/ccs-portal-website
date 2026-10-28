# CCS Commons: Product Requirements

**Status:** Draft for approval, 2026-10-19. Nothing in this document changes approved scope until the owner approves it.
**Supersedes:** nothing. Blueprint v2 and Blueprint 1.2 (Claude artifacts) remain the approved source. This
document gathers them, marks what exists, and lists what is undecided.

**Labels used throughout**

| Label | Meaning |
| --- | --- |
| **Existing (verified)** | Confirmed by reading the code or by a live request during the 2026-10-19 review. |
| **Existing (not tested)** | Present in code or described by its README, but not run or tested in this review. |
| **Approved** | Stated in Blueprint v2 or 1.2 and not contradicted. |
| **Proposed** | Recommended in this documentation round. Needs owner approval. |
| **Decision needed** | Open question. Owner input required. |

## 1. Purpose

CCS Commons is the central hub for the College of Computer Studies, built around the Jubilee strategy.
Its main goal is to keep offering quality degree programs through efficient and effective service to the college
community, its partners and its research. (Approved, Blueprint v2.)

Design targets (Approved, Blueprint v2; the two-click figure is itself marked as a proposed target there):

1. **Find it fast.** Each audience reaches what it needs in two clicks or fewer.
2. **See the strategy.** News and dashboards show progress against Jubilee, not only announcements.
3. **Get things done.** Apply, register, request and track in one place, with the right access per role.

## 2. Users

| User | Needs | Door they start from |
| --- | --- | --- |
| Prospective student | Programs, how to apply, what graduates can do | Academics |
| Student | Courses, grants, requests, Virtual Office | Academics, Services |
| Faculty | Research records, forms, grants (view), requests | Services, Research |
| Staff | Handle requests, forms, internal agreements | Services, Partners |
| Partner (industry, community) | Who to contact, what CCS offers | Partners |
| Admin (designated, per dashboard) | Manage content, approve highlights, view statistics | all |
| Office coordinator, assistants, Dean, approvers | Run the Task Tracker and Grant Support workflows | Services |
| Guest | Public information only | any |

Roles in the access matrix are Guest, Student, Faculty, Staff, Admin (Approved, Blueprint v2; matrix revised by the owner on 2026-10-20, section 2.1). The modules use
richer roles of their own (see Module-Specifications.md). A single role model is **Proposed** (Architecture.md section 6).

### 2.1 Access matrix (owner-supplied, detailed table dated 2026-10-20, received 2026-10-28; **Approved**)

The owner supplied a detailed table, grouped by door (Academics, Services, Research, Partners, People). It **replaces** the shorter summary table of
2026-10-20 and the Blueprint v2 slide. Levels: **View** read only, **Use** submit or take part, **Manage** edit and approve. Columns follow the owner's table (Admin first).
It is **not enforced** anywhere (Architecture.md section 6). The portal only previews it: content that is **No** for the chosen role is hidden, the rest gets a badge,
using the keys in `assets/js/config.js`. Hidden content is still in the page source (Architecture.md W7).

| Content | Config key | Admin | Staff | Faculty | Student | Guest |
| --- | --- | --- | --- | --- | --- | --- |
| Degree programs (undergraduate and graduate) | `program` | Manage | View | View | View | View |
| Graduate attributes and outcomes | `outcomes` | Manage | View | View | View | No |
| Course flowcharts and checklists | `flowcharts` | Manage | View | View | View | No |
| Course descriptions | `courses` | Manage | View | View | View | No |
| Course syllabi | `syllabi` | Manage | View | View | No | No |
| Application requirements | `admission` | Manage | View | View | View | View |
| Graduation requirements | `graduation` | Manage | View | View | View | View |
| Administrators (college administrators, department chairs, program coordinators) | `leadership` | Manage | View | View | View | View |
| Request a Service or Task (task assignment tracker) | `service` | Manage | Use | Use | No | No |
| Request Student Conference Grant (apply, track, post-activity reports, reimbursement) | `grants` | Manage | Use | Use | Use | No |
| CCS Virtual Office: register, join Zoom session | `virtual` | Manage | Use | Use | Use | Use |
| CCS Virtual Office: dashboard | `vodash` | Manage | View | No | No | No |
| CCS Virtual Office: knowledge base | `kb` | Manage | Use | Use | No | No |
| CCS Inventory Tracker (monitoring, assigned equipment, fixed assets) | `inventory` | Manage | Use | Use | No | No |
| Forms and downloads | `forms` | Manage | Use | Use | Use | View |
| Publication highlights | `pubhighlights` | Manage | View | View | View | View |
| Publication records | `pubrecords` | Manage | Use | Use | No | No |
| Submit a publication | `publish` | Manage | Use | Use | No | No |
| Project highlights | `projhighlights` | Manage | View | View | View | View |
| Project status | `projstatus` | Manage | Use | View | No | No |
| Grants summary | `grantsum` | Manage | Use | View | No | No |
| AdRIC research centers | `centers` | Manage | Use | View | View | No |
| Partner highlights | `partnerhl` | Manage | View | View | View | View |
| Partner directory (duration, type, status, contact, MOA/MOU) | `partnerdir` | Manage | Use | View | No | No |
| Partner activities tracker (engagement activities, faculty involvement) | `partnertracker` | Manage | Use | Use | No | No |
| Start a partnership | `partnerstart` | Manage | Use | Use | View | View |
| Awards and recognition | `spotlight` | Manage | Use | Use | View | View |
| News and updates | `news` | Manage | Use | View | View | View |
| Faculty and staff directory | `directory` | Manage | Use | Use | View | View |

**Also kept in `config.js`:** `agreements` (Agreements card; same values as Partner directory, which carries MOA/MOU) and `dashboards` (Academic and Research
statistics dashboards: Admin only, from the shorter 2026-10-20 table; the detailed table has no row for them).

**Changes from the 2026-10-20 summary table** (values that moved): Request a Service: Staff Manage to Use, Student Use to No. Student grants: Staff No to Use,
Faculty View to Use. Virtual Office registration: Guest View to Use. Virtual Office dashboard now has its own row (Staff View). Forms: Guest No to View, Student View to Use.
Submit a publication: Staff No to Use. Faculty and staff directory, partner and research rows are now split into the finer rows above.

**Not covered by the detailed table (no key, so no hiding or badge):** curriculum mapping, "What you will study", Jubilee Progress, About the College, CCS Administration and
Student Groups (all View for everyone in the table; left untagged), equipment requests. The table's section header row "Study - change to Academics"
(Manage, View, View, View, No) is treated as a section label, not a content row.

**One conflict, decided in favour of the owner's chat instruction:** the detailed table shows Administrators with Guest **No**, but on 2026-10-20 the owner said
to change it to **View**, and the table's own "CCS Administration" row is View for Guest. `leadership` stays Guest View (D20). If the table is right, change one value in `config.js`.

**Applied in the portal:** keys in `config.js`; page tags and the menu/search link map (`LINK_ACCESS` in `site.js`) follow the keys; the AdRIC research centers section is
tagged as a whole.

## 3. Scope

### 3.1 Existing (what the repository contains today)

| Area | State |
| --- | --- |
| Portal site `ccs-portal-website` v0.12.0 | **Existing (verified).** 14 static pages, five doors, Jubilee Progress, mega menu, search, side menu, degree programs with pop-ups, about and departments pages, registration pop-up (Google Form), dot background, role preview badges. Hosted on GitHub Pages with HTTPS enforced. |
| Real sign-in, roles, server-side access control | **Does not exist.** The "Viewing as" switch only changes badges. |
| Task Tracker (Request a Service) v2.7 | **Existing (not tested).** Browser-only prototype with simulated data. |
| Student Conference Grant Support System v2.1 | **Existing (not tested).** Browser-only simulation; optional Google Apps Script writes to a Sheet, Drive and email. |
| Virtual Office dashboard v2.2 | **Existing (not tested).** Reads published Google Sheet CSVs in the browser. Login is client-side. |
| Research (publications) dashboard `ccs` | **Existing (not tested).** Reads a published Google Sheet. No login. |
| Shared design `ccs-design` v2 | **Existing (verified).** One CSS file. Modules and the portal override parts of it (see DESIGN.md). |
| Database | **Does not exist.** Browser storage and Google Sheets only. |

### 3.2 Approved scope not yet built

From Blueprint v2 and 1.2, none of which exists yet as working features:

- Roles and sign-in; Guest/Student/Faculty/Staff/Admin access rules.
- News and events with an approval step (Admins post directly; faculty and staff submit for approval; **suggested**, not confirmed).
- Forms and downloads, Policies and guidelines, How things work as populated sections.
- Academic dashboard (enrollment, graduation, applications, pass and drop-out rates, shiftees and leaves, time to graduate).
- Partners: Start a partnership, directory, highlights, agreements (MOA and MOU), partner activity tracker.
- Research: faculty records, Add your publication, grants summary, project status, project highlights; four data sources (Scopus API, AdRIC reports, consolidated CCS list, self-reported).
- Jubilee Progress fed by approved dashboard highlights (the page exists; the feed does not).
- Spotlight, committees, community engagement, faculty and staff directory (suggested) under People.
- Equipment and inventory under Services.

### 3.3 Proposed additions (this documentation round)

Not approved until the owner says so:

- A single identity and role model shared by portal and modules (Architecture.md).
- A module contract so each module can be built, deployed and versioned independently (Module-Specifications.md).
- A privacy and security baseline for any dashboard that shows data about people.
- A test, CI and release baseline (Implementation-Plan.md).

### 3.4 Non-goals

- Rebuilding the portal, switching frameworks, or redesigning approved navigation.
- Merging the module repos into one codebase now. (The tracker and grants READMEs mention a possible later merge. **Decision needed**.)
- Replacing the Google Form registration flow in this round.

## 4. Functional requirements

IDs are for cross-reference. Priority: **M** must, **S** should, **C** could. Status is today's.

### 4.1 Portal shell

| ID | Requirement | Pri | Status |
| --- | --- | --- | --- |
| P-1 | Five doors in one consistent top navigation; no more than five | M | Existing (verified) |
| P-2 | Home page order: welcome and search, I'm a..., quick actions, five doors, Jubilee Progress, news and events | M | Existing (verified) |
| P-3 | Search across pages, forms and services | M | Existing (verified): searches a fixed list in `site.js` |
| P-4 | Side menu: News and updates, Events, Forms and downloads, Policies and guidelines, How things work | M | Existing (verified): menu present; sections mostly placeholders |
| P-5 | Sign-in with DLSU Google accounts; roles from our own table | M | Proposed. Blueprint recommends matching sign-in to a CCS student list (Option B). Not decided. |
| P-6 | Quick actions and visible items follow the signed-in role | M | Proposed (today: preview badges only) |
| P-7 | Old addresses keep working | S | Existing (verified): three redirect pages |
| P-8 | News and events with area tags and approval | M | Proposed |
| P-9 | Jubilee Progress shows only approved highlights; totals, no named students | M | Approved guardrail; feed not built |

### 4.2 Modules (summary; details in Module-Specifications.md)

| ID | Requirement | Pri |
| --- | --- | --- |
| M-1 | Each module runs and deploys independently | M (Proposed) |
| M-2 | Each module accepts the shared sign-in and role claims | M (Proposed) |
| M-3 | Each module uses the shared design tokens | M (Existing convention; drifted, see Risks) |
| M-4 | Each module declares a manifest the portal reads (name, url, version, required role) | S (Proposed) |
| M-5 | Modules never read each other's data directly; they share only through documented APIs or events | M (Proposed) |

### 4.3 Non-functional requirements (all Proposed unless noted)

| Area | Requirement |
| --- | --- |
| Accessibility | WCAG 2.2 AA for public pages. Keyboard operable, visible focus, 4.5:1 text contrast, reduced-motion respected. Earlier work targets this; it has not been audited. |
| Performance | Pages usable on a mid-range phone on a slow connection. Budget to be set in Phase 2. No web fonts (Existing, verified). |
| Privacy | Data minimization. Compliance with the Philippines Data Privacy Act to be confirmed by the University Data Protection Officer. |
| Security | See Architecture.md section 7. Today there is no authentication, so no control can be claimed. |
| Availability | Static pages on GitHub Pages. Target for authenticated services **Decision needed**. |
| Maintainability | Changelog and tagged releases for every repo. Today: portal and VO dashboard tag releases; the tracker and grants repos do not. |
| Compatibility | Latest two versions of Chrome, Edge, Safari and Firefox, plus mobile Safari and Chrome. **Proposed**, not yet tested. |

## 5. Content ownership and approval

| Content | Today | Needed |
| --- | --- | --- |
| Programs, departments, chairs, strategic goals, news | Summarized from the old CCS site and marked *to be confirmed* (**Existing, verified**) | Named owner per door to confirm (Blueprint 1.2 decision 2) |
| Faculty list | **Not migrated**, on purpose, pending faculty consent | Consent decision (Blueprint decision 7) |
| Jubilee highlights | Page exists | Who approves (Blueprint 1.2 decision 8) |
| Portal name "CCS Commons" | In use | Sign-off from the communications office and DLSU brand rules (decision 1) |

## 6. Decisions

Decisions carried over from the blueprints plus those raised by this review. "Recommended" is my proposal, not a decision.

| # | Decision | Source | Recommended | Status |
| --- | --- | --- | --- | --- |
| D1 | Which documents are canonical? | Review | Blueprint 1.2, then v2 where 1.2 is silent, then the docs in this repo. Keep v2 as an archive. | Decision needed |
| D2 | Target architecture | Review | Static front end now; a small authenticated backend and database when real workflows go live (Architecture.md) | Decision needed |
| D3 | Identity | v2 slide "How the portal knows who is a CCS student" | Google sign-in limited to the DLSU domain; roles from our table; student list match (Option B). Source of the list is open. | Decision needed |
| D4 | Dashboards that are public today | Review | Treat as a privacy risk; confirm what the sheets contain; restrict before wider promotion | Decision needed |
| D5 | Palette | Blueprint v2 brand slide | Green, black, white, with amber for attention, sparingly. The portal already uses this. | Recommended: confirm |
| D6 | Modules stay separate repos behind a contract | Review | Yes | Decision needed |
| D7 | Fate of private repo `ccs-portal` and of `vo-website` | Review | Owner to say | Decision needed |
| D8 | Name sign-off | 1.2 #1 | Communications office | Decision needed |
| D9 | One owner per door | 1.2 #2 | Owner to name | Decision needed |
| D10 | Designated admins per dashboard | 1.2 #3 | Owner to name | Decision needed |
| D11 | Source of the CCS student list | 1.2 #4 | Registrar or enrollment system, if allowed | Decision needed |
| D12 | Syllabi public or signed-in only | 1.2 #5 | Signed-in only (v2 matrix default) | Decision needed |
| D13 | Guest access to Services and Virtual Office registration | 1.2 #6 | Virtual Office registration stays as it is today (a Google Form linked from the portal; not tested); other Services need sign-in | Decision needed |
| D14 | Faculty consent for public publication records | 1.2 #7 | Opt-in | Decision needed |
| D15 | Who approves Jubilee highlights | 1.2 #8 | The Dean's office delegate | Decision needed |
| D16 | Small-group threshold for dashboards | v2 guardrail ("hide very small groups"), no number | A minimum group size, for example 5, confirmed with the Data Protection Officer | Decision needed |
| D17 | Data retention periods | Review | Set per data type with the DPO | Decision needed |
| D19 | Door name: the owner's table said "Study - change to Academics" | 2026-10-20 table | **Resolved by the owner on 2026-10-20: the door is named Academics** (line: "Study at CCS"). This reverses Blueprint 1.2, which named it Study. `academics.html` is the page again; `study.html` redirects to it. | Resolved |
| D20 | Administrators: Guest No in the table, but the Leadership and departments page is public | 2026-10-20 table | **Resolved by the owner on 2026-10-20: Guest is View.** The matrix and `config.js` now say View. | Resolved |
| D21 | Content with no row in the table | 2026-10-20 table | Most rows now exist in the detailed table (see 2.1). Still without a row: curriculum mapping, what you will study, equipment requests. | Open (values) |
| D18 | Theme policy: portal is forced light today, modules offer System/Light/Dark | Review | One policy for all. Either keep light-only everywhere or let all follow the system setting. | Decision needed |

## 7. Conflicts and inconsistencies found

| # | Finding | Evidence | Proposed resolution |
| --- | --- | --- | --- |
| C1 | Blueprint v2 (Compass, four areas) vs Blueprint 1.2 (Commons, five doors) | Both artifacts | 1.2 is implemented in the portal, with one owner override: the first door is named Academics, not Study (D19). Treat 1.2 as the approved structure; keep v2's matrix, guardrails and decisions that 1.2 says carry over. |
| C2 | Access matrix says statistics dashboards are Admin only | v2 "Who sees what" | The Research dashboard has no login and the VO dashboard's login is client-side with a publicly served user file. See Architecture.md section 7 and D4. |
| C3 | `docs/DESIGN.md` says "No amber in v1" and lists no amber, but tokens and Blueprint v2 use amber | `assets/css/tokens.css`, v2 brand slide | Corrected in DESIGN.md (this round). |
| C4 | README says editing `ccs-design` changes the palette on every site, but the portal and grants override it | README, `tokens.css` | Single token source (Architecture.md section 9; DESIGN.md). |
| C5 | Four sign-in styles (none, demo password, demo password, client-side hash) | Code in each repo | One identity model (Architecture.md). |
| C6 | Role names differ in each module | Module READMEs | Coarse role plus module role (Architecture.md section 6). |
| C7 | Release practice differs: portal and VO tag releases; tracker and grants have changelogs but no tags | `git ls-remote --tags` | One release practice (AGENTS.md rule 14 to 16). |
| C8 | Portal README said "Draft v1" while the release is 0.12.0 | README, `config.js` | README refreshed this round. |
| C9 | Portal is forced to the light theme (`data-theme="light"`), while modules offer a theme switch and DESIGN.md said the portal follows the system | `index.html`, commit `f112eb8` | DESIGN.md corrected; policy is D18. |
| C11 | The owner's table lists "News, events, spotlight" twice with identical values, and has an empty "Our Programs" header row | 2026-10-20 table | Treated as one row; no action unless the second row was meant to be different | Noted |
| C12 | Matrix row "Administrators" (Guest No) conflicted with the public Leadership and departments page | `departments.html` | Resolved by D20: Guest View. | Resolved |
| C10 | Two commits after v0.12.0 (`fbda912`, `f112eb8`: theme-color and forced light theme) have no CHANGELOG entry, so the footer release number (0.12.0) does not describe the deployed site exactly | `git log`, `CHANGELOG.md` | Add a changelog entry or release when the owner next cuts a release. Not edited in this round because it describes code changes. |

## 8. Risks

| # | Risk | Likelihood / impact | Mitigation (Proposed) |
| --- | --- | --- | --- |
| R1 | Personal data in published Google Sheets reachable by anyone with a link found in public repos | Unknown / High. Contents not inspected. | Inspect contents with a data owner; restrict publication; move reads behind authenticated access. |
| R2 | Client-side "login" mistaken for security | High / High | Stop describing it as access control. Replace with server-side sign-in. |
| R3 | Apps Script endpoint is "Anyone" with a shared token | Medium / High once real data flows | Verify the signed-in user on each request. Never use with real student data until then. |
| R4 | Browser-only data is lost or edited by users | High / Medium | Treat all current module data as demo data; real data needs a server database. |
| R5 | GitHub Pages cannot set security headers (CSP, frame rules) | Certain / Medium | Add a CSP when a host that can set headers is chosen (Architecture.md). None of the 14 pages has a CSP meta tag today. |
| R6 | Shared stylesheet is loaded from another repo at runtime | Medium / Medium | Pin versions; vendor or tag releases; fall back gracefully. |
| R7 | Content summarized from the old site becomes stale or wrong | High / Medium | Owners named; "to be confirmed" labels kept until sign-off. |
| R8 | Brand, name or logo rules not cleared with DLSU | Medium / Medium | D8. |
| R9 | No automated tests, so regressions go unnoticed | High / Medium | Phase 2 baseline. |
| R10 | Scope creep from "suggested" items | Medium / Medium | Treat suggested items as Proposed until approved. |
| R11 | All CCS sites share one browser origin (`zefanonuevo.github.io`), so a script flaw in one can read browser storage of the others; the owner's GitHub account also hosts every site | Medium / High once real data exists | Separate origins or a shared parent domain with a CSP; ownership moved to a college-controlled organization (Architecture.md sections 7 and 10). |

## 9. Success measures (Proposed)

- Two-click reach for each audience's top tasks (v2 target), measured by a task walkthrough test.
- Share of requests, grants and registrations completed in the portal's systems rather than by email.
- Dashboards viewed only by designated admins (audit log).
- Content owners confirm all "to be confirmed" items.
- Accessibility audit passes WCAG 2.2 AA on the public pages.

## 10. Approval

Approving this PRD approves: the labels, scope split (3.1 to 3.4), the decision list, and the recommended answers marked
**Proposed**. Items needing a separate explicit yes: D2 (backend), D3 (identity), D4 (dashboard restriction), D6 (repo structure).
