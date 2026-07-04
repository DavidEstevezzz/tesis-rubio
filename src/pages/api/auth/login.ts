import type { APIRoute } from 'astro';
import { supabaseAnon } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Petición no válida.' }, 400);
  }

  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  if (!email || !password) return json({ error: 'Introduce correo y contraseña.' }, 400);

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return json({ error: 'Credenciales incorrectas.' }, 401);
  }

  const secure = url.protocol === 'https:';
  cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: data.session.expires_in,
  });
  cookies.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
  });

  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
