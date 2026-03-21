#!/bin/bash
# ═══════════════════════════════════════════════════════════
# C-Tracks — Restaurar base de datos desde backup
# Uso: ./scripts/restore-db.sh <archivo_backup.sql.gz>
# ═══════════════════════════════════════════════════════════

set -euo pipefail

if [ $# -eq 0 ]; then
    echo "Uso: $0 <archivo_backup.sql.gz>"
    echo ""
    echo "Backups disponibles:"
    ls -lh backups/ctracks_backup_*.sql.gz 2>/dev/null || echo "  No hay backups en ./backups/"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "[ERROR] Archivo no encontrado: $BACKUP_FILE"
    exit 1
fi

echo "[RESTORE] ADVERTENCIA: Esto reemplazará TODA la base de datos actual."
echo "[RESTORE] Archivo: $BACKUP_FILE"
read -p "¿Continuar? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "[RESTORE] Cancelado."
    exit 0
fi

DB_NAME="${POSTGRES_DB:-ctracks}"
DB_USER="${POSTGRES_USER:-ctracks}"

echo "[RESTORE] Restaurando base de datos..."

# Desconectar sesiones activas y recrear la BD
docker compose exec -T db psql -U "$DB_USER" -d postgres -c "
    SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();
" >/dev/null 2>&1 || true

docker compose exec -T db psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" >/dev/null
docker compose exec -T db psql -U "$DB_USER" -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" >/dev/null

# Restaurar
gunzip -c "$BACKUP_FILE" | docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" >/dev/null

echo "[RESTORE] Base de datos restaurada exitosamente desde: $BACKUP_FILE"
