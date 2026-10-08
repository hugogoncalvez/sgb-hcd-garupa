'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Search } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'authenticated') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Credenciales inválidas. Por favor, intente de nuevo.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-white dark:bg-slate-700 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 mb-4 overflow-hidden flex items-center justify-center p-1">
            <img src="/logo.png" alt="SGB" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">SGB</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Acceso Administrativo</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-500/10 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 text-sm font-bold rounded-r-xl animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 rounded-2xl py-4 px-5 outline-none transition-all text-slate-800 dark:text-slate-200 font-bold shadow-inner"
              placeholder="Ingrese su usuario"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
              Contraseña
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 rounded-2xl py-4 px-5 pr-14 outline-none transition-all text-slate-800 dark:text-slate-200 font-bold shadow-inner"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.97] shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Validando...' : 'Entrar al Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/consulta-publica"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-black text-sm transition-all border border-indigo-200 dark:border-indigo-500/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <Search size={18} />
            Consultar Catálogo Público
          </a>
        </div>

        <p className="mt-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold italic">
          &ldquo;Gestionando el saber que impulsa nuestro futuro.&rdquo;
        </p>
      </div>
    </div>
  );
}
