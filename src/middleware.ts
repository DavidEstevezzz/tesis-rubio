import { defineMiddleware } from 'astro:middleware';
import { supabaseAnon } from '@/lib/supabase';

const ACCESS_COOKIE = 'sb-access-token';
const REFRESH_COOKIE = 'sb-refresh-token';

/**
 * Protege /admin/* (salvo el login). Valida el token de Supabase guardado en
 * cookies httpOnly; si es válido, deja pasar y expone el usuario en locals.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdmin = pathname.startsWith('/admin');
  const isExport = pathname.startsWith('/api/export');
  const isLogin = pathname === '/admin/login';
  const isAuthApi = pathname.startsWith('/api/auth');

  if (!isAdmin && !isExport) return next();
  if (isLogin || isAuthApi) return next();

  const accessToken = context.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = context.cookies.get(REFRESH_COOKIE)?.value;

  if (accessToken) {
    const { data, error } = await supabaseAnon.auth.getUser(accessToken);
    if (!error && data.user) {
      context.locals.user = { id: data.user.id, email: data.user.email ?? '' };
      return next();
    }
  }

  // Intentar refrescar la sesión con el refresh token
  if (refreshToken) {
    const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token: refreshToken });
    if (!error && data.session && data.user) {
      const secure = context.url.protocol === 'https:';
      context.cookies.set(ACCESS_COOKIE, data.session.access_token, {
        httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: data.session.expires_in,
      });
      context.cookies.set(REFRESH_COOKIE, data.session.refresh_token, {
        httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
      });
      context.locals.user = { id: data.user.id, email: data.user.email ?? '' };
      return next();
    }
  }

  return context.redirect('/admin/login');
});
