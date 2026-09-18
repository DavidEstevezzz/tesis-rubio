"""Corrige en el .docx dos cosas que docx-js no emite conformes al esquema.

1. Identificadores de marcador. docx-js reinicia su contador en cada
   `Bookmark`, así que los 47 marcadores del índice salen todos con w:id="1".
   El nombre (w:name) sí es único —y es lo que usan los enlaces internos—,
   pero un id duplicado es inválido y Word puede ofrecer «reparar» el archivo.

2. Orden de los bordes de párrafo. docx-js escribe <w:pBdr> como
   top → bottom → left → right, mientras que OOXML exige
   top → left → bottom → right → between → bar.
"""
import re, shutil, sys, zipfile

ruta = sys.argv[1]
with zipfile.ZipFile(ruta) as z:
    elementos = {n: z.read(n) for n in z.namelist()}
    info = {i.filename: i for i in z.infolist()}

xml = elementos['word/document.xml'].decode('utf-8')
contador = iter(range(1, 100000))
nombre_a_id = {}

def inicio(m):
    nombre = m.group(1)
    nombre_a_id[nombre] = next(contador)
    return f'<w:bookmarkStart w:name="{nombre}" w:id="{nombre_a_id[nombre]}"/>'

xml, n1 = re.subn(r'<w:bookmarkStart w:name="([^"]+)" w:id="\d+"/>', inicio, xml)

pendientes = iter(list(nombre_a_id.values()))
xml, n2 = re.subn(r'<w:bookmarkEnd w:id="\d+"/>',
                  lambda m: f'<w:bookmarkEnd w:id="{next(pendientes)}"/>', xml)

# 2) Orden de los hijos de <w:pBdr>
ORDEN_BORDES = ['top', 'left', 'bottom', 'right', 'between', 'bar']

def ordenar_bordes(m):
    hijos = re.findall(r'<w:\w+\b[^>]*/>', m.group(1))
    clave = lambda h: ORDEN_BORDES.index(re.match(r'<w:(\w+)', h).group(1))
    return '<w:pBdr>' + ''.join(sorted(hijos, key=clave)) + '</w:pBdr>'

xml, n3 = re.subn(r'<w:pBdr>(.*?)</w:pBdr>', ordenar_bordes, xml, flags=re.S)

elementos['word/document.xml'] = xml.encode('utf-8')
with zipfile.ZipFile(ruta, 'w', zipfile.ZIP_DEFLATED) as z:
    for nombre, datos in elementos.items():
        z.writestr(info[nombre], datos)
print(f'marcadores renumerados: {n1} inicios / {n2} finales · '
      f'{len(set(nombre_a_id.values()))} ids únicos · {n3} bordes ordenados')
