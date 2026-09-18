"""Extrae del PDF renderizado el número de página real de cada encabezado.

La comparación se hace sin espacios: LibreOffice parte los encabezados largos
entre dos líneas (y a veces con guión), así que cualquier normalización que
conserve los espacios falla en esos casos.
"""
import json, re, subprocess, sys, unicodedata

pdf, encabezados_json, salida = sys.argv[1], sys.argv[2], sys.argv[3]
txt = subprocess.run(['pdftotext', '-layout', pdf, '-'],
                     capture_output=True, text=True, check=True).stdout
paginas = txt.split('\f')


def norm(s):
    s = unicodedata.normalize('NFC', s)
    s = s.replace('­', '').replace('’', "'")
    s = re.sub(r'[*_`]', '', s)                 # marcas de markdown
    s = re.sub(r'[‐-―]', '-', s)      # guiones y rayas, unificados
    return re.sub(r'\s+', '', s).lower()


paginas_norm = [norm(p) for p in paginas]
CENTINELA = norm('El estudio es un experimento de actitudes lingüísticas')
inicio = next((i for i, p in enumerate(paginas_norm) if CENTINELA in p), 0)

encabezados = json.load(open(encabezados_json, encoding='utf-8'))
mapa, faltan = {}, []
buscar_desde = inicio
for e in encabezados:
    objetivo = norm(e['texto'])
    hallado = next((i for i in range(buscar_desde, len(paginas_norm))
                    if objetivo in paginas_norm[i]), None)
    if hallado is None:
        faltan.append(e['texto'])
    else:
        mapa[e['id']] = hallado + 1   # la página 1 del PDF es la portada
        buscar_desde = hallado        # los encabezados aparecen en orden

json.dump(mapa, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{len(mapa)}/{len(encabezados)} encabezados localizados · '
      f'cuerpo desde la página {inicio + 1} · {len(paginas) - 1} págs')
if faltan:
    print('NO LOCALIZADOS:', *faltan, sep='\n  - ')
    sys.exit(1)
