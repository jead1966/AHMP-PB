'use client';

import Link from 'next/link';
import { Search, User, Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="docked full-width top-0 border-b-2 border-slate-200 dark:border-blue-800 bg-white dark:bg-blue-950 shadow-sm dark:shadow-none z-50 sticky">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-black text-blue-900 dark:text-white italic flex items-center">
            AHMP
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link
              href="/"
              className={`font-lexend tracking-tight font-bold text-sm uppercase transition-all duration-200 ${
                isActive('/') 
                  ? 'text-orange-500 dark:text-orange-400 border-b-2 border-orange-500 pb-1' 
                  : 'text-slate-700 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-blue-900'
              }`}
            >
              Início
            </Link>
            <Link
              href="/institucional"
              className={`font-lexend tracking-tight font-bold text-sm uppercase transition-all duration-200 ${
                isActive('/institucional') 
                  ? 'text-orange-500 dark:text-orange-400 border-b-2 border-orange-500 pb-1' 
                  : 'text-slate-700 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-blue-900'
              }`}
            >
              Institucional
            </Link>
            <Link
              href="/contato"
              className={`font-lexend tracking-tight font-bold text-sm uppercase transition-all duration-200 ${
                isActive('/contato') 
                  ? 'text-orange-500 dark:text-orange-400 border-b-2 border-orange-500 pb-1' 
                  : 'text-slate-700 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-blue-900'
              }`}
            >
              Contato
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-700 hover:text-orange-500 transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <div className="hidden md:flex items-center gap-4">
            <button className="text-slate-700 hover:text-orange-500 transition-colors">
              <User className="w-6 h-6" />
            </button>
            <button className="text-slate-700 hover:text-orange-500 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
          </div>
          <Link
            href="/cadastro"
            className="hidden md:inline-block bg-secondary-container text-primary px-6 py-2 rounded-DEFAULT font-label-bold text-label-bold border-2 border-transparent hover:bg-opacity-90 transition-all uppercase tracking-wider"
          >
            Seja Sócio
          </Link>
          <button className="md:hidden text-slate-700">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
