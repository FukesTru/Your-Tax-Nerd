#!/usr/bin/env bash
# The go-live check: all four ways of typing the client's domain must land on https://www.<domain>
# with a working padlock.   bash tools/golive-check.sh theirdomain.com
set -u
d="${1:-}"
d="${d#http://}"; d="${d#https://}"; d="${d#www.}"; d="${d%%/*}"
if [ -z "$d" ]; then echo "Usage: bash tools/golive-check.sh theirdomain.com"; exit 2; fi

want="https://www.$d/"
bad=0
for start in "http://$d" "https://$d" "http://www.$d" "https://www.$d"; do
  # -L follows the forwarding, and curl refuses a broken certificate unless told otherwise,
  # so an https address with a bad padlock fails here exactly as it would in a browser.
  out=$(curl -sSL -o /dev/null --max-time 20 -w '%{http_code} %{url_effective}' "$start" 2>&1)
  code="${out%% *}"; final="${out#* }"
  if [ "$code" = "200" ] && [ "${final%/}/" = "$want" ]; then
    echo "OK    $start  ->  $final"
  else
    bad=1
    echo "FAIL  $start  ->  $out"
  fi
done

echo
if [ "$bad" = 0 ]; then
  echo "All four addresses land on $want with a working padlock. The domain is live."
else
  echo "Not live on every address yet. If only the bare domain failed, check its A record (76.76.21.21) and the redirect to www in the Vercel project's domain settings."
  echo "If everything failed, the DNS change may still be spreading, or Vercel has not issued the certificate yet: try again in an hour."
fi
exit $bad
