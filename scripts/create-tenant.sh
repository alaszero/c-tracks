#!/bin/bash
# Crear un nuevo tenant (schema) en la base de datos
set -e

if [ -z "$1" ]; then
    echo "Uso: ./scripts/create-tenant.sh <slug>"
    echo "Ejemplo: ./scripts/create-tenant.sh constructora-xyz"
    exit 1
fi

SLUG=$1
SCHEMA_NAME="tenant_$(echo $SLUG | tr '-' '_')"

echo "Creando schema: $SCHEMA_NAME"

docker compose exec db psql -U "${POSTGRES_USER:-ctracks}" -d "${POSTGRES_DB:-ctracks}" \
    -c "CREATE SCHEMA IF NOT EXISTS $SCHEMA_NAME;"

echo "✅ Schema $SCHEMA_NAME creado"
