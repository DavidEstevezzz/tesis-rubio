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
