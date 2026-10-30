# AGENTS.md: working on the CCS Commons portal

Instructions for people and AI agents changing this repository. Read this first, then the documents it points to.

> **Status of this file:** Proposed, drafted 2026-10-19 for owner approval. The rules below that restate
> existing behaviour are marked *(existing)*. Rules marked *(proposed)* take effect once approved.
> **Updated 2026-10-30** to describe the sign-in server on the CCS VM. Statements about the server are labelled by what was
> actually run and observed that day (see Truthfulness rules). Nothing else in this file was re-checked.

## What this project is

CCS Commons is the public front door of the College of Computer Studies (CCS): a website made of static pages that
organizes the college into five doors (Academics, Services, Research, Partners, People), shows Jubilee
strategy progress, and links to separate CCS systems (Task Tracker, Student Grants, dashboards).
*(existing)* On the CCS VM a small server in front of those pages adds Google sign-in and role checks (see Stack and layout).

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
| How is the server installed, run, updated and managed on the VM? | [server/README.md](server/README.md) |
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

## Stack and layout

**Pages (front end) *(existing)*.** Plain HTML, CSS and JavaScript. No framework, no bundler, no package manager, no build step.

**Server on the CCS VM *(Existing (verified) on 2026-10-30, except where noted)*.** The `server/` folder is a Node.js 22 and Express
server (with `google-auth-library` and `better-sqlite3`; the only place with a `package.json`). The live site runs as:

```
visitor -> Cloudflare -> Apache (HTTPS, port 443) -> Node server on 127.0.0.1:3000 (systemd service ccs-portal, user ccsportal)
                                                    -> reads the pages from the repo folder /var/www/ccs-portal
```

- The server serves only the pages in the repo root and `assets/`. Everything else (`server/`, `docs/`, `.git/`, `prototypes/`) returns 404.
- It adds `signin.clientId`, `apiUrl` and `server` to `config.js` from `server/.env`, so the Google client ID is not edited into the repo.
- The users list, sessions and audit log are in a SQLite file under `server/data/` on the VM. It is git-ignored and never in the repo.
- Updating the VM: `git pull` in `/var/www/ccs-portal`. Changes to pages, styles and scripts show at once. Changes under `server/` need
  `sudo systemctl restart ccs-portal`. Apache, systemd and Cloudflare settings are changed by the owner on the VM (see rule 20).
- **GitHub Pages** (`.github/workflows/pages.yml` publishes the repo root on every push to `main`) still exists. That copy has no server, so
  it shows the sample sign-in only and protects nothing. *Existing (not tested after the 0.14.0 merge).*

```
*.html                 pages (academics, services, research, partners, people, programs, about, departments, jubilee, resources, index)
study|community|partnerships.html   old addresses that redirect
assets/css/tokens.css  portal tokens, loaded after ccs-design
assets/css/site.css    components and layout
assets/js/config.js    module links, release number, access matrix (preview only), sign-in settings
assets/js/site.js      nav, mega menu, side menu, search, role-based hiding, sign-in pop-up, register pop-up, footer
assets/js/programs.js  degree programs filter and pop-up
assets/js/dots.js      dot background
server/                sign-in server (app.js, db.js, access.js, index.js), users tool (users.js), tests (test/), deploy examples (deploy/)
protected/             files only signed-in roles may open, once a rule exists in server/access.js (folder not created yet; no rules yet)
prototypes/            earlier sign-in prototype (Google Apps Script); replaced by server/ on the VM, kept for reference
docs/                  project documentation
```

**Run locally.**
- Pages only: `python -m http.server 8080`, then open http://localhost:8080 (shows the sample sign-in; nothing is checked).
- Server: `cd server && npm ci && npm test` (13 tests with a stubbed Google check). To run it: `NODE_ENV=development GOOGLE_CLIENT_ID=<id> node index.js`
  then open http://127.0.0.1:3000. Real Google sign-in locally also needs that address added as an authorized JavaScript origin in Google Cloud.

## Rules for changes

**General**
1. Do not install, remove or upgrade dependencies, or add a build step, without approval. The pages have none. The server's are in `server/package.json` and
   its lock file (added with the owner's approval in chat on 2026-10-30: express, google-auth-library, better-sqlite3). *(proposed)*
2. Do not change `.github/workflows`, `.gitignore`, `server/deploy/`, `server/.env.example` or other configuration without approval. *(proposed)*
3. Do not commit, tag or push unless the owner asks. *(proposed)*
4. Do not edit other CCS repos (`ccs-task-tracker`, `ccs-scgss`, `ccs-vo-dashboard`, `ccs`, `ccs-design`) from this
   repo's work without approval. They are separate products with their own owners and changelogs. *(proposed)*
5. Never commit secrets, tokens, passwords, personal data or real student records. This includes the users list, `server/.env`, `server/data/` and any `.db` file. *(proposed)*

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
    number in every page when the release changes. This matters on the live site: on 2026-10-30 Cloudflare kept serving the old
    `config.js?v=0.13.0` (cache hit, 7-day lifetime) after the server changed, so the page showed the old sign-in until the number was raised.

**Server and deployment** *(proposed; numbers continue from above so earlier references stay valid)*
17. The Google client ID is public by design. It lives in `server/.env` on the VM, not in the repo. There is no client secret and no session secret.
18. Which roles may open which files goes in `server/access.js`, with the files in `protected/`. Deny by default. Add a test in `server/test/` for every new rule,
    and keep the access table in `assets/js/config.js` and the server rules in step (docs/PRD.md section 2.1).
19. A change that moves restricted content out of public pages must be checked by requesting it signed out, signed in with the wrong role and signed in with the right role.
20. Do not change Apache, systemd or Cloudflare settings on the VM, or run commands there, from repo work. Prepare the file or the exact commands and let the owner run them.

## Before saying something is done

- Open the changed page in a browser at phone width (375 px) and desktop width. Check there is no sideways scroll.
- Check keyboard use: Tab order, focus visible, Esc closes pop-ups.
- Check light and dark theme.
- Check the browser console for errors.
- If `server/` changed: run `cd server && npm test`. Say that these tests use a stubbed Google check, so they do not prove real Google behaviour, Apache or Cloudflare.
- For anything done on the VM, say which steps were run and which were not.
- State what you checked and what you did not. The pages have no automated tests yet *(see Implementation Plan, Phase 2)*. The server has 13 (`server/test/server.test.js`).

## Security reminders

- The pages are still static files. Anything in `*.html` and `assets/` is public, including content that a role hides in the browser.
  That hiding happens only in the browser. Do not describe it, or the access table in `config.js`, as access control.
- **Verified on the CCS VM on 2026-10-30:** the owner signed in with their DLSU Google account and the server's audit log recorded `login_ok role=admin`;
  the live `config.js` carries the client ID; the 13 server tests pass locally and on the VM (they cover refused sign-ins with a stubbed Google check,
  `/protected` returning 401 or 403, and which files are public); the audit log shows the visitor's own address after the Cloudflare address fix.
- **Not verified:** that non-DLSU and unlisted accounts are refused by real Google (only the stubbed tests cover this); requests to `/protected/` and `/docs/` on the live address;
  the sign-in pop-up and the "Signed in as" header at phone width and by keyboard;
  the audience setting of the Google project (Internal or External in Testing).
- **What the server enforces today:** sign-in, roles, and files under `protected/`. There are no rules yet, so nothing is protected. Role-restricted cards on the public pages
  are still in the page source until they are moved into `protected/` (rules 18 and 19).
- The GitHub Pages copy has no server and protects nothing.
- Details and known gaps: [server/README.md](server/README.md) and [docs/Architecture.md](docs/Architecture.md) section 6.

## Known out-of-date statements (to fix; Decision needed)

`docs/Implementation-Plan.md` and `docs/Module-Specifications.md` still say the portal is v0.12.0, and `docs/PRD.md` rows C8 and C10 describe the state at 0.12.0.
By the order of authority above, fix them in the documents rather than choosing between them.
