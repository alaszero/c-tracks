#!/bin/bash
# ═══════════════════════════════════════════════════════════
# C-Tracks — Backup de base de datos PostgreSQL
# Uso: ./scripts/backup-db.sh [directorio_destino]
# ═══════════════════════════════════════════════════════════

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="ctracks_backup_${TIMESTAMP}.sql.gz"

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

echo "[BACKUP] Iniciando backup de base de datos..."
echo "[BACKUP] Destino: ${BACKUP_DIR}/${FILENAME}"

# Ejecutar pg_dump dentro del contenedor de la base de datos
docker compose exec -T db pg_dump \
    -U "${POSTGRES_USER:-ctracks}" \
    -d "${POSTGRES_DB:-ctracks}" \
    --no-owner \
    --no-privileges \
    --format=plain \
    | gzip > "${BACKUP_DIR}/${FILENAME}"

# Verificar tamaño
SIZE=$(du -sh "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "[BACKUP] Completado: ${FILENAME} (${SIZE})"

# Limpiar backups antiguos (mantener últimos 30)
cd "$BACKUP_DIR"
ls -t ctracks_backup_*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm --
TOTAL=$(ls ctracks_backup_*.sql.gz 2>/dev/null | wc -l)
echo "[BACKUP] Total backups almacenados: ${TOTAL}"
