#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT_DIR"

if [ -n "${SKM_PYTHON:-}" ] && [ -x "$SKM_PYTHON" ]; then
  PYTHON="$SKM_PYTHON"
elif [ -x "/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/Resources/Python.app/Contents/MacOS/Python" ]; then
  PYTHON="/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/Resources/Python.app/Contents/MacOS/Python"
elif command -v python3 >/dev/null 2>&1 && python3 -c 'import sys; print(sys.executable)' >/dev/null 2>&1; then
  PYTHON=$(command -v python3)
else
  echo "Nie znaleziono działającego Pythona. Zainstaluj Python 3 lub ustaw SKM_PYTHON=/ścieżka/do/python3." >&2
  exit 1
fi

exec "$PYTHON" "$ROOT_DIR/server.py"
