#!/bin/sh
set -e

printf 'Entrypoint starting at %s\n' "$(date)"
printf 'NODE VERSION: %s\n' "$(node -v 2>/dev/null || echo 'node not installed')"
printf 'NODE_ENV=%s\n' "${NODE_ENV:-}"
if [ -n "$DATABASE_URL" ]; then
  printf 'Using DATABASE_URL=%s\n' "$DATABASE_URL"
else
  printf 'DATABASE_URL not set\n'
fi

TIMEOUT=120
START=$(date +%s)

printf 'Waiting for database to be ready...\n'

until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
  NOW=$(date +%s)
  if [ $((NOW - START)) -ge $TIMEOUT ]; then
    echo "Database not ready after $TIMEOUT seconds" >&2
    exit 1
  fi
  printf 'Database not ready yet, waiting 2s...\n'
  sleep 2
done

printf 'Database ready. Running migrations...\n'

npx node-pg-migrate

printf 'Starting application...\n'
printf 'Exec command: %s\n' "$*"
exec "$@"

