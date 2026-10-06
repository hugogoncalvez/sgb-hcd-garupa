# SGB-HCD-GARUPA — Guía del Proyecto

## Qué es
Sistema de gestión bibliotecaria del Concejo Deliberante de Garupá ("SGB") para administrar catálogo (libros), socios y préstamos/devoluciones, con reportes y una consulta pública de catálogo. Panel admin protegido por login. Antes se llamaba "BiblioGarupa".

## Branding y tema
- Nombre visible: **SGB** (brand = celeste HCD `#00A8E8`, tema claro `#F8F9FA`, oscuro `#1B2430`). Verde `emerald` = éxito, rojo `rose` = alertas.
- El primario se sobreescribe en `tailwind.config.ts` (palette `indigo` → celeste), así los estilos existentes no cambian.

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **tRPC v11** + **TanStack Query 5** (API end-to-end tipada)
- **Prisma 5** + **PostgreSQL** (Supabase-style: `DATABASE_URL` con pgbouncer + `DIRECT_URL`)
- **NextAuth v4** (credentials provider, sesión JWT 8h) con bcryptjs
- **Tailwind CSS 3**, next-themes (modo oscuro), sonner (toasts), chart.js + react-chartjs-2, lucide-react
- **zod** para validación de inputs
- Package manager: **pnpm** (`pnpm dev`, `pnpm build`, `pnpm lint`); `postinstall` corre `prisma generate`
- Path alias: `@/*` → `./src/*`

## Estructura
```
prisma/
  schema.prisma      # modelos: Usuario, Socio, Libro, Ejemplar, Prestamo
  seed.ts            # crea usuarios admin (bcrypt)
  migrations/
src/
  middleware.ts      # next-auth: protege todo excepto consulta-publica, login, api/auth, api/trpc, api/debug, assets
  lib/prisma.ts      # singleton PrismaClient
  server/
    root.ts          # appRouter: libros, socios, circulacion, reportes
    context.ts       # ctx = { prisma, headers }
    trpc.ts          # initTRPC + superjson
    routers/         # libros.ts, socios.ts, circulacion.ts, reportes.ts
  utils/trpc.ts      # createTRPCReact<AppRouter>
  app/
    layout.tsx / providers.tsx / _trpc/Provider.tsx
    page.tsx         # dashboard (métricas, vencimientos, acciones)
    login/page.tsx
    consulta-publica/page.tsx   # catálogo público sin auth
    catalogo/ (page, nuevo, [id])
    socios/ (page, nuevo, [id])
    prestamos/page.tsx
    reportes/page.tsx
    api/trpc/[trpc]/route.ts
    api/auth/[...nextauth]/route.ts  # authOptions exportadas aquí
    api/debug/route.ts               # health-check de DB (no protegido)
  components/layout/ (MainLayout, Sidebar, TopBar), ui/Button.tsx
```

## Modelo de datos (prisma/schema.prisma)
- **Usuario**: username único, password (hash bcrypt), nombre, nombreCompleto, rol (default ADMIN).
- **Socio**: nombre, apellido, dni único, telefono, email único, direccion, estado (ACTIVO/SUSPENDIDO), prestamos.
- **Libro**: campos MARC 21 (isbn, idioma, clasificacion CDU, autor, autorInstitucional, titulo, edicion, lugarPublicacion, editorial, anioPublicacion, descripcionFisica, notaGeneral, temas, descriptores, colaboradores, bibliotecario, volumen) + extras (portadaUrl, datosMarc JSON, cantidadEjemplares default 1). Campos `inventario/tipoMaterial/ubicacion/cantidadEjemplares` marcados como **deprecados** (usar Ejemplar).
- **Ejemplar**: codigoInterno (único por libro), tipoMaterial, ubicacion, codigoEstante, estado (DISPONIBLE/PRESTADO/MANTENIMIENTO), libroId (cascade delete).
- **Prestamo**: socioId, libroId, fechaSalida, fechaDevolucionPrevista, fechaDevolucionReal, estado (PRESTADO/DEVUELTO).

## Routers tRPC
- **libros**: getAll (search/genero/paginación, cuenta ejemplares y préstamos activos), getById, create (con createMany de ejemplares), update, delete, deleteEjemplares, addEjemplares, buscar, y lookups externos: searchExternalByTitle, getByExternalId, getByIsbnExternal (Google Books → Open Library → WorldCat Classify como fallbacks, con `translateSubjects` ES).
- **socios**: getAll (search), getById (con préstamos+libro), create, update, delete.
- **circulacion**: getMetrics (totalLibros, sociosActivos, prestamosActivos, prestamosVencidos), getAll (filtros estado/vencidos/search/paginación), getVencidos, registrarPrestamo (diasPrestamo default 7), getProximosVencer (3 días), renovarPrestamo (diasExtra default 7), registrarDevolucion.
- **reportes**: getAll (agregados: préstamos por mes, libros más prestados, socios más activos, vencidos, inventario por ubicación/tipo, nuevos socios por mes, catálogo por año/editorial/idioma, activos vs devueltos).

## Flujos clave
- **Auth**: login credentials → JWT (8h) → middleware protege rutas; `MainLayout` redirige a /login si no hay sesión. Rutas públicas: `/consulta-publica`, `/login`, `/api/*`.
- **Alta de libro**: desde `/catalogo/nuevo` se puede buscar en Google Books/Open Library por título o ISBN para autocompletar campos MARC, crear ejemplares, y guardar vía `libros.create`.
- **Préstamo**: `/prestamos` registra préstamo (socio + libro + días), devuelve o renueva; el vencimiento se calcula contra `fechaDevolucionPrevista`.
- **Consulta pública**: `/consulta-publica` usa los mismos queries de libros sin sesión.

## Convenciones y notas
- Idioma de UI y dominio: **español** (gestión rioplatense: "préstamo", "socio").
- Todos los procedures usan `publicProcedure` aunque la app esté cubierta por middleware; no hay procedimientos protegidos a nivel tRPC.
- Fechas: usar `Date`; superjson serializa Dates entre cliente y servidor.
- Dark mode por clase (`next-themes`), estilos con Tailwind + `dark:`.
- `.env`: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_BOOKS_API_KEY`, `KEEP_ALIVE_KEY`.

## Keep-alive (Supabase free)
Supabase pausa el proyecto tras ~7 días sin uso. Para evitarlo existe `GET /api/keep-alive` (`src/app/api/keep-alive/route.ts`) que hace `SELECT 1`; exige `?key=$KEEP_ALIVE_KEY` y está excluido del auth en `src/middleware.ts`. Configurar en cron-job.org: `https://<dominio>/api/keep-alive?key=<KEEP_ALIVE_KEY>` cada 12–24 h. Generar clave: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- Seed: `pnpm prisma db seed` (o `npx ts-node prisma/seed.ts`) — usuarios admin con passwords en texto plano dentro del script (solo para desarrollo).
- No hay tests configurados; verificación típica: `pnpm dev` / `pnpm build` y `pnpm lint`.

## Skills locales (.agents/skills)
- `supabase` y `supabase-postgres-best-practices` — cargadas en el repo; usarlas al tocar base de datos/migraciones/Supabase.

## Deploy (Vercel)
- Repo: https://github.com/hugogoncalvez/sgb-hcd-garupa.git — prod: https://sgb-hcd-garupa.vercel.app
- Env vars en Vercel **sin comillas**: `DATABASE_URL` = Session pooler Supabase (puerto 5432, usuario `postgres.<ref>`), `DIRECT_URL` = directa (5432), `NEXTAUTH_URL` = URL prod, `NEXTAUTH_SECRET`, `GOOGLE_BOOKS_API_KEY`, `KEEP_ALIVE_KEY`.
- Verificación: `/api/debug` (DB + usuarios). Pendiente: proteger o eliminar `/api/debug` (público).
- Cron keep-alive: GitHub Action `.github/workflows/keep-alive.yml` (`0 8 */2 * *`) → /api/keep-alive con secret `KEEP_ALIVE_KEY`. Manual: Actions → keep-alive → Run workflow.

## Incidentes
- 2026-10-05: 500 intermitentes en tRPC circulacion en Vercel por agotamiento de conexiones (EMAXCONNSESSION, pool session 15). Fix: `DATABASE_URL` al Transaction pooler (6543) con `?pgbouncer=true`.

## Terminología UI (para no confundir)
- **Modal de detalle**: vista rápida de solo lectura al hacer clic en una fila del catálogo.
- **Edición del libro** (`/catalogo/[id]`, se llega con el lápiz ✏️ o el ojito 👁): página completa con Editar, Eliminar y gestión de ejemplares.
