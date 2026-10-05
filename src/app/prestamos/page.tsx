'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  UserSearch, 
  Search, 
  Barcode, 
  Calendar, 
  ArrowRight,
  CheckCircle2,
  BookOpen,
  User,
  History,
  BookMarked,
  Loader2,
  X,
  XCircle,
  BookCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export default function PrestamosPage() {
  const utils = trpc.useUtils();
  const [socioSearch, setSocioSearch] = useState('');
  const [libroSearch, setLibroSearch] = useState('');
  const [selectedSocio, setSelectedSocio] = useState<any>(null);
  const [selectedLibro, setSelectedLibro] = useState<any>(null);
  const [diasPrestamo, setDiasPrestamo] = useState(7);
  const [historySearch, setHistorySearch] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: sociosFound, isFetching: buscandoSocio } = trpc.socios.getAll.useQuery({ search: socioSearch }, { enabled: socioSearch.length > 2 });
  const { data: librosFound, isFetching: buscandoLibro } = trpc.libros.buscar.useQuery({ q: libroSearch }, { enabled: libroSearch.length > 2 });
  const filtroEstado = filtroActivo === 'todos' ? undefined : filtroActivo === 'PRESTADO' ? { estado: 'PRESTADO' as const } : filtroActivo === 'DEVUELTO' ? { estado: 'DEVUELTO' as const } : { vencidos: true };
  const { data: prestamosData, isFetching: buscandoHistorial } = trpc.circulacion.getAll.useQuery({ search: historySearch || undefined, ...filtroEstado, page, pageSize });
  const prestamos = prestamosData?.prestamos as any[] | undefined;
  const total = prestamosData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const devolverPrestamo = trpc.circulacion.registrarDevolucion.useMutation({
    onSuccess: () => {
      toast.success('Devolución registrada', { duration: 3000 });
      utils.circulacion.getAll.invalidate();
      utils.circulacion.getMetrics.invalidate();
    },
  });

  const renovarPrestamo = trpc.circulacion.renovarPrestamo.useMutation({
    onSuccess: () => {
      toast.success('Préstamo renovado exitosamente', { duration: 3000 });
      utils.circulacion.getAll.invalidate();
      utils.circulacion.getMetrics.invalidate();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    },
  });

  const registrarPrestamo = trpc.circulacion.registrarPrestamo.useMutation({
    onSuccess: () => {
      toast.success('Préstamo registrado exitosamente', { duration: 3000 });
      setSelectedSocio(null);
      setSelectedLibro(null);
      setSocioSearch('');
      setLibroSearch('');
      utils.circulacion.getAll.invalidate();
      utils.circulacion.getMetrics.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleConfirmar = () => {
    if (!selectedSocio || !selectedLibro) return;
    registrarPrestamo.mutate({
      socioId: selectedSocio.id,
      libroId: selectedLibro.id,
      diasPrestamo
    });
  };

  return (
    <MainLayout title="Gestión de Préstamos">
      <div className="grid grid-cols-12 gap-10">
        {/* Left Column: Selection */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          {/* Socio Selection */}
          <section className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all focus-within:ring-4 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-900/30">
            <div className="flex items-center gap-3 mb-6">
              <UserSearch className="text-indigo-600" size={28} />
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">Identificación del Socio</h3>
            </div>
            
            <div className="space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar por DNI o Nombre..."
                  value={socioSearch}
                  onChange={(e) => setSocioSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-300"
                />
                {socioSearch && (
                  <button onClick={() => setSocioSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                    <X size={14} className="text-slate-400 dark:text-slate-500" />
                  </button>
                )}
                
                {socioSearch.length > 2 && !selectedSocio && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto overflow-x-hidden">
                    {buscandoSocio ? (
                      <div className="p-4 flex items-center gap-3 text-slate-400">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm font-semibold">Buscando...</span>
                      </div>
                    ) : sociosFound && sociosFound.length > 0 ? (
                      sociosFound.map(socio => (
                        <button 
                          key={socio.id}
                          onClick={() => { setSelectedSocio(socio); setSocioSearch(''); }}
                          className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black text-xs">
                            {socio.nombre[0]}{socio.apellido[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{socio.nombre} {socio.apellido}</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">DNI: {socio.dni}</p>
                          </div>
                        </button>
                      ))
                    ) : sociosFound !== undefined && !buscandoSocio ? (
                      <div className="p-4 text-center text-slate-400 text-sm font-semibold">
                        No se encontraron socios
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {selectedSocio && (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">
                    {selectedSocio.nombre[0]}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">{selectedSocio.nombre} {selectedSocio.apellido}</p>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Socio Activo • DNI {selectedSocio.dni}</p>
                  </div>
                  <button onClick={() => setSelectedSocio(null)} className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase hover:underline">Cambiar</button>
                </div>
              )}
            </div>
          </section>

          {/* Libro Selection */}
          <section className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all focus-within:ring-4 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-900/30">
            <div className="flex items-center gap-3 mb-6">
              <BookMarked className="text-indigo-600" size={28} />
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">Ejemplar de la Colección</h3>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Escanear ISBN o buscar título..."
                  value={libroSearch}
                  onChange={(e) => setLibroSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-300"
                />
                {libroSearch && (
                  <button onClick={() => setLibroSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                    <X size={14} className="text-slate-400 dark:text-slate-500" />
                  </button>
                )}

                {libroSearch.length > 2 && !selectedLibro && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto">
                    {buscandoLibro ? (
                      <div className="p-4 flex items-center gap-3 text-slate-400">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm font-semibold">Buscando...</span>
                      </div>
                    ) : librosFound && librosFound.length > 0 ? (
                      librosFound.map(libro => (
                        <button 
                          key={libro.id}
                          onClick={() => { setSelectedLibro(libro); setLibroSearch(''); }}
                          className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                        >
                          <div className="w-8 h-12 bg-slate-100 dark:bg-slate-700 rounded flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                            <BookOpen size={16} className="text-slate-300 dark:text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{libro.titulo}</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{libro.autor} • ISBN {libro.isbn}</p>
                          </div>
                        </button>
                      ))
                    ) : librosFound !== undefined && !buscandoLibro ? (
                      <div className="p-4 text-center text-slate-400 text-sm font-semibold">
                        No se encontraron resultados
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Plazo de Devolución</label>
                  <select 
                    value={diasPrestamo}
                    onChange={(e) => setDiasPrestamo(Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 dark:text-slate-300 appearance-none"
                  >
                    <option value={7}>Normal (7 días)</option>
                    <option value={15}>Extendido (15 días)</option>
                    <option value={1}>Sala (Diario)</option>
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Fecha Estimada</label>
                   <div className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-3 text-slate-400 dark:text-slate-500 font-bold text-sm">
                     <Calendar size={18} />
                     {new Date(Date.now() + diasPrestamo * 24 * 60 * 60 * 1000).toLocaleDateString()}
                   </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Transaction Summary */}
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-28 bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100 dark:shadow-indigo-900/20 border border-slate-100 dark:border-slate-700">
            <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black font-display">Resumen de Operación</h3>
                <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">Circulación de Patrimonio</p>
              </div>
              <Sparkles className="absolute -right-4 -bottom-4 text-indigo-500/30" size={140} />
            </div>

            <div className="p-8 space-y-8">
              {/* Visual Book Info */}
              <div className="flex gap-6">
                <div className="w-24 h-36 bg-slate-100 dark:bg-slate-700 rounded-2xl flex-shrink-0 shadow-lg border-4 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden">
                   {selectedLibro?.portadaUrl ? (
                      <img src={selectedLibro.portadaUrl} alt={selectedLibro.titulo || ''} className="w-full h-full object-contain" />
                   ) : selectedLibro ? (
                      <div className="text-center p-2">
                        <BookOpen size={32} className="text-indigo-200 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-indigo-400 uppercase leading-none">{selectedLibro.titulo.slice(0, 15)}</p>
                      </div>
                   ) : (
                      <BookOpen size={32} className="text-slate-200 dark:text-slate-600" />
                   )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 w-fit ${selectedLibro ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                    {selectedLibro ? 'Disponible' : 'Sin Selección'}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight font-display">
                    {selectedLibro?.titulo || 'Esperando libro...'}
                  </h4>
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1">
                    {selectedLibro?.autor || 'Escanee o busque para continuar'}
                  </p>
                </div>
              </div>

              {/* Detail Rows */}
              <div className="space-y-4 border-t border-slate-50 dark:border-slate-700 pt-8">
                <DetailRow label="Socio Destino" value={selectedSocio ? `${selectedSocio.nombre} ${selectedSocio.apellido}` : '--'} />
                <DetailRow label="Vencimiento" value={new Date(Date.now() + diasPrestamo * 24 * 60 * 60 * 1000).toLocaleDateString()} />
                <DetailRow 
                  label="Estado Socio" 
                  value={selectedSocio ? 'REGULARIZADO' : '--'} 
                  highlight={!!selectedSocio}
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleConfirmar}
                  disabled={!selectedSocio || !selectedLibro || registrarPrestamo.isPending}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/30 active:scale-95 disabled:opacity-30 disabled:shadow-none"
                >
                  {registrarPrestamo.isPending ? 'Procesando...' : 'Confirmar Préstamo'}
                  <ArrowRight size={22} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Loan History */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <History className="text-indigo-600" size={28} />
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">Historial de Préstamos</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Filtrar por socio o libro..."
                value={historySearch}
                onChange={(e) => { setHistorySearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-semibold text-sm text-slate-700 dark:text-slate-300"
              />
              {historySearch && (
                <button onClick={() => { setHistorySearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                  <X size={14} className="text-slate-400 dark:text-slate-500" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
              {[
                { label: 'Todos', value: 'todos' },
                { label: 'Activos', value: 'PRESTADO' },
                { label: 'Vencidos', value: 'vencidos' },
                { label: 'Devueltos', value: 'DEVUELTO' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setFiltroActivo(f.value); setPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    filtroActivo === f.value
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Socio</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Libro</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Salida</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vencimiento</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {buscandoHistorial ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/4 skeleton rounded"></div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 skeleton rounded"></div>
                              </div>
                              <div className="h-3 w-20 skeleton rounded hidden md:block"></div>
                              <div className="h-3 w-20 skeleton rounded hidden md:block"></div>
                              <div className="h-6 w-16 skeleton rounded-full"></div>
                              <div className="h-6 w-8 skeleton rounded"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : !prestamos || prestamos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                          {historySearch
                            ? `No se encontraron resultados para "${historySearch}".`
                            : 'No hay préstamos registrados.'}
                        </td>
                      </tr>
                    ) : (
                      prestamos.map((prestamo) => (
                        <tr key={prestamo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{prestamo.socio.nombre} {prestamo.socio.apellido}</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm line-clamp-1">{prestamo.libro.titulo}</p>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(prestamo.fechaSalida).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(prestamo.fechaDevolucionPrevista).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5">
                            {(() => {
                              const vencido = prestamo.estado === 'PRESTADO' && new Date(prestamo.fechaDevolucionPrevista) < new Date();
                              return (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  vencido
                                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20'
                                    : prestamo.estado === 'PRESTADO'
                                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20'
                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20'
                                }`}>
                                  {vencido ? 'Vencido' : prestamo.estado === 'PRESTADO' ? 'Activo' : 'Devuelto'}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {prestamo.estado === 'PRESTADO' && (
                                <>
                                  <button
                                    onClick={() => {
                                      toast(`¿Renovar "${prestamo.libro.titulo}" por 7 días más?`, {
                                        description: `Nueva fecha estimada: ${new Date(new Date(prestamo.fechaDevolucionPrevista).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
                                        action: {
                                          label: 'Renovar',
                                          onClick: () => renovarPrestamo.mutate({ prestamoId: prestamo.id, diasExtra: 7 }),
                                        },
                                        duration: 6000,
                                      });
                                    }}
                                    disabled={renovarPrestamo.isPending}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                    title="Renovar préstamo"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      toast(`¿Registrar devolución de "${prestamo.libro.titulo}"?`, {
                                        description: `${prestamo.socio.nombre} ${prestamo.socio.apellido} - ${new Date(prestamo.fechaDevolucionPrevista).toLocaleDateString()}`,
                                        action: {
                                          label: 'Devolver',
                                          onClick: () => devolverPrestamo.mutate({ prestamoId: prestamo.id }),
                                        },
                                        duration: 6000,
                                      });
                                    }}
                                    disabled={devolverPrestamo.isPending}
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                                    title="Registrar devolución"
                                  >
                                    <BookCheck size={18} />
                                  </button>
                                </>
                              )}
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
              Página {page} de {totalPages} ({total} préstamos)
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
                      title={`Ir a página ${p}`}
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
      </section>
    </MainLayout>
  );
}

function DetailRow({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black ${highlight ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
        {value}
      </span>
    </div>
  );
}

function Sparkles({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="m5 3 1 1"/>
      <path d="m19 21 1 1"/>
      <path d="m5 21 1-1"/>
      <path d="m19 3 1 1"/>
    </svg>
  );
}
