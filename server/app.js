'use strict';
/* CCS Commons server: Google sign-in, sessions, role checks, and the public files.
   createApp() takes its parts as arguments so tests can replace Google's token check. */
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
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
  return { email, name: p.name || '' };
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
    clientId: '', baseUrl: '', sessionHours: 8, cookieSecure: true, cookieName: 'ccs_sid'
  }, config);
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // one hop: Apache on this VM

  /* ---------- headers on every response ---------- */
  app.use((req, res, next) => {
    res.set({
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

  /* Simple per-address limit on sign-in attempts: 20 per 10 minutes. */
  const attempts = new Map();
  function limitLogins(req, res, next) {
    const t = Date.now(), win = 10 * 60 * 1000;
    const list = (attempts.get(req.ip) || []).filter((x) => t - x < win);
    if (list.length >= 20) return res.status(429).json({ ok: false, error: 'Too many attempts. Try again in a few minutes.' });
    list.push(t); attempts.set(req.ip, list);
    if (attempts.size > 5000) attempts.clear();
    next();
  }

  /* ---------- API ---------- */
  app.get('/healthz', (req, res) => res.type('text').send('ok'));

  app.get('/api/me', (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!req.user) return res.json({ ok: true, signedIn: false });
    res.json({ ok: true, signedIn: true, email: req.user.email, name: req.user.name, role: req.user.role });
  });

  // The page posts text/plain JSON ({ action: 'login', idToken }), the same message the old Apps Script prototype used.
  app.post('/auth/google', limitLogins, sameOrigin, express.text({ type: '*/*', limit: '16kb' }), async (req, res) => {
    res.set('Cache-Control', 'no-store');
    let body;
    try { body = JSON.parse(req.body); } catch (e) { body = null; }
    if (!body || body.action !== 'login' || typeof body.idToken !== 'string') return res.status(400).json({ ok: false, error: 'Bad request' });
    try {
      const who = await verify(body.idToken);
      const listed = store.getUser(who.email);
      const role = store.roleFor(who.email);
      const name = (listed && listed.name) || who.name || who.email;
      const s = store.createSession(who.email, name, cfg.sessionHours);
      setCookie(res, s.id, s.expires);
      store.audit(who.email, 'login_ok', 'role=' + role, req.ip);
      res.json({ ok: true, email: who.email, name, role });
    } catch (err) {
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
    if (!req.user) return res.status(401).type('text').send('Sign in to open this page');
    const allowed = access.rolesFor(p, rules);
    if (!allowed || !allowed.includes(req.user.role)) return res.status(403).type('text').send('Your role cannot open this page');
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
  return app;
}

module.exports = { createApp, googleVerifier, checkPayload };
