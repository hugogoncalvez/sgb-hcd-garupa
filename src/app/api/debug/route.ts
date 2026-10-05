import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.usuario.count();
    const dbUrl = (process.env.DATABASE_URL || '').slice(0, 30) + '...';

    return NextResponse.json({
      database: 'connected',
      dbUrlPrefix: dbUrl,
      userCount,
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
