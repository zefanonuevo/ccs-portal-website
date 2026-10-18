# CCS Commons: Module Specifications

**Status:** Draft for approval, 2026-10-19. "Today" columns describe what the repositories contain, read on 2026-10-19; none of it was run in
this review unless marked verified. "Target" columns are **Proposed**. Labels are defined in [PRD.md](PRD.md). The contract every module
follows is in [Architecture.md](Architecture.md) section 8.

## 1. Overview

| Module | Repo | Door | Today | Version | Real data safe? |
| --- | --- | --- | --- | --- | --- |
| Portal shell | `ccs-portal-website` | all | Static site, live | 0.12.0 | Holds no personal data |
| Request a Service (Task Tracker) | `ccs-task-tracker` | Services | Browser-only prototype | 2.7.0 | **No.** Simulated data in the browser. |
| Student Grants (SCGSS) | `ccs-scgss` | Services | Browser-only simulation, optional Google backend | 2.1.0 | **No.** Do not enter real applicant data until the security work is done. |
| Virtual Office registration | Google Form | Services | Live form, opened in a pop-up | n/a | Controlled by the form owner; not reviewed |
| Virtual Office dashboard | `ccs-vo-dashboard` | Services (admin) | Static dashboards on published sheets | 2.2.0 | **Unknown.** Sheet contents not inspected. |
| Research (publications) dashboard | `ccs` | Research | Static dashboard on a published sheet | not versioned | **Unknown.** Sheet contents not inspected. |
| Design system | `ccs-design` | all | One CSS file | v2 | n/a |
| Academic dashboard | none | Study (admin) | Not built | n/a | n/a |
| News and events with approval | none | People, Resources | Not built | n/a | n/a |
| Partners (agreements, tracker, directory) | none | Partners | Not built | n/a | n/a |
| Research records, Add publication | none | Research | Not built (links exist) | n/a | n/a |

## 2. Portal shell

**Responsibility.** Navigation, search, public content, entry points, Jubilee Progress, the module registry, and the footer. It
holds no workflow data.

| Item | Today | Target (Proposed) |
| --- | --- | --- |
| Pages | 14, listed in README | Same structure; content owners confirm marked content |
| Module links | `modules` object in `assets/js/config.js` (tracker, scgss, vo, research, register, design) | Read from each module's manifest (Architecture 8) |
| Search | Fixed list inside `site.js` | Built from manifests and page list |
| Access | Preview badges from a matrix in `config.js` | Real roles from the identity service; matrix kept in one place on the server |
| Registration | Google Form in an iframe pop-up with fallback link | Unchanged in this round |
| Releases | Tagged, GitHub Releases, changelog | Add automated checks (Implementation Plan) |

**Interfaces.** Reads module manifests (target). Calls the identity service for the current user (target). Loads design tokens.
**Does not** store module data, perform approvals, or decide access on a module's behalf.

**Independence.** Must keep working if any module is down: module cards show "unavailable" and nothing else breaks.

## 3. Request a Service (Task Tracker)

**Responsibility.** Office request desk: service catalog, tickets, assignment, time tracker, evaluations, monitoring. Per its README:
sign-in accounts for requesters, coordinator, dean and assistants; working-hours SLA tracking; ticket board; time tracker; evaluations. *(Existing, not tested)*

| Item | Today | Target (Proposed) |
| --- | --- | --- |
| Roles | requester, office assistant, office coordinator, unit head (dean) | Same module roles, assigned in the module on top of coarse roles |
| Sign-in | Demo password in the browser | Shared sign-in |
| Data | Browser storage, simulated | PostgreSQL schema `tracker`, audit log |
| Notifications | Simulated in app | Email queue with idempotency key |
| Visibility | Public page | Signed-in only; matrix: Student Use, Faculty Use, Staff Manage, Admin Manage |
| Release | No tags, in-app changelog | Tags per contract |

**Interfaces (target).** `GET /api/tickets` (own or assigned), `POST /api/tickets`, status changes, ratings. Emits events
`ticket.created`, `ticket.assigned`, `ticket.completed`, `ticket.rated`. Provides anonymous aggregates to the Services dashboard.
**Depends on** identity, design tokens, notifications. **Open:** SLA targets and working hours must be confirmed by the office.

## 4. Student Grants (Student Conference Grant Support System)

**Responsibility.** Grant application, routing and approval, post-activity requirements, document verification, reimbursement report.
Per its README: application form; automatic routing (Thesis Adviser, Department Chair, Associate Dean, Dean); post-activity report;
document verification; reimbursement report. *(Existing, not tested)* The README states that nothing is deployed as a system, everything runs
in the browser, and a Google Apps Script URL in Settings is the only thing that sends data out.

| Item | Today | Target (Proposed) |
| --- | --- | --- |
| Roles | student, adviser, chair, associate dean, dean, administrative assistant, secretary, system administrator | Same, as module roles |
| Sign-in | Demo password | Shared sign-in; roles from the module's own table |
| Data | Browser storage plus optional Google Sheet and Drive | PostgreSQL schema `grants`, private file storage, append-only audit |
| Policy | Two pages of guidelines supplied; funding limits, quotas and reimbursement rules not given | Owner supplies missing rules; shown as settings, not code |
| Privacy | Draft Data Privacy notice marked for DPO review | DPO approves before real use |
| Email | Apps Script `email` action | Backend queue, domain-restricted |
| Release | No tags | Tags per contract |

**Interfaces (target).** Applications, documents, approvals, reports. Emits `grant.submitted`, `grant.approved`, `grant.returned`,
`grant.rejected`, `grant.reimbursed`. Provides anonymous aggregates (counts per stage) to dashboards.
**Rules to keep:** nobody acts on their own application; return-for-correction keeps earlier decisions; rejection needs a reason.
**Open:** quota numbers, allowable expenses, retention, upload types and size, the FAO template, who may record the final amount.

## 5. Virtual Office

### 5.1 Registration (Google Form)
Opens in a pop-up from Services. *(Existing, not tested.)* Unchanged in this round. **Decision needed (D13):** guest access stays as is?

### 5.2 Virtual Office dashboard
Pages per its README: login, Operations Dashboard, Evaluation Analytics, Knowledge Base. Reads three published Google Sheet CSVs in the
visitor's browser, classifies queries by keyword rules in `assets/classify.js`, refreshes every 60 seconds. *(Existing, not tested.)*

| Item | Today | Target (Proposed) |
| --- | --- | --- |
| Access | Client-side login against `users.json` (two entries, hashed) | Server-side sign-in; designated admins only (D10) |
| Data path | Browser reads public CSV | Server reads with a service account, serves aggregates only |
| Knowledge Base | Shows resolved concerns as precedents | Review for personal data before anyone but staff can see it |
| Intelligence | Keyword rules; a notes file discusses an intelligent decision-support extension | Separate proposal; not part of this plan |

**Open:** whether the sheets contain student names or IDs (R1), retention, who owns the sheet.

## 6. Research dashboard (`ccs`)

Faculty publications dashboard on a published Google Sheet: filters, charts, a detail view per publication, light and dark theme, bundled
sample data as fallback, optional Docker/nginx hosting. *(Existing, not tested.)*

| Item | Today | Target (Proposed) |
| --- | --- | --- |
| Access | Public, no login | Admin only if D4 and D14 decide so; otherwise a public view of consented records only |
| Data sources | One sheet | Blueprint: Scopus API, AdRIC reports, consolidated CCS list, self-reported entries |
| Writes | None | "Add your publication" (faculty), with review of self-reported entries (who reviews: open) |
| Release | Not versioned | Tags per contract |

**Open:** Scopus API access key and licence terms; faculty consent (D14).

## 7. Modules not yet built

| Module | Responsibility | Depends on | Notes |
| --- | --- | --- | --- |
| Academic dashboard | Enrollment, graduation, applications, pass and drop-out rates, shiftees and leaves, time to graduate | Registrar data source (unknown), identity, DPO review | Admin only; totals only; small-group rule (D16) |
| News and events | Post, approve, publish; area tags | Identity, notifications | Admins post; faculty and staff submit for approval (suggested) |
| Jubilee feed | Approved highlights from dashboards | Dashboards, approval flow | D15 approver |
| Partners | Start a partnership, directory, highlights, agreements, activity tracker | Identity | Public vs internal split; agreement visibility to confirm |
| Research records | Faculty records, Add publication, projects, grants summary | Identity, data sources | Consent (D14) |
| Equipment and inventory | Inventory management | Identity | Placement under Services per Blueprint 1.2; requirements not written |
| Directory (suggested) | Faculty and staff directory | Consent | Marked *suggested* in Blueprint 1.2 |

Each of these is **Proposed** for implementation order in Implementation-Plan.md. None is built or approved for build yet.

## 8. Design system (`ccs-design`)

One CSS file with color, shadow, easing, type and theme-switch tokens for light and dark (verified by reading). Consumers: portal, tracker, grants, VO
dashboard. Target: versioned releases, pinned by consumers, palette defined once, including amber (Architecture section 9).

## 9. Integration matrix (target, Proposed)

| From → To | Mechanism | Data | Auth |
| --- | --- | --- | --- |
| Portal → every module | Link from manifest | none | Shared sign-in |
| Module → identity | OIDC session check | user id, coarse role, module roles | Server |
| Tracker, Grants → notifications | Event outbox | recipient, template, ids (no free text of concern) | Service credential |
| Modules → dashboards | Aggregate endpoint | counts only | Service credential |
| Dashboards → Jubilee Progress | Approved highlight | text and totals | Approver identity |
| Registration form → Virtual Office dashboard | Google Sheet (today) | queue log | **Needs review (R1)** |

## 10. Definition of "compatible with the portal"

A module is compatible when, as checked by a reviewer:
1. It has a manifest and passes the contract in Architecture section 8.
2. It signs in through the shared identity and enforces access on its server.
3. It uses pinned design tokens and meets DESIGN.md.
4. It has a changelog, tagged releases, and a rollback note.
5. It has passed its own tests and the security review for its phase.
