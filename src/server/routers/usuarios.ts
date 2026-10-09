import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { router, publicProcedure } from '../trpc';

export const usuariosRouter = router({
  updatePassword: publicProcedure
    .input(z.object({
      userId: z.string(),
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.usuario.findUnique({
        where: { id: input.userId },
      });
      if (!user) throw new Error('Usuario no encontrado');

      const valid = await bcrypt.compare(input.currentPassword, user.password);
      if (!valid) throw new Error('La contraseña actual es incorrecta');

      const same = await bcrypt.compare(input.newPassword, user.password);
      if (same) throw new Error('La nueva contraseña debe ser distinta a la actual');

      const hash = await bcrypt.hash(input.newPassword, 10);
      await ctx.prisma.usuario.update({
        where: { id: input.userId },
        data: { password: hash },
      });
      return true;
    }),
});
