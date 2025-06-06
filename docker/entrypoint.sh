#!/bin/sh
set -e

TIMEOUT=120
START=$(date +%s)

printf 'Waiting for database to be ready...\n'

until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
  NOW=$(date +%s)
  if [ $((NOW - START)) -ge $TIMEOUT ]; then
    echo "Database not ready after $TIMEOUT seconds" >&2
    exit 1
  fi
  sleep 2
done

printf 'Database ready. Running migrations...\n'

npx node-pg-migrate

printf 'Starting application...\n'
exec "$@"

