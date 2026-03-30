#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "==> Building C simulation engine"
make -C "$ROOT_DIR/sim-engine" build

echo "==> Creating backend virtual environment if missing"
if [ ! -d "$BACKEND_DIR/.venv" ]; then
  python3 -m venv "$BACKEND_DIR/.venv"
fi

echo "==> Installing backend dependencies"
source "$BACKEND_DIR/.venv/bin/activate"
python -m pip install --upgrade pip
python -m pip install -r "$BACKEND_DIR/requirements.txt"

cleanup() {
  echo
  echo "==> Stopping local servers"
  jobs -p | xargs kill 2>/dev/null || true
}
trap cleanup EXIT

echo "==> Starting backend on http://127.0.0.1:8000"
(
  cd "$BACKEND_DIR"
  source .venv/bin/activate
  python -m uvicorn app:app --reload
) &

echo "==> Starting frontend on http://127.0.0.1:8080"
(
  cd "$FRONTEND_DIR"
  python3 -m http.server 8080
) &

echo
echo "Frontend: http://127.0.0.1:8080"
echo "Backend:  http://127.0.0.1:8000"
echo "Docs:     http://127.0.0.1:8000/docs"
echo
echo "Press Ctrl+C to stop both."

wait
