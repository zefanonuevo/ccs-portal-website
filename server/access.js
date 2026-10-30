'use strict';
/* Which roles may open files under /protected/. Deny by default: a path with no matching rule is refused.
   Put a file in the repo's protected/ folder, then add a rule here. Roles: guest, student, faculty, staff, admin.
   The rule keys follow the access table in assets/js/config.js; keep the two in step (docs/PRD.md section 2.1).
   Example (not active):
     { prefix: '/protected/vodash/', roles: ['staff', 'admin'] }                              */
const RULES = [];

/** @returns {string[]|null} the allowed roles for a normalized /protected/... path, or null when no rule matches. */
function rolesFor(normalizedPath, rules = RULES) {
  let best = null;
  for (const r of rules) {
    if (normalizedPath.startsWith(r.prefix) && (!best || r.prefix.length > best.prefix.length)) best = r;
  }
  return best ? best.roles : null;
}

module.exports = { rolesFor, RULES };
