#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_DIR="${VENV_DIR:-.venv}"

if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

APP_NAME="my-desktop-app"
ENTRYPOINT="app/main.py"

pyinstaller --noconfirm --name "$APP_NAME" --onefile --windowed "$ENTRYPOINT"

echo "Built: dist/$APP_NAME"

