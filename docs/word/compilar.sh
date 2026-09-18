#!/usr/bin/env bash
# Regenera docs/Guia-estadistica-del-estudio.docx a partir del markdown.
#
# Se compila en dos pasadas: la primera fija la paginación escribiendo «00» en
# el índice, y la segunda vuelve a construirlo con los números de página reales
# que se han leído del PDF. Como el índice conserva el mismo número de líneas
# en ambas pasadas, la paginación no se mueve; el script lo comprueba al final.
set -euo pipefail
cd "$(dirname "$0")"

MD="${1:-../estadistica-guia.md}"
OUT="${2:-../Guia-estadistica-del-estudio.docx}"
BASE="${OUT%.docx}"

# package.json propio: el install queda aquí y no toca el del proyecto
[ -d node_modules/docx ] || npm install --silent

rm -f "$BASE.pdf" "$BASE.paginas.json" "$BASE.paginas.verif.json"

node build.js "$MD" "$OUT"                       # pasada 1 · índice con «00»
python3 arreglar.py "$OUT"
soffice --headless --convert-to pdf --outdir "$(dirname "$OUT")" "$OUT" >/dev/null 2>&1
python3 paginas.py "$BASE.pdf" "$BASE.encabezados.json" "$BASE.paginas.json"

node build.js "$MD" "$OUT" "$BASE.paginas.json"  # pasada 2 · páginas reales
python3 arreglar.py "$OUT"
rm -f "$BASE.pdf"
soffice --headless --convert-to pdf --outdir "$(dirname "$OUT")" "$OUT" >/dev/null 2>&1
python3 paginas.py "$BASE.pdf" "$BASE.encabezados.json" "$BASE.paginas.verif.json"

if diff -q "$BASE.paginas.json" "$BASE.paginas.verif.json" >/dev/null; then
  echo "✔ Índice verificado: los números de página coinciden tras la segunda pasada."
else
  echo "✘ La paginación cambió entre pasadas:"
  diff "$BASE.paginas.json" "$BASE.paginas.verif.json" || true
  exit 1
fi

rm -f "$BASE.pdf" "$BASE.paginas.verif.json" "$BASE.encabezados.json" "$BASE.paginas.json"
echo "✔ Listo: $OUT"
