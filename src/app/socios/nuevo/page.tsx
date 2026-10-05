'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  UserPlus, 
  BadgeCheck, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Camera,
  ChevronRight,
  Info,
  CheckCircle2,
  Users
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/navigation';

export default function NuevoSocio() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSocio = trpc.socios.create.useMutation({
    onSuccess: () => {
      alert('Socio registrado exitosamente');
      router.push('/socios');
    },
    onError: (error) => {
      alert('Error al registrar socio: ' + error.message);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createSocio.mutate(formData);
    setIsSubmitting(false);
  };

  return (
    <MainLayout title="Registro de Socio">
      <div className="max-w-5xl mx-auto py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-slate-400 dark:text-slate-500 font-semibold text-sm">
          <span>Miembros</span>
          <ChevronRight size={16} />
          <span className="text-indigo-600 font-bold">Nuevo Registro</span>
        </nav>

        {/* Registration Card */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="p-10 md:p-16">
            <div className="flex flex-col md:flex-row gap-16">
              {/* Left: Profile Picture Placeholder */}
              <div className="flex flex-col items-center gap-6 w-full md:w-1/3 border-r border-slate-100 dark:border-slate-700 pr-16">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border-4 border-dashed border-slate-200 dark:border-slate-600 overflow-hidden transition-all group-hover:border-indigo-300 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-500/10">
                    <Users size={64} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-300 transition-colors" />
                    <div className="hidden group-hover:flex absolute inset-0 bg-indigo-600/10 items-center justify-center cursor-pointer">
                      <Camera size={32} className="text-indigo-600" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-800 dark:text-slate-200 font-display">Foto de Perfil</p>
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1">Formato JPG o PNG. Máx 2MB.</p>
                </div>
                <button type="button" className="mt-4 px-6 py-2.5 border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                  Cargar Imagen
                </button>
              </div>

              {/* Right: Data Entry Form */}
              <div className="flex-grow">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Nombre */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">Nombre</label>
                      <div className="relative group">
                        <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-300 font-semibold" 
                          placeholder="Ej: Juan" 
                          type="text"
                        />
                      </div>
                    </div>
                    {/* Apellido */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">Apellido</label>
                      <div className="relative group">
                        <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-300 font-semibold" 
                          placeholder="Ej: Pérez" 
                          type="text"
                        />
                      </div>
                    </div>
                    {/* DNI */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">DNI</label>
                      <div className="relative group">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                          name="dni"
                          value={formData.dni}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-300 font-semibold" 
                          placeholder="XXXXXXXX" 
                          type="text"
                        />
                      </div>
                    </div>
                    {/* Correo Electrónico */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">Correo Electrónico</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-300 font-semibold" 
                          placeholder="ejemplo@correo.com" 
                          type="email"
                        />
                      </div>
                    </div>
                    {/* Teléfono */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">Teléfono</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="w-full pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-300 font-semibold" 
                          placeholder="+54 376 4XXXXXX" 
                          type="tel"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Dirección */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400 px-1">Dirección</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <textarea 
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="w-full pl-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-300 font-semibold resize-none" 
                        placeholder="Calle, Número, Ciudad..." 
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
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
                      disabled={isSubmitting}
                      className="px-10 py-3.5 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30 hover:shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                      <UserPlus size={20} />
                      Registrar Socio
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-6 rounded-3xl flex gap-6 items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h4 className="text-xl font-black text-indigo-900 dark:text-indigo-200 font-display">Verificación Automática</h4>
              <p className="text-sm font-semibold text-indigo-600/70 dark:text-indigo-400/70 mt-1">El sistema validará el DNI contra la base de datos local para evitar duplicados y agilizar el proceso.</p>
            </div>
          </div>
          <div className="bg-slate-900 dark:bg-slate-700 p-6 rounded-3xl flex flex-col justify-between text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Membresía</p>
              <div className="mt-4">
                <p className="text-xl font-black font-display">Plan Estándar</p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Válido por 12 meses</p>
              </div>
            </div>
            <div className="mt-6 h-1 w-full bg-slate-800 dark:bg-slate-600 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-indigo-500 w-1/3"></div>
            </div>
            <Sparkles className="absolute -right-4 -bottom-4 text-slate-800 dark:text-slate-600" size={120} />
          </div>
        </div>
      </div>
    </MainLayout>
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
