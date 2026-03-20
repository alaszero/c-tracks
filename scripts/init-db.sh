#!/bin/bash
# Inicializar la base de datos y ejecutar migraciones
set -e

echo "╔══════════════════════════════════════╗"
echo "║   C-Tracks — Inicializar BD          ║"
echo "╚══════════════════════════════════════╝"

echo "Esperando a que PostgreSQL esté listo..."
until docker compose exec db pg_isready -U "${POSTGRES_USER:-ctracks}" > /dev/null 2>&1; do
    sleep 2
done
echo "✅ PostgreSQL listo"

echo "Ejecutando migraciones..."
docker compose exec backend alembic upgrade head

echo "✅ Base de datos inicializada"
