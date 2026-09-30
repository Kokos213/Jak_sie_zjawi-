#!/bin/sh
set -eu

API_BASE="${API_BASE:-}"
case "$API_BASE" in
  http://*|https://*|"") ;;
  *) echo "API_BASE must be an http(s) URL" >&2; exit 1 ;;
esac

ESCAPED_API_BASE=$(printf '%s' "$API_BASE" | sed 's/\\/\\\\/g; s/"/\\"/g')
printf 'window.__SKM_API_BASE__ = "%s";\n' "$ESCAPED_API_BASE" > config.js
echo "Generated config.js for static Pages build."
