'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Camera, Edit2, Activity, UserSquare, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Cadastro() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const router = useRouter();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = useCallback(async (userId: string) => {
    if (!photoFile) return null;
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, photoFile, { upsert: true });

    if (uploadError) {
      console.error('Erro no upload da foto:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  }, [photoFile]);

  // Clean stale session if user is logged in but has no profile
  // or redirect to panel if they are already fully registered
  useEffect(() => {
    async function checkExistingSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('associados')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (data) {
          router.push('/painel-associado');
        } else {
          // If logged in to auth but not in table, sign out to avoid "stale" state errors
          await supabase.auth.signOut();
        }
      }
    }
    checkExistingSession();
  }, [router]);

  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birthDateObj = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(birthDate);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário.');

      // 2. Upload Photo if selected
      const photoUrl = await uploadPhoto(authData.user.id);

      // 3. Store in Database
      const associadoData = {
        full_name: fullName,
        popular_name: formData.get('popularName'),
        birthday: formData.get('birthday'),
        age: currentAge,
        identity_document: formData.get('identityDocument'),
        document_id: formData.get('documentId'),
        email: email,
        phone: formData.get('phone'),
        category: formData.get('category'),
        position: formData.get('position'),
        club: formData.get('club'),
        user_id: authData.user.id,
        photo_url: photoUrl,
        status: 'pendente',
      };

      const { error: dbError } = await supabase
        .from('associados')
        .insert([associadoData]);

      if (dbError) throw dbError;
      
      setStatus('success');
      setTimeout(() => {
        router.push('/painel-associado');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      setStatus('error');
      
      let msg = error.message || 'Erro ao realizar cadastro.';
      
      // Handle specific Supabase / Postgres errors for better UX
      if (msg.includes('already registered')) {
        msg = 'Opa! Esse e-mail já foi cadastrado anteriormente em nosso sistema. Você não precisa se cadastrar novamente. Por favor, vá para a tela de login e entre com sua senha.';
        setStatus('error');
      } else if (msg.includes('duplicate key value')) {
        if (msg.includes('document_id')) {
          msg = 'Este CPF já está cadastrado em nosso sistema.';
        } else {
          msg = 'Algum dos dados informados já consta em nosso cadastro.';
        }
      }

      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-12 mb-12">
      <div className="max-w-3xl w-full space-y-8 bg-surface-container-lowest p-8 sm:p-10 rounded-xl shadow-sm border border-outline-variant/30">
        <div className="text-center">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Junte-se à AHMP</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Cadastre-se para começar sua jornada na AHMP</p>
        </div>
        
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-label-bold">Cadastro realizado com sucesso!</h3>
              <p className="font-body-sm mt-1">Seus dados foram salvos e você será redirecionado para o seu painel.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-label-bold">Erro ao realizar cadastro</h3>
              <p className="font-body-sm mt-1">{errorMessage}</p>
              {errorMessage.includes('já foi cadastrado') && (
                <Link 
                  href="/login"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  Ir para Tela de Login
                </Link>
              )}
            </div>
          </div>
        )}

        <form className="space-y-8 mt-8" onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center pb-6 border-b border-outline-variant/30">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('photoInput')?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container flex items-center justify-center border-4 border-surface-container-lowest shadow-md relative">
                {photoPreview ? (
                  <Image fill src={photoPreview} alt="Preview" className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <User className="text-4xl text-outline w-12 h-12 absolute z-0" />
                    <Image fill src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuATgXfSLnQxQj-2GNUYKkQLpgQZmP56DdhvUgDbW0BtnXgGr9akJCSmVVTQCF9SKOuesL682Ur5C6WCRp7n_tNkoEU6FfC6p9PR6Zsh88p4hKwj-8xgVNSuoQoY4Gb8tL86Qgi-mPGqA72m2jJ3r4WbJjNNlyU9TXBwHfoxLqD946OaD4qen_CSepBpKo-Da9Q_ICpnWA2hlHHR1coFY-TYRYPxg2QTSP9vmNVmXQrOqd4_3eU7S5zaCevstLsGEUMNg409S7_Ow" alt="Athlete Placeholder" className="object-cover opacity-50 group-hover:opacity-30 transition-opacity z-10" referrerPolicy="no-referrer" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Camera className="text-white text-3xl drop-shadow-md w-8 h-8" />
              </div>
              <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg border-2 border-white z-30">
                <Edit2 className="w-4 h-4" />
              </div>
            </div>
            <input 
              type="file" 
              id="photoInput" 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoChange} 
            />
            <button 
              className="mt-4 font-label-bold text-label-bold text-primary hover:text-secondary-container transition-colors" 
              type="button"
              onClick={() => document.getElementById('photoInput')?.click()}
            >
              {photoFile ? 'Alterar Foto' : 'Enviar Foto do Atleta'}
            </button>
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
              <div className="sm:col-span-2">
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="popularName">Nome Popular</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="popularName" name="popularName" placeholder="ex: Mariazinha" type="text" />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="birthday">Data de Nascimento</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-on-surface-variant border" id="birthday" name="birthday" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1">Idade</label>
                <input type="hidden" name="age" value={currentAge !== null ? currentAge.toString() : ''} />
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container py-3 px-4 text-on-surface-variant cursor-not-allowed outline-none font-body-md border font-bold" disabled placeholder="Automático" type="text" value={currentAge !== null ? `${currentAge} anos` : ''} readOnly />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="identityDocument">Identidade (RG)</label>
                <input className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="identityDocument" name="identityDocument" placeholder="00.000.000-0" type="text" />
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="documentId">CPF</label>
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
              <div className="sm:col-span-2 relative">
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="password">Senha de Acesso</label>
                <input 
                  required 
                  minLength={6}
                  className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 pr-12 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" 
                  id="password" 
                  name="password" 
                  placeholder="Mínimo 6 caracteres" 
                  type={showPassword ? "text" : "password"} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                  <option value="adu">Adu</option>
                  <option value="35+">35+</option>
                  <option value="42+">42+</option>
                  <option value="49+">49+</option>
                  <option value="55+">55+</option>
                  <option value="60+">60+</option>
                </select>
              </div>
              <div>
                <label className="block font-label-bold text-label-bold text-on-surface mb-1" htmlFor="position">Posição</label>
                <select className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 px-4 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md border" id="position" name="position" defaultValue="">
                  <option disabled value="">Selecionar Posição</option>
                  <option value="Goleiro">Goleiro</option>
                  <option value="Ponta Esquerda">Ponta Esquerda</option>
                  <option value="Armador Esquerdo">Armador Esquerdo</option>
                  <option value="Central">Central</option>
                  <option value="Pivô">Pivô</option>
                  <option value="Armador Direito">Armador Direito</option>
                  <option value="Ponta Direita">Ponta Direita</option>
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
              className={`w-full sm:w-auto min-w-[200px] bg-[#FF8C00] text-white font-label-bold text-label-bold py-4 px-8 rounded-lg shadow-sm transition-all border-2 border-transparent flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e67e00] hover:shadow-md active:scale-95'}`} 
              type="submit"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
            <div className="mt-4 text-center">
              <p className="font-body-sm text-on-surface-variant">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary font-label-bold hover:underline">
                  Fazer Login
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
