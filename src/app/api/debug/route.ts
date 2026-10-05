import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.usuario.count();
    const dbUrl = (process.env.DATABASE_URL || '').slice(0, 30) + '...';

    // Prueba temporal: replica las queries de circulacion para diagnosticar el 500 en prod
    let metricsTest: unknown = 'ok';
    try {
      const [a, b] = await Promise.all([
        prisma.prestamo.count({ where: { estado: 'PRESTADO' } }),
        prisma.prestamo.findMany({
          where: { estado: 'PRESTADO' },
          include: {
            socio: { select: { id: true, nombre: true, apellido: true } },
            libro: { select: { id: true, titulo: true } },
          },
          take: 5,
        }),
      ]);
      metricsTest = { count: a, sample: b.length };
    } catch (e) {
      metricsTest = 'ERROR: ' + String(e);
    }

    return NextResponse.json({
      database: 'connected',
      dbUrlPrefix: dbUrl,
      userCount,
      metricsTest,
      nodeEnv: process.env.NODE_ENV,
      nextauthUrl: process.env.NEXTAUTH_URL,
    });
  } catch (error) {
    return NextResponse.json({
      database: 'error',
      error: String(error),
    }, { status: 500 });
  }
}
