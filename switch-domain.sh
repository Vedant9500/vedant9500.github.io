#!/usr/bin/env bash
# switch-domain.sh — switch the site between a custom domain and the default
# GitHub Pages URL. See DOMAIN-CONFIG-BACKUP.md for full instructions.
#
# Usage:
#   ./switch-domain.sh https://vroid-is.my.id        # enable a custom domain
#   ./switch-domain.sh https://vedant9500.github.io  # back to default Pages URL
set -euo pipefail

NEW_BASE="${1:?usage: switch-domain.sh https://example.com}"
NEW_BASE="${NEW_BASE%/}"

DEFAULT_DOMAIN="vedant9500.github.io"

# Domains the site has used before; all are rewritten to NEW_BASE.
KNOWN_DOMAINS=(
  vedantium.dev
  vroid-is.my.id
  vedant9500.github.io
)

if [[ ! "$NEW_BASE" =~ ^https://[A-Za-z0-9.-]+$ ]]; then
  echo "error: expected https://<domain>, got '$NEW_BASE'" >&2
  exit 1
fi

NEW_DOMAIN="${NEW_BASE#https://}"

FILES=(
  sitemap.xml
  robots.txt
  llms.txt
  index.html
  404.html
  about/index.html
  work/index.html
  work/glassbox/index.html
  work/fmms/index.html
  work/freeze-bench/index.html
  work/hark/index.html
  work/openlmlib/index.html
)

git restore --staged . 2>/dev/null || true

for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || continue
  for old in "${KNOWN_DOMAINS[@]}"; do
    sed -i "s|https://$old|$NEW_BASE|g" "$f"
  done
  echo "updated: $f"
done

if [[ "$NEW_DOMAIN" == "$DEFAULT_DOMAIN" ]]; then
  git rm --cached CNAME 2>/dev/null || true
  rm -f CNAME
  echo "removed: CNAME (back on default Pages URL)"
else
  printf '%s\n' "$NEW_DOMAIN" > CNAME
  echo "created: CNAME ($NEW_DOMAIN)"
  git add CNAME
fi

git add "${FILES[@]}"

echo
echo "Switched to: $NEW_BASE"
echo "Review with 'git diff --cached' then 'git commit' and 'git push'."
