'use strict';
/* CCS Commons server: Google sign-in, sessions, role checks, and the public files.
   createApp() takes its parts as arguments so tests can replace Google's token check. */
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { OAuth2Client } = require('google-auth-library');
const access = require('./access');

/** Production token check: Google verifies the signature and audience, then we check domain and verified email. */
function googleVerifier({ clientId, domain }) {
  const client = new OAuth2Client(clientId);
  return async function verify(idToken) {
    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch (e) { const err = new Error('Google rejected the sign-in'); err.reason = 'bad_token'; throw err; }
    return checkPayload(payload, domain);
  };
}

function checkPayload(p, domain) {
  const email = String((p && p.email) || '').trim().toLowerCase();
  if (!p || !email) { const e = new Error('No email in the sign-in'); e.reason = 'bad_token'; throw e; }
  if (p.email_verified !== true && p.email_verified !== 'true') { const e = new Error('Your Google email is not verified'); e.reason = 'unverified'; e.email = email; throw e; }
  if (!email.endsWith('@' + domain) || p.hd !== domain) { const e = new Error('Please use your @' + domain + ' account'); e.reason = 'wrong_domain'; e.email = email; throw e; }
  return { email, name: p.name || '', nonce: typeof p.nonce === 'string' ? p.nonce : '' };
}

/** Counts events per key inside a time window. Oldest keys are dropped when the table is full, so it cannot grow without end. */
function makeLimiter(max, windowMs, cap = 5000) {
  const m = new Map();
  const recent = (k, t) => (m.get(k) || []).filter((x) => t - x < windowMs);
  return {
    blocked(k) { return recent(k, Date.now()).length >= max; },
    hit(k) {
      const t = Date.now(), l = recent(k, t); l.push(t);
      m.delete(k); m.set(k, l);
      if (m.size > cap) m.delete(m.keys().next().value);
    },
    /** true when still under the limit (and counts it); false when over. */
    take(k) { if (this.blocked(k)) return false; this.hit(k); return true; }
  };
}

function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) { try { out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); } catch (e) { /* ignore bad cookie */ } }
  });
  return out;
}

function createApp({ store, verify, config, rules }) {
  const cfg = Object.assign({
    siteRoot: path.resolve(__dirname, '..'),
    clientId: '', baseUrl: '', sessionHours: 8, cookieSecure: true, cookieName: ''
  }, config);
  /* The __Host- prefix makes browsers accept the cookie only over https, from this host, for the whole site (no Domain). It cannot be used over plain http (local development). */
  if (!cfg.cookieName) cfg.cookieName = cfg.cookieSecure ? '__Host-ccs_sid' : 'ccs_sid';
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // one hop: Apache on this VM

  /* ---------- headers on every response ---------- */
  /* Content-Security-Policy. Inline scripts are blocked except the few tiny redirect stubs (community.html and
     friends), which are allowed by hash: the hashes are computed from the files at start-up, so editing a stub
     cannot silently break it. Inline style attributes are used all over the pages, hence 'unsafe-inline' for styles only. */
  const inlineHashes = [];
  try {
    for (const f of fs.readdirSync(cfg.siteRoot).filter((n) => n.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(cfg.siteRoot, f), 'utf8');
      for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
        inlineHashes.push("'sha256-" + crypto.createHash('sha256').update(m[1]).digest('base64') + "'");
      }
    }
  } catch (e) { /* no site folder (tests) */ }
  const CSP = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "script-src 'self' https://accounts.google.com/gsi/client " + inlineHashes.join(' '),
    "style-src 'self' 'unsafe-inline' https://zefanonuevo.github.io https://fonts.googleapis.com https://accounts.google.com/gsi/style",
    "font-src 'self' https://fonts.gstatic.com https://zefanonuevo.github.io",
    "img-src 'self' data: https:",
    "frame-src https://accounts.google.com https://docs.google.com",
    "connect-src 'self' https://accounts.google.com"
  ].join('; ').replace(/ ;/g, ';');
  const HSTS = /^https:/i.test(cfg.baseUrl) ? 'max-age=31536000' : '';
  app.use((req, res, next) => {
    if (HSTS) res.set('Strict-Transport-Security', HSTS);
    res.set({
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'SAMEORIGIN',
      // Google's sign-in button opens a pop-up that must be able to talk back to this page.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    });
    next();
  });

  /* ---------- who is asking? (cookie -> session -> current role from the users table) ---------- */
  app.use((req, res, next) => {
    req.sid = parseCookies(req.headers.cookie)[cfg.cookieName] || '';
    const s = store.findSession(req.sid);
    req.user = s ? { email: s.email, name: s.name, role: store.roleFor(s.email) } : null;
    next();
  });

  function setCookie(res, value, expires) {
    const parts = [cfg.cookieName + '=' + encodeURIComponent(value), 'Path=/', 'HttpOnly', 'SameSite=Lax'];
    if (cfg.cookieSecure) parts.push('Secure');
    parts.push(expires ? 'Expires=' + expires.toUTCString() : 'Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.append('Set-Cookie', parts.join('; '));
  }

  /* Cookie-changing requests must come from this site (blocks cross-site form posts). */
  function sameOrigin(req, res, next) {
    const expected = cfg.baseUrl ? new URL(cfg.baseUrl).origin : req.protocol + '://' + req.get('host');
    if (req.get('origin') !== expected) return res.status(403).json({ ok: false, error: 'Request not allowed from this address' });
    next();
  }

  /* Limits. Many people on campus can share one outgoing address, so only FAILED sign-ins count, and the
     limit is generous (60 per 10 minutes per address). Successful sign-ins never count. */
  const failedLogins = makeLimiter(60, 10 * 60 * 1000);
  const nonceLimiter = makeLimiter(120, 10 * 60 * 1000);
  const auditGate = makeLimiter(10, 10 * 60 * 1000); // at most 10 "refused" log lines per address per 10 minutes, so the log cannot be flooded
  const nonces = new Map(); // one-time numbers that tie a Google sign-in to this server: nonce -> expiry time
  function newNonce() {
    const t = Date.now();
    for (const [k, exp] of nonces) { if (exp <= t) nonces.delete(k); else break; }
    if (nonces.size >= 5000) nonces.delete(nonces.keys().next().value);
    const n = crypto.randomBytes(24).toString('base64url');
    nonces.set(n, t + 30 * 60 * 1000);
    return n;
  }
  /* A nonce is checked first and used up only when the whole sign-in succeeds, so a refused attempt (for example a personal Gmail)
     does not make the person reload the page. After a success the same number can never be used again. */
  function nonceState(n) { // 'ok' | 'missing' | 'unknown'
    if (typeof n !== 'string' || !n) return 'missing';
    const exp = nonces.get(n);
    return exp !== undefined && exp > Date.now() ? 'ok' : 'unknown';
  }
  function logRefused(req, email, event, detail) {
    if (auditGate.take(req.ip)) store.audit(email || '', event, detail, req.ip);
  }

  /* ---------- API ---------- */
  app.get('/healthz', (req, res) => res.type('text').send('ok'));

  app.get('/api/me', (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!req.user) return res.json({ ok: true, signedIn: false });
    res.json({ ok: true, signedIn: true, email: req.user.email, name: req.user.name, role: req.user.role });
  });

  /* Step 0 of a sign-in: the page asks for a one-time number, hands it to Google, and Google puts it inside the ID token.
     A stolen or replayed token is then useless: its number was already used, or was never issued here. */
  app.get('/auth/nonce', (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!nonceLimiter.take(req.ip)) return res.status(429).json({ ok: false, error: 'Too many attempts. Try again in a few minutes.' });
    res.json({ ok: true, nonce: newNonce() });
  });

  // The page posts text/plain JSON ({ action: 'login', idToken, nonce }).
  function blockedLogin(req, res, next) {
    if (failedLogins.blocked(req.ip)) {
      logRefused(req, '', 'rate_limited', 'sign-in');
      return res.status(429).json({ ok: false, error: 'Too many attempts. Try again in a few minutes.' });
    }
    next();
  }
  app.post('/auth/google', sameOrigin, blockedLogin, express.text({ type: '*/*', limit: '16kb' }), async (req, res) => {
    res.set('Cache-Control', 'no-store');
    let body;
    try { body = JSON.parse(req.body); } catch (e) { body = null; }
    if (!body || body.action !== 'login' || typeof body.idToken !== 'string') { failedLogins.hit(req.ip); return res.status(400).json({ ok: false, error: 'Bad request' }); }
    try {
      const state = nonceState(body.nonce);
      const who = await verify(body.idToken);
      const why = state !== 'ok' ? 'nonce_' + state : who.nonce !== body.nonce ? 'nonce_mismatch' : '';
      if (why) { const e = new Error('Please reload this page (Ctrl+Shift+R) and sign in again.'); e.reason = why; e.email = who.email; throw e; }
      nonces.delete(body.nonce); // used up: a replay of this token is refused
      const listed = store.getUser(who.email);
      const role = store.roleFor(who.email);
      const name = (listed && listed.name) || who.name || who.email;
      const s = store.createSession(who.email, name, cfg.sessionHours);
      setCookie(res, s.id, s.expires);
      store.audit(who.email, 'login_ok', 'role=' + role, req.ip);
      res.json({ ok: true, email: who.email, name, role });
    } catch (err) {
      failedLogins.hit(req.ip);
      store.audit(err.email || '', 'login_denied', err.reason || 'error', req.ip);
      res.status(401).json({ ok: false, error: err.reason ? err.message : 'Sign-in failed' });
    }
  });

  app.post('/auth/logout', sameOrigin, (req, res) => {
    if (req.user) store.audit(req.user.email, 'logout', '', req.ip);
    store.deleteSession(req.sid);
    setCookie(res, '', null);
    res.set('Cache-Control', 'no-store').json({ ok: true });
  });

  /* ---------- config.js: the same file the pages already load, plus the Google client ID from the server's .env ---------- */
  app.get('/assets/js/config.js', (req, res, next) => {
    fs.readFile(path.join(cfg.siteRoot, 'assets/js/config.js'), 'utf8', (err, src) => {
      if (err) return next();
      if (cfg.clientId) {
        src += '\n/* Added by the server: real sign-in. The client ID is public by design. */\n' +
          'window.CCS.signin = window.CCS.signin || {};\n' +
          'window.CCS.signin.clientId = ' + JSON.stringify(cfg.clientId) + ';\n' +
          'window.CCS.signin.apiUrl = "/auth/google";\n' +
          'window.CCS.signin.nonceUrl = "/auth/nonce";\n' +
          'window.CCS.signin.server = true;\n';
      }
      res.type('application/javascript').set('Cache-Control', 'no-cache').send(src);
    });
  });

  /* ---------- protected files: deny by default ---------- */
  app.use('/protected', (req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    let p;
    try { p = decodeURIComponent(req.originalUrl.split('?')[0]); } catch (e) { return res.status(400).type('text').send('Bad request'); }
    if (p.includes('\0') || p.includes('\\') || p.split('/').includes('..')) return res.status(400).type('text').send('Bad request');
    p = path.posix.normalize(p);
    if (!req.user) { logRefused(req, '', 'protected_denied', '401 ' + p); return res.status(401).type('text').send('Sign in to open this page'); }
    const allowed = access.rolesFor(p, rules);
    if (!allowed || !allowed.includes(req.user.role)) { logRefused(req, req.user.email, 'protected_denied', '403 ' + req.user.role + ' ' + p); return res.status(403).type('text').send('Your role cannot open this page'); }
    next();
  }, express.static(path.join(cfg.siteRoot, 'protected'), { dotfiles: 'deny', index: false, redirect: false }));

  /* ---------- public files: only the pages in the repo root and assets/ ---------- */
  app.use('/assets', express.static(path.join(cfg.siteRoot, 'assets'), { dotfiles: 'deny', index: false, redirect: false, maxAge: '1h' }));
  app.get('/', (req, res) => res.sendFile(path.join(cfg.siteRoot, 'index.html')));
  app.get(/^\/([a-z0-9-]+)\.html$/, (req, res, next) => {
    const f = path.join(cfg.siteRoot, req.params[0] + '.html');
    fs.access(f, (err) => (err ? next() : res.sendFile(f)));
  });

  app.use((req, res) => res.status(404).type('text').send('Not found'));

  /* Last resort: never send Express's default error page, which includes a stack trace
     (file paths) unless NODE_ENV=production. Found by QA with an oversized sign-in body. */
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    const status = err && (err.status || err.statusCode);
    const code = status >= 400 && status < 500 ? status : 500;
    if (code === 500) console.error('Unhandled error:', err && err.message);
    if (res.headersSent) return res.destroy();
    res.status(code).json({ ok: false, error: code === 413 ? 'Request too large' : code === 500 ? 'Server error' : 'Bad request' });
  });
  return app;
}

module.exports = { createApp, googleVerifier, checkPayload };
