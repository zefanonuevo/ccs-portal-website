/**
 * CCS Portal sign-in backend (Google Apps Script) — PROTOTYPE.
 *
 * What it does: receives a Google ID token from the portal, verifies it with Google,
 * looks the email up in the "Users" sheet, and returns the role.
 *
 * Sheet "Users" (row 1 = headers): email | role | name | program | active
 *   role must be one of: admin, faculty, staff, student
 *   active: TRUE / FALSE
 * Anyone with a valid @dlsu.edu.ph account who is NOT in the sheet is returned as "guest".
 *
 * Setup: Project Settings → Script properties → add CLIENT_ID = <your OAuth Web client ID>.
 * Deploy: Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 * ("Anyone" is fine: every request is rejected unless it carries a valid Google token.)
 */

var ALLOWED_DOMAIN = 'dlsu.edu.ph';
var ROLES = ['admin', 'faculty', 'staff', 'student'];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action !== 'login') return json_({ ok: false, error: 'Unknown action' });
    var who = verifyToken_(body.idToken);
    var user = lookup_(who.email);
    return json_({
      ok: true,
      email: who.email,
      name: (user && user.name) || who.name || who.email,
      role: user ? user.role : 'guest'
    });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

// Health check only. Never returns user data.
function doGet() { return json_({ ok: true, service: 'ccs-portal-auth' }); }

/** Ask Google to validate the token, then check audience, expiry, email and domain ourselves. */
function verifyToken_(idToken) {
  if (!idToken) throw new Error('Missing token');
  var clientId = PropertiesService.getScriptProperties().getProperty('CLIENT_ID');
  if (!clientId) throw new Error('Server is not configured (CLIENT_ID)');

  var res = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Google rejected the token');
  var t = JSON.parse(res.getContentText());

  if (t.aud !== clientId) throw new Error('Token is for a different app');
  if (Number(t.exp) * 1000 < Date.now()) throw new Error('Token expired');
  if (String(t.email_verified) !== 'true') throw new Error('Email not verified');
  var email = String(t.email || '').toLowerCase();
  // hd is Google's "hosted domain" claim; also check the suffix.
  if (t.hd !== ALLOWED_DOMAIN || !email.endsWith('@' + ALLOWED_DOMAIN)) {
    throw new Error('Please use your @' + ALLOWED_DOMAIN + ' account');
  }
  return { email: email, name: t.name };
}

/** Find the active row for this email in the Users sheet. */
function lookup_(email) {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Users');
  if (!sheet) throw new Error('Users sheet not found');
  var rows = sheet.getDataRange().getValues();
  var head = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var iE = head.indexOf('email'), iR = head.indexOf('role'), iN = head.indexOf('name'), iA = head.indexOf('active');
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][iE]).trim().toLowerCase() !== email) continue;
    var active = String(rows[i][iA]).toUpperCase() !== 'FALSE';
    var role = String(rows[i][iR]).trim().toLowerCase();
    if (active && ROLES.indexOf(role) !== -1) return { role: role, name: rows[i][iN] };
  }
  return null;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
