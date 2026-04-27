'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatBRL } from '@/lib/utils';
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
  
  // Payment Launch Form
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    associado_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 50.00,
    payment_method: 'Pix'
  });

  // Search states
  const [searchAssociados, setSearchAssociados] = useState('');
  const [searchMensalidades, setSearchMensalidades] = useState('');
  const [searchUsuarios, setSearchUsuarios] = useState('');

  // Associado Form states
  const [showAssociadoModal, setShowAssociadoModal] = useState(false);
  const [editingAssociado, setEditingAssociado] = useState<any>(null);
  const [associadoForm, setAssociadoForm] = useState({
    full_name: '',
    popular_name: '',
    email: '',
    phone: '',
    document_id: '',
    identity_document: '',
    birthday: '',
    category: '',
    position: '',
    club: ''
  });

  // User Form states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    perfil: 'USUARIO'
  });

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoadingData(true);
    try {
      // Diagnostic check for Auth session
      const { data: sessionData } = await supabase.auth.getSession();
      const hasAuthSession = !!sessionData.session;
      
      const { data: assocData, error: assocError } = await supabase
        .from('associados')
        .select('*')
        .order('full_name', { ascending: true });

      if (assocError) throw assocError;
      
      const associadosList = assocData || [];
      setAssociados(associadosList);

      if (associadosList.length === 0 && !silent && !hasAuthSession) {
        console.warn('A lista de associados retornou vazia e não há sessão de autenticação Supabase ativa. Provavelmente é um problema de RLS.');
      }

      const { data: mensData, error: mensError } = await supabase
        .from('mensalidades')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (mensError) throw mensError;

      const associadosMap = new Map();
      (assocData || []).forEach(a => {
        // Use user_id as key as it's used as the foreign key in mensalidades
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

    } catch (err: any) {
      console.error('Erro ao buscar dados dashboard admin:', err);
      if (!silent) {
        alert('Erro ao carregar dados do banco de dados. Verifique a conexão ou permissões RLS.');
      }
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
      fetchData(true);
    }
  }, [user, isAdminLocally, fetchData]);

  const handleLogout = async () => {
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminProfile');
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
      await fetchData(true);
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
      await fetchData(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao rejeitar mensalidade');
    } finally {
      setActionLoading(null);
    }
  };

  const recordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.associado_id) return alert('Selecione um associado');
    
    setActionLoading('manual_payment');
    try {
      // 1. Check if a record already exists for this period
      const { data: existing, error: checkError } = await supabase
        .from('mensalidades')
        .select('*')
        .eq('associado_id', paymentForm.associado_id)
        .eq('month', paymentForm.month)
        .eq('year', paymentForm.year)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('mensalidades')
          .update({
            status: 'paga',
            payment_date: new Date().toISOString().split('T')[0],
            amount: paymentForm.amount,
            receipt_url: null // Clear any pending receipt if manually paid
          })
          .eq('id', existing.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new record as paid
        const { error: insertError } = await supabase
          .from('mensalidades')
          .insert({
            associado_id: paymentForm.associado_id,
            month: paymentForm.month,
            year: paymentForm.year,
            amount: paymentForm.amount,
            status: 'paga',
            payment_date: new Date().toISOString().split('T')[0],
            due_date: new Date(paymentForm.year, paymentForm.month - 1, 15).toISOString().split('T')[0]
          });
        
        if (insertError) throw insertError;
      }

      setShowPaymentModal(false);
      setPaymentForm({
        associado_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: 50.00,
        payment_method: 'Pix'
      });
      await fetchData(true);
      alert('Pagamento registrado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar pagamento.');
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
      await fetchData(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar associado');
    } finally {
      setActionLoading(null);
    }
  };

  const gerarMensalidadeMesAtual = async () => {
    if (associados.length === 0) {
      return alert('Aguarde carregar a lista de associados ou verifique se existem associados cadastrados.');
    }

    if (!confirm('Deseja gerar a mensalidade do mês atual para todos os associados ATIVOS?')) return;
    
    setActionLoading('gerar_mensalidades');
    try {
      const ativos = associados.filter(a => a.status === 'ativo');
      if (ativos.length === 0) {
        alert('Não há associados com status ATIVO para gerar mensalidades.');
        return;
      }

      const hoje = new Date();
      const mes = hoje.getMonth() + 1;
      const ano = hoje.getFullYear();
      const valorBase = 50.00; // Valor padrão
      
      let count = 0;
      const inserts = [];
      
      for (const associado of ativos) {
        // Verifica se já existe localmente primeiro para evitar requests desnecessários
        const existente = mensalidades.find(m => m.associado_id === associado.user_id && m.month === mes && m.year === ano);
        
        if (!existente) {
          inserts.push({
            associado_id: associado.user_id,
            month: mes,
            year: ano,
            amount: valorBase,
            status: 'pendente',
            due_date: new Date(ano, mes - 1, 15).toISOString().split('T')[0]
          });
          count++;
        }
      }
      
      if (inserts.length > 0) {
        const { error } = await supabase.from('mensalidades').insert(inserts);
        if (error) throw error;
      }
      
      alert(`${count} mensalidades geradas com sucesso!`);
      await fetchData(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar mensalidades. Tente novamente.');
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

  const saveAssociado = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save_associado');
    try {
      if (editingAssociado) {
        const { error } = await supabase
          .from('associados')
          .update({
            full_name: associadoForm.full_name,
            popular_name: associadoForm.popular_name,
            email: associadoForm.email,
            phone: associadoForm.phone,
            document_id: associadoForm.document_id,
            identity_document: associadoForm.identity_document,
            birthday: associadoForm.birthday,
            category: associadoForm.category,
            position: associadoForm.position,
            club: associadoForm.club,
          })
          .eq('id', editingAssociado.id);
        if (error) throw error;
      }
      
      setShowAssociadoModal(false);
      setEditingAssociado(null);
      await fetchData();
      alert('Associado atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar associado.');
    } finally {
      setActionLoading(null);
    }
  };

  const openAssociadoModal = (associadoToEdit = null) => {
    if (associadoToEdit) {
      setEditingAssociado(associadoToEdit);
      setAssociadoForm({
        full_name: (associadoToEdit as any).full_name || '',
        popular_name: (associadoToEdit as any).popular_name || '',
        email: (associadoToEdit as any).email || '',
        phone: (associadoToEdit as any).phone || '',
        document_id: (associadoToEdit as any).document_id || '',
        identity_document: (associadoToEdit as any).identity_document || '',
        birthday: (associadoToEdit as any).birthday || '',
        category: (associadoToEdit as any).category || '',
        position: (associadoToEdit as any).position || '',
        club: (associadoToEdit as any).club || ''
      });
      setShowAssociadoModal(true);
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

  const filteredHistorico = useMemo(() => {
    let hist = [...mensalidades];
    if (searchMensalidades) {
      hist = hist.filter(m => 
        m.associados?.full_name?.toLowerCase().includes(searchMensalidades.toLowerCase()) ||
        m.associados?.popular_name?.toLowerCase().includes(searchMensalidades.toLowerCase())
      );
    }
    return hist.slice(0, 100);
  }, [mensalidades, searchMensalidades]);

  // Finance summaries
  const financeSummary = useMemo(() => {
    const hoje = new Date();
    const currMonth = hoje.getMonth() + 1;
    const currYear = hoje.getFullYear();

    const monthPaid = mensalidades
      .filter(m => m.status === 'paga' && m.month === currMonth && m.year === currYear)
      .reduce((acc, m) => acc + (m.amount || 0), 0);

    const monthPending = mensalidades
      .filter(m => m.status === 'pendente' && m.month === currMonth && m.year === currYear)
      .reduce((acc, m) => acc + (m.amount || 0), 0);

    const totalPaid = mensalidades
      .filter(m => m.status === 'paga')
      .reduce((acc, m) => acc + (m.amount || 0), 0);

    return { monthPaid, monthPending, totalPaid };
  }, [mensalidades]);

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
                    <div className="flex items-center justify-between mb-2">
                       <h1 className="text-3xl font-bold font-lexend text-slate-800">Visão Geral</h1>
                       <button 
                        onClick={() => fetchData()}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 flex items-center gap-2 text-xs font-bold"
                        title="Atualizar Dados"
                       >
                         <Clock className="w-4 h-4" />
                         Atualizar Agora
                       </button>
                    </div>
                    
                    {associados.length === 0 && !loadingData && (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex items-start gap-4 flex-col sm:flex-row">
                        <AlertCircle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-orange-800">Problemas com RLS (Row Level Security)?</h4>
                          <p className="text-sm text-orange-700 mb-3">
                            A lista de associados está vazia. Como o painel admin utiliza um login próprio, o Supabase bloqueia as consultas por conta do RLS (Row Level Security).
                            Para resolver, vá no painel do Supabase, em <strong>SQL Editor</strong>, e execute os comandos abaixo:
                          </p>
                          <div className="bg-orange-950/10 p-3 rounded-lg border border-orange-200 font-mono text-xs text-orange-800 overflow-x-auto">
                            <code>
                              -- Liberar o acesso de leitura/escrita para todas as tabelas<br />
                              ALTER TABLE associados DISABLE ROW LEVEL SECURITY;<br />
                              ALTER TABLE mensalidades DISABLE ROW LEVEL SECURITY;<br />
                              ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
                            </code>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
                      
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Arrecadação do Mês</p>
                            <h3 className="text-3xl font-bold text-emerald-700">{formatBRL(financeSummary.monthPaid)}</h3>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 text-sm mt-2">
                          <p className="text-slate-500 font-medium">Previsão pendente: <span className="text-orange-600">{formatBRL(financeSummary.monthPending)}</span></p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Arrecadado</p>
                            <h3 className="text-3xl font-bold text-slate-800">{formatBRL(financeSummary.totalPaid)}</h3>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 text-sm mt-2">
                          <p className="text-slate-500 font-medium text-xs">Total histórico de todas as mensalidades pagas.</p>
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
                                  <div className="flex items-center justify-end gap-2 text-right">
                                    <button
                                      onClick={() => openAssociadoModal(a)}
                                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                      title="Editar Associado"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
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
                                  </div>
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
                    {/* Finance Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg shadow-emerald-200/50 relative overflow-hidden">
                        <div className="relative z-10">
                          <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">Total Arrecadado no Mês</p>
                          <h3 className="text-4xl font-black font-lexend">{formatBRL(financeSummary.monthPaid)}</h3>
                        </div>
                        <TrendingUp className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-emerald-500/20" />
                      </div>

                      <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg shadow-orange-200/50 relative overflow-hidden">
                        <div className="relative z-10">
                          <p className="text-orange-100 text-sm font-bold uppercase tracking-wider mb-1">Previsão Pendente (Mês)</p>
                          <h3 className="text-4xl font-black font-lexend">{formatBRL(financeSummary.monthPending)}</h3>
                        </div>
                        <Clock className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-orange-400/20" />
                      </div>

                      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-200/50 relative overflow-hidden">
                        <div className="relative z-10">
                          <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">Eficiência de Pagamento</p>
                          <h3 className="text-4xl font-black font-lexend">
                            {financeSummary.monthPaid + financeSummary.monthPending > 0 
                              ? Math.round((financeSummary.monthPaid / (financeSummary.monthPaid + financeSummary.monthPending)) * 100)
                              : 0}%
                          </h3>
                        </div>
                        <LayoutDashboard className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-blue-500/20" />
                      </div>
                    </div>

                    {/* Top Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div>
                        <h2 className="text-xl font-bold font-lexend text-slate-800">Operações de Caixa</h2>
                        <p className="text-sm text-slate-500">Lançamento manual e geração de cobrança.</p>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm tracking-wide hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Lançar Pagamento
                        </button>
                        <button
                          onClick={gerarMensalidadeMesAtual}
                          disabled={actionLoading === 'gerar_mensalidades'}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm tracking-wide hover:bg-blue-700 transition-all shadow-md disabled:opacity-70 active:scale-95"
                        >
                          {actionLoading === 'gerar_mensalidades' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                          Gerar Mensalidades
                        </button>
                      </div>
                    </div>

                    {/* Histórico Section */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
                      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-slate-500" />
                          <h3 className="text-lg font-bold font-lexend text-slate-800">Registros Financeiros</h3>
                        </div>
                        <div className="relative w-full sm:w-80 text-sm">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={searchMensalidades}
                            onChange={e => setSearchMensalidades(e.target.value)}
                            placeholder="Buscar por nome do associado..." 
                            className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow bg-white"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Associado</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Referência</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Pagamento</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredHistorico.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                  Nenhum registro financeiro encontrado.
                                </td>
                              </tr>
                            ) : (
                              filteredHistorico.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50 group transition-colors">
                                  <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800 text-sm">{m.associados?.popular_name || m.associados?.full_name}</p>
                                    <p className="text-xs text-slate-500">{m.associados?.email}</p>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs">
                                      {String(m.month).padStart(2, '0')}/{m.year}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                    {formatBRL(m.amount)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black border uppercase tracking-tighter ${
                                      m.status === 'paga' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                      m.status === 'pendente' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                      'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                      {m.status === 'paga' ? 'Pago ✓' : m.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500 text-right font-medium">
                                    <div className="flex flex-col items-end">
                                      <span>{m.payment_date ? new Date(m.payment_date).toLocaleDateString('pt-BR') : '-'}</span>
                                      {m.receipt_url && (
                                        <a href={m.receipt_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">Ver Comprovante Anexado</a>
                                      )}
                                    </div>
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

      {/* Payment Launch Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
            style={{ width: '95%', maxWidth: '500px', minWidth: '320px' }}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white shrink-0">
              <h3 className="text-xl font-bold font-lexend">Lançar Pagamento Manual</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-1 hover:bg-emerald-500 rounded-full transition-colors flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form onSubmit={recordManualPayment} className="space-y-5">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg mb-2">
                  <p className="text-xs text-emerald-800 font-medium">Use este formulário para registrar pagamentos recebidos fora do sistema (Pix direto ou dinheiro).</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" /> Associado
                  </label>
                  <select 
                    required
                    value={paymentForm.associado_id}
                    onChange={e => setPaymentForm({...paymentForm, associado_id: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  >
                    <option value="">Selecione um associado...</option>
                    {associados.filter(a => a.status === 'ativo').map(a => (
                      <option key={a.id} value={a.user_id}>{a.full_name} ({a.popular_name})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mês de Referência</label>
                    <select 
                      required
                      value={paymentForm.month}
                      onChange={e => setPaymentForm({...paymentForm, month: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')} - {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Ano</label>
                    <select 
                      required
                      value={paymentForm.year}
                      onChange={e => setPaymentForm({...paymentForm, year: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                    >
                      <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                      <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                      <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor Recebido</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-lexend">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        required
                        value={paymentForm.amount}
                        onChange={e => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value)})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Método</label>
                    <select 
                      value={paymentForm.payment_method}
                      onChange={e => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Transferência">Transferência</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading === 'manual_payment'}
                    className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-emerald-200/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-wider text-xs"
                  >
                    {actionLoading === 'manual_payment' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Confirmar Lançamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-3 text-slate-500 font-bold text-xs uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Cancelar Operação
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {showAssociadoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-[800px] overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-lexend font-bold text-xl text-slate-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Editar Dados do Associado
              </h3>
              <button 
                onClick={() => setShowAssociadoModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              <form id="edit-associado-form" onSubmit={saveAssociado} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="full_name">Nome Completo</label>
                    <input 
                      name="full_name" 
                      id="full_name" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                      value={associadoForm.full_name}
                      onChange={(e) => setAssociadoForm({...associadoForm, full_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="popular_name">Nome Popular (Apelido)</label>
                    <input 
                      name="popular_name" 
                      id="popular_name" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                      value={associadoForm.popular_name}
                      onChange={(e) => setAssociadoForm({...associadoForm, popular_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="email">E-mail</label>
                    <input 
                      name="email" 
                      id="email" 
                      type="email"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                      value={associadoForm.email}
                      onChange={(e) => setAssociadoForm({...associadoForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="document_id">CPF</label>
                    <input 
                      name="document_id" 
                      id="document_id" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                      value={associadoForm.document_id}
                      onChange={(e) => setAssociadoForm({...associadoForm, document_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="identity_document">No. Identidade (RG)</label>
                    <input 
                      name="identity_document" 
                      id="identity_document" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                      value={associadoForm.identity_document}
                      onChange={(e) => setAssociadoForm({...associadoForm, identity_document: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="birthday">Data de Nascimento</label>
                    <input 
                      type="date"
                      name="birthday" 
                      id="birthday" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                      value={associadoForm.birthday}
                      onChange={(e) => setAssociadoForm({...associadoForm, birthday: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="category">Categoria</label>
                    <select 
                      name="category" 
                      id="category" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      value={associadoForm.category}
                      onChange={(e) => setAssociadoForm({...associadoForm, category: e.target.value})}
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
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="position">Posição / Função</label>
                    <select 
                      name="position" 
                      id="position" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      value={associadoForm.position}
                      onChange={(e) => setAssociadoForm({...associadoForm, position: e.target.value})}
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
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="phone">Telefone / WhatsApp</label>
                    <input 
                      name="phone" 
                      id="phone" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                      value={associadoForm.phone}
                      onChange={(e) => setAssociadoForm({...associadoForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="club">Clube / Equipe Atual</label>
                    <input 
                      name="club" 
                      id="club" 
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                      value={associadoForm.club}
                      onChange={(e) => setAssociadoForm({...associadoForm, club: e.target.value})}
                      placeholder="Nome da equipe"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAssociadoModal(false)}
                className="px-6 py-2.5 text-slate-600 font-bold text-sm tracking-wide hover:bg-slate-200 transition-colors rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="edit-associado-form"
                disabled={actionLoading === 'save_associado'}
                className="px-8 py-2.5 bg-blue-600 text-white font-bold text-sm tracking-wide rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'save_associado' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Salvar Alterações
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
