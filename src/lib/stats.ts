/**
 * Cálculo de estadísticas agregadas a partir de las filas de Supabase.
 * Se ejecuta en el servidor; el resultado (JSON) alimenta las gráficas.
 */
import {
  GRABACIONES,
  BLOQUES,
  ESCALA_VOZ,
  ESCALA_PERSONA,
  ESCALA_CULTURA,
  GENEROS,
  NIVELES_ESPANOL,
  PUESTOS_TRABAJO,
  NIVELES_INGRESOS,
  NIVELES_ESTUDIOS_PERCIBIDOS,
  COMUNIDADES,
  type ItemDiferencial,
} from './config';

export type Participante = Record<string, any>;
export type Valoracion = Record<string, any>;

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

function avg(nums: number[]): number {
  const valid = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n));
  if (!valid.length) return 0;
  return round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function countBy<T>(items: T[], keyFn: (t: T) => string | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) {
    const k = keyFn(it);
    if (k == null || k === '') continue;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** Distribución ordenada según un catálogo dado (rellena ceros). */
function distribucion(counts: Record<string, number>, catalogo: string[]) {
  const labels = [...catalogo];
  // añade claves no previstas (p. ej. valores libres)
  for (const k of Object.keys(counts)) if (!labels.includes(k)) labels.push(k);
  return { labels, data: labels.map((l) => counts[l] ?? 0) };
}

function boolCount(items: any[], field: string) {
  let si = 0, no = 0;
  for (const it of items) {
    if (it[field] === true) si++;
    else if (it[field] === false) no++;
  }
  return { si, no };
}

/** Media por ítem de una escala jsonb, sobre un conjunto de valoraciones. */
function mediasEscala(vals: Valoracion[], campo: string, items: ItemDiferencial[]) {
  return items.map((it) => ({
    id: it.id,
    etiqueta: `${it.negativo} – ${it.positivo}`,
    positivo: it.positivo,
    media: avg(vals.map((v) => Number((v[campo] ?? {})[it.id]))),
  }));
}

export function computeStats(participantes: Participante[], valoraciones: Valoracion[]) {
  const totalP = participantes.length;
  const totalV = valoraciones.length;

  // ── Demografía ──
  const edades = participantes.map((p) => Number(p.edad)).filter((n) => n > 0);
  const genero = distribucion(countBy(participantes, (p) => p.genero), GENEROS);
  const nivelEspanol = distribucion(countBy(participantes, (p) => p.nivel_espanol), NIVELES_ESPANOL);

  // Histograma de edades por tramos
  const tramos = ['<18', '18-24', '25-34', '35-44', '45-54', '55+'];
  const edadHist = tramos.map((t) => 0);
  for (const e of edades) {
    if (e < 18) edadHist[0]++;
    else if (e < 25) edadHist[1]++;
    else if (e < 35) edadHist[2]++;
    else if (e < 45) edadHist[3]++;
    else if (e < 55) edadHist[4]++;
    else edadHist[5]++;
  }

  const contexto = {
    estudia: boolCount(participantes, 'estudia'),
    trabaja: boolCount(participantes, 'trabaja'),
    familiaEspana: boolCount(participantes, 'familia_espana'),
    visitadoEspana: boolCount(participantes, 'visitado_espana'),
    visitadoOtros: boolCount(participantes, 'visitado_otros_paises'),
  };

  // ── Por grabación ──
  const porGrabacion = GRABACIONES.map((g) => {
    const vals = valoraciones.filter((v) => v.grabacion === g.numero);
    const voz = mediasEscala(vals, 'escala_voz', ESCALA_VOZ);
    const persona = mediasEscala(vals, 'escala_persona', ESCALA_PERSONA);
    const cultura = mediasEscala(vals, 'escala_cultura', ESCALA_CULTURA);
    return {
      numero: g.numero,
      titulo: g.titulo,
      n: vals.length,
      mediaVozGlobal: avg(voz.map((x) => x.media)),
      mediaPersonaGlobal: avg(persona.map((x) => x.media)),
      mediaCulturaGlobal: avg(cultura.map((x) => x.media)),
      proximidad: avg(vals.map((v) => Number(v.proximidad))),
      voz,
      persona,
      cultura,
      puesto: distribucion(countBy(vals, (v) => v.puesto_trabajo), PUESTOS_TRABAJO),
      ingresos: distribucion(countBy(vals, (v) => v.nivel_ingresos), NIVELES_INGRESOS),
      estudios: distribucion(countBy(vals, (v) => v.nivel_estudios), NIVELES_ESTUDIOS_PERCIBIDOS),
    };
  });

  // ── Globales (todas las valoraciones) ──
  const vozGlobal = mediasEscala(valoraciones, 'escala_voz', ESCALA_VOZ);
  const personaGlobal = mediasEscala(valoraciones, 'escala_persona', ESCALA_PERSONA);
  const culturaGlobal = mediasEscala(valoraciones, 'escala_cultura', ESCALA_CULTURA);

  const regionPercibida = distribucion(
    countBy(valoraciones, (v) => v.region_percibida),
    COMUNIDADES
  );

  const puestoGlobal = distribucion(countBy(valoraciones, (v) => v.puesto_trabajo), PUESTOS_TRABAJO);
  const ingresosGlobal = distribucion(countBy(valoraciones, (v) => v.nivel_ingresos), NIVELES_INGRESOS);
  const estudiosGlobal = distribucion(countBy(valoraciones, (v) => v.nivel_estudios), NIVELES_ESTUDIOS_PERCIBIDOS);

  const proximidadDist = distribucion(
    countBy(valoraciones, (v) => (v.proximidad ? String(v.proximidad) : null)),
    ['1', '2', '3', '4', '5']
  );

  // ── Preguntas de género (ahora una por grabación → se agregan sobre todas
  //    las valoraciones) ──
  const genero_preguntas = {
    tratoDiferenciado: boolCount(valoraciones, 'trato_diferenciado'),
    tratoMujerDiferente: boolCount(valoraciones, 'trato_mujer_diferente'),
  };

  // ── Reparto por bloque del BIBD (cuántos participantes en cada versión) ──
  const bloques = BLOQUES.map((b) => ({
    version: b.version,
    grabaciones: b.grabaciones,
    n: participantes.filter((p) => Number(p.bloque) === b.version).length,
  }));

  // Ranking de grabaciones por agradabilidad de la voz
  const ranking = [...porGrabacion]
    .filter((g) => g.n > 0)
    .sort((a, b) => b.mediaVozGlobal - a.mediaVozGlobal);

  return {
    resumen: {
      totalParticipantes: totalP,
      totalValoraciones: totalV,
      edadMedia: edades.length ? round(avg(edades), 1) : null,
      proximidadMedia: avg(valoraciones.map((v) => Number(v.proximidad))),
    },
    demografia: { genero, nivelEspanol, edadHist, tramos, contexto },
    global: {
      voz: vozGlobal,
      persona: personaGlobal,
      cultura: culturaGlobal,
      regionPercibida,
      puesto: puestoGlobal,
      ingresos: ingresosGlobal,
      estudios: estudiosGlobal,
      proximidadDist,
    },
    porGrabacion,
    ranking,
    genero_preguntas,
    bloques,
  };
}

export type Stats = ReturnType<typeof computeStats>;
