'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
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
  Key,
  Video,
  Newspaper,
  Trophy as TrophyIcon,
  Layout,
  Activity,
  Medal,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Tab = 'dashboard' | 'associados' | 'mensalidades' | 'usuarios' | 'conteudo';

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
  const [noticias, setNoticias] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [competicoes, setCompeticoes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Payment Launch Form
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    associado_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 60.00,
    payment_method: 'Pix',
    payment_date: new Date().toISOString().split('T')[0]
  });

  // Generate Mensalidades Form
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 60.00
  });

  // Search states
  const [searchAssociados, setSearchAssociados] = useState('');
  const [searchMensalidades, setSearchMensalidades] = useState('');
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [activeContentTab, setActiveContentTab] = useState<'noticias' | 'entrevistas' | 'videos' | 'competicoes'>('noticias');

  // News Form states
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    image_url: '',
    category: 'Geral',
    date: new Date().toISOString().split('T')[0],
    content: ''
  });

  // Interview Form states
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState<any>(null);
  const [interviewForm, setInterviewForm] = useState({
    title: '',
    personality_name: '',
    image_url: '',
    date: new Date().toISOString().split('T')[0],
    content: ''
  });

  // Video Form states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    video_url: '',
    thumbnail_url: '',
    category: 'Show'
  });

  // Competições Form states
  const [showCompModal, setShowCompModal] = useState(false);
  const [editingComp, setEditingComp] = useState<any>(null);
  const [compForm, setCompForm] = useState({
    title: '',
    description: '',
    icon_type: 'Trophy',
    status: 'Andamento',
    link_url: '#'
  });

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
    club: '',
    photo_url: ''
  });

  // User Form states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    perfil: 'USUARIO'
  });

  // Report states
  const [reportConfig, setReportConfig] = useState({
    type: 'month' as 'day' | 'month' | 'year',
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
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

      // Fetch news
      const { data: newsData, error: newsFetchError } = await supabase
        .from('noticias')
        .select('*')
        .order('date', { ascending: false });
      
      if (newsFetchError) {
        console.error('Erro ao buscar notícias:', newsFetchError);
        if (newsFetchError.code === '42P01') {
          console.warn('A tabela "noticias" não existe no banco de dados.');
        }
      }
      setNoticias(newsData || []);

      // Fetch videos
      const { data: videosData, error: videosFetchError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (videosFetchError) {
        console.error('Erro ao buscar vídeos:', videosFetchError);
      }
      setVideos(videosData || []);

      // Fetch competitions
      const { data: compsData, error: compsFetchError } = await supabase
        .from('competicoes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (compsFetchError) {
        console.error('Erro ao buscar competições:', compsFetchError);
      }
      setCompeticoes(compsData || []);

    } catch (err: any) {
      console.error('Erro ao buscar dados dashboard admin:', err);
      if (!silent) {
        let message = 'Erro ao carregar dados do banco de dados.';
        if (err.code === '42P01') {
          message = 'Erro: Algumas tabelas do sistema estão faltando no banco de dados. Contate o administrador para rodar os scripts SQL necessários.';
        } else if (err.code === '42501') {
          message = 'Erro: Permissão negada no banco de dados. Verifique as regras de RLS.';
        }
        alert(message);
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
      // eslint-disable-next-line
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
      safeAlert('Erro ao aprovar mensalidade');
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
          status: 'pendente'
        })
        .eq('id', id);

      if (error) throw error;
      await fetchData(true);
    } catch (err) {
      console.error(err);
      safeAlert('Erro ao rejeitar mensalidade');
    } finally {
      setActionLoading(null);
    }
  };

  const recordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.associado_id) return safeAlert('Selecione um associado');
    
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
            payment_date: paymentForm.payment_date,
            amount: paymentForm.amount
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
            payment_date: paymentForm.payment_date
          });
        
        if (insertError) throw insertError;
      }

      setShowPaymentModal(false);
      setPaymentForm({
        associado_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: 60.00,
        payment_method: 'Pix',
        payment_date: new Date().toISOString().split('T')[0]
      });
      await fetchData(true);
      safeAlert('Pagamento registrado com sucesso!');
    } catch (err: any) {
      console.error("ERRO COMPLETO AO REGISTRAR:", err);
      const errorMessage = err.message || err.details || 'Erro desconhecido';
      safeAlert(`Erro ao registrar pagamento: ${errorMessage}`);
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

  const safeAlert = (msg: string) => {
    try { window.alert(msg); } catch (e) { console.log(msg); }
  };

  const gerarMensalidadePeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (associados.length === 0) {
      safeAlert('Aguarde carregar a lista de associados ou verifique se existem associados cadastrados.');
      return;
    }
    
    setActionLoading('gerar_mensalidades');
    try {
      const ativos = associados.filter(a => a.status === 'ativo');
      if (ativos.length === 0) {
        safeAlert('Não há associados com status ATIVO para gerar mensalidades.');
        return;
      }

      const mes = generateForm.month;
      const ano = generateForm.year;
      const valorBase = generateForm.amount;
      
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
            status: 'pendente'
          });
          count++;
        }
      }
      
      if (inserts.length > 0) {
        const { error } = await supabase.from('mensalidades').insert(inserts);
        if (error) throw error;
        safeAlert(`${count} mensalidades geradas com sucesso!`);
      } else {
        safeAlert(`Todas as mensalidades de ${String(mes).padStart(2, '0')}/${ano} já foram geradas previamente. Nenhuma nova mensalidade foi criada.`);
      }
      
      setShowGenerateModal(false);
      await fetchData(true);
    } catch (err: any) {
      console.error("ERRO COMPLETO:", err);
      safeAlert(`Erro ao gerar mensalidades: ${err?.message || err}`);
    } finally {
      setActionLoading(null);
    }
  };

  const generateReportPDF = async () => {
    setActionLoading('generating_pdf');
    try {
      const doc = new jsPDF();
      const logoUrl = "https://ue5crmwsvgdovcsb.public.blob.vercel-storage.com/logo.png";
      
      // Filter data
      let filteredData = [...mensalidades];
      let periodLabel = "";
      
      if (reportConfig.type === 'day') {
        const selectedDate = new Date(reportConfig.date + 'T00:00:00');
        filteredData = filteredData.filter(m => {
          if (!m.payment_date) return false;
          const d = new Date(m.payment_date + 'T00:00:00');
          return d.getTime() === selectedDate.getTime();
        });
        periodLabel = `Dia: ${new Date(reportConfig.date + 'T12:00:00').toLocaleDateString('pt-BR')}`;
      } else if (reportConfig.type === 'month') {
        filteredData = filteredData.filter(m => m.month === reportConfig.month && m.year === reportConfig.year);
        periodLabel = `Mês: ${String(reportConfig.month).padStart(2, '0')}/${reportConfig.year}`;
      } else {
        filteredData = filteredData.filter(m => m.year === reportConfig.year);
        periodLabel = `Ano: ${reportConfig.year}`;
      }

      // Add Logo (Header)
      try {
        const img = new (window as any).Image();
        img.src = logoUrl;
        img.crossOrigin = "anonymous";
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        if (img.complete && img.naturalWidth > 0) {
          doc.addImage(img, 'PNG', 10, 10, 25, 25);
        }
      } catch (e) {
        console.error("Error loading logo for PDF", e);
      }
      
      // Header Text
      doc.setFontSize(16);
      doc.setTextColor(0, 51, 102); // Dark blue / primary color
      doc.text("AHMP - Associação de Handebol Master da Paraíba", 40, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      doc.text("Relatório de Mensalidades", 40, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`${periodLabel} | Gerado em: ${new Date().toLocaleString('pt-BR')}`, 40, 38);

      // Table
      const tableData = filteredData.map(m => [
        m.associados?.full_name || m.associados?.popular_name || "Associado Antigo",
        `${String(m.month).padStart(2, '0')}/${m.year}`,
        m.status === 'paga' ? formatBRL(m.amount) : "Pendente",
        m.status.toUpperCase(),
        m.payment_date ? new Date(m.payment_date).toLocaleDateString('pt-BR') : "-"
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Associado', 'Referência', 'Valor', 'Status', 'Pagamento']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      // Summary
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      const totalPaid = filteredData.filter(m => m.status === 'paga').reduce((acc, m) => acc + (m.amount || 0), 0);
      const totalPending = filteredData.filter(m => m.status === 'pendente').reduce((acc, m) => acc + (m.amount || 0), 0);
      
      if (finalY < 250) { // Check if we have space or need a new page (simplified)
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102);
        doc.text("Resumo Financeiro:", 14, finalY);
        
        doc.setFontSize(10);
        doc.setTextColor(51, 51, 51);
        doc.text(`Total Recebido: ${formatBRL(totalPaid)}`, 14, finalY + 8);
        doc.text(`Total em Aberto: ${formatBRL(totalPending)}`, 14, finalY + 15);
        
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Total Geral: ${formatBRL(totalPaid + totalPending)}`, 14, finalY + 25);
      } else {
        doc.addPage();
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102);
        doc.text("Resumo Financeiro:", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(51, 51, 51);
        doc.text(`Total Recebido: ${formatBRL(totalPaid)}`, 14, 30);
        doc.text(`Total em Aberto: ${formatBRL(totalPending)}`, 14, 40);
        
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Total Geral: ${formatBRL(totalPaid + totalPending)}`, 14, 55);
      }

      doc.save(`ahmp_relatorio_financeiro_${reportConfig.type}_${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      safeAlert("Erro ao gerar PDF do relatório.");
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

  const saveNoticia = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save_news');
    try {
      const payload = {
        ...newsForm,
        description: newsForm.content.substring(0, 150) + (newsForm.content.length > 150 ? '...' : '')
      };

      if (editingNews) {
        const { error } = await supabase
          .from('noticias')
          .update(payload)
          .eq('id', editingNews.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('noticias')
          .insert([payload]);
        if (error) throw error;
      }
      setShowNewsModal(false);
      setEditingNews(null);
      await fetchData();
      alert('Notícia salva com sucesso!');
    } catch (err: any) {
      console.error('Erro detalhado ao salvar notícia:', err);
      let errorMsg = 'Erro ao salvar notícia.';
      if (err.code === '42P01') {
        errorMsg = 'A tabela "noticias" não foi encontrada. Verifique se o nome está correto no Supabase.';
      } else if (err.code === '42501') {
        errorMsg = 'Erro de Permissão: Verifique se o RLS está desabilitado ou se há políticas de INSERT/UPDATE.';
      } else {
        errorMsg = `Erro ${err.code || 'Desconhecido'}: ${err.message || JSON.stringify(err)}`;
      }
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNoticia = async (id: string) => {
    if (!confirm('Deseja excluir esta notícia?')) return;
    try {
      const { error } = await supabase.from('noticias').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      console.error('Erro ao excluir notícia:', err);
      alert(`Erro ao excluir: ${err.message || 'Verifique sua conexão ou permissões.'}`);
    }
  };

  const safeConfirm = (msg: string) => {
    try { return window.confirm(msg); } catch (e) { return true; }
  };

  const deleteMensalidade = async (id: string) => {
    if (!safeConfirm('Deseja realmente excluir esta mensalidade?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('mensalidades')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchData(true);
    } catch (err: any) {
      console.error('Erro ao excluir mensalidade:', err);
      safeAlert(`Erro ao excluir: ${err.message || 'Verifique sua conexão ou permissões.'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const saveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save_video');
    try {
      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update(videoForm)
          .eq('id', editingVideo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('videos')
          .insert([videoForm]);
        if (error) throw error;
      }
      setShowVideoModal(false);
      setEditingVideo(null);
      await fetchData();
      alert('Vídeo salvo com sucesso!');
    } catch (err: any) {
      console.error('Erro detalhado ao salvar vídeo:', err);
      let errorMsg = 'Erro ao salvar vídeo.';
      if (err.code === '42P01') {
        errorMsg = 'A tabela "videos" não foi encontrada.';
      } else if (err.code === '42501') {
        errorMsg = 'Erro de Permissão: Verifique o RLS para a tabela "videos".';
      } else {
        errorMsg = `Erro ${err.code || 'Desconhecido'}: ${err.message || JSON.stringify(err)}`;
      }
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Deseja excluir este vídeo?')) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      console.error('Erro ao excluir vídeo:', err);
      alert(`Erro ao excluir: ${err.message || 'Verifique sua conexão ou permissões.'}`);
    }
  };

  const saveComp = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save_comp');
    try {
      if (editingComp) {
        const { error } = await supabase
          .from('competicoes')
          .update(compForm)
          .eq('id', editingComp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('competicoes')
          .insert([compForm]);
        if (error) throw error;
      }
      setShowCompModal(false);
      setEditingComp(null);
      await fetchData();
      alert('Competição salva!');
    } catch (err: any) {
      console.error('Erro detalhado ao salvar competição:', err);
      let errorMsg = 'Erro ao salvar competição.';
      if (err.code === '42P01') {
        errorMsg = 'A tabela "competicoes" não foi encontrada.';
      } else if (err.code === '42501') {
        errorMsg = 'Erro de Permissão: Verifique o RLS para a tabela "competicoes".';
      } else {
        errorMsg = `Erro ${err.code || 'Desconhecido'}: ${err.message || JSON.stringify(err)}`;
      }
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteComp = async (id: string) => {
    if (!confirm('Deseja excluir esta competição?')) return;
    try {
      const { error } = await supabase.from('competicoes').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      console.error('Erro ao excluir competição:', err);
      alert(`Erro ao excluir: ${err.message || 'Verifique sua conexão ou permissões.'}`);
    }
  };

  const openNewsModal = (item = null) => {
    if (item) {
      setEditingNews(item);
      setNewsForm({
        title: (item as any).title,
        image_url: (item as any).image_url,
        category: (item as any).category,
        date: (item as any).date,
        content: (item as any).content || ''
      });
    } else {
      setEditingNews(null);
      setNewsForm({
        title: '',
        image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80',
        category: 'Campeonato',
        date: new Date().toISOString().split('T')[0],
        content: ''
      });
    }
    setShowNewsModal(true);
  };

  const openInterviewModal = (item = null) => {
    if (item) {
      setEditingInterview(item);
      setInterviewForm({
        title: (item as any).title,
        personality_name: (item as any).personality_name || '',
        image_url: (item as any).image_url,
        date: (item as any).date,
        content: (item as any).content || ''
      });
    } else {
      setEditingInterview(null);
      setInterviewForm({
        title: '',
        personality_name: '',
        image_url: 'https://images.unsplash.com/photo-1510051646601-996027be280b?auto=format&fit=crop&q=80',
        date: new Date().toISOString().split('T')[0],
        content: ''
      });
    }
    setShowInterviewModal(true);
  };

  const saveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save_interview');
    try {
      // Interviews are stored in 'noticias' table with category 'Entrevista'
      // We map personality_name to description for storage or just keep it in content
      const payload = {
        title: interviewForm.title,
        description: `Entrevista com ${interviewForm.personality_name}`,
        image_url: interviewForm.image_url,
        category: 'Entrevista',
        date: interviewForm.date,
        content: interviewForm.content
      };

      if (editingInterview) {
        const { error } = await supabase
          .from('noticias')
          .update(payload)
          .eq('id', editingInterview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('noticias')
          .insert([payload]);
        if (error) throw error;
      }
      setShowInterviewModal(false);
      setEditingInterview(null);
      await fetchData();
      alert('Entrevista salva com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar entrevista:', err);
      alert('Erro ao salvar entrevista: ' + (err.message || err));
    } finally {
      setActionLoading(null);
    }
  };

  const openVideoModal = (item = null) => {
    if (item) {
      setEditingVideo(item);
      setVideoForm({
        title: (item as any).title,
        video_url: (item as any).video_url,
        thumbnail_url: (item as any).thumbnail_url,
        category: (item as any).category
      });
    } else {
      setEditingVideo(null);
      setVideoForm({
        title: '',
        video_url: '',
        thumbnail_url: 'https://images.unsplash.com/photo-1510051646601-996027be280b?auto=format&fit=crop&q=80',
        category: 'Melhores Momentos'
      });
    }
    setShowVideoModal(true);
  };

  const openCompModal = (item = null) => {
    if (item) {
      setEditingComp(item);
      setCompForm({
        title: (item as any).title,
        description: (item as any).description,
        icon_type: (item as any).icon_type,
        status: (item as any).status,
        link_url: (item as any).link_url
      });
    } else {
      setEditingComp(null);
      setCompForm({
        title: '',
        description: '',
        icon_type: 'Trophy',
        status: 'Inscrições Abertas',
        link_url: '#'
      });
    }
    setShowCompModal(true);
  };

  const saveAssociado = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save_associado');
    try {
      if (editingAssociado) {
        // Construct payload without photo_url if it's empty and we don't want to force it
        // but if it's an update, null is usually preferred to clear it
        const payload: any = {
          full_name: associadoForm.full_name,
          popular_name: associadoForm.popular_name,
          email: associadoForm.email,
          phone: associadoForm.phone || null,
          document_id: associadoForm.document_id || null,
          identity_document: associadoForm.identity_document || null,
          birthday: associadoForm.birthday || null,
          category: associadoForm.category || null,
          position: associadoForm.position || null,
          club: associadoForm.club || null
        };

        // Only include photo_url if it has a value
        // This avoids errors if the column is missing in some environments
        // and we are not trying to set it.
        if (associadoForm.photo_url && associadoForm.photo_url.trim() !== '') {
          payload.photo_url = associadoForm.photo_url;
        }

        let { error } = await supabase
          .from('associados')
          .update(payload)
          .eq('user_id', editingAssociado.user_id);
        
        // Robust handling: if photo_url column is missing in the DB, retry without it
        if (error && error.message.includes("photo_url") && error.message.includes("column")) {
          console.warn("photo_url column missing, retrying without it...");
          const fallbackPayload = { ...payload };
          delete fallbackPayload.photo_url;
          
          const { error: retryError } = await supabase
            .from('associados')
            .update(fallbackPayload)
            .eq('user_id', editingAssociado.user_id);
          
          error = retryError;
        }

        if (error) {
          console.error("Erro Supabase:", error);
          throw new Error(error.message);
        }
      }
      
      setShowAssociadoModal(false);
      setEditingAssociado(null);
      await fetchData();
      safeAlert('Associado atualizado com sucesso!');
    } catch (err: any) {
      console.error(err);
      safeAlert('Erro ao atualizar associado: ' + (err.message || 'Verifique se todos os campos estão corretos.'));
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
        club: (associadoToEdit as any).club || '',
        photo_url: (associadoToEdit as any).photo_url || ''
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
    { id: 'conteudo', label: 'Conteúdo Site', icon: Layout },
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
                    
                    <div className="flex-1 overflow-x-auto overflow-y-auto">
                      {/* Desktop Table View */}
                      <div className="hidden md:block min-w-[800px]">
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
                                      <div className="w-10 h-10 rounded-full bg-slate-200 flex flex-shrink-0 items-center justify-center text-slate-500 font-bold text-sm uppercase overflow-hidden relative">
                                        {a.photo_url ? (
                                          <Image fill src={`${a.photo_url}?t=${new Date().getTime()}`} alt="" className="object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                          a.full_name?.charAt(0) || '?'
                                        )}
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
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-lg text-xs font-bold transition-colors border border-slate-200 hover:border-red-200 disabled:opacity-50"
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

                      {/* Mobile Card View */}
                      <div className="md:hidden p-4 space-y-4">
                        {filteredAssociados.length === 0 ? (
                          <div className="bg-white p-12 text-center text-slate-500 rounded-xl border border-slate-200">
                             Nenhum associado encontrado.
                          </div>
                        ) : (
                          filteredAssociados.map((a) => (
                            <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex flex-shrink-0 items-center justify-center text-slate-500 font-bold text-lg uppercase overflow-hidden relative">
                                  {a.photo_url ? (
                                    <Image fill src={`${a.photo_url}?t=${new Date().getTime()}`} alt="" className="object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    a.full_name?.charAt(0) || '?'
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 text-sm truncate">{a.full_name}</p>
                                  <p className="text-xs text-slate-500 truncate">{a.email}</p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-tighter ${
                                  a.status === 'ativo' ? 'bg-green-50 text-green-700 border-green-200' : 
                                  a.status === 'pendente' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {a.status}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="text-xs text-slate-500">
                                  <span className="font-bold">{a.category || '-'}</span> • {a.position || '-'}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openAssociadoModal(a)}
                                    className="p-2.5 bg-slate-50 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors border border-slate-200"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {a.status !== 'ativo' && (
                                    <button 
                                      onClick={() => updateAssociadoStatus(a.user_id, 'ativo')}
                                      disabled={actionLoading === a.user_id}
                                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                                    >
                                      <Check className="w-4 h-4" /> Aprovar
                                    </button>
                                  )}
                                  {a.status === 'ativo' && (
                                    <button 
                                      onClick={() => updateAssociadoStatus(a.user_id, 'inativo')}
                                      disabled={actionLoading === a.user_id}
                                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-red-100"
                                    >
                                      <X className="w-4 h-4" /> Inativar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
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

                      {/* PDF Report Card */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 sm:col-span-2 lg:col-span-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800">Relatórios Financeiros</h3>
                              <p className="text-sm text-slate-500">Gere relatórios detalhados em PDF para auditoria.</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                              {(['day', 'month', 'year'] as const).map((t) => (
                                <button
                                  key={t}
                                  onClick={() => setReportConfig({ ...reportConfig, type: t })}
                                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase ${reportConfig.type === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                  {t === 'day' ? 'Dia' : t === 'month' ? 'Mês' : 'Ano'}
                                </button>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              {reportConfig.type === 'day' && (
                                <input 
                                  type="date"
                                  value={reportConfig.date}
                                  onChange={(e) => setReportConfig({ ...reportConfig, date: e.target.value })}
                                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                                />
                              )}
                              {reportConfig.type === 'month' && (
                                <>
                                  <select 
                                    value={reportConfig.month}
                                    onChange={(e) => setReportConfig({ ...reportConfig, month: parseInt(e.target.value) })}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                                  >
                                    {[...Array(12)].map((_, i) => (
                                      <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                                      </option>
                                    ))}
                                  </select>
                                  <select 
                                    value={reportConfig.year}
                                    onChange={(e) => setReportConfig({ ...reportConfig, year: parseInt(e.target.value) })}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                                  >
                                    {[2024, 2025, 2026, 2027].map(y => (
                                      <option key={y} value={y}>{y}</option>
                                    ))}
                                  </select>
                                </>
                              )}
                              {reportConfig.type === 'year' && (
                                <select 
                                  value={reportConfig.year}
                                  onChange={(e) => setReportConfig({ ...reportConfig, year: parseInt(e.target.value) })}
                                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                                >
                                  {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                              )}
                            </div>

                            <button
                              onClick={generateReportPDF}
                              disabled={actionLoading === 'generating_pdf'}
                              className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === 'generating_pdf' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                              Exportar PDF
                            </button>
                          </div>
                        </div>
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
                          onClick={() => setShowGenerateModal(true)}
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
                      
                    <div className="flex-1 overflow-x-auto overflow-y-auto">
                      <div className="hidden md:block min-w-[900px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                              <tr>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Associado</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Referência</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Pagamento</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredHistorico.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
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
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <button
                                        onClick={() => deleteMensalidade(m.id)}
                                        disabled={actionLoading === m.id}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                        title="Excluir Mensalidade"
                                      >
                                        {actionLoading === m.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="w-4 h-4" />
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Mobile Cards View */}
                        <div className="md:hidden p-4 space-y-4">
                          {filteredHistorico.length === 0 ? (
                            <div className="text-center text-slate-500 italic py-12 bg-white rounded-lg border border-slate-200">
                              Nenhum registro financeiro encontrado.
                            </div>
                          ) : (
                            filteredHistorico.map((m) => (
                              <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative pt-10">
                                <div className="absolute top-3 left-3 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold font-mono">
                                  {String(m.month).padStart(2, '0')}/{m.year}
                                </div>
                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black border uppercase tracking-tighter ${
                                    m.status === 'paga' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                    m.status === 'pendente' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                    {m.status === 'paga' ? 'Pago ✓' : m.status}
                                  </span>
                                  <button
                                    onClick={() => deleteMensalidade(m.id)}
                                    disabled={actionLoading === m.id}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                    title="Excluir Mensalidade"
                                  >
                                    {actionLoading === m.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>

                                <div className="mb-4">
                                  <p className="font-bold text-slate-800 text-sm leading-tight pr-12">{m.associados?.popular_name || m.associados?.full_name}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{m.associados?.email}</p>
                                </div>
                                
                                <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                                  <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Valor</p>
                                    <p className="text-base font-black text-slate-800">{formatBRL(m.amount)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Data Pgmt</p>
                                    <p className="text-sm font-medium text-slate-600">{m.payment_date ? new Date(m.payment_date).toLocaleDateString('pt-BR') : '-'}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'conteudo' && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)] min-h-[600px]">
                    <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold font-lexend text-slate-800">Gestão de Conteúdo</h2>
                          <p className="text-sm text-slate-500 mt-1">Atualize as seções do site sem mexer no código.</p>
                        </div>
                        <div className="flex bg-slate-200/50 p-1 rounded-lg">
                          <button 
                            onClick={() => setActiveContentTab('noticias')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeContentTab === 'noticias' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Notícias
                          </button>
                          <button 
                            onClick={() => setActiveContentTab('entrevistas')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeContentTab === 'entrevistas' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Entrevistas
                          </button>
                          <button 
                            onClick={() => setActiveContentTab('videos')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeContentTab === 'videos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Vídeos
                          </button>
                          <button 
                            onClick={() => setActiveContentTab('competicoes')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeContentTab === 'competicoes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Competições
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                      {activeContentTab === 'noticias' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <Newspaper className="w-5 h-5 text-blue-500" /> Notícias Rápidas
                            </h3>
                            <button 
                              onClick={() => openNewsModal()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                              <PlusCircle className="w-4 h-4" /> Nova Notícia
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {noticias.filter(n => n.category !== 'Entrevista').map(n => (
                              <div key={n.id} className="border border-slate-200 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                                <div className="h-32 relative bg-slate-100 overflow-hidden">
                                  {n.image_url ? (
                                    <Image fill src={n.image_url} alt="" className="object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <Newspaper className="w-8 h-8" />
                                    </div>
                                  )}
                                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider z-10">{n.category}</div>
                                </div>
                                <div className="p-4">
                                  <h4 className="font-bold text-slate-800 line-clamp-1">{n.title}</h4>
                                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{n.description || n.content?.substring(0, 50) + '...'}</p>
                                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(n.date).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                      <button onClick={() => openNewsModal(n)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                      <button onClick={() => deleteNoticia(n.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {noticias.filter(n => n.category !== 'Entrevista').length === 0 && <div className="col-span-full py-12 text-center text-slate-400 text-sm">Nenhuma notícia cadastrada.</div>}
                          </div>
                        </div>
                      )}

                      {activeContentTab === 'entrevistas' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <Users className="w-5 h-5 text-emerald-500" /> Personagens do Handebol
                            </h3>
                            <button 
                              onClick={() => openInterviewModal()}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
                            >
                              <PlusCircle className="w-4 h-4" /> Nova Entrevista
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {noticias.filter(n => n.category === 'Entrevista').map(n => (
                              <div key={n.id} className="border border-slate-200 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                                <div className="h-40 relative bg-slate-100 overflow-hidden">
                                  {n.image_url ? (
                                    <Image fill src={n.image_url} alt="" className="object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <Users className="w-8 h-8" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-bottom p-4 z-10">
                                    <h4 className="text-white font-bold self-end line-clamp-1">{n.title}</h4>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1 italic">Entrevista Especial</p>
                                  <p className="text-xs text-slate-500 line-clamp-2">{n.description || 'Personagem do Handebol'}</p>
                                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(n.date).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                      <button onClick={() => openInterviewModal(n)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                      <button onClick={() => deleteNoticia(n.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {noticias.filter(n => n.category === 'Entrevista').length === 0 && (
                              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <h4 className="text-slate-400 font-bold">Nenhuma entrevista publicada</h4>
                                <p className="text-slate-300 text-xs mt-1">Clique em &quot;Nova Entrevista&quot; para destacar alguém.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeContentTab === 'videos' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <Video className="w-5 h-5 text-red-500" /> Listagem de Vídeos
                            </h3>
                            <button 
                              onClick={() => openVideoModal()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                              <PlusCircle className="w-4 h-4" /> Novo Vídeo
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {videos.map(v => (
                              <div key={v.id} className="border border-slate-200 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                                <div className="aspect-video relative bg-black flex items-center justify-center overflow-hidden">
                                  {v.thumbnail_url ? (
                                    <Image fill src={v.thumbnail_url} alt="" className="object-cover opacity-60" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 opacity-20">
                                      <Video className="w-12 h-12" />
                                    </div>
                                  )}
                                  <Video className="absolute w-8 h-8 text-white opacity-40 group-hover:opacity-100 transition-all z-10" />
                                </div>
                                <div className="p-4">
                                  <h4 className="font-bold text-slate-800 line-clamp-1">{v.title}</h4>
                                  <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">{v.category}</p>
                                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button onClick={() => openVideoModal(v)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => deleteVideo(v.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {videos.length === 0 && <div className="col-span-full py-12 text-center text-slate-400 text-sm">Nenhum vídeo cadastrado.</div>}
                          </div>
                        </div>
                      )}

                      {activeContentTab === 'competicoes' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <TrophyIcon className="w-5 h-5 text-amber-500" /> Próximas Competições
                            </h3>
                            <button 
                              onClick={() => openCompModal()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                              <PlusCircle className="w-4 h-4" /> Nova Competição
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {competicoes.map(c => (
                              <div key={c.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                  {c.icon_type === 'Trophy' && <TrophyIcon className="w-6 h-6 text-amber-500" />}
                                  {c.icon_type === 'Activity' && <Activity className="w-6 h-6 text-green-500" />}
                                  {c.icon_type === 'Medal' && <Medal className="w-6 h-6 text-blue-500" />}
                                </div>
                                <h4 className="font-bold text-slate-800">{c.title}</h4>
                                <span className="text-[10px] font-black uppercase text-blue-600 tracking-tighter mb-2">{c.status}</span>
                                <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 w-full justify-center">
                                  <button onClick={() => openCompModal(c)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => deleteComp(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                            {competicoes.length === 0 && <div className="col-span-full py-12 text-center text-slate-400 text-sm">Nenhuma competição cadastrada.</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                    
                    <div className="flex-1 overflow-x-auto overflow-y-auto">
                      <div className="hidden md:block min-w-[700px]">
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
                            {usuarios.map((u) => (
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

                      {/* Mobile Card View for Users */}
                      <div className="md:hidden p-4 space-y-4">
                        {usuarios.map((u) => (
                          <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                  <Shield className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">{u.username}</p>
                                  <p className="text-[10px] text-slate-400">Criado em: {new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${
                                u.perfil === 'ADMINISTRADOR' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                u.perfil === 'TECNICO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-slate-50 text-slate-700 border-slate-200'
                              }`}>
                                {u.perfil}
                              </span>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
                              <button
                                onClick={() => openUserModal(u)}
                                className="p-2 text-blue-600 bg-blue-50 rounded-lg border border-blue-100"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {u.username !== 'admin' && (
                                <button
                                  onClick={() => deleteUsuario(u.id)}
                                  disabled={actionLoading === u.id}
                                  className="p-2 text-red-600 bg-red-50 rounded-lg border border-red-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">Data do Pagamento</label>
                  <input 
                    type="date"
                    required
                    value={paymentForm.payment_date}
                    onChange={e => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  />
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

      {/* Generate Mensalidades Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
            style={{ width: '95%', maxWidth: '450px' }}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white shrink-0">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                <h3 className="text-xl font-bold font-lexend">Gerar Mensalidades</h3>
              </div>
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="p-1 hover:bg-blue-500 rounded-full transition-colors flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={gerarMensalidadePeriodo} className="space-y-5">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-2">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Esta ação irá gerar cobranças <strong>Pendente</strong> para todos os associados com status <strong>Ativo</strong> que ainda não possuem registro no período selecionado.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-[10px]">Mês</label>
                    <select 
                      required
                      value={generateForm.month}
                      onChange={e => setGenerateForm({...generateForm, month: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')} - {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-[10px]">Ano</label>
                    <select 
                      required
                      value={generateForm.year}
                      onChange={e => setGenerateForm({...generateForm, year: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return <option key={year} value={year}>{year}</option>
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide text-[10px]">Valor da Mensalidade</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      required
                      value={generateForm.amount}
                      onChange={e => setGenerateForm({...generateForm, amount: parseFloat(e.target.value)})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-xl text-slate-800"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic px-1">O valor padrão é R$ 60,00, mas você pode ajustar conforme necessário.</p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading === 'gerar_mensalidades'}
                    className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-200/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-wider text-xs"
                  >
                    {actionLoading === 'gerar_mensalidades' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    Confirmar e Gerar Cobranças
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all text-xs uppercase"
                  >
                    Cancelar
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
            className="bg-white rounded-2xl shadow-xl w-[95%] max-w-[800px] overflow-hidden max-h-[90vh] flex flex-col"
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
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2" htmlFor="photo_url">URL da Foto (Desabilitado)</label>
                    <input 
                      name="photo_url" 
                      id="photo_url" 
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 px-4 text-slate-400 focus:ring-0 cursor-not-allowed outline-none" 
                      value="Recurso desabilitado por enquanto"
                      disabled
                      placeholder="Desabilitado"
                    />
                  </div>
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
            className="bg-white rounded-2xl shadow-xl w-[95%] max-w-[450px] overflow-hidden"
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

      {showNewsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 sm:p-6 bg-blue-600 text-white flex justify-between items-center shadow-lg relative z-10 shrink-0">
              <div>
                <h3 className="font-lexend font-bold text-lg sm:text-xl">{editingNews ? 'Editar Notícia' : 'Nova Notícia'}</h3>
                <p className="text-blue-100 text-[10px] sm:text-xs mt-0.5">Mantenha os associados informados sobre a federação.</p>
              </div>
              <button 
                onClick={() => setShowNewsModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-8 overflow-y-auto">
              <form onSubmit={saveNoticia} className="space-y-4 sm:space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Título da Notícia</label>
                  <input 
                    required 
                    value={newsForm.title} 
                    onChange={e => setNewsForm({...newsForm, title: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="Ex: Novos benefícios para associados"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Categoria</label>
                    <select 
                      value={newsForm.category} 
                      onChange={e => setNewsForm({...newsForm, category: e.target.value})} 
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none text-sm"
                    >
                      <option>Campeonato</option>
                      <option>Geral</option>
                      <option>Aviso</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Data</label>
                    <input 
                      type="date" 
                      required 
                      value={newsForm.date} 
                      onChange={e => setNewsForm({...newsForm, date: e.target.value})} 
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">URL da Imagem de Destaque</label>
                  <input 
                    value={newsForm.image_url} 
                    onChange={e => setNewsForm({...newsForm, image_url: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm" 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Conteúdo da Notícia</label>
                  <textarea 
                    value={newsForm.content} 
                    onChange={e => setNewsForm({...newsForm, content: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[160px] text-sm" 
                    placeholder="Digíte aqui o conteúdo da notícia..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowNewsModal(false)}
                    className="order-2 sm:order-1 flex-1 py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading === 'save_news'} 
                    className="order-1 sm:order-2 flex-2 py-3 px-8 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'save_news' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingNews ? 'Atualizar' : 'Publicar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 sm:p-6 bg-red-600 text-white flex justify-between items-center shadow-lg relative z-10 shrink-0">
              <div>
                <h3 className="font-lexend font-bold text-lg sm:text-xl">{editingVideo ? 'Editar Vídeo' : 'Adicionar Vídeo'}</h3>
                <p className="text-red-100 text-[10px] sm:text-xs mt-0.5">Destaque os melhores momentos da rodada.</p>
              </div>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-8 overflow-y-auto">
              <form onSubmit={saveVideo} className="space-y-4 sm:space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Título do Vídeo</label>
                  <input 
                    required 
                    value={videoForm.title} 
                    onChange={e => setVideoForm({...videoForm, title: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="Ex: Gols da Rodada #12"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">URL do Vídeo (YouTube/Vimeo)</label>
                  <input 
                    required 
                    value={videoForm.video_url} 
                    onChange={e => setVideoForm({...videoForm, video_url: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">URL da Thumbnail</label>
                  <input 
                    value={videoForm.thumbnail_url} 
                    onChange={e => setVideoForm({...videoForm, thumbnail_url: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="https://..."
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Dica: URLs do Youtube geram thumbnails automáticas.</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Categoria do Vídeo</label>
                  <select 
                    value={videoForm.category} 
                    onChange={e => setVideoForm({...videoForm, category: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all appearance-none text-sm"
                  >
                    <option>Melhores Momentos</option>
                    <option>Entrevistas</option>
                    <option>Jogos Completos</option>
                    <option>Dicas Técnicas</option>
                  </select>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowVideoModal(false)}
                    className="order-2 sm:order-1 flex-1 py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading === 'save_video'} 
                    className="order-1 sm:order-2 flex-2 py-3 px-8 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'save_video' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingVideo ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {showCompModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 sm:p-6 bg-amber-500 text-white flex justify-between items-center shadow-lg relative z-10 shrink-0">
              <div>
                <h3 className="font-lexend font-bold text-lg sm:text-xl">{editingComp ? 'Editar Competição' : 'Nova Competição'}</h3>
                <p className="text-amber-100 text-[10px] sm:text-xs mt-0.5">Gerencie os principais torneios da federação.</p>
              </div>
              <button 
                onClick={() => setShowCompModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-8 overflow-y-auto">
              <form onSubmit={saveComp} className="space-y-4 sm:space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nome Oficial do Torneio</label>
                  <input 
                    required 
                    value={compForm.title} 
                    onChange={e => setCompForm({...compForm, title: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="Ex: Taça Santa Catarina 2024"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Descrição ou Slogan</label>
                  <textarea 
                    required 
                    value={compForm.description} 
                    onChange={e => setCompForm({...compForm, description: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-none transition-all text-sm" 
                    rows={2} 
                    placeholder="Uma frase curta que resuma o torneio..."
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ícone Visual</label>
                    <select 
                      value={compForm.icon_type} 
                      onChange={e => setCompForm({...compForm, icon_type: e.target.value})} 
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-none transition-all appearance-none text-sm"
                    >
                      <option value="Trophy">🏆 Troféu</option>
                      <option value="Activity">🏃 Atividade</option>
                      <option value="Medal">🏅 Medalha</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status Atual</label>
                    <select 
                      value={compForm.status} 
                      onChange={e => setCompForm({...compForm, status: e.target.value})} 
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-none transition-all appearance-none text-sm"
                    >
                      <option>Inscrições Abertas</option>
                      <option>Em Andamento</option>
                      <option>Em Breve</option>
                      <option>Finalizado</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">URL de Informações (Link)</label>
                  <input 
                    value={compForm.link_url} 
                    onChange={e => setCompForm({...compForm, link_url: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="Página de regulamento ou inscrições..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowCompModal(false)}
                    className="order-2 sm:order-1 flex-1 py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Descartar
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading === 'save_comp'} 
                    className="order-1 sm:order-2 flex-2 py-3 px-8 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'save_comp' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingComp ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {showInterviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 sm:p-6 bg-emerald-600 text-white flex justify-between items-center shadow-lg relative z-10 shrink-0">
              <div>
                <h3 className="font-lexend font-bold text-lg sm:text-xl">{editingInterview ? 'Editar Entrevista' : 'Nova Entrevista'}</h3>
                <p className="text-emerald-100 text-[10px] sm:text-xs mt-0.5">Histórias e legados de quem constrói o handebol.</p>
              </div>
              <button onClick={() => setShowInterviewModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5 sm:w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-8 overflow-y-auto font-sans">
              <form onSubmit={saveInterview} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nome do Personagem</label>
                    <input 
                      required 
                      value={interviewForm.personality_name} 
                      onChange={e => setInterviewForm({...interviewForm, personality_name: e.target.value})} 
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm"
                      placeholder="Ex: Prof. José Silva"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Data</label>
                    <input 
                      type="date" required 
                      value={interviewForm.date} 
                      onChange={e => setInterviewForm({...interviewForm, date: e.target.value})} 
                      className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Título da Chamada</label>
                  <input 
                    required 
                    value={interviewForm.title} 
                    onChange={e => setInterviewForm({...interviewForm, title: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-bold"
                    placeholder="Ex: O sonho de levar o handebol para as escolas"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">URL da Foto</label>
                  <input 
                    value={interviewForm.image_url} 
                    onChange={e => setInterviewForm({...interviewForm, image_url: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm" 
                    placeholder="Link para a foto do entrevistado" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Transcrição da Entrevista / Conteúdo</label>
                  <textarea 
                    required
                    value={interviewForm.content} 
                    onChange={e => setInterviewForm({...interviewForm, content: e.target.value})} 
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all min-h-[200px] text-sm" 
                    placeholder="Comece a entrevista aqui..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={() => setShowInterviewModal(false)} className="order-2 sm:order-1 flex-1 py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]">Descartar</button>
                  <button type="submit" disabled={actionLoading === 'save_interview'} className="order-1 sm:order-2 flex-2 py-3 px-8 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                    {actionLoading === 'save_interview' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingInterview ? 'Salvar Alterações' : 'Publicar Entrevista'}
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
