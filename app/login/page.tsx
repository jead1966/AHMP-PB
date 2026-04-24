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
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4 pt-20 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-primary p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00113a] to-[#00265c] opacity-90 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20 mb-4 inline-flex shadow-sm">
              <LogIn className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold font-lexend mb-1">
              Bem-vindo à AHMP
            </h1>
            <p className="text-sm text-blue-100 font-work-sans">
              Área Exclusiva do Associado
            </p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl flex items-start gap-3 border border-red-100 shadow-sm transition-all">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-work-sans text-sm"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="password">Senha</label>
                <Link href="#" className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">Esqueceu a senha?</Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-work-sans text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-bold uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-orange-500/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Entrar na Minha Área <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col text-center font-work-sans text-sm text-slate-500">
            <span className="mb-1">Ainda não é associado da AHMP?</span>
            <Link href="/cadastro" className="font-bold text-blue-800 hover:text-orange-500 transition-colors underline decoration-2 underline-offset-4">
              Faça seu cadastro agora
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
