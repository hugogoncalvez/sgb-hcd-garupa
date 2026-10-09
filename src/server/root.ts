import { router } from './trpc';
import { librosRouter } from './routers/libros';
import { sociosRouter } from './routers/socios';
import { circulacionRouter } from './routers/circulacion';
import { reportesRouter } from './routers/reportes';
import { usuariosRouter } from './routers/usuarios';

export const appRouter = router({
  libros: librosRouter,
  socios: sociosRouter,
  circulacion: circulacionRouter,
  reportes: reportesRouter,
  usuarios: usuariosRouter,
});

export type AppRouter = typeof appRouter;
