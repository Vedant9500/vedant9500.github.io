#!/usr/bin/env bash
# switch-domain.sh — switch the site between the custom domain and the default
# GitHub Pages URL. See DOMAIN-CONFIG-BACKUP.md for full instructions.
#
# Usage:
#   ./switch-domain.sh https://vedantium.dev        # enable custom domain
#   ./switch-domain.sh https://vedant9500.github.io # back to default Pages URL
set -euo pipefail

NEW_BASE="${1:?usage: switch-domain.sh https://example.com}"
NEW_BASE="${NEW_BASE%/}"

CUSTOM_DOMAIN="vedantium.dev"
DEFAULT_DOMAIN="vedant9500.github.io"

FILES=(
  sitemap.xml
  robots.txt
  llms.txt
  index.html
  about/index.html
  blog/index.html
)

if [[ "$NEW_BASE" != "https://$CUSTOM_DOMAIN" && "$NEW_BASE" != "https://$DEFAULT_DOMAIN" ]]; then
  echo "error: only '$CUSTOM_DOMAIN' and '$DEFAULT_DOMAIN' are supported" >&2
  exit 1
fi

git restore --staged . 2>/dev/null || true

for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || continue
  sed -i "s|https://$CUSTOM_DOMAIN|$NEW_BASE|g; s|https://$DEFAULT_DOMAIN|$NEW_BASE|g" "$f"
  echo "updated: $f"
done

if [[ "$NEW_BASE" == "https://$CUSTOM_DOMAIN" ]]; then
  printf '%s\n' "$CUSTOM_DOMAIN" > CNAME
  echo "created: CNAME ($CUSTOM_DOMAIN)"
  git add CNAME
else
  git rm --cached CNAME 2>/dev/null || true
  rm -f CNAME
  echo "removed: CNAME (back on default Pages URL)"
fi

git add "${FILES[@]}"

echo
echo "Switched to: $NEW_BASE"
echo "Review with 'git diff --cached' then 'git commit' and 'git push'."
