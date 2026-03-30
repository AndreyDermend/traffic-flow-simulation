#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
SIM_BIN="$ROOT_DIR/sim-engine/bin/traffic_sim"

echo "==> Building C simulation engine"
make -C "$ROOT_DIR/sim-engine" build

echo "==> Verifying simulation binary exists"
if [ ! -f "$SIM_BIN" ]; then
  echo "Simulation binary not found: $SIM_BIN"
  exit 1
fi

echo "==> Creating backend virtual environment if missing"
if [ ! -d "$BACKEND_DIR/.venv" ]; then
  python3 -m venv "$BACKEND_DIR/.venv"
fi

echo "==> Installing backend dependencies"
source "$BACKEND_DIR/.venv/bin/activate"
python -m pip install --upgrade pip
python -m pip install -r "$BACKEND_DIR/requirements.txt"

echo "==> Generating sample simulation output"
"$SIM_BIN" 300 42 > "$ROOT_DIR/data/sample_run.json"

echo "==> Running backend tests"
cd "$BACKEND_DIR"
source .venv/bin/activate
python -m pytest -q

echo
echo "Local test run completed successfully."
