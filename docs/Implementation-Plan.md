# CCS Commons: Implementation Plan

**Status:** Draft for approval, 2026-10-19. Everything below is **Proposed**. It is an order of work, not a schedule: no dates are given because they
depend on how fast the open decisions in [PRD.md](PRD.md) section 6 are settled. Labels are defined in PRD.md.

## 1. How to read this plan

- **Phase** = a group of work with entry criteria (what must be true to start) and exit criteria (what must be shown to finish).
- **Gate** = an owner approval point. Work after a gate does not start until the gate is passed.
- Existing work is not redone. Phase 1 starts from the current portal (v0.12.0).
- "Tested" means run and observed, with the result recorded. Nothing is called working before that.

## 2. Phase overview

| Phase | Name | Main output | Gate |
| --- | --- | --- | --- |
| 0 | Decisions and privacy review | Answers to D1 to D18; findings on what the published sheets contain | G0 owner approves scope and architecture |
| 1 | Design approval | Single design source; role and access matrix; module component sheets | G1 owner approves design |
| 2 | Foundation | Test and CI baseline; documentation in place; release practice aligned | G2 baseline reviewed |
| 3 | Identity and platform | Sign-in, roles, directory, audit log, environments | G3 security review passes |
| 4 | Modules on the platform | Tracker and Grants first, then dashboards, then new modules | G4 per module |
| 5 | Pilot and release | Pilot with real users, operations runbook, handover | G5 go-live approval |

## 3. Phases in detail

### Phase 0: Decisions and privacy review

**Entry.** This documentation round is approved.
**Work.**
1. Owner answers the open decisions (PRD section 6), starting with D2, D3, D4, D6, D8, D9, D10, D11.
2. A data owner inspects what the two published Google Sheets (VO and research) contain. Record only the types of fields found, never copy personal data into the repo (R1).
3. Confirm status of the private repo `ccs-portal` and of `vo-website` (D7).
4. Confirm the Data Protection Officer's review path and timing.
5. Name an owner for each door and each module.
**Exit.** Decision table filled in; PRD updated from Proposed to Approved where the owner agrees; findings from step 2 recorded; immediate risk actions agreed (for example, whether to unpublish a sheet or stop promoting a dashboard).
**Tests.** None. Review only.

### Phase 1: Design approval

**Entry.** G0.
**Work.**
1. Move the full palette, including amber, into `ccs-design` as a tagged release; define how consumers pin it. Settle D18 (light-only or system theme).
2. Approve the role model: coarse roles, module roles, and the access matrix, including any change to the v2 matrix.
3. Produce a one-page component and state sheet per module (header, forms, tables, dashboards) that follows DESIGN.md.
4. Approve a sign-in and role-selection screen design and the "no access" and "unavailable module" states.
5. Review the home page and doors against the two-click target with a short task walkthrough (five tasks per audience).
**Exit.** Owner approves design artifacts; walkthrough results recorded; token source and versioning agreed.
**Tests.** Visual review at 375, 768 and 1280 px, light and (if kept) dark; contrast check of every new pair; reduced-motion check.

### Phase 2: Foundation

**Entry.** G1.
**Work.**
1. Repository hygiene: align changelogs and tags across repos (tracker and grants have none); record release steps (AGENTS.md rules 14 to 16).
2. Add a test baseline that needs approval for any dependency: link checking, HTML validation, accessibility checks (axe) and end-to-end smoke tests (Playwright) on the portal's key pages.
3. Add CI checks to the workflow: run the tests, run secret scanning, and fail the deploy on errors. (Changes `.github/workflows`, so it needs explicit approval.)
4. Run a page-level accessibility audit (keyboard, focus, contrast, reduced motion, screen reader on pop-ups and menus) and fix findings.
5. Add a performance budget and measure a baseline.
6. Add a Content-Security-Policy plan; apply when a host that can set headers exists (Phase 3).
**Exit.** Tests run in CI and pass; audit findings triaged with owners; baseline numbers recorded.
**Tests.** The ones above are the deliverable. Record results in `docs/`.

### Phase 3: Identity and platform

**Entry.** G0 answers to D2, D3, D10, D11; G2.
**Work.**
1. Choose host and domain (parent domain for shared sessions). Stand up staging and production behind a proxy that sets security headers.
2. Build the identity service: Google sign-in limited to the DLSU domain, directory table, coarse roles, module role assignments, audit log.
3. Build the shared client for modules (session check, role claims) and the module manifest reader in the portal.
4. Replace the VO dashboard login and any published-sheet access to personal data with server-side reads (S3).
5. Backups, restore test, monitoring, incident process.
**Exit.** Sign-in works in staging with test accounts only; every protected route proven to deny by default; audit log records sign-ins and role changes; restore tested.
**Tests.** Unit tests for role logic; integration tests for sign-in and deny-by-default; end-to-end tests of each role's landing page; negative tests (wrong domain, disabled account, tampered session); dependency and secret scanning. 
**Security review (G3).** Checklist based on OWASP ASVS Level 2 for the identity service; findings fixed or accepted in writing by the owner.

### Phase 4: Modules on the platform

Order, by value and risk: (a) Request a Service, (b) Student Grants, (c) Virtual Office dashboard, (d) Research dashboard and records, (e) Academic dashboard, (f) News and events with approval, (g) Partners, (h) Equipment and inventory, directory.

For each module:
1. **Specify.** Update Module-Specifications.md; list its data, roles, events, and open questions.
2. **Design approval.** Component sheet from Phase 1 signed off.
3. **Build** behind the contract (Architecture section 8) with its own repo, release and changelog.
4. **Test.** Unit, integration, end-to-end for each role, accessibility, load at expected volume, upload tests for Grants.
5. **Security review.** Authorization matrix test (every role against every action), privacy review with the DPO for any personal data, retention set.
6. **Integrate.** Manifest registered in the portal; fallback shown if unavailable; deep links tested.
7. **Approve (G4).** Owner signs off the module; changelog updated; tag created.

Module-specific work:

| Module | Special items |
| --- | --- |
| Tracker | Confirm service catalog and SLA hours with the office; real notification templates |
| Grants | Obtain missing rules (quotas, expenses, retention, FAO template); DPO sign-off on the privacy notice; replace Apps Script with the backend; file scanning |
| VO dashboard | Decide what personal data the queue log may hold; aggregate on the server; suppress small groups (D16) |
| Research | Faculty consent (D14); Scopus API access and licence; review process for self-reported entries |
| Academic dashboard | Identify the data source and owner at the registrar; confirm what may be shown |
| News and events | Approval workflow, area tags, who approves Jubilee highlights (D15) |

### Phase 5: Pilot and release

**Entry.** G4 for the pilot modules; content owners have confirmed content marked *to be confirmed*.
**Work.**
1. Pilot with a small group per role using real accounts but limited data; collect feedback.
2. User acceptance testing against the PRD requirements.
3. Final accessibility and security re-check.
4. Operations runbook: owners, support path, backup and restore, incident contact, how to roll back a module.
5. Training notes and a short "how to post news and events" guide for owners.
6. Go-live decision (G5) and announcement.
**Exit.** UAT passed; security and accessibility sign-off; runbook accepted; rollback rehearsed.

## 4. Test strategy summary

| Level | Scope | Tooling (needs approval to add) |
| --- | --- | --- |
| Static checks | HTML validity, links, formatting, secret scan | HTML validator, link checker, secret scanner |
| Unit | Role logic, validation, SLA and routing rules | Test runner for the chosen backend language |
| Integration | API plus database, sign-in, audit | Test database in CI |
| End-to-end | Key journeys per role | Playwright |
| Accessibility | Automated (axe) plus manual keyboard and screen reader | axe, NVDA or VoiceOver |
| Performance | Page weight and load on mid-range phone | Lighthouse or equivalent |
| Security | Authorization matrix, dependency scan, ASVS L2 checklist, manual review | SCA tool, review |
| UAT | Real users from each role | Scripted tasks |

## 5. Dependencies between phases and decisions

| Needs | Before |
| --- | --- |
| D2 architecture | Phase 3 can start |
| D3, D11 identity and student list | Phase 3 directory |
| D10 designated admins | Any dashboard |
| D14 faculty consent | Research records, directory |
| D16, D17 small-group and retention rules | Any module that stores or shows personal data |
| DPO review | Any real personal data |

## 6. What is safe to do now

- Documentation (this round).
- Phase 0 questions and inspections.
- Content confirmation by door owners.
- Small portal fixes that do not touch access or data, after approval.

## 7. Change control

Changes that alter approved scope (adding or removing a door or module, changing roles or access rules, changing hosting or data storage)
need the owner's written approval and an update to PRD.md first. Each change is recorded in CHANGELOG.md for the repo it affects.
