'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Camera, Edit2, Activity, UserSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Cadastro() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    const formData = new FormData(event.currentTarget);
    
    const associadoData = {
      full_name: formData.get('fullName'),
      birthday: formData.get('birthday'),
      document_id: formData.get('documentId'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      category: formData.get('category'),
      position: formData.get('position'),
      club: formData.get('club'),
    };

    try {
      const { error } = await supabase.from('associados').insert([associadoData]);

      if (error) throw error;
      
      setStatus('success');
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-12 mb-12">
      <div className="max-w-3xl w-full space-y-8 bg-surface-container-lowest p-8 sm:p-10 rounded-xl shadow-sm border border-outline-variant/30">
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Junte-se à Liga</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Cadastre-se para começar sua jornada no Handebol Pro</p>
        </div>
        
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-label-bold">Cadastro realizado com sucesso!</h3>
              <p className="font-body-sm mt-1">Seus dados foram salvos no nosso banco de dados. Em breve entraremos em contato.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-label-bold">Erro ao realizar cadastro</h3>
              <p className="font-body-sm mt-1">Verifique se suas chaves do Supabase foram configuradas nos Secrets (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY).</p>
            </div>
          </div>
        )}

        <form className="space-y-8 mt-8" onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center pb-6 border-b border-outline-variant/30">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container flex items-center justify-center border-4 border-surface-container-lowest shadow-md relative">
                <User className="text-4xl text-outline w-12 h-12 absolute z-0" />
                <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuATgXfSLnQxQj-2GNUYKkQLpgQZmP56DdhvUgDbW0BtnXgGr9akJCSmVVTQCF9SKOuesL682Ur5C6WCRp7n_tNkoEU6FfC6p9PR6Zsh88p4hKwj-8xgVNSuoQoY4Gb8tL86Qgi-mPGqA72m2jJ3r4WbJjNNlyU9TXBwHfoxLqD946OaD4qen_CSepBpKo-Da9Q_ICpnWA2hlHHR1coFY-TYRYPxg2QTSP9vmNVmXQrOqd4_3eU7S5zaCevstLsGEUMNg409S7_Ow" alt="Athlete Placeholder" className="object-cover opacity-50 group-hover:opacity-30 transition-opacity z-10" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Camera className="text-white text-3xl drop-shadow-md w-8 h-8" />
              </div>
              <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg border-2 border-white z-30">
                <Edit2 className="w-4 h-4" />
              </div>
            </div>
            <button className="mt-4 font-label-bold text-label-bold text-primary hover:text-secondary-container transition-colors" type="button">Enviar Foto do Atleta</button>
          </div>

          {/* Personal Data */}
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
              <UserSquare className="text-secondary-container w-6 h-6" /> Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="fullName">Nome Completo</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="fullName" name="fullName" placeholder="ex: Maria Silva" type="text" />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="birthday">Data de Nascimento</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-on-surface-variant border" id="birthday" name="birthday" type="date" />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="documentId">ID / CPF</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="documentId" name="documentId" placeholder="000.000.000-00" type="text" />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="email">Email</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="email" name="email" placeholder="maria@exemplo.com" type="email" />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="phone">Celular / WhatsApp</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="phone" name="phone" placeholder="(00) 00000-0000" type="tel" />
              </div>
            </div>
          </div>
          
          <hr className="border-outline-variant/30" />

          {/* Athlete Profile */}
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
              <Activity className="text-secondary-container w-6 h-6" /> Perfil de Atleta
            </h2>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="category">Categoria</label>
                <select className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="category" name="category" defaultValue="">
                  <option disabled value="">Selecionar Categoria</option>
                  <option value="junior">Júnior</option>
                  <option value="senior">Sênior</option>
                  <option value="amateur">Amador</option>
                  <option value="pro">Profissional</option>
                </select>
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="position">Posição</label>
                <select className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="position" name="position" defaultValue="">
                  <option disabled value="">Selecionar Posição</option>
                  <option value="goalkeeper">Goleiro</option>
                  <option value="left_wing">Ponta Esquerda</option>
                  <option value="left_back">Armador Esquerdo</option>
                  <option value="center_back">Central</option>
                  <option value="pivot">Pivô</option>
                  <option value="right_back">Armador Direito</option>
                  <option value="right_wing">Ponta Direita</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="club">Clube / Equipe</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="club" name="club" placeholder="ex: Central City Hand" type="text" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 flex flex-col items-center gap-4">
            <button 
              disabled={isLoading}
              className={`w-full sm:w-auto min-w-[200px] bg-[#FF8C00] text-white font-label-bold text-label-bold py-4 px-8 rounded-lg shadow-sm transition-all border-2 border-transparent ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e67e00] hover:shadow-md active:scale-95'}`} 
              type="submit"
            >
              {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
            <Link className="font-body-md text-body-md text-primary hover:text-secondary-container transition-colors font-semibold mt-2" href="#">Já tem uma conta? Fazer Login</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
