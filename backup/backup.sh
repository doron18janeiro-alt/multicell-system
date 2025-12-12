#!/usr/bin/env bash
set -euo pipefail

# Configurações
BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
NOW="$(date +%Y-%m-%d_%H-%M-%S)"
RETENTION_DAYS=14
MODE="full"  # default
REPORT_FILE="$BACKUP_DIR/backup-report.txt"

# Detecta Supabase CLI ou fallback HTTP (precisa SUPABASE_DB_URL)
SUPABASE_CLI=$(command -v supabase || true)
DB_URL=${SUPABASE_DB_URL:-""}

usage() {
  cat <<'EOF'
Uso: backup.sh [--full|--incremental]
Requer: Supabase CLI autenticada OU variavel SUPABASE_DB_URL (postgres://...)
EOF
}

# Parse args
for arg in "$@"; do
  case "$arg" in
    --full) MODE="full" ;;
    --incremental) MODE="incremental" ;;
    -h|--help) usage; exit 0 ;;
  esac
done

mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

run_supabase_dump() {
  local target="$1"
  if [ -z "$SUPABASE_CLI" ]; then
    echo "Supabase CLI não encontrada. Configure SUPABASE_DB_URL para fallback." >&2
    return 1
  fi
  if [ "$target" = "full" ]; then
    supabase db dump --data-only --file "$BACKUP_DIR/backup-full.sql"
    supabase db dump --schema-only --file "$BACKUP_DIR/schema.sql"
  else
    supabase db dump --data-only --table vendas --table os --table produtos --table clientes --table usuarios --file "$BACKUP_DIR/backup-incremental-$NOW.sql"
  fi
}

run_http_dump() {
  if [ -z "$DB_URL" ]; then
    echo "SUPABASE_DB_URL não configurada; não é possível usar fallback HTTP." >&2
    return 1
  fi
  local outfile="$1"
  PGPASSWORD="${DB_URL##*:}" psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$outfile"
}

compress_file() {
  local file="$1"
  zip -q "${file%.sql}-$NOW.zip" "$file"
}

rotate_old() {
  find "$BACKUP_DIR" -name "*.zip" -mtime +$RETENTION_DAYS -delete || true
}

write_report() {
  local type="$1" file="$2" status="$3" size
  if [ -f "$file" ]; then
    size=$(du -h "$file" | cut -f1)
  else
    size="n/d"
  fi
  cat >"$REPORT_FILE" <<EOF
Data: $(date -Iseconds)
Tipo: $type
Arquivo: $file
Tamanho: $size
Tabelas: usuarios, produtos, vendas, os, clientes
Erros: $status
Status final: $( [ "$status" = "ok" ] && echo "SUCESSO" || echo "FALHOU" )
EOF
}

main() {
  local target_sql status="ok" zipfile

  if [ "$MODE" = "full" ]; then
    target_sql="$BACKUP_DIR/backup-full.sql"
    if ! run_supabase_dump full; then
      status="erro cli";
    fi
  else
    target_sql="$BACKUP_DIR/backup-incremental-$NOW.sql"
    if ! run_supabase_dump incremental; then
      status="erro cli";
    fi
  fi

  if [ "$status" != "ok" ] && [ -n "$DB_URL" ]; then
    # Tenta fallback HTTP/psql executando os selects do incremental/base
    if [ "$MODE" = "incremental" ]; then
      cp "$BACKUP_DIR/backup-incremental.sql" "$target_sql"
    else
      cp "$BACKUP_DIR/backup-full.sql" "$target_sql"
    fi
    if ! run_http_dump "$target_sql"; then
      status="erro http"
    else
      status="ok"
    fi
  fi

  if [ -f "$target_sql" ]; then
    compress_file "$target_sql"
  fi

  rotate_old
  write_report "$MODE" "$target_sql" "$status"
  echo "Backup $MODE concluído com status: $status"
}

main "$@"
