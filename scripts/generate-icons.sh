#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/public/icon.png"

sips -s format png "$SRC" --out "$ROOT/public/icon-192.png" -z 192 192 >/dev/null
sips -s format png "$SRC" --out "$ROOT/public/icon-512.png" -z 512 512 >/dev/null

echo "Generated public/icon-192.png and public/icon-512.png"
