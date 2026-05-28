#!/usr/bin/env bash
# Start Postgres 16 container for local dev.
# Persists data in .docker-data/postgres so it survives container removal.

set -euo pipefail

CONTAINER_NAME="ttodo-postgres"
POSTGRES_USER="ttodo"
POSTGRES_PASSWORD="ttodo_dev_password"
POSTGRES_DB="ttodo"
POSTGRES_PORT="5433"  # 5433 to avoid clashing with native postgres if installed

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${PROJECT_ROOT}/.docker-data/postgres"

mkdir -p "${DATA_DIR}"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "✓ ${CONTAINER_NAME} already running on port ${POSTGRES_PORT}"
    else
        echo "→ Starting existing container ${CONTAINER_NAME}..."
        docker start "${CONTAINER_NAME}"
        echo "✓ ${CONTAINER_NAME} started on port ${POSTGRES_PORT}"
    fi
else
    echo "→ Creating new Postgres container ${CONTAINER_NAME}..."
    docker run -d \
        --name "${CONTAINER_NAME}" \
        -e POSTGRES_USER="${POSTGRES_USER}" \
        -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
        -e POSTGRES_DB="${POSTGRES_DB}" \
        -p "${POSTGRES_PORT}:5432" \
        -v "${DATA_DIR}:/var/lib/postgresql/data" \
        postgres:16-alpine
    echo "✓ ${CONTAINER_NAME} created on port ${POSTGRES_PORT}"
fi

echo ""
echo "Connection string:"
echo "  DATABASE_URL=\"postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public\""
