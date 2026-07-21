-- ═══════════════════════════════════════════════════════════════════════════
--  DATOS DE PRUEBA · Estudio Sociolingüístico (verbal-guise)
--  Genera 20 participantes ficticios; cada uno evalúa solo las 6 grabaciones
--  de su bloque del BIBD (120 valoraciones en total), usando SOLO valores
--  válidos de config.ts.
--
--  Uso:  Supabase → SQL Editor → pega este archivo entero → Run.
--        Vuelve a /admin y recarga: las gráficas quedan totalmente pobladas.
--
--  Para BORRAR luego estos datos de prueba (los reales NO se tocan, van por
--  email 'prueba..@ejemplo.test'):
--
--    delete from public.participantes where email like 'prueba%@ejemplo.test';
--    -- (las valoraciones se borran solas por ON DELETE CASCADE)
-- ═══════════════════════════════════════════════════════════════════════════

-- Bloques del BIBD (deben coincidir con BLOQUES de src/lib/config.ts, con la
-- clasificación provisional norte = 1–6, sur = 7–12). Cada participante evalúa
-- solo las 6 grabaciones de su bloque.
with bloques(version, grabs) as (
  values
    (1, array[1,2,3,7,8,9]),
    (2, array[2,3,4,8,9,10]),
    (3, array[3,4,5,9,10,11]),
    (4, array[4,5,6,10,11,12]),
    (5, array[1,5,6,7,11,12]),
    (6, array[1,2,6,7,8,12])
),
nuevos as (
  insert into public.participantes (
    email, genero, genero_otro, edad,
    ciudad_nacimiento, ciudad_residencia, lenguas_maternas, otros_idiomas,
    estudia, trabaja, nivel_educativo, anios_estudio_espanol,
    metodos_estudio, metodos_ejemplos, nivel_espanol,
    familia_espana, visitado_espana, mejor_region_opinion, visitado_otros_paises,
    bloque
  )
  select
    'prueba' || lpad(i::text, 2, '0') || '@ejemplo.test',
    (array['Femenino','Masculino','Femenino','Masculino','Prefiero no decirlo','Otro'])[(1 + floor(random()*6))::int],
    null,
    (18 + floor(random()*45))::int,                                                  -- 18–62 años
    (array['Tánger','Tetuán','Rabat','Casablanca','Nador','Alhucemas','Fez','Uxda'])[(1 + floor(random()*8))::int],
    (array['Granada','Madrid','Tánger','Tetuán','Málaga','Rabat'])[(1 + floor(random()*6))::int],
    (array['Árabe','Amazigh','Árabe y amazigh','Francés'])[(1 + floor(random()*4))::int],
    jsonb_build_object(
      'Inglés',  (array['Básico','Avanzado','Muy avanzado'])[(1 + floor(random()*3))::int],
      'Francés', (array['Avanzado','Muy avanzado','Nativo'])[(1 + floor(random()*3))::int]
    ),
    random() < 0.7,                                                                  -- estudia
    random() < 0.5,                                                                  -- trabaja
    (array['Educación secundaria (ESO)','Bachillerato','Formación profesional',
           'Grado universitario','Máster o posgrado'])[(1 + floor(random()*5))::int],
    (1 + floor(random()*10))::int,                                                   -- años estudiando español
    (array['Academia','Universidad','Internet','Música','Televisión'])[1 : (1 + floor(random()*4))::int],
    null,
    (array['A2','B1','B1','B2','B2','C1','C1','C2','Nativo'])[(1 + floor(random()*9))::int],
    random() < 0.4,                                                                  -- familia en España
    random() < 0.6,                                                                  -- ha visitado España
    (array['Andalucía','Comunidad de Madrid','Cataluña','Comunidad Valenciana','País Vasco'])[(1 + floor(random()*5))::int],
    random() < 0.5,                                                                  -- ha visitado otros países
    ((i - 1) % 6) + 1                                                                -- bloque asignado (rotatorio 1..6)
  from generate_series(1, 20) as i
  returning id, bloque
)
insert into public.valoraciones (
  participante_id, grabacion,
  escala_voz, aspecto_gustado, aspecto_disgustado, proximidad,
  puesto_trabajo, nivel_ingresos, nivel_estudios,
  escala_persona, region_percibida, conoce_personas_region,
  escala_cultura,
  trato_diferenciado, trato_mujer_diferente, actitud_genero_influye
)
select
  n.id,
  g.numero,
  -- Escala de la VOZ (11 ítems, 1–5) con leve tendencia por grabación + ruido
  (select jsonb_object_agg(k, least(5, greatest(1, (qq.q + (random()-0.5)*2.4)::int)))
     from unnest(array['agradable','variada','sencilla','cercana','urbana','rapida',
                       'divertida','clara','bonita','profesional','musical']) as k),
  (array['La entonación','La claridad al pronunciar','El ritmo pausado','La cercanía', null])[(1 + floor(random()*5))::int],
  (array['Algunas erres','La velocidad','Ciertas vocales', null, null])[(1 + floor(random()*5))::int],
  least(5, greatest(1, (qq.q + (random()-0.5)*2.0)::int)),                           -- proximidad 1–5
  (array['Poco cualificado','Bien cualificado','Altamente cualificado'])[least(3, greatest(1, (qq.q/5.0*3 + (random()-0.5)*2)::int))],
  (array['Bajo','Medio','Alto'])[least(3, greatest(1, (qq.q/5.0*3 + (random()-0.5)*2)::int))],
  (array['Sin estudios','Primarios','Secundarios','Universitarios'])[least(4, greatest(1, (qq.q/5.0*4 + (random()-0.5)*2)::int))],
  -- Escala de la PERSONA (6 ítems, 1–5)
  (select jsonb_object_agg(k, least(5, greatest(1, (qq.q + (random()-0.5)*2.4)::int)))
     from unnest(array['inteligente','simpatica','cercana','culta','educada','confiable']) as k),
  (array['Andalucía','Aragón','Asturias','Islas Baleares','Canarias','Cantabria',
         'Castilla-La Mancha','Castilla y León','Cataluña','Comunidad Valenciana',
         'Extremadura','Galicia','La Rioja','Comunidad de Madrid','Región de Murcia',
         'Navarra','País Vasco','Ceuta','Melilla'])[(1 + floor(random()*19))::int],
  random() < 0.5,                                                                    -- conoce personas de esa región
  -- Escala de la CULTURA (6 ítems, 1–5)
  (select jsonb_object_agg(k, least(5, greatest(1, (qq.q + (random()-0.5)*2.4)::int)))
     from unnest(array['innovadora','divertida','familiar','cercana','rica','interesante']) as k),
  -- Reflexión sobre el género (una por grabación)
  random() < 0.5,                                                                    -- trato diferenciado Mariam/Omar
  random() < 0.5,                                                                    -- trato distinto con jefa mujer
  (array[
    'Creo que el género influye bastante en cómo se percibe la autoridad.',
    'No he notado grandes diferencias por el género de quien habla.',
    'Depende más del tono y la seguridad que del género.',
    ''
  ])[(1 + floor(random()*4))::int]
from nuevos n
join bloques b on b.version = n.bloque
cross join lateral unnest(b.grabs) as g(numero)
cross join lateral (select 2 + (g.numero - 1) * (2.5 / 11.0) as q) as qq;
