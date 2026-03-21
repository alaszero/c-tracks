#!/bin/bash
# ═══════════════════════════════════════════════════════════
# C-Tracks — Empaquetar para deploy vía USB
# Genera un .tar.gz listo para copiar al servidor
# Uso: ./scripts/package-for-deploy.sh
# ═══════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="ctracks_deploy_${TIMESTAMP}.tar.gz"

cd "$PROJECT_DIR"

echo "[PACKAGE] Empaquetando C-Tracks para deploy..."

# Archivos necesarios para deploy
tar czf "$PACKAGE_NAME" \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='.claude' \
    --exclude='*.pyc' \
    --exclude='.env' \
    --exclude='backups' \
    --exclude='*.tar.gz' \
    docker-compose.yml \
    docker-compose.prod.yml \
    .env.example \
    backend/ \
    frontend/ \
    nginx/ \
    scripts/ \
    deploy.sh

SIZE=$(du -sh "$PACKAGE_NAME" | cut -f1)
echo "[PACKAGE] Paquete creado: $PACKAGE_NAME ($SIZE)"
echo ""
echo "Instrucciones:"
echo "  1. Copiar $PACKAGE_NAME al servidor vía USB"
echo "  2. En el servidor: tar xzf $PACKAGE_NAME"
echo "  3. Copiar .env.example a .env y configurar"
echo "  4. Ejecutar: chmod +x deploy.sh && ./deploy.sh --build --migrate"
