/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DEL ESTUDIO (fuente única de verdad)
 * ─────────────────────────────────────────────────────────────────────────
 *  Todo el formulario, la base de datos y las estadísticas se generan a
 *  partir de este archivo. Si tu amigo cambia una pregunta, un adjetivo o
 *  una grabación, se edita AQUÍ y el resto se adapta solo.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Número total de grabaciones del estudio (el "pool" completo). */
export const NUM_GRABACIONES = 12;

/**
 * Nº de grabaciones que evalúa CADA participante (bloque incompleto).
 *
 * El formulario completo (las 12) dura demasiado (~40 min) y el cansancio
 * arruina las respuestas. Para no eliminar ninguna grabación se usa un
 * **diseño de bloques incompletos balanceados (BIBD)**: cada informante
 * evalúa solo un subconjunto de `GRABACIONES_POR_FORMULARIO`, equilibrado
 * entre variedades del norte y del sur peninsular (mitad y mitad).
 *
 * Pon este valor igual a `NUM_GRABACIONES` para desactivar el BIBD y que
 * todos evalúen las 12.
 */
export const GRABACIONES_POR_FORMULARIO = 6;

/** Rango de la escala de valoración (diferencial semántico). */
export const ESCALA_MIN = 1;
export const ESCALA_MAX = 5;

// ── Grabaciones ────────────────────────────────────────────────────────────
// Sustituye estas URLs por las reales cuando estén listas. Admite:
//   · tipo 'audio'      → url a un .mp3/.ogg (Supabase Storage, S3, etc.)
//   · tipo 'soundcloud' → url pública de la pista en SoundCloud
/** Zona dialectal de la muestra (para equilibrar los bloques del BIBD). */
export type Zona = 'norte' | 'sur';

export type Grabacion = {
  numero: number;
  titulo: string;
  tipo: 'audio' | 'soundcloud';
  /** Norte o sur peninsular. Se usa para balancear cada formulario. */
  zona: Zona;
  /** URL del audio principal. Admite .ogg/.opus (WhatsApp), .mp3, .m4a, .wav… */
  url: string;
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
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_GRABACIONES}/${archivo}`;

// ⚠️ IMPORTANTE — clasificación NORTE/SUR de cada muestra.
// El equilibrio del BIBD depende de esta tabla. AJÚSTALA con la zona real de
// cada grabación (muestra1 … muestra12). Debe haber la misma cantidad de
// «norte» que de «sur» (6 y 6) para que cada formulario quede 3 + 3.
// Valores de partida (provisionales): 1–6 = norte, 7–12 = sur.
export const ZONA_POR_GRABACION: Record<number, Zona> = {
  1: 'norte', 2: 'norte', 3: 'norte', 4: 'norte', 5: 'norte', 6: 'norte',
  7: 'sur', 8: 'sur', 9: 'sur', 10: 'sur', 11: 'sur', 12: 'sur',
};

// Las 12 grabaciones apuntan a  muestra1.ogg … muestra12.ogg  del bucket.
// → Sube tus audios de WhatsApp a Supabase Storage con ESOS nombres exactos
//   (bucket "grabaciones", público) y funcionarán sin tocar nada más.
//   ¿Prefieres otros nombres o formatos? Cambia solo la línea `url` de abajo.
export const GRABACIONES: Grabacion[] = Array.from(
  { length: NUM_GRABACIONES },
  (_, i) => ({
    numero: i + 1,
    titulo: `Grabación ${i + 1}`,
    tipo: 'audio' as const,
    zona: ZONA_POR_GRABACION[i + 1] ?? 'norte',
    url: storageUrl(`muestra${i + 1}.ogg`),
    // Opcional: descomenta para un audio de reserva (iPhones antiguos):
    // urlFallback: storageUrl(`muestra${i + 1}.m4a`),
  })
);

// ── Diseño de bloques incompletos balanceados (BIBD) ────────────────────────
// Cada participante evalúa GRABACIONES_POR_FORMULARIO muestras (un "bloque"),
// con la mitad del norte y la mitad del sur. Los bloques se generan con
// ventanas cíclicas dentro de cada zona, de modo que:
//   · cada formulario queda equilibrado norte/sur;
//   · cada grabación aparece en el mismo número de bloques (réplica constante),
//     así que, repartiendo a los informantes de forma rotatoria, todas las
//     muestras reciben aproximadamente el mismo número de valoraciones.
export type Bloque = { version: number; grabaciones: number[] };

// Ventanas cíclicas de tamaño `tam` sobre `items`: [0..tam-1], [1..tam], …
function ventanasCiclicas(items: number[], tam: number): number[][] {
  if (tam <= 0 || items.length === 0) return [];
  if (tam >= items.length) return [[...items]];
  return items.map((_, i) =>
    Array.from({ length: tam }, (_, j) => items[(i + j) % items.length])
  );
}

export const BLOQUES: Bloque[] = (() => {
  // Sin BIBD: un único bloque con todas las grabaciones.
  if (GRABACIONES_POR_FORMULARIO >= NUM_GRABACIONES) {
    return [{ version: 1, grabaciones: GRABACIONES.map((g) => g.numero) }];
  }
  const norte = GRABACIONES.filter((g) => g.zona === 'norte').map((g) => g.numero);
  const sur = GRABACIONES.filter((g) => g.zona === 'sur').map((g) => g.numero);
  const mitadNorte = Math.round(GRABACIONES_POR_FORMULARIO / 2);
  const mitadSur = GRABACIONES_POR_FORMULARIO - mitadNorte;
  const ventN = ventanasCiclicas(norte, mitadNorte);
  const ventS = ventanasCiclicas(sur, mitadSur);
  const total = Math.max(ventN.length, ventS.length) || 1;
  const bloques: Bloque[] = [];
  for (let i = 0; i < total; i++) {
    const grabaciones = [
      ...(ventN.length ? ventN[i % ventN.length] : []),
      ...(ventS.length ? ventS[i % ventS.length] : []),
    ].sort((a, b) => a - b);
    bloques.push({ version: i + 1, grabaciones });
  }
  return bloques;
})();

/** Nº de versiones distintas del formulario (bloques del BIBD). */
export const NUM_BLOQUES = BLOQUES.length;

/** Grabaciones (objetos completos) de una versión concreta del formulario. */
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

export const PUESTOS_TRABAJO = ['Poco cualificado', 'Bien cualificado', 'Altamente cualificado'];
export const NIVELES_INGRESOS = ['Bajo', 'Medio', 'Alto'];
export const NIVELES_ESTUDIOS_PERCIBIDOS = ['Sin estudios', 'Primarios', 'Secundarios', 'Universitarios'];

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
