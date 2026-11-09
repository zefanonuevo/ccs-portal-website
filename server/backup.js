'use strict';
/* Nightly backup of the CCS Commons database (users, sessions, audit).
   Uses SQLite's own online backup, so it is safe while the server is running (copying the file by hand is not).
   Settings (environment variables, all optional):
     DB_PATH      database to copy            (default: server/data/ccs.db)
     BACKUP_DIR   where copies go             (default: /var/backups/ccs-portal)
     BACKUP_KEEP  how many copies to keep     (default: 14)
   Run it as the same user as the service:  sudo -u ccsportal node backup.js */
const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch (e) { /* no .env file */ }

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'ccs.db');
const dir = process.env.BACKUP_DIR || '/var/backups/ccs-portal';
const keep = Math.max(1, Number(process.env.BACKUP_KEEP) || 14);
const NAME = /^ccs-\d{8}-\d{6}\.db$/;

async function main() {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  const stamp = d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + '-' + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds());
  const file = path.join(dir, 'ccs-' + stamp + '.db');

  const src = new Database(dbPath, { readonly: true, fileMustExist: true });
  try { await src.backup(file); } finally { src.close(); }
  fs.chmodSync(file, 0o600);

  // Check the copy before trusting it, and delete it if it is bad.
  const copy = new Database(file, { fileMustExist: true });
  let users, ok;
  try { copy.pragma('journal_mode = DELETE'); /* one self-contained file, no -wal or -shm beside it */ ok = copy.pragma('integrity_check', { simple: true }); users = copy.prepare('SELECT COUNT(*) AS n FROM users').get().n; } finally { copy.close(); }
  if (ok !== 'ok') { fs.unlinkSync(file); throw new Error('Backup failed its integrity check and was deleted: ' + ok); }

  const all = fs.readdirSync(dir).filter((f) => NAME.test(f)).sort().reverse();
  const old = all.slice(keep);
  old.forEach((f) => fs.unlinkSync(path.join(dir, f)));
  console.log('Backup OK: ' + file + ' (' + users + ' people). Kept ' + (all.length - old.length) + ' copies, removed ' + old.length + ' old.');
}

main().catch((e) => { console.error('Backup FAILED: ' + e.message); process.exit(1); });
