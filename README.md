# ccs-portal-website

CCS Compass: the portal for the College of Computer Studies. **Draft v1.**

Built from *CCS Portal Blueprint v2*. A static site (HTML, CSS, a little JavaScript, no build step), deployed to GitHub Pages.

## Run it locally

```bash
python -m http.server 8080
```

Open http://localhost:8080.

## Deploy

Push to `main`. `.github/workflows/pages.yml` publishes the repo root to GitHub Pages.
One-time setup: **Settings → Pages → Source: GitHub Actions**.

## How it is organized

| Path | What |
| --- | --- |
| `index.html` | Home: search, quick actions, four areas, Jubilee thread, news, connected systems |
| `academics.html` `community.html` `partnerships.html` `research.html` | The four areas |
| `resources.html` | Side menu: news, events, forms, policies, how things work |
| `assets/css/tokens.css` | Design tokens (green, black, white). Shared with the other CCS systems |
| `assets/css/site.css` | Components and layout |
| `assets/js/config.js` | **Module links and the access matrix. Edit here to wire a system in** |
| `assets/js/site.js` | Nav, side menu, search, role preview, scroll reveal |
| `docs/DESIGN.md` | Design and motion decisions |

## Connected systems

The portal links to, and later embeds, two sibling systems. Both are set in `assets/js/config.js` under `modules`.

| Module | Portal label | Repo (planned) | Today |
| --- | --- | --- | --- |
| CCS Task Tracker | Request a Service | `ccs-task-tracker` | Claude artifact prototype |
| CCS Student Conference Grant Support System | Student Grants | `ccs-scgss` | Claude artifact mockups |

When a system gets its own deployment, change its `url` in `config.js`. Nothing else moves.

## Same design everywhere

Other CCS systems should import `assets/css/tokens.css` (or copy its `:root` block) so color, type, shape and motion stay identical. The Design System artifact is the visual reference; this file is the code source.

## Draft status

- Sample content is marked "Sample".
- "Viewing as" previews the access matrix from the blueprint. It is **not enforced**. Real access control must be done on the server when sign-in is built.
- Sign-in is a disabled placeholder.
- Open decisions are listed on the last slide of the blueprint (area labels, portal name, student list source, public syllabi, guest access, publication consent).
