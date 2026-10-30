#!/usr/bin/env node
'use strict';
/* Manage who has which role. Run on the VM from the server folder:
     node users.js list
     node users.js add <email> <admin|faculty|staff|student> [name...]
     node users.js disable <email>      (the person becomes a Guest at once)
     node users.js enable <email>
     node users.js import <file.csv>    (columns: email,role,name,program,active)
     node users.js audit [count]        (latest sign-ins and changes)
   Anyone with a DLSU Google account who is not listed signs in as a Guest. */
const fs = require('node:fs');
const path = require('node:path');
const { open, makeStore, parseCsv, normEmail, ROLES } = require('./db');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch (e) { /* optional */ }
const domain = (process.env.ALLOWED_DOMAIN || 'dlsu.edu.ph').toLowerCase();
const store = makeStore(open(process.env.DB_PATH || path.join(__dirname, 'data', 'ccs.db')));

/** DLSU students look like juan_dela_cruz@, staff and faculty like maria.delacruz@. A mismatch is a warning only. */
function formatWarning(email, role) {
  const local = email.split('@')[0];
  const underscore = local.includes('_'), dot = local.includes('.');
  if (role === 'student' && dot && !underscore) return 'looks like a staff or faculty address, but the role is student';
  if (role !== 'student' && underscore && !dot) return 'looks like a student address, but the role is ' + role;
  return '';
}

function checkedUser(email, role) {
  email = normEmail(email);
  if (!/^[^@\s]+@[^@\s]+$/.test(email) || !email.endsWith('@' + domain)) throw new Error('Not a @' + domain + ' address: ' + email);
  if (!ROLES.includes(role)) throw new Error('Role must be one of: ' + ROLES.join(', '));
  return email;
}

function add(email, role, name, program, active) {
  email = checkedUser(email, role);
  store.upsertUser({ email, role, name, program, active });
  store.audit('cli', 'user_set', email + ' role=' + role + ' active=' + (active ? 1 : 0));
  const w = formatWarning(email, role);
  console.log((active ? 'Saved ' : 'Saved (switched off) ') + email + ' as ' + role + (w ? '\n  Warning: ' + w : ''));
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === 'list') {
    const rows = store.listUsers();
    if (!rows.length) console.log('No users yet. Add one with: node users.js add <email> <role> [name]');
    rows.forEach((u) => console.log([u.active ? 'on ' : 'OFF', u.role.padEnd(8), u.email, u.name].join('  ')));
  } else if (cmd === 'add') {
    if (args.length < 2) throw new Error('Usage: node users.js add <email> <role> [name...]');
    add(args[0], String(args[1]).toLowerCase(), args.slice(2).join(' '), '', true);
  } else if (cmd === 'disable' || cmd === 'enable') {
    if (!args[0]) throw new Error('Usage: node users.js ' + cmd + ' <email>');
    const n = store.setActive(args[0], cmd === 'enable');
    if (!n) throw new Error('Not in the list: ' + normEmail(args[0]));
    store.audit('cli', 'user_' + cmd, normEmail(args[0]));
    console.log(normEmail(args[0]) + (cmd === 'enable' ? ' is on' : ' is switched off (Guest)'));
  } else if (cmd === 'import') {
    if (!args[0]) throw new Error('Usage: node users.js import <file.csv>');
    const rows = parseCsv(fs.readFileSync(args[0], 'utf8'));
    const head = rows.shift().map((h) => h.toLowerCase());
    const col = (n) => head.indexOf(n);
    if (col('email') < 0 || col('role') < 0) throw new Error('The CSV needs email and role columns');
    let ok = 0, bad = 0;
    rows.forEach((r, i) => {
      try {
        const get = (n) => (col(n) >= 0 ? r[col(n)] || '' : '');
        const active = get('active') === '' ? true : get('active').toUpperCase() !== 'FALSE';
        add(get('email'), get('role').toLowerCase(), get('name'), get('program'), active); ok++;
      } catch (e) { bad++; console.error('Row ' + (i + 2) + ' skipped: ' + e.message); }
    });
    console.log(ok + ' saved, ' + bad + ' skipped');
    if (bad) process.exitCode = 1;
  } else if (cmd === 'audit') {
    store.lastAudit(Number(args[0]) || 20).forEach((a) => console.log([a.ts, a.event.padEnd(13), a.email || '-', a.detail, a.ip].join('  ')));
  } else {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^[^]*?\/\* /, ''));
  }
} catch (e) { console.error(e.message); process.exitCode = 1; }
