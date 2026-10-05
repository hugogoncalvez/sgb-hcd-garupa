'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SociosList() {
  const [search, setSearch] = useState('');
  const utils = trpc.useUtils();
  const { data: socios, isLoading } = trpc.socios.getAll.useQuery({ search });
  const eliminarSocio = trpc.socios.delete.useMutation({
    onSuccess: () => {
      toast.success('Socio eliminado correctamente', { duration: 3000 });
      utils.socios.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    },
  });

  return (
    <MainLayout title="Directorio de Miembros">
      <div className="space-y-8">
        {/* Actions Bar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group min-w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar socios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 rounded-xl py-3 pl-12 pr-10 outline-none transition-all font-semibold text-sm text-slate-700 dark:text-slate-300"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                  <X size={14} className="text-slate-400 dark:text-slate-500" />
                </button>
              )}
            </div>
          </div>
          <Link 
            href="/socios/nuevo"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30"
          >
            <Plus size={20} />
            Nuevo Socio
          </Link>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Socio</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">DNI</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contacto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 skeleton rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 skeleton rounded"></div>
                            <div className="h-3 w-1/4 skeleton rounded"></div>
                          </div>
                          <div className="h-3 w-24 skeleton rounded hidden md:block"></div>
                          <div className="h-6 w-16 skeleton rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : socios?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                      No se encontraron socios con los criterios de búsqueda.
                    </td>
                  </tr>
                ) : (
                  socios?.map((socio) => (
                    <tr key={socio.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black text-sm">
                            {socio.nombre.charAt(0)}{socio.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{socio.nombre} {socio.apellido}</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">ID: {socio.id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">
                        {socio.dni}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{socio.email || 'N/A'}</p>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{socio.telefono || 'Sin teléfono'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          socio.estado === 'ACTIVO' 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20' 
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20'
                        }`}>
                          {socio.estado}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/socios/${socio.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all inline-flex"
                            title="Editar socio"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => {
                              toast(`¿Eliminar a ${socio.nombre} ${socio.apellido}?`, {
                                description: 'Esta acción no se puede deshacer.',
                                action: {
                                  label: 'Eliminar',
                                  onClick: () => eliminarSocio.mutate({ id: socio.id }),
                                },
                                duration: 6000,
                              });
                            }}
                            disabled={eliminarSocio.isPending}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
                            title="Eliminar socio"
                          >
                            <Trash2 size={16} />
                          </button>
                          <Link
                            href={`/socios/${socio.id}`}
                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all inline-flex"
                            title="Ver detalle"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Mostrando {socios?.length || 0} socios
            </p>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-100 dark:shadow-indigo-900/30">1</button>
              <button className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-white dark:hover:bg-slate-700 transition-all">2</button>
              <button className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
