#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT_DIR"

if ! command -v npx >/dev/null 2>&1; then
  echo "Brak npx. Zainstaluj Node.js, potem uruchom ponownie: npx wrangler pages deploy dist --project-name jak-sie-zjawi" >&2
  exit 1
fi

sh ./build_pages.sh
exec npx wrangler pages deploy dist --project-name jak-sie-zjawi
