'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';
import { trpc } from '@/utils/trpc';

export default function CambiarPasswordPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [repeatPass, setRepeatPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const updatePassword = trpc.usuarios.updatePassword.useMutation({
    onSuccess: async () => {
      await update({});
      toast.success('Contraseña actualizada');
      router.replace('/');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message, { duration: 4000 });
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && !(session?.user as any)?.debeCambiarPassword) {
      router.replace('/');
    }
  }, [status, session, router]);

  if (status !== 'authenticated') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPass || !newPass || !repeatPass) {
      toast.error('Completá los tres campos');
      return;
    }
    if (newPass.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPass !== repeatPass) {
      toast.error('La nueva contraseña no coincide');
      return;
    }

    const userId = (session?.user as any)?.id;
    if (!userId) {
      toast.error('Sesión inválida, ingresá de nuevo');
      return;
    }

    updatePassword.mutate({ userId, currentPassword: currentPass, newPassword: newPass });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-50 dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
            <KeyRound size={28} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            Cambiá tu contraseña
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-3">
            Estás usando una contraseña temporal. Elegí una nueva para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Contraseña actual (temporal)', value: currentPass, set: setCurrentPass },
            { label: 'Nueva contraseña (mín. 6 caracteres)', value: newPass, set: setNewPass },
            { label: 'Repetir nueva contraseña', value: repeatPass, set: setRepeatPass },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                {f.label}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 rounded-2xl font-bold text-sm text-slate-800 dark:text-slate-200 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={updatePassword.isPending}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {updatePassword.isPending ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 mt-6 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
