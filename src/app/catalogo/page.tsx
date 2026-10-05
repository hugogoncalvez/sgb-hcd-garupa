'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Library,
  History,
  AlertCircle,
  Eye,
  X,
  Hash,
  Book,
  BookMarked,
  User,
  Building2,
  Globe,
  Tags,
  MapPin,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CatalogoList() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [detalleLibro, setDetalleLibro] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selectedEjemplares, setSelectedEjemplares] = useState<Set<string>>(new Set());
  const [hoverCover, setHoverCover] = useState(false);
  const [coverRect, setCoverRect] = useState({ left: 0, top: 0, right: 0 });
  const coverRef = useRef<HTMLDivElement>(null);
  const pageSize = 5;
  const { data, isLoading } = trpc.libros.getAll.useQuery({ search: searchDebounced, page, pageSize });
  const libros = data?.libros;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const { data: detalleCompleto } = trpc.libros.getById.useQuery(
    { id: detalleLibro?.id ?? '' },
    { enabled: !!detalleLibro?.id },
  );
  const { data: deleteEjemplaresData } = trpc.libros.getById.useQuery(
    { id: deleteTarget?.id ?? '' },
    { enabled: !!deleteTarget },
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const { data: metrics } = trpc.circulacion.getMetrics.useQuery();

  const eliminarLibro = trpc.libros.delete.useMutation({
    onSuccess: () => {
      toast.success('Libro eliminado del inventario', { duration: 3000 });
      utils.libros.getAll.invalidate();
      utils.circulacion.getMetrics.invalidate();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    },
  });

  const eliminarEjemplares = trpc.libros.deleteEjemplares.useMutation({
    onSuccess: () => {
      toast.success('Ejemplares eliminados', { duration: 3000 });
      utils.libros.getAll.invalidate();
      utils.circulacion.getMetrics.invalidate();
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    },
  });

  return (
    <MainLayout title="Inventario Bibliográfico">
      <div className="space-y-8">
        {/* Stats Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatMiniCard 
            title="Libros Totales"
            value={metrics?.totalLibros || 0}
            icon={<Library size={24} />}
            color="indigo"
          />
          <StatMiniCard 
            title="Préstamos Activos"
            value={metrics?.prestamosActivos || 0}
            icon={<History size={24} />}
            color="emerald"
          />
          <StatMiniCard 
            title="En Mora"
            value={metrics?.prestamosVencidos || 0}
            icon={<AlertCircle size={24} />}
            color="rose"
          />
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group flex-grow max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por ISBN, Título, Autor o Código interno..."
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
            href="/catalogo/nuevo"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30"
          >
            <Plus size={20} />
            Agregar Libro
          </Link>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">ISBN / Código</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Título</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Vol.</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Autor</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Editorial</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Stock</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Disponibles</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-14 skeleton rounded-lg flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-3/4 skeleton rounded"></div>
                              <div className="h-3 w-1/3 skeleton rounded"></div>
                            </div>
                            <div className="h-3 w-20 skeleton rounded hidden md:block"></div>
                            <div className="h-3 w-16 skeleton rounded hidden md:block"></div>
                            <div className="h-6 w-10 skeleton rounded-full"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : libros?.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="px-8 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                      No hay libros registrados en el inventario.
                    </td>
                  </tr>
                ) : (
                  libros?.map((libro) => (
                    <tr key={libro.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-8 py-6 text-sm font-bold text-indigo-600">
                        {libro.isbn || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-14 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                             {libro.portadaUrl ? (
                                <img src={libro.portadaUrl} alt={libro.titulo || 'Portada'} className="w-full h-full object-contain" />
                              ) : (
                                <BookOpen size={20} className="text-slate-300 dark:text-slate-500" />
                              )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{libro.titulo || 'Sin título'}</p>
                            {libro.anioPublicacion && <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{libro.anioPublicacion}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 font-semibold text-center">
                        {libro.volumen || '—'}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-400 font-semibold">
                        {libro.autor || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {libro.editorial || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-slate-700 dark:text-slate-300">
                        {libro.cantidadEjemplares}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          (libro as any).ejemplaresDisponibles > 0
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20'
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20'
                        }`}>
                          {(libro as any).ejemplaresDisponibles ?? libro.cantidadEjemplares}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDetalleLibro(libro)}
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-all"
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                          <Link
                            href={`/catalogo/${libro.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all inline-flex"
                            title="Editar libro"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => {
                              setDeleteTarget(libro);
                              setSelectedEjemplares(new Set());
                            }}
                            disabled={eliminarLibro.isPending}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Eliminar libro"
                          >
                            <Trash2 size={16} />
                          </button>
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
              Página {page} de {totalPages} ({total} libros)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30"
                title="Página anterior"
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
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                        p === page
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-indigo-900/30'
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
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30"
                title="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detalle */}
      {detalleLibro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetalleLibro(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <BookOpen size={22} className="text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Detalle del Libro</h3>
              </div>
              <button onClick={() => setDetalleLibro(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[75vh]">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Cover */}
                <div className="flex-shrink-0">
                  <div
                    ref={coverRef}
                    className="w-44 h-64 bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-lg flex items-center justify-center cursor-pointer"
                    onMouseEnter={() => {
                      if (coverRef.current) {
                        const r = coverRef.current.getBoundingClientRect();
                        setCoverRect({ left: r.left, top: r.top, right: r.right });
                      }
                      setHoverCover(true);
                    }}
                    onMouseLeave={() => setHoverCover(false)}
                  >
                    {detalleLibro.portadaUrl ? (
                      <img src={detalleLibro.portadaUrl} alt={detalleLibro.titulo || 'Portada'} className="w-full h-full object-contain transition-transform duration-300 hover:scale-105" />
                    ) : (
                      <Book size={48} className="text-slate-300 dark:text-slate-500" />
                    )}
                  </div>
                  {typeof document !== 'undefined' && hoverCover && detalleLibro.portadaUrl && createPortal(
                    <div
                      className="fixed z-[9999] bg-white rounded-2xl shadow-[0_20px_60px_-10px_#000] border-2 border-slate-200"
                      style={{ left: coverRect.right + 24, top: coverRect.top }}
                    >
                      <img src={detalleLibro.portadaUrl} alt="Portada preview" className="w-72 h-96 rounded-2xl object-contain block" />
                    </div>,
                    document.body
                  )}
                </div>

                {/* Details */}
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
                    {detalleLibro.isbn && (
                      <DetailField icon={<Hash size={14} />} label="ISBN" value={detalleLibro.isbn} />
                    )}
                    {detalleLibro.editorial && (
                      <DetailField icon={<Building2 size={14} />} label="Editorial" value={detalleLibro.editorial} />
                    )}
                    {detalleLibro.anioPublicacion && (
                      <DetailField icon={<Calendar size={14} />} label="Año" value={detalleLibro.anioPublicacion} />
                    )}
                    {detalleLibro.edicion && (
                      <DetailField icon={<FileText size={14} />} label="Edición" value={detalleLibro.edicion} />
                    )}
                    {detalleLibro.volumen && (
                      <DetailField icon={<BookMarked size={14} />} label="Volumen" value={detalleLibro.volumen} />
                    )}
                    {detalleLibro.idioma && (
                      <DetailField icon={<Globe size={14} />} label="Idioma" value={detalleLibro.idioma} />
                    )}
                    {detalleLibro.clasificacion && (
                      <DetailField icon={<Book size={14} />} label="Clasificación" value={detalleLibro.clasificacion} />
                    )}
                    {detalleLibro.lugarPublicacion && (
                      <DetailField icon={<MapPin size={14} />} label="Lugar" value={detalleLibro.lugarPublicacion} />
                    )}
                  </div>

                  {/* Temas */}
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

                  {/* Stock */}
                  <div className="flex gap-6 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Stock</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{detalleLibro.cantidadEjemplares}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Disponibles</p>
                      <p className={`text-xl font-black ${(detalleLibro as any).ejemplaresDisponibles > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {(detalleLibro as any).ejemplaresDisponibles ?? detalleLibro.cantidadEjemplares}
                      </p>
                    </div>
                  </div>

                  {/* Ejemplares */}
                  {detalleCompleto?.ejemplares && detalleCompleto.ejemplares.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Library size={12} /> Ejemplares</p>
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                              <th className="text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Código</th>
                              <th className="text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Tipo</th>
                              <th className="text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Ubicación</th>
                              <th className="text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Detalles</th>
                              <th className="text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {detalleCompleto.ejemplares.map((ej) => (
                              <tr key={ej.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">{ej.codigoInterno}</td>
                                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{ej.tipoMaterial || '—'}</td>
                                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{ej.ubicacion || '—'}</td>
                                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{ej.codigoEstante || '—'}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ej.estado === 'DISPONIBLE'
                                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                                      : ej.estado === 'PRESTADO'
                                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                  }`}>
                                    {ej.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Additional fields */}
                  {detalleLibro.descripcionFisica && (
                    <div className="pt-2">
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
                  {detalleLibro.colaboradores && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Users size={12} /> Colaboradores</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{detalleLibro.colaboradores}</p>
                    </div>
                  )}
                  {detalleLibro.descriptores && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Descriptores</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{detalleLibro.descriptores}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar ejemplares */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden border border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Eliminar ejemplares</h3>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">{deleteTarget.titulo}</p>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {deleteEjemplaresData?.ejemplares.length === 0 ? (
                <p className="text-center text-slate-400 font-semibold py-8">No hay ejemplares para eliminar.</p>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedEjemplares.size === deleteEjemplaresData?.ejemplares.length}
                      onChange={() => {
                        if (selectedEjemplares.size === deleteEjemplaresData?.ejemplares.length) {
                          setSelectedEjemplares(new Set());
                        } else {
                          setSelectedEjemplares(new Set(deleteEjemplaresData?.ejemplares.map(e => e.id)));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Seleccionar todos</span>
                  </label>
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-2 space-y-1">
                    {deleteEjemplaresData?.ejemplares.map(ej => (
                      <label key={ej.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedEjemplares.has(ej.id)}
                          onChange={() => {
                            const next = new Set(selectedEjemplares);
                            if (next.has(ej.id)) next.delete(ej.id);
                            else next.add(ej.id);
                            setSelectedEjemplares(next);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{ej.codigoInterno}</p>
                          <p className="text-xs text-slate-400">
                            {ej.tipoMaterial || '—'} · {ej.ubicacion || '—'} · {ej.estado}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => {
                  toast(`¿Eliminar todo el libro "${deleteTarget.titulo}"?`, {
                    description: 'Se eliminarán todos los ejemplares y el libro.',
                    action: {
                      label: 'Eliminar todo',
                      onClick: () => eliminarLibro.mutate({ id: deleteTarget.id }),
                    },
                    duration: 6000,
                  });
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
              >
                Eliminar libro completo
              </button>
              <button
                type="button"
                disabled={selectedEjemplares.size === 0 || eliminarEjemplares.isPending}
                onClick={() => eliminarEjemplares.mutate({ ids: Array.from(selectedEjemplares) })}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {eliminarEjemplares.isPending ? 'Eliminando...' : `Eliminar ${selectedEjemplares.size} ejemplar${selectedEjemplares.size !== 1 ? 'es' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
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

function StatMiniCard({ title, value, icon, color }: any) {
  const colorStyles: any = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
  };

  return (
    <div className={`p-6 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6 relative overflow-hidden group hover:shadow-lg transition-all duration-500`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110 ${colorStyles[color]}`}>
        {icon}
      </div>
      <div className="z-10">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className={`text-3xl font-black font-display text-slate-900 dark:text-white`}>{value}</h3>
      </div>
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 ${colorStyles[color].split(' ')[0]}`}>
        {React.cloneElement(icon as any, { size: 100 })}
      </div>
    </div>
  );
}
