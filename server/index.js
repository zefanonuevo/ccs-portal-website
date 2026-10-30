'use strict';
/* Starts the CCS Commons server. Settings come from environment variables (see server/.env.example). */
const path = require('node:path');
const { open, makeStore } = require('./db');
const { createApp, googleVerifier } = require('./app');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch (e) { /* no .env file: use the real environment */ }

const clientId = process.env.GOOGLE_CLIENT_ID || '';
const domain = (process.env.ALLOWED_DOMAIN || 'dlsu.edu.ph').toLowerCase();
const baseUrl = process.env.BASE_URL || '';
const isDev = process.env.NODE_ENV === 'development';

if (!clientId) console.warn('GOOGLE_CLIENT_ID is not set: sign-in is switched off and every visitor is a guest.');
if (!baseUrl && !isDev) console.warn('BASE_URL is not set: sign-in requests are checked against the Host header. Set BASE_URL to your https address.');

const store = makeStore(open(process.env.DB_PATH || path.join(__dirname, 'data', 'ccs.db')));
const verify = clientId ? googleVerifier({ clientId, domain }) : async () => { const e = new Error('Sign-in is not configured'); e.reason = 'not_configured'; throw e; };

const app = createApp({
  store, verify,
  config: {
    clientId, baseUrl,
    cookieSecure: !isDev,
    sessionHours: Number(process.env.SESSION_HOURS) || 8
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, '127.0.0.1', () => console.log('CCS Commons server on http://127.0.0.1:' + port));
