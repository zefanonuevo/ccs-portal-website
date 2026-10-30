'use strict';
/* SQLite storage: users (the directory), sessions, audit log.
   Sessions store only a hash of the cookie value, so a copy of the database cannot be replayed as a login. */
const Database = require('better-sqlite3');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROLES = ['admin', 'faculty', 'staff', 'student'];

function open(file) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email      TEXT PRIMARY KEY,
      role       TEXT NOT NULL CHECK (role IN ('admin','faculty','staff','student')),
      name       TEXT NOT NULL DEFAULT '',
      program    TEXT NOT NULL DEFAULT '',
      active     INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id_hash    TEXT PRIMARY KEY,
      email      TEXT NOT NULL,
      name       TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions (expires_at);
    CREATE TABLE IF NOT EXISTS audit (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      ts     TEXT NOT NULL,
      email  TEXT NOT NULL DEFAULT '',
      event  TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      ip     TEXT NOT NULL DEFAULT ''
    );
  `);
  return db;
}

const now = () => new Date().toISOString();
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
const normEmail = (e) => String(e || '').trim().toLowerCase();

function makeStore(db) {
  const q = {
    getUser: db.prepare('SELECT email, role, name, program, active FROM users WHERE email = ?'),
    upsertUser: db.prepare(`
      INSERT INTO users (email, role, name, program, active, updated_at) VALUES (@email, @role, @name, @program, @active, @ts)
      ON CONFLICT(email) DO UPDATE SET role = @role, name = @name, program = @program, active = @active, updated_at = @ts`),
    setActive: db.prepare('UPDATE users SET active = ?, updated_at = ? WHERE email = ?'),
    listUsers: db.prepare('SELECT email, role, name, program, active FROM users ORDER BY role, email'),
    addSession: db.prepare('INSERT INTO sessions (id_hash, email, name, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'),
    getSession: db.prepare('SELECT email, name FROM sessions WHERE id_hash = ? AND expires_at > ?'),
    delSession: db.prepare('DELETE FROM sessions WHERE id_hash = ?'),
    delExpired: db.prepare('DELETE FROM sessions WHERE expires_at <= ?'),
    addAudit: db.prepare('INSERT INTO audit (ts, email, event, detail, ip) VALUES (?, ?, ?, ?, ?)'),
    lastAudit: db.prepare('SELECT ts, email, event, detail, ip FROM audit ORDER BY id DESC LIMIT ?')
  };

  return {
    ROLES,
    /** The role for an email, or 'guest' when the person is not listed or is switched off. Read on every request, so changes apply at once. */
    roleFor(email) {
      const u = q.getUser.get(normEmail(email));
      return u && u.active === 1 && ROLES.includes(u.role) ? u.role : 'guest';
    },
    getUser: (email) => q.getUser.get(normEmail(email)),
    upsertUser({ email, role, name = '', program = '', active = true }) {
      email = normEmail(email);
      role = String(role || '').trim().toLowerCase();
      if (!ROLES.includes(role)) throw new Error('Role must be one of: ' + ROLES.join(', '));
      q.upsertUser.run({ email, role, name: String(name).trim(), program: String(program).trim(), active: active ? 1 : 0, ts: now() });
    },
    setActive(email, active) { return q.setActive.run(active ? 1 : 0, now(), normEmail(email)).changes; },
    listUsers: () => q.listUsers.all(),
    createSession(email, name, hours) {
      q.delExpired.run(now());
      const id = crypto.randomBytes(32).toString('base64url');
      const created = new Date();
      const expires = new Date(created.getTime() + hours * 3600 * 1000);
      q.addSession.run(hash(id), normEmail(email), String(name || ''), created.toISOString(), expires.toISOString());
      return { id, expires };
    },
    findSession(id) {
      if (!id) return null;
      return q.getSession.get(hash(String(id)), now()) || null;
    },
    deleteSession(id) { if (id) q.delSession.run(hash(String(id))); },
    audit(email, event, detail = '', ip = '') { q.addAudit.run(now(), normEmail(email), event, String(detail).slice(0, 300), ip); },
    lastAudit: (n = 20) => q.lastAudit.all(n)
  };
}

/** Minimal CSV reader: header row, comma separated, double quotes for fields that contain commas. */
function parseCsv(text) {
  const rows = [];
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = [];
    let cur = '', quoted = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (quoted) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') quoted = false;
        else cur += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') { cells.push(cur); cur = ''; }
      else cur += c;
    }
    cells.push(cur);
    rows.push(cells.map((s) => s.trim()));
  }
  return rows;
}

module.exports = { open, makeStore, parseCsv, normEmail, ROLES };
