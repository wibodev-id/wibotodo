#!/usr/bin/env bash
# Stop (but don't remove) the Postgres container.
# Data is preserved. Use `docker rm ttodo-postgres` to fully remove the container.

set -euo pipefail

CONTAINER_NAME="ttodo-postgres"

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker stop "${CONTAINER_NAME}"
    echo "✓ ${CONTAINER_NAME} stopped (data preserved in .docker-data/postgres)"
else
    echo "ℹ ${CONTAINER_NAME} not running"
fi
