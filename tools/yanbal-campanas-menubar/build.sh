#!/usr/bin/env bash
#
# Compila la app y ensambla YanbalCampanas.app (bundle de barra de menú).
# Requiere macOS 13+ y las Command Line Tools de Xcode (o Xcode).
#
#   ./build.sh          → compila en release y arma el .app en ./build/
#   ./build.sh --open   → además abre la app al terminar
#
set -euo pipefail

cd "$(dirname "$0")"

APP_NAME="YanbalCampanas"
APP_DISPLAY="Campañas Yanbal"
BUILD_DIR="build"
APP_BUNDLE="$BUILD_DIR/$APP_DISPLAY.app"

echo "→ Compilando en release…"
swift build -c release

BIN_PATH="$(swift build -c release --show-bin-path)/$APP_NAME"

echo "→ Ensamblando $APP_BUNDLE…"
rm -rf "$APP_BUNDLE"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

cp "$BIN_PATH" "$APP_BUNDLE/Contents/MacOS/$APP_NAME"
cp "Resources/Info.plist" "$APP_BUNDLE/Contents/Info.plist"

echo "✓ Listo: $APP_BUNDLE"
echo "  Instálalo arrastrándolo a /Applications."

if [[ "${1:-}" == "--open" ]]; then
  open "$APP_BUNDLE"
fi
