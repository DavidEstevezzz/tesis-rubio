/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CRUCES · características del participante × valoración de la grabación
 * ─────────────────────────────────────────────────────────────────────────
 *  El panel calculaba medias por grabación, pero no cruzaba NADA con el
 *  perfil de quien responde. Aquí están las preguntas de investigación que
 *  hasta ahora había que resolver a mano en Excel/SPSS a partir del CSV:
 *
 *    1. ¿Quien tiene más nivel de español discrimina más entre acentos?
 *       → Índices × Nivel de español × Zona
 *    2. ¿Haber estado en España cambia la actitud?
 *       → Índices × ¿Visitado España? × Zona
 *    3. ¿Las mujeres perciben más el trato diferenciado a Mariam?
 *       → % síes × Género del participante
 *    4. ¿Los mayores tienen prejuicios más marcados?
 *       → Índices × Tramo de edad × Zona
 *    5. ¿Cuanto más cercano me suena, mejor lo valoro?
 *       → Índice de voz × Proximidad (correlación de Pearson)
 *    6. ¿Se valora mejor un acento cuando se acierta su procedencia?
 *       → Índices × Acierto (sí/no) × Zona
 *    7. ¿La lengua materna condiciona lo que se percibe?
 *       → Índices × Lengua materna × Zona
 *
 *  Vocabulario:
 *    · «Índice» = media de todos los ítems de una escala (voz, persona o
 *      cultura) en una valoración. Va de 1 a 5, como los ítems.
 *    · «Brecha de zona» = índice septentrional − índice meridional. Es la
 *      medida de discriminación: 0 = valora igual las dos zonas; positivo =
 *      prefiere las hablas septentrionales; negativo = las meridionales.
 * ─────────────────────────────────────────────────────────────────────────
 */
import {
  GRABACIONES,
  ESCALA_VOZ,
  ESCALA_PERSONA,
  ESCALA_CULTURA,
  GENEROS,
  NIVELES_ESPANOL,
  type ItemDiferencial,
  type Zona,
} from './config';

export type Participante = Record<string, any>;
export type Valoracion = Record<string, any>;

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Media de una lista de números; `null` si no hay ninguno válido. */
function media(nums: number[]): number | null {
  const v = nums.filter((n) => typeof n === 'number' && Number.isFinite(n));
  if (!v.length) return null;
  return round(v.reduce((a, b) => a + b, 0) / v.length);
}

/** Resta dos medias respetando los huecos (si falta una, no hay brecha). */
const resta = (a: number | null, b: number | null) =>
  a === null || b === null ? null : round(a - b);

// ── Tramos de edad ──────────────────────────────────────────────────────────
export const TRAMOS_EDAD = ['<18', '18-24', '25-34', '35-44', '45-54', '55+'] as const;

/** Tramo de edad de un participante (`null` si no la declaró). */
export function tramoEdad(edad: any): string | null {
  const e = Number(edad);
  if (!Number.isFinite(e) || e <= 0) return null;
  if (e < 18) return '<18';
  if (e < 25) return '18-24';
  if (e < 35) return '25-34';
  if (e < 45) return '35-44';
  if (e < 55) return '45-54';
  return '55+';
}

// ── Lengua materna ──────────────────────────────────────────────────────────
// `lenguas_maternas` es texto libre («Árabe», «árabe y amazigh», «Tamazight»…),
// así que hay que agruparlo antes de cruzarlo con nada.
export const GRUPOS_LENGUA_MATERNA = [
  'Árabe',
  'Amazigh',
  'Árabe y amazigh',
  'Francés',
  'Español',
  'Otra',
] as const;

/** Normaliza el texto libre de lengua materna a uno de los grupos de arriba. */
export function grupoLenguaMaterna(texto: any): string | null {
  const s = String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
  if (!s) return null;
  const arabe = /\barab/.test(s) || /darija|magrebi|marroqui/.test(s);
  const amazigh = /amazigh|tamazight|bereber|berber|rif|tarifit|chelja|tachelhit/.test(s);
  if (arabe && amazigh) return 'Árabe y amazigh';
  if (arabe) return 'Árabe';
  if (amazigh) return 'Amazigh';
  if (/franc/.test(s)) return 'Francés';
  if (/espanol|castellan/.test(s)) return 'Español';
  return 'Otra';
}

// ── Índices de las escalas ──────────────────────────────────────────────────
/** Media de los ítems de una escala jsonb dentro de UNA valoración. */
export function indiceEscala(v: Valoracion, campo: string, items: ItemDiferencial[]): number | null {
  const obj = v?.[campo] ?? {};
  return media(items.map((it) => Number(obj[it.id])));
}

export const indiceVoz = (v: Valoracion) => indiceEscala(v, 'escala_voz', ESCALA_VOZ);
export const indicePersona = (v: Valoracion) => indiceEscala(v, 'escala_persona', ESCALA_PERSONA);
export const indiceCultura = (v: Valoracion) => indiceEscala(v, 'escala_cultura', ESCALA_CULTURA);

export type Indices = {
  n: number;
  voz: number | null;
  persona: number | null;
  cultura: number | null;
  proximidad: number | null;
};

/** Las cuatro medidas resumen de un conjunto de valoraciones. */
function indicesDe(vals: Valoracion[]): Indices {
  return {
    n: vals.length,
    voz: media(vals.map((v) => indiceVoz(v) as number)),
    persona: media(vals.map((v) => indicePersona(v) as number)),
    cultura: media(vals.map((v) => indiceCultura(v) as number)),
    proximidad: media(vals.map((v) => Number(v.proximidad))),
  };
}

/** Las cuatro claves de `Indices` que son medias (todo salvo la n). */
export const MEDIDAS = [
  { id: 'voz', etiqueta: 'Índice de voz' },
  { id: 'persona', etiqueta: 'Índice de persona' },
  { id: 'cultura', etiqueta: 'Índice de cultura' },
  { id: 'proximidad', etiqueta: 'Proximidad' },
] as const;

export type Medida = (typeof MEDIDAS)[number]['id'];

// ── Motor genérico de cruces ────────────────────────────────────────────────
export type FilaCruce = {
  /** Valor de la variable del participante (p. ej. «B2», «Sí», «35-44»). */
  grupo: string;
  /** Participantes distintos que caen en este grupo. */
  nParticipantes: number;
  /** Todas sus valoraciones juntas. */
  total: Indices;
  /** Solo las grabaciones meridionales. */
  meridional: Indices;
  /** Solo las septentrionales. */
  septentrional: Indices;
  /**
   * Septentrional − meridional para cada medida. Es el número que responde a
   * «¿este grupo discrimina más entre acentos?»: cuanto más lejos de 0, más
   * diferencia hace entre las dos zonas.
   */
  brecha: Record<Medida, number | null>;
};

export type Cruce = {
  id: string;
  /** Pregunta de investigación que responde el cruce. */
  pregunta: string;
  /** Nombre de la variable que va en el eje X. */
  variable: string;
  /** Cómo leer la tabla (aparece bajo el título en el panel). */
  ayuda: string;
  filas: FilaCruce[];
};

const zonaDe = new Map<number, Zona>(GRABACIONES.map((g) => [g.numero, g.zona]));
const comunidadDe = new Map<number, string>(GRABACIONES.map((g) => [g.numero, g.comunidad]));

/** ¿El participante situó el habla en su comunidad autónoma real? */
export function aciertaRegion(v: Valoracion): boolean | null {
  if (!v.region_percibida) return null;
  const real = comunidadDe.get(Number(v.grabacion));
  if (!real) return null;
  return v.region_percibida === real;
}

function brechaDe(meridional: Indices, septentrional: Indices): Record<Medida, number | null> {
  const out = {} as Record<Medida, number | null>;
  for (const m of MEDIDAS) out[m.id] = resta(septentrional[m.id], meridional[m.id]);
  return out;
}

/** Fila de cruce a partir de un puñado de valoraciones ya seleccionadas. */
function filaDe(grupo: string, vals: Valoracion[]): FilaCruce {
  const mer = vals.filter((v) => zonaDe.get(Number(v.grabacion)) === 'meridional');
  const sep = vals.filter((v) => zonaDe.get(Number(v.grabacion)) === 'septentrional');
  const meridional = indicesDe(mer);
  const septentrional = indicesDe(sep);
  return {
    grupo,
    nParticipantes: new Set(vals.map((v) => v.participante_id)).size,
    total: indicesDe(vals),
    meridional,
    septentrional,
    brecha: brechaDe(meridional, septentrional),
  };
}

/**
 * Agrupa las valoraciones por el valor de una variable y calcula los índices
 * de cada grupo, separando zona meridional y septentrional.
 *
 * @param clave  devuelve el grupo de una valoración (usando también al
 *               participante que la hizo) o `null` para descartarla.
 * @param orden  catálogo con el orden deseado de los grupos; los valores no
 *               previstos se añaden al final.
 */
function agrupar(
  valoraciones: Valoracion[],
  participanteDe: (v: Valoracion) => Participante | undefined,
  clave: (v: Valoracion, p: Participante | undefined) => string | null,
  orden: readonly string[]
): FilaCruce[] {
  const grupos = new Map<string, Valoracion[]>();
  for (const v of valoraciones) {
    const k = clave(v, participanteDe(v));
    if (k == null || k === '') continue;
    const lista = grupos.get(k);
    if (lista) lista.push(v);
    else grupos.set(k, [v]);
  }
  const etiquetas = [
    ...orden.filter((o) => grupos.has(o)),
    ...[...grupos.keys()].filter((k) => !orden.includes(k)).sort(),
  ];
  return etiquetas.map((k) => filaDe(k, grupos.get(k) ?? []));
}

const siNo = ['Sí', 'No'] as const;
const boolATexto = (b: any) => (b === true ? 'Sí' : b === false ? 'No' : null);

// ── Correlaciones ───────────────────────────────────────────────────────────
export type Correlacion = {
  etiqueta: string;
  /** Coeficiente de Pearson (−1 … 1) o `null` si no hay pares suficientes. */
  r: number | null;
  /** Nº de pares usados. */
  n: number;
};

/** Coeficiente de correlación de Pearson de una lista de pares (x, y). */
export function pearson(pares: [number, number][]): { r: number | null; n: number } {
  const p = pares.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const n = p.length;
  if (n < 3) return { r: null, n };
  const mx = p.reduce((a, [x]) => a + x, 0) / n;
  const my = p.reduce((a, [, y]) => a + y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of p) {
    const dx = x - mx, dy = y - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return { r: null, n };
  return { r: round(sxy / Math.sqrt(sxx * syy), 3), n };
}

/**
 * Interpretación en palabras de un r de Pearson (con el signo), para que la
 * tabla del panel se entienda sin manual de estadística.
 */
export function interpretaR(r: number | null): string {
  if (r === null) return 'sin datos suficientes';
  const a = Math.abs(r);
  const fuerza =
    a < 0.1 ? 'prácticamente nula' : a < 0.3 ? 'débil' : a < 0.5 ? 'moderada' : a < 0.7 ? 'fuerte' : 'muy fuerte';
  if (a < 0.1) return `correlación ${fuerza}`;
  return `correlación ${fuerza} y ${r > 0 ? 'positiva' : 'negativa'}`;
}

// ── Cálculo completo ────────────────────────────────────────────────────────
export function computeCruces(participantes: Participante[], valoraciones: Valoracion[]) {
  const pById = new Map(participantes.map((p) => [p.id, p]));
  const participanteDe = (v: Valoracion) => pById.get(v.participante_id);

  // ── 1-2, 4, 6-7 · Índices × variable del participante × zona ─────────────
  const indices: Cruce[] = [
    {
      id: 'nivelEspanol',
      pregunta: '¿Quien tiene más nivel de español discrimina más entre acentos?',
      variable: 'Nivel de español',
      ayuda:
        'Si la brecha crece al subir de A1 a Nativo, más competencia = más capacidad (o más ganas) ' +
        'de diferenciar entre hablas meridionales y septentrionales.',
      filas: agrupar(valoraciones, participanteDe, (_v, p) => p?.nivel_espanol ?? null, NIVELES_ESPANOL),
    },
    {
      id: 'visitadoEspana',
      pregunta: '¿Haber estado en España cambia la actitud?',
      variable: '¿Ha visitado España?',
      ayuda:
        'Compara a quien ha pisado España con quien no. El contacto directo suele suavizar la ' +
        'brecha entre zonas (menos estereotipo, más experiencia).',
      filas: agrupar(valoraciones, participanteDe, (_v, p) => boolATexto(p?.visitado_espana), siNo),
    },
    {
      id: 'edad',
      pregunta: '¿Los mayores tienen prejuicios más marcados?',
      variable: 'Tramo de edad',
      ayuda: 'Una brecha que crece con la edad apunta a actitudes más marcadas en los tramos altos.',
      filas: agrupar(valoraciones, participanteDe, (_v, p) => tramoEdad(p?.edad), TRAMOS_EDAD),
    },
    {
      id: 'acierto',
      pregunta: '¿Se valora mejor un acento cuando se acierta su procedencia?',
      variable: '¿Acierta la comunidad autónoma?',
      ayuda:
        'Se comparan las valoraciones en que el participante situó el habla en su comunidad real ' +
        'frente a aquellas en que falló. Ojo: aquí el cruce es por valoración, no por persona.',
      filas: agrupar(
        valoraciones,
        participanteDe,
        (v) => boolATexto(aciertaRegion(v)),
        siNo
      ),
    },
    {
      id: 'lenguaMaterna',
      pregunta: '¿La lengua materna condiciona lo que se percibe?',
      variable: 'Lengua materna',
      ayuda:
        'El texto libre de la respuesta se agrupa automáticamente (árabe, amazigh, ambas, francés, ' +
        'español, otra). Los grupos con muy pocos participantes hay que leerlos con prudencia.',
      filas: agrupar(
        valoraciones,
        participanteDe,
        (_v, p) => grupoLenguaMaterna(p?.lenguas_maternas),
        GRUPOS_LENGUA_MATERNA
      ),
    },
    {
      id: 'generoIndices',
      pregunta: '¿Valoran igual las hablas los participantes y las participantes?',
      variable: 'Género del participante',
      ayuda: 'El mismo cruce de índices, esta vez por género de quien responde.',
      filas: agrupar(valoraciones, participanteDe, (_v, p) => p?.genero ?? null, GENEROS),
    },
  ];

  // ── 3 · Preguntas de género × género del participante ────────────────────
  const pctSi = (vals: Valoracion[], campo: string) => {
    let si = 0, no = 0;
    for (const v of vals) {
      if (v[campo] === true) si++;
      else if (v[campo] === false) no++;
    }
    const n = si + no;
    return { si, no, n, pct: n ? round((si / n) * 100, 1) : null };
  };

  const filaGenero = (grupo: string, vals: Valoracion[]) => ({
    grupo,
    nParticipantes: new Set(vals.map((v) => v.participante_id)).size,
    nValoraciones: vals.length,
    tratoDiferenciado: pctSi(vals, 'trato_diferenciado'),
    tratoMujerDiferente: pctSi(vals, 'trato_mujer_diferente'),
  });

  const porGeneroP = new Map<string, Valoracion[]>();
  for (const v of valoraciones) {
    const g = participanteDe(v)?.genero;
    if (!g) continue;
    const lista = porGeneroP.get(g);
    if (lista) lista.push(v);
    else porGeneroP.set(g, [v]);
  }
  const etiquetasGenero = [
    ...GENEROS.filter((g) => porGeneroP.has(g)),
    ...[...porGeneroP.keys()].filter((g) => !GENEROS.includes(g)).sort(),
  ];

  const genero = {
    pregunta: '¿Las mujeres perciben más el trato diferenciado a Mariam?',
    variable: 'Género del participante',
    ayuda:
      '% de respuestas «Sí» a las dos preguntas sobre el género de quien habla, según el género de ' +
      'quien responde. Cada participante contesta una vez por grabación, así que la n son valoraciones.',
    filas: etiquetasGenero.map((g) => filaGenero(g, porGeneroP.get(g) ?? [])),
    total: filaGenero('Todos', valoraciones),
  };

  // ── 5 · Índice de voz × proximidad (correlación) ─────────────────────────
  const paresDe = (vals: Valoracion[], indice: (v: Valoracion) => number | null): [number, number][] =>
    vals
      .map((v) => [indice(v), Number(v.proximidad)] as [number | null, number])
      .filter((par): par is [number, number] => par[0] !== null && Number.isFinite(par[1]));

  const correlacionesGlobales: Correlacion[] = [
    { etiqueta: 'Voz × proximidad', ...pearson(paresDe(valoraciones, indiceVoz)) },
    { etiqueta: 'Persona × proximidad', ...pearson(paresDe(valoraciones, indicePersona)) },
    { etiqueta: 'Cultura × proximidad', ...pearson(paresDe(valoraciones, indiceCultura)) },
  ];

  const porZonaCorr: Correlacion[] = (['meridional', 'septentrional'] as Zona[]).map((z) => {
    const vals = valoraciones.filter((v) => zonaDe.get(Number(v.grabacion)) === z);
    return { etiqueta: `Voz × proximidad · ${z}`, ...pearson(paresDe(vals, indiceVoz)) };
  });

  const porCiudadCorr = GRABACIONES.map((g) => {
    const vals = valoraciones.filter((v) => Number(v.grabacion) === g.numero);
    return { ciudad: g.ciudad, zona: g.zona, ...pearson(paresDe(vals, indiceVoz)) };
  });

  // Nube de puntos (una por valoración) para ver la relación, no solo el r.
  const nube = valoraciones
    .map((v) => {
      const x = Number(v.proximidad);
      const y = indiceVoz(v);
      if (y === null || !Number.isFinite(x)) return null;
      return { x, y, zona: zonaDe.get(Number(v.grabacion)) ?? 'meridional' };
    })
    .filter((p): p is { x: number; y: number; zona: string } => p !== null);

  // Media del índice de voz para cada valor de la escala de proximidad: la
  // lectura más directa de «cuanto más cercano me suena, mejor lo valoro».
  const vozPorProximidad = [1, 2, 3, 4, 5].map((nivel) => {
    const vals = valoraciones.filter((v) => Number(v.proximidad) === nivel);
    return {
      proximidad: nivel,
      n: vals.length,
      voz: media(vals.map((v) => indiceVoz(v) as number)),
      persona: media(vals.map((v) => indicePersona(v) as number)),
      cultura: media(vals.map((v) => indiceCultura(v) as number)),
    };
  });

  const correlacion = {
    pregunta: '¿Cuanto más cercano me suena, mejor lo valoro?',
    ayuda:
      'Coeficiente de Pearson entre la proximidad declarada (1 = totalmente diferente, 5 = idéntica) ' +
      'y el índice de cada escala. Positivo = a más cercanía percibida, mejor valoración.',
    globales: correlacionesGlobales,
    porZona: porZonaCorr,
    porCiudad: porCiudadCorr,
    nube,
    vozPorProximidad,
  };

  return { indices, genero, correlacion };
}

export type Cruces = ReturnType<typeof computeCruces>;
