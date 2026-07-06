import type { APIRoute } from 'astro';
import { getServiceClient } from '@/lib/supabase';
import {
  GRABACIONES,
  ESCALA_VOZ,
  ESCALA_PERSONA,
  ESCALA_CULTURA,
  OTROS_IDIOMAS,
} from '@/lib/config';

export const prerender = false;

const asBool = (v: unknown): boolean | null =>
  v === 'si' || v === 'sí' || v === true ? true : v === 'no' || v === false ? false : null;

const asInt = (v: unknown): number | null => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
};

const escala = (data: Record<string, any>, prefix: string, items: { id: string }[]) => {
  const out: Record<string, number> = {};
  for (const it of items) {
    const val = asInt(data[`${prefix}_${it.id}`]);
    if (val !== null) out[it.id] = val;
  }
  return out;
};

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, any>;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Petición no válida.' }, 400);
  }

  const email = String(data.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Introduce un correo electrónico válido.' }, 400);
  }

  const supabase = getServiceClient();

  // 1) ¿Ya ha respondido este correo?
  const { data: existing, error: exErr } = await supabase
    .from('participantes')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (exErr) return json({ error: 'Error al comprobar el correo.' }, 500);
  if (existing) {
    return json({ error: 'Este correo ya ha completado el formulario. ¡Gracias!' }, 409);
  }

  // 2) Otros idiomas → { "Inglés": "Avanzado", ... }
  const otrosIdiomas: Record<string, string> = {};
  for (const idioma of OTROS_IDIOMAS) {
    const nivel = data[`idioma_${idioma}`];
    if (nivel) otrosIdiomas[idioma] = String(nivel);
  }

  // 3) Insertar participante
  const { data: participante, error: pErr } = await supabase
    .from('participantes')
    .insert({
      email,
      genero: data.genero ?? null,
      genero_otro: data.genero_otro || null,
      edad: asInt(data.edad),
      ciudad_nacimiento: data.ciudad_nacimiento || null,
      ciudad_residencia: data.ciudad_residencia || null,
      lenguas_maternas: data.lenguas_maternas || null,
      otros_idiomas: otrosIdiomas,
      estudia: asBool(data.estudia),
      que_estudias: data.que_estudias || null,
      trabaja: asBool(data.trabaja),
      cual_trabajo: data.cual_trabajo || null,
      nivel_educativo: data.nivel_educativo || null,
      anios_estudio_espanol: asInt(data.anios_estudio_espanol),
      metodos_estudio: Array.isArray(data.metodos_estudio) ? data.metodos_estudio : [],
      metodos_ejemplos: data.metodos_ejemplos || null,
      nivel_espanol: data.nivel_espanol || null,
      familia_espana: asBool(data.familia_espana),
      familia_espana_zonas: data.familia_espana_zonas || null,
      visitado_espana: asBool(data.visitado_espana),
      visitado_espana_tiempo: data.visitado_espana_tiempo || null,
      visitado_espana_zonas: data.visitado_espana_zonas || null,
      mejor_region_opinion: data.mejor_region_opinion || null,
      visitado_otros_paises: asBool(data.visitado_otros_paises),
      visitado_otros_paises_cuales: data.visitado_otros_paises_cuales || null,
      visitado_otros_paises_tiempo: data.visitado_otros_paises_tiempo || null,
      trato_diferenciado: asBool(data.trato_diferenciado),
      trato_mujer_diferente: asBool(data.trato_mujer_diferente),
      actitud_genero_influye: data.actitud_genero_influye || null,
    })
    .select('id')
    .single();

  if (pErr || !participante) {
    // 23505 = violación de unicidad (carrera entre dos envíos simultáneos)
    if ((pErr as any)?.code === '23505') {
      return json({ error: 'Este correo ya ha completado el formulario. ¡Gracias!' }, 409);
    }
    return json({ error: 'No se pudo guardar la respuesta. Inténtalo de nuevo.' }, 500);
  }

  // 4) Insertar valoraciones (una por grabación)
  const valoraciones = GRABACIONES.map((g) => {
    const p = `g${g.numero}`;
    return {
      participante_id: participante.id,
      grabacion: g.numero,
      escala_voz: escala(data, `${p}_voz`, ESCALA_VOZ),
      aspecto_gustado: data[`${p}_aspecto_gustado`] || null,
      aspecto_disgustado: data[`${p}_aspecto_disgustado`] || null,
      proximidad: asInt(data[`${p}_proximidad`]),
      puesto_trabajo: data[`${p}_puesto_trabajo`] || null,
      nivel_ingresos: data[`${p}_nivel_ingresos`] || null,
      nivel_estudios: data[`${p}_nivel_estudios`] || null,
      escala_persona: escala(data, `${p}_persona`, ESCALA_PERSONA),
      region_percibida: data[`${p}_region_percibida`] || null,
      conoce_personas_region: asBool(data[`${p}_conoce_personas_region`]),
      conoce_personas_region_opinion: data[`${p}_conoce_personas_region_opinion`] || null,
      escala_cultura: escala(data, `${p}_cultura`, ESCALA_CULTURA),
    };
  });

  const { error: vErr } = await supabase.from('valoraciones').insert(valoraciones);
  if (vErr) {
    // Rollback manual del participante para no dejar datos huérfanos
    await supabase.from('participantes').delete().eq('id', participante.id);
    return json({ error: 'No se pudieron guardar las valoraciones. Inténtalo de nuevo.' }, 500);
  }

  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
