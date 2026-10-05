import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const reportesRouter = router({
  getAll: publicProcedure
    .input(z.object({
      fechaDesde: z.string().optional(),
      fechaHasta: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const doceMesesAtras = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      const fechaDesde = input?.fechaDesde ? new Date(input.fechaDesde) : doceMesesAtras;
      const fechaHasta = input?.fechaHasta ? new Date(input.fechaHasta) : now;

      const [
        prestamos,
        prestamosVencidos,
        libros,
        sociosList,
        prestamosCount,
      ] = await Promise.all([
        ctx.prisma.prestamo.findMany({
          where: {
            fechaSalida: { gte: fechaDesde, lte: fechaHasta },
          },
          include: {
            socio: { select: { id: true, nombre: true, apellido: true } },
            libro: { select: { id: true, titulo: true, autor: true } },
          },
        }),
        ctx.prisma.prestamo.findMany({
          where: {
            estado: 'PRESTADO',
            fechaDevolucionPrevista: { lt: now },
          },
          include: {
            socio: { select: { id: true, nombre: true, apellido: true } },
            libro: { select: { id: true, titulo: true, autor: true } },
          },
          orderBy: { fechaDevolucionPrevista: 'asc' },
        }),
        ctx.prisma.libro.findMany({
          select: {
            id: true,
            titulo: true,
            autor: true,
            ubicacion: true,
            tipoMaterial: true,
            anioPublicacion: true,
            editorial: true,
            idioma: true,
            cantidadEjemplares: true,
          },
        }),
        ctx.prisma.socio.findMany({
          select: {
            id: true,
            nombre: true,
            apellido: true,
            createdAt: true,
          },
        }),
        ctx.prisma.prestamo.groupBy({
          by: ['estado'],
          _count: true,
        }),
      ]);

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      const prestamosPorMes: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${meses[d.getMonth()]} ${d.getFullYear()}`;
        prestamosPorMes[key] = 0;
      }
      for (const p of prestamos) {
        const d = p.fechaSalida;
        const key = `${meses[d.getMonth()]} ${d.getFullYear()}`;
        if (prestamosPorMes[key] !== undefined) {
          prestamosPorMes[key]++;
        }
      }
      const prestamosPorPeriodo = Object.entries(prestamosPorMes)
        .map(([periodo, cantidad]) => ({ periodo, cantidad }))
        .reverse();

      const libroPrestamoCount: Record<string, { titulo: string; autor: string | null; total: number }> = {};
      for (const p of prestamos) {
        const id = p.libro.id;
        if (!libroPrestamoCount[id]) {
          libroPrestamoCount[id] = { titulo: p.libro.titulo ?? 'Sin título', autor: p.libro.autor, total: 0 };
        }
        libroPrestamoCount[id].total++;
      }
      const librosMasPrestados = Object.entries(libroPrestamoCount)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      const socioPrestamoCount: Record<string, { nombre: string; apellido: string; total: number }> = {};
      for (const p of prestamos) {
        const id = p.socio.id;
        if (!socioPrestamoCount[id]) {
          socioPrestamoCount[id] = { nombre: p.socio.nombre, apellido: p.socio.apellido, total: 0 };
        }
        socioPrestamoCount[id].total++;
      }
      const sociosMasActivos = Object.entries(socioPrestamoCount)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      const overdueList = prestamosVencidos.map((p) => ({
        id: p.id,
        socio: `${p.socio.nombre} ${p.socio.apellido}`,
        libro: p.libro.titulo ?? 'Sin título',
        fechaSalida: p.fechaSalida.toISOString(),
        fechaVencimiento: p.fechaDevolucionPrevista.toISOString(),
        diasAtraso: Math.floor((now.getTime() - p.fechaDevolucionPrevista.getTime()) / (1000 * 60 * 60 * 24)),
      }));

      const ubicacionCount: Record<string, number> = {};
      const tipoCount: Record<string, number> = {};
      for (const l of libros) {
        const ubi = l.ubicacion ?? 'Sin especificar';
        ubicacionCount[ubi] = (ubicacionCount[ubi] ?? 0) + l.cantidadEjemplares;
        const tipo = l.tipoMaterial ?? 'Sin especificar';
        tipoCount[tipo] = (tipoCount[tipo] ?? 0) + l.cantidadEjemplares;
      }
      const inventarioPorUbicacion = Object.entries(ubicacionCount)
        .map(([ubicacion, cantidad]) => ({ ubicacion, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);
      const inventarioPorTipo = Object.entries(tipoCount)
        .map(([tipo, cantidad]) => ({ tipo, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);

      const sociosPorMes: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${meses[d.getMonth()]} ${d.getFullYear()}`;
        sociosPorMes[key] = 0;
      }
      for (const s of sociosList) {
        const d = s.createdAt;
        const key = `${meses[d.getMonth()]} ${d.getFullYear()}`;
        if (sociosPorMes[key] !== undefined) {
          sociosPorMes[key]++;
        }
      }
      const nuevosSociosPorPeriodo = Object.entries(sociosPorMes)
        .map(([periodo, cantidad]) => ({ periodo, cantidad }))
        .reverse();

      const anioCount: Record<string, number> = {};
      const editorialCount: Record<string, number> = {};
      const idiomaCount: Record<string, number> = {};
      for (const l of libros) {
        const anio = l.anioPublicacion && l.anioPublicacion !== '' ? l.anioPublicacion : 'Sin año';
        anioCount[anio] = (anioCount[anio] ?? 0) + 1;
        const edit = l.editorial && l.editorial !== '' ? l.editorial : 'Sin editorial';
        editorialCount[edit] = (editorialCount[edit] ?? 0) + 1;
        const lang = l.idioma && l.idioma !== '' ? l.idioma : 'Sin especificar';
        idiomaCount[lang] = (idiomaCount[lang] ?? 0) + 1;
      }
      const catalogoPorAnio = Object.entries(anioCount)
        .map(([anio, cantidad]) => ({ anio, cantidad }))
        .sort((a, b) => {
          if (a.anio === 'Sin año') return 1;
          if (b.anio === 'Sin año') return -1;
          return parseInt(b.anio) - parseInt(a.anio);
        });
      const catalogoPorEditorial = Object.entries(editorialCount)
        .map(([editorial, cantidad]) => ({ editorial, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 15);
      const catalogoPorIdioma = Object.entries(idiomaCount)
        .map(([idioma, cantidad]) => ({ idioma, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);

      const activos = prestamosCount.find((p) => p.estado === 'PRESTADO');
      const devueltos = prestamosCount.find((p) => p.estado === 'DEVUELTO');
      const totalActivos = activos?._count ?? 0;
      const enMora = prestamosVencidos.length;
      const prestamosActivosVsDevueltos = {
        activos: totalActivos - enMora,
        enMora,
        devueltos: devueltos?._count ?? 0,
      };

      return {
        prestamosPorPeriodo,
        librosMasPrestados,
        sociosMasActivos,
        prestamosVencidos: overdueList,
        inventarioPorUbicacion,
        inventarioPorTipo,
        nuevosSociosPorPeriodo,
        catalogoPorAnio,
        catalogoPorEditorial,
        catalogoPorIdioma,
        prestamosActivosVsDevueltos,
      };
    }),
});
