'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      router.push('/painel-associado');
    } catch (err: any) {
      console.error(err);
      setError('E-mail ou senha incorretos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-container-lowest flex flex-col md:flex-row w-full">
      {/* Left section: Image/Branding */}
      <div className="hidden md:flex w-full md:w-1/2 bg-primary relative items-center justify-center p-12 overflow-hidden overflow-y-hidden pt-24 min-h-[50vh] md:min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00113a] to-[#00265c] opacity-90 z-0"></div>
        {/* Subtle pattern or graphic over background */}
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(253, 139, 0, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(253, 139, 0, 0.1) 0%, transparent 40%)' }}></div>
        
        <div className="relative z-10 w-full max-w-lg text-white flex flex-col items-start pt-16">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mb-8 inline-flex">
            <LogIn className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold font-lexend mb-6 leading-tight">
            Associação de <br/>
            <span className="text-orange-500">Handebol</span> <br/>
            Master
          </h1>
          <p className="text-lg text-blue-100 font-work-sans mb-10 max-w-md leading-relaxed">
            Acesso exclusivo para os associados da AHMP. Gerencie sua conta, pague mensalidades e fique por dentro do mundo do handebol.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-bold tracking-wider uppercase text-blue-200">
            <span className="w-12 h-px bg-orange-500"></span>
            Elevando o esporte
          </div>
        </div>
      </div>

      {/* Right section: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 pt-28 md:pt-12 bg-white min-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md flex flex-col"
        >
          <div className="mb-10 block md:hidden">
            <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6">
              <LogIn className="text-primary w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold font-lexend text-primary mb-2">Login</h1>
            <p className="text-gray-500 font-work-sans">Acesse seu painel de associado</p>
          </div>
          
          <div className="hidden md:block mb-10">
            <h2 className="text-4xl font-bold font-lexend text-primary mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-500 font-work-sans">Faça login na sua conta para continuar</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-800 rounded-xl flex items-start gap-3 border border-red-100 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-4 px-5 text-gray-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-work-sans"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor="password">Senha</label>
                <Link href="#" className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">Esqueceu a senha?</Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-4 px-5 text-gray-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-work-sans"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-[#FF8C00] text-white hover:bg-[#e67e00] rounded-xl font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Entrar na Minha Área <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center font-work-sans text-sm text-gray-500">
            <span className="mb-2 sm:mb-0">Ainda não é associado da AHMP?</span>
            <Link href="/cadastro" className="sm:ml-2 font-bold text-primary hover:text-orange-500 transition-colors underline decoration-2 underline-offset-4">
              Cadastre-se agora
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
