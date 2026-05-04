'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatBRL } from '@/lib/utils';
import { 
  User, 
  CreditCard, 
  LogOut, 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Upload,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

type Tab = 'dashboard' | 'dados' | 'mensalidades' | 'seguranca';

export default function PainelAssociado() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mensalidades, setMensalidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Form state for profile
  const [formProfile, setFormProfile] = useState({
    full_name: '',
    popular_name: '',
    phone: '',
    position: '',
    club: '',
    document_id: '',
    identity_document: '',
    birthday: '',
    category: ''
  });

  // Password Change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormProfile({
        full_name: profile.full_name || '',
        popular_name: profile.popular_name || '',
        phone: profile.phone || '',
        position: profile.position || '',
        club: profile.club || '',
        document_id: profile.document_id || '',
        identity_document: profile.identity_document || '',
        birthday: profile.birthday || '',
        category: profile.category || ''
      });
    }
  }, [profile]);

  const fetchMensalidades = useCallback(async (silent = false) => {
    if (!user) {
      console.warn('fetchMensalidades: no user');
      return;
    }
    if (!silent) setLoading(true);
    try {
      console.log('Fetching mensalidades for:', user.id);
      const { data, error } = await supabase
        .from('mensalidades')
        .select('*')
        .eq('associado_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('Error fetching mensalidades:', error);
        throw error;
      }
      console.log('Mensalidades fetched:', data?.length);
      setMensalidades(data || []);
    } catch (err) {
      console.error('Erro ao buscar mensalidades:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  const handleUploadReceipt = useCallback(async (mensalidadeId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingId(mensalidadeId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 10);
      const fileName = `${mensalidadeId}-${randomId}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(filePath);

      // 3. Update mensalidade record
      const { error: updateError } = await supabase
        .from('mensalidades')
        .update({ status: 'em_analise' })
        .eq('id', mensalidadeId);

      if (updateError) throw updateError;

      setSuccessMsg('Comprovante enviado com sucesso! Está em análise.');
      await fetchMensalidades();
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setErrorMsg(err.message || 'Erro ao enviar comprovante. Verifique o tamanho do arquivo.');
    } finally {
      setUploadingId(null);
      // clear input
      event.target.value = '';
    }
  }, [user, fetchMensalidades]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => fetchMensalidades(true));
    }
  }, [user, fetchMensalidades]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpdateData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const updates = {
      full_name: formProfile.full_name,
      popular_name: formProfile.popular_name,
      phone: formProfile.phone,
      position: formProfile.position,
      club: formProfile.club,
      document_id: formProfile.document_id,
      identity_document: formProfile.identity_document,
      birthday: formProfile.birthday,
      category: formProfile.category,
    };

    try {
      const { error } = await supabase
        .from('associados')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      setSuccessMsg('Dados atualizados com sucesso!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao atualizar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      setSuccessMsg('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Analytics Helpers
  const paidCount = mensalidades.filter(m => m.status === 'paga').length;
  const pendingCount = mensalidades.filter(m => m.status === 'pendente' || m.status === 'atrasada').length;
  
  const chartData = mensalidades.slice(0, 12).reverse().map(m => ({
    name: `${m.month}/${String(m.year).slice(-2)}`,
    valor: m.amount,
    status: m.status
  }));

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dados', label: 'Meus Dados', icon: User },
    { id: 'mensalidades', label: 'Mensalidades', icon: CreditCard },
    { id: 'seguranca', label: 'Segurança', icon: Lock },
  ];

  return (
    <main className="min-h-screen bg-surface-container-lowest pt-28 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-outline-variant p-4 shadow-sm sticky top-28">
            <div className="flex items-center gap-3 px-3 py-4 border-b border-outline-variant mb-4">
              <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-primary font-bold text-xl uppercase overflow-hidden relative">
                {profile?.photo_url ? (
                  <Image fill src={`${profile.photo_url}?t=${new Date().getTime()}`} alt="Foto" className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile?.full_name?.[0] || user.email?.[0] || 'U'
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-on-surface truncate">{profile?.popular_name || profile?.full_name || 'Usuário'}</p>
                <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase ${
                    activeTab === item.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm uppercase text-red-600 hover:bg-red-50 transition-all mt-4"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-grow">
          {!authLoading && user && !profile && (
            <div className="mb-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-2xl text-orange-800 flex items-start gap-4 shadow-sm">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-1">Atenção: Perfil não encontrado</h3>
                <p className="text-sm">Identificamos que sua conta está logada, mas não encontramos seus dados de associado. Isso pode ocorrer se o cadastro não foi finalizado. Por favor, tente sair e entrar novamente ou contate a administração.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-orange-700 transition-colors"
                >
                  Recarregar Página
                </button>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-on-surface-variant">Pagas</p>
                        <p className="text-2xl font-bold text-on-surface">{paidCount}</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-700">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-on-surface-variant">Pendentes</p>
                        <p className="text-2xl font-bold text-on-surface">{pendingCount}</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-primary">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-on-surface-variant">Status</p>
                        <p className="text-xl font-bold text-primary uppercase">{profile?.status || '...'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-white p-8 rounded-2xl border border-outline-variant shadow-sm">
                    <h2 className="text-2xl font-bold text-on-surface mb-6 uppercase">Fluxo de Pagamentos</h2>
                    <div className="h-[300px] w-full">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" fontSize={12} stroke="#6B7280" />
                            <YAxis hide />
                            <Tooltip 
                              cursor={{ fill: 'transparent' }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 rounded-lg border border-outline shadow-lg text-sm">
                                      <p className="font-bold">{payload[0].payload.name}</p>
                                      <p className="text-primary">{formatBRL(payload[0].value as number)}</p>
                                      <p className={payload[0].payload.status === 'paga' ? 'text-green-600' : 'text-orange-600'}>
                                        {payload[0].payload.status.toUpperCase()}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.status === 'paga' ? '#22C55E' : '#F97316'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-on-surface-variant gap-2 bg-surface-container/30 rounded-xl border border-dashed border-outline">
                          <AlertCircle className="w-8 h-8 opacity-20" />
                          <p>Nenhum dado de mensalidade disponível</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                      <h2 className="text-xl font-bold text-on-surface uppercase">Mensalidades Recentes</h2>
                      <button onClick={() => setActiveTab('mensalidades')} className="text-primary font-bold text-sm uppercase flex items-center gap-1 hover:underline">
                        Ver tudo <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-outline-variant">
                      {mensalidades.slice(0, 3).map((m) => (
                        <div key={m.id} className="p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.status === 'paga' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">{m.month}/{m.year}</p>
                              <p className="text-xs text-on-surface-variant">Referente a Mensalidade</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-on-surface">{formatBRL(m.amount)}</p>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${m.status === 'paga' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {mensalidades.length === 0 && (
                        <p className="p-8 text-center text-on-surface-variant italic">Histórico de mensalidades em branco.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'dados' && (
                <div className="bg-white p-8 rounded-2xl border border-outline-variant shadow-sm">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant">
                    <h2 className="text-2xl font-bold text-on-surface uppercase">Meus Dados Cadastrais</h2>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
                      ID: {profile?.id || '...'}
                    </div>
                  </div>
                  
                  {successMsg && (
                    <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl flex items-center gap-3 text-sm border border-green-200">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <p>{successMsg}</p>
                    </div>
                  )}

                  <form onSubmit={handleUpdateData} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="full_name">Nome Completo</label>
                        <div className="relative">
                          <input 
                            name="full_name" 
                            id="full_name" 
                            className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                            value={formProfile.full_name}
                            onChange={(e) => setFormProfile({...formProfile, full_name: e.target.value})}
                          />
                          <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="popularName">Nome Popular</label>
                        <div className="relative">
                          <input 
                            name="popularName" 
                            id="popularName" 
                            className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                            value={formProfile.popular_name}
                            onChange={(e) => setFormProfile({...formProfile, popular_name: e.target.value})}
                          />
                          <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase">E-mail de Login</label>
                        <div className="relative">
                          <input className="w-full rounded-xl border border-outline bg-gray-50 py-3 px-4 text-on-surface-variant cursor-not-allowed outline-none" value={user.email || ''} readOnly />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-40" />
                        </div>
                      </div>
                      <div className="md:col-span-2 p-6 bg-surface-container rounded-2xl border border-outline-variant flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md relative overflow-hidden group">
                          {profile?.photo_url ? (
                            <Image fill src={`${profile.photo_url}?t=${new Date().getTime()}`} alt="Foto" className="object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User className="w-12 h-12 text-outline absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="text-white w-8 h-8" />
                          </div>
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !user) return;
                              setLoading(true);
                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                                const filePath = fileName;
                                const { error: uploadError } = await supabase.storage
                                  .from('avatars')
                                  .upload(filePath, file, { upsert: true });
                                
                                if (uploadError) throw uploadError;
                                
                                const { data: { publicUrl } } = supabase.storage
                                  .from('avatars')
                                  .getPublicUrl(filePath);
                                
                                const { error: dbError } = await supabase
                                  .from('associados')
                                  .update({ 
                                    photo_url: publicUrl,
                                    user_id: user.id 
                                  })
                                  .eq('id', profile.id);
                                
                                if (dbError) throw dbError;
                                setSuccessMsg('Foto atualizada com sucesso!');
                                setTimeout(() => window.location.reload(), 1000);
                              } catch (err: any) {
                                console.error('Erro detalhado:', err);
                                setErrorMsg(err.message || 'Erro ao atualizar foto.');
                              } finally {
                                setLoading(false);
                              }
                            }}
                          />
                        </div>
                        <div className="text-center md:text-left">
                          <h4 className="font-bold text-on-surface uppercase">Foto do Perfil</h4>
                          <p className="text-sm text-on-surface-variant mb-2">Clique na imagem ao lado para alterar sua foto.</p>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-tighter bg-primary/10 px-2 py-0.5 rounded inline-block">Formatos: JPG, PNG • Max: 5MB</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="document_id">CPF</label>
                        <div className="relative">
                          <input 
                            name="document_id" 
                            id="document_id" 
                            className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                            value={formProfile.document_id}
                            onChange={(e) => setFormProfile({...formProfile, document_id: e.target.value})}
                          />
                          <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="identity_document">No. Identidade (RG)</label>
                        <div className="relative">
                          <input 
                            name="identity_document" 
                            id="identity_document" 
                            className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                            value={formProfile.identity_document}
                            onChange={(e) => setFormProfile({...formProfile, identity_document: e.target.value})}
                          />
                          <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="birthday">Data de Nascimento</label>
                        <input 
                          type="date"
                          name="birthday" 
                          id="birthday" 
                          className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                          value={formProfile.birthday}
                          onChange={(e) => setFormProfile({...formProfile, birthday: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="category">Categoria</label>
                        <select 
                          name="category" 
                          id="category" 
                          className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          value={formProfile.category}
                          onChange={(e) => setFormProfile({...formProfile, category: e.target.value})}
                        >
                          <option value="">Selecionar Categoria</option>
                          <option value="adu">Adu</option>
                          <option value="35+">35+</option>
                          <option value="42+">42+</option>
                          <option value="49+">49+</option>
                          <option value="55+">55+</option>
                          <option value="60+">60+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="position">Posição / Função</label>
                        <select 
                          name="position" 
                          id="position" 
                          className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          value={formProfile.position}
                          onChange={(e) => setFormProfile({...formProfile, position: e.target.value})}
                        >
                          <option value="">Selecionar Posição</option>
                          <option value="Goleiro">Goleiro</option>
                          <option value="Ponta Esquerda">Ponta Esquerda</option>
                          <option value="Armador Esquerdo">Armador Esquerdo</option>
                          <option value="Central">Central</option>
                          <option value="Pivô">Pivô</option>
                          <option value="Armador Direito">Armador Direito</option>
                          <option value="Ponta Direita">Ponta Direita</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="phone">Telefone / WhatsApp</label>
                        <div className="relative">
                          <input 
                            name="phone" 
                            id="phone" 
                            className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                            value={formProfile.phone}
                            onChange={(e) => setFormProfile({...formProfile, phone: e.target.value})}
                          />
                          <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase" htmlFor="club">Clube / Equipe Atual</label>
                        <div className="relative">
                          <input 
                            name="club" 
                            id="club" 
                            className="w-full rounded-xl border border-outline bg-white py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                            value={formProfile.club}
                            onChange={(e) => setFormProfile({...formProfile, club: e.target.value})}
                            placeholder="Nome da equipe"
                          />
                          <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-outline-variant flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase text-sm hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Atualizar Cadastro
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'mensalidades' && (
                <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-outline-variant">
                    <h2 className="text-2xl font-bold text-on-surface uppercase">Histórico Completo</h2>
                    {successMsg && (
                      <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg flex items-center gap-2 text-sm border border-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                        <p>{successMsg}</p>
                      </div>
                    )}
                    {errorMsg && (
                      <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg flex items-center gap-2 text-sm border border-red-200">
                        <AlertCircle className="w-4 h-4" />
                        <p>{errorMsg}</p>
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-outline-variant">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Mês/Ano</th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Valor</th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase">Data Pgto</th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {mensalidades.map((m) => (
                          <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-on-surface">{m.month}/{m.year}</td>
                            <td className="px-6 py-4 text-on-surface">{formatBRL(m.amount)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                m.status === 'paga' ? 'bg-green-100 text-green-700' : m.status === 'em_analise' ? 'bg-blue-100 text-blue-700' : m.status === 'pendente' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {m.status === 'em_analise' ? 'em análise' : m.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant text-sm">
                              {m.payment_date ? new Date(m.payment_date).toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {(m.status === 'pendente' || m.status === 'atrasada') && (
                                <div className="relative inline-block">
                                  <input
                                    type="file"
                                    id={`upload-${m.id}`}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleUploadReceipt(m.id, e)}
                                    disabled={uploadingId === m.id}
                                  />
                                  <label
                                    htmlFor={`upload-${m.id}`}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 rounded-lg text-xs font-bold uppercase cursor-pointer transition-colors ${uploadingId === m.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {uploadingId === m.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Upload className="w-3 h-3" />
                                    )}
                                    {uploadingId === m.id ? 'Enviando...' : 'Enviar Comprovante'}
                                  </label>
                                </div>
                              )}
                              {m.status === 'em_analise' && m.receipt_url && (
                                <a 
                                  href={m.receipt_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold uppercase transition-colors"
                                >
                                  Ver Comprovante
                                </a>
                              )}
                              {m.status === 'paga' && m.receipt_url && (
                                <a 
                                  href={m.receipt_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-green-600 font-bold uppercase hover:underline"
                                >
                                  Ver Recibo
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                        {mensalidades.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant italic">
                              Nenhuma mensalidade encontrada.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'seguranca' && (
                <div className="bg-white p-8 rounded-2xl border border-outline-variant shadow-sm min-h-[500px]">
                  <h2 className="text-2xl font-bold text-on-surface mb-8 border-b pb-4 border-outline-variant uppercase font-lexend">Alterar Senha de Acesso</h2>
                  
                  {successMsg && (
                    <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl flex items-center gap-3 text-sm border border-green-200">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <p>{successMsg}</p>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl flex items-center gap-3 text-sm border border-red-200">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-6 rounded-xl mb-8 border border-blue-100 flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Lock className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-blue-800 font-medium leading-relaxed">
                      Para sua segurança, escolha uma senha forte com pelo menos 6 caracteres, incluindo letras e números se possível.
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="max-w-2xl space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-on-surface-variant mb-2 uppercase tracking-widest font-lexend">Nova Senha</label>
                        <div className="relative">
                          <input 
                            type={showPass ? "text" : "password"} 
                            required
                            minLength={6}
                            className="w-full rounded-xl border border-outline bg-white py-4 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none pr-12 font-medium" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nova senha"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-on-surface-variant mb-2 uppercase tracking-widest font-lexend">Confirmar Senha</label>
                        <div className="relative">
                          <input 
                            type={showPass ? "text" : "password"} 
                            required
                            minLength={6}
                            className="w-full rounded-xl border border-outline bg-white py-4 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none pr-12 font-medium" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a nova senha"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"
                          >
                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 flex justify-start">
                      <button
                        type="submit"
                        disabled={loading || !newPassword || !confirmPassword}
                        className="w-full sm:w-auto min-w-[240px] bg-primary text-white py-4 px-8 rounded-xl font-black uppercase text-sm hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Atualizando...
                          </>
                        ) : (
                          "Atualizar Minha Senha"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
