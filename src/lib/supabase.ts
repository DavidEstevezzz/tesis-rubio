import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error(
    'Falta PUBLIC_SUPABASE_URL. Copia .env.example a .env y rellena las claves de Supabase.'
  );
}

/**
 * Cliente "anon": se usa para el login de administradores (Supabase Auth).
 * Respeta las políticas RLS. No persiste sesión: la gestionamos con cookies.
 */
export const supabaseAnon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Cliente "service_role": SOLO en el servidor. Salta RLS para insertar
 * respuestas del formulario y leer resultados en el panel de administración.
 * Nunca debe llegar al navegador.
 */
export function getServiceClient() {
  if (!serviceKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY. Añádela a tu .env (solo servidor).'
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Lectura de tablas completas (sin toparse con el tope de filas)
 * ─────────────────────────────────────────────────────────────────────────
 *  La API de Supabase NO devuelve una tabla entera: corta la respuesta en un
 *  máximo de filas (el ajuste «Max rows» de Settings → API, que viene en
 *  1 000). No da error: simplemente entrega menos filas de las que hay.
 *
 *  Con 200 participantes el estudio tiene 1 200 valoraciones, así que un
 *  `select('*')` normal se dejaría 200 por el camino y tanto las gráficas
 *  como el CSV saldrían incompletos SIN avisar.
 *
 *  Esta función pide los datos por tandas hasta que la tabla se agota, así
 *  que funciona igual haya tope o no, y aguanta cualquier tamaño futuro.
 *
 *  Uso (ojo: recibe una FUNCIÓN, porque hay que lanzar una consulta nueva
 *  por cada tanda):
 *
 *    const valoraciones = await seleccionarTodo((desde, hasta) =>
 *      supabase.from('valoraciones').select('*').order('id').range(desde, hasta)
 *    );
 *
 *  ⚠️ La consulta debe llevar un `order` por una columna única (p. ej. `id`).
 *     Sin un orden estable, la base de datos puede devolver una fila en dos
 *     tandas distintas y saltarse otra.
 */
const FILAS_POR_TANDA = 1000;
const MAX_TANDAS = 200; // tope de seguridad: 200 000 filas

export async function seleccionarTodo<T = any>(
  consulta: (desde: number, hasta: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> {
  const filas: T[] = [];
  let desde = 0;

  for (let tanda = 0; tanda < MAX_TANDAS; tanda++) {
    const { data, error } = await consulta(desde, desde + FILAS_POR_TANDA - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    filas.push(...data);
    // Avanzamos según lo REALMENTE recibido, no según lo pedido: si el tope
    // del proyecto fuera menor que la tanda, seguiríamos leyendo igual.
    desde += data.length;
  }

  return filas;
}
