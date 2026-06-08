#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/public/icon.png"
OUT192="$ROOT/public/icon-192.png"
OUT512="$ROOT/public/icon-512.png"

if [[ -f "$OUT192" && -f "$OUT512" ]]; then
  if ! command -v sips >/dev/null 2>&1; then
    echo "PWA icons already present, skipping generation (sips unavailable)."
    exit 0
  fi
fi

if ! command -v sips >/dev/null 2>&1; then
  echo "error: sips is unavailable and public/icon-192.png or public/icon-512.png is missing." >&2
  exit 1
fi

if [[ ! -f "$SRC" ]]; then
  echo "error: missing source icon at public/icon.png" >&2
  exit 1
fi

sips -s format png "$SRC" --out "$OUT192" -z 192 192 >/dev/null
sips -s format png "$SRC" --out "$OUT512" -z 512 512 >/dev/null

echo "Generated public/icon-192.png and public/icon-512.png"
