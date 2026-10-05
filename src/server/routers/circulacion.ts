import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const circulacionRouter = router({
  getMetrics: publicProcedure.query(async ({ ctx }) => {
    const [totalLibros, sociosActivos, prestamosActivos, prestamosVencidos] = await Promise.all([
      ctx.prisma.libro.count(),
      ctx.prisma.socio.count({ where: { estado: 'ACTIVO' } }),
      ctx.prisma.prestamo.count({ where: { estado: 'PRESTADO' } }),
      ctx.prisma.prestamo.count({
        where: {
          estado: 'PRESTADO',
          fechaDevolucionPrevista: { lt: new Date() },
        },
      }),
    ]);

    return { totalLibros, sociosActivos, prestamosActivos, prestamosVencidos };
  }),

  getAll: publicProcedure
    .input(z.object({ 
      search: z.string().optional(),
      estado: z.enum(['PRESTADO', 'DEVUELTO']).optional(),
      vencidos: z.boolean().optional(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
    }).optional())
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 10;
      const skip = (page - 1) * pageSize;

      const where: any = {};
      if (input?.vencidos) {
        where.estado = 'PRESTADO';
        where.fechaDevolucionPrevista = { lt: new Date() };
      } else if (input?.estado) {
        where.estado = input.estado;
        if (input.estado === 'PRESTADO') {
          where.fechaDevolucionPrevista = { gte: new Date() };
        }
      }
      if (input?.search) {
        where.OR = [
          { socio: { nombre: { contains: input.search, mode: 'insensitive' } } },
          { socio: { apellido: { contains: input.search, mode: 'insensitive' } } },
          { libro: { titulo: { contains: input.search, mode: 'insensitive' } } },
        ];
      }
      const prestamos = await ctx.prisma.prestamo.findMany({
        where,
        include: { socio: true, libro: true },
        orderBy: { fechaSalida: 'desc' },
        skip,
        take: pageSize,
      });
      const total = await ctx.prisma.prestamo.count({ where });
      return { prestamos, total };
    }),

  getVencidos: publicProcedure
    .input(z.object({ limit: z.number().default(5) }).optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      return await ctx.prisma.prestamo.findMany({
        where: {
          estado: 'PRESTADO',
          fechaDevolucionPrevista: { lt: now },
        },
        include: {
          socio: { select: { id: true, nombre: true, apellido: true } },
          libro: { select: { id: true, titulo: true } },
        },
        orderBy: { fechaDevolucionPrevista: 'asc' },
        take: input?.limit ?? 5,
      });
    }),

  registrarPrestamo: publicProcedure
    .input(z.object({
      socioId: z.string(),
      libroId: z.string(),
      diasPrestamo: z.number().default(7),
    }))
    .mutation(async ({ ctx, input }) => {
      const fechaDevolucionPrevista = new Date();
      fechaDevolucionPrevista.setDate(fechaDevolucionPrevista.getDate() + input.diasPrestamo);

      return await ctx.prisma.prestamo.create({
        data: {
          socioId: input.socioId,
          libroId: input.libroId,
          fechaDevolucionPrevista,
          estado: 'PRESTADO',
        },
      });
    }),

  getProximosVencer: publicProcedure
    .query(async ({ ctx }) => {
      const now = new Date();
      const en3Dias = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return await ctx.prisma.prestamo.findMany({
        where: {
          estado: 'PRESTADO',
          fechaDevolucionPrevista: { gte: now, lte: en3Dias },
        },
        include: {
          socio: { select: { id: true, nombre: true, apellido: true } },
          libro: { select: { id: true, titulo: true } },
        },
        orderBy: { fechaDevolucionPrevista: 'asc' },
      });
    }),

  renovarPrestamo: publicProcedure
    .input(z.object({ prestamoId: z.string(), diasExtra: z.number().default(7) }))
    .mutation(async ({ ctx, input }) => {
      const prestamo = await ctx.prisma.prestamo.findUnique({
        where: { id: input.prestamoId },
        select: { fechaDevolucionPrevista: true, estado: true },
      });
      if (!prestamo || prestamo.estado !== 'PRESTADO') {
        throw new Error('El préstamo no está activo');
      }
      const nuevaFecha = new Date(prestamo.fechaDevolucionPrevista);
      nuevaFecha.setDate(nuevaFecha.getDate() + input.diasExtra);
      return await ctx.prisma.prestamo.update({
        where: { id: input.prestamoId },
        data: { fechaDevolucionPrevista: nuevaFecha },
      });
    }),

  registrarDevolucion: publicProcedure
    .input(z.object({ prestamoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.prestamo.update({
        where: { id: input.prestamoId },
        data: {
          estado: 'DEVUELTO',
          fechaDevolucionReal: new Date(),
        },
      });
    }),
});
