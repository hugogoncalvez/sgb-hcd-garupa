'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Library,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  Calendar,
  Hash,
  Tags,
  MapPin,
} from 'lucide-react';
import { trpc } from '@/utils/trpc';

export default function ConsultaPublica() {
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [detalleLibro, setDetalleLibro] = useState<any>(null);
  const pageSize = 12;

  const { data, isLoading } = trpc.libros.getAll.useQuery({ search: searchDebounced, page, pageSize });
  const libros = data?.libros;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex items-center justify-center p-1 shadow-lg">
                <img src="/logo.png" alt="SGB" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">Biblioteca Hugo Lopresti</h1>
                <p className="text-indigo-200 font-bold text-sm uppercase tracking-widest mt-1">Catálogo Público</p>
              </div>
            </div>
            <a
              href="/login"
              title="Acceso administrativo"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-sm transition-all flex-shrink-0"
            >
              <Lock size={16} />
              <span className="hidden sm:inline">Acceso administrativo</span>
            </a>
          </div>
          <p className="text-indigo-100 text-lg max-w-xl mt-4">
            Consultá el inventario de la biblioteca, buscá libros y conocé su disponibilidad.
          </p>

          {/* Search */}
          <div className="relative group max-w-2xl mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-white transition-colors" size={22} />
            <input
              type="text"
              placeholder="Buscá por título, autor, ISBN, código interno o tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 backdrop-blur border border-white/20 focus:border-white/50 focus:ring-4 focus:ring-white/20 rounded-2xl py-5 pl-14 pr-6 outline-none transition-all text-white placeholder-indigo-200 font-bold text-lg"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16">
        {/* Stats bar */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl px-8 py-5 mb-8 flex items-center gap-8">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-indigo-600" />
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Total: <span className="text-slate-900 dark:text-white">{total}</span> libros
            </span>
          </div>
          {searchDebounced && (
            <div className="text-sm font-bold text-indigo-600">
              Resultados para: &ldquo;{searchDebounced}&rdquo;
            </div>
          )}
        </div>

        {/* Book Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="aspect-[4/3] skeleton"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 skeleton rounded"></div>
                  <div className="h-3 w-1/2 skeleton rounded"></div>
                  <div className="h-3 w-1/3 skeleton rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : libros?.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-16 text-center">
            <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-bold text-lg">
              {searchDebounced ? 'No se encontraron libros para tu búsqueda.' : 'No hay libros en el inventario.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {libros?.map((libro) => {
              const disponibles = (libro as any).ejemplaresDisponibles ?? libro.cantidadEjemplares;
              return (
                <button
                  key={libro.id}
                  onClick={() => setDetalleLibro(libro)}
                  className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group"
                >
                  {/* Cover */}
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                    {libro.portadaUrl ? (
                      <img src={libro.portadaUrl} alt={libro.titulo || ''} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={48} className="text-slate-300 dark:text-slate-500" />
                      </div>
                    )}
                    {/* Availability badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                      disponibles > 0
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}>
                      {disponibles > 0 ? `${disponibles} disp.` : 'No disponible'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {libro.titulo || 'Sin título'}
                    </h3>
                    {libro.autor && (
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <User size={12} /> {libro.autor}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                      {libro.anioPublicacion && <span>{libro.anioPublicacion}</span>}
                      {libro.editorial && <span>{libro.editorial}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-slate-300 dark:text-slate-600 font-bold px-1">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                      p === page
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detalleLibro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetalleLibro(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <BookOpen size={22} className="text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Detalle del Libro</h3>
              </div>
              <button onClick={() => setDetalleLibro(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-8 overflow-y-auto max-h-[75vh]">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="w-44 h-64 bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-lg flex items-center justify-center">
                    {detalleLibro.portadaUrl ? (
                      <img src={detalleLibro.portadaUrl} alt={detalleLibro.titulo || ''} className="w-full h-full object-contain" />
                    ) : (
                      <BookOpen size={48} className="text-slate-300 dark:text-slate-500" />
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{detalleLibro.titulo || 'Sin título'}</h2>
                    {detalleLibro.autor && (
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <User size={14} /> {detalleLibro.autor}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {detalleLibro.isbn && <DetailField icon={<Hash size={14} />} label="ISBN" value={detalleLibro.isbn} />}
                    {detalleLibro.editorial && <DetailField icon={<Building2 size={14} />} label="Editorial" value={detalleLibro.editorial} />}
                    {detalleLibro.anioPublicacion && <DetailField icon={<Calendar size={14} />} label="Año" value={detalleLibro.anioPublicacion} />}
                    {detalleLibro.ubicacion && <DetailField icon={<MapPin size={14} />} label="Ubicación" value={detalleLibro.ubicacion} />}
                    {detalleLibro.idioma && <DetailField icon={<Hash size={14} />} label="Idioma" value={detalleLibro.idioma} />}
                    {detalleLibro.inventario && <DetailField icon={<Hash size={14} />} label="Inventario" value={detalleLibro.inventario} />}
                  </div>

                  {detalleLibro.temas && (
                    <div className="pt-2">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Tags size={12} /> Temas</p>
                      <div className="flex flex-wrap gap-2">
                        {detalleLibro.temas.split(',').map((t: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-bold">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-6 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Stock total</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{detalleLibro.cantidadEjemplares}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Disponibles</p>
                      <p className={`text-xl font-black ${(detalleLibro as any).ejemplaresDisponibles > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {(detalleLibro as any).ejemplaresDisponibles ?? detalleLibro.cantidadEjemplares}
                      </p>
                    </div>
                  </div>

                  {detalleLibro.descripcionFisica && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Descripción Física</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{detalleLibro.descripcionFisica}</p>
                    </div>
                  )}
                  {detalleLibro.notaGeneral && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Nota General</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{detalleLibro.notaGeneral}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
            SGB &mdash; Biblioteca del Concejo Deliberante de Garupá
          </p>
          <a href="/login" className="inline-block mt-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Acceso administrativo
          </a>
        </div>
      </footer>
    </div>
  );
}

function DetailField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">{icon} {label}</p>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}
