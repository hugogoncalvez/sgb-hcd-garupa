'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [userError, setUserError] = useState('');
  const [loading, setLoading] = useState(false);
  const [flipped1, setFlipped1] = useState(false);
  const [flipped2, setFlipped2] = useState(false);
  const [closed, setClosed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'authenticated') return null;

  const goPassword = () => {
    if (!username.trim()) {
      setUserError('Por favor, ingrese su usuario o número de legajo.');
      return;
    }
    setUserError('');
    setError('');
    setFlipped1(true);
  };

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
        setError('La contraseña no coincide con los registros del personal HCD.');
      } else {
        setFlipped2(true);
        setClosed(true);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2200);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-[#04070e]">
      <style>{`
        .perspective-container { perspective: 2000px; }
        .book-wrapper { transform-style: preserve-3d; transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1); }
        .book-closed { transform: rotateY(-24deg) scale(0.94); }
        .flipper-page { transform-style: preserve-3d; transform-origin: left center; transition: transform 1.1s cubic-bezier(0.4, 0, 0.2, 1); }
        .flipper-page.flipped { transform: rotateY(-180deg); }
        .page-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .page-back { transform: rotateY(180deg); }
        .bg-parchment {
          background-color: #faf5eb;
          background-image: radial-gradient(#d6c29e 0.75px, transparent 0.75px);
          background-size: 14px 14px;
        }
      `}</style>

      {/* Fondo institucional */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f243e]/70 via-[#0a1226] to-[#04070e]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[960px] h-[550px] bg-[#0284c7]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#c5a059]/10 rounded-full blur-[120px]" />
      </div>

      {/* Sello superior */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 shadow-lg ring-1 ring-[#c5a059]/60">
          <img src="/logo.png" alt="HCD Garupá" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-bold tracking-tight text-[#f1f5f9] text-base sm:text-lg">
            Biblioteca <span className="text-[#38bdf8]">Hugo Lopresti</span>
          </h1>
          <p className="text-[11px] text-[#94a3b8]">Honorable Concejo Deliberante de Garupá • Sistema de Gestión y Catálogo</p>
        </div>
      </div>

      {/* Libro */}
      <div className="relative z-10 perspective-container w-full max-w-3xl">
        <div className={`book-wrapper relative mx-auto w-full max-w-xl aspect-[3/4] sm:aspect-[4/3] ${closed ? 'book-closed' : ''}`}>
          {/* Contratapa / éxito (base) */}
          <div className="absolute inset-0 rounded-r-2xl rounded-l-md bg-parchment border border-[#d6c29e] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0c1527]/25 to-transparent" />
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <CheckCircle2 size={56} className="text-emerald-700 mb-4" />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#967432]">Acceso concedido • HCD Garupá</p>
              <h2 className="text-3xl font-black text-[#1f1a17] mt-2">Biblioteca Hugo Lopresti</h2>
              <p className="text-sm italic text-[#595149] mt-3">&ldquo;Gestionando el saber que impulsa nuestro futuro.&rdquo;</p>
              <p className="text-xs font-semibold text-[#595149] mt-4 animate-pulse">Ingresando al sistema de catalogación y préstamos...</p>
            </div>
          </div>

          {/* Hoja 2: contraseña (frente) / vacía (reverso) */}
          <div className={`flipper-page absolute inset-0 ${flipped2 ? 'flipped' : ''}`}>
            <div className="page-face absolute inset-0 rounded-r-2xl rounded-l-md bg-parchment border border-[#d6c29e] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0c1527]/25 to-transparent" />
              <div className="h-full flex flex-col p-8 sm:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#967432]">Folio N° 105 • Clave</p>
                <h2 className="text-2xl font-black text-[#1f1a17] mt-1">Acceso Administrativo</h2>
                <p className="text-sm text-[#595149] mt-1">Operador: <strong>{username || '—'}</strong> • Aguardando clave</p>
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border-l-4 border-[#8C2D19] text-[#8C2D19] text-sm font-semibold rounded-r-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4 flex-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#595149] mb-1.5 uppercase tracking-[0.15em]">Contraseña — clave institucional</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#FCFAF6] border border-[#D8CEBC] focus:border-[#1B3B2B] rounded-lg py-3 px-4 pr-12 outline-none text-[#1f1a17] font-semibold placeholder:text-[#595149]/60"
                        placeholder="••••••••"
                        required
                        autoFocus={flipped1}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#595149] hover:text-[#1B3B2B]" title={showPassword ? 'Ocultar' : 'Mostrar'}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button type="button" onClick={() => { setFlipped1(false); setError(''); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#595149] text-[#1f1a17] font-bold text-sm hover:bg-[#EAE3D2] transition-colors">
                      <ArrowLeft size={16} /> Atrás
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-[#1B3B2B] hover:bg-[#132B1F] text-[#FCFAF6] font-bold text-sm uppercase tracking-widest py-3 rounded-lg transition-all border border-[#B88E3E] disabled:opacity-50">
                      {loading ? 'Validando...' : 'Entrar al Sistema'}
                    </button>
                  </div>
                </form>
                <p className="text-[11px] text-[#595149] text-center mt-3">Tomo I • Folio 104-V • HCD Garupá</p>
              </div>
            </div>
            <div className="page-face page-back absolute inset-0 rounded-l-2xl rounded-r-md bg-parchment border border-[#d6c29e]" />
          </div>

          {/* Hoja 1: usuario (frente) / reverso decorativo */}
          <div className={`flipper-page absolute inset-0 ${flipped1 ? 'flipped' : ''}`}>
            <div className="page-face absolute inset-0 rounded-r-2xl rounded-l-md bg-parchment border border-[#d6c29e] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0c1527]/25 to-transparent" />
              <div className="h-full flex flex-col p-8 sm:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#967432]">Folio I • Identificación</p>
                <h2 className="text-2xl font-black text-[#1f1a17] mt-1">Acceso Administrativo</h2>
                <p className="text-sm text-[#595149] mt-1">Personal de Biblioteca — ingrese su usuario o legajo.</p>
                {userError && (
                  <div className="mt-4 p-3 bg-red-50 border-l-4 border-[#8C2D19] text-[#8C2D19] text-sm font-semibold rounded-r-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    {userError}
                  </div>
                )}
                <div className="mt-5 flex-1">
                  <label className="block text-[11px] font-bold text-[#595149] mb-1.5 uppercase tracking-[0.15em]">Usuario</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') goPassword(); }}
                    className="w-full bg-[#FCFAF6] border border-[#D8CEBC] focus:border-[#1B3B2B] rounded-lg py-3 px-4 outline-none text-[#1f1a17] font-semibold placeholder:text-[#595149]/60"
                    placeholder="Ej: bibliotecario"
                    autoFocus
                  />
                  <p className="text-xs text-[#595149] mt-2 italic">Sugerencia: use su nombre de operador registrado.</p>
                </div>
                <button onClick={goPassword} className="flex items-center justify-center gap-2 w-full bg-[#1B3B2B] hover:bg-[#132B1F] text-[#FCFAF6] font-bold text-sm uppercase tracking-widest py-3 rounded-lg transition-all border border-[#B88E3E]">
                  Pasar página <ArrowRight size={16} />
                </button>
                <p className="text-[11px] text-[#595149] text-center mt-3">Tomo I • Folio 104-B • HCD Garupá</p>
              </div>
            </div>
            <div className="page-face page-back absolute inset-0 rounded-l-2xl rounded-r-md bg-parchment border border-[#d6c29e] flex items-center justify-center">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#967432]">Reverso del folio precedente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo público + cita */}
      <div className="relative z-10 mt-8 text-center">
        <a href="/consulta-publica" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0e213b] hover:bg-[#122e54] border border-[#0284c7]/50 text-[#38bdf8] hover:text-white font-bold text-sm transition-all">
          Consultar Catálogo Público
        </a>
        <p className="mt-4 text-xs text-[#94a3b8] italic">&ldquo;Gestionando el saber que impulsa nuestro futuro.&rdquo;</p>
      </div>
    </div>
  );
}
