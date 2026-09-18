-- ═══════════════════════════════════════════════════════════════════════════
--  LIMPIEZA DE DATOS · Estudio Sociolingüístico (verbal-guise)
--
--  Uso:  Supabase → SQL Editor → pega SOLO el paso que quieras → Run.
--        Ejecuta siempre antes el PASO 0 para ver qué hay en la base.
--
--  ⚠️  Los borrados NO se pueden deshacer. Si te interesa conservar lo que
--      hay, entra antes en /admin y pulsa «Exportar CSV».
--
--  Las valoraciones se borran solas al borrar al participante
--  (participante_id … on delete cascade), así que nunca hace falta tocar
--  public.valoraciones a mano.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── PASO 0 · ¿Qué hay ahora mismo en la base? ──────────────────────────────
-- Separa lo que generó seed_prueba.sql (correos prueba01@ejemplo.test…) de
-- todo lo demás. Ejecútalo antes y después de borrar para comprobarlo.
select
  count(*) filter (where email like 'prueba%@ejemplo.test')       as participantes_de_ejemplo,
  count(*) filter (where email not like 'prueba%@ejemplo.test')   as participantes_reales,
  count(*)                                                        as participantes_total,
  (select count(*) from public.valoraciones)                      as valoraciones_total
from public.participantes;

-- Listado de los correos que NO son del seed, por si alguno es una prueba
-- tuya que también quieras borrar (ver PASO 2).
select email, bloque, created_at
from public.participantes
where email not like 'prueba%@ejemplo.test'
order by created_at;


-- ── PASO 1 · Borrar los datos de ejemplo del seed ──────────────────────────
-- Esto es lo que genera supabase/seed_prueba.sql: 24 participantes ficticios
-- y sus 144 valoraciones. Las respuestas reales NO se tocan.
delete from public.participantes
where email like 'prueba%@ejemplo.test';


-- ── PASO 2 · (Opcional) Borrar tus propias pruebas ─────────────────────────
-- Las respuestas que hayas enviado tú mismo probando el formulario no llevan
-- ninguna marca: hay que señalarlas por correo. Descomenta y pon los tuyos.
--
-- delete from public.participantes
-- where email in (
--   'tucorreo@ejemplo.com',
--   'otraprueba@ejemplo.com'
-- );
--
-- Variante por fecha: borra todo lo enviado antes del día en que abriste el
-- estudio a los participantes (ajusta la fecha).
--
-- delete from public.participantes
-- where created_at < timestamptz '2026-01-01 00:00:00+00';


-- ── PASO 3 · (Opcional) Dejar la base COMPLETAMENTE a cero ─────────────────
-- ⚠️  BORRA TODAS LAS RESPUESTAS, también las reales. Pensado para el momento
--     de publicar el estudio: base vacía y el reparto de formularios (BIBD)
--     empezando de nuevo desde cero.
--     Descomenta la línea solo si es justo lo que quieres.
--
-- truncate table public.valoraciones, public.participantes;


-- ── PASO 4 · Comprobación ──────────────────────────────────────────────────
-- Debe quedar 0 participantes de ejemplo. Si además ves 0 valoraciones
-- huérfanas, la limpieza ha ido bien.
select
  count(*) filter (where email like 'prueba%@ejemplo.test')  as participantes_de_ejemplo,
  count(*)                                                    as participantes_total,
  (select count(*) from public.valoraciones)                  as valoraciones_total,
  (select count(*) from public.valoraciones v
     where not exists (select 1 from public.participantes p where p.id = v.participante_id))
                                                              as valoraciones_huerfanas
from public.participantes;

-- ═══════════════════════════════════════════════════════════════════════════
