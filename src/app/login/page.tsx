'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Search, ArrowLeft, ArrowRight, LogIn, AlertCircle, User as UserIcon, BadgeCheck } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userError, setUserError] = useState('');
  const [passError, setPassError] = useState('');
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [closed, setClosed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stampTime, setStampTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'authenticated') return null;

  const goPassword = () => {
    const u = username.trim();
    if (!u) {
      setUserError('Por favor, ingrese su usuario o legajo HCD.');
      return;
    }
    if (u.length < 3) {
      setUserError('El usuario institucional debe poseer al menos 3 caracteres.');
      return;
    }
    setUserError('');
    setPassError('');
    setStampTime(new Date().toLocaleTimeString());
    setFlipped(true);
  };

  const goBack = () => {
    setFlipped(false);
    setPassError('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password) {
      setPassError('Por favor, ingrese su contraseña de personal.');
      return;
    }
    setPassError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', { username, password, redirect: false });
      if (res?.error) {
        setPassError('Error: Contraseña incorrecta para el personal HCD Garupá.');
      } else {
        setClosed(true);
        setTimeout(() => setSuccess(true), 400);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2200);
      }
    } catch (err) {
      setPassError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c16] font-sans antialiased overflow-x-hidden relative flex flex-col justify-between">
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .font-serif2 { font-family: 'EB Garamond', serif; }
        .font-display2 { font-family: 'Cinzel', serif; }
        .perspective-container { perspective: 2000px; }
        .book-wrapper { transform-style: preserve-3d; transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1); }
        .book-closed { transform: rotateY(-35deg) scale(0.92); }
        .flipper-page { transform-style: preserve-3d; transform-origin: left center; transition: transform 1.1s cubic-bezier(0.4, 0, 0.2, 1); }
        .flipper-page.flipped { transform: rotateY(-180deg); }
        .page-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .page-back { transform: rotateY(180deg); }
        .book-spine-shadow { box-shadow: inset 24px 0 35px -10px rgba(12, 21, 39, 0.35); }
        .book-spine-shadow-right { box-shadow: inset -24px 0 35px -10px rgba(12, 21, 39, 0.35); }
        .bg-parchment-pattern {
          background-color: #faf5eb;
          background-image: radial-gradient(#d6c29e 0.75px, transparent 0.75px), radial-gradient(#e0cfb1 0.75px, #faf5eb 0.75px);
          background-size: 30px 30px;
          background-position: 0 0, 15px 15px;
        }
        .page-stack-left { box-shadow: -3px 0 0 #f0e6d2, -6px 0 0 #dfd1b8, -9px 0 0 #cfbea0, -14px 10px 25px rgba(4, 9, 20, 0.55); }
        .page-stack-right { box-shadow: 3px 0 0 #f0e6d2, 6px 0 0 #dfd1b8, 9px 0 0 #cfbea0, 14px 10px 25px rgba(4, 9, 20, 0.55); }
        @keyframes stampIn { 0% { transform: scale(2.2) rotate(-15deg); opacity: 0; } 70% { transform: scale(0.95) rotate(-3deg); opacity: 0.95; } 100% { transform: scale(1) rotate(-4deg); opacity: 0.9; } }
        .stamp-anim { animation: stampIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f243e]/70 via-[#0a1220] to-[#04070e]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[960px] h-[550px] bg-[#0284c7]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#1e3a8a]/20 rounded-full blur-[110px]" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#c5a059]/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#0284c7]/40 flex items-center justify-center p-1 shadow-lg shadow-sky-950/40 overflow-hidden">
            <img src="/logo.png" alt="HCD Garupá" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-bold tracking-tight text-[#f1f5f9] text-base sm:text-lg">
                Biblioteca <span className="text-[#38bdf8]">Hugo Lopresti</span>
              </h1>
              <span className="text-[10px] font-semibold py-0.5 px-2 bg-sky-950/80 text-sky-300 border border-sky-600/40 rounded-full">HCD Garupá</span>
            </div>
            <p className="text-xs text-[#94a3b8]">Honorable Concejo Deliberante de Garupá • Sistema de Gestión y Catálogo</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#cbd5cc]">
          <a className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0e213b] hover:bg-[#122e54] border border-[#0284c7]/50 text-[#38bdf8] hover:text-white font-medium transition-all shadow-md" href="/consulta-publica">
            <Search size={14} />
            <span>Consultar Catálogo Público</span>
          </a>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a1626]/80 border border-[#1e3450] text-[#94a3b8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px]">Sistema Legislativo: <strong>En Línea</strong></span>
          </div>
        </div>
      </header>

      {/* Libro */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-1 perspective-container w-full">
        <div className={`book-wrapper relative w-full max-w-[980px] h-[590px] transition-all duration-1000 ease-out ${closed ? 'book-closed' : ''}`}>
          {/* Tapa de cuero */}
          <div className="absolute -inset-3 sm:-inset-4 bg-[#0a1426] rounded-xl shadow-2xl border-2 border-[#193256] pointer-events-none flex justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#122645_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-60" />
            <div className="absolute inset-1 border border-[#0284c7]/30 rounded-lg pointer-events-none" />
            <div className="absolute inset-2 border border-[#c5a059]/25 rounded-md pointer-events-none" />
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#c5a059]/50 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#c5a059]/50 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#c5a059]/50 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#c5a059]/50 rounded-br-sm pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-48 bg-gradient-to-b from-[#0284c7] to-[#034f7c] shadow-lg rounded-b-sm border-x border-[#38bdf8]/40 z-30 pointer-events-none flex items-end justify-center pb-1">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[8px] border-t-[#0284c7] absolute -bottom-2" />
            </div>
          </div>
          {/* Lomo */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-[#071120] via-[#152742] to-[#071120] z-30 pointer-events-none shadow-2xl flex flex-col justify-between items-center py-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]/60 border border-[#0284c7]" />
            <div className="w-0.5 h-4/5 bg-gradient-to-b from-transparent via-[#38bdf8]/40 to-transparent" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]/60 border border-[#e6ca85]" />
          </div>

          {/* Cuerpo */}
          <div className="relative w-full h-full flex rounded-lg overflow-hidden bg-parchment-pattern border border-[#d2bf9f]">
            {/* Página izquierda: frontispicio */}
            <div className="w-1/2 h-full p-7 sm:p-9 hidden sm:flex flex-col justify-between border-r border-[#d4c1a3] relative page-stack-left bg-[#fcf8f0] book-spine-shadow-right select-none">
              <div className="border-b border-[#ddccb2] pb-3 flex items-center justify-between">
                <span className="text-xs uppercase font-serif2 tracking-[0.18em] text-[#637286]">HCD Garupá • Registro Oficial</span>
                <span className="text-xs font-serif2 italic text-[#8c7454]">Colección Lopresti</span>
              </div>
              <div className="my-auto text-center px-2 py-2">
                <div className="w-20 h-20 mx-auto mb-3 border-2 border-[#16365c] rounded-2xl p-1.5 flex items-center justify-center relative bg-gradient-to-br from-[#0c213a] to-[#071424] shadow-md">
                  <div className="w-full h-full border border-sky-400/40 rounded-xl flex flex-col items-center justify-center text-white bg-white overflow-hidden">
                    <img src="/logo.png" alt="HCD" className="w-full h-full object-contain p-1" />
                  </div>
                  <span className="absolute -bottom-2 bg-[#fcf8f0] px-2 text-[9px] font-display2 text-[#16365c] tracking-widest uppercase border border-[#decbb0] rounded font-semibold">BIBLIOTECA</span>
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#0284c7] block mb-1">ACCESO ADMINISTRATIVO</span>
                <h2 className="font-display2 text-xl sm:text-2xl font-bold tracking-wide text-[#111f33] mb-1">LIBRO DE ACCESO Y REGISTRO</h2>
                <div className="w-16 h-0.5 bg-[#0284c7] mx-auto mb-3" />
                <p className="font-serif2 text-[#475569] text-sm leading-relaxed italic max-w-xs mx-auto mb-4">
                  &ldquo;Gestionando el saber que impulsa nuestro futuro.&rdquo;
                </p>
                <div className="mt-2 mb-3">
                  <a className="inline-flex items-center justify-center gap-2 w-full max-w-[270px] py-2.5 px-4 bg-[#0e213b] hover:bg-[#15345d] text-[#38bdf8] hover:text-white rounded-lg border border-[#0284c7]/60 shadow-md transition-all duration-200 text-xs font-semibold" href="/consulta-publica">
                    <Search size={14} />
                    <span>Consultar Catálogo Público</span>
                  </a>
                  <p className="text-[10px] font-serif2 text-[#78889b] italic mt-1.5">Acceso abierto a vecinos, estudiantes e investigadores</p>
                </div>
                <div className="min-h-[52px] flex items-center justify-center">
                  {flipped ? (
                    <div className="stamp-anim border border-[#0284c7] bg-[#0284c7]/10 rounded-md p-2 text-center max-w-[250px]">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-[#0284c7]">HCD GARUPÁ • REGISTRO CONSIGNADO</div>
                      <div className="text-xs font-serif2 italic font-semibold text-[#111f33]">&laquo;{username}&raquo;</div>
                      <div className="text-[9px] text-[#64748b] mt-0.5">{stampTime} • Pase Autorizado a Clave</div>
                    </div>
                  ) : (
                    <div className="border border-[#1e3a5f]/40 bg-[#0e213b]/5 rounded-md p-2 text-center max-w-[250px]">
                      <div className="text-[10px] font-display2 tracking-widest uppercase font-semibold">Honorable Concejo Deliberante</div>
                      <div className="text-[9px] font-serif2 text-[#486581]">Garupá, Misiones • Fondo Bibliográfico Oficial</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-[#ddccb2] pt-3 flex items-center justify-between text-xs font-serif2 text-[#64748b]">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-[#ede1cb] rounded border border-[#c5b191] text-[10px] text-[#334155]">Enter ↵</kbd>
                  <span>Avanzar / Pasar página</span>
                </span>
                <span className="text-[11px] italic font-serif2">Folio I</span>
              </div>
            </div>

            {/* Página derecha (base): contraseña */}
            <div className="w-full sm:w-1/2 h-full p-7 sm:p-9 flex flex-col justify-between page-stack-right bg-[#fbf7ee] book-spine-shadow relative">
              <div className="border-b border-[#ddccb2] pb-3 flex items-center justify-between">
                <span className="text-xs font-serif2 italic text-[#8c7454]">Paso 2: Validación de Seguridad</span>
                <span className="text-xs uppercase font-serif2 tracking-[0.18em] text-[#637286]">Folio N° 105 • Clave</span>
              </div>
              <div className="my-auto px-3">
                <div className="mb-5">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#0284c7] block mb-1">ACCESO ADMINISTRATIVO</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#111f33]">Contraseña Cifrada</h3>
                  <p className="font-serif2 text-[#556980] text-sm mt-1">
                    Usuario validado: <strong className="text-[#0369a1] font-semibold underline decoration-[#38bdf8]">{username || '—'}</strong>
                  </p>
                </div>
                {passError && (
                  <div className="mb-4 p-2.5 bg-[#5a1d24]/10 border border-[#5a1d24]/30 rounded text-xs font-serif2 text-[#78242c] flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#334155] mb-1.5 flex justify-between items-center">
                      <span>CONTRASEÑA</span>
                      <span className="text-[11px] font-normal lowercase italic text-[#64748b]">clave institucional</span>
                    </label>
                    <div className="relative">
                      <input className="w-full bg-[#f4ecd9] border-2 border-[#c5b191] focus:border-[#0284c7] focus:bg-[#fbf7ee] rounded-lg px-4 py-3 text-[#1e293b] text-base tracking-widest placeholder:text-[#94a3b8] focus:outline-none transition-all shadow-inner pr-12" placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0284c7] p-1 transition-colors" type="button" onClick={() => setShowPassword(!showPassword)} title="Mostrar / Ocultar contraseña">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-2.5">
                    <button className="px-3.5 py-3 border border-[#bfa988] bg-[#ede0c8] hover:bg-[#e4d4b7] text-[#2d3748] font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1 shadow-sm" type="button" onClick={goBack} title="Volver al paso de usuario">
                      <ArrowLeft size={14} />
                      <span>Atrás</span>
                    </button>
                    <button className="flex-1 py-3 px-5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm tracking-wide font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-sky-400/40 disabled:opacity-50" type="submit" disabled={loading}>
                      {loading ? 'Validando en servidor HCD...' : 'Entrar al Sistema'}
                      {!loading && <LogIn size={16} />}
                    </button>
                  </div>
                </form>
              </div>
              <div className="border-t border-[#ddccb2] pt-3 flex items-center justify-between text-xs font-serif2 text-[#64748b]">
                <span className="italic text-[11px]">Seguridad Criptográfica Institucional</span>
                <span className="text-[11px] italic font-serif2">Folio II</span>
              </div>
            </div>

            {/* Hoja abatible */}
            <div className={`flipper-page absolute top-0 right-0 w-full sm:w-1/2 h-full z-20 ${flipped ? 'flipped' : ''}`}>
              <div className="page-face absolute inset-0 w-full h-full p-7 sm:p-9 flex flex-col justify-between bg-parchment-pattern border-l border-[#decbb0] book-spine-shadow page-stack-right">
                <div className="border-b border-[#ddccb2] pb-3 flex items-center justify-between">
                  <span className="text-xs uppercase font-serif2 tracking-[0.18em] text-[#637286]">HCD Garupá • Identificación</span>
                  <span className="text-xs font-serif2 italic text-[#8c7454]">Tomo I • Folio 104-B</span>
                </div>
                <div className="my-auto px-3">
                  <div className="mb-5">
                    <span className="text-xs uppercase tracking-widest font-semibold text-[#0284c7] block mb-1">ACCESO ADMINISTRATIVO</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#111f33]">Personal de Biblioteca</h3>
                    <p className="font-serif2 text-[#556980] text-sm mt-1">Ingrese su usuario registrado o legajo para continuar la autenticación.</p>
                  </div>
                  {userError && (
                    <div className="mb-4 p-2.5 bg-[#5a1d24]/10 border border-[#5a1d24]/30 rounded text-xs font-serif2 text-[#78242c] flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{userError}</span>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#334155] mb-1.5">USUARIO</label>
                      <div className="relative">
                        <input autoFocus value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); goPassword(); } }} className="w-full bg-[#f4ecd9] border-2 border-[#c5b191] focus:border-[#0284c7] focus:bg-[#fbf7ee] rounded-lg px-4 py-3 text-[#1e293b] text-base placeholder:text-[#94a3b8] focus:outline-none transition-all shadow-inner pr-10" placeholder="Ingrese su usuario" type="text" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0284c7] pointer-events-none">
                          <UserIcon size={20} />
                        </div>
                      </div>
                      <p className="text-xs font-serif2 italic text-[#64748b] mt-1.5">💡 Ingrese su nombre de operador registrado.</p>
                    </div>
                    <div className="pt-2">
                      <button onClick={goPassword} className="w-full py-3.5 px-6 bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm tracking-wide font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-sky-400/40" type="button">
                        <span>Pasar Página</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#ddccb2] pt-3 flex items-center justify-between text-xs font-serif2 text-[#64748b]">
                  <span className="italic text-[11px]">Haga clic para voltear al campo de contraseña</span>
                  <span className="text-[11px] italic font-serif2">Folio I-B</span>
                </div>
              </div>
              <div className="page-face page-back absolute inset-0 w-full h-full p-7 sm:p-9 flex flex-col justify-between bg-parchment-pattern border-r border-[#decbb0] book-spine-shadow-right select-none">
                <div className="border-b border-[#ddccb2] pb-3 flex items-center justify-between">
                  <span className="text-xs uppercase font-serif2 tracking-[0.18em] text-[#637286]">Certificación HCD Garupá</span>
                  <span className="text-xs font-serif2 italic text-[#8c7454]">Tomo I • Folio 104-V</span>
                </div>
                <div className="my-auto text-center px-3">
                  <div className="w-20 h-20 mx-auto mb-3 border-2 border-[#0284c7]/40 rounded-full flex items-center justify-center bg-[#0284c7]/5 relative">
                    <BadgeCheck size={40} className="text-[#0284c7]" />
                    <div className="absolute -inset-1 border border-dashed border-[#0284c7]/30 rounded-full" />
                  </div>
                  <h4 className="text-base font-bold text-[#0c2444] uppercase tracking-wide">Usuario Registrado</h4>
                  <p className="font-serif2 text-[#334155] text-base mt-0.5">Operador: <strong className="font-semibold text-[#0284c7]">{username}</strong></p>
                  <div className="mt-4 p-3 bg-[#f2e7d3] border border-[#d2be9f] rounded-lg text-xs text-[#334155] text-left space-y-1">
                    <div className="flex justify-between border-b border-[#decbb0] pb-1">
                      <span>Organismo:</span> <span className="font-semibold text-[#0c2444]">HCD Garupá</span>
                    </div>
                    <div className="flex justify-between border-b border-[#decbb0] pb-1">
                      <span>Unidad:</span> <span className="font-medium text-[#0284c7]">Biblioteca Hugo Lopresti</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado:</span> <span className="text-emerald-700 font-bold">Verificado • Aguardando clave</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#ddccb2] pt-3 flex items-center justify-between text-xs font-serif2 text-[#64748b]">
                  <span className="italic text-[11px]">Reverso del folio precedente</span>
                  <span className="text-[11px] italic font-serif2">Folio I-V</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay éxito */}
          <div className={`absolute inset-0 z-50 bg-[#0a1426] rounded-xl flex flex-col items-center justify-center p-8 text-center transition-opacity duration-700 shadow-2xl border-4 border-[#0284c7]/50 ${success ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`w-24 h-24 rounded-2xl border-2 border-[#38bdf8] flex flex-col items-center justify-center mb-6 bg-[#071324] shadow-inner text-white ${success ? 'stamp-anim' : ''}`}>
              <span className="text-2xl font-black text-[#38bdf8] leading-none">HCD</span>
              <span className="text-xs text-slate-300 font-semibold tracking-wider">Garupá</span>
              <div className="w-8 h-1 bg-[#c5a059] rounded-full mt-1" />
            </div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#38bdf8] font-semibold mb-1">ACCESO CONCEDIDO • HCD GARUPÁ</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#f1f5f9] tracking-tight uppercase mb-2">BIBLIOTECA HUGO LOPRESTI</h3>
            <p className="font-serif2 text-[#e2e8f0] text-base italic mb-6 max-w-md">&ldquo;Gestionando el saber que impulsa nuestro futuro.&rdquo;</p>
            <div className="w-64 bg-[#050c18] h-2 rounded-full overflow-hidden border border-[#0284c7]/40 mb-4">
              <div className="h-full bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#c5a059] transition-all duration-1000 ease-out" style={{ width: success ? '100%' : '0%' }} />
            </div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider">Ingresando al sistema de catalogación y préstamos...</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b] border-t border-[#12233b]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Biblioteca Hugo Lopresti</span>
          <span>•</span>
          <span>Honorable Concejo Deliberante de Garupá (Misiones)</span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[#94a3b8]">
          <span className="italic text-[11px] font-serif2">&ldquo;Gestionando el saber que impulsa nuestro futuro.&rdquo;</span>
          <span>•</span>
          <a className="text-[#38bdf8] hover:underline text-xs" href="/consulta-publica">Catálogo Público</a>
        </div>
      </footer>
    </div>
  );
}
