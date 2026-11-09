'use strict';
/* Run: npm test (from server/). Google's token check is replaced by a stub, so these tests prove OUR rules
   (domain, roles, sessions, deny by default). They do not prove Google accepts your OAuth client. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const { open, makeStore } = require('../db');
const { createApp, checkPayload } = require('../app');

const ORIGIN = 'https://portal.test';
const REPO = path.resolve(__dirname, '..', '..');

function stubVerify(idToken) {
  // The stub token IS the payload, e.g. JSON {"email":..., "hd":..., "email_verified":true}
  let p; try { p = JSON.parse(idToken); } catch (e) { const err = new Error('Google rejected the sign-in'); err.reason = 'bad_token'; throw err; }
  return Promise.resolve(checkPayload(p, 'dlsu.edu.ph'));
}
const tok = (email, extra = {}) => JSON.stringify(Object.assign({ email, hd: 'dlsu.edu.ph', email_verified: true, name: 'Test Person' }, extra));

async function start({ rules = [], siteRoot = REPO } = {}) {
  const store = makeStore(open(':memory:'));
  const app = createApp({ store, verify: stubVerify, rules, config: { siteRoot, clientId: 'test-client-id.apps.googleusercontent.com', baseUrl: ORIGIN } });
  const server = await new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  return { store, base, close: () => server.close() };
}

async function getNonce(t) { return (await (await fetch(t.base + '/auth/nonce')).json()).nonce; }

/** Signs in the way the page does: ask for a nonce, "Google" puts it in the token (the stub token is JSON), post both.
    opts.nonce overrides what is sent in the request; opts.tokenNonce overrides what is inside the token. */
async function login(t, idToken, headers = {}, opts = {}) {
  const nonce = await getNonce(t);
  let token = idToken;
  try { const p = JSON.parse(idToken); if (p && typeof p === 'object') { p.nonce = 'tokenNonce' in opts ? opts.tokenNonce : nonce; token = JSON.stringify(p); } } catch (e) { /* not JSON: a forged token, sent as is */ }
  const sent = 'nonce' in opts ? opts.nonce : nonce;
  const res = await fetch(t.base + '/auth/google', { method: 'POST', headers: Object.assign({ Origin: ORIGIN, 'Content-Type': 'text/plain;charset=utf-8' }, headers), body: JSON.stringify({ action: 'login', idToken: token, nonce: sent }) });
  const setCookie = res.headers.get('set-cookie') || '';
  return { status: res.status, body: await res.json(), setCookie, cookie: setCookie.split(';')[0] };
}
/** Sends the path exactly as written (fetch would tidy '..' and '%2e%2e' away before it left the test). */
const raw = (t, p, cookie) => new Promise((resolve, reject) => {
  const u = new URL(t.base);
  http.get({ host: u.hostname, port: u.port, path: p, headers: cookie ? { Cookie: cookie } : {} }, (res) => {
    let b = ''; res.on('data', (d) => (b += d)); res.on('end', () => resolve({ status: res.statusCode, text: b }));
  }).on('error', reject);
});
const me = async (t, cookie) => (await fetch(t.base + '/api/me', { headers: cookie ? { Cookie: cookie } : {} })).json();

test('listed account signs in with its role; cookie is httpOnly, Secure and SameSite', async () => {
  const t = await start(); t.store.upsertUser({ email: 'maria.delacruz@dlsu.edu.ph', role: 'super-administrator', name: 'Maria' });
  const r = await login(t, tok('Maria.DelaCruz@dlsu.edu.ph'));
  assert.equal(r.status, 200); assert.equal(r.body.role, 'super-administrator'); assert.equal(r.body.email, 'maria.delacruz@dlsu.edu.ph');
  assert.match(r.setCookie, /HttpOnly/); assert.match(r.setCookie, /Secure/); assert.match(r.setCookie, /SameSite=Lax/);
  const m = await me(t, r.cookie); assert.deepEqual([m.signedIn, m.role], [true, 'super-administrator']);
  t.close();
});

test('unlisted DLSU account without an underscore is a Guest', async () => {
  const t = await start();
  const r = await login(t, tok('maria.delacruz@dlsu.edu.ph'));
  assert.equal(r.body.role, 'guest'); assert.equal((await me(t, r.cookie)).role, 'guest');
  t.close();
});

test('unlisted DLSU account with an underscore is a Student; the list overrides the pattern', async () => {
  const t = await start();
  const r = await login(t, tok('juan_dela_cruz@dlsu.edu.ph'));
  assert.equal(r.body.role, 'student'); assert.equal((await me(t, r.cookie)).role, 'student');
  // listed with another role: the list wins
  t.store.upsertUser({ email: 'ann_lee@dlsu.edu.ph', role: 'staff' });
  assert.equal(t.store.roleFor('ann_lee@dlsu.edu.ph'), 'staff');
  // listed and switched off: Guest, not Student
  t.store.setActive('ann_lee@dlsu.edu.ph', false);
  assert.equal(t.store.roleFor('ann_lee@dlsu.edu.ph'), 'guest');
  t.close();
});

test('role changes and switching off apply to a session already open', async () => {
  const t = await start(); t.store.upsertUser({ email: 'a.b@dlsu.edu.ph', role: 'staff' });
  const r = await login(t, tok('a.b@dlsu.edu.ph')); assert.equal((await me(t, r.cookie)).role, 'staff');
  t.store.upsertUser({ email: 'a.b@dlsu.edu.ph', role: 'faculty' }); assert.equal((await me(t, r.cookie)).role, 'faculty');
  t.store.setActive('a.b@dlsu.edu.ph', false); assert.equal((await me(t, r.cookie)).role, 'guest');
  t.close();
});

test('refused sign-ins: wrong domain, hd mismatch, unverified email, garbage token', async () => {
  const t = await start();
  for (const bad of [tok('x@gmail.com', { hd: undefined }), tok('x@gmail.com'), tok('x@dlsu.edu.ph', { hd: 'other.edu' }), tok('x@dlsu.edu.ph', { email_verified: false }), 'not-a-token']) {
    const r = await login(t, bad);
    assert.equal(r.status, 401, bad); assert.equal(r.setCookie, '', 'no cookie for ' + bad); assert.equal(r.body.ok, false);
  }
  const events = t.store.lastAudit(10).map((a) => a.event);
  assert.equal(events.filter((e) => e === 'login_denied').length, 5); assert.ok(!events.includes('login_ok'));
  t.close();
});

test('sign-in and sign-out must come from this site (Origin check)', async () => {
  const t = await start();
  for (const origin of ['https://evil.example', undefined]) {
    const h = { 'Content-Type': 'text/plain' }; if (origin) h.Origin = origin;
    const res = await fetch(t.base + '/auth/google', { method: 'POST', headers: h, body: JSON.stringify({ action: 'login', idToken: tok('a.b@dlsu.edu.ph') }) });
    assert.equal(res.status, 403);
  }
  const out = await fetch(t.base + '/auth/logout', { method: 'POST', headers: { Origin: 'https://evil.example' } });
  assert.equal(out.status, 403);
  t.close();
});

test('logout ends the session on the server', async () => {
  const t = await start(); const r = await login(t, tok('a.b@dlsu.edu.ph'));
  const out = await fetch(t.base + '/auth/logout', { method: 'POST', headers: { Origin: ORIGIN, Cookie: r.cookie } });
  assert.equal(out.status, 200);
  assert.equal((await me(t, r.cookie)).signedIn, false, 'old cookie no longer works');
  t.close();
});

test('forged, expired and missing cookies are signed out', async () => {
  const t = await start();
  assert.equal((await me(t, '__Host-ccs_sid=forged')).signedIn, false);
  assert.equal((await me(t)).signedIn, false);
  const expired = t.store.createSession('a.b@dlsu.edu.ph', 'A', -1); // already past its end time
  assert.equal((await me(t, '__Host-ccs_sid=' + expired.id)).signedIn, false, 'expired session');
  const live = t.store.createSession('a.b@dlsu.edu.ph', 'A', 1);
  assert.equal((await me(t, '__Host-ccs_sid=' + live.id)).signedIn, true, 'control: a live session works');
  t.close();
});

test('rate limit: only FAILED sign-ins count; the 61st failure from one address is refused, good sign-ins never count', async () => {
  const t = await start(); let last;
  for (let i = 0; i < 25; i++) assert.equal((await login(t, tok('a.b@dlsu.edu.ph'))).status, 200, 'good sign-ins are not limited');
  for (let i = 0; i < 61; i++) last = await login(t, 'not-a-token');
  assert.equal(last.status, 429);
  assert.ok(t.store.lastAudit(500).some((r) => r.event === 'rate_limited'), 'the block is logged');
  t.close();
});

test('rate limit: requests from the wrong origin do not use up the allowance', async () => {
  const t = await start();
  for (let i = 0; i < 70; i++) await fetch(t.base + '/auth/google', { method: 'POST', headers: { Origin: 'https://evil.test' }, body: '{}' });
  assert.equal((await login(t, tok('a.b@dlsu.edu.ph'))).status, 200);
  t.close();
});

test('nonce: a token without the right one-time number is refused, and a number works only once', async () => {
  const t = await start();
  assert.equal((await login(t, tok('a.b@dlsu.edu.ph'), {}, { nonce: 'made-up', tokenNonce: 'made-up' })).status, 401, 'number the server never issued');
  assert.equal((await login(t, tok('a.b@dlsu.edu.ph'), {}, { nonce: undefined })).status, 401, 'no number sent');
  const n = await getNonce(t);
  assert.equal((await login(t, tok('a.b@dlsu.edu.ph'), {}, { nonce: n, tokenNonce: 'other' })).status, 401, 'token carries a different number');
  const ok = await login(t, tok('a.b@dlsu.edu.ph'));
  assert.equal(ok.status, 200);
  // replay: the same token and the same nonce again
  const n2 = await getNonce(t);
  const body = JSON.stringify({ action: 'login', idToken: tok('a.b@dlsu.edu.ph', { nonce: n2 }), nonce: n2 });
  const post = () => fetch(t.base + '/auth/google', { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' }, body });
  assert.equal((await post()).status, 200); assert.equal((await post()).status, 401, 'replay refused');
  t.close();
});

test('a person keeps at most 5 sessions; the oldest are dropped', async () => {
  const t = await start(); const ids = [];
  for (let i = 0; i < 7; i++) ids.push(t.store.createSession('a.b@dlsu.edu.ph', 'A', 1).id);
  assert.equal(t.store.findSession(ids[0]), null); assert.equal(t.store.findSession(ids[1]), null);
  assert.ok(t.store.findSession(ids[6]));
  t.close();
});

test('refused /protected requests are logged, and old audit lines can be pruned', async () => {
  const t = await start();
  await fetch(t.base + '/protected/x.html');
  assert.ok(t.store.lastAudit(50).some((r) => r.event === 'protected_denied' && /^401 /.test(r.detail)));
  t.store.audit('old@dlsu.edu.ph', 'login_ok', '', '1.1.1.1');
  const before = t.store.lastAudit(500).length;
  assert.equal(t.store.pruneAudit(-1), before, 'prune with a future cutoff removes all');
  assert.equal(t.store.pruneAudit(180), 0);
  t.close();
});

test('/protected is deny by default and checks the role', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-site-'));
  fs.mkdirSync(path.join(root, 'protected/vodash'), { recursive: true }); fs.mkdirSync(path.join(root, 'protected/open-nowhere'), { recursive: true });
  fs.writeFileSync(path.join(root, 'protected/vodash/data.txt'), 'staff secret');
  fs.writeFileSync(path.join(root, 'protected/open-nowhere/x.txt'), 'no rule');
  fs.writeFileSync(path.join(root, 'secret.txt'), 'outside protected');
  const t = await start({ siteRoot: root, rules: [{ prefix: '/protected/vodash/', roles: ['staff', 'super-administrator'] }] });
  t.store.upsertUser({ email: 's.t@dlsu.edu.ph', role: 'staff' }); t.store.upsertUser({ email: 'f.t@dlsu.edu.ph', role: 'faculty' });
  const staff = (await login(t, tok('s.t@dlsu.edu.ph'))).cookie, fac = (await login(t, tok('f.t@dlsu.edu.ph'))).cookie;
  const get = async (p, c) => fetch(t.base + p, { headers: c ? { Cookie: c } : {} });
  assert.equal((await get('/protected/vodash/data.txt')).status, 401, 'signed out');
  assert.equal((await get('/protected/vodash/data.txt', fac)).status, 403, 'wrong role');
  const ok = await get('/protected/vodash/data.txt', staff); assert.equal(ok.status, 200); assert.equal(await ok.text(), 'staff secret');
  assert.match(ok.headers.get('cache-control'), /no-store/);
  assert.equal((await get('/protected/open-nowhere/x.txt', staff)).status, 403, 'no rule means denied');
  for (const p of ['/protected/vodash/../open-nowhere/x.txt', '/protected/vodash/%2e%2e/open-nowhere/x.txt', '/protected/vodash/..%2fopen-nowhere/x.txt', '/protected/vodash/%2e%2e%2f%2e%2e%2fsecret.txt', '/protected/%5c..%5csecret.txt']) {
    const res = await raw(t, p, staff); assert.ok([400, 403, 404].includes(res.status), p + ' -> ' + res.status); assert.doesNotMatch(res.text, /no rule|outside protected/);
  }
  assert.equal((await get('/secret.txt', staff)).status, 404, 'files outside the allowlist are not served');
  t.close();
});

test('only the public pages and assets are served from the repo; code, docs and git are not', async () => {
  const t = await start();
  const status = async (p) => (await fetch(t.base + p, { redirect: 'manual' })).status;
  for (const p of ['/', '/index.html', '/academics.html', '/study.html', '/assets/css/site.css', '/assets/js/site.js', '/healthz']) assert.equal(await status(p), 200, p);
  for (const p of ['/server/index.js', '/server/data/ccs.db', '/server/.env', '/server/package.json', '/AGENTS.md', '/docs/PRD.md', '/CHANGELOG.md', '/.git/HEAD', '/.git/config', '/.github/workflows/pages.yml', '/README.md', '/CHANGELOG.md', '/nope.html']) assert.equal(await status(p), 404, p);
  for (const p of ['/assets/../AGENTS.md', '/assets/%2e%2e/AGENTS.md', '/assets/..%2fAGENTS.md', '/assets/%2e%2e%2fserver%2findex.js', '/assets/..\\AGENTS.md']) {
    const res = await raw(t, p); assert.ok([400, 403, 404].includes(res.status), p + ' -> ' + res.status); assert.doesNotMatch(res.text, /CCS Commons portal|require\(/);
  }
  t.close();
});

test('config.js gets the client ID and same-origin sign-in address from the server', async () => {
  const t = await start(); const src = await (await fetch(t.base + '/assets/js/config.js')).text();
  assert.match(src, /window\.CCS = \{/); assert.match(src, /clientId = "test-client-id\.apps\.googleusercontent\.com"/); assert.match(src, /apiUrl = "\/auth\/google"/);
  t.close();
});

test('an oversized sign-in body gets a short JSON 413, not Express\'s error page with a stack trace', async () => {
  const t = await start();
  try {
    const res = await fetch(t.base + '/auth/google', { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' }, body: 'a'.repeat(200000) });
    const text = await res.text();
    assert.equal(res.status, 413);
    assert.deepEqual(JSON.parse(text), { ok: false, error: 'Request too large' });
    assert.ok(!/node_modules|\sat /.test(text));
  } finally { t.close(); }
});

test('security headers: CSP with base-uri, HSTS on https, redirect stubs allowed by hash', async () => {
  const t = await start();
  try {
    const res = await fetch(t.base + '/community.html');
    const csp = res.headers.get('content-security-policy');
    assert.match(csp, /base-uri 'self'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /frame-ancestors 'self'/);
    assert.ok(!/script-src[^;]*unsafe-inline/.test(csp));
    assert.match(csp, /script-src[^;]*'sha256-/);
    assert.equal(res.headers.get('strict-transport-security'), 'max-age=31536000');
    const api = await fetch(t.base + '/api/me');
    assert.ok(api.headers.get('content-security-policy'));
  } finally { t.close(); }
});

test('checkPayload', () => {
  assert.deepEqual(checkPayload({ email: 'A.B@DLSU.edu.ph', hd: 'dlsu.edu.ph', email_verified: true, name: 'N' }, 'dlsu.edu.ph'), { email: 'a.b@dlsu.edu.ph', name: 'N', nonce: '' });
  assert.throws(() => checkPayload({ email: 'a@dlsu.edu.ph.evil.com', hd: 'dlsu.edu.ph', email_verified: true }, 'dlsu.edu.ph'), /@dlsu\.edu\.ph/);
  assert.throws(() => checkPayload({ email: 'a@dlsu.edu.ph', hd: 'dlsu.edu.ph', email_verified: 'false' }, 'dlsu.edu.ph'), /not verified/);
  assert.throws(() => checkPayload(null, 'dlsu.edu.ph'));
});

test('users CLI: add, warn on a mismatched address format, refuse other domains, import, disable', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-cli-')); const env = Object.assign({}, process.env, { DB_PATH: path.join(dir, 't.db') });
  const run = (...a) => spawnSync(process.execPath, [path.join(__dirname, '..', 'users.js'), ...a], { env, encoding: 'utf8' });
  let r = run('add', 'Maria.DelaCruz@dlsu.edu.ph', 'super-administrator', 'Maria', 'Dela', 'Cruz'); assert.equal(r.status, 0); assert.match(r.stdout, /maria\.delacruz@dlsu\.edu\.ph as super-administrator/); assert.doesNotMatch(r.stdout, /Warning/);
  r = run('add', 'juan.cruz@dlsu.edu.ph', 'student'); assert.equal(r.status, 0); assert.match(r.stdout, /Warning: looks like a staff or faculty address/);
  r = run('add', 'someone@gmail.com', 'super-administrator'); assert.notEqual(r.status, 0); assert.match(r.stderr, /Not a @dlsu\.edu\.ph address/);
  r = run('add', 'a.b@dlsu.edu.ph', 'boss'); assert.notEqual(r.status, 0); assert.match(r.stderr, /Role must be one of/);
  fs.writeFileSync(path.join(dir, 'u.csv'), 'email,role,name,program,active\njuan_dela_cruz@dlsu.edu.ph,student,"Cruz, Juan",BS CS,TRUE\nbad@example.com,student,X,,TRUE\nold_one@dlsu.edu.ph,student,Old,,FALSE\n');
  r = run('import', path.join(dir, 'u.csv')); assert.equal(r.status, 1); assert.match(r.stdout, /2 saved, 1 skipped/); assert.match(r.stderr, /Row 3 skipped/);
  r = run('disable', 'maria.delacruz@dlsu.edu.ph'); assert.match(r.stdout, /switched off/);
  r = run('list'); assert.match(r.stdout, /OFF\s+super-administrator\s+maria\.delacruz@dlsu\.edu\.ph/); assert.match(r.stdout, /OFF\s+student\s+old_one@/); assert.match(r.stdout, /on\s+student\s+juan_dela_cruz@/);
  r = run('audit'); assert.match(r.stdout, /user_set/); assert.match(r.stdout, /user_disable/);
  r = run('disable', 'nobody@dlsu.edu.ph'); assert.notEqual(r.status, 0);
});

test('an older database (admin role) is migrated: admin becomes super-administrator, new roles are accepted', () => {
  const Database = require('better-sqlite3');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-mig-')), 'old.db');
  const old = new Database(file);
  old.exec(`CREATE TABLE users (email TEXT PRIMARY KEY, role TEXT NOT NULL CHECK (role IN ('admin','faculty','staff','student')),
    name TEXT NOT NULL DEFAULT '', program TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
    INSERT INTO users VALUES ('a.b@dlsu.edu.ph','admin','A B','',1,'2026-10-30T00:00:00Z'), ('c.d@dlsu.edu.ph','faculty','C D','',1,'2026-10-30T00:00:00Z');`);
  old.close();
  const store = makeStore(open(file));
  assert.equal(store.roleFor('a.b@dlsu.edu.ph'), 'super-administrator');
  assert.equal(store.roleFor('c.d@dlsu.edu.ph'), 'faculty');
  store.upsertUser({ email: 'e.f@dlsu.edu.ph', role: 'faculty-administrator' });
  assert.equal(store.roleFor('e.f@dlsu.edu.ph'), 'faculty-administrator');
  assert.throws(() => store.upsertUser({ email: 'g.h@dlsu.edu.ph', role: 'admin' }), /Role must be one of/);
  const again = makeStore(open(file)); // opening twice is safe
  assert.equal(again.roleFor('a.b@dlsu.edu.ph'), 'super-administrator');
});
