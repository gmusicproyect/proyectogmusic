#!/usr/bin/env bash
# Produces a file only. Does not install/reload Nginx or modify DNS.
set -euo pipefail
domain="${1:?Usage: render-nginx.sh domain output.conf}"
output="${2:?Output file required}"
if [[ ! "$domain" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ ]]; then
  echo "Invalid domain" >&2
  exit 1
fi
script_dir="$(cd "$(dirname "$0")" && pwd)"
sed "s/__DOMAIN__/$domain/g" "$script_dir/nginx.conf.template" > "$output"
echo "Rendered $output; review it before installation."
