#!/bin/sh
set -eu

API_BASE="${API_BASE:-}"
VERSION="${CF_PAGES_COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || date +%s)}"
case "$API_BASE" in
  http://*|https://*|"") ;;
  *) echo "API_BASE must be an http(s) URL" >&2; exit 1 ;;
esac

ESCAPED_API_BASE=$(printf '%s' "$API_BASE" | sed 's/\\/\\\\/g; s/"/\\"/g')
rm -rf dist
mkdir -p dist
cp index.html styles.css app.js dist/
printf 'window.__SKM_API_BASE__ = "%s";\n' "$ESCAPED_API_BASE" > dist/config.js
sed -i.bak \
  -e "s|href=\"styles.css\"|href=\"styles.css?v=${VERSION}\"|g" \
  -e "s|src=\"config.js\"|src=\"config.js?v=${VERSION}\"|g" \
  -e "s|src=\"app.js\"|src=\"app.js?v=${VERSION}\"|g" \
  dist/index.html
rm -f dist/index.html.bak
test -s dist/config.js
test -s dist/index.html
test -s dist/styles.css
test -s dist/app.js
test -d functions
grep -q "loginEmail" dist/index.html
grep -q "loginPassword" dist/index.html
echo "Generated dist/ for Cloudflare Pages static assets; functions/ remains a Pages Functions source directory."
