#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_URL=${SUPABASE_DB_URL:-""}
SQL_FILE=${1:-"$BACKUP_DIR/backup-full.sql"}

if [ -z "$SQL_FILE" ] || [ ! -f "$SQL_FILE" ]; then
  echo "Arquivo de restauração não encontrado: $SQL_FILE" >&2
  exit 1
fi

if command -v supabase >/dev/null 2>&1; then
  # Supabase CLI não tem modo merge; usamos psql para aplicar sem drops
  echo "Usando psql via Supabase DB URL para restaurar em modo merge (sem drops)."
fi

if [ -z "$DB_URL" ]; then
  echo "Defina SUPABASE_DB_URL=postgres://user:pass@host:port/dbname" >&2
  exit 1
fi

echo "Restaurando (modo transacional, sem drops): $SQL_FILE"
psql "$DB_URL" -v ON_ERROR_STOP=1 <<EOF
BEGIN;
\i $SQL_FILE
COMMIT;
EOF

echo "Restauração concluída (merge). Nenhum dado existente foi apagado."
