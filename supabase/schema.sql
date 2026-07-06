-- ═══════════════════════════════════════════════════════════════════════════
--  ESQUEMA DE BASE DE DATOS · Estudio Sociolingüístico (verbal-guise)
--  Pega este script completo en Supabase → SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Tabla de participantes ──────────────────────────────────────────────────
-- Una fila por persona. El EMAIL es único: impide que alguien vote dos veces.
create table if not exists public.participantes (
  id                          uuid primary key default gen_random_uuid(),
  email                       text not null unique,

  -- Datos personales
  genero                      text,
  genero_otro                 text,
  edad                        int,
  ciudad_nacimiento           text,
  ciudad_residencia           text,
  lenguas_maternas            text,
  otros_idiomas               jsonb default '{}'::jsonb,  -- { "Inglés": "Avanzado", ... }
  estudia                     boolean,
  que_estudias                text,      -- si estudia = true
  trabaja                     boolean,
  cual_trabajo                text,      -- si trabaja = true
  nivel_educativo             text,
  anios_estudio_espanol       int,
  metodos_estudio             text[] default '{}',
  metodos_ejemplos            text,
  nivel_espanol               text,
  familia_espana              boolean,
  familia_espana_zonas        text,      -- si familia_espana = true
  visitado_espana             boolean,
  visitado_espana_tiempo      text,      -- tiempo de estancia (frecuencia habitual)
  visitado_espana_zonas       text,      -- zonas visitadas en España
  mejor_region_opinion        text,
  visitado_otros_paises       boolean,
  visitado_otros_paises_cuales text,     -- qué país(es) hispanohablante(s)
  visitado_otros_paises_tiempo text,     -- tiempo de estancia (frecuencia habitual)

  -- Preguntas globales sobre el género de quien habla (una vez, al final)
  trato_diferenciado          boolean,   -- ¿trato diferenciado entre Mariam y Omar?
  trato_mujer_diferente       boolean,   -- ¿habría sido diferente con una jefa mujer?
  actitud_genero_influye      text,      -- desarrollo libre

  created_at                  timestamptz not null default now()
);

-- ── Tabla de valoraciones (una por grabación evaluada) ──────────────────────
create table if not exists public.valoraciones (
  id                     uuid primary key default gen_random_uuid(),
  participante_id        uuid not null references public.participantes(id) on delete cascade,
  grabacion              int not null,

  -- Diferencial semántico de la VOZ/pronunciación (11 ítems, 1-5) en jsonb:
  --   { "agradable": 4, "variada": 3, ... }
  escala_voz             jsonb not null default '{}'::jsonb,

  aspecto_gustado        text,
  aspecto_disgustado     text,
  proximidad             int,     -- 1 (totalmente diferente) … 5 (idéntica)

  -- Percepción socioeconómica
  puesto_trabajo         text,    -- Poco / Bien / Altamente cualificado
  nivel_ingresos         text,    -- Bajo / Medio / Alto
  nivel_estudios         text,    -- Sin estudios / Primarios / Secundarios / Universitarios

  -- Diferencial semántico de la PERSONA (6 ítems, 1-5)
  escala_persona         jsonb not null default '{}'::jsonb,

  region_percibida       text,    -- comunidad autónoma
  conoce_personas_region boolean,
  conoce_personas_region_opinion text,  -- opinión si conoce personas de la región

  -- Diferencial semántico de la CULTURA (6 ítems, 1-5)
  escala_cultura         jsonb not null default '{}'::jsonb,

  created_at             timestamptz not null default now(),

  unique (participante_id, grabacion)
);

create index if not exists idx_valoraciones_participante on public.valoraciones(participante_id);
create index if not exists idx_valoraciones_grabacion on public.valoraciones(grabacion);

-- ── Migración de columnas añadidas (seguro re-ejecutar en una BD existente) ──
-- Si ya creaste las tablas antes de estos campos, este bloque las añade sin
-- borrar nada. Si es una instalación nueva, no hace falta (ya están arriba).
alter table public.participantes add column if not exists que_estudias                 text;
alter table public.participantes add column if not exists cual_trabajo                 text;
alter table public.participantes add column if not exists familia_espana_zonas         text;
alter table public.participantes add column if not exists visitado_espana_tiempo       text;
alter table public.participantes add column if not exists visitado_espana_zonas        text;
alter table public.participantes add column if not exists visitado_otros_paises_cuales text;
alter table public.participantes add column if not exists visitado_otros_paises_tiempo text;
alter table public.valoraciones  add column if not exists conoce_personas_region_opinion text;

-- ═══════════════════════════════════════════════════════════════════════════
--  SEGURIDAD (Row Level Security)
--  · El servidor usa la clave service_role, que IGNORA estas políticas, así
--    que las inserciones del formulario y las lecturas del panel funcionan.
--  · Estas políticas garantizan que NADIE con la clave pública (anon) pueda
--    leer las respuestas. Solo usuarios autenticados (administradores) leen.
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.participantes enable row level security;
alter table public.valoraciones  enable row level security;

-- Lectura solo para usuarios autenticados (los administradores que creéis).
drop policy if exists "admin lee participantes" on public.participantes;
create policy "admin lee participantes"
  on public.participantes for select
  to authenticated using (true);

drop policy if exists "admin lee valoraciones" on public.valoraciones;
create policy "admin lee valoraciones"
  on public.valoraciones for select
  to authenticated using (true);

-- Nota: no creamos políticas de INSERT para 'anon' a propósito. Las respuestas
-- del formulario entran por el servidor con la clave service_role, que no está
-- sujeta a RLS. Así el email-como-clave-única y la validación quedan del lado
-- del servidor y nadie puede insertar basura con la clave pública.

-- ── Vista aplanada para exportar / analizar fácilmente ──────────────────────
-- Expande los jsonb a columnas. Útil para exportar a CSV o consultar en el
-- editor SQL. (La app también ofrece exportación CSV desde el panel.)
create or replace view public.valoraciones_plano as
select
  v.id,
  p.email,
  v.grabacion,
  (v.escala_voz->>'agradable')::int    as voz_agradable,
  (v.escala_voz->>'variada')::int      as voz_variada,
  (v.escala_voz->>'sencilla')::int     as voz_sencilla,
  (v.escala_voz->>'cercana')::int      as voz_cercana,
  (v.escala_voz->>'urbana')::int       as voz_urbana,
  (v.escala_voz->>'rapida')::int       as voz_rapida,
  (v.escala_voz->>'divertida')::int    as voz_divertida,
  (v.escala_voz->>'clara')::int        as voz_clara,
  (v.escala_voz->>'bonita')::int       as voz_bonita,
  (v.escala_voz->>'profesional')::int  as voz_profesional,
  (v.escala_voz->>'musical')::int      as voz_musical,
  v.proximidad,
  v.puesto_trabajo,
  v.nivel_ingresos,
  v.nivel_estudios,
  v.region_percibida,
  v.conoce_personas_region,
  v.created_at
from public.valoraciones v
join public.participantes p on p.id = v.participante_id;
