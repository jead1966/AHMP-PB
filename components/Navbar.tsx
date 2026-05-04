'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, User, Bell, Menu, LayoutDashboard, Lock, X, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isActive = (path: string) => pathname === path;
  const closeMobileMenu = () => setShowMobileMenu(false);

  const handleAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAdminError('');

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', adminUser)
        .eq('password', adminPass)
        .single();

      if (error) {
        console.error('Erro de login admin:', error);
        const errorMessage = error.message || '';
        if (error.code === 'PGRST116') {
          setAdminError('Usuário ou senha incorretos.');
        } else if (errorMessage.toLowerCase().includes('relation "usuarios" does not exist') || errorMessage.toLowerCase().includes('não existe')) {
          setAdminError('Erro de sistema: A tabela "usuarios" não foi encontrada. Por favor, execute o script SQL de criação no seu dashboard do Supabase.');
        } else {
          setAdminError(`Erro ao tentar acessar: ${errorMessage || 'Verifique sua conexão.'}`);
        }
        return;
      }

      if (!data) {
        setAdminError('Credenciais inválidas!');
        return;
      }

      setShowAdminModal(false);
      setAdminUser('');
      setAdminPass('');
      setAdminError('');
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('adminProfile', JSON.stringify(data));
      router.push('/admin');
    } catch (err) {
      console.error(err);
      setAdminError('Erro ao processar login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <header className="docked full-width top-0 border-b-2 border-[#001640] bg-[#002366] shadow-sm z-50 sticky">
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
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Início
            </Link>
            <Link
              href="/institucional"
              className={`font-lexend tracking-tight font-bold text-sm uppercase transition-all duration-200 ${
                isActive('/institucional') 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Institucional
            </Link>
            <Link
              href="/contato"
              className={`font-lexend tracking-tight font-bold text-sm uppercase transition-all duration-200 ${
                isActive('/contato') 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Contato
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 mr-2 sm:mr-4 border-r border-[#001640] pr-2 sm:pr-4">
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/painel-associado"
                    className={`flex items-center gap-2 font-lexend font-bold text-xs uppercase transition-all duration-200 py-2 px-2 sm:px-3 rounded-lg ${
                      isActive('/painel-associado') ? 'bg-orange-500 text-white shadow-sm' : 'text-white hover:bg-[#001640]'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Minha Área</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className={`flex items-center gap-2 font-lexend font-bold text-xs uppercase transition-all duration-200 py-2 px-2 sm:px-3 rounded-lg ${
                      isActive('/login') ? 'bg-orange-500 text-white shadow-sm' : 'text-white hover:bg-[#001640]'
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
            <button onClick={() => setShowAdminModal(true)} className="text-white hover:bg-[#001640] transition-colors p-2 rounded-full">
              <Lock className="w-5 h-5" />
            </button>
            
            {!user && (
              <Link
                href="/cadastro"
                className="hidden md:inline-block bg-[#FF8C00] text-white px-6 py-2 rounded-lg font-bold text-xs transition-all uppercase tracking-wider hover:bg-[#e67e00] hover:shadow-md active:scale-95"
              >
                Seja Sócio
              </Link>
            )}

            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white p-2 rounded-full hover:bg-[#001640]"
            >
              {showMobileMenu ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 top-[66px] bg-white z-[60] animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-6 gap-4">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`font-lexend font-bold text-lg p-3 rounded-xl transition-colors ${
                isActive('/') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Início
            </Link>
            <Link
              href="/institucional"
              onClick={closeMobileMenu}
              className={`font-lexend font-bold text-lg p-3 rounded-xl transition-colors ${
                isActive('/institucional') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Institucional
            </Link>
            <Link
              href="/contato"
              onClick={closeMobileMenu}
              className={`font-lexend font-bold text-lg p-3 rounded-xl transition-colors ${
                isActive('/contato') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Contato
            </Link>
            <div className="h-px bg-slate-100 my-2"></div>
            {user ? (
              <Link
                href="/painel-associado"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-3 bg-orange-500 text-white p-4 rounded-xl font-bold text-base transition-all shadow-sm active:scale-[0.98]"
              >
                <LayoutDashboard className="w-5 h-5" />
                Minha Área
              </Link>
            ) : (
              <>
                <Link
                  href="/cadastro"
                  onClick={closeMobileMenu}
                  className="bg-orange-500 text-white p-4 rounded-xl font-bold text-base text-center transition-all shadow-sm active:scale-[0.98]"
                >
                  Seja Sócio
                </Link>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-3 border-2 border-slate-200 text-slate-700 p-4 rounded-xl font-bold text-base transition-all hover:bg-slate-50"
                >
                  <User className="w-5 h-5" />
                  Acesso Sócio
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>

    {showAdminModal && (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-[95vw] max-w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-lexend font-bold text-xl text-slate-800 flex items-center gap-2">
                <Lock className="w-6 h-6 text-orange-500" />
                Acesso Restrito
              </h3>
              <button 
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminError('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminAccess} className="space-y-4">
              {adminError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                  {adminError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="adminUser">
                  Usuário
                </label>
                <input
                  id="adminUser"
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 py-3.5 px-4 text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-base"
                  placeholder="Seu usuário"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="adminPass">
                  Senha
                </label>
                <input
                  id="adminPass"
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 py-3.5 px-4 text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-base"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                Acessar Painel Admin
              </button>
            </form>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
