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
  /**
   * Qué número hay exactamente detrás de la gráfica. El panel lo usan
   * filólogos, no estadísticos: se explica en castellano llano, sin dar por
   * sabido ningún término técnico.
   */
  queSeCalcula: string;
  /** Qué conclusión sacar según lo que se vea. Una viñeta por caso. */
  comoLeerlo: string[];
  /** Trampas concretas de ESTE cruce (grupos pequeños, sesgos, etc.). */
  ojo: string;
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
      queSeCalcula:
        'Se agrupa a los participantes por el nivel de español que declararon (A1, A2, B1…) y, ' +
        'dentro de cada nivel, se calcula la nota media que ponen a las grabaciones del sur y la ' +
        'que ponen a las del norte.',
      comoLeerlo: [
        'Mira sobre todo la gráfica de la brecha: si las barras van creciendo de A1 hacia Nativo, ' +
          'la respuesta es que sí, cuanto más español se sabe más diferencia se hace entre las dos zonas.',
        'Si la brecha se mantiene plana, el nivel de español no cambia la actitud: todos los ' +
          'niveles diferencian más o menos lo mismo.',
        'Si alguna barra baja por debajo de cero, ese grupo puntúa mejor las hablas del sur que ' +
          'las del norte.',
      ],
      ojo:
        'Los niveles bajos (A1, A2) suelen reunir muy pocos participantes, así que sus barras se ' +
        'mueven mucho con poca cosa. Mira siempre antes la columna «Particip.» de la tabla.',
      filas: agrupar(valoraciones, participanteDe, (_v, p) => p?.nivel_espanol ?? null, NIVELES_ESPANOL),
    },
    {
      id: 'visitadoEspana',
      pregunta: '¿Haber estado en España cambia la actitud?',
      variable: '¿Ha visitado España?',
      queSeCalcula:
        'Se separa a quienes dijeron haber estado en España de quienes no, y se compara la nota ' +
        'media que pone cada grupo a cada zona.',
      comoLeerlo: [
        'Lo interesante está en las barras naranjas, las grabaciones del sur: si quien ha estado ' +
          'en España se las puntúa más alto, el contacto directo mejora la actitud hacia esas hablas.',
        'Si además la brecha del grupo «Sí» es menor que la del «No», la experiencia está ' +
          'suavizando la diferencia entre zonas.',
        'Si los dos grupos se parecen, haber viajado a España no está cambiando nada.',
      ],
      ojo:
        'Quien ha viajado a España suele tener también más nivel de español, así que las dos cosas ' +
        'van de la mano. Este cruce no puede separar un efecto del otro.',
      filas: agrupar(valoraciones, participanteDe, (_v, p) => boolATexto(p?.visitado_espana), siNo),
    },
    {
      id: 'edad',
      pregunta: '¿Los mayores tienen prejuicios más marcados?',
      variable: 'Tramo de edad',
      queSeCalcula:
        'Se reparte a los participantes en tramos de edad y se compara, dentro de cada tramo, la ' +
        'nota que ponen a las hablas del sur y a las del norte.',
      comoLeerlo: [
        'Si la brecha crece de los tramos jóvenes a los mayores, las actitudes están más marcadas ' +
          'en la gente de más edad.',
        'Si la brecha es parecida en todos los tramos, la edad no está influyendo.',
      ],
      ojo:
        'Los tramos altos suelen reunir pocos participantes. Y la edad viene mezclada con otras ' +
        'cosas (estudios, años estudiando español, contacto con España), así que tampoco aquí se ' +
        'puede aislar un único factor.',
      filas: agrupar(valoraciones, participanteDe, (_v, p) => tramoEdad(p?.edad), TRAMOS_EDAD),
    },
    {
      id: 'acierto',
      pregunta: '¿Se valora mejor un acento cuando se acierta su procedencia?',
      variable: '¿Acierta la comunidad autónoma?',
      queSeCalcula:
        'Después de cada grabación se pregunta de qué comunidad autónoma cree el participante que ' +
        'es esa habla. Aquí se comparan las valoraciones en las que acertó con aquellas en las ' +
        'que falló.',
      comoLeerlo: [
        'Si las barras del grupo «Sí» están más altas, reconocer de dónde es un acento va ' +
          'acompañado de una valoración mejor.',
        'Eso no dice cuál es la causa: puede que reconocer el acento lo haga más familiar y ' +
          'agradable, o que se reconozcan mejor precisamente los acentos que ya caen simpáticos.',
      ],
      ojo:
        'Aquí se cuentan respuestas, no personas: la misma persona acierta en unas grabaciones y ' +
        'falla en otras, por eso la columna «Particip.» suma más que el total de participantes. ' +
        'Además, Granada, Cádiz y Madrid se aciertan mucho más que el resto, así que la fila «Sí» ' +
        'está llena de esas ciudades y parte de la diferencia puede venir de ahí, no del acierto.',
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
      queSeCalcula:
        'La lengua materna se pregunta en texto libre, así que las respuestas se agrupan solas ' +
        '(árabe, amazigh, las dos, francés, español, otra). Dentro de cada grupo se comparan las ' +
        'notas que se ponen a cada zona.',
      comoLeerlo: [
        'Si un grupo puntúa las hablas del sur claramente por encima del resto, merece la pena ' +
          'leer sus respuestas abiertas en la pestaña «Respuestas»: la explicación suele estar ahí.',
        'Brechas parecidas en todos los grupos significan que la lengua materna no está marcando ' +
          'diferencias.',
      ],
      ojo:
        'El reparto entre grupos es muy desigual. Compara solo los que tengan un número decente de ' +
        'participantes e ignora los de tres o cuatro personas.',
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
      queSeCalcula:
        'El mismo cálculo que en las tarjetas anteriores, esta vez agrupando por el género de ' +
        'quien responde.',
      comoLeerlo: [
        'Funciona como control: si las barras y la brecha salen parecidas, el género de quien ' +
          'responde no está cambiando la valoración de las hablas.',
        'Si salen distintas, míralo junto con la tarjeta siguiente, que es la que pregunta ' +
          'directamente por el género.',
      ],
      ojo: 'El grupo «Otro» suele reunir muy pocas personas: no saques conclusiones de su barra.',
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
    queSeCalcula:
      'Tras cada grabación se hacen dos preguntas sobre la conversación que se acaba de escuchar: ' +
      'si ha habido un trato distinto entre Mariam y Omar, y si la cosa habría sido diferente con ' +
      'una jefa mujer. Aquí se calcula qué porcentaje de respuestas «Sí» da cada género.',
    comoLeerlo: [
      'Cada barra es el porcentaje de síes. Si la de «Femenino» está claramente por encima, las ' +
        'participantes perciben más ese trato diferenciado.',
      'Una diferencia de tres o cuatro puntos no es nada. Una de veinte o treinta ya es un patrón.',
      'Las dos preguntas pueden ir por separado: se puede percibir el trato diferenciado y aun así ' +
        'pensar que con una jefa mujer habría pasado lo mismo.',
    ],
    ojo:
      'Cada persona responde estas preguntas una vez por grabación, así que la columna «Valor.» ' +
      'son respuestas, no personas: 690 respuestas son 115 participantes contestando seis veces.',
    filas: etiquetasGenero.map((g) => filaGenero(g, porGeneroP.get(g) ?? [])),
    total: filaGenero('Todos', valoraciones),
  };

  // ── 5 · Índice de voz × proximidad (correlación) ─────────────────────────
  const paresDe = (vals: Valoracion[], indice: (v: Valoracion) => number | null): [number, number][] =>
    vals
      .map((v) => [indice(v), Number(v.proximidad)] as [number | null, number])
      .filter((par): par is [number, number] => par[0] !== null && Number.isFinite(par[1]));

  const correlacionesGlobales: Correlacion[] = [
    { etiqueta: 'Cercanía y nota de la voz', ...pearson(paresDe(valoraciones, indiceVoz)) },
    { etiqueta: 'Cercanía y nota de la persona', ...pearson(paresDe(valoraciones, indicePersona)) },
    { etiqueta: 'Cercanía y nota de la cultura', ...pearson(paresDe(valoraciones, indiceCultura)) },
  ];

  const porZonaCorr: Correlacion[] = (['meridional', 'septentrional'] as Zona[]).map((z) => {
    const vals = valoraciones.filter((v) => zonaDe.get(Number(v.grabacion)) === z);
    const nombre = z === 'meridional' ? 'solo hablas del sur' : 'solo hablas del norte';
    return { etiqueta: `Cercanía y nota de la voz · ${nombre}`, ...pearson(paresDe(vals, indiceVoz)) };
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
    queSeCalcula:
      'Después de cada grabación se pregunta cuánto se parece esa pronunciación a la propia ' +
      '(1 = totalmente diferente, 5 = idéntica). Aquí se cruza esa respuesta con la nota que esa ' +
      'misma persona le puso a esa misma grabación.',
    comoLeerlo: [
      'La gráfica de la izquierda es la más fácil de leer: si las barras van subiendo de ' +
        '«Proximidad 1» a «Proximidad 5», la respuesta es que sí, cuanto más cercana suena mejor ' +
        'se valora.',
      'El número grande de arriba resume lo mismo en una cifra entre −1 y 1. Cerca de 0 significa ' +
        'que las dos cosas no tienen nada que ver; cerca de 1, que suben juntas; negativa, que ' +
        'cuanto más cercana suena peor se valora.',
      'En la nube de puntos, cada punto es una valoración. Si la nube se inclina hacia arriba, las ' +
        'dos cosas van juntas.',
      'La última gráfica dice en qué grabaciones esa relación es más fuerte.',
    ],
    ojo:
      'Que dos cosas vayan juntas no significa que una cause la otra. Y los extremos de la escala ' +
      '(proximidad 1 y proximidad 5) suelen tener muy pocas respuestas, así que esas dos barras ' +
      'bailan mucho.',
    globales: correlacionesGlobales,
    porZona: porZonaCorr,
    porCiudad: porCiudadCorr,
    nube,
    vozPorProximidad,
  };

  // Vocabulario común de la pestaña. Se muestra arriba del todo, porque sin
  // esto ninguna de las gráficas se entiende.
  const glosario = [
    {
      termino: 'Cómo funciona el estudio',
      texto:
        'Cada participante escucha 6 grabaciones (unas de hablas del sur de España, las ' +
        'meridionales, y otras del norte, las septentrionales) sin que se le diga nunca de dónde ' +
        'es ninguna. Después las puntúa.',
    },
    {
      termino: 'Índice',
      texto:
        'Cada grabación se valora con 11 pares de adjetivos para la voz, 6 para la persona y 6 ' +
        'para la cultura, todos de 1 a 5. El índice es la media de esos adjetivos. 3 es el punto ' +
        'medio: por encima, valoración positiva; por debajo, negativa.',
    },
    {
      termino: 'Proximidad',
      texto:
        'Aparte de los adjetivos, se pregunta cuánto se parece esa pronunciación a la propia: ' +
        '1 = totalmente diferente, 5 = idéntica.',
    },
    {
      termino: 'Brecha',
      texto:
        'La nota media que una persona pone a las hablas del norte menos la que pone a las del ' +
        'sur. Como las dos notas salen de la misma persona, la brecha no se ve afectada por que ' +
        'haya gente generosa puntuando y gente severa: mide solo cuánta diferencia hace entre ' +
        'zonas. 0 = las trata igual. Positiva = puntúa mejor al norte. Negativa = mejor al sur.',
    },
    {
      termino: 'Particip. y Valor.',
      texto:
        'Cuántas personas y cuántas respuestas hay detrás de cada fila. Un grupo con menos de ' +
        '15 o 20 personas es una pista, no una conclusión: con tan poca gente, un solo ' +
        'participante raro mueve la media entera.',
    },
  ];

  return { indices, genero, correlacion, glosario };
}

export type Cruces = ReturnType<typeof computeCruces>;
