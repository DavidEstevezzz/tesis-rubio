/**
 * Cálculo de estadísticas agregadas a partir de las filas de Supabase.
 * Se ejecuta en el servidor; el resultado (JSON) alimenta las gráficas.
 */
import {
  GRABACIONES,
  BLOQUES,
  REPLICAS_POR_GRABACION,
  BIBD_EQUILIBRADO,
  ESCALA_VOZ,
  ESCALA_PERSONA,
  ESCALA_CULTURA,
  GENEROS,
  NIVELES_ESPANOL,
  NIVELES_INGRESOS,
  NIVELES_ESTUDIOS_PERCIBIDOS,
  COMUNIDADES,
  type ItemDiferencial,
  type Zona,
} from './config';

export type Participante = Record<string, any>;
export type Valoracion = Record<string, any>;

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** «A Coruña» → «acoruna». Se usa como id de pestaña y ancla de la URL. */
export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

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

  // ── Por grabación (cada ciudad tiene su propia pestaña en el panel) ──
  const porGrabacion = GRABACIONES.map((g) => {
    const vals = valoraciones.filter((v) => v.grabacion === g.numero);
    const voz = mediasEscala(vals, 'escala_voz', ESCALA_VOZ);
    const persona = mediasEscala(vals, 'escala_persona', ESCALA_PERSONA);
    const cultura = mediasEscala(vals, 'escala_cultura', ESCALA_CULTURA);
    // ¿Cuántos sitúan el habla en su comunidad real?
    const conRegion = vals.filter((v) => v.region_percibida);
    const aciertos = conRegion.filter((v) => v.region_percibida === g.comunidad).length;
    return {
      numero: g.numero,
      titulo: g.titulo,
      // Ciudad, zona y comunidad: solo para el panel de investigadores.
      ciudad: g.ciudad,
      zona: g.zona,
      comunidad: g.comunidad,
      etiqueta: g.etiqueta,
      // Clave estable para enlazar la pestaña (#granada, #acoruna…).
      slug: slugify(g.ciudad),
      n: vals.length,
      mediaVozGlobal: avg(voz.map((x) => x.media)),
      mediaPersonaGlobal: avg(persona.map((x) => x.media)),
      mediaCulturaGlobal: avg(cultura.map((x) => x.media)),
      proximidad: avg(vals.map((v) => Number(v.proximidad))),
      voz,
      persona,
      cultura,
      ingresos: distribucion(countBy(vals, (v) => v.nivel_ingresos), NIVELES_INGRESOS),
      estudios: distribucion(countBy(vals, (v) => v.nivel_estudios), NIVELES_ESTUDIOS_PERCIBIDOS),
      proximidadDist: distribucion(
        countBy(vals, (v) => (v.proximidad ? String(v.proximidad) : null)),
        ['1', '2', '3', '4', '5']
      ),
      regionPercibida: distribucion(countBy(vals, (v) => v.region_percibida), COMUNIDADES),
      genero: {
        tratoDiferenciado: boolCount(vals, 'trato_diferenciado'),
        tratoMujerDiferente: boolCount(vals, 'trato_mujer_diferente'),
      },
      acierto: {
        aciertos,
        fallos: conRegion.length - aciertos,
        porcentaje: conRegion.length ? round((aciertos / conRegion.length) * 100, 1) : 0,
      },
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
  const ciudadDe = (numero: number) =>
    GRABACIONES.find((g) => g.numero === numero)?.ciudad ?? String(numero);

  const bloques = BLOQUES.map((b) => ({
    version: b.version,
    grabaciones: b.grabaciones,
    // Ciudades en el orden real de presentación (zonas alternadas).
    ciudades: b.grabaciones.map(ciudadDe),
    n: participantes.filter((p) => Number(p.bloque) === b.version).length,
  }));

  // ── Equilibrio de escuchas por audio (nº de valoraciones de cada grabación) ──
  const escuchasPorAudio = porGrabacion.map((g) => ({
    numero: g.numero,
    ciudad: g.ciudad,
    zona: g.zona,
    n: g.n,
  }));
  const cuentas = escuchasPorAudio.map((e) => e.n);
  const equilibrio = {
    porAudio: escuchasPorAudio,
    min: cuentas.length ? Math.min(...cuentas) : 0,
    max: cuentas.length ? Math.max(...cuentas) : 0,
    // Brecha máx–min: 0 = perfectamente equilibrado.
    brecha: cuentas.length ? Math.max(...cuentas) - Math.min(...cuentas) : 0,
    // Veces que aparece cada grabación en el conjunto de formularios y si el
    // diseño está bien equilibrado (todas con la misma réplica).
    replicas: REPLICAS_POR_GRABACION,
    disenoEquilibrado: BIBD_EQUILIBRADO,
  };

  // ── Comparativa entre ciudades (pestaña «Global») ───────────────────────
  // Todas las series comparten el mismo orden de ciudades, así que cualquier
  // gráfica de barras agrupadas o apiladas puede cruzarlas directamente.
  const ciudades = porGrabacion.map((g) => g.ciudad);

  /** Para cada par de adjetivos, la media de las 12 ciudades (una serie por ítem). */
  const porItem = (campo: 'voz' | 'persona' | 'cultura', items: ItemDiferencial[]) =>
    items.map((it) => ({
      id: it.id,
      etiqueta: `${it.negativo} – ${it.positivo}`,
      positivo: it.positivo,
      data: porGrabacion.map((g) => g[campo].find((x) => x.id === it.id)?.media ?? 0),
    }));

  /** Medias de una zona dialectal completa (todas sus grabaciones juntas). */
  const perfilZona = (zona: Zona) => {
    const numeros = GRABACIONES.filter((g) => g.zona === zona).map((g) => g.numero);
    const vals = valoraciones.filter((v) => numeros.includes(Number(v.grabacion)));
    return {
      n: vals.length,
      voz: mediasEscala(vals, 'escala_voz', ESCALA_VOZ),
      persona: mediasEscala(vals, 'escala_persona', ESCALA_PERSONA),
      cultura: mediasEscala(vals, 'escala_cultura', ESCALA_CULTURA),
      proximidad: avg(vals.map((v) => Number(v.proximidad))),
    };
  };

  /** Reparto de una pregunta categórica ciudad a ciudad (para barras apiladas). */
  const apiladoPorCiudad = (campo: 'ingresos' | 'estudios', catalogo: string[]) =>
    catalogo.map((nivel) => ({
      nivel,
      data: porGrabacion.map((g) => {
        const i = g[campo].labels.indexOf(nivel);
        return i === -1 ? 0 : g[campo].data[i];
      }),
    }));

  const comparativa = {
    ciudades,
    etiquetas: porGrabacion.map((g) => g.etiqueta),
    zonas: porGrabacion.map((g) => g.zona),
    n: porGrabacion.map((g) => g.n),
    // Las cuatro medidas resumen, ciudad a ciudad (barras agrupadas).
    medias: {
      voz: porGrabacion.map((g) => g.mediaVozGlobal),
      persona: porGrabacion.map((g) => g.mediaPersonaGlobal),
      cultura: porGrabacion.map((g) => g.mediaCulturaGlobal),
      proximidad: porGrabacion.map((g) => g.proximidad),
    },
    // Adjetivo por adjetivo: alimenta el selector «compara este rasgo».
    vozPorItem: porItem('voz', ESCALA_VOZ),
    personaPorItem: porItem('persona', ESCALA_PERSONA),
    culturaPorItem: porItem('cultura', ESCALA_CULTURA),
    // Meridional vs septentrional, el eje que equilibra el estudio.
    zona: {
      meridional: perfilZona('meridional'),
      septentrional: perfilZona('septentrional'),
    },
    ingresosPorCiudad: apiladoPorCiudad('ingresos', NIVELES_INGRESOS),
    estudiosPorCiudad: apiladoPorCiudad('estudios', NIVELES_ESTUDIOS_PERCIBIDOS),
    aciertoRegion: porGrabacion.map((g) => g.acierto.porcentaje),
    generoPorCiudad: {
      tratoDiferenciado: {
        si: porGrabacion.map((g) => g.genero.tratoDiferenciado.si),
        no: porGrabacion.map((g) => g.genero.tratoDiferenciado.no),
      },
      tratoMujerDiferente: {
        si: porGrabacion.map((g) => g.genero.tratoMujerDiferente.si),
        no: porGrabacion.map((g) => g.genero.tratoMujerDiferente.no),
      },
    },
  };

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
      ingresos: ingresosGlobal,
      estudios: estudiosGlobal,
      proximidadDist,
    },
    porGrabacion,
    comparativa,
    ranking,
    genero_preguntas,
    bloques,
    equilibrio,
  };
}

export type Stats = ReturnType<typeof computeStats>;
