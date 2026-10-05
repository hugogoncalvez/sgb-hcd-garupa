import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get('key');
  if (process.env.KEEP_ALIVE_KEY && key !== process.env.KEEP_ALIVE_KEY) {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Keep-alive failed:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
