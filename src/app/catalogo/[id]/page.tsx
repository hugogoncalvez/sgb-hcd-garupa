'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { trpc } from '@/utils/trpc';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  BookOpen,
  ArrowLeft,
  Save,
  Edit3,
  X,
  Sparkles,
  Barcode,
  Globe,
  Hash,
  User,
  Building2,
  BookMarked,
  BookCopy,
  MapPin,
  Printer,
  Calendar,
  BookA,
  FolderOpen,
  Tag,
  Users,
  StickyNote,
  Layers,
  Plus,
  Library,
} from 'lucide-react';
export default function LibroDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddEjemplar, setShowAddEjemplar] = useState(false);
  const [nuevoEj, setNuevoEj] = useState({ codigoInterno: '', tipoMaterial: '', ubicacion: '', codigoEstante: '' });
  const { data: libro, isLoading } = trpc.libros.getById.useQuery({ id });

  const [form, setForm] = useState({
    isbn: '',
    idioma: '',
    clasificacion: '',
    autor: '',
    autorInstitucional: '',
    titulo: '',
    edicion: '',
    lugarPublicacion: '',
    editorial: '',
    anioPublicacion: '',
    descripcionFisica: '',
    notaGeneral: '',
    temas: '',
    descriptores: '',
    colaboradores: '',
    volumen: '',
  });

  const updateLibro = trpc.libros.update.useMutation({
    onSuccess: () => {
      toast.success('Libro actualizado correctamente', { duration: 3000 });
      setIsEditing(false);
      utils.libros.getById.invalidate({ id });
      utils.libros.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    },
  });

  const addEjemplar = trpc.libros.addEjemplares.useMutation({
    onSuccess: () => {
      toast.success('Ejemplar agregado', { duration: 3000 });
      utils.libros.getById.invalidate({ id });
      utils.libros.getAll.invalidate();
      setShowAddEjemplar(false);
      setNuevoEj({ codigoInterno: '', tipoMaterial: '', ubicacion: '', codigoEstante: '' });
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    },
  });

  const startEditing = () => {
    if (!libro) return;
    setForm({
      isbn: libro.isbn || '',
      idioma: libro.idioma || '',
      clasificacion: libro.clasificacion || '',
      autor: libro.autor || '',
      autorInstitucional: libro.autorInstitucional || '',
      titulo: libro.titulo || '',
      edicion: libro.edicion || '',
      lugarPublicacion: libro.lugarPublicacion || '',
      editorial: libro.editorial || '',
      anioPublicacion: libro.anioPublicacion || '',
      descripcionFisica: libro.descripcionFisica || '',
      notaGeneral: libro.notaGeneral || '',
      temas: libro.temas || '',
      descriptores: libro.descriptores || '',
      colaboradores: libro.colaboradores || '',
      volumen: libro.volumen || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateLibro.mutate({ id, ...form });
  };

  if (isLoading) {
    return (
      <MainLayout title="Detalle del Libro">
        <div className="space-y-8">
          <div className="h-8 w-48 skeleton rounded-xl" />
          <div className="h-64 skeleton rounded-[2rem]" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-12 skeleton rounded-xl" />
            <div className="h-12 skeleton rounded-xl" />
            <div className="h-12 skeleton rounded-xl" />
            <div className="h-12 skeleton rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!libro) {
    return (
      <MainLayout title="Detalle del Libro">
        <div className="text-center py-20">
          <p className="text-slate-400 font-semibold">Libro no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detalle del Libro">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/catalogo')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm transition-all"
          >
            <ArrowLeft size={18} />
            Volver al inventario
          </button>
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
            >
              <Edit3 size={16} />
              Editar Libro
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={updateLibro.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 disabled:opacity-50"
              >
                <Save size={16} />
                {updateLibro.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-10 text-white relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black backdrop-blur-sm">
                <BookOpen size={36} />
              </div>
              <div>
                <h2 className="text-3xl font-black font-display">{libro.titulo || 'Sin título'}</h2>
                <p className="text-indigo-200 font-bold mt-1">{libro.autor || 'Autor desconocido'}{libro.anioPublicacion ? ` (${libro.anioPublicacion})` : ''}</p>
              </div>
            </div>
            <Sparkles className="absolute -right-6 -bottom-6 text-white/10" size={160} />
          </div>

          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-3">
                  Identificación
                </h3>
                {isEditing ? (
                  <>
                    <EditField icon={<Barcode size={18} />} label="ISBN" value={form.isbn} onChange={(v) => setForm(f => ({ ...f, isbn: v }))} />
                    <EditField icon={<Globe size={18} />} label="Idioma" value={form.idioma} onChange={(v) => setForm(f => ({ ...f, idioma: v }))} />
                    <EditField icon={<Hash size={18} />} label="CDU (Clasificación)" value={form.clasificacion} onChange={(v) => setForm(f => ({ ...f, clasificacion: v }))} />
                    <EditField icon={<BookMarked size={18} />} label="Título" value={form.titulo} onChange={(v) => setForm(f => ({ ...f, titulo: v }))} />
                    <EditField icon={<User size={18} />} label="Autor" value={form.autor} onChange={(v) => setForm(f => ({ ...f, autor: v }))} />
                    <EditField icon={<Building2 size={18} />} label="Autor Institucional" value={form.autorInstitucional} onChange={(v) => setForm(f => ({ ...f, autorInstitucional: v }))} />
                    <EditField icon={<BookCopy size={18} />} label="Edición" value={form.edicion} onChange={(v) => setForm(f => ({ ...f, edicion: v }))} />
                    <EditField icon={<BookMarked size={18} />} label="Volumen" value={form.volumen} onChange={(v) => setForm(f => ({ ...f, volumen: v }))} />
                  </>
                ) : (
                  <>
                    <InfoRow icon={<Barcode size={18} />} label="ISBN" value={libro.isbn || '—'} />
                    <InfoRow icon={<Globe size={18} />} label="Idioma" value={libro.idioma || '—'} />
                    <InfoRow icon={<Hash size={18} />} label="CDU (Clasificación)" value={libro.clasificacion || '—'} />
                    <InfoRow icon={<BookMarked size={18} />} label="Título" value={libro.titulo || '—'} />
                    <InfoRow icon={<User size={18} />} label="Autor" value={libro.autor || '—'} />
                    <InfoRow icon={<Building2 size={18} />} label="Autor Institucional" value={libro.autorInstitucional || '—'} />
                    <InfoRow icon={<BookCopy size={18} />} label="Edición" value={libro.edicion || '—'} />
                    {libro.volumen && <InfoRow icon={<BookMarked size={18} />} label="Volumen" value={libro.volumen} />}
                      <InfoRow icon={<Layers size={18} />} label="Ejemplares" value={String(libro.cantidadEjemplares)} />
                      <div className="flex items-center gap-3 pt-2">
                        <span className="text-sm font-bold text-slate-400">{libro.ejemplares?.length ?? 0} ejemplar{(libro.ejemplares?.length ?? 0) !== 1 ? 'es' : ''}</span>
                        <button
                          onClick={() => {
                            setNuevoEj({ codigoInterno: '', tipoMaterial: '', ubicacion: '', codigoEstante: '' });
                            setShowAddEjemplar(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                        >
                          <Plus size={14} />
                          Agregar
                        </button>
                      </div>
                  </>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-3">
                  Publicación y Descripción
                </h3>
                {isEditing ? (
                  <>
                    <EditField icon={<MapPin size={18} />} label="Lugar de Publicación" value={form.lugarPublicacion} onChange={(v) => setForm(f => ({ ...f, lugarPublicacion: v }))} />
                    <EditField icon={<Printer size={18} />} label="Editorial" value={form.editorial} onChange={(v) => setForm(f => ({ ...f, editorial: v }))} />
                    <EditField icon={<Calendar size={18} />} label="Año de Publicación" value={form.anioPublicacion} onChange={(v) => setForm(f => ({ ...f, anioPublicacion: v }))} />
                    <EditField icon={<BookA size={18} />} label="Descripción Física" value={form.descripcionFisica} onChange={(v) => setForm(f => ({ ...f, descripcionFisica: v }))} />
                    <EditField icon={<StickyNote size={18} />} label="Nota General" value={form.notaGeneral} onChange={(v) => setForm(f => ({ ...f, notaGeneral: v }))} />
                    <EditField icon={<FolderOpen size={18} />} label="Temas" value={form.temas} onChange={(v) => setForm(f => ({ ...f, temas: v }))} />
                    <EditField icon={<Tag size={18} />} label="Descriptores" value={form.descriptores} onChange={(v) => setForm(f => ({ ...f, descriptores: v }))} />
                    <EditField icon={<Users size={18} />} label="Colaboradores" value={form.colaboradores} onChange={(v) => setForm(f => ({ ...f, colaboradores: v }))} />
                  </>
                ) : (
                  <>
                    <InfoRow icon={<MapPin size={18} />} label="Lugar de Publicación" value={libro.lugarPublicacion || '—'} />
                    <InfoRow icon={<Printer size={18} />} label="Editorial" value={libro.editorial || '—'} />
                    <InfoRow icon={<Calendar size={18} />} label="Año de Publicación" value={libro.anioPublicacion || '—'} />
                    <InfoRow icon={<BookA size={18} />} label="Descripción Física" value={libro.descripcionFisica || '—'} />
                    <InfoRow icon={<StickyNote size={18} />} label="Nota General" value={libro.notaGeneral || '—'} />
                    <InfoRow icon={<FolderOpen size={18} />} label="Temas" value={libro.temas || '—'} />
                    <InfoRow icon={<Tag size={18} />} label="Descriptores" value={libro.descriptores || '—'} />
                    <InfoRow icon={<Users size={18} />} label="Colaboradores" value={libro.colaboradores || '—'} />
                  </>
                )}
              </div>
            </div>

            {/* Ejemplares */}
            {!isEditing && libro.ejemplares && libro.ejemplares.length > 0 && (
              <div className="px-10 pb-10">
                <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Library size={14} /> Ejemplares ({libro.ejemplares.length})
                  </h3>
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
                        {libro.ejemplares.map(ej => (
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
                              }`}>{ej.estado}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Detalles (estante)</p>
                  <input
                    value={nuevoEj.codigoEstante}
                    onChange={e => setNuevoEj(prev => ({ ...prev, codigoEstante: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Ej: Literatura Infantil 1"
                  />
                </div>
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal agregar ejemplar */}
        {showAddEjemplar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddEjemplar(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Agregar Ejemplar</h3>
                <button onClick={() => setShowAddEjemplar(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Código Interno</p>
                  <input
                    value={nuevoEj.codigoInterno}
                    onChange={e => setNuevoEj(prev => ({ ...prev, codigoInterno: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btn-confirmar-ej')?.click(); } }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Ej: LIB-002"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Tipo de Material</p>
                  <select
                    value={nuevoEj.tipoMaterial}
                    onChange={e => setNuevoEj(prev => ({ ...prev, tipoMaterial: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Libro">Libro</option>
                    <option value="Folleto">Folleto</option>
                    <option value="Fotocopia">Fotocopia</option>
                    <option value="Revista">Revista</option>
                    <option value="CD/DVD">CD/DVD</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Ubicación</p>
                  <select
                    value={nuevoEj.ubicacion}
                    onChange={e => setNuevoEj(prev => ({ ...prev, ubicacion: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="En estante">En estante</option>
                    <option value="Depósito">Depósito</option>
                    <option value="En reparación">En reparación</option>
                    <option value="En préstamo">En préstamo</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => setShowAddEjemplar(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  Cancelar
                </button>
                <button
                  id="btn-confirmar-ej"
                  disabled={!nuevoEj.codigoInterno || addEjemplar.isPending}
                  onClick={() => addEjemplar.mutate({ libroId: id, ejemplares: [{ codigoInterno: nuevoEj.codigoInterno, tipoMaterial: nuevoEj.tipoMaterial, ubicacion: nuevoEj.ubicacion, codigoEstante: nuevoEj.codigoEstante }] })}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {addEjemplar.isPending ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function EditField({ icon, label, value, onChange }: { icon: React.ReactNode, label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );
}

function EditNumericField({ icon, label, value, onChange }: { icon: React.ReactNode, label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );
}
