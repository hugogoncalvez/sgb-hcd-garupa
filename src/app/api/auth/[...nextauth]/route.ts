import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas - la sesión expira y pide login de nuevo
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.error('[AUTH] Missing credentials');
            return null;
          }

          console.error('[AUTH] Looking up user:', credentials.username);
          const user = await prisma.usuario.findUnique({
            where: { username: credentials.username },
          });

          if (!user) {
            console.error('[AUTH] User not found:', credentials.username);
            return null;
          }

          console.error('[AUTH] User found, comparing password');
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error('[AUTH] Invalid password for:', credentials.username);
            return null;
          }

          console.error('[AUTH] Login successful for:', credentials.username);
          return {
            id: user.id,
            name: user.nombre,
            username: user.username,
            role: user.rol,
            nombreCompleto: user.nombreCompleto,
          };
        } catch (error) {
          console.error('[AUTH] Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.nombreCompleto = (user as any).nombreCompleto;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).nombreCompleto = token.nombreCompleto;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
