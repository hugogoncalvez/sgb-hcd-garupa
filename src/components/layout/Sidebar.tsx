'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  BarChart3, 
  LogOut,
  Library
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Inicio', href: '/', icon: LayoutDashboard },
  { name: 'Inventario', href: '/catalogo', icon: BookOpen },
  { name: 'Socios', href: '/socios', icon: Users },
  { name: 'Préstamos', href: '/prestamos', icon: ArrowLeftRight },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay solo en móvil */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <aside className={`h-dvh w-64 fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col p-4 gap-2 z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center gap-3 px-2 py-6 mb-6 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 overflow-hidden p-0.5 border border-slate-100 dark:border-slate-700">
          <img src="/logo.png" alt="SGB" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-black text-indigo-600 tracking-tighter leading-tight">SGB</h1>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Concejo Deliberante</p>
        </div>
      </div>

      <nav className="flex-grow space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 font-semibold text-sm ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 shadow-sm border border-indigo-100/50 dark:border-indigo-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1 flex-shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all font-semibold text-sm"
        >
          <LogOut size={20} className="text-rose-400" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
    </>
  );
}
