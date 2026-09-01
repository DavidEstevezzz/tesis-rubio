/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL ESTUDIO (fuente única de verdad)
 * ─────────────────────────────────────────────────────────────────────────
 *  Todo el formulario, la base de datos y las estadísticas se generan a
 *  partir de este archivo. Si tu amigo cambia una pregunta, un adjetivo o
 *  una grabación, se edita AQUÍ y el resto se adapta solo.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Rango de la escala de valoración (diferencial semántico). */
export const ESCALA_MIN = 1;
export const ESCALA_MAX = 5;

// ── Grabaciones ────────────────────────────────────────────────────────────
/**
 * Zona dialectal de la muestra. Es el eje que equilibra cada formulario:
 * en todos ellos se alternan hablas meridionales y septentrionales.
 */
export type Zona = 'meridional' | 'septentrional';

export type Grabacion = {
  numero: number;
  /**
   * Ciudad/provincia del habla. ⚠️ Dato SOLO para el investigador: el estudio
   * es a ciegas, así que nunca se muestra al participante (él ve «Grabación 1»,
   * «Grabación 2»…). Se usa para nombrar el archivo y en el panel /admin.
   */
  ciudad: string;
  /** Etiqueta neutra (sin ciudad) que sí puede verse en el formulario. */
  titulo: string;
  /** Etiqueta con ciudad para el panel de investigadores. */
  etiqueta: string;
  tipo: 'audio' | 'soundcloud';
  zona: Zona;
  /**
   * Comunidad autónoma real del habla. Sirve para medir aciertos: se compara
   * con la región que el participante cree reconocer (`region_percibida`).
   * Como la ciudad, es dato SOLO para el investigador.
   */
  comunidad: string;
  /** URL del audio principal. Admite .ogg/.opus (WhatsApp), .mp3, .m4a, .wav… */
  url: string;
  /**
   * Todas las URLs candidatas para este audio, en orden de preferencia
   * (la primera es `url`). El navegador prueba una a una y se queda con la
   * primera que exista y sepa reproducir, así que da igual que un audio esté
   * subido en .ogg y otro en .mp3.
   */
  fuentes: string[];
  /**
   * (Opcional) URL de un audio de reserva en otro formato, por si el
   * principal no es compatible con algún navegador. Ejemplo típico: subir el
   * .ogg como `url` y un .m4a (AAC) como `urlFallback` para cubrir iPhones
   * antiguos. El navegador elige automáticamente el primero que sepa reproducir.
   */
  urlFallback?: string;
};

// Nombre del bucket público de Supabase Storage donde subes los audios.
export const BUCKET_GRABACIONES = 'grabaciones';

// Construye la URL pública de un archivo del bucket a partir de tu proyecto
// Supabase (se toma de PUBLIC_SUPABASE_URL, así que no hay que repetirla).
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
export const storageUrl = (archivo: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_GRABACIONES}/${encodeURIComponent(archivo)}`;

/**
 * Extensiones que se prueban para cada audio, en este orden. No hace falta que
 * todos los archivos compartan formato: si `granada` está subido como .ogg y
 * `madrid` como .mp3, cada uno se resuelve solo (las URLs que no existen dan
 * 404 y el navegador pasa a la siguiente).
 *
 * Los audios de WhatsApp se exportan normalmente como .ogg (u .opus) y a veces
 * como .mp3 o .m4a, por eso están las cuatro.
 */
export const EXTENSIONES_AUDIO = [
  '.ogg',
  '.opus',
  '.mp3',
  '.m4a',
  '.aac',
  '.wav',
  // Variantes menos habituales del MP3 (mismo MIME, audio/mpeg): algunos
  // exportadores y conversores las usan en lugar de .mp3.
  '.mpeg',
  '.mpga',
] as const;

/** Extensión preferida (la primera de la lista). Se mantiene por compatibilidad. */
export const EXTENSION_AUDIO = EXTENSIONES_AUDIO[0];

// ── Las 12 hablas del estudio ──────────────────────────────────────────────
// El nombre del archivo es la ciudad en minúscula, sin acentos ni espacios,
// más la extensión: granada.ogg, cadiz.ogg, acoruna.ogg, guipuzcoa.ogg…
// → Sube los 12 audios al bucket "grabaciones" (público) con ESOS nombres.
/**
 * `archivo` es el nombre SIN extensión. Si un audio concreto está subido con
 * un nombre o una extensión distintos, se puede fijar en `archivoExacto`
 * (con extensión incluida) y se usará ese y solo ese.
 */
const CATALOGO: {
  ciudad: string;
  archivo: string;
  zona: Zona;
  /** Comunidad autónoma, tal cual se escribe en COMUNIDADES (para los aciertos). */
  comunidad: string;
  archivoExacto?: string;
}[] = [
  // Hablas meridionales (5)
  { ciudad: 'Granada',    archivo: 'granada',    zona: 'meridional',    comunidad: 'Andalucía' },
  { ciudad: 'Cádiz',      archivo: 'cadiz',      zona: 'meridional',    comunidad: 'Andalucía' },
  { ciudad: 'Badajoz',    archivo: 'badajoz',    zona: 'meridional',    comunidad: 'Extremadura' },
  { ciudad: 'Murcia',     archivo: 'murcia',     zona: 'meridional',    comunidad: 'Región de Murcia' },
  { ciudad: 'Tenerife',   archivo: 'tenerife',   zona: 'meridional',    comunidad: 'Canarias' },
  // Hablas septentrionales (7)
  { ciudad: 'Madrid',     archivo: 'madrid',     zona: 'septentrional', comunidad: 'Comunidad de Madrid' },
  { ciudad: 'Barcelona',  archivo: 'barcelona',  zona: 'septentrional', comunidad: 'Cataluña' },
  { ciudad: 'Mallorca',   archivo: 'mallorca',   zona: 'septentrional', comunidad: 'Islas Baleares' },
  { ciudad: 'Huesca',     archivo: 'huesca',     zona: 'septentrional', comunidad: 'Aragón' },
  { ciudad: 'Guipúzcoa',  archivo: 'guipuzcoa',  zona: 'septentrional', comunidad: 'País Vasco' },
  { ciudad: 'A Coruña',   archivo: 'acoruna',    zona: 'septentrional', comunidad: 'Galicia' },
  { ciudad: 'Asturias',   archivo: 'asturias',   zona: 'septentrional', comunidad: 'Asturias' },
];

/** Número total de grabaciones del estudio (el "pool" completo). */
export const NUM_GRABACIONES = CATALOGO.length;

export const GRABACIONES: Grabacion[] = CATALOGO.map((c, i) => ({
  numero: i + 1,
  ciudad: c.ciudad,
  titulo: `Grabación ${i + 1}`,
  etiqueta: `${i + 1} · ${c.ciudad}`,
  tipo: 'audio' as const,
  zona: c.zona,
  comunidad: c.comunidad,
  ...(() => {
    const fuentes = c.archivoExacto
      ? [storageUrl(c.archivoExacto)]
      : EXTENSIONES_AUDIO.map((ext) => storageUrl(`${c.archivo}${ext}`));
    return { url: fuentes[0], fuentes };
  })(),
}));

// ── Diseño de bloques incompletos balanceados (BIBD) ────────────────────────
// El formulario con las 12 grabaciones duraba ~40 min y el cansancio arruina
// las respuestas. Para no suprimir ninguna grabación, cada informante evalúa
// solo 6 (un "bloque"), según seis formularios fijos (F1…F6) definidos abajo.
//
// Propiedad clave del diseño: CADA una de las 12 grabaciones aparece en
// EXACTAMENTE 3 de los 6 formularios. Por tanto, si los participantes se
// reparten a partes iguales entre las seis versiones, todas las grabaciones
// reciben el mismo número de escuchas (ver el reparto en `formulario.astro`).
//
// Dentro de cada formulario las hablas se presentan ALTERNADAS
// (meridional → septentrional → meridional → …) para que ninguna zona se
// concentre al principio o al final.
type DefinicionBloque = {
  version: number;
  meridionales: string[];
  septentrionales: string[];
};

/** Los seis formularios fijos, tal cual los definió el equipo del estudio. */
export const DEFINICION_BLOQUES: DefinicionBloque[] = [
  { version: 1, meridionales: ['Granada', 'Cádiz', 'Badajoz'],   septentrionales: ['Madrid', 'Barcelona', 'Mallorca'] },
  { version: 2, meridionales: ['Granada', 'Murcia', 'Tenerife'], septentrionales: ['Huesca', 'Guipúzcoa', 'A Coruña'] },
  { version: 3, meridionales: ['Cádiz', 'Murcia', 'Tenerife'],   septentrionales: ['Asturias', 'Madrid', 'Huesca'] },
  { version: 4, meridionales: ['Granada', 'Badajoz'],            septentrionales: ['Barcelona', 'Mallorca', 'Guipúzcoa', 'Asturias'] },
  { version: 5, meridionales: ['Cádiz', 'Murcia'],               septentrionales: ['Madrid', 'A Coruña', 'Mallorca', 'Guipúzcoa'] },
  { version: 6, meridionales: ['Badajoz', 'Tenerife'],           septentrionales: ['Barcelona', 'Huesca', 'A Coruña', 'Asturias'] },
];

/**
 * Pon a `false` para desactivar el BIBD: entonces habrá una única versión con
 * las 12 grabaciones (también alternadas meridional/septentrional).
 */
export const BIBD_ACTIVO = true;

export type Bloque = { version: number; grabaciones: number[] };

/**
 * Intercala dos listas alternando zonas. Las meridionales se colocan en
 * posiciones equiespaciadas empezando por la primera, y los huecos se rellenan
 * con las septentrionales. Con 3 + 3 sale M-S-M-S-M-S; con 2 + 4, M-S-S-M-S-S.
 */
function intercalar(meridionales: number[], septentrionales: number[]): number[] {
  const total = meridionales.length + septentrionales.length;
  if (!meridionales.length) return [...septentrionales];
  const out: (number | null)[] = new Array(total).fill(null);
  meridionales.forEach((num, k) => {
    out[Math.floor((k * total) / meridionales.length)] = num;
  });
  let j = 0;
  for (let i = 0; i < total; i++) if (out[i] === null) out[i] = septentrionales[j++] ?? null;
  return out.filter((n): n is number => n !== null);
}

/** Nº de grabación a partir del nombre de la ciudad (como se escribe arriba). */
function numeroDeCiudad(ciudad: string): number {
  const g = GRABACIONES.find((x) => x.ciudad === ciudad);
  if (!g) {
    throw new Error(
      `Ciudad «${ciudad}» usada en DEFINICION_BLOQUES pero ausente del catálogo de grabaciones.`
    );
  }
  return g.numero;
}

export const BLOQUES: Bloque[] = BIBD_ACTIVO
  ? DEFINICION_BLOQUES.map((d) => ({
      version: d.version,
      grabaciones: intercalar(
        d.meridionales.map(numeroDeCiudad),
        d.septentrionales.map(numeroDeCiudad)
      ),
    }))
  : [
      {
        version: 1,
        grabaciones: intercalar(
          GRABACIONES.filter((g) => g.zona === 'meridional').map((g) => g.numero),
          GRABACIONES.filter((g) => g.zona === 'septentrional').map((g) => g.numero)
        ),
      },
    ];

/** Nº de versiones distintas del formulario (bloques del BIBD). */
export const NUM_BLOQUES = BLOQUES.length;

/** Nº de grabaciones que evalúa CADA participante. */
export const GRABACIONES_POR_FORMULARIO = BLOQUES[0]?.grabaciones.length ?? NUM_GRABACIONES;

/**
 * Veces que aparece cada grabación en el conjunto de formularios (la "réplica"
 * del BIBD). Debe ser la MISMA para las 12; es lo que garantiza que, con el
 * reparto equilibrado de participantes, todos los audios se escuchen igual.
 */
export const REPLICAS_POR_GRABACION: Record<number, number> = (() => {
  const out: Record<number, number> = {};
  for (const g of GRABACIONES) out[g.numero] = 0;
  for (const b of BLOQUES) for (const n of b.grabaciones) out[n] = (out[n] ?? 0) + 1;
  return out;
})();

/** true si las 12 grabaciones aparecen el mismo nº de veces (diseño válido). */
export const BIBD_EQUILIBRADO = (() => {
  const valores = Object.values(REPLICAS_POR_GRABACION);
  return valores.length > 0 && new Set(valores).size === 1;
})();

if (!BIBD_EQUILIBRADO) {
  // No lanzamos error para no tumbar el formulario en producción, pero queda
  // avisado en los logs y visible en el panel /admin.
  console.warn(
    '[config] El diseño de bloques NO está equilibrado: alguna grabación aparece ' +
      'en más formularios que otras. Réplicas:',
    REPLICAS_POR_GRABACION
  );
}

/**
 * Grabaciones (objetos completos) de una versión concreta del formulario,
 * EN EL ORDEN en que deben presentarse (zonas alternadas).
 */
export function grabacionesDeBloque(version: number): Grabacion[] {
  const b = BLOQUES.find((x) => x.version === version) ?? BLOQUES[0];
  return b.grabaciones
    .map((num) => GRABACIONES.find((g) => g.numero === num))
    .filter((g): g is Grabacion => Boolean(g));
}

// ── Escalas de diferencial semántico ───────────────────────────────────────
// Cada ítem: adjetivo negativo (valor bajo) ←→ adjetivo positivo (valor alto).
export type ItemDiferencial = { id: string; negativo: string; positivo: string };

export const ESCALA_VOZ: ItemDiferencial[] = [
  { id: 'agradable', negativo: 'Desagradable', positivo: 'Agradable' },
  { id: 'variada', negativo: 'Monótona', positivo: 'Variada' },
  { id: 'sencilla', negativo: 'Complicada', positivo: 'Sencilla' },
  { id: 'cercana', negativo: 'Distante', positivo: 'Cercana' },
  { id: 'urbana', negativo: 'Rural', positivo: 'Urbana' },
  { id: 'rapida', negativo: 'Lenta', positivo: 'Rápida' },
  { id: 'divertida', negativo: 'Aburrida', positivo: 'Divertida' },
  { id: 'clara', negativo: 'Confusa', positivo: 'Clara' },
  { id: 'bonita', negativo: 'Fea', positivo: 'Bonita' },
  { id: 'profesional', negativo: 'Poco profesional', positivo: 'Profesional' },
  { id: 'musical', negativo: 'Poco musical', positivo: 'Musical' },
];

export const ESCALA_PERSONA: ItemDiferencial[] = [
  { id: 'inteligente', negativo: 'Poco inteligente', positivo: 'Inteligente' },
  { id: 'simpatica', negativo: 'Antipática', positivo: 'Simpática' },
  { id: 'cercana', negativo: 'Distante', positivo: 'Cercana' },
  { id: 'culta', negativo: 'Inculta', positivo: 'Culta' },
  { id: 'educada', negativo: 'Maleducada', positivo: 'Educada' },
  { id: 'confiable', negativo: 'Poco confiable', positivo: 'Confiable' },
];

export const ESCALA_CULTURA: ItemDiferencial[] = [
  { id: 'innovadora', negativo: 'Tradicional', positivo: 'Innovadora' },
  { id: 'divertida', negativo: 'Aburrida', positivo: 'Divertida' },
  { id: 'familiar', negativo: 'Extraña', positivo: 'Familiar' },
  { id: 'cercana', negativo: 'Distante', positivo: 'Cercana' },
  { id: 'rica', negativo: 'Pobre', positivo: 'Rica' },
  { id: 'interesante', negativo: 'Poco interesante', positivo: 'Interesante' },
];

// ── Opciones de campos cerrados ─────────────────────────────────────────────
export const GENEROS = ['Femenino', 'Masculino', 'Prefiero no decirlo', 'Otro'];

export const NIVELES_EDUCATIVOS = [
  'Educación primaria',
  'Educación secundaria',
  'Bachillerato',
  'Formación profesional',
  'Licencia/Grado universitario',
  'Máster o posgrado',
  'Doctorado',
];

export const NIVELES_ESPANOL = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'];

export const METODOS_ESTUDIO = [
  'Academia',
  'Escuela',
  'Universidad',
  'Profesor particular',
  'Internet',
  'Televisión',
  'Radio',
  'Música',
  'Otro',
];

// Idiomas del cuadro "Otros idiomas y sus niveles"
export const OTROS_IDIOMAS = ['Inglés', 'Francés', 'Amazigh', 'Árabe', 'Alemán', 'Otro'];
export const NIVELES_IDIOMA = ['Básico', 'Avanzado', 'Muy avanzado', 'Nativo'];

export const NIVELES_INGRESOS = ['Bajo', 'Medio', 'Alto'];
// Nivel de estudios que el informante atribuye a quien habla. Sustituye a la
// antigua pregunta sobre el «puesto de trabajo» (poco/bien/altamente
// cualificado) y a la escala de 4 opciones anterior.
export const NIVELES_ESTUDIOS_PERCIBIDOS = ['Bajo', 'Medio', 'Alto'];

// Comunidades autónomas de España (para "¿de qué región crees que es?")
export const COMUNIDADES = [
  'Andalucía',
  'Aragón',
  'Asturias',
  'Islas Baleares',
  'Canarias',
  'Cantabria',
  'Castilla-La Mancha',
  'Castilla y León',
  'Cataluña',
  'Comunidad Valenciana',
  'Extremadura',
  'Galicia',
  'La Rioja',
  'Comunidad de Madrid',
  'Región de Murcia',
  'Navarra',
  'País Vasco',
  'Ceuta',
  'Melilla',
];

// Etiquetas de los extremos de la escala de proximidad de pronunciación.
export const PROXIMIDAD_MIN_LABEL = 'Totalmente diferente';
export const PROXIMIDAD_MAX_LABEL = 'Idéntica';

// Opciones de la tabla "Tiempo de estancia (frecuencia habitual)".
export const TIEMPO_ESTANCIA = [
  'Menos de 1 mes',
  '1-3 meses',
  '3 meses-1 año',
  '1-3 años',
  'Más de 3 años',
];
