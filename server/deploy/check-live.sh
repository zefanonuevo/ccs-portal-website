#!/usr/bin/env bash
# Read-only checks of the live site: what is public, what is refused, and whether Cloudflare caches the dynamic paths.
# Usage (anywhere with internet, no sign-in needed):  bash server/deploy/check-live.sh https://ccs.dlsu.edu.ph
set -u
BASE="${1:-https://ccs.dlsu.edu.ph}"; BASE="${BASE%/}"
printf '%-28s %-8s %-14s %s\n' PATH STATUS CF-CACHE CACHE-CONTROL
chk() { # $1 path, $2 expected status (informational)
  h=$(curl -s -o /dev/null -D - --max-time 15 "$BASE$1" | tr -d '\r')
  code=$(printf '%s' "$h" | head -1 | awk '{print $2}')
  cf=$(printf '%s' "$h" | grep -i '^cf-cache-status:' | awk '{print $2}')
  cc=$(printf '%s' "$h" | grep -i '^cache-control:' | cut -d' ' -f2-)
  ok=""; [ "$code" = "$2" ] && ok="ok" || ok="EXPECTED $2"
  printf '%-28s %-8s %-14s %s  [%s]\n' "$1" "$code" "${cf:--}" "${cc:--}" "$ok"
}
chk /                        200
chk /healthz                 200
chk /api/me                  200   # signed out: 200 with signedIn false, never cached
chk /protected/              401   # deny by default (401 signed out)
chk /protected/anything.pdf  401
chk /docs/PRD.md             404
chk /server/.env             404
chk /.git/config             404
chk /auth/google             404   # GET is not a route; only POST works
echo
echo "CF-CACHE should be '-', DYNAMIC or BYPASS for /api, /auth, /protected. HIT there means the cache rule is missing."
