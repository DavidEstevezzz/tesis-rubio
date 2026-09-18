/*
 * Construye el .docx de la «Guía estadística del estudio» a partir del
 * markdown del repositorio.
 *
 * Uso:  node build.js <entrada.md> <salida.docx> [paginas.json]
 *
 * El tercer argumento es el mapa {anclaDelEncabezado: nºDePágina} que alimenta
 * el índice estático. En la primera pasada no existe y se escriben marcadores
 * de posición; después se renderiza el PDF, se extraen las páginas reales y se
 * vuelve a construir. Como el índice conserva el mismo número de líneas en
 * ambas pasadas, la paginación no se mueve.
 */
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, VerticalAlign,
  PageBreak, Footer, PageNumber, LevelFormat, convertMillimetersToTwip,
  ExternalHyperlink, InternalHyperlink, Bookmark, TabStopType, LineRuleType, LeaderType,
} = require('docx');

// ── Paleta (la del panel /admin del proyecto) ─────────────────────────────
const AZUL_OSCURO = '1D3C8D';
const AZUL        = '1F66F0';
const NARANJA     = 'FF7A2F';
const TINTA       = '1F2937';
const GRIS        = '475569';
const GRIS_CLARO  = '8FA0B5';
const BORDE       = 'CBD5E1';
const FONDO_SUAVE = 'F1F5F9';
const FONDO_CITA  = 'EFF4FE';

const SERIF = 'Cambria';
const SANS  = 'Calibri';
const MONO  = 'Consolas';

const MARGEN_LATERAL = convertMillimetersToTwip(22);
const ANCHO_PAGINA   = convertMillimetersToTwip(210);
const ANCHO_UTIL     = ANCHO_PAGINA - 2 * MARGEN_LATERAL;

const AUTO = (n) => ({ line: n, lineRule: LineRuleType.AUTO });

// ── Texto en línea: **negrita**, *cursiva*, _cursiva_, `código`, enlaces ──
const INLINE_RE = /(`[^`]+`)|(\*\*[\s\S]+?\*\*)|(\*[^*\n]+?\*)|(_[^_\n]+?_)|(\[[^\]]+\]\([^)]+\))/g;

function inline(text, base = {}) {
  const runs = [];
  let last = 0, m;
  const re = new RegExp(INLINE_RE.source, 'g');
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ ...base, text: text.slice(last, m.index) }));
    const tok = m[0];
    if (m[1]) {
      runs.push(new TextRun({
        ...base, text: tok.slice(1, -1), font: MONO, size: (base.size ?? 21) - 3,
        color: 'B91C5C', shading: { type: ShadingType.CLEAR, fill: FONDO_SUAVE },
      }));
    } else if (m[2]) {
      runs.push(...inline(tok.slice(2, -2), { ...base, bold: true }));
    } else if (m[3] || m[4]) {
      runs.push(...inline(tok.slice(1, -1), { ...base, italics: true }));
    } else {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      if (mm[2].startsWith('#')) runs.push(...inline(mm[1], base));
      else runs.push(new ExternalHyperlink({
        link: mm[2], children: [new TextRun({ ...base, text: mm[1], color: AZUL, underline: {} })],
      }));
    }
    last = m.index + tok.length;
  }
  if (last < text.length) runs.push(new TextRun({ ...base, text: text.slice(last) }));
  return runs.length ? runs : [new TextRun({ ...base, text: '' })];
}

// ── Bloques ───────────────────────────────────────────────────────────────
const parrafo = (texto) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 150, ...AUTO(288) },
  children: inline(texto, { size: 21 }),
});

const cita = (parrafos) => parrafos.map((linea, i) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing: {
    before: i === 0 ? 140 : 0,
    after: i === parrafos.length - 1 ? 200 : 100,
    ...AUTO(276),
  },
  indent: { left: 360, right: 200 },
  shading: { type: ShadingType.CLEAR, fill: FONDO_CITA },
  border: {
    top: i === 0 ? { style: BorderStyle.SINGLE, size: 2, color: FONDO_CITA, space: 8 } : undefined,
    left: { style: BorderStyle.SINGLE, size: 18, color: AZUL, space: 10 },
    bottom: i === parrafos.length - 1 ? { style: BorderStyle.SINGLE, size: 2, color: FONDO_CITA, space: 8 } : undefined,
  },
  children: inline(linea, { size: 20, color: '1E3A8A' }),
}));

const codigo = (lineas) => lineas.map((linea, i) => new Paragraph({
  alignment: AlignmentType.LEFT,
  spacing: {
    before: i === 0 ? 150 : 0,
    after: i === lineas.length - 1 ? 200 : 0,
    ...AUTO(252),
  },
  indent: { left: 220 },
  shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
  border: {
    top: i === 0 ? { style: BorderStyle.SINGLE, size: 2, color: 'F8FAFC', space: 8 } : undefined,
    left: { style: BorderStyle.SINGLE, size: 12, color: BORDE, space: 8 },
    bottom: i === lineas.length - 1 ? { style: BorderStyle.SINGLE, size: 2, color: 'F8FAFC', space: 8 } : undefined,
  },
  children: [new TextRun({ text: linea || ' ', font: MONO, size: 16, color: GRIS })],
}));

const item = (texto, ordenada) => new Paragraph({
  numbering: { reference: ordenada ? 'lista-num' : 'lista-bullet', level: 0 },
  alignment: AlignmentType.LEFT,
  spacing: { after: 100, ...AUTO(282) },
  children: inline(texto, { size: 21 }),
});

const espaciador = (alto = 100) => new Paragraph({
  spacing: { after: alto, ...AUTO(240) }, children: [new TextRun({ text: '', size: 6 })],
});

// ── Tablas ────────────────────────────────────────────────────────────────
const visible = (s) => s.replace(/\*\*|\*|`|_/g, '');
const palabraMasLarga = (s) => visible(s).split(/[\s/]+/).reduce((a, w) => Math.max(a, w.length), 0);

function anchosColumna(filas) {
  const n = filas[0].length;
  const pesos = [], minimos = [];
  for (let c = 0; c < n; c++) {
    let maxTexto = 0, maxPalabra = 0;
    for (const f of filas) {
      maxTexto = Math.max(maxTexto, visible(f[c] ?? '').length);
      maxPalabra = Math.max(maxPalabra, palabraMasLarga(f[c] ?? ''));
    }
    pesos.push(Math.min(Math.max(maxTexto, 10), 56));
    // Ancho mínimo para que ninguna palabra se parta: ~130 DXA por carácter a 9 pt
    minimos.push(Math.min(maxPalabra * 130 + 280, Math.round(ANCHO_UTIL * 0.42)));
  }
  const total = pesos.reduce((a, b) => a + b, 0);
  let anchos = pesos.map((p) => Math.round((p / total) * ANCHO_UTIL));

  // Sube las columnas por debajo de su mínimo y recorta las más holgadas
  for (let pasada = 0; pasada < 6; pasada++) {
    let deficit = 0;
    anchos = anchos.map((a, c) => {
      if (a < minimos[c]) { deficit += minimos[c] - a; return minimos[c]; }
      return a;
    });
    if (!deficit) break;
    const holgura = anchos.map((a, c) => Math.max(a - minimos[c], 0));
    const totalHolgura = holgura.reduce((x, y) => x + y, 0);
    if (!totalHolgura) break;
    anchos = anchos.map((a, c) => a - Math.round((holgura[c] / totalHolgura) * deficit));
  }
  anchos[n - 1] += ANCHO_UTIL - anchos.reduce((a, b) => a + b, 0);
  return anchos;
}

function tabla(filas, alineaciones) {
  const anchos = anchosColumna(filas);
  const celda = (texto, cabecera, banda, c) => new TableCell({
    width: { size: anchos[c], type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.CLEAR, fill: cabecera ? AZUL_OSCURO : (banda ? FONDO_SUAVE : 'FFFFFF') },
    margins: { top: 100, bottom: 100, left: 130, right: 130 },
    borders: ['top', 'bottom', 'left', 'right'].reduce((o, k) => {
      o[k] = { style: BorderStyle.SINGLE, size: 2, color: cabecera ? AZUL_OSCURO : BORDE };
      return o;
    }, {}),
    children: [new Paragraph({
      alignment: alineaciones[c] === 'center' ? AlignmentType.CENTER
        : alineaciones[c] === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 0, ...AUTO(264) },
      children: inline(texto, {
        size: 18, font: SANS, bold: cabecera || undefined, color: cabecera ? 'FFFFFF' : TINTA,
      }),
    })],
  });

  return new Table({
    width: { size: ANCHO_UTIL, type: WidthType.DXA },
    columnWidths: anchos,
    rows: filas.map((fila, r) => new TableRow({
      tableHeader: r === 0,
      cantSplit: true,
      children: fila.map((txt, c) => celda(txt, r === 0, r > 0 && r % 2 === 0, c)),
    })),
  });
}

// ── Parser del markdown (el subconjunto usado en la guía) ─────────────────
function parsear(md, encabezados) {
  const lineas = md.split('\n');
  const salida = [];
  let i = 0, primeraSeccion = true, ancla = 0;

  const esTabla = (n) => /^\s*\|/.test(lineas[n] ?? '') && /^\s*\|[\s:|-]+\|\s*$/.test(lineas[n + 1] ?? '');

  const encabezado = (nivel, texto) => {
    const id = 'h' + (++ancla);
    if (nivel <= 3) encabezados.push({ nivel, texto, id });
    const comun = { keepNext: true, children: [new Bookmark({ id, children: inline(texto, cfg[nivel].run) })] };
    const cfg = null; // (placeholder, se sustituye abajo)
    return comun;
  };

  while (i < lineas.length) {
    const linea = lineas[i];
    if (/^\s*$/.test(linea)) { i++; continue; }
    if (/^---+\s*$/.test(linea)) { i++; continue; }

    const h = /^(#{1,4})\s+(.*)$/.exec(linea);
    if (h) {
      const nivel = h[1].length, texto = h[2].trim(), id = 'h' + (++ancla);
      if (nivel <= 3) encabezados.push({ nivel, texto, id });
      const estilos = {
        2: { heading: HeadingLevel.HEADING_1, run: { size: 30, bold: true, color: AZUL_OSCURO, font: SANS },
             spacing: { before: 0, after: 80, ...AUTO(300) },
             border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: AZUL_OSCURO, space: 8 } } },
        3: { heading: HeadingLevel.HEADING_2, run: { size: 24, bold: true, color: AZUL, font: SANS },
             spacing: { before: 340, after: 120, ...AUTO(288) } },
        4: { heading: HeadingLevel.HEADING_3, run: { size: 22, bold: true, color: '334155', font: SANS },
             spacing: { before: 260, after: 100, ...AUTO(288) } },
      }[Math.min(Math.max(nivel, 2), 4)];

      salida.push(new Paragraph({
        heading: estilos.heading,
        pageBreakBefore: nivel === 2,
        spacing: estilos.spacing,
        border: estilos.border,
        keepNext: true,
        children: [new Bookmark({ id, children: inline(texto, estilos.run) })],
      }));
      if (nivel === 2) primeraSeccion = false;
      i++;
      continue;
    }

    if (esTabla(i)) {
      const cabecera = lineas[i].trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim());
      const sep = lineas[i + 1].trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim());
      const alineaciones = sep.map((s) => (s.startsWith(':') && s.endsWith(':')) ? 'center'
        : s.endsWith(':') ? 'right' : 'left');
      const crudas = [cabecera];
      i += 2;
      while (i < lineas.length && /^\s*\|/.test(lineas[i])) {
        crudas.push(lineas[i].trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim()));
        i++;
      }
      const cols = cabecera.length;
      salida.push(tabla(crudas.map((f) => {
        const g = f.slice(0, cols);
        while (g.length < cols) g.push('');
        return g;
      }), alineaciones));
      salida.push(espaciador(160));
      continue;
    }

    if (/^```/.test(linea)) {
      i++;
      const buf = [];
      while (i < lineas.length && !/^```/.test(lineas[i])) { buf.push(lineas[i]); i++; }
      i++;
      salida.push(...codigo(buf));
      continue;
    }

    if (/^>\s?/.test(linea)) {
      const parrafos = [];
      let actual = [];
      while (i < lineas.length && /^>/.test(lineas[i])) {
        const cuerpo = lineas[i].replace(/^>\s?/, '');
        if (/^\s*$/.test(cuerpo)) { if (actual.length) { parrafos.push(actual.join(' ')); actual = []; } }
        else actual.push(cuerpo.trim());
        i++;
      }
      if (actual.length) parrafos.push(actual.join(' '));
      salida.push(...cita(parrafos));
      continue;
    }

    if (/^(\s*)([-*]|\d+\.)\s+(.*)$/.test(linea)) {
      while (i < lineas.length) {
        const m2 = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lineas[i]);
        if (!m2) break;
        const buf = [m2[3].trim()];
        i++;
        while (i < lineas.length && /^\s+\S/.test(lineas[i]) && !/^(\s*)([-*]|\d+\.)\s+/.test(lineas[i])) {
          buf.push(lineas[i].trim()); i++;
        }
        salida.push(item(buf.join(' '), /\d/.test(m2[2])));
        if (i < lineas.length && /^\s*$/.test(lineas[i])) {
          if (!/^(\s*)([-*]|\d+\.)\s+/.test(lineas[i + 1] ?? '')) break;
          i++;
        }
      }
      salida.push(espaciador(80));
      continue;
    }

    const buf = [linea.trim()];
    i++;
    while (i < lineas.length && !/^\s*$/.test(lineas[i])
           && !/^(#{1,4}\s|>|```|---+\s*$|\s*\|)/.test(lineas[i])
           && !/^(\s*)([-*]|\d+\.)\s+/.test(lineas[i])) {
      buf.push(lineas[i].trim()); i++;
    }
    salida.push(parrafo(buf.join(' ')));
  }
  return salida;
}

// ── Portada ───────────────────────────────────────────────────────────────
const t = (texto, opts) => new TextRun({ text: texto, ...opts });

const portada = () => [
  new Paragraph({ spacing: { before: 2000, after: 0, ...AUTO(240) }, children: [t('', { size: 2 })] }),
  new Paragraph({
    spacing: { after: 220, ...AUTO(300) },
    children: [t('ESTUDIO SOCIOLINGÜÍSTICO DE ACTITUDES', {
      font: SANS, size: 19, bold: true, color: NARANJA, characterSpacing: 70,
    })],
  }),
  new Paragraph({
    spacing: { after: 140, ...AUTO(300) },
    children: [t('Guía estadística', { font: SANS, size: 52, bold: true, color: AZUL_OSCURO })],
  }),
  new Paragraph({
    spacing: { after: 240, ...AUTO(300) },
    border: { bottom: { style: BorderStyle.SINGLE, size: 14, color: NARANJA, space: 12 } },
    children: [t('del estudio', { font: SANS, size: 52, bold: true, color: AZUL })],
  }),
  new Paragraph({
    spacing: { after: 560, ...AUTO(320) },
    children: [t('Qué medimos, cuáles son las variables dependientes e independientes y con qué herramientas se analizan',
      { font: SERIF, size: 26, color: GRIS, italics: true })],
  }),
  ...cita(['**Para quién es este documento.** Está escrito para alguien que trabaja en filología o en enseñanza de idiomas y que no tiene formación estadística previa. No hay fórmulas complicadas: cada término se explica la primera vez que aparece y se relaciona siempre con una pregunta concreta del formulario. Si en algún momento algo suena a jerga, está recogido en el glosario del final.']),
  new Paragraph({ spacing: { before: 2400, after: 0, ...AUTO(240) }, children: [t('', { size: 2 })] }),
  new Paragraph({
    spacing: { after: 60, ...AUTO(264) },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: BORDE, space: 12 } },
    children: [t('Técnica: verbal guise  ·  12 variedades del español peninsular  ·  23 escalas de diferencial semántico',
      { font: SANS, size: 17, color: GRIS_CLARO })],
  }),
  new Paragraph({
    spacing: { after: 0, ...AUTO(264) },
    children: [t('Documento de apoyo metodológico  ·  ' + new Intl.DateTimeFormat('es-ES',
      { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
      { font: SANS, size: 17, color: GRIS_CLARO })],
  }),
  new Paragraph({ spacing: { after: 0 }, children: [new PageBreak()] }),
];

// ── Índice estático (con marcadores internos y números de página) ─────────
const limpio = (s) => s.replace(/\*\*|\*|`|_/g, '');

function indice(encabezados, paginas) {
  const bloques = [
    new Paragraph({
      spacing: { before: 0, after: 70, ...AUTO(300) },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: AZUL_OSCURO, space: 8 } },
      children: [t('Índice', { font: SANS, size: 30, bold: true, color: AZUL_OSCURO })],
    }),
    new Paragraph({
      spacing: { after: 190, ...AUTO(264) },
      children: [t('Cada entrada es un enlace: pulsa sobre ella para saltar a la sección.',
        { font: SERIF, size: 18, italics: true, color: GRIS_CLARO })],
    }),
  ];

  for (const e of encabezados) {
    if (e.nivel > 3) continue;
    const esSeccion = e.nivel === 2;
    const pag = paginas[e.id];
    bloques.push(new Paragraph({
      spacing: { before: esSeccion ? 70 : 0, after: esSeccion ? 20 : 24, ...AUTO(258) },
      indent: { left: esSeccion ? 0 : 340, right: 0 },
      tabStops: [{ type: TabStopType.RIGHT, position: ANCHO_UTIL, leader: LeaderType.DOT }],
      children: [
        new InternalHyperlink({
          anchor: e.id,
          children: [t(limpio(e.texto), {
            font: SANS, size: esSeccion ? 21 : 19,
            bold: esSeccion || undefined,
            color: esSeccion ? AZUL_OSCURO : GRIS,
          })],
        }),
        t('\t', { size: esSeccion ? 21 : 19 }),
        new InternalHyperlink({
          anchor: e.id,
          children: [t(pag === undefined ? '00' : String(pag), {
            font: SANS, size: esSeccion ? 21 : 19,
            bold: esSeccion || undefined,
            color: esSeccion ? AZUL_OSCURO : GRIS,
          })],
        }),
      ],
    }));
  }
  return bloques;   // el salto lo aporta el pageBreakBefore del primer encabezado
}

// ── Documento ─────────────────────────────────────────────────────────────
const md = fs.readFileSync(process.argv[2], 'utf8');
const salidaPath = process.argv[3];
const paginas = process.argv[4] && fs.existsSync(process.argv[4])
  ? JSON.parse(fs.readFileSync(process.argv[4], 'utf8')) : {};

// El título, el subtítulo, la caja introductoria y el índice manual del
// markdown se descartan: van en la portada y en el índice generado.
const cuerpoMd = md.slice(md.indexOf('\n## 1. '));

const encabezados = [];
const cuerpo = parsear(cuerpoMd, encabezados);
fs.writeFileSync(salidaPath.replace(/\.docx$/, '') + '.encabezados.json',
  JSON.stringify(encabezados, null, 1));

const doc = new Document({
  creator: 'Estudio sociolingüístico',
  title: 'Guía estadística del estudio',
  description: 'Variables dependientes e independientes y herramientas estadísticas del estudio de actitudes lingüísticas',
  styles: {
    default: {
      document: {
        run: { font: SERIF, size: 21, color: TINTA },
        paragraph: { spacing: { after: 150, ...AUTO(288) } },
      },
      heading1: { run: { font: SANS, size: 30, bold: true, color: AZUL_OSCURO }, paragraph: { spacing: AUTO(300) } },
      heading2: { run: { font: SANS, size: 24, bold: true, color: AZUL }, paragraph: { spacing: AUTO(288) } },
      heading3: { run: { font: SANS, size: 22, bold: true, color: '334155' }, paragraph: { spacing: AUTO(288) } },
    },
    paragraphStyles: [{ id: 'Hyperlink', name: 'Hyperlink', run: { color: AZUL } }],
  },
  numbering: {
    config: [
      {
        reference: 'lista-bullet',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 300 } }, run: { color: AZUL, font: SANS } },
        }],
      },
      {
        reference: 'lista-num',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 320 } }, run: { color: AZUL, bold: true, font: SANS } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      titlePage: true,
      page: {
        margin: {
          top: convertMillimetersToTwip(24), bottom: convertMillimetersToTwip(20),
          left: MARGEN_LATERAL, right: MARGEN_LATERAL,
        },
      },
    },
    footers: {
      first: new Footer({ children: [new Paragraph({ children: [t('', { size: 2 })] })] }),
      default: new Footer({
        children: [new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: ANCHO_UTIL }],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDE, space: 8 } },
          spacing: { before: 120, after: 0, ...AUTO(240) },
          children: [
            t('Guía estadística del estudio', { font: SANS, size: 16, color: GRIS_CLARO }),
            t('\t', { size: 16 }),
            t('Página ', { font: SANS, size: 16, color: GRIS_CLARO }),
            new TextRun({ children: [PageNumber.CURRENT], font: SANS, size: 16, color: GRIS, bold: true }),
            t(' de ', { font: SANS, size: 16, color: GRIS_CLARO }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: SANS, size: 16, color: GRIS_CLARO }),
          ],
        })],
      }),
    },
    children: [...portada(), ...indice(encabezados, paginas), ...cuerpo],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(salidaPath, buf);
  console.log('OK →', salidaPath, (buf.length / 1024).toFixed(0) + ' KB ·',
    encabezados.length, 'entradas de índice ·',
    Object.keys(paginas).length ? 'páginas reales' : 'páginas de marcador');
});
