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

-- Bloques del BIBD. Deben coincidir con BLOQUES de src/lib/config.ts, donde la
-- numeración de las grabaciones es:
--   Meridionales:    1 Granada · 2 Cádiz · 3 Badajoz · 4 Murcia · 5 Tenerife
--   Septentrionales: 6 Madrid · 7 Barcelona · 8 Mallorca · 9 Huesca
--                    10 Guipúzcoa · 11 A Coruña · 12 Asturias
-- Cada participante evalúa solo las 6 grabaciones de su formulario, y cada
-- grabación aparece en exactamente 3 de los 6 formularios.
with bloques(version, grabs) as (
  values
    (1, array[1,6,2,7,3,8]),    -- Granada·Madrid·Cádiz·Barcelona·Badajoz·Mallorca
    (2, array[1,9,4,10,5,11]),  -- Granada·Huesca·Murcia·Guipúzcoa·Tenerife·A Coruña
    (3, array[2,12,4,6,5,9]),   -- Cádiz·Asturias·Murcia·Madrid·Tenerife·Huesca
    (4, array[1,7,8,3,10,12]),  -- Granada·Barcelona·Mallorca·Badajoz·Guipúzcoa·Asturias
    (5, array[2,6,11,4,8,10]),  -- Cádiz·Madrid·A Coruña·Murcia·Mallorca·Guipúzcoa
    (6, array[3,7,9,5,11,12])   -- Badajoz·Barcelona·Huesca·Tenerife·A Coruña·Asturias
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
    (array['Educación secundaria','Bachillerato','Formación profesional',
           'Licencia/Grado universitario','Máster o posgrado'])[(1 + floor(random()*5))::int],
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
  nivel_estudios, nivel_ingresos,
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
  (array['Bajo','Medio','Alto'])[least(3, greatest(1, (qq.q/5.0*3 + (random()-0.5)*2)::int))],   -- nivel de estudios percibido
  (array['Bajo','Medio','Alto'])[least(3, greatest(1, (qq.q/5.0*3 + (random()-0.5)*2)::int))],   -- nivel de ingresos percibido
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
