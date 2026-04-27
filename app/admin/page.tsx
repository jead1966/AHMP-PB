'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  CreditCard, 
  LogOut, 
  LayoutDashboard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Search,
  FileCheck,
  TrendingUp,
  XCircle,
  PlusCircle,
  Clock,
  Check,
  X,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'dashboard' | 'associados' | 'mensalidades' | 'usuarios';

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAdminLocally, setIsAdminLocally] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isAdmin') === 'true';
    }
    return false;
  });
  
  const [associados, setAssociados] = useState<any[]>([]);
  const [mensalidades, setMensalidades] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Search states
  const [searchAssociados, setSearchAssociados] = useState('');
  const [searchMensalidades, setSearchMensalidades] = useState('');
  const [searchUsuarios, setSearchUsuarios] = useState('');

  // User Form states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    perfil: 'USUARIO'
  });

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const { data: assocData, error: assocError } = await supabase
        .from('associados')
        .select('*')
        .order('created_at', { ascending: false });

      if (assocError) throw assocError;
      setAssociados(assocData || []);

      const { data: mensData, error: mensError } = await supabase
        .from('mensalidades')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (mensError) throw mensError;

      const associadosMap = new Map();
      (assocData || []).forEach(a => {
        associadosMap.set(a.user_id, a);
      });

      const mappedMensalidades = (mensData || []).map(m => ({
        ...m,
        associados: associadosMap.get(m.associado_id) || null
      }));

      setMensalidades(mappedMensalidades);

      // Fetch admin users
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .order('username', { ascending: true });

      if (userError) throw userError;
      setUsuarios(userData || []);

    } catch (err) {
      console.error('Erro ao buscar dados dashboard admin:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user && !isAdminLocally) {
      router.push('/login');
    }
  }, [user, authLoading, router, isAdminLocally]);

  useEffect(() => {
    if (user || isAdminLocally) {
      void fetchData();
    }
  }, [user, isAdminLocally, activeTab, fetchData]);

  const handleLogout = async () => {
    sessionStorage.removeItem('isAdmin');
    await supabase.auth.signOut();
    router.push('/');
  };

  const approveMensalidade = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('mensalidades')
        .update({ 
          status: 'paga',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao aprovar mensalidade');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectMensalidade = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('mensalidades')
        .update({ 
          status: 'pendente',
          receipt_url: null 
        })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao rejeitar mensalidade');
    } finally {
      setActionLoading(null);
    }
  };

  const updateAssociadoStatus = async (userId: string, newStatus: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('associados')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar associado');
    } finally {
      setActionLoading(null);
    }
  };

  const gerarMensalidadeMesAtual = async () => {
    if (!confirm('Deseja gerar a mensalidade do mês atual para todos os associados ativos?')) return;
    
    setActionLoading('gerar_mensalidades');
    try {
      const ativos = associados.filter(a => a.status === 'ativo');
      const hoje = new Date();
      const mes = hoje.getMonth() + 1;
      const ano = hoje.getFullYear();
      const valorBase = 50.00; // Valor padrão
      
      let promises = [];
      
      for (const associado of ativos) {
        // Verifica se já existe
        const existente = mensalidades.find(m => m.associado_id === associado.user_id && m.month === mes && m.year === ano);
        
        if (!existente) {
          promises.push(
            supabase.from('mensalidades').insert({
              associado_id: associado.user_id,
              month: mes,
              year: ano,
              amount: valorBase,
              status: 'pendente',
              due_date: new Date(ano, mes - 1, 15).toISOString().split('T')[0] // Vence dia 15
            })
          );
        }
      }
      
      await Promise.all(promises);
      alert(`${promises.length} mensalidades geradas com sucesso!`);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar mensalidades.');
    } finally {
      setActionLoading(null);
    }
  };

  const saveUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save_user');
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('usuarios')
          .update({
            username: userForm.username,
            password: userForm.password,
            perfil: userForm.perfil,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('usuarios')
          .insert([userForm]);
        if (error) throw error;
      }
      
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ username: '', password: '', perfil: 'USUARIO' });
      await fetchData();
      alert('Usuário salvo com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar usuário. Verifique se o username já existe.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUsuario = async (id: string) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir usuário.');
    } finally {
      setActionLoading(null);
    }
  };

  const openUserModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserForm({
        username: (userToEdit as any).username,
        password: (userToEdit as any).password,
        perfil: (userToEdit as any).perfil
      });
    } else {
      setEditingUser(null);
      setUserForm({ username: '', password: '', perfil: 'USUARIO' });
    }
    setShowUserModal(true);
  };

  const filteredAssociados = useMemo(() => {
    return associados.filter(a => 
      a.full_name?.toLowerCase().includes(searchAssociados.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchAssociados.toLowerCase()) ||
      a.popular_name?.toLowerCase().includes(searchAssociados.toLowerCase())
    );
  }, [associados, searchAssociados]);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(u => 
      u.username?.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
      u.perfil?.toLowerCase().includes(searchUsuarios.toLowerCase())
    );
  }, [usuarios, searchUsuarios]);

  const emAnalise = useMemo(() => mensalidades.filter(m => m.status === 'em_analise'), [mensalidades]);
  
  const filteredHistorico = useMemo(() => {
    let hist = mensalidades.filter(m => m.status !== 'em_analise');
    if (searchMensalidades) {
      hist = hist.filter(m => 
        m.associados?.full_name?.toLowerCase().includes(searchMensalidades.toLowerCase()) ||
        m.associados?.popular_name?.toLowerCase().includes(searchMensalidades.toLowerCase())
      );
    }
    return hist.slice(0, 50);
  }, [mensalidades, searchMensalidades]);

  if (authLoading || (!user && !isAdminLocally)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'associados', label: 'Associados', icon: Users },
    { id: 'mensalidades', label: 'Financeiro', icon: CreditCard },
    { id: 'usuarios', label: 'Usuários Admin', icon: Shield },
  ];

  const associadosAtivos = associados.filter(a => a.status === 'ativo').length;
  const associadosPendentes = associados.filter(a => a.status === 'pendente').length;
  const arrecadacaoMes = mensalidades
    .filter(m => m.status === 'paga' && m.month === new Date().getMonth() + 1 && m.year === new Date().getFullYear())
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-8 font-work-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-24 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  A
                </div>
                <div>
                  <h2 className="font-lexend font-bold text-slate-800 text-lg">Painel Admin</h2>
                  <p className="text-xs text-slate-500">Gestão AHMP</p>
                </div>
              </div>
            </div>
            
            <nav className="p-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg font-medium transition-all text-sm ${
                    activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.label}
                  </div>
                  {item.id === 'mensalidades' && emAnalise.length > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {emAnalise.length}
                    </span>
                  )}
                  {item.id === 'associados' && associadosPendentes > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {associadosPendentes}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair do Sistema
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow min-w-0">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Carregando dados do sistema...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* --- TAB: DASHBOARD --- */}
                {activeTab === 'dashboard' && (
                  <>
                    <h1 className="text-3xl font-bold font-lexend text-slate-800">Visão Geral</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Associados</p>
                            <h3 className="text-3xl font-bold text-slate-800">{associados.length}</h3>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex gap-4 text-sm mt-2">
                          <div className="flex items-center gap-1.5 text-green-600 font-medium">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div> {associadosAtivos} ativos
                          </div>
                          <div className="flex items-center gap-1.5 text-orange-500 font-medium">
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div> {associadosPendentes} pendentes
                          </div>
                        </div>
                      </div>
                      
                      <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${emAnalise.length > 0 ? 'ring-2 ring-orange-400/50' : ''}`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-orange-50 text-orange-500 rounded-lg">
                            <FileCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Para Análise</p>
                            <h3 className="text-3xl font-bold text-slate-800">{emAnalise.length}</h3>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 text-sm mt-2">
                          <p className="text-slate-500">Comprovantes aguardando aprovação.</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Receita do Mês</p>
                            <h3 className="text-3xl font-bold text-slate-800">R$ {arrecadacaoMes.toFixed(2)}</h3>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 text-sm mt-2">
                          <p className="text-slate-500">Mensalidades pagas no mês atual.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* --- TAB: ASSOCIADOS --- */}
                {activeTab === 'associados' && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)] min-h-[600px]">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                      <div>
                        <h2 className="text-xl font-bold font-lexend text-slate-800">Gerenciar Associados</h2>
                        <p className="text-sm text-slate-500 mt-1">Lista completa de membros da associação.</p>
                      </div>
                      <div className="relative w-full sm:w-72 text-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={searchAssociados}
                          onChange={e => setSearchAssociados(e.target.value)}
                          placeholder="Buscar por nome, email..." 
                          className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato / Categoria</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredAssociados.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                Nenhum associado encontrado para &quot;{searchAssociados}&quot;.
                              </td>
                            </tr>
                          ) : (
                            filteredAssociados.map((a) => (
                              <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex flex-shrink-0 items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                      {a.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 text-sm">{a.full_name}</p>
                                      <p className="text-xs text-slate-500">Apelido: {a.popular_name || '-'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm text-slate-700">{a.email}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{a.category || '-'} • {a.position || '-'}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                    a.status === 'ativo' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    a.status === 'pendente' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                    {a.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {a.status !== 'ativo' && (
                                    <button 
                                      onClick={() => updateAssociadoStatus(a.user_id, 'ativo')}
                                      disabled={actionLoading === a.user_id}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors border border-blue-100 disabled:opacity-50"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Aprovar
                                    </button>
                                  )}
                                  {a.status === 'ativo' && (
                                    <button 
                                      onClick={() => updateAssociadoStatus(a.user_id, 'inativo')}
                                      disabled={actionLoading === a.user_id}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-lg text-xs font-bold transition-colors border border-slate-200 hover:border-red-200 disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                    >
                                      <X className="w-3.5 h-3.5" /> Inativar
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- TAB: MENSALIDADES / FINANCEIRO --- */}
                {activeTab === 'mensalidades' && (
                  <div className="space-y-6">
                    {/* Top Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div>
                        <h2 className="text-xl font-bold font-lexend text-slate-800">Gestão Financeira</h2>
                        <p className="text-sm text-slate-500">Administre pagamentos e comprovantes.</p>
                      </div>
                      <button
                        onClick={gerarMensalidadeMesAtual}
                        disabled={actionLoading === 'gerar_mensalidades'}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 focus:ring-4 focus:ring-blue-500/20"
                      >
                        {actionLoading === 'gerar_mensalidades' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlusCircle className="w-4 h-4" />
                        )}
                        Gerar Mensalidades do Mês
                      </button>
                    </div>

                    {/* Comprovantes Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-200 bg-orange-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-orange-500" />
                          <h3 className="text-lg font-bold font-lexend text-slate-800">Comprovantes em Análise</h3>
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">{emAnalise.length}</span>
                        </div>
                      </div>
                      
                      {emAnalise.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Associado</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Referência</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {emAnalise.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800 text-sm">{m.associados?.popular_name || m.associados?.full_name}</p>
                                    <p className="text-xs text-slate-500">{m.associados?.email}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-slate-800">{String(m.month).padStart(2, '0')} / {m.year}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-slate-800">R$ {m.amount.toFixed(2)}</p>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {m.receipt_url && (
                                        <a 
                                          href={m.receipt_url} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                          title="Visualizar Comprovante"
                                        >
                                          <Search className="w-4 h-4" />
                                        </a>
                                      )}
                                      <button 
                                        onClick={() => approveMensalidade(m.id)}
                                        disabled={actionLoading === m.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                                      >
                                        {actionLoading === m.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                                      </button>
                                      <button 
                                        onClick={() => rejectMensalidade(m.id)}
                                        disabled={actionLoading === m.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-sm text-center"
                                      >
                                        <XCircle className="w-3.5 h-3.5" /> Recusar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-10 text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                          </div>
                          <p className="text-slate-600 font-medium">Todos os comprovantes foram analisados.</p>
                          <p className="text-sm text-slate-400">Bom trabalho!</p>
                        </div>
                      )}
                    </div>

                    {/* Histórico Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-slate-500" />
                          <h3 className="text-lg font-bold font-lexend text-slate-800">Histórico de Mensalidades</h3>
                        </div>
                        <div className="relative w-full sm:w-64 text-sm">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={searchMensalidades}
                            onChange={e => setSearchMensalidades(e.target.value)}
                            placeholder="Buscar associado..." 
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Associado</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Referência</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Data Pgto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredHistorico.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                  Nenhuma mensalidade encontrada.
                                </td>
                              </tr>
                            ) : (
                              filteredHistorico.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-3.5">
                                    <p className="font-bold text-slate-800 text-sm">{m.associados?.popular_name || m.associados?.full_name}</p>
                                  </td>
                                  <td className="px-6 py-3.5 text-sm text-slate-600">
                                    {String(m.month).padStart(2, '0')}/{m.year}
                                  </td>
                                  <td className="px-6 py-3.5 text-sm font-medium text-slate-700">
                                    R$ {m.amount.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-3.5">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                                      m.status === 'paga' ? 'bg-green-50 text-green-700 border-green-200' : 
                                      m.status === 'pendente' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                      'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                      {m.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3.5 text-sm text-slate-500 text-right">
                                    {m.payment_date ? new Date(m.payment_date).toLocaleDateString('pt-BR') : '-'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: USUÁRIOS ADMIN --- */}
                {activeTab === 'usuarios' && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)] min-h-[600px]">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                      <div>
                        <h2 className="text-xl font-bold font-lexend text-slate-800">Gerenciar Usuários Admin</h2>
                        <p className="text-sm text-slate-500 mt-1">Controle de acesso ao painel administrativo.</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="relative w-full sm:w-64 text-sm font-normal">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={searchUsuarios}
                            onChange={e => setSearchUsuarios(e.target.value)}
                            placeholder="Buscar usuário..." 
                            className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <button
                          onClick={() => openUserModal()}
                          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-bold text-sm tracking-wide hover:bg-slate-900 transition-colors shadow-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          Novo Usuário
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Criado em</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredUsuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                    <Shield className="w-4 h-4" />
                                  </div>
                                  <span className="font-bold text-slate-800 text-sm">{u.username}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                                  u.perfil === 'ADMINISTRADOR' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                  u.perfil === 'TECNICO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-slate-50 text-slate-700 border-slate-200'
                                }`}>
                                  {u.perfil}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {new Date(u.created_at).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openUserModal(u)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                    title="Editar Usuário"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {u.username !== 'admin' && (
                                    <button
                                      onClick={() => deleteUsuario(u.id)}
                                      disabled={actionLoading === u.id}
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                      title="Excluir Usuário"
                                    >
                                      {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-[450px] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-lexend font-bold text-xl text-slate-800 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário Admin'}
                </h3>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveUsuario} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="username">
                    Username
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="username"
                      type="text"
                      value={userForm.username}
                      onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                      placeholder="Nome de usuário"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" htmlFor="password">
                    Senha
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="password"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                      placeholder="Senha de acesso"
                      required={!editingUser}
                    />
                  </div>
                  {editingUser && <p className="text-[10px] text-slate-500 mt-1">Deixe como está para manter a senha atual.</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Perfil de Acesso
                  </label>
                  <select
                    value={userForm.perfil}
                    onChange={(e) => setUserForm({...userForm, perfil: e.target.value})}
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm appearance-none"
                  >
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="TECNICO">Técnico</option>
                    <option value="USUARIO">Usuário</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'save_user'}
                    className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'save_user' && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar Usuário
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
