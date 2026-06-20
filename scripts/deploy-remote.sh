#!/usr/bin/env bash
set -euo pipefail

# Safe production deploy: update code from Git without losing runtime data.
# Backs up server-only / gitignored content before `git reset --hard`.

ROOT="${1:-/var/www/ruralcommerce}"
BACKUP_ROOT="/var/backups/ruralcommerce-deploy"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$BACKUP_ROOT/$STAMP"
LATEST="$BACKUP_ROOT/latest"
LEGACY_INSCRIPTIONS_BACKUP="/var/backups/ruralcommerce-project-inscriptions.json"
KEEP_BACKUPS=15

cd "$ROOT"

log() {
  echo "[deploy-remote] $*"
}

backup_path() {
  local rel="$1"
  local src="$ROOT/$rel"

  if [ -e "$src" ]; then
    mkdir -p "$(dirname "$BACKUP/$rel")"
    cp -a "$src" "$BACKUP/$rel"
    log "backup: $rel"
  fi
}

merge_dir_from_backup() {
  local rel="$1"
  local mode="${2:-update}"

  if [ ! -d "$BACKUP/$rel" ]; then
    return 0
  fi

  mkdir -p "$ROOT/$rel"

  if [ "$mode" = "full" ]; then
    rsync -a "$BACKUP/$rel/" "$ROOT/$rel/"
  else
    rsync -a --update "$BACKUP/$rel/" "$ROOT/$rel/"
  fi

  log "restored: $rel ($mode)"
}

mkdir -p "$BACKUP_ROOT" "$ROOT/data"

log "Starting backup in $BACKUP"

# Project enrollments + diagnoses (gitignored)
backup_path "data/project-inscriptions.json"

# Production secrets (gitignored)
backup_path ".env.production.local"

# Editor content (tracked in git, but server may have unpushed drafts)
if [ -d "$ROOT/public/page-layouts" ]; then
  mkdir -p "$BACKUP/public"
  cp -a "$ROOT/public/page-layouts" "$BACKUP/public/"
  log "backup: public/page-layouts/"
fi

if [ -d "$ROOT/public/blog-posts" ]; then
  mkdir -p "$BACKUP/public"
  cp -a "$ROOT/public/blog-posts" "$BACKUP/public/"
  log "backup: public/blog-posts/"
fi

# Media uploads (runtime only; never pushed by editor API)
if [ -d "$ROOT/public/images/uploads" ]; then
  mkdir -p "$BACKUP/public/images"
  cp -a "$ROOT/public/images/uploads" "$BACKUP/public/images/"
  log "backup: public/images/uploads/"
fi

if [ -f "$ROOT/data/project-inscriptions.json" ]; then
  cp "$ROOT/data/project-inscriptions.json" "$LEGACY_INSCRIPTIONS_BACKUP"
fi

ln -sfn "$BACKUP" "$LATEST"

if git rev-parse origin/master >/dev/null 2>&1; then
  UNPUSHED="$(git rev-list origin/master..HEAD 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${UNPUSHED:-0}" -gt 0 ]; then
    log "WARNING: $UNPUSHED unpushed commit(s) on server — saving patch before reset"
    mkdir -p "$BACKUP/git"
    git log origin/master..HEAD --oneline > "$BACKUP/git/unpushed-commits.txt" || true
    git diff origin/master..HEAD > "$BACKUP/git/unpushed.patch" || true
  fi
fi

git fetch origin
git reset --hard origin/master

# Gitignored runtime files: always restore from backup
if [ -f "$BACKUP/data/project-inscriptions.json" ]; then
  mkdir -p "$ROOT/data"
  cp -a "$BACKUP/data/project-inscriptions.json" "$ROOT/data/project-inscriptions.json"
  log "restored: data/project-inscriptions.json"
elif [ -f "$LEGACY_INSCRIPTIONS_BACKUP" ]; then
  mkdir -p "$ROOT/data"
  cp -a "$LEGACY_INSCRIPTIONS_BACKUP" "$ROOT/data/project-inscriptions.json"
  log "restored: data/project-inscriptions.json (legacy backup)"
elif [ ! -f "$ROOT/data/project-inscriptions.json" ]; then
  mkdir -p "$ROOT/data"
  if [ -f "$ROOT/data/project-inscriptions.example.json" ]; then
    cp "$ROOT/data/project-inscriptions.example.json" "$ROOT/data/project-inscriptions.json"
  else
    printf '[]\n' > "$ROOT/data/project-inscriptions.json"
  fi
  log "seeded: data/project-inscriptions.json"
fi

if [ -f "$BACKUP/.env.production.local" ]; then
  cp -a "$BACKUP/.env.production.local" "$ROOT/.env.production.local"
  log "restored: .env.production.local"
fi

# Tracked editor JSON: merge newer / server-only files from backup
merge_dir_from_backup "public/page-layouts" "update"
merge_dir_from_backup "public/blog-posts" "update"

# Uploads: full merge (runtime library; not in git)
merge_dir_from_backup "public/images/uploads" "full"

if [ -d "$BACKUP_ROOT" ]; then
  mapfile -t OLD_BACKUPS < <(ls -1dt "$BACKUP_ROOT"/[0-9]* 2>/dev/null || true)
  if [ "${#OLD_BACKUPS[@]}" -gt "$KEEP_BACKUPS" ]; then
    for old in "${OLD_BACKUPS[@]:$KEEP_BACKUPS}"; do
      if [ "$old" != "$BACKUP" ]; then
        rm -rf "$old"
      fi
    done
  fi
fi

npm install
npm run build
pm2 restart ruralcommerce --update-env

log "Deploy complete"
log "Backup kept at: $BACKUP"
log "Symlink: $LATEST"
