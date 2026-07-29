#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Pre-renderiza los diagramas .puml a .svg ANTES de que corra `mkdocs build`.
#
# Decisión de diseño: el sitio publicado NO depende de ningún servidor PlantUML
# externo en runtime. Los .puml van versionados en el repo y los .svg se
# generan acá (en CI y también en local). Así el sitio se ve igual aunque
# plantuml.com esté caído, y funciona offline desde el celular.
# ---------------------------------------------------------------------------
set -euo pipefail

PLANTUML_VERSION="${PLANTUML_VERSION:-1.2026.6}"
JAR="${PLANTUML_JAR:-plantuml.jar}"
SRC_DIR="docs/diagramas"

cd "$(dirname "$0")/.."

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: se necesita java para renderizar los diagramas." >&2
  exit 1
fi

if [ ! -f "$JAR" ]; then
  echo ">> Descargando PlantUML ${PLANTUML_VERSION}..."
  curl -fsSL -o "$JAR" \
    "https://github.com/plantuml/plantuml/releases/download/v${PLANTUML_VERSION}/plantuml-${PLANTUML_VERSION}.jar"
fi

shopt -s nullglob
puml_files=("$SRC_DIR"/*.puml)

if [ ${#puml_files[@]} -eq 0 ]; then
  echo ">> No hay archivos .puml en ${SRC_DIR}, nada que renderizar."
  exit 0
fi

echo ">> Renderizando ${#puml_files[@]} diagrama(s) a SVG..."
# -tsvg      : salida vectorial (escala bien en pantalla de celular)
# -nometadata: SVG reproducible, sin timestamps que ensucien el diff
# -failfast2 : aborta ante el primer error de sintaxis
java -Djava.awt.headless=true -jar "$JAR" \
  -tsvg -nometadata -failfast2 \
  -o "$(pwd)/${SRC_DIR}" \
  "${puml_files[@]}"

echo ">> Diagramas generados:"
for f in "$SRC_DIR"/*.svg; do
  printf "   %s (%s bytes)\n" "$(basename "$f")" "$(stat -c%s "$f")"
done
