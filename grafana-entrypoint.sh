#!/bin/sh
set -eu

SECRET_DIR="${GRAFANA_SECRET_DIR:-/run/grafana-secrets}"
export GF_SECURITY_ADMIN_USER="$(cat "$SECRET_DIR/admin_user")"
export GF_SECURITY_ADMIN_PASSWORD="$(cat "$SECRET_DIR/admin_password")"

exec /run.sh
