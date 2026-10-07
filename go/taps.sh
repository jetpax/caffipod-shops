#!/bin/zsh
# Shop taps recorded by the caffipod-go worker.
#   go/taps.sh            taps per shop, last 30 days
#   go/taps.sh all        every tap, newest first
set -e
cd "${0:A:h}"
if [[ $1 == all ]]; then
  sql="SELECT at, shop, country, source FROM taps ORDER BY id DESC"
else
  sql="SELECT shop, COUNT(*) AS taps, COUNT(DISTINCT country) AS countries FROM taps WHERE at >= datetime('now', '-30 days') GROUP BY shop ORDER BY taps DESC"
fi
npx wrangler d1 execute caffipod-taps --remote --command "$sql"
