# Generador del documento Word

`../Guia-estadistica-del-estudio.docx` **no se edita a mano**: se genera desde
`../estadistica-guia.md`, que es la fuente única de verdad. Si cambias la guía,
vuelve a compilar el Word para que no se separen.

```bash
./compilar.sh
```

## Qué hace cada pieza

| Archivo | Papel |
| ------- | ----- |
| `build.js` | Convierte el markdown en `.docx` con [docx-js](https://docx.js.org): portada, índice, estilos, tablas, cajas destacadas, listas, pie con numeración. |
| `paginas.py` | Lee el PDF renderizado y saca el número de página real de cada encabezado, para el índice. |
| `arreglar.py` | Dos correcciones sobre la salida de docx-js: identificadores de marcador únicos y bordes de párrafo en el orden que exige OOXML. |
| `compilar.sh` | Encadena las dos pasadas y verifica el resultado. |

## Por qué son dos pasadas

Word puede insertar un índice como *campo* que se actualiza solo, pero queda
vacío hasta que alguien lo abre precisamente en Word: en Google Docs, en
LibreOffice o en una vista previa se ve en blanco. Aquí el índice se escribe
como texto real con enlaces internos, así que se ve siempre.

El precio es que hay que averiguar los números de página antes de escribirlos:

1. **Pasada 1** — se construye el documento con `00` en cada número de página,
   se convierte a PDF y se localiza en qué página cae cada encabezado.
2. **Pasada 2** — se reconstruye con los números reales.

Como el índice ocupa exactamente las mismas líneas en las dos pasadas, la
paginación no se mueve. `compilar.sh` lo comprueba de todos modos: vuelve a
extraer las páginas del documento final y falla si algún número ha cambiado.

## Requisitos

- Node 18+ (el script instala `docx` la primera vez)
- Python 3
- LibreOffice (`soffice`) y `pdftotext` (poppler-utils), solo para la
  verificación del índice

## Si cambias el markdown

El parser cubre el subconjunto de markdown que usa la guía: encabezados `##` a
`####`, párrafos, listas con viñeta y numeradas (con continuación indentada),
tablas de tubería, citas `>`, bloques de código y, en línea, `**negrita**`,
`*cursiva*`, `_cursiva_`, `` `código` `` y enlaces. Cada `##` abre página nueva.
Si añades sintaxis nueva (imágenes, listas anidadas, notas al pie), hay que
ampliar `parsear()` en `build.js`.
