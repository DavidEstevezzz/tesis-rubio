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

Las 12 hablas del estudio están declaradas en el `CATALOGO` de
`src/lib/config.ts`, cada una con su **ciudad**, su **zona dialectal**
(`meridional` / `septentrional`) y el **nombre de archivo** en el bucket:

| # | Ciudad | Zona | Archivo |
| - | ------ | ---- | ------- |
| 1 | Granada | meridional | `granada.ogg` |
| 2 | Cádiz | meridional | `cadiz.ogg` |
| 3 | Badajoz | meridional | `badajoz.ogg` |
| 4 | Murcia | meridional | `murcia.ogg` |
| 5 | Tenerife | meridional | `tenerife.ogg` |
| 6 | Madrid | septentrional | `madrid.ogg` |
| 7 | Barcelona | septentrional | `barcelona.ogg` |
| 8 | Mallorca | septentrional | `mallorca.ogg` |
| 9 | Huesca | septentrional | `huesca.ogg` |
| 10 | Guipúzcoa | septentrional | `guipuzcoa.ogg` |
| 11 | A Coruña | septentrional | `acoruna.ogg` |
| 12 | Asturias | septentrional | `asturias.ogg` |

Es decir: **la ciudad en minúscula, sin acentos ni espacios**, con extensión
`.ogg`. Sube los 12 archivos con esos nombres exactos al bucket público
`grabaciones` de Supabase Storage y funcionarán sin tocar nada más.

> ⚠️ La ciudad es un dato **solo para el investigador**: el participante nunca la
> ve (el estudio es a ciegas). En el formulario cada audio se rotula
> «Grabación 1», «Grabación 2»… según su posición. La ciudad sí aparece en
> `/admin` y en el CSV exportado.

Si prefieres otros nombres, formatos o URLs externas, edita `CATALOGO` (o
`GRABACIONES`) en `src/lib/config.ts`. Cada grabación admite:

```ts
// Audio alojado (p. ej. en Supabase Storage). Admite .ogg/.opus, .mp3, .m4a, .wav
{ ciudad: 'Granada', archivo: 'granada', zona: 'meridional' }

// Audio de reserva para navegadores antiguos: descomenta `urlFallback` en GRABACIONES
// (p. ej. granada.m4a junto a granada.ogg).

// Pista de SoundCloud: cambia `tipo` a 'soundcloud' y `url` a la pista pública.
```

**Formatos de audio.** El reproductor usa el elemento `<audio>` nativo, que
admite **OGG/Opus** (el formato de los audios de WhatsApp), MP3, M4A/AAC y WAV.

> 💡 Sube los **OGG originales sin convertir**: convertirlos a MP3 recodifica un
> audio ya comprimido y puede introducir cortes y pérdida de calidad. OGG/Opus se
> reproduce en Chrome, Edge, Firefox y Android. Safari/iPhone solo lo admite en
> versiones recientes (Safari 17+); si necesitas cubrir iPhones antiguos, añade
> además un `.m4a` (AAC) en `urlFallback`.

**Opción recomendada — Supabase Storage:** en Supabase crea un bucket público
`grabaciones`, sube los audios (`.ogg` vale) y pega la URL pública de cada uno.
Al subir, comprueba que el _content-type_ sea `audio/ogg` (Supabase lo suele
inferir por la extensión).

El número total de grabaciones (`NUM_GRABACIONES`) se deduce del `CATALOGO`. Si
añades o quitas hablas, el formulario, la base de datos de respuestas y las
estadísticas se adaptan automáticamente.

## 🎛️ Diseño de bloques incompletos balanceados (BIBD)

El formulario con las 12 grabaciones duraba ~40 min y el cansancio arruinaba las
respuestas. Para no suprimir ninguna grabación, **cada informante evalúa solo 6**
según seis formularios fijos (`DEFINICION_BLOQUES` en `src/lib/config.ts`):

| Formulario | Meridionales | Septentrionales |
| ---------- | ------------ | --------------- |
| **F1** | Granada, Cádiz, Badajoz | Madrid, Barcelona, Mallorca |
| **F2** | Granada, Murcia, Tenerife | Huesca, Guipúzcoa, A Coruña |
| **F3** | Cádiz, Murcia, Tenerife | Asturias, Madrid, Huesca |
| **F4** | Granada, Badajoz | Barcelona, Mallorca, Guipúzcoa, Asturias |
| **F5** | Cádiz, Murcia | Madrid, A Coruña, Mallorca, Guipúzcoa |
| **F6** | Badajoz, Tenerife | Barcelona, Huesca, A Coruña, Asturias |

Dentro de cada formulario las hablas se presentan **alternando zonas**
(meridional → septentrional → meridional → …), así que el orden real es:

```
F1  Granada → Madrid → Cádiz → Barcelona → Badajoz → Mallorca
F2  Granada → Huesca → Murcia → Guipúzcoa → Tenerife → A Coruña
F3  Cádiz → Asturias → Murcia → Madrid → Tenerife → Huesca
F4  Granada → Barcelona → Mallorca → Badajoz → Guipúzcoa → Asturias
F5  Cádiz → Madrid → A Coruña → Murcia → Mallorca → Guipúzcoa
F6  Badajoz → Barcelona → Huesca → Tenerife → A Coruña → Asturias
```

**Por qué queda equilibrado.** Cada una de las 12 grabaciones aparece en
**exactamente 3 de los 6 formularios** (`REPLICAS_POR_GRABACION`). Al cargar
`/formulario` se asigna al participante la versión con **menos participantes
completados** hasta ese momento (empates → al azar), así que las seis versiones
se llenan a la par y, con ellas, todas las grabaciones reciben el mismo número de
escuchas:

| Participantes | Por versión | Escuchas por audio |
| ------------- | ----------- | ------------------ |
| 12 | 2 cada una | 6 (brecha 0) |
| 20 | 3-4 | 9-11 |
| 30 | 5 cada una | 15 (brecha 0) |

El reparto se autocorrige ante ráfagas o abandonos (solo cuentan los formularios
enviados). Los múltiplos de 6 dan un equilibrio perfecto.

Otras opciones:

- **`BIBD_ACTIVO`**: ponlo a `false` para volver a un único formulario con las 12
  grabaciones (también con zonas alternadas).
- **`?bloque=N`** previsualiza una versión concreta (p. ej. `/formulario?bloque=3`).
- El panel `/admin` muestra el reparto por versión, las escuchas de cada audio
  con su ciudad y un aviso si el diseño deja de estar equilibrado.

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
