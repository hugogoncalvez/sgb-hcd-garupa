'use client';

import React from 'react';
import { trpc } from '@/utils/trpc';
import { 
  BookOpen, 
  Users, 
  Clock, 
  ArrowRight,
  PlusCircle,
  UserPlus,
  Book,
  Search,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();
  const { data: metrics, isLoading } = trpc.circulacion.getMetrics.useQuery();
  const { data: proximos } = trpc.circulacion.getProximosVencer.useQuery();

  return (
    <MainLayout title="Inicio">
      <div className="space-y-12">
        {/* Hero Section */}
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bienvenido, <span className="text-indigo-600">{session?.user?.name?.split(' ')[0]}</span>.
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Gestioná libros, socios y préstamos con agilidad.
          </p>
        </header>

        {/* Métricas Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard 
            title="Catálogo" 
            value={metrics?.totalLibros} 
            icon={<BookOpen size={28} />}
            color="indigo"
            label="Libros registrados"
            isLoading={isLoading}
          />
          <MetricCard 
            title="Comunidad" 
            value={metrics?.sociosActivos} 
            icon={<Users size={28} />}
            color="emerald"
            label="Socios activos"
            isLoading={isLoading}
          />
          <MetricCard 
            title="En Mora" 
            value={metrics?.prestamosVencidos} 
            icon={<Clock size={28} />}
            color="rose"
            label="Préstamos atrasados"
            isLoading={isLoading}
          />
        </div>

        {/* Vencimientos próximos */}
        <section className="bg-white dark:bg-slate-800 rounded-[2rem] border border-amber-200 dark:border-amber-500/20 p-4 md:p-8 shadow-xl shadow-amber-100/30 dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="text-amber-600" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">
                Vencimientos Próximos
              </h2>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                {proximos && proximos.length > 0
                  ? `${proximos.length} préstamo${proximos.length !== 1 ? 's' : ''} vence${proximos.length !== 1 ? 'n' : ''} en los próximos 3 días`
                  : 'Ningún préstamo próximo a vencer'}
              </p>
            </div>
          </div>
          {proximos && proximos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {proximos.map((p: any) => {
                const restan = Math.ceil(
                  (new Date(p.fechaDevolucionPrevista).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <Link
                    key={p.id}
                    href="/prestamos"
                    className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-500/20">
                      <Calendar size={18} className="text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.libro.titulo}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {p.socio.nombre} {p.socio.apellido}
                      </p>
                    </div>
                    <span className="text-xs font-black text-amber-600 bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1 rounded-lg whitespace-nowrap">
                      {restan === 0 ? 'Hoy' : restan === 1 ? 'Mañana' : `${restan} días`}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 text-center py-6">
              No hay préstamos próximos a vencer
            </p>
          )}
        </section>

        {/* Operaciones */}
        <section className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-5 md:p-10 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-display">
                <PlusCircle className="text-indigo-600" size={36} />
                Panel de Acción
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">¿Qué vamos a hacer hoy?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <ActionCard 
              title="Préstamo"
              description="Salida de libros"
              icon={<ArrowRight size={24} />}
              color="indigo"
              href="/prestamos"
            />
            <ActionCard 
              title="Socios"
              description="Alta de miembros"
              icon={<UserPlus size={24} />}
              color="emerald"
              href="/socios/nuevo"
            />
            <ActionCard 
              title="Catálogo"
              description="Formato MARC 21"
              icon={<Book size={24} />}
              color="violet"
              href="/catalogo"
            />
          </div>
        </section>

        <footer className="py-10 text-center space-y-1">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-black italic tracking-widest uppercase">
            SGB v1.0 • 2026
          </p>
          <p className="text-xs font-bold text-slate-300 dark:text-slate-600 relative group cursor-default inline-block">
            <span>by Hugo G. Goncalvez</span>
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
              ✉ hugogoncalvez@gmail.com &nbsp;·&nbsp; 📱 376-4941490
            </span>
          </p>
        </footer>
      </div>
    </MainLayout>
  );
}

function MetricCard({ title, value, icon, color, label, isLoading }: any) {
  const colorStyles: any = {
    indigo: "bg-indigo-600 shadow-indigo-200 text-indigo-600",
    emerald: "bg-emerald-600 shadow-emerald-200 text-emerald-600",
    rose: "bg-rose-600 shadow-rose-200 text-rose-600",
  };

  const bgStyles: any = {
    indigo: "bg-indigo-50/50",
    emerald: "bg-emerald-50/50",
    rose: "bg-rose-50/50",
  };

  return (
    <div className={`p-4 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 shadow-sm bg-white dark:bg-slate-800`}>
      <div className="relative z-10">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500 ${colorStyles[color].split(' ')[0]}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-1 font-display">{title}</h3>
          {isLoading ? (
            <div className="h-12 w-20 skeleton rounded-xl"></div>
          ) : (
            <p className="text-6xl font-black text-slate-900 dark:text-white tabular-nums font-display">
              {value ?? 0}
            </p>
          )}
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-widest">{label}</p>
        </div>
      </div>
      {/* Decorative Icon in background */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 ${colorStyles[color].split(' ')[2]}`}>
        {React.cloneElement(icon as any, { size: 160 })}
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon, color, href }: { title: string, description: string, icon: React.ReactNode, color: string, href: string }) {
  const colorStyles: any = {
    indigo: "bg-indigo-600 shadow-indigo-200 dark:shadow-indigo-900/30",
    emerald: "bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/30",
    violet: "bg-violet-600 shadow-violet-200 dark:shadow-violet-900/30",
  };

  return (
    <Link 
      href={href}
      className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 md:p-8 rounded-[2rem] flex flex-col gap-6 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 text-left active:scale-[0.97]"
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${colorStyles[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">{title}</h3>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{description}</p>
      </div>
      <div className="absolute top-8 right-8 text-slate-200 dark:text-slate-600 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
        <ArrowRight size={24} />
      </div>
    </Link>
  );
}
