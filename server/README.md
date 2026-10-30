# CCS Commons server

**Status: Proposed. Written on branch `google-auth-server` and tested only with a stubbed Google check (see Testing).
Not yet run on the VM and not yet run against real Google.**

A small Node.js server for the CCS VM. It serves the same public pages as before and adds:

- Google sign-in, limited to `@dlsu.edu.ph` accounts with a verified email (token checked by Google's library, then domain and `hd`).
- Roles (`admin`, `faculty`, `staff`, `student`; anyone else signed in is `guest`) from a SQLite table on the VM.
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
3. **Settings.** `cp .env.example .env`, then `chmod 600 .env` and fill in `GOOGLE_CLIENT_ID` and `BASE_URL` (your https address).
4. **Your first user.** `node users.js add your.address@dlsu.edu.ph admin "Your Name"` then `node users.js list`.
5. **Run as a service.** Copy `deploy/ccs-portal.service` to `/etc/systemd/system/`, edit `User` and `WorkingDirectory`, then
   `sudo systemctl daemon-reload && sudo systemctl enable --now ccs-portal`. Check: `curl http://127.0.0.1:3000/healthz` prints `ok`.
   Logs: `journalctl -u ccs-portal -e`.
6. **Apache.** `sudo a2enmod proxy proxy_http headers`, merge the lines from `deploy/apache-ccs-portal.conf` into your existing HTTPS virtual host,
   then `sudo apache2ctl configtest && sudo systemctl reload apache2`. Apache must no longer serve the repo folder directly.
7. **Google.** Google Cloud Console, OAuth client of type *Web application*. Authorized JavaScript origin: your https address (no path, no trailing slash).
   No redirect URI is needed. No client secret is used.
8. **Try it.** Open the site, press Sign in, use the listed account. The top bar should say "Signed in as Admin".
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
`cd server && npm test` runs 13 tests against a stubbed Google check: domain and `hd` rules, unverified and garbage tokens, same-origin check,
rate limit, sessions (logout, expiry, role change, switched off), `/protected` deny by default and path tricks, which files are public, the users tool.
They do not prove that Google accepts your OAuth client, or that Apache is set up correctly. Check those on the VM (steps 7 and 8).

## Known gaps (Decision needed)
- The user list source: this uses SQLite. A Google Sheet sync is possible later; the server would read the local copy.
- Guest rights (D7): guests are signed in with no extra rights. Nothing in `/protected/` allows them yet.
- DLSU IT approval of the OAuth app and the data privacy office's approval of the user list (see `prototypes/google-signin/README.md`).
- `npm audit` reports 2 moderate findings in `uuid`, pulled in by `google-auth-library`. They concern an option this server never uses. Re-check when upgrading.
- Sessions are kept in the same database; a very large number of users would need a cleanup job (expired rows are removed at each new sign-in).
