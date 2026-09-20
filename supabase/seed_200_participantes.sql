-- ═══════════════════════════════════════════════════════════════════════════
--  DATOS DE PRUEBA · Estudio Sociolingüístico (verbal-guise)
--  COMPLETAR HASTA 200 PARTICIPANTES
--
--  El estudio espera unas 200 participaciones. En la base ya hay 20 que puso
--  supabase/seed_prueba.sql (correos prueba01@ejemplo.test … prueba20@…), así
--  que este script AÑADE 180 MÁS (prueba021@ejemplo.test … prueba200@…) y deja
--  el total en 200 participantes y 1 200 valoraciones (200 × 6 grabaciones).
--
--  Uso:  Supabase → SQL Editor → pega este archivo entero → Run.
--        Tarda unos segundos. Después, recarga /admin.
--
--  ⚠️  ANTES de ejecutarlo:
--      · Si ya tienes los 20 del seed original → ejecuta este archivo tal cual.
--      · Si la base está VACÍA y quieres los 200 de golpe → ejecuta primero
--        supabase/seed_prueba.sql (pone 20) y luego este (añade 180).
--      · Si lo ejecutas dos veces dará error de email duplicado (que es
--        justamente lo que impide duplicar participantes). Para repetirlo:
--            delete from public.participantes
--            where email like 'prueba%@ejemplo.test';
--
--  Para BORRARLO TODO luego: supabase/limpiar_pruebas.sql (PASO 1 borra por
--  el patrón 'prueba%@ejemplo.test', que cubre también estos 180).
--
--  ─────────────────────────────────────────────────────────────────────────
--  QUÉ TIENEN DE ESPECIAL ESTOS DATOS
--  ─────────────────────────────────────────────────────────────────────────
--  No son ruido puro: están generados con las MISMAS relaciones que el panel
--  de «Cruces» pretende medir, para poder comprobar que las gráficas las
--  detectan (y para enseñar el panel con datos que se parezcan a los reales):
--
--   · Nivel de español ↑  → brecha septentrional − meridional ↑
--     (quien más español sabe, más diferencia hace entre acentos).
--   · Haber visitado España → sube la valoración de las hablas meridionales
--     (el contacto directo suaviza el estereotipo).
--   · Edad ↑ → brecha ↑ (actitudes más marcadas en los tramos altos).
--   · Lengua materna árabe → hablas meridionales algo mejor valoradas.
--   · Acertar la comunidad autónoma → valoración algo más alta.
--   · Proximidad percibida ↑ → índice de voz ↑ (correlación positiva).
--   · Las participantes mujeres dicen «sí» más a menudo en las dos preguntas
--     sobre el trato a Mariam.
--
--  Los efectos son moderados y llevan ruido encima, así que las gráficas se
--  ven como se verían con datos reales (tendencia clara, no línea perfecta).
-- ═══════════════════════════════════════════════════════════════════════════

-- Las 12 hablas, con su zona y su comunidad real (igual que CATALOGO en
-- src/lib/config.ts). La comunidad sirve para decidir si el participante
-- «acierta» la procedencia.
with grabaciones(numero, ciudad, zona, comunidad) as (
  values
    (1,  'Granada',   'meridional',    'Andalucía'),
    (2,  'Cádiz',     'meridional',    'Andalucía'),
    (3,  'Badajoz',   'meridional',    'Extremadura'),
    (4,  'Murcia',    'meridional',    'Región de Murcia'),
    (5,  'Tenerife',  'meridional',    'Canarias'),
    (6,  'Madrid',    'septentrional', 'Comunidad de Madrid'),
    (7,  'Barcelona', 'septentrional', 'Cataluña'),
    (8,  'Mallorca',  'septentrional', 'Islas Baleares'),
    (9,  'Huesca',    'septentrional', 'Aragón'),
    (10, 'Guipúzcoa', 'septentrional', 'País Vasco'),
    (11, 'A Coruña',  'septentrional', 'Galicia'),
    (12, 'Asturias',  'septentrional', 'Asturias')
),
-- Los seis formularios del BIBD (deben coincidir con BLOQUES de config.ts).
bloques(version, grabs) as (
  values
    (1, array[1,6,2,7,3,8]),    -- Granada·Madrid·Cádiz·Barcelona·Badajoz·Mallorca
    (2, array[1,9,4,10,5,11]),  -- Granada·Huesca·Murcia·Guipúzcoa·Tenerife·A Coruña
    (3, array[2,12,4,6,5,9]),   -- Cádiz·Asturias·Murcia·Madrid·Tenerife·Huesca
    (4, array[1,7,8,3,10,12]),  -- Granada·Barcelona·Mallorca·Badajoz·Guipúzcoa·Asturias
    (5, array[2,6,11,4,8,10]),  -- Cádiz·Madrid·A Coruña·Murcia·Mallorca·Guipúzcoa
    (6, array[3,7,9,5,11,12])   -- Badajoz·Barcelona·Huesca·Tenerife·A Coruña·Asturias
),

-- ── Un sorteo por participante ──────────────────────────────────────────────
-- Las variables que hay que reutilizar más abajo (el nivel de español decide
-- también la probabilidad de haber visitado España, por ejemplo) se sortean
-- UNA vez por participante y se guardan aquí.
--   · `materialized` es imprescindible: sin él PostgreSQL puede sacar el
--     random() fuera del bucle y dar el MISMO valor a los 180 participantes.
sorteos as materialized (
  select
    i,
    random() as r_gen,
    random() as r_edad,
    random() as r_lm,
    random() as r_niv,
    random() as r_esp
  from generate_series(1, 180) as i
),

-- ── 180 participantes nuevos (prueba021 … prueba200) ────────────────────────
-- El bloque se reparte 1,2,3,4,5,6,1,2,… → 30 participantes por versión. Con
-- los 20 que ya había (4+4+3+3+3+3) el total queda 34,34,33,33,33,33 = 200.
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
    'prueba' || lpad((r.i + 20)::text, 3, '0') || '@ejemplo.test',
    -- Género: 56 % femenino, 40 % masculino, 4 % otro.
    case when r.r_gen < 0.56 then 'Femenino'
         when r.r_gen < 0.96 then 'Masculino'
         else 'Otro' end,
    case when r.r_gen >= 0.96 then 'No binario' else null end,
    -- Edad por tramos, para que el cruce por edad tenga datos en todos ellos.
    (case
       when r.r_edad < 0.03 then 16 + floor(random() * 2)    -- 16-17
       when r.r_edad < 0.40 then 18 + floor(random() * 7)    -- 18-24
       when r.r_edad < 0.70 then 25 + floor(random() * 10)   -- 25-34
       when r.r_edad < 0.85 then 35 + floor(random() * 10)   -- 35-44
       when r.r_edad < 0.94 then 45 + floor(random() * 10)   -- 45-54
       else 55 + floor(random() * 15)                        -- 55-69
     end)::int,
    (array['Tánger','Tetuán','Rabat','Casablanca','Nador','Alhucemas','Fez','Uxda',
           'Larache','Chauen','Kenitra','Agadir'])[(1 + floor(random() * 12))::int],
    (array['Tánger','Tetuán','Rabat','Casablanca','Nador','Granada','Madrid','Málaga',
           'Fez','Uxda'])[(1 + floor(random() * 10))::int],
    -- Lengua materna: texto libre, como en el formulario real. El panel lo
    -- agrupa solo (árabe / amazigh / ambas / francés / español / otra).
    case when r.r_lm < 0.40 then 'Árabe'
         when r.r_lm < 0.58 then 'Amazigh'
         when r.r_lm < 0.80 then 'Árabe y amazigh'
         when r.r_lm < 0.92 then 'Francés'
         when r.r_lm < 0.97 then 'Español'
         else 'Inglés' end,
    jsonb_build_object(
      'Inglés',  (array['Básico','Avanzado','Muy avanzado'])[(1 + floor(random() * 3))::int],
      'Francés', (array['Avanzado','Muy avanzado','Nativo'])[(1 + floor(random() * 3))::int]
    ),
    random() < 0.68,                                                          -- estudia
    case when random() < 0.68
         then (array['Filología Hispánica','Traducción','Turismo','Derecho','Enfermería',
                     'Ingeniería','Económicas'])[(1 + floor(random() * 7))::int]
         else null end,
    random() < 0.46,                                                          -- trabaja
    case when random() < 0.46
         then (array['Profesor de español','Comercio','Hostelería','Administración',
                     'Guía turístico','Autónomo'])[(1 + floor(random() * 6))::int]
         else null end,
    (array['Educación secundaria','Bachillerato','Formación profesional',
           'Licencia/Grado universitario','Licencia/Grado universitario',
           'Máster o posgrado','Doctorado'])[(1 + floor(random() * 7))::int],
    (1 + floor(random() * 12))::int,                                          -- años estudiando español
    (array['Academia','Universidad','Internet','Música','Televisión','Escuela'])
      [1 : (1 + floor(random() * 4))::int],
    null,
    -- Nivel de español, ponderado: casi todos entre B1 y C1.
    case when r.r_niv < 0.04 then 'A1'
         when r.r_niv < 0.12 then 'A2'
         when r.r_niv < 0.32 then 'B1'
         when r.r_niv < 0.58 then 'B2'
         when r.r_niv < 0.78 then 'C1'
         when r.r_niv < 0.90 then 'C2'
         else 'Nativo' end,
    random() < 0.38,                                                          -- familia en España
    case when random() < 0.38
         then (array['Andalucía','Cataluña','Comunidad de Madrid',
                     'Comunidad Valenciana'])[(1 + floor(random() * 4))::int]
         else null end,
    -- Haber visitado España va de la mano del nivel: quien más sabe, más ha ido.
    r.r_esp < (case when r.r_niv < 0.32 then 0.30 when r.r_niv < 0.78 then 0.52 else 0.72 end),
    case when r.r_esp < (case when r.r_niv < 0.32 then 0.30 when r.r_niv < 0.78 then 0.52 else 0.72 end)
         then (array['Menos de 1 mes','1-3 meses','3 meses-1 año','1-3 años',
                     'Más de 3 años'])[(1 + floor(random() * 5))::int]
         else null end,
    case when r.r_esp < (case when r.r_niv < 0.32 then 0.30 when r.r_niv < 0.78 then 0.52 else 0.72 end)
         then (array['Andalucía','Cataluña','Comunidad de Madrid','Comunidad Valenciana',
                     'País Vasco','Galicia'])[(1 + floor(random() * 6))::int]
         else null end,
    (array['Andalucía','Comunidad de Madrid','Cataluña','Comunidad Valenciana',
           'País Vasco','Canarias','Galicia'])[(1 + floor(random() * 7))::int],
    random() < 0.45,                                                          -- ha visitado otros países
    case when random() < 0.45
         then (array['México','Argentina','Colombia','Chile','Cuba',
                     'Perú'])[(1 + floor(random() * 6))::int]
         else null end,
    case when random() < 0.45
         then (array['Menos de 1 mes','1-3 meses','3 meses-1 año'])[(1 + floor(random() * 3))::int]
         else null end,
    ((r.i - 1) % 6) + 1                                                       -- bloque (30 por versión)
  from sorteos as r
  returning id, bloque, genero, edad, nivel_espanol, visitado_espana, lenguas_maternas
),

-- ── Una fila por (participante × grabación de su bloque) ────────────────────
base as (
  select
    n.id as pid, n.genero, n.edad, n.nivel_espanol, n.visitado_espana, n.lenguas_maternas,
    g.numero, g.zona, g.comunidad,
    -- Sesgo personal FIJO (−0,40 … +0,40): hay gente que puntúa alto en todo y
    -- gente que puntúa bajo en todo. Se deriva del id para que sea constante
    -- en las 6 valoraciones de la misma persona.
    ((('x' || lpad(substr(md5(n.id::text), 1, 7), 8, '0'))::bit(32)::int % 81) - 40) / 100.0 as sesgo
  from nuevos n
  join bloques b on b.version = n.bloque
  cross join lateral unnest(b.grabs) as gg(numero)
  join grabaciones g on g.numero = gg.numero
),
calc as (
  select
    base.*,
    -- Sensibilidad a la zona según el nivel de español (motor del cruce 1).
    case nivel_espanol
      when 'A1' then 0.15 when 'A2' then 0.30 when 'B1' then 0.50
      when 'B2' then 0.70 when 'C1' then 0.95 when 'C2' then 1.15
      else 1.35 end as sens,
    -- +1 en las hablas septentrionales, −1 en las meridionales.
    case when zona = 'septentrional' then 1 else -1 end as signo,
    -- ¿Acierta la comunidad autónoma? Andalucía y Madrid se reconocen mucho
    -- más, y acertar es más probable cuanto mayor es el nivel de español.
    random() < (
      (case when comunidad in ('Andalucía', 'Comunidad de Madrid') then 0.42 else 0.16 end)
      + (case nivel_espanol when 'Nativo' then 0.18 when 'C2' then 0.14
                            when 'C1' then 0.10 when 'B2' then 0.06 else 0.0 end)
    ) as acierta
  from base
),
puntos as (
  select
    calc.*,
    -- Valor central de esta valoración (1-5). Todo lo que se quiere medir en
    -- el panel de cruces está aquí dentro, sumado y con ruido encima.
    least(4.8, greatest(1.3,
      3.25                                                          -- media general
      + signo * sens * 0.42                                         -- brecha por nivel de español
      + (case when visitado_espana and zona = 'meridional'    then  0.38 else 0 end)
      + (case when visitado_espana and zona = 'septentrional' then -0.10 else 0 end)
      + signo * greatest(0, edad - 30) * 0.011                      -- brecha por edad
      + (case when zona = 'meridional'
                   and lenguas_maternas in ('Árabe', 'Árabe y amazigh') then 0.22 else 0 end)
      + (case when acierta then 0.28 else 0 end)                    -- premio por acertar
      + sesgo                                                       -- carácter del informante
      + (random() - 0.5) * 0.50                                     -- ruido
    )) as q
  from calc
)

insert into public.valoraciones (
  participante_id, grabacion,
  escala_voz, aspecto_gustado, aspecto_disgustado, proximidad,
  nivel_estudios, nivel_ingresos,
  escala_persona, region_percibida, conoce_personas_region, conoce_personas_region_opinion,
  escala_cultura,
  trato_diferenciado, trato_mujer_diferente, actitud_genero_influye
)
select
  p.pid,
  p.numero,
  -- Escala de la VOZ (11 ítems, 1-5): el valor central de la valoración más
  -- una pizca de ruido por adjetivo.
  (select jsonb_object_agg(k, least(5, greatest(1, (p.q + (random() - 0.5) * 1.7)::int)))
     from unnest(array['agradable','variada','sencilla','cercana','urbana','rapida',
                       'divertida','clara','bonita','profesional','musical']) as k),
  (array['La entonación','La claridad al pronunciar','El ritmo pausado','La cercanía',
         'La musicalidad','La seguridad al hablar', null])[(1 + floor(random() * 7))::int],
  (array['Algunas erres','La velocidad','Ciertas vocales','Que se come letras',
         null, null])[(1 + floor(random() * 6))::int],
  -- Proximidad con la propia pronunciación: sube con la valoración (es la
  -- correlación que mide el cruce «¿cuanto más cercano me suena, mejor lo
  -- valoro?»), y un poco más en las hablas meridionales.
  least(5, greatest(1, (
    1.0 + (p.q - 1.0) * 0.72
    + (case when p.zona = 'meridional' then 0.25 else 0 end)
    + (random() - 0.5) * 1.5
  )::int)),
  -- Nivel de estudios e ingresos percibidos: también suben con la valoración.
  (array['Bajo','Medio','Alto'])[least(3, greatest(1, ((p.q - 1.4) / 1.1)::int))],
  (array['Bajo','Medio','Alto'])[least(3, greatest(1, ((p.q - 1.6) / 1.1)::int))],
  -- Escala de la PERSONA (6 ítems, 1-5)
  (select jsonb_object_agg(k, least(5, greatest(1, (p.q + (random() - 0.5) * 1.7)::int)))
     from unnest(array['inteligente','simpatica','cercana','culta','educada','confiable']) as k),
  -- Región percibida: la real si acierta; si no, cualquier otra comunidad.
  case when p.acierta then p.comunidad
       else (select c
               from unnest(array['Andalucía','Aragón','Asturias','Islas Baleares','Canarias',
                                 'Cantabria','Castilla-La Mancha','Castilla y León','Cataluña',
                                 'Comunidad Valenciana','Extremadura','Galicia','La Rioja',
                                 'Comunidad de Madrid','Región de Murcia','Navarra','País Vasco',
                                 'Ceuta','Melilla']) as c
              where c <> p.comunidad
              offset (floor(random() * 18))::int
              limit 1)
  end,
  random() < 0.45,                                                   -- conoce personas de esa región
  case when random() < 0.45
       then (array['Tengo compañeros de clase de allí y son muy abiertos.',
                   'Conozco a gente de esa zona por el trabajo.',
                   'Un familiar mío vive allí desde hace años.',
                   null])[(1 + floor(random() * 4))::int]
       else null end,
  -- Escala de la CULTURA (6 ítems, 1-5)
  (select jsonb_object_agg(k, least(5, greatest(1, (p.q + (random() - 0.5) * 1.7)::int)))
     from unnest(array['innovadora','divertida','conocida','cercana','rica','interesante']) as k),
  -- Preguntas sobre el género de quien habla: las participantes perciben más
  -- a menudo el trato diferenciado (es el cruce 3 del panel).
  random() < (case p.genero when 'Femenino' then 0.74 when 'Masculino' then 0.46 else 0.60 end),
  random() < (case p.genero when 'Femenino' then 0.70 when 'Masculino' then 0.44 else 0.55 end),
  (array[
    'Creo que el género influye bastante en cómo se percibe la autoridad.',
    'No he notado grandes diferencias por el género de quien habla.',
    'Depende más del tono y la seguridad que del género.',
    'A Mariam se le exige un tono más amable que a Omar.',
    'Con una jefa mujer la conversación habría sido distinta.',
    ''
  ])[(1 + floor(random() * 6))::int]
from puntos p;

-- ── Comprobación ────────────────────────────────────────────────────────────
-- Debe salir: 200 participantes, 1200 valoraciones y 6 bloques con 33-34
-- participantes cada uno.
select
  (select count(*) from public.participantes)                                as participantes,
  (select count(*) from public.valoraciones)                                 as valoraciones,
  (select count(*) from public.participantes
    where email like 'prueba%@ejemplo.test')                                 as de_ejemplo;

select bloque, count(*) as participantes
from public.participantes
group by bloque
order by bloque;

-- Escuchas por grabación (deberían quedar muy parejas: 100 cada una).
select grabacion, count(*) as escuchas
from public.valoraciones
group by grabacion
order by grabacion;
