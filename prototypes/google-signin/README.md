# Google sign-in prototype

**Status: Proposed prototype.** Sample mode was run in a browser (see CHANGELOG 0.13.0). Real Google mode was only
exercised with a mocked Google and backend; it has **not** been run against real Google.

## What it is
- `assets/js/site.js` adds a Sign in pop-up. `assets/js/config.js` has the `signin` block.
- `Code.gs` is a Google Apps Script web app. It verifies the Google ID token (app, expiry, verified email, DLSU domain),
  then reads the `Users` sheet and returns the role, or `guest` if the person is not listed or is inactive.
- `users-sample.csv` is the starting sheet. Replace the sample rows. Never commit real people to this public repo.

## Important
The role is used only to change what the page shows. The portal is still static and public, so **nothing is
protected**. Real access control needs a server that re-checks the token on every call (Architecture, section 6).

## Setup (real mode)
1. Create a Google Sheet, rename a tab to `Users`, import `users-sample.csv`, share it with Admins only.
2. Google Cloud Console: new project, Google Auth Platform, Branding user type **Internal**, create an OAuth
   client of type *Web application*. Authorized JavaScript origins: the Pages address and `http://localhost:8080`.
3. In the sheet: Extensions, Apps Script, paste `Code.gs`. Project Settings, Script properties: `CLIENT_ID` = the client ID.
   Deploy as a Web app, execute as *Me*, access *Anyone* (every request is refused without a valid Google token).
4. Put the client ID and the `/exec` address in `signin` in `assets/js/config.js`.
5. Test: a listed account, an unlisted DLSU account (Guest), and a non-DLSU account (refused).

## Decisions needed
Loading Google's script (AGENTS rule 1), who keeps the Users list (D5), guest rights (D7), Apps Script quotas,
DLSU IT approval of the OAuth app, data privacy office approval of the user list.
