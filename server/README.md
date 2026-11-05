# CCS Commons server

**Status: Running on the CCS VM (`https://ccs.dlsu.edu.ph`). Real Google sign-in has been confirmed for the super administrator account.
Not yet confirmed: the refusal of a personal Gmail on the live site, faculty and student sign-ins, the Cloudflare bypass rule, and `/scgss/` through Apache.
The 16 tests use a stubbed Google check. A clean install from a fresh clone was repeated on 2026-11-05 (Node 22.23): `npm ci`, tests, start and API probes all passed.**

Architecture picture: [docs/architecture.svg](../docs/architecture.svg) (browser, Cloudflare, Apache, this API, SQLite, Google).

A small Node.js server for the CCS VM. It serves the same public pages as before and adds:

- Google sign-in, limited to `@dlsu.edu.ph` accounts with a verified email (token checked by Google's library, then domain and `hd`).
- Roles (`super-administrator`, `faculty-administrator`, `faculty`, `staff`, `student`) from a SQLite table on the VM. A faculty administrator is a faculty member plus the dashboard links. A DLSU account that is not listed is a `student` if the part before the `@` has an underscore
  (`juan_dela_cruz@`), otherwise a `guest`. A listed person always gets the listed role, and a listed person who is switched off is a `guest`.
- Sessions: a random cookie (`HttpOnly`, `Secure`, `SameSite=Lax`). Only its hash is stored. The role is read from the table on every request,
  so switching someone off or changing their role takes effect at once.
- Deny by default for `/protected/`: a file there is served only if a rule in `access.js` allows the signed-in role.
- An audit log of sign-ins, refusals, sign-outs and user changes.

Only the pages in the repo root and `assets/` are public. `server/`, `docs/`, `.git/` and everything else return 404.

**What this does not do yet.** The role-restricted cards on the public pages are still hidden in the browser only. Their text is in the page source.
To really protect something, move it into `protected/<area>/` and add a rule in `access.js`. Do this row by row from the access table in `assets/js/config.js`.

## Install on the Ubuntu VM (first time)

1. **Node.js 22 LTS.** Ubuntu's own `nodejs` package is too old for this. Use NodeSource (read the script first if you prefer):
   ```
   curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
   sudo bash /tmp/nodesource_setup.sh
   sudo apt-get install -y nodejs build-essential
   node -v        # should print v22.x
   ```
   `build-essential` is only needed if the SQLite library has no ready-made build for the machine.
2. **Get the code.** `git pull` on the branch that contains `server/`, then:
   ```
   cd <repo>/server
   npm ci --omit=dev
   ```
   The folder name on the live VM is `/var/www/ccs-portal` (not `ccs-portal-website`). Use your own path in steps 4 and 5.
3. **Settings.** `cp .env.example .env`, then `chmod 600 .env` and fill in `GOOGLE_CLIENT_ID` and `BASE_URL` (your https address, no trailing slash).
   If `GOOGLE_CLIENT_ID` is empty the server still starts, prints a warning, and every visitor is a guest. `BASE_URL` must match the address in the browser exactly,
   or every sign-in is refused with "Request not allowed from this address".
4. **Your first user.** `node users.js add your.address@dlsu.edu.ph super-administrator "Your Name"` then `node users.js list`.
5. **Run as a service.** Copy `deploy/ccs-portal.service` to `/etc/systemd/system/`, edit `User` and `WorkingDirectory`, then
   `sudo systemctl daemon-reload && sudo systemctl enable --now ccs-portal`. The unit sets `NODE_ENV=production`; keep it. The service user must be able to
   write `server/data/` (the database is created there on first start). Check: `curl http://127.0.0.1:3000/healthz` prints `ok`.
   Logs: `journalctl -u ccs-portal -e`.
6. **Apache.** `sudo a2enmod proxy proxy_http headers`, merge the lines from `deploy/apache-ccs-portal.conf` into your existing HTTPS virtual host,
   then `sudo apache2ctl configtest && sudo systemctl reload apache2`. Apache must no longer serve the repo folder directly.
7. **Google.** Google Cloud Console, OAuth client of type *Web application*. Authorized JavaScript origin: your https address (no path, no trailing slash).
   No redirect URI is needed. No client secret is used.
8. **Try it.** Open the site, press Sign in, use the listed account. The top bar should show your name and "Super Administrator".
   Then try an unlisted DLSU account (should be Guest) and a non-DLSU account (should be refused).

## Behind Cloudflare: real visitor addresses
If the domain goes through Cloudflare (check: `curl -sI https://<domain> | grep -i server` shows `cloudflare`), the server would see Cloudflare's
addresses instead of the visitors'. That breaks the sign-in rate limit (20 tries per 10 minutes per address, shared by everyone behind one Cloudflare address)
and makes the audit log record Cloudflare's addresses. To fix it, run on the VM:
```
cd /var/www/ccs-portal
sudo bash server/deploy/cloudflare-remoteip.sh
sudo a2enmod remoteip && sudo a2enconf cloudflare-remoteip
sudo apache2ctl configtest && sudo systemctl reload apache2
```
Apache then trusts the `CF-Connecting-IP` header only for connections coming from Cloudflare's published ranges (the script downloads them and refuses to write
anything if the download looks wrong). It applies to every site on that Apache. Re-run the script every few months, because Cloudflare can change its ranges.
Check: sign in, then `sudo -u ccsportal node users.js audit` (from `server/`) should show your own public address, not a Cloudflare one.
Status: Proposed. The script was tested only with sample lists, not against Cloudflare's real list or a real Apache.

## Serving another site under the same address (for example /scgss/)
This server only serves the portal pages and `assets/`, so any other path returns 404. A separate site such as Student Grants at `/scgss/` has to be served by Apache itself,
and the proxy rule must leave that path out. Put these lines in the HTTPS virtual host **before** the `ProxyPass /` line (Apache uses the first match):
```
Alias /scgss/ /var/www/scgss/
<Directory /var/www/scgss/>
    Require all granted
</Directory>
ProxyPass /scgss/ !
```
`/var/www/scgss/` is where the site's files are copied (for example a `git clone` of `ccs-scgss`; do not point it at the portal repo). Then `sudo apache2ctl configtest && sudo systemctl reload apache2`.
Anything under that path is public and has no sign-in check. Status: Proposed, not yet run on the VM.

## Updating
```
git pull
cd server && npm ci --omit=dev
sudo systemctl restart ccs-portal
```

## Managing people
`node users.js` with: `list`, `add <email> <role> [name]`, `disable <email>`, `enable <email>`, `import <file.csv>`, `audit [count]`.
CSV columns: `email,role,name,program,active`. The tool warns (does not block) when an address does not match its role: students look like
`juan_dela_cruz@`, staff and faculty like `maria.delacruz@`. The database lives in `server/data/ccs.db` and is git-ignored. Back it up,
for example by stopping the service and copying the file. Never commit it: it holds personal data.

## Testing
`cd server && npm test` runs 16 tests against a stubbed Google check: domain and `hd` rules, unverified and garbage tokens, same-origin check,
rate limit, sessions (logout, expiry, role change, switched off), `/protected` deny by default and path tricks, which files are public, the users tool, old-database migration, oversized bodies.
They do not prove that Google accepts your OAuth client, or that Apache is set up correctly. Check those on the VM (steps 7 and 8).

## QA notes (2026-11-05)
Clean install from a fresh clone, then probes against the running server:
- Code, docs, `.git`, `.env`, the database, `package.json` and `node_modules` all return 404; encoded and `..` paths return 404 or 400. Pages and `assets/` return 200.
- `/protected/*` returns 401 when signed out. Sign-in and sign-out without the site's `Origin` return 403. Bad or empty bodies return 400. A forged token returns 401.
- 7 failed sign-ins from one address were allowed before the limit (some earlier probes counted); then 429.
- **Defect found and fixed:** a very large sign-in body made Express send its default error page, which includes a stack trace with server file paths unless `NODE_ENV=production`.
  The server now answers `413` with short JSON, and the service file sets `NODE_ENV=production`. If your installed unit lacks that line, add it and restart.
- Known, left as is: file names are case-insensitive (`/assets/js/CONFIG.JS` works); no Content-Security-Policy; no HSTS (set it in Cloudflare);
  `users.js import` with a missing file prints the system error text. `X-Forwarded-For` is trusted from one hop, so port 3000 must stay bound to 127.0.0.1 (it is).

## Known gaps (Decision needed)
- The user list source: this uses SQLite. A Google Sheet sync is possible later; the server would read the local copy.
- Guest rights (D7): guests are signed in with no extra rights. Nothing in `/protected/` allows them yet.
- DLSU IT approval of the OAuth app and the data privacy office's approval of the user list (see `prototypes/google-signin/README.md`).
- `npm audit` reports 2 moderate findings in `uuid`, pulled in by `google-auth-library`. They concern an option this server never uses. Re-check when upgrading.
- Sessions are kept in the same database; a very large number of users would need a cleanup job (expired rows are removed at each new sign-in).
