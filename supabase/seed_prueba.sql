-- ═══════════════════════════════════════════════════════════════════════════
--  DATOS DE PRUEBA · Estudio Sociolingüístico (verbal-guise)
--  Genera 20 participantes ficticios, cada uno con sus 12 valoraciones
--  (240 valoraciones en total), usando SOLO valores válidos de config.ts.
--
--  Uso:  Supabase → SQL Editor → pega este archivo entero → Run.
--        Vuelve a /admin y recarga: las gráficas quedan totalmente pobladas.
--
--  IMPORTANTE: ejecuta antes schema.sql (o su bloque de ALTER) para que
--  existan las columnas condicionales nuevas (que_estudias, cual_trabajo,
--  zonas, tiempo de estancia, opinión sobre la región, etc.).
--
--  Para BORRAR luego estos datos de prueba (los reales NO se tocan, van por
--  email 'prueba..@ejemplo.test'):
--
--    delete from public.participantes where email like 'prueba%@ejemplo.test';
--    -- (las valoraciones se borran solas por ON DELETE CASCADE)
-- ═══════════════════════════════════════════════════════════════════════════

with nuevos as (
  insert into public.participantes (
    email, genero, genero_otro, edad,
    ciudad_nacimiento, ciudad_residencia, lenguas_maternas, otros_idiomas,
    estudia, que_estudias, trabaja, cual_trabajo,
    nivel_educativo, anios_estudio_espanol,
    metodos_estudio, metodos_ejemplos, nivel_espanol,
    familia_espana, familia_espana_zonas,
    visitado_espana, visitado_espana_tiempo, visitado_espana_zonas,
    mejor_region_opinion,
    visitado_otros_paises, visitado_otros_paises_cuales, visitado_otros_paises_tiempo,
    trato_diferenciado, trato_mujer_diferente, actitud_genero_influye
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
    -- ¿Estudias? y, condicional, ¿qué estudias?
    d.estudia,
    case when d.estudia then
      (array['Filología hispánica','Traducción e interpretación','Turismo','Economía',
             'Ingeniería informática','Derecho','Magisterio'])[(1 + floor(random()*7))::int]
    end,
    -- ¿Trabajas? y, condicional, ¿cuál es tu trabajo?
    d.trabaja,
    case when d.trabaja then
      (array['Profesor de español','Recepcionista de hotel','Guía turístico','Comerciante',
             'Traductor','Camarero','Administrativo'])[(1 + floor(random()*7))::int]
    end,
    (array['Educación secundaria','Bachillerato','Formación profesional',
           'Licencia/Grado universitario','Máster o posgrado'])[(1 + floor(random()*5))::int],
    (1 + floor(random()*10))::int,                                                   -- años estudiando español
    (array['Academia','Universidad','Internet','Música','Televisión'])[1 : (1 + floor(random()*4))::int],
    (array['Hablar con amigos y ver series en español.',
           'Escribir mensajes y leer noticias en español.',
           'Escuchar música y practicar con turistas.',
           null])[(1 + floor(random()*4))::int],
    (array['A2','B1','B1','B2','B2','C1','C1','C2','Nativo'])[(1 + floor(random()*9))::int],
    -- ¿Familia en España? y, condicional, ¿en qué zonas?
    d.familia,
    case when d.familia then
      (array['Andalucía','Cataluña','Comunidad de Madrid','Comunidad Valenciana',
             'Murcia y Almería'])[(1 + floor(random()*5))::int]
    end,
    -- ¿Ha visitado España? y, condicional, tiempo de estancia + zonas visitadas
    d.vis_esp,
    case when d.vis_esp then
      (array['Menos de 1 mes','1-3 meses','3 meses-1 año','1-3 años','Más de 3 años'])[(1 + floor(random()*5))::int]
    end,
    case when d.vis_esp then
      (array['Granada y Sevilla','Madrid','Barcelona','Valencia y Alicante',
             'Málaga y Cádiz'])[(1 + floor(random()*5))::int]
    end,
    (array['Andalucía','Comunidad de Madrid','Cataluña','Comunidad Valenciana','País Vasco'])[(1 + floor(random()*5))::int],
    -- ¿Ha visitado otros países hispanohablantes? y, condicional, cuáles + tiempo
    d.vis_otros,
    case when d.vis_otros then
      (array['México','Argentina','Colombia','Chile','Perú y Ecuador',
             'Cuba'])[(1 + floor(random()*6))::int]
    end,
    case when d.vis_otros then
      (array['Menos de 1 mes','1-3 meses','3 meses-1 año','1-3 años','Más de 3 años'])[(1 + floor(random()*5))::int]
    end,
    random() < 0.5,                                                                  -- trato diferenciado Mariam/Omar
    random() < 0.5,                                                                  -- trato distinto con jefa mujer
    (array[
      'Creo que el género influye bastante en cómo se percibe la autoridad.',
      'No he notado grandes diferencias por el género de quien habla.',
      'Depende más del tono y la seguridad que del género.',
      ''
    ])[(1 + floor(random()*4))::int]
  from generate_series(1, 20) as i
  -- Decisiones "Sí/No" calculadas UNA vez por participante, para que los
  -- campos condicionales sean coherentes con su respuesta.
  cross join lateral (
    select
      random() < 0.7 as estudia,
      random() < 0.5 as trabaja,
      random() < 0.4 as familia,
      random() < 0.6 as vis_esp,
      random() < 0.5 as vis_otros
  ) as d
  returning id
)
insert into public.valoraciones (
  participante_id, grabacion,
  escala_voz, aspecto_gustado, aspecto_disgustado, proximidad,
  puesto_trabajo, nivel_ingresos, nivel_estudios,
  escala_persona, region_percibida, conoce_personas_region, conoce_personas_region_opinion,
  escala_cultura
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
  qq.conoce,                                                                          -- conoce personas de esa región
  -- Opinión sobre la región, solo si conoce a alguien de allí
  case when qq.conoce then
    (array['Me caen bien, son personas muy abiertas.',
           'Tengo buenos amigos de allí.',
           'Trato poco pero me dan buena impresión.',
           'Gente trabajadora y cercana.'])[(1 + floor(random()*4))::int]
  end,
  -- Escala de la CULTURA (6 ítems, 1–5)
  (select jsonb_object_agg(k, least(5, greatest(1, (qq.q + (random()-0.5)*2.4)::int)))
     from unnest(array['innovadora','divertida','familiar','cercana','rica','interesante']) as k)
from nuevos n
cross join generate_series(1, 12) as g(numero)
cross join lateral (
  select
    2 + (g.numero - 1) * (2.5 / 11.0) as q,
    random() < 0.5 as conoce
) as qq;
