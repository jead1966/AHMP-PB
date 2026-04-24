'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, User, Bell, Menu, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="docked full-width top-0 border-b-2 border-slate-200 dark:border-blue-800 bg-white dark:bg-blue-950 shadow-sm dark:shadow-none z-50 sticky">
      <div className="flex justify-between items-center w-full px-8 py-2 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <div className="relative w-12 h-12">
              <Image 
                src="https://ue5crmwsvgdovcsb.public.blob.vercel-storage.com/logo.png" 
                alt="AHMP Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
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
        <div className="flex items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 mr-2 sm:mr-4 border-r border-slate-200 pr-2 sm:pr-4">
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/painel-associado"
                    className={`flex items-center gap-2 font-lexend font-bold text-xs uppercase transition-all duration-200 py-2 px-2 sm:px-3 rounded-lg ${
                      isActive('/painel-associado') ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-700 hover:text-orange-500 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Minha Área</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className={`flex items-center gap-2 font-lexend font-bold text-xs uppercase transition-all duration-200 py-2 px-2 sm:px-3 rounded-lg ${
                      isActive('/login') ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-700 hover:text-orange-500 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Acesso Sócio</span>
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="text-slate-700 hover:text-orange-500 transition-colors p-2 rounded-full hover:bg-slate-100">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-slate-700 hover:text-orange-500 transition-colors p-2 rounded-full hover:bg-slate-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
            </button>
            
            {!user && (
              <Link
                href="/cadastro"
                className="hidden md:inline-block bg-[#FF8C00] text-white px-6 py-2 rounded-lg font-bold text-xs transition-all uppercase tracking-wider hover:bg-[#e67e00] hover:shadow-md active:scale-95"
              >
                Seja Sócio
              </Link>
            )}

            <button className="md:hidden text-slate-700 p-2 rounded-full hover:bg-slate-100">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
