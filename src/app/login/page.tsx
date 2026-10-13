'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Search, Landmark } from 'lucide-react';

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
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-[#04070e]">
      {/* Fondo institucional: azul marino + aureolas */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f243e]/70 via-[#0a1220] to-[#04070e]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[960px] h-[550px] bg-[#0284c7]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#1e3a8a]/20 rounded-full blur-[110px]" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#c5a059]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Sello superior */}
        <div className="flex items-center justify-center gap-2 mb-6 text-[#94a3b8]">
          <Landmark size={14} className="text-[#c5a059]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
            Honorable Concejo Deliberante de Garupá
          </p>
        </div>

        <div className="bg-[#0a1626]/90 backdrop-blur border border-[#0284c7]/30 rounded-3xl shadow-[0_20px_60px_-15px_rgba(2,132,199,0.35)] overflow-hidden">
          {/* Regla dorada superior */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent" />

          <div className="p-8 md:p-10">
            <div className="flex items-center gap-5 mb-2">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center p-1.5 flex-shrink-0 shadow-lg shadow-sky-950/50 ring-1 ring-[#c5a059]/60">
                <img src="/logo.png" alt="HCD Garupá" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#f1f5f9] tracking-tight leading-none">
                  Biblioteca
                </h1>
                <p className="text-xl font-black text-[#38bdf8] tracking-tight mt-1">
                  Hugo Lopresti
                </p>
              </div>
            </div>
            <p className="text-center text-[#94a3b8] font-bold uppercase tracking-[0.25em] text-[11px] mt-5 mb-7">
              Acceso Administrativo
            </p>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border-l-4 border-rose-500 text-rose-300 text-sm font-bold rounded-r-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-[#94a3b8] mb-2 uppercase tracking-[0.2em]">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#060d18] border border-[#0284c7]/30 focus:border-[#c5a059] rounded-xl py-3 md:py-3.5 px-5 outline-none transition-all text-slate-100 font-semibold placeholder:text-slate-600"
                  placeholder="Ingrese su usuario"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#94a3b8] mb-2 uppercase tracking-[0.2em]">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#060d18] border border-[#0284c7]/30 focus:border-[#c5a059] rounded-xl py-3 md:py-3.5 px-5 pr-14 outline-none transition-all text-slate-100 font-semibold placeholder:text-slate-600"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-[#38bdf8] transition-colors"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0391db] hover:to-[#0284c7] text-white font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-sky-950/50 ring-1 ring-[#c5a059]/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Validando...' : 'Entrar al Sistema'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/consulta-publica"
                className="relative inline-flex items-center gap-2 px-6 py-2.5 md:py-3 rounded-xl bg-[#0e213b] hover:bg-[#122e54] border border-[#0284c7]/50 text-[#38bdf8] hover:text-white font-bold text-sm transition-all overflow-visible"
              >
                <span className="absolute inset-0 rounded-xl bg-[#0284c7]/30 blur-md animate-pulse pointer-events-none" />
                <Search size={18} className="relative" />
                <span className="relative">Consultar Catálogo Público</span>
              </a>
            </div>

            <p className="mt-7 text-center text-[#94a3b8] text-xs font-semibold italic">
              &ldquo;Gestionando el saber que impulsa nuestro futuro.&rdquo;
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600 font-semibold uppercase tracking-[0.2em]">
          HCD Garupá • Sistema de Gestión y Catálogo
        </p>
      </div>
    </div>
  );
}
