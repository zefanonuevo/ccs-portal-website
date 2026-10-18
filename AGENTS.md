# AGENTS.md: working on the CCS Commons portal

Instructions for people and AI agents changing this repository. Read this first, then the documents it points to.

> **Status of this file:** Proposed, drafted 2026-10-19 for owner approval. The rules below that restate
> existing behaviour are marked *(existing)*. Rules marked *(proposed)* take effect once approved.

## What this project is

CCS Commons is the public front door of the College of Computer Studies (CCS): a static website that
organizes the college into five doors (Study, Services, Research, Partners, People), shows Jubilee
strategy progress, and links to separate CCS systems (Task Tracker, Student Grants, dashboards).
*(existing)*

It is a **continuing project**. Do not rebuild it, replace its stack, or restructure it without approval.

## Where decisions live

| Question | Read |
| --- | --- |
| What are we building, for whom, and what is still undecided? | [docs/PRD.md](docs/PRD.md) |
| How is it built, and what is the target architecture? | [docs/Architecture.md](docs/Architecture.md) |
| What does each module do and how does it plug in? | [docs/Module-Specifications.md](docs/Module-Specifications.md) |
| How should it look, move and behave? | [docs/DESIGN.md](docs/DESIGN.md) (the UI/UX guidelines) |
| What order do we build in, and how is it tested? | [docs/Implementation-Plan.md](docs/Implementation-Plan.md) |
| What changed in each release? | [CHANGELOG.md](CHANGELOG.md) |
| Original blueprints | Claude artifacts *CCS Portal Blueprint v2* and *CCS Commons Blueprint 1.2* (1.2 supersedes v2 where they differ) |

When documents disagree, the order of authority is: owner's latest written decision, then Blueprint 1.2,
then Blueprint v2, then these documents, then the code. Fix the disagreement in the document; do not
silently pick one.

## Truthfulness rules *(proposed)*

- Label statements as **Existing (verified)**, **Existing (not tested)**, **Proposed**, or **Decision needed**.
- Never write that a feature, integration or security control works unless it was run and observed.
  "The code contains X" is allowed. "X works" needs evidence.
- Content copied or summarized from the old CCS site stays marked *to be confirmed* until its owner confirms it.
- Sample or fictional data is always labelled as such.

## Stack and layout *(existing)*

Plain HTML, CSS and JavaScript. No framework, no bundler, no package manager, no build step. Hosted on GitHub Pages
(`.github/workflows/pages.yml` publishes the repo root on every push to `main`).

```
*.html                 pages (study, services, research, partners, people, programs, about, departments, jubilee, resources, index)
academics|community|partnerships.html   old addresses that redirect
assets/css/tokens.css  portal tokens, loaded after ccs-design
assets/css/site.css    components and layout
assets/js/config.js    module links, release number, access matrix (preview only)
assets/js/site.js      nav, mega menu, side menu, search, role preview, register pop-up, footer
assets/js/programs.js  degree programs filter and pop-up
assets/js/dots.js      dot background
docs/                  project documentation
```

Run locally: `python -m http.server 8080`, then open http://localhost:8080.

## Rules for changes

**General**
1. Do not install, remove or upgrade dependencies, or add a build step, without approval. *(proposed)*
2. Do not change `.github/workflows`, `.gitignore`, or other configuration without approval. *(proposed)*
3. Do not commit, tag or push unless the owner asks. *(proposed)*
4. Do not edit other CCS repos (`ccs-task-tracker`, `ccs-scgss`, `ccs-vo-dashboard`, `ccs`, `ccs-design`) from this
   repo's work without approval. They are separate products with their own owners and changelogs. *(proposed)*
5. Never commit secrets, tokens, passwords, personal data or real student records. *(proposed)*

**Design** (details in docs/DESIGN.md)
6. Colors and type come from tokens (`ccs-design` plus `assets/css/tokens.css`). No raw hex in components. *(existing convention)*
7. Palette is green, black and white, with amber only for attention and used sparingly. *(existing, Blueprint v2)*
8. Animate only `transform`, `opacity` and color. Respect `prefers-reduced-motion`. Hover effects only for real pointers. *(existing)*
9. Every interactive element needs a visible focus state and a touch target of at least 44 px on touch screens. *(proposed standard; applied to the header, footer and sign-in in v0.5.1, not audited elsewhere)*
10. Status is never shown by color alone; always add a word. *(existing, Blueprint v2)*

**Content**
11. Keep navigation at five doors. New content goes inside a door. *(existing, Blueprint 1.2)*
12. Plain words: "What you will study", not "Course Curriculum Breakdown". Spell out acronyms on first use. *(existing)*
13. Dashboards show totals, not named students, and hide very small groups. *(Blueprint v2 guardrail; threshold undecided)*

**Releases** *(existing process)*
14. A release updates `release` in `assets/js/config.js` and adds an entry to `CHANGELOG.md`.
15. Then, when the owner asks, tag `vX.Y.Z` and publish a GitHub Release.
16. Stylesheets and scripts carry the release in their address (`?v=`) so cached copies are not served. Update the
    number in every page when the release changes.

## Before saying something is done

- Open the changed page in a browser at phone width (375 px) and desktop width. Check there is no sideways scroll.
- Check keyboard use: Tab order, focus visible, Esc closes pop-ups.
- Check light and dark theme.
- Check the browser console for errors.
- State what you checked and what you did not. There are no automated tests yet. *(see Implementation Plan, Phase 2)*

## Security reminders

The portal has **no sign-in and no server**. Anything in this repo is public. Do not describe the "Viewing as" switch
as access control. It is a preview only. Real access control must be enforced on a server
([docs/Architecture.md](docs/Architecture.md)).
