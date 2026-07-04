# Estudio Sociolingüístico · Formulario + Panel de resultados

Aplicación web (Astro + Supabase) para un estudio de **actitudes lingüísticas
tipo _verbal-guise_**: los participantes escuchan varias grabaciones y las
valoran mediante escalas de diferencial semántico. Las respuestas se guardan en
Supabase y hay un panel privado con estadísticas, gráficas y exportación a CSV.

## ✨ Qué incluye

- **Formulario público** (`/formulario`) por pasos, con barra de progreso,
  validación y un diseño moderno pensado para minimizar abandonos.
- **Diferencial semántico** exactamente como se pidió:
  `adjetivo negativo (1) — ◯ ◯ ◯ ◯ ◯ — adjetivo positivo (5)`.
- **Anti-duplicados**: el correo electrónico es la clave única; una persona no
  puede responder dos veces.
- **Panel de administración** (`/admin`) protegido por login (Supabase Auth) con:
  - KPIs (participantes, valoraciones, edad media, proximidad media).
  - Gráficas: ranking de grabaciones, perfiles de voz/persona/cultura,
    percepción socioeconómica, región percibida, demografía y preguntas de género.
  - Tabla de respuestas y ficha detallada por participante.
  - **Exportación a CSV** (aplanado, listo para Excel/R/SPSS).
- **Todo configurable** desde un único archivo: `src/lib/config.ts`.

## 🚀 Puesta en marcha

### 1. Crear el proyecto de Supabase

1. Entra en [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. Ve a **SQL Editor**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql)
   y pulsa **Run**. Esto crea las tablas, la seguridad (RLS) y una vista de análisis.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key
   - `service_role` key (¡secreta!)

### 2. Crear los usuarios administradores

En Supabase → **Authentication → Users → Add user**, crea una cuenta (correo +
contraseña) para cada investigador que deba ver los resultados. Con esas
credenciales se accede a `/admin`.

> Sugerencia: en **Authentication → Providers → Email**, desactiva
> "Enable sign-ups" para que nadie pueda registrarse por su cuenta.

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Rellena `.env` con los valores del paso 1:

```
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4. Instalar y arrancar

```bash
npm install
npm run dev      # desarrollo → http://localhost:4321
npm run build    # compilar para producción
npm run preview  # previsualizar la build
```

## 🎧 Añadir las grabaciones

Abre `src/lib/config.ts` y edita el array `GRABACIONES`. Para cada una indica su
`url`. Admite dos formatos:

```ts
// MP3 alojado (p. ej. en Supabase Storage, ver abajo)
{ numero: 1, titulo: 'Grabación 1', tipo: 'audio', url: 'https://.../muestra1.mp3' }

// Pista de SoundCloud
{ numero: 1, titulo: 'Grabación 1', tipo: 'soundcloud', url: 'https://soundcloud.com/usuario/pista' }
```

**Opción recomendada — Supabase Storage:** en Supabase crea un bucket público
`grabaciones`, sube los MP3 y pega la URL pública de cada archivo en la config.

El número de grabaciones se controla con `NUM_GRABACIONES` (por defecto 12). Si
lo cambias, el formulario, la base de datos de respuestas y las estadísticas se
adaptan automáticamente.

## 🛠️ Personalizar el formulario

Todo vive en `src/lib/config.ts`: adjetivos de las escalas, géneros, niveles
educativos, métodos de estudio, comunidades autónomas, etc. Cambia ahí y el
resto de la app se actualiza sola.

## 🌐 Despliegue en Vercel

El proyecto usa el adaptador `@astrojs/vercel` (SSR). Pasos (ya con cuenta):

1. Sube el repositorio a GitHub (si no lo está ya).
2. En [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repo.
3. Vercel detecta Astro solo. No cambies el _framework preset_ ni los comandos.
4. En **Environment Variables** añade las 3 claves (mismos nombres que en `.env`):
   `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. **Deploy**. Cada `git push` vuelve a desplegar automáticamente.

> ¿Prefieres un host con Node (Railway, Render, un VPS)? Cambia el adaptador a
> `@astrojs/node` en `astro.config.mjs` y arranca con `node ./dist/server/entry.mjs`.

## 🔐 Notas de seguridad

- La clave `service_role` **solo** se usa en el servidor; nunca llega al
  navegador ni se sube al repositorio (`.env` está en `.gitignore`).
- Las respuestas se insertan desde el servidor y las tablas tienen RLS: con la
  clave pública `anon` **no** se pueden leer los datos. Solo los administradores
  autenticados acceden al panel.

## 📁 Estructura

```
src/
  lib/
    config.ts        ← configuración del estudio (fuente única de verdad)
    supabase.ts      ← clientes de Supabase
    stats.ts         ← cálculo de estadísticas
  components/        ← reproductor, diferencial semántico, paso de grabación, nav
  layouts/Layout.astro
  pages/
    index.astro          ← landing
    formulario.astro     ← formulario por pasos
    gracias.astro
    admin/               ← panel protegido (resumen, respuestas, detalle)
    api/                 ← submit, export CSV, login/logout
  middleware.ts      ← protege /admin y /api/export
supabase/schema.sql  ← esquema de la base de datos
```
