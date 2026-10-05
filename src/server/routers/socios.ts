import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const sociosRouter = router({
  getAll: publicProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const search = input?.search;
      return await ctx.prisma.socio.findMany({
        where: search ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } },
            { dni: { contains: search } },
          ],
        } : {},
        orderBy: { apellido: 'asc' },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.socio.findUnique({
        where: { id: input.id },
        include: { prestamos: { include: { libro: true } } },
      });
    }),

  create: publicProcedure
    .input(z.object({
      nombre: z.string(),
      apellido: z.string(),
      dni: z.string(),
      telefono: z.string().optional(),
      email: z.string().optional(),
      direccion: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.socio.create({
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.socio.delete({
        where: { id: input.id },
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      nombre: z.string().optional(),
      apellido: z.string().optional(),
      dni: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().optional(),
      direccion: z.string().optional(),
      estado: z.enum(['ACTIVO', 'SUSPENDIDO']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.prisma.socio.update({
        where: { id },
        data,
      });
    }),
});
