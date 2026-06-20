#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-/var/www/ruralcommerce}"
DATA_FILE="$ROOT/data/project-inscriptions.json"
BACKUP="/var/backups/ruralcommerce-project-inscriptions.json"

cd "$ROOT"

mkdir -p "$ROOT/data" /var/backups

if [ -f "$DATA_FILE" ]; then
  cp "$DATA_FILE" "$BACKUP"
fi

git fetch origin
git reset --hard origin/master

mkdir -p "$ROOT/data"

if [ -f "$BACKUP" ]; then
  cp "$BACKUP" "$DATA_FILE"
elif [ ! -f "$DATA_FILE" ]; then
  if [ -f "$ROOT/data/project-inscriptions.example.json" ]; then
    cp "$ROOT/data/project-inscriptions.example.json" "$DATA_FILE"
  else
    printf '[]\n' > "$DATA_FILE"
  fi
fi

npm install
npm run build
pm2 restart ruralcommerce --update-env
