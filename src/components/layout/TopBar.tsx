'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, Moon, Sun, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';

export function TopBar({ title }: { title?: string }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: metrics } = trpc.circulacion.getMetrics.useQuery();
  const { data: vencidos } = trpc.circulacion.getVencidos.useQuery({ limit: 5 });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 h-20 flex items-center justify-between px-8">
      <div className="flex items-center gap-8">
        {title && (
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Cambiar tema"
          >
            <Sun size={20} className="hidden dark:block" />
            <Moon size={20} className="block dark:hidden" />
          </button>
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all relative"
              title="Notificaciones"
            >
              <Bell size={20} />
              {(metrics?.prestamosVencidos ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full px-1 border-2 border-white dark:border-slate-900">
                  {metrics?.prestamosVencidos}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-500" />
                    Préstamos Vencidos
                  </p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    {metrics?.prestamosVencidos ?? 0} atrasados
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {vencidos && vencidos.length > 0 ? (
                    vencidos.map((p) => {
                      const dias = Math.floor(
                        (Date.now() - new Date(p.fechaDevolucionPrevista).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <button
                          key={p.id}
                          onClick={() => { router.push('/prestamos'); setNotifOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                        >
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                            {p.libro.titulo ?? 'Sin título'}
                          </p>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                            {p.socio.nombre} {p.socio.apellido}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                              Vencía {new Date(p.fechaDevolucionPrevista).toLocaleDateString('es-AR')}
                            </span>
                            <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg">
                              {dias}d
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ¡Todo al día!
                      </p>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                        No hay préstamos vencidos
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { router.push('/prestamos'); setNotifOpen(false); }}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                >
                  Ver todos en Préstamos →
                </button>
              </div>
            )}
          </div>

        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-100 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{session?.user?.name}</p>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center justify-end gap-1">
              <Sparkles size={10} /> {(session?.user as any)?.role || 'Admin'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30">
            {session?.user?.name?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
