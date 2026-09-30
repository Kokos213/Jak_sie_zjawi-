#!/bin/sh
set -eu

API_BASE="${API_BASE:-}"
case "$API_BASE" in
  http://*|https://*|"") ;;
  *) echo "API_BASE must be an http(s) URL" >&2; exit 1 ;;
esac

ESCAPED_API_BASE=$(printf '%s' "$API_BASE" | sed 's/\\/\\\\/g; s/"/\\"/g')
rm -rf dist
mkdir -p dist
cp index.html styles.css app.js dist/
printf 'window.__SKM_API_BASE__ = "%s";\n' "$ESCAPED_API_BASE" > dist/config.js
test -s dist/config.js
test -s dist/index.html
test -s dist/styles.css
test -s dist/app.js
test -d functions
echo "Generated dist/ for Cloudflare Pages static assets; functions/ remains a Pages Functions source directory."
