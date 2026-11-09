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
- The sign-in limit held: 20 attempts from one address were allowed, then 429 (the unit test covers the 21st). A spoofed `X-Forwarded-For` is honoured when it comes straight to port 3000, which only Apache can reach.
- **Defect found and fixed:** a very large sign-in body made Express send its default error page, which includes a stack trace with server file paths unless `NODE_ENV=production`.
  The server now answers `413` with short JSON, and the service file sets `NODE_ENV=production`. If your installed unit lacks that line, add it and restart.
- Known, left as is: file names are case-insensitive (`/assets/js/CONFIG.JS` works); (Content-Security-Policy and HSTS were added afterwards, see below);
  `users.js import` with a missing file prints the system error text. `X-Forwarded-For` is trusted from one hop, so port 3000 must stay bound to 127.0.0.1 (it is).

## Security headers
Every response carries a Content-Security-Policy (default-src 'self'; `base-uri 'self'`, `object-src 'none'`, `form-action 'self'`, `frame-ancestors 'self'`;
scripts only from this site and Google's sign-in script; the three tiny redirect pages are allowed by hash, computed at start-up) and, when `BASE_URL` is https,
`Strict-Transport-Security: max-age=31536000` (one year, no `includeSubDomains`, no preload). Tested in a browser against the local server with no violations.
**Not yet seen on the live site:** after deploying, open the portal with the browser console open (F12), sign in, open the Virtual Office form pop-up, and look for
"Refused to ..." messages. If one names a site the pages really need (for example a font host), add that site to the matching directive in `server/app.js`.
Inline style attributes are used all over the pages, so `style-src` still allows `'unsafe-inline'`; scripts do not.
To roll back quickly, set `Content-Security-Policy-Report-Only` instead of `Content-Security-Policy` in `server/app.js`.

## Backups and restore
The user list, sessions and audit log live in one SQLite file (`server/data/ccs.db`). `server/backup.js` copies it with SQLite's own backup (safe while the server runs), checks the copy, and keeps the newest 14 (`BACKUP_KEEP`) in `/var/backups/ccs-portal` (`BACKUP_DIR`). Copies are readable only by the service user because they hold emails.

**Set up once (VM):**
```
sudo mkdir -p /var/backups/ccs-portal && sudo chown ccsportal:ccsportal /var/backups/ccs-portal && sudo chmod 700 /var/backups/ccs-portal
cd /var/www/ccs-portal/server && sudo -u ccsportal node backup.js          # should print "Backup OK ... (73 people)"
sudo cp deploy/ccs-portal-backup.cron /etc/cron.d/ccs-portal-backup && sudo chmod 644 /etc/cron.d/ccs-portal-backup
```
Check the next morning: `ls -l /var/backups/ccs-portal` and `journalctl -t ccs-portal-backup --since yesterday`. A line starting `Backup FAILED` means it did not work.

**Restore** (for example after the database file is damaged or deleted):
```
sudo systemctl stop ccs-portal
cd /var/www/ccs-portal/server/data && sudo -u ccsportal mv ccs.db ccs.db.broken; sudo rm -f ccs.db-wal ccs.db-shm
sudo -u ccsportal cp /var/backups/ccs-portal/ccs-YYYYMMDD-HHMMSS.db ccs.db       # pick the newest good file; names are UTC
sudo systemctl start ccs-portal
cd .. && sudo -u ccsportal node users.js list                                      # check the people are there
```
Anyone added or changed after that backup has to be added again; sign-in sessions made after it are gone, so people sign in again.

**Limit:** the copies sit on the same VM. If the VM's disk is lost, they are lost too. Copy `/var/backups/ccs-portal` to another place now and then (DLSU storage, or another machine with `rsync`), and treat the copies as personal data.

## Sign-in hardening (2026-11-09, from the OWASP review)
- **Nonce.** The page first asks `GET /auth/nonce` for a one-time number (valid 5 minutes, used once), gives it to Google, and Google puts it inside the ID token. The server refuses a token whose number was not issued here, was already used, or does not match. A stolen or replayed token no longer signs anyone in.
- **Limits.** Only failed sign-ins count: 60 per 10 minutes per address (campus users may share one address). Good sign-ins and wrong-origin requests never count. The table cannot grow without end. Each person keeps at most 5 live sessions; the oldest are dropped.
- **Logging.** The audit log now also records `protected_denied` (a signed-out or wrong-role request to `/protected/`) and `rate_limited`, at most 10 lines per address per 10 minutes so the log cannot be flooded. Lines older than `AUDIT_DAYS` (default 180) are deleted daily. **180 days is a placeholder: set it to what DLSU's data privacy office requires.**
- **Cookie.** Renamed `__Host-ccs_sid` (https only, this host only, whole site). Everyone must sign in again once after deploying. In local development (`NODE_ENV=development`) the old name `ccs_sid` is used because the prefix needs https.
- **Dependencies.** `npm audit` reports 2 moderate findings (`uuid` through `gaxios`, inside `google-auth-library`). The flaw is in `uuid` v3, v5 and v6 with a buffer argument; `gaxios` only calls `v4`, so it is not reachable. `npm audit fix` cannot clear it (checked 2026-11-09). Accepted until `google-auth-library` ships an update; re-check with `npm audit --omit=dev` after each dependency update.

## Decisions
- **2026-11-09, Student Grants stays at `/scgss/`** on the portal's address (served by Apache, not Node), instead of its own subdomain. Accepted risk: it shares the origin, so a script flaw in it could call the portal's `/api/me` or sign people out (the session cookie is HttpOnly and stays safe). **Revisit** when the Student Grants app changes how it handles scripts or user input, or when restricted content goes live on the portal; then move it to its own subdomain.
- **2026-11-09, audit log kept 180 days** (`AUDIT_DAYS`, default). A placeholder until DLSU's data privacy office gives a period.
- **SQLite, not PostgreSQL,** for the live portal: a few tables, one process, a few dozen people. Revisit if modules with many writers move onto this server.

## Known gaps (Decision needed)
- The user list source: this uses SQLite. A Google Sheet sync is possible later; the server would read the local copy.
- Guest rights (D7): guests are signed in with no extra rights. Nothing in `/protected/` allows them yet.
- DLSU IT approval of the OAuth app and the data privacy office's approval of the user list.
- `npm audit` reports 2 moderate findings in `uuid`, pulled in by `google-auth-library`. They concern an option this server never uses. Re-check when upgrading.
- Sessions are kept in the same database; a very large number of users would need a cleanup job (expired rows are removed at each new sign-in).
