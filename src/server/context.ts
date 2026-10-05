import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { prisma } from '@/lib/prisma';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    prisma,
    headers: opts.resHeaders,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
