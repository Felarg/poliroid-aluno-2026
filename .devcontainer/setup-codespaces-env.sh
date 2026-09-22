#!/usr/bin/env bash

# Prepara URLs públicas temporárias para o navegador acessar app e MinIO.
set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
fi

if [ -z "${CODESPACES:-}" ]; then
  exit 0
fi

if [ -z "${CODESPACE_NAME:-}" ] || [ -z "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
  echo "Não foi possível configurar as URLs públicas do Codespaces."
  exit 1
fi

replace_env_value() {
  local name="$1"
  local value="$2"

  if grep -q "^${name}=" .env; then
    sed -i "s|^${name}=.*|${name}=${value}|" .env
    return
  fi

  printf '%s=%s\n' "$name" "$value" >>.env
}

domain="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
replace_env_value "APP_ORIGIN" "https://${CODESPACE_NAME}-3000.${domain}"
replace_env_value "STORAGE_PUBLIC_ENDPOINT" "https://${CODESPACE_NAME}-9000.${domain}"

echo "Arquivo .env preparado para o Codespace."
