'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { trpc } from '@/utils/trpc';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ArrowLeft,
  BookOpen,
  Calendar,
  History,
  CheckCircle2,
  XCircle,
  BookCheck,
  Sparkles,
  Save,
  Edit3,
  X,
} from 'lucide-react';

export default function SocioDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isEditing, setIsEditing] = useState(false);
  const { data: socio, isLoading } = trpc.socios.getById.useQuery({ id });

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'SUSPENDIDO',
  });

  const updateSocio = trpc.socios.update.useMutation({
    onSuccess: () => {
      toast.success('Socio actualizado correctamente', { duration: 3000 });
      setIsEditing(false);
      utils.socios.getById.invalidate({ id });
      utils.socios.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    },
  });

  const startEditing = () => {
    if (!socio) return;
    setForm({
      nombre: socio.nombre,
      apellido: socio.apellido,
      dni: socio.dni,
      email: socio.email || '',
      telefono: socio.telefono || '',
      direccion: socio.direccion || '',
      estado: socio.estado,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateSocio.mutate({ id, ...form });
  };

  if (isLoading) {
    return (
      <MainLayout title="Detalle del Socio">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-[2rem]" />
        </div>
      </MainLayout>
    );
  }

  if (!socio) {
    return (
      <MainLayout title="Detalle del Socio">
        <div className="text-center py-20">
          <p className="text-slate-400 font-semibold">Socio no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const prestamosActivos = socio.prestamos.filter(p => p.estado === 'PRESTADO');
  const prestamosDevueltos = socio.prestamos.filter(p => p.estado === 'DEVUELTO');

  return (
    <MainLayout title="Detalle del Socio">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Back + Edit buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/socios')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm transition-all"
          >
            <ArrowLeft size={18} />
            Volver al listado
          </button>
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
            >
              <Edit3 size={16} />
              Editar Socio
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
                disabled={updateSocio.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 disabled:opacity-50"
              >
                <Save size={16} />
                {updateSocio.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-10 text-white relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black backdrop-blur-sm">
                {socio.nombre[0]}{socio.apellido[0]}
              </div>
              <div>
                <h2 className="text-3xl font-black font-display">{socio.nombre} {socio.apellido}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    socio.estado === 'ACTIVO'
                      ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                      : 'bg-rose-400/20 text-rose-200 border border-rose-400/30'
                  }`}>
                    {socio.estado}
                  </span>
                  <span className="text-sm text-indigo-200 font-semibold">ID: {socio.id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </div>
            <Sparkles className="absolute -right-6 -bottom-6 text-white/10" size={160} />
          </div>

          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-3">
                  Información Personal
                </h3>
                {isEditing ? (
                  <>
                    <EditField icon={<BadgeCheck size={18} />} label="Nombre" value={form.nombre} onChange={(v) => setForm(f => ({ ...f, nombre: v }))} />
                    <EditField icon={<BadgeCheck size={18} />} label="Apellido" value={form.apellido} onChange={(v) => setForm(f => ({ ...f, apellido: v }))} />
                    <EditField icon={<CreditCard size={18} />} label="DNI" value={form.dni} onChange={(v) => setForm(f => ({ ...f, dni: v }))} />
                    <EditField icon={<Mail size={18} />} label="Email" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} />
                    <EditField icon={<Phone size={18} />} label="Teléfono" value={form.telefono} onChange={(v) => setForm(f => ({ ...f, telefono: v }))} />
                    <EditField icon={<MapPin size={18} />} label="Dirección" value={form.direccion} onChange={(v) => setForm(f => ({ ...f, direccion: v }))} />
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Estado</p>
                        <select
                          value={form.estado}
                          onChange={(e) => setForm(f => ({ ...f, estado: e.target.value as 'ACTIVO' | 'SUSPENDIDO' }))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="ACTIVO">Activo</option>
                          <option value="SUSPENDIDO">Suspendido</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoRow icon={<BadgeCheck size={18} />} label="Nombre" value={`${socio.nombre} ${socio.apellido}`} />
                    <InfoRow icon={<CreditCard size={18} />} label="DNI" value={socio.dni} />
                    <InfoRow icon={<Mail size={18} />} label="Email" value={socio.email || '—'} />
                    <InfoRow icon={<Phone size={18} />} label="Teléfono" value={socio.telefono || '—'} />
                    <InfoRow icon={<MapPin size={18} />} label="Dirección" value={socio.direccion || '—'} />
                    <InfoRow icon={<Calendar size={18} />} label="Registrado" value={new Date(socio.createdAt).toLocaleDateString()} />
                  </>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-3">
                  Estadísticas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={<BookCheck size={22} />} label="Préstamos Activos" value={prestamosActivos.length.toString()} color="amber" />
                  <StatCard icon={<CheckCircle2 size={22} />} label="Devueltos" value={prestamosDevueltos.length.toString()} color="emerald" />
                  <StatCard icon={<History size={22} />} label="Total" value={socio.prestamos.length.toString()} color="indigo" />
                  <StatCard icon={<User size={22} />} label="Antigüedad" value={`${Math.floor((Date.now() - new Date(socio.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses`} color="violet" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan History */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <History className="text-indigo-600" size={28} />
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">Actividad de Préstamos</h3>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Libro</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Salida</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vencimiento</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Devolución</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {socio.prestamos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                        Este socio no tiene préstamos registrados.
                      </td>
                    </tr>
                  ) : (
                    socio.prestamos.map((prestamo) => (
                      <tr key={prestamo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-8 py-5">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{prestamo.libro.titulo}</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{prestamo.libro.autor}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(prestamo.fechaSalida).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(prestamo.fechaDevolucionPrevista).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                          {prestamo.fechaDevolucionReal
                            ? new Date(prestamo.fechaDevolucionReal).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            prestamo.estado === 'PRESTADO'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20'
                          }`}>
                            {prestamo.estado === 'PRESTADO' ? 'Activo' : 'Devuelto'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  const colorMap: any = {
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600',
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white font-display mt-1">{value}</p>
    </div>
  );
}
