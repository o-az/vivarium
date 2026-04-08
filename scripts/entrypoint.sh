#!/usr/bin/env bash

set -euo pipefail

echo "Starting vivarium . . ."

bun --parallel dev:server dev:client

exec "$@"
