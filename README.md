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

The portal links to, and later embeds, three sibling systems and one Google Form that opens in a pop-up. Both are set in `assets/js/config.js` under `modules`.

| Module | Portal label | Repo | Live |
| --- | --- | --- | --- |
| CCS Task Tracker | Request a Service | [ccs-task-tracker](https://github.com/zefanonuevo/ccs-task-tracker) | https://zefanonuevo.github.io/ccs-task-tracker/ |
| CCS Student Conference Grant Support System | Student Grants | [ccs-scgss](https://github.com/zefanonuevo/ccs-scgss) | https://zefanonuevo.github.io/ccs-scgss/ |
| CCS Virtual Office Registration | Register form (Community, Virtual Office) | Google Form, opens in a pop-up | https://docs.google.com/forms/d/e/1FAIpQLScxxeeRJRwj0GbZBP6ahK0fUJOmgXz0ASjOI8aDNTrTBWj4QQ/viewform |
| CCS Virtual Office Dashboard | Usage dashboard (Community, Virtual Office) | [ccs-vo-dashboard](https://github.com/zefanonuevo/ccs-vo-dashboard) | https://zefanonuevo.github.io/ccs-vo-dashboard/ |

To point at a different deployment, change its `url` in `config.js`. Nothing else moves.

## Same design everywhere

Every page loads [ccs-design](https://github.com/zefanonuevo/ccs-design) (`ccs-tokens.css`, v2) first. Its palette is green, white and black, and the same file drives the Task Tracker and the Grant Support System. `assets/css/tokens.css` adds portal-only tokens (band, nav, motion timings) on top. To change the palette for all three sites, edit ccs-design.

## Versions and restoring

Every release is a git tag with a GitHub Release, and [CHANGELOG.md](CHANGELOG.md) says
what changed in each. The release number is shown in the footer of every page.

| Release | What it is |
|---|---|
| `v0.1.0` | Draft v1 from the blueprint |
| `v0.2.0` | Connected to the Task Tracker, Grant Support and the shared design |
| `v0.3.0` | Green, white and black palette and system font from `ccs-design` v2 |
| `v0.4.0` | Usage dashboard link |
| `v0.5.0` | Registration form pop-up, release number in the footer |
| `v0.5.1` | Pop-up fallback link, touch tap sizes, menu scroll lock |
| `v0.6.0` | Registration pop-up redesign |
| `v0.6.1` | New colour palette, cache refresh |
| `v0.7.0` | Research dashboard link |

**Look at an old release.** Open `https://github.com/zefanonuevo/ccs-portal-website/tree/v0.3.0`
(swap in any tag), or download its zip from the Releases page.

**Run it on your computer.**
```bash
git clone https://github.com/zefanonuevo/ccs-portal-website.git
cd ccs-portal-website
git checkout v0.3.0
python3 -m http.server 8080      # then open http://localhost:8080
```

**Put an old release back on the live site.** This keeps the history, so you can go
forward again. Pushing to `main` redeploys the site.
```bash
git checkout main
git rm -rq .                      # clear the working files ...
git checkout v0.3.0 -- .          # ... and bring back exactly that release's files
git commit -m "Restore v0.3.0"
git push
```

Only the portal's own files are versioned. The Task Tracker, Grant Support System,
Virtual Office Dashboard and the Google Form are separate and always show their latest
version. The shared design stylesheet is loaded with a `?v=` number that is part of each
release's HTML, so an old release keeps asking for the stylesheet it was built with.

To cut a new release: update `release` in `assets/js/config.js` and add an entry to
`CHANGELOG.md`, commit, then `git tag -a vX.Y.Z -m "..."` and `git push --tags`.

## Draft status

- Sample content is marked "Sample".
- "Viewing as" previews the access matrix from the blueprint. It is **not enforced**. Real access control must be done on the server when sign-in is built.
- Sign-in is a disabled placeholder.
- Open decisions are listed on the last slide of the blueprint (area labels, portal name, student list source, public syllabi, guest access, publication consent).
