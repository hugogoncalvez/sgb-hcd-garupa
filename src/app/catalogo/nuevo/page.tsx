'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Book, 
  ChevronRight, 
  BadgeCheck, 
  Library,
  Calendar,
  Hash,
  Type,
  FileText,
  Save,
  Barcode,
  Search,
  Loader2,
  Globe,
  Building2,
  MapPin,
  BookCopy,
  MessageSquareText,
  Tags,
  ListChecks,
  Users,
  UserCheck,
  Package,
  Layers,
  LocateFixed,
  X
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Componente reutilizable para campos de formulario
function FormField({ label, marcCode, icon: Icon, children }: {
  label: string;
  marcCode?: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">
        {label} {marcCode && <span className="text-xs font-medium text-slate-300 dark:text-slate-600">({marcCode})</span>}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
        {children}
      </div>
    </div>
  );
}

// Componente para textarea
function FormTextarea({ label, marcCode, icon: Icon, children }: {
  label: string;
  marcCode?: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">
        {label} {marcCode && <span className="text-xs font-medium text-slate-300 dark:text-slate-600">({marcCode})</span>}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
        {children}
      </div>
    </div>
  );
}

// Componente para sección
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

const inputClasses = "w-full pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-300 font-semibold";
const searchInputClasses = inputClasses + " pr-10";
const textareaClasses = "w-full pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-300 font-semibold resize-none";

export default function NuevoLibro() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    isbn: '',
    idioma: '',
    clasificacion: '',
    autor: '',
    titulo: '',
    edicion: '',
    lugarPublicacion: '',
    editorial: '',
    anioPublicacion: '',
    descripcionFisica: '',
    notaGeneral: '',
    temas: '',
    descriptores: '',
    autorInstitucional: '',
    colaboradores: '',
    bibliotecario: '',
    inventario: '',
    tipoMaterial: '',
    ubicacion: '',
    portadaUrl: '',
    volumen: '',
  });
  const [ejemplares, setEjemplares] = useState<{ codigoInterno: string; tipoMaterial: string; ubicacion: string; codigoEstante: string }[]>([]);
  const [nuevoEjemplar, setNuevoEjemplar] = useState({ codigoInterno: '', tipoMaterial: '', ubicacion: '', codigoEstante: '' });
  const [searchQuery, setSearchQuery] = useState({ titulo: '', autor: '' });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hoverCover, setHoverCover] = useState(false);
  const [coverRect, setCoverRect] = useState({ left: 0, top: 0, right: 0 });
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nombreCompleto = (session?.user as any)?.nombreCompleto;
    if (nombreCompleto && !formData.bibliotecario) {
      setFormData(prev => ({ ...prev, bibliotecario: nombreCompleto }));
    }
  }, [(session?.user as any)?.nombreCompleto]);

  const createLibro = trpc.libros.create.useMutation({
    onSuccess: () => {
      toast.success('Libro registrado exitosamente', { duration: 3000 });
      router.push('/catalogo');
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    }
  });

  const searchExternal = trpc.libros.getByIsbnExternal.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data) {
        toast.success('Datos autocompletados desde ISBN', { duration: 3000 });
        setFormData(prev => ({
          ...prev,
          titulo: data.titulo || prev.titulo,
          autor: data.autor || prev.autor,
          colaboradores: data.colaboradores || prev.colaboradores,
          anioPublicacion: data.anioPublicacion || prev.anioPublicacion,
          editorial: data.editorial || prev.editorial,
          lugarPublicacion: data.lugarPublicacion || prev.lugarPublicacion,
          edicion: data.edicion || prev.edicion,
          portadaUrl: data.portadaUrl || '',
          descripcionFisica: data.descripcionFisica || prev.descripcionFisica,
          idioma: data.idioma || prev.idioma,
          temas: data.temas || prev.temas,
        }));
      } else {
        toast.error('No se encontraron datos para este ISBN.', { duration: 4000 });
      }
    },
    onError: (error) => {
      setIsSearching(false);
      toast.error(error.message, { duration: 4000 });
    }
  });

  const searchByTitle = trpc.libros.searchExternalByTitle.useMutation({
    onSuccess: (data) => {
      setIsSearching(false);
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowModal(true);
      } else {
        toast.error('No se encontraron libros con esos datos.', { duration: 4000 });
      }
    },
    onError: (error) => {
      setIsSearching(false);
      toast.error(error.message, { duration: 4000 });
    }
  });

  const fetchExternalDetails = trpc.libros.getByExternalId.useMutation({
    onSuccess: (data) => {
      if (data) {
        setFormData(prev => ({
          ...prev,
          titulo: data.titulo || prev.titulo,
          autor: data.autor || prev.autor,
          colaboradores: data.colaboradores || prev.colaboradores,
          anioPublicacion: data.anioPublicacion || prev.anioPublicacion,
          editorial: data.editorial || prev.editorial,
          lugarPublicacion: data.lugarPublicacion || prev.lugarPublicacion,
          edicion: data.edicion || prev.edicion,
          portadaUrl: data.portadaUrl || prev.portadaUrl,
          descripcionFisica: data.descripcionFisica || prev.descripcionFisica,
          idioma: data.idioma || prev.idioma,
          temas: data.temas || prev.temas,
          isbn: data.isbn || prev.isbn,
        }));
      }
    },
    onError: () => {},
  });

  const handleSearch = () => {
    if (searchQuery.titulo.length >= 3) {
      setIsSearching(true);
      searchByTitle.mutate({ titulo: searchQuery.titulo, autor: searchQuery.autor });
    } else if (formData.isbn.length >= 10) {
      setIsSearching(true);
      searchExternal.mutate({ isbn: formData.isbn });
    } else {
      toast.error('Ingrese un ISBN (10+ dígitos) o un título (3+ caracteres) para buscar.');
    }
  };

  const selectSearchResult = (book: any) => {
    setShowModal(false);
    setFormData(prev => ({
      ...prev,
      isbn: book.isbn || prev.isbn,
      titulo: book.titulo || prev.titulo,
      autor: book.autor || prev.autor,
      colaboradores: book.colaboradores || prev.colaboradores,
      anioPublicacion: book.anioPublicacion || prev.anioPublicacion,
      editorial: book.editorial || prev.editorial,
      lugarPublicacion: book.lugarPublicacion || prev.lugarPublicacion,
      edicion: book.edicion || prev.edicion,
      portadaUrl: book.portadaUrl || prev.portadaUrl,
      descripcionFisica: book.descripcionFisica || prev.descripcionFisica,
      idioma: book.idioma || prev.idioma,
      temas: book.temas || prev.temas,
    }));
    if (book.id) {
      fetchExternalDetails.mutate({ id: book.id });
    }
    toast.success(`"${book.titulo}" seleccionado`, { duration: 3000 });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createLibro.mutate({ ...formData, ejemplares });
  };

  return (
    <MainLayout title="Catalogación MARC 21">
      <div className="max-w-5xl mx-auto py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-slate-400 dark:text-slate-500 font-semibold text-sm">
          <span>Inventario</span>
          <ChevronRight size={16} />
          <span className="text-indigo-600 font-bold">Nuevo Ejemplar</span>
        </nav>

        {/* Registration Card */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="p-10 md:p-16">
            <div className="flex flex-col md:flex-row gap-16">
              {/* Left: Book Cover Placeholder */}
              <div className="flex flex-col items-center gap-6 w-full md:w-1/4 md:border-r border-slate-100 dark:border-slate-700 md:pr-12">
                <div
                  ref={coverRef}
                  className="relative group sticky top-8"
                  onMouseEnter={() => {
                    if (coverRef.current) {
                      const r = coverRef.current.getBoundingClientRect();
                      setCoverRect({ left: r.left, top: r.top, right: r.right });
                    }
                    setHoverCover(true);
                  }}
                  onMouseLeave={() => setHoverCover(false)}
                >
                  <div className="w-48 h-64 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border-4 border-dashed border-slate-200 dark:border-slate-600 overflow-hidden transition-all group-hover:border-indigo-300 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-500/10 shadow-inner cursor-pointer">
                    {formData.portadaUrl ? (
                      <img src={formData.portadaUrl} alt="Portada" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <Book size={64} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-300 transition-colors" />
                    )}
                  </div>
                  {/* Preview grande en hover */}
                  {typeof document !== 'undefined' && hoverCover && formData.portadaUrl && createPortal(
                    <div
                      className="fixed z-[9999] bg-white rounded-2xl shadow-[0_20px_60px_-10px_#000] border-2 border-slate-200"
                      style={{ left: coverRect.right + 24, top: coverRect.top }}
                    >
                      <img src={formData.portadaUrl} alt="Portada preview" className="w-72 h-96 rounded-2xl object-contain block" />
                    </div>,
                    document.body
                  )}
                  <div className="text-center mt-4">
                    <p className="text-xl font-black text-slate-800 dark:text-slate-200 font-display">Portada</p>
                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                      {formData.portadaUrl ? 'Cargada desde API' : 'Se carga por ISBN'}
                    </p>
                  </div>
                  {/* Info card */}
                  <div className="mt-8 p-4 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                    <p className="text-xs font-bold text-indigo-600 mb-1">💡 Consejo</p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 leading-relaxed">
                      Buscá por <strong>Título</strong> (y opcionalmente autor) para libros sin ISBN, o ingresá el <strong>ISBN</strong> y presioná "Autocompletar".
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Data Entry Form */}
              <div className="flex-grow">
                <form onSubmit={handleSubmit} className="space-y-10">
                  
                  {/* ===== SECCIÓN: IDENTIFICACIÓN ===== */}
                  <FormSection title="📋 Identificación">
                    {/* Búsqueda unificada: ISBN, Título y Autor con un solo botón */}
                    <div className="bg-indigo-50/30 dark:bg-indigo-500/5 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-500/20 space-y-3">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">🔍 Búsqueda en línea</p>
                      <div className="space-y-3">
                        <div className="relative">
                          <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                          <input
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            className={searchInputClasses + " text-sm"}
                            placeholder="ISBN"
                            type="text"
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                          />
                          {formData.isbn && (
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, isbn: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                              <X size={14} className="text-slate-400 dark:text-slate-500" />
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                          <input
                            value={searchQuery.titulo}
                            onChange={e => setSearchQuery(prev => ({ ...prev, titulo: e.target.value }))}
                            className={searchInputClasses + " text-sm"}
                            placeholder="Título"
                            type="text"
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                          />
                          {searchQuery.titulo && (
                            <button type="button" onClick={() => setSearchQuery(prev => ({ ...prev, titulo: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                              <X size={14} className="text-slate-400 dark:text-slate-500" />
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                          <input
                            value={searchQuery.autor}
                            onChange={e => setSearchQuery(prev => ({ ...prev, autor: e.target.value }))}
                            className={searchInputClasses + " text-sm"}
                            placeholder="Autor (opcional)"
                            type="text"
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                          />
                          {searchQuery.autor && (
                            <button type="button" onClick={() => setSearchQuery(prev => ({ ...prev, autor: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                              <X size={14} className="text-slate-400 dark:text-slate-500" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                          Buscar en línea
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Idioma" marcCode="MARC 041" icon={Globe}>
                        <input 
                          name="idioma"
                          value={formData.idioma}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Ej: es, en, pt" 
                          type="text"
                        />
                      </FormField>

                      <FormField label="Clasificación CDU" marcCode="MARC 080" icon={Hash}>
                        <input 
                          name="clasificacion"
                          value={formData.clasificacion}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Ej: 573/574" 
                          type="text"
                        />
                      </FormField>
                    </div>
                  </FormSection>

                  {/* ===== SECCIÓN: AUTORÍA ===== */}
                  <FormSection title="✍️ Autoría">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Autor Personal" marcCode="MARC 100" icon={BadgeCheck}>
                        <input 
                          name="autor"
                          value={formData.autor}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Apellido, Nombre" 
                          type="text"
                        />
                      </FormField>

                      <FormField label="Autor Institucional" marcCode="MARC 110" icon={Building2}>
                        <input 
                          name="autorInstitucional"
                          value={formData.autorInstitucional}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Ej: OMS, UNESCO, Ministerio de..." 
                          type="text"
                        />
                      </FormField>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic px-1 -mt-2">
                      💡 Completar uno u otro según corresponda: autor personal para personas, institucional para organismos.
                    </p>

                    <FormField label="Colaboradores" marcCode="MARC 700" icon={Users}>
                      <input 
                        name="colaboradores"
                        value={formData.colaboradores}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Apellido, Nombre; Apellido, Nombre..." 
                        type="text"
                      />
                    </FormField>
                  </FormSection>

                  {/* ===== SECCIÓN: TÍTULO Y EDICIÓN ===== */}
                  <FormSection title="📖 Título y Edición">
                    <FormField label="Título y Subtítulo" marcCode="MARC 245" icon={Type}>
                      <input 
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Ej: Vida : La ciencia de la biología" 
                        type="text"
                      />
                    </FormField>

                    <FormField label="Mención de Edición" marcCode="MARC 250" icon={BookCopy}>
                      <input 
                        name="edicion"
                        value={formData.edicion}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Ej: 6a. ed." 
                        type="text"
                      />
                    </FormField>

                    <FormField label="Volumen" icon={BookCopy}>
                      <input 
                        name="volumen"
                        value={formData.volumen}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Ej: 1 (dejar vacío si no aplica)" 
                        type="text"
                      />
                    </FormField>
                  </FormSection>

                  {/* ===== SECCIÓN: PUBLICACIÓN (PIE DE IMPRENTA) ===== */}
                  <FormSection title="🏢 Publicación (Pie de Imprenta)">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField label="Lugar" marcCode="MARC 260" icon={MapPin}>
                        <input 
                          name="lugarPublicacion"
                          value={formData.lugarPublicacion}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Ej: Buenos Aires" 
                          type="text"
                        />
                      </FormField>

                      <FormField label="Editorial" marcCode="MARC 260" icon={Building2}>
                        <input 
                          name="editorial"
                          value={formData.editorial}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Ej: Panamericana" 
                          type="text"
                        />
                      </FormField>

                      <FormField label="Año" marcCode="MARC 260" icon={Calendar}>
                        <input 
                          name="anioPublicacion"
                          value={formData.anioPublicacion}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Ej: 2003" 
                          type="text"
                        />
                      </FormField>
                    </div>
                  </FormSection>

                  {/* ===== SECCIÓN: DESCRIPCIÓN FÍSICA ===== */}
                  <FormSection title="📐 Descripción Física">
                    <FormTextarea label="Descripción Física" marcCode="MARC 300" icon={FileText}>
                      <textarea 
                        name="descripcionFisica"
                        value={formData.descripcionFisica}
                        onChange={handleChange}
                        className={textareaClasses}
                        placeholder="Ej: 1168 p. il. ; 29 cm." 
                        rows={2}
                      ></textarea>
                    </FormTextarea>
                  </FormSection>

                  {/* ===== SECCIÓN: CONTENIDO TEMÁTICO ===== */}
                  <FormSection title="🏷️ Contenido Temático">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Temas / Materias" marcCode="MARC 650" icon={Tags}>
                        <input 
                          name="temas"
                          value={formData.temas}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Ej: Biología, Ecología" 
                          type="text"
                        />
                      </FormField>

                      <FormField label="Descriptores no controlados" marcCode="MARC 653" icon={ListChecks}>
                        <input 
                          name="descriptores"
                          value={formData.descriptores}
                          onChange={handleChange}
                          className={inputClasses}
                          placeholder="Ej: LA CELULA, HERENCIA, ECOLOGIA" 
                          type="text"
                        />
                      </FormField>
                    </div>
                  </FormSection>

                  {/* ===== SECCIÓN: NOTAS Y ADMINISTRATIVO ===== */}
                  <FormSection title="📝 Notas y Registro">
                    <FormTextarea label="Nota General" marcCode="MARC 500" icon={MessageSquareText}>
                      <textarea 
                        name="notaGeneral"
                        value={formData.notaGeneral}
                        onChange={handleChange}
                        className={textareaClasses}
                        placeholder="Ej: Contiene Apéndice, Glosario, Índice analítico..." 
                        rows={3}
                      ></textarea>
                    </FormTextarea>

                    <FormField label="Bibliotecario Responsable" marcCode="MARC 900" icon={UserCheck}>
                      <input 
                        name="bibliotecario"
                        value={formData.bibliotecario}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Nombre del bibliotecario que registra" 
                        type="text"
                      />
                    </FormField>
                  </FormSection>

                  {/* ===== SECCIÓN: EJEMPLARES ===== */}
                  <FormSection title="📦 Ejemplares">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField label="Tipo de Material" icon={Layers}>
                        <select
                          value={nuevoEjemplar.tipoMaterial}
                          onChange={e => setNuevoEjemplar(prev => ({ ...prev, tipoMaterial: e.target.value }))}
                          className={inputClasses + " appearance-none cursor-pointer"}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Libro">Libro</option>
                          <option value="Folleto">Folleto</option>
                          <option value="Fotocopia">Fotocopia</option>
                          <option value="Revista">Revista</option>
                          <option value="CD/DVD">CD/DVD</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </FormField>

                      <FormField label="Ubicación" icon={LocateFixed}>
                        <select
                          value={nuevoEjemplar.ubicacion}
                          onChange={e => setNuevoEjemplar(prev => ({ ...prev, ubicacion: e.target.value }))}
                          className={inputClasses + " appearance-none cursor-pointer"}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="En estante">En estante</option>
                          <option value="Depósito">Depósito</option>
                          <option value="En reparación">En reparación</option>
                          <option value="En préstamo">En préstamo</option>
                        </select>
                      </FormField>

                      <FormField label="Detalles (estante)" icon={LocateFixed}>
                        <input 
                          value={nuevoEjemplar.codigoEstante}
                          onChange={e => setNuevoEjemplar(prev => ({ ...prev, codigoEstante: e.target.value }))}
                          className={inputClasses}
                          placeholder="Ej: Literatura Infantil 1" 
                          type="text"
                        />
                      </FormField>
                    </div>

                    <div className="flex items-end gap-4">
                      <div className="flex-grow">
                        <FormField label="Código Interno" icon={Hash}>
                          <input 
                            value={nuevoEjemplar.codigoInterno}
                            onChange={e => setNuevoEjemplar(prev => ({ ...prev, codigoInterno: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btn-agregar-ej')?.click(); } }}
                            className={inputClasses}
                            placeholder="Ej: LIB-001" 
                            type="text"
                          />
                        </FormField>
                      </div>
                      <button
                        id="btn-agregar-ej"
                        type="button"
                        onClick={() => {
                          if (!nuevoEjemplar.codigoInterno) {
                            toast.error('Ingrese un código interno');
                            return;
                          }
                          if (ejemplares.some(e => e.codigoInterno === nuevoEjemplar.codigoInterno)) {
                            toast.error('Ya existe un ejemplar con ese código');
                            return;
                          }
                          setEjemplares(prev => [...prev, { codigoInterno: nuevoEjemplar.codigoInterno, tipoMaterial: nuevoEjemplar.tipoMaterial, ubicacion: nuevoEjemplar.ubicacion, codigoEstante: nuevoEjemplar.codigoEstante }]);
                          setNuevoEjemplar(prev => ({ ...prev, codigoInterno: '' }));
                        }}
                        className="px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 mb-0.5"
                      >
                        + Agregar
                      </button>
                    </div>

                    {ejemplares.length > 0 && (
                      <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                              <th className="text-left px-4 py-3 font-bold text-slate-500 dark:text-slate-400">Código Interno</th>
                              <th className="text-left px-4 py-3 font-bold text-slate-500 dark:text-slate-400">Tipo</th>
                              <th className="text-left px-4 py-3 font-bold text-slate-500 dark:text-slate-400">Ubicación</th>
                              <th className="text-left px-4 py-3 font-bold text-slate-500 dark:text-slate-400">Detalles</th>
                              <th className="w-16"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {ejemplares.map((ej, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{ej.codigoInterno}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{ej.tipoMaterial || '—'}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{ej.ubicacion || '—'}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{ej.codigoEstante || '—'}</td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => setEjemplares(prev => prev.filter((_, j) => j !== i))}
                                    className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Total: <span className="text-indigo-600 dark:text-indigo-400">{ejemplares.length}</span> ejemplar{ejemplares.length !== 1 && 'es'}
                    </p>
                  </FormSection>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-700">
                    <button 
                      type="button" 
                      onClick={() => router.back()}
                      className="px-8 py-3.5 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={createLibro.isPending}
                      className="px-10 py-3.5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 hover:shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                      <Save size={20} />
                      {createLibro.isPending ? 'Guardando...' : 'Guardar en Catálogo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de selección de resultados */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Resultados de búsqueda</h3>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">
                  {searchResults.length} libro{searchResults.length !== 1 && 's'} encontrado{searchResults.length !== 1 && 's'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
              {searchResults.map((book, i) => (
                <button
                  key={book.id || i}
                  type="button"
                  onClick={() => selectSearchResult(book)}
                  className="w-full text-left flex items-start gap-4 p-4 rounded-2xl hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20 transition-all group"
                >
                  <div className="w-14 h-20 rounded-lg bg-slate-50 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                    {book.portadaUrl ? (
                      <img src={book.portadaUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Book size={24} className="text-slate-300 dark:text-slate-500" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {book.titulo}
                    </p>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {book.autor || 'Autor desconocido'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                      {book.anioPublicacion && <span>{book.anioPublicacion}</span>}
                      {book.editorial && <span>{book.editorial}</span>}
                      {book.isbn && <span className="font-mono">ISBN: {book.isbn}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
}
