-- ═══════════════════════════════════════════════════════════════════════════
--  DATOS DE PRUEBA · Estudio Sociolingüístico (verbal-guise)
--
--  Genera 24 participantes ficticios (4 por cada una de las 6 versiones del
--  formulario) y sus 144 valoraciones: exactamente 12 escuchas por grabación,
--  sin ninguna diferencia entre audios (brecha 0). Usa SOLO valores válidos
--  de src/lib/config.ts.
--
--  ¿Por qué 24 y no 20? Porque cada grabación aparece en 3 de las 6 versiones:
--  el reparto solo queda perfectamente equilibrado con múltiplos de 6. Con 20
--  personas unos audios se escucharían 11 veces y otros 9. Si prefieres otra
--  cantidad, cambia el 24 de `generate_series(1, 24)` (más abajo) por 18, 30,
--  36… y el equilibrio se mantiene.
--
--  Uso:  Supabase → SQL Editor → pega este archivo entero → Run.
--        Vuelve a /admin y recarga: las gráficas quedan totalmente pobladas.
--
--  Para BORRAR luego estos datos (los reales NO se tocan, van por email
--  'prueba..@ejemplo.test') usa supabase/limpiar_pruebas.sql, o directamente:
--
--    delete from public.participantes where email like 'prueba%@ejemplo.test';
--    -- (las valoraciones se borran solas por ON DELETE CASCADE)
--
--  Si lo ejecutas dos veces seguidas, la segunda falla («duplicate key …
--  participantes_email_key») porque el email es único. No pasa nada: la
--  ejecución es atómica y no deja datos a medias. Borra primero con
--  limpiar_pruebas.sql si quieres regenerarlos.
--
--  ⚠️  Son datos INVENTADOS, con un patrón metido a mano (ver `items` más
--      abajo). Sirven para ver el panel funcionando y para probar la
--      exportación a CSV, nunca para sacar conclusiones.
-- ═══════════════════════════════════════════════════════════════════════════

with

-- ── Las 6 versiones del formulario (BIBD) ──────────────────────────────────
-- Deben coincidir con BLOQUES de src/lib/config.ts, donde la numeración es:
--   Meridionales:    1 Granada · 2 Cádiz · 3 Badajoz · 4 Murcia · 5 Tenerife
--   Septentrionales: 6 Madrid · 7 Barcelona · 8 Mallorca · 9 Huesca
--                    10 Guipúzcoa · 11 A Coruña · 12 Asturias
-- Cada participante evalúa solo las 6 grabaciones de su versión, y cada
-- grabación aparece en exactamente 3 de las 6 versiones.
bloques(version, grabs) as (
  values
    (1, array[1,6,2,7,3,8]),    -- Granada·Madrid·Cádiz·Barcelona·Badajoz·Mallorca
    (2, array[1,9,4,10,5,11]),  -- Granada·Huesca·Murcia·Guipúzcoa·Tenerife·A Coruña
    (3, array[2,12,4,6,5,9]),   -- Cádiz·Asturias·Murcia·Madrid·Tenerife·Huesca
    (4, array[1,7,8,3,10,12]),  -- Granada·Barcelona·Mallorca·Badajoz·Guipúzcoa·Asturias
    (5, array[2,6,11,4,8,10]),  -- Cádiz·Madrid·A Coruña·Murcia·Mallorca·Guipúzcoa
    (6, array[3,7,9,5,11,12])   -- Badajoz·Barcelona·Huesca·Tenerife·A Coruña·Asturias
),

-- ── Las 12 hablas ──────────────────────────────────────────────────────────
--  ajuste     → desplaza un poco las puntuaciones de esa ciudad dentro de su
--               zona, para que las 12 no salgan calcadas.
--  p_acierto  → probabilidad de que el informante sitúe bien la grabación.
--               Varía mucho a propósito: hay acentos muy reconocibles y otros
--               que casi nadie identifica. Es lo que alimenta la gráfica de
--               «aciertos al identificar la región».
--  confusion  → comunidades a las que se va el informante cuando falla
--               (vecinas o de sonoridad parecida), en vez de una al azar.
grabaciones(numero, ciudad, comunidad, zona, ajuste, p_acierto, confusion) as (
  values
    ( 1, 'Granada',   'Andalucía',           'meridional',    0.15, 0.58, array['Extremadura','Región de Murcia','Canarias','Castilla-La Mancha']),
    ( 2, 'Cádiz',     'Andalucía',           'meridional',    0.05, 0.66, array['Canarias','Extremadura','Región de Murcia','Melilla']),
    ( 3, 'Badajoz',   'Extremadura',         'meridional',   -0.30, 0.20, array['Andalucía','Castilla y León','Castilla-La Mancha','Comunidad de Madrid']),
    ( 4, 'Murcia',    'Región de Murcia',    'meridional',   -0.35, 0.34, array['Andalucía','Comunidad Valenciana','Castilla-La Mancha','Canarias']),
    ( 5, 'Tenerife',  'Canarias',            'meridional',    0.25, 0.62, array['Andalucía','Islas Baleares','Ceuta','Melilla']),
    ( 6, 'Madrid',    'Comunidad de Madrid', 'septentrional', 0.40, 0.52, array['Castilla y León','Castilla-La Mancha','Aragón','La Rioja']),
    ( 7, 'Barcelona', 'Cataluña',            'septentrional', 0.10, 0.46, array['Comunidad Valenciana','Islas Baleares','Aragón','Comunidad de Madrid']),
    ( 8, 'Mallorca',  'Islas Baleares',      'septentrional', 0.00, 0.28, array['Cataluña','Comunidad Valenciana','Canarias','Comunidad de Madrid']),
    ( 9, 'Huesca',    'Aragón',              'septentrional',-0.15, 0.18, array['Castilla y León','La Rioja','Navarra','Comunidad de Madrid']),
    (10, 'Guipúzcoa', 'País Vasco',          'septentrional',-0.05, 0.42, array['Navarra','Cantabria','La Rioja','Aragón']),
    (11, 'A Coruña',  'Galicia',             'septentrional', 0.05, 0.50, array['Asturias','Castilla y León','Cantabria','País Vasco']),
    (12, 'Asturias',  'Asturias',            'septentrional', 0.10, 0.30, array['Galicia','Cantabria','Castilla y León','País Vasco'])
),

-- ── Puntuación media de cada ítem según la zona ────────────────────────────
-- Aquí es donde los datos dejan de ser ruido. Reproducen a propósito el
-- patrón clásico de los estudios de actitudes lingüísticas (Lambert y
-- sucesores), el mismo que describe docs/estadistica-guia.md §11.5:
--
--   · ESTATUS  (clara, profesional, urbana, culta, inteligente, educada):
--     las variedades septentrionales puntúan MÁS ALTO.
--   · SOLIDARIDAD (agradable, cercana, simpática, divertida, musical):
--     las meridionales puntúan MÁS ALTO.
--
-- Es decir: «hablan peor, pero me caen mejor». Así el panel enseña algo
-- interpretable en vez de doce barras en escalera.
items(escala, item, base_mer, base_sep) as (
  values
    -- Voz / pronunciación (11 ítems)
    ('voz', 'agradable',   3.9, 3.3),
    ('voz', 'variada',     3.7, 3.2),
    ('voz', 'sencilla',    3.0, 3.6),
    ('voz', 'cercana',     4.1, 3.0),
    ('voz', 'urbana',      2.8, 3.8),
    ('voz', 'rapida',      4.0, 3.1),
    ('voz', 'divertida',   4.0, 3.0),
    ('voz', 'clara',       2.7, 3.9),
    ('voz', 'bonita',      3.6, 3.3),
    ('voz', 'profesional', 2.7, 3.9),
    ('voz', 'musical',     4.1, 2.9),
    -- Persona que habla (6 ítems)
    ('persona', 'inteligente', 3.0, 3.7),
    ('persona', 'simpatica',   4.2, 3.2),
    ('persona', 'cercana',     4.1, 3.1),
    ('persona', 'culta',       2.8, 3.9),
    ('persona', 'educada',     3.1, 3.7),
    ('persona', 'confiable',   3.2, 3.6),
    -- Cultura asociada (6 ítems)
    ('cultura', 'innovadora',  2.9, 3.5),
    ('cultura', 'divertida',   4.1, 3.1),
    ('cultura', 'conocida',    3.8, 3.2),
    ('cultura', 'cercana',     4.0, 3.1),
    ('cultura', 'rica',        3.8, 3.4),
    ('cultura', 'interesante', 3.7, 3.4)
),

-- ── Perfil de cada participante ────────────────────────────────────────────
-- MATERIALIZED es imprescindible: fija cada sorteo de una vez, para que las
-- respuestas condicionales concuerden (si `estudia` es falso, `que_estudias`
-- tiene que quedar vacío, no relleno con otra tirada de random()).
--
--  ⇩⇩ CAMBIA AQUÍ EL NÚMERO DE PARTICIPANTES (múltiplos de 6) ⇩⇩
perfiles as materialized (
  select
    i,
    'prueba' || lpad(i::text, 2, '0') || '@ejemplo.test'                          as email,
    ((i - 1) % 6) + 1                                                            as bloque,
    (array['Femenino','Masculino','Femenino','Masculino','Femenino','Otro'])[1 + floor(random()*6)::int] as genero,
    (18 + floor(random()*30))::int                                               as edad,
    (array['Tánger','Tetuán','Rabat','Casablanca','Nador','Alhucemas','Fez','Uxda'])[1 + floor(random()*8)::int] as ciudad_nacimiento,
    (array['Tánger','Tetuán','Rabat','Casablanca','Granada','Madrid','Málaga'])[1 + floor(random()*7)::int]      as ciudad_residencia,
    (array['Árabe','Amazigh','Árabe y amazigh','Francés'])[1 + floor(random()*4)::int]                           as lenguas_maternas,
    (array['Básico','Avanzado','Muy avanzado'])[1 + floor(random()*3)::int]      as nivel_ingles,
    (array['Avanzado','Muy avanzado','Nativo'])[1 + floor(random()*3)::int]      as nivel_frances,
    random() < 0.70                                                              as estudia,
    random() < 0.45                                                              as trabaja,
    (array['Educación secundaria','Bachillerato','Formación profesional',
           'Licencia/Grado universitario','Máster o posgrado'])[1 + floor(random()*5)::int] as nivel_educativo,
    (1 + floor(random()*12))::int                                                as anios_estudio_espanol,
    -- Combinaciones de métodos (el campo es text[], así que se parte por comas).
    string_to_array((array[
       'Academia,Internet,Música',
       'Universidad,Internet,Televisión',
       'Escuela,Academia,Radio',
       'Profesor particular,Internet,Música,Televisión',
       'Universidad,Academia',
       'Internet,Música,Televisión,Radio'
     ])[1 + floor(random()*6)::int], ',')                                        as metodos_estudio,
    (array['A2','B1','B1','B2','B2','B2','C1','C1','C2'])[1 + floor(random()*9)::int] as nivel_espanol,
    random() < 0.35                                                              as familia_espana,
    random() < 0.60                                                              as visitado_espana,
    random() < 0.40                                                              as visitado_otros_paises,
    (array['Menos de 1 mes','1-3 meses','3 meses-1 año','1-3 años','Más de 3 años'])[1 + floor(random()*5)::int] as estancia_espana,
    (array['Menos de 1 mes','1-3 meses','3 meses-1 año','1-3 años'])[1 + floor(random()*4)::int]                 as estancia_otros,
    (array['Andalucía','Comunidad de Madrid','Cataluña','Comunidad Valenciana','País Vasco','Galicia'])[1 + floor(random()*6)::int] as zona_familia,
    (array['Andalucía y Madrid','Cataluña','Madrid y Castilla','Andalucía','Levante y Baleares'])[1 + floor(random()*5)::int]       as zonas_visitadas,
    (array['México','Argentina','Colombia','Cuba','Chile'])[1 + floor(random()*5)::int] as otro_pais,
    (array[
       'Creo que en Castilla se habla el español más neutro y claro.',
       'Me gusta cómo se habla en Andalucía, aunque dicen que se come letras.',
       'El de Madrid es el que más se entiende porque es el de la televisión.',
       'Cada zona tiene su acento y ninguno es mejor que otro.',
       'Prefiero el del norte, me parece más pausado.'
     ])[1 + floor(random()*5)::int]                                              as mejor_region_opinion,
    (array[
       'Veo series y películas españolas con subtítulos.',
       'Escucho podcasts y música en español todos los días.',
       'Hablo con amigos españoles por mensajes de voz.',
       'Leo prensa digital española y apunto vocabulario.'
     ])[1 + floor(random()*4)::int]                                              as metodos_ejemplos,
    (array['Ingeniería','Filología Hispánica','Traducción','Turismo','Derecho','Medicina'])[1 + floor(random()*6)::int] as que_estudias,
    (array['Camarero','Profesor de idiomas','Administrativo','Comercial','Guía turístico'])[1 + floor(random()*5)::int] as cual_trabajo
  from generate_series(1, 24) as i
),

-- ── Alta de los participantes ──────────────────────────────────────────────
nuevos as (
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
    bloque
  )
  select
    p.email,
    p.genero,
    case when p.genero = 'Otro' then 'No binario' end,
    p.edad,
    p.ciudad_nacimiento,
    p.ciudad_residencia,
    p.lenguas_maternas,
    jsonb_build_object('Inglés', p.nivel_ingles, 'Francés', p.nivel_frances),
    p.estudia,
    case when p.estudia then p.que_estudias end,
    p.trabaja,
    case when p.trabaja then p.cual_trabajo end,
    p.nivel_educativo,
    p.anios_estudio_espanol,
    p.metodos_estudio,
    p.metodos_ejemplos,
    p.nivel_espanol,
    p.familia_espana,
    case when p.familia_espana then p.zona_familia end,
    p.visitado_espana,
    case when p.visitado_espana then p.estancia_espana end,
    case when p.visitado_espana then p.zonas_visitadas end,
    p.mejor_region_opinion,
    p.visitado_otros_paises,
    case when p.visitado_otros_paises then p.otro_pais end,
    case when p.visitado_otros_paises then p.estancia_otros end,
    p.bloque
  from perfiles p
  returning id, bloque, visitado_espana
),

-- ── Una fila por (participante × grabación de su versión) ──────────────────
-- También MATERIALIZED: fija de una vez los sorteos que se usan más de una
-- vez (el de la región percibida y el de «conoces gente de esa región»).
filas as materialized (
  select
    n.id                       as participante_id,
    gr.numero                  as grabacion,
    gr.zona,
    gr.ajuste,
    gr.comunidad,
    gr.p_acierto,
    gr.confusion,
    -- Hipótesis del contacto: quien ha estado en España valora algo mejor las
    -- hablas meridionales, que son las que más ha oído.
    case when n.visitado_espana and gr.zona = 'meridional' then 0.35 else 0.0 end as bonus_contacto,
    random()                   as d_acierto,
    random()                   as d_confusion,
    random()                   as d_indice,
    random() < 0.45            as conoce_region,
    random() < 0.52            as trato_diferenciado,
    random() < 0.38            as trato_mujer_diferente
  from nuevos n
  join bloques b on b.version = n.bloque
  cross join lateral unnest(b.grabs) as g(numero)
  join grabaciones gr on gr.numero = g.numero
)

insert into public.valoraciones (
  participante_id, grabacion,
  escala_voz, aspecto_gustado, aspecto_disgustado, proximidad,
  nivel_estudios, nivel_ingresos,
  escala_persona, region_percibida,
  conoce_personas_region, conoce_personas_region_opinion,
  escala_cultura,
  trato_diferenciado, trato_mujer_diferente, actitud_genero_influye
)
select
  f.participante_id,
  f.grabacion,

  -- Diferencial semántico de la VOZ (11 ítems, 1–5)
  (select jsonb_object_agg(it.item, greatest(1, least(5, round(
       (case when f.zona = 'meridional' then it.base_mer else it.base_sep end)
       + f.ajuste + f.bonus_contacto + (random() - 0.5) * 1.9)::int)))
     from items it where it.escala = 'voz'),

  (array['La entonación','La claridad al pronunciar','El ritmo pausado',
         'La cercanía al hablar','La musicalidad'])[1 + floor(random()*5)::int],
  (array['Algunas erres','La velocidad','Ciertas vocales',
         'Se come el final de las palabras','Cuesta seguirlo'])[1 + floor(random()*5)::int],

  -- Proximidad con la propia pronunciación (1–5). Los informantes son
  -- arabófonos: el español meridional les suena más próximo al que oyen.
  greatest(1, least(5, round(
    (case when f.zona = 'meridional' then 3.5 else 2.6 end)
    + f.ajuste * 0.5 + f.bonus_contacto + (random() - 0.5) * 1.9)::int)),

  -- Nivel de estudios y de ingresos percibidos (Bajo/Medio/Alto): siguen la
  -- dimensión de estatus, así que suben en las hablas septentrionales.
  (array['Bajo','Medio','Alto'])[greatest(1, least(3, round(
    (case when f.zona = 'meridional' then 1.75 else 2.40 end)
    + f.ajuste * 0.6 + (random() - 0.5) * 1.3)::int))],
  (array['Bajo','Medio','Alto'])[greatest(1, least(3, round(
    (case when f.zona = 'meridional' then 1.80 else 2.35 end)
    + f.ajuste * 0.6 + (random() - 0.5) * 1.3)::int))],

  -- Diferencial semántico de la PERSONA (6 ítems, 1–5)
  (select jsonb_object_agg(it.item, greatest(1, least(5, round(
       (case when f.zona = 'meridional' then it.base_mer else it.base_sep end)
       + f.ajuste + f.bonus_contacto + (random() - 0.5) * 1.9)::int)))
     from items it where it.escala = 'persona'),

  -- Región percibida: acierta según p_acierto; si falla, casi siempre se va a
  -- una comunidad vecina y, de vez en cuando, a cualquier otra.
  case
    when f.d_acierto < f.p_acierto then f.comunidad
    when f.d_confusion < 0.70      then f.confusion[1 + floor(f.d_indice * array_length(f.confusion, 1))::int]
    else (array['Andalucía','Aragón','Asturias','Islas Baleares','Canarias','Cantabria',
                'Castilla-La Mancha','Castilla y León','Cataluña','Comunidad Valenciana',
                'Extremadura','Galicia','La Rioja','Comunidad de Madrid','Región de Murcia',
                'Navarra','País Vasco','Ceuta','Melilla'])[1 + floor(f.d_indice * 19)::int]
  end,

  f.conoce_region,
  case when f.conoce_region then (array[
    'Conozco a gente de allí y me parecen muy abiertos.',
    'Tengo compañeros de esa zona, me llevo bien con ellos.',
    'He coincidido con personas de allí y hablan muy rápido.',
    'Me caen bien, aunque a veces no les entiendo todo.'
  ])[1 + floor(random()*4)::int] end,

  -- Diferencial semántico de la CULTURA (6 ítems, 1–5)
  (select jsonb_object_agg(it.item, greatest(1, least(5, round(
       (case when f.zona = 'meridional' then it.base_mer else it.base_sep end)
       + f.ajuste + f.bonus_contacto + (random() - 0.5) * 1.9)::int)))
     from items it where it.escala = 'cultura'),

  -- Reflexión sobre el género de quien habla (una por grabación)
  f.trato_diferenciado,
  f.trato_mujer_diferente,
  (array[
    'Creo que el género influye bastante en cómo se percibe la autoridad.',
    'No he notado grandes diferencias por el género de quien habla.',
    'Depende más del tono y la seguridad que del género.',
    'Con una jefa creo que el trato habría sido más cercano.',
    'No sabría decirlo con solo una grabación.'
  ])[1 + floor(random()*5)::int]
from filas f;
