import type { APIRoute } from 'astro';
import { getServiceClient } from '@/lib/supabase';
import { ESCALA_VOZ, ESCALA_PERSONA, ESCALA_CULTURA, GRABACIONES } from '@/lib/config';

export const prerender = false;

// Exporta un CSV aplanado: una fila por valoración, con los datos del
// participante repetidos. Ideal para abrir en Excel / analizar en R o SPSS.
export const GET: APIRoute = async () => {
  const supabase = getServiceClient();
  const [{ data: participantes }, { data: valoraciones }] = await Promise.all([
    supabase.from('participantes').select('*'),
    supabase.from('valoraciones').select('*').order('grabacion'),
  ]);

  const pById = new Map((participantes ?? []).map((p) => [p.id, p]));

  const pCols = [
    'email', 'bloque', 'genero', 'genero_otro', 'edad', 'ciudad_nacimiento', 'ciudad_residencia',
    'lenguas_maternas', 'estudia', 'que_estudias', 'trabaja', 'cual_trabajo',
    'nivel_educativo', 'anios_estudio_espanol',
    'metodos_estudio', 'metodos_ejemplos', 'nivel_espanol', 'familia_espana',
    'familia_espana_zonas', 'visitado_espana', 'visitado_espana_tiempo',
    'visitado_espana_zonas', 'mejor_region_opinion', 'visitado_otros_paises',
    'visitado_otros_paises_cuales', 'visitado_otros_paises_tiempo',
  ];

  const vozCols = ESCALA_VOZ.map((i) => `voz_${i.id}`);
  const personaCols = ESCALA_PERSONA.map((i) => `persona_${i.id}`);
  const culturaCols = ESCALA_CULTURA.map((i) => `cultura_${i.id}`);

  // Ciudad y zona dialectal de cada grabación, para poder cruzarlas al analizar.
  const grabById = new Map(GRABACIONES.map((g) => [g.numero, g]));

  const header = [
    ...pCols,
    'grabacion', 'ciudad', 'zona',
    ...vozCols,
    'aspecto_gustado', 'aspecto_disgustado', 'proximidad',
    'nivel_estudios', 'nivel_ingresos',
    ...personaCols,
    'region_percibida', 'conoce_personas_region', 'conoce_personas_region_opinion',
    ...culturaCols,
    'trato_diferenciado', 'trato_mujer_diferente', 'actitud_genero_influye',
    'fecha',
  ];

  const rows = [header.join(',')];

  for (const v of valoraciones ?? []) {
    const p = pById.get(v.participante_id) ?? {};
    const cells: any[] = [];
    for (const c of pCols) cells.push(fmtBool(p[c]));
    const g = grabById.get(v.grabacion);
    cells.push(v.grabacion, g?.ciudad ?? '', g?.zona ?? '');
    for (const i of ESCALA_VOZ) cells.push((v.escala_voz ?? {})[i.id] ?? '');
    cells.push(v.aspecto_gustado, v.aspecto_disgustado, v.proximidad ?? '');
    cells.push(v.nivel_estudios ?? '', v.nivel_ingresos ?? '');
    for (const i of ESCALA_PERSONA) cells.push((v.escala_persona ?? {})[i.id] ?? '');
    cells.push(v.region_percibida ?? '', fmtBool(v.conoce_personas_region), v.conoce_personas_region_opinion ?? '');
    for (const i of ESCALA_CULTURA) cells.push((v.escala_cultura ?? {})[i.id] ?? '');
    cells.push(fmtBool(v.trato_diferenciado), fmtBool(v.trato_mujer_diferente), v.actitud_genero_influye ?? '');
    cells.push(v.created_at);
    rows.push(cells.map(csvCell).join(','));
  }

  const csv = '﻿' + rows.join('\r\n'); // BOM para acentos en Excel
  const fecha = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="estudio_sociolinguistico_${fecha}.csv"`,
    },
  });
};

function fmtBool(v: any) {
  if (v === true) return 'Sí';
  if (v === false) return 'No';
  if (Array.isArray(v)) return v.join('; ');
  return v ?? '';
}
function csvCell(v: any) {
  const s = String(v ?? '');
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
