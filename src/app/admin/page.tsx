'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Plus,
  Download,
  LogOut,
  Sparkles,
  Trash2,
  Check,
  ExternalLink,
  Palette,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Save,
  RotateCcw,
  Upload,
  Layers,
  HelpCircle,
  Phone,
  Mail,
  Inbox,
  Menu,
  Shield,
  ListOrdered,
  Eye,
  EyeOff,
  ShoppingBag,
  DollarSign,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { THEME_PRESETS } from '@/data/defaultConfig';
import {
  ServiceItem,
  ProcessStep,
  DifferentialItem,
  FaqItem,
  ContactMessage,
  ProductItem,
  IntegrationsConfig,
} from '@/types';
import ProductsTab from './components/ProductsTab';
import OrdersTab from './components/OrdersTab';
import GatewayTab from './components/GatewayTab';

type AdminTab =
  | 'messages'
  | 'products'
  | 'orders'
  | 'gateway'
  | 'theme'
  | 'identity'
  | 'hero'
  | 'services'
  | 'process'
  | 'banner'
  | 'faqs'
  | 'contact'
  | 'backup';

export default function AdminPage() {
  const {
    config,
    updateConfig,
    setThemePreset,
    updateThemeColors,
    resetToDefaults,
    isSaving,
  } = useConfig();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<AdminTab>('messages');

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Messages / Leads state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [messageSearch, setMessageSearch] = useState<string>('');

  // Carousel ref & states
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  // Local form editing states
  const [tempIdentity, setTempIdentity] = useState(config.identity);
  const [tempHero, setTempHero] = useState(config.hero);
  const [tempBanner, setTempBanner] = useState(config.banner);
  const [tempContact, setTempContact] = useState(config.contact);
  const [tempIntegrations, setTempIntegrations] = useState(
    config.integrations || {
      clarityProjectId: '',
      googleAdsId: '',
      googleAdsConversionLabel: '',
      googleAnalyticsId: '',
      metaPixelId: '',
    }
  );

  // Modals for CRUD
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingProcess, setEditingProcess] = useState<ProcessStep | null>(null);
  const [editingDiff, setEditingDiff] = useState<DifferentialItem | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  // Password change state
  const [currentPasswordChange, setCurrentPasswordChange] = useState<string>('');
  const [newPasswordChange, setNewPasswordChange] = useState<string>('');
  const [confirmPasswordChange, setConfirmPasswordChange] = useState<string>('');
  const [showPasswordChangeInputs, setShowPasswordChangeInputs] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Notification toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // First access state (senha inicial 123456 -> redefinição obrigatória)
  const [showFirstAccessModal, setShowFirstAccessModal] = useState<boolean>(false);
  const [firstAccessNewPass, setFirstAccessNewPass] = useState<string>('');
  const [firstAccessConfirmPass, setFirstAccessConfirmPass] = useState<string>('');
  const [firstAccessShowPass, setFirstAccessShowPass] = useState<boolean>(false);
  const [firstAccessError, setFirstAccessError] = useState<string>('');
  const [isSavingFirstAccess, setIsSavingFirstAccess] = useState<boolean>(false);

  // Check auth session on load
  useEffect(() => {
    const authSession = sessionStorage.getItem('rmti_admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
      if (config.mustChangePassword) {
        setShowFirstAccessModal(true);
      }
    }
  }, [config.mustChangePassword]);

  // Sync temp state when config updates
  useEffect(() => {
    setTempIdentity(config.identity);
    setTempHero(config.hero);
    setTempBanner(config.banner);
    setTempContact(config.contact);
    setTempIntegrations(
      config.integrations || {
        clarityProjectId: '',
        googleAdsId: '',
        googleAdsConversionLabel: '',
        googleAnalyticsId: '',
        metaPixelId: '',
      }
    );
  }, [config]);

  // Fetch messages
  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  // ----------------------------------------------------
  // CAROUSEL LOGIC
  // ----------------------------------------------------
  const checkCarouselScroll = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      // Allow 4px margin of error for fractional pixels
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  }, []);

  useEffect(() => {
    checkCarouselScroll();
    const handleResize = () => checkCarouselScroll();
    window.addEventListener('resize', handleResize);
    // Extra check after DOM renders fully
    const timer = setTimeout(checkCarouselScroll, 200);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [checkCarouselScroll, isAuthenticated]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkCarouselScroll, 350);
    }
  };

  const handleCarouselWheel = (e: React.WheelEvent) => {
    if (carouselRef.current) {
      if (e.deltaY !== 0) {
        carouselRef.current.scrollLeft += e.deltaY;
        checkCarouselScroll();
      }
    }
  };

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    // Smoothly scroll tab button into view
    setTimeout(() => {
      const el = document.getElementById(`tab-btn-${tabId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
      checkCarouselScroll();
    }, 50);
  };

  // ----------------------------------------------------
  // AUTHENTICATION LOGIC (SERVER-SIDE CRYPTOGRAPHIC HASH)
  // ----------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Por favor, informe a senha de acesso.');
      return;
    }

    setIsAuthenticating(true);
    setPasswordError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('rmti_admin_auth', 'true');
        setPasswordInput('');
        setPasswordError('');
        if (data.mustChangePassword) {
          setShowFirstAccessModal(true);
        }
      } else {
        setPasswordError(data.error || 'Senha incorreta.');
      }
    } catch (err) {
      setPasswordError('Erro de conexão com o servidor de autenticação.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFirstAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstAccessError('');

    if (!firstAccessNewPass.trim() || !firstAccessConfirmPass.trim()) {
      setFirstAccessError('Preencha a nova senha e a confirmação.');
      return;
    }

    if (firstAccessNewPass === '123456') {
      setFirstAccessError('A nova senha não pode ser 123456. Crie uma senha diferente e segura.');
      return;
    }

    if (firstAccessNewPass.length < 6) {
      setFirstAccessError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (firstAccessNewPass !== firstAccessConfirmPass) {
      setFirstAccessError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    setIsSavingFirstAccess(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'first-access-change',
          newPassword: firstAccessNewPass,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowFirstAccessModal(false);
        setFirstAccessNewPass('');
        setFirstAccessConfirmPass('');
        showToast('Nova senha pessoal cadastrada com sucesso! Seu painel agora está protegido.');
      } else {
        setFirstAccessError(data.error || 'Erro ao definir nova senha.');
      }
    } catch {
      setFirstAccessError('Erro de conexão ao salvar nova senha.');
    } finally {
      setIsSavingFirstAccess(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('rmti_admin_auth');
    setPasswordInput('');
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPasswordChange || !newPasswordChange || !confirmPasswordChange) {
      setPasswordFeedback({ type: 'error', text: 'Preencha todos os campos de senha.' });
      return;
    }

    if (newPasswordChange !== confirmPasswordChange) {
      setPasswordFeedback({ type: 'error', text: 'A confirmação não coincide com a nova senha.' });
      return;
    }

    if (newPasswordChange.length < 6) {
      setPasswordFeedback({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword: currentPasswordChange,
          newPassword: newPasswordChange,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordFeedback({ type: 'success', text: 'Senha atualizada e criptografada com sucesso!' });
        setCurrentPasswordChange('');
        setNewPasswordChange('');
        setConfirmPasswordChange('');
        showToast('Senha alterada com sucesso!');
      } else {
        setPasswordFeedback({ type: 'error', text: data.error || 'Erro ao alterar senha.' });
      }
    } catch {
      setPasswordFeedback({ type: 'error', text: 'Erro ao conectar ao servidor.' });
    }
  };

  // Messages actions
  const handleUpdateMessageStatus = async (id: string, status: 'unread' | 'read' | 'replied') => {
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, status } : m)));
        showToast(`Status atualizado para ${status}!`);
      }
    } catch (err) {
      showToast('Falha ao atualizar status.', 'error');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Deseja excluir este lead permanentemente?')) return;
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        showToast('Lead excluído.');
      }
    } catch (err) {
      showToast('Falha ao excluir lead.', 'error');
    }
  };

  // Service CRUD
  const handleSaveService = async (service: ServiceItem) => {
    const exists = config.services.some((s) => s.id === service.id);
    let updated: ServiceItem[];
    if (exists) {
      updated = config.services.map((s) => (s.id === service.id ? service : s));
    } else {
      updated = [...config.services, service];
    }
    const ok = await updateConfig({ services: updated });
    if (ok) {
      showToast('Serviço salvo com sucesso!');
      setEditingService(null);
    } else {
      showToast('Erro ao salvar serviço.', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Deseja realmente remover este serviço?')) return;
    const updated = config.services.filter((s) => s.id !== id);
    const ok = await updateConfig({ services: updated });
    if (ok) showToast('Serviço removido.');
  };

  const handleDuplicateService = async (item: ServiceItem) => {
    const clone: ServiceItem = {
      ...item,
      id: `srv-${Date.now()}`,
      title: `${item.title} (Cópia)`,
      order: config.services.length + 1,
    };
    const updated = [...config.services, clone];
    const ok = await updateConfig({ services: updated });
    if (ok) showToast('Serviço duplicado!');
  };

  const handleMoveService = async (index: number, direction: 'up' | 'down') => {
    const sorted = [...config.services].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const temp = sorted[index];
    sorted[index] = sorted[targetIndex];
    sorted[targetIndex] = temp;

    const reordered = sorted.map((item, idx) => ({ ...item, order: idx + 1 }));
    await updateConfig({ services: reordered });
  };

  // Process CRUD
  const handleSaveProcess = async (step: ProcessStep) => {
    const exists = config.process.some((p) => p.id === step.id);
    let updated: ProcessStep[];
    if (exists) {
      updated = config.process.map((p) => (p.id === step.id ? step : p));
    } else {
      updated = [...config.process, step];
    }
    const ok = await updateConfig({ process: updated });
    if (ok) {
      showToast('Etapa do processo salva!');
      setEditingProcess(null);
    }
  };

  const handleDeleteProcess = async (id: string) => {
    if (!confirm('Deseja remover esta etapa?')) return;
    const updated = config.process.filter((p) => p.id !== id);
    await updateConfig({ process: updated });
    showToast('Etapa removida.');
  };

  // Differential CRUD
  const handleSaveDiff = async (diff: DifferentialItem) => {
    const exists = config.differentials.some((d) => d.id === diff.id);
    let updated: DifferentialItem[];
    if (exists) {
      updated = config.differentials.map((d) => (d.id === diff.id ? diff : d));
    } else {
      updated = [...config.differentials, diff];
    }
    const ok = await updateConfig({ differentials: updated });
    if (ok) {
      showToast('Diferencial salvo!');
      setEditingDiff(null);
    }
  };

  const handleDeleteDiff = async (id: string) => {
    if (!confirm('Deseja remover este diferencial?')) return;
    const updated = config.differentials.filter((d) => d.id !== id);
    await updateConfig({ differentials: updated });
    showToast('Diferencial removido.');
  };

  // FAQ CRUD
  const handleSaveFaq = async (faq: FaqItem) => {
    const exists = config.faqs.some((f) => f.id === faq.id);
    let updated: FaqItem[];
    if (exists) {
      updated = config.faqs.map((f) => (f.id === faq.id ? faq : f));
    } else {
      updated = [...config.faqs, faq];
    }
    const ok = await updateConfig({ faqs: updated });
    if (ok) {
      showToast('Pergunta salva com sucesso!');
      setEditingFaq(null);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Deseja remover esta pergunta?')) return;
    const updated = config.faqs.filter((f) => f.id !== id);
    await updateConfig({ faqs: updated });
    showToast('Pergunta removida.');
  };

  // Export JSON (sanitized to never expose password hash)
  const handleExportBackup = () => {
    const sanitizedBackup = { ...config };
    delete (sanitizedBackup as any).adminPasswordHash;
    delete (sanitizedBackup as any).adminPin;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sanitizedBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rmti-config-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            // Strip any sensitive fields from import
            delete parsed.adminPasswordHash;
            delete parsed.adminPin;
            const ok = await updateConfig(parsed);
            if (ok) {
              showToast('Backup importado com sucesso!');
            }
          }
        } catch {
          showToast('Arquivo JSON inválido.', 'error');
        }
      };
    }
  };

  // Filtered messages
  const filteredMessages = messages.filter((m) => {
    if (messageFilter !== 'all' && m.status !== messageFilter) return false;
    if (messageSearch) {
      const q = messageSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        m.message.toLowerCase().includes(q) ||
        (m.service && m.service.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  const tabs = [
    { id: 'messages', label: 'Leads & Mensagens', icon: Inbox, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'products', label: 'Pacotes de LPs', icon: ShoppingBag, badge: 'Loja' },
    { id: 'orders', label: 'Vendas & Pedidos', icon: DollarSign },
    { id: 'gateway', label: 'Mercado Pago & Pix', icon: CreditCard },
    { id: 'theme', label: 'Tema & Cores', icon: Palette },
    { id: 'identity', label: 'Identidade & Marca', icon: ImageIcon },
    { id: 'hero', label: 'Apresentação (Hero)', icon: Sparkles },
    { id: 'services', label: 'Serviços', icon: Layers },
    { id: 'process', label: 'Processo & Diferenciais', icon: ListOrdered },
    { id: 'banner', label: 'Banner & Mídia', icon: ImageIcon },
    { id: 'faqs', label: 'Perguntas (FAQ)', icon: HelpCircle },
    { id: 'contact', label: 'Contato & WhatsApp', icon: Phone },
    { id: 'backup', label: 'Segurança & Backup', icon: Shield },
  ];

  // ----------------------------------------------------
  // 1. TELA DE LOGIN COM SENHA CRIPTOGRAFADA E OCULTA
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              RMTI - Acesso Restrito & Protegido
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="Digite sua senha"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Selo de Segurança */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs text-left flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ambiente protegido com criptografia SHA-256. Exclusivo para administradores RMTI.</span>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-base rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Entrar no Painel</span>
              )}
            </button>
          </form>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>← Voltar para a Landing Page</span>
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. DASHBOARD ADMINISTRATIVO
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* MODAL OBRIGATÓRIO DE PRIMEIRO ACESSO: REDEFINIÇÃO DE SENHA */}
      {showFirstAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl flex flex-col gap-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Primeiro Acesso ao Painel</h3>
                <p className="text-xs text-slate-400">Por segurança, crie sua nova senha pessoal.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              Você acessou com a senha padrão inicial (<strong className="text-amber-400 font-mono">123456</strong>). Para proteger seu site e seu faturamento, cadastre sua nova senha de no mínimo 6 dígitos.
            </p>

            <form onSubmit={handleFirstAccessSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Nova Senha Pessoal</label>
                <div className="relative">
                  <input
                    type={firstAccessShowPass ? 'text' : 'password'}
                    value={firstAccessNewPass}
                    onChange={(e) => setFirstAccessNewPass(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 pr-10"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setFirstAccessShowPass(!firstAccessShowPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {firstAccessShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirmar Nova Senha</label>
                <input
                  type={firstAccessShowPass ? 'text' : 'password'}
                  value={firstAccessConfirmPass}
                  onChange={(e) => setFirstAccessConfirmPass(e.target.value)}
                  placeholder="Repita exatamente a nova senha"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {firstAccessError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{firstAccessError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingFirstAccess}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSavingFirstAccess ? 'Salvando Senha...' : 'Salvar Nova Senha e Entrar'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Toast flutuante */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-bold border transition-all animate-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-600 text-emerald-200'
              : 'bg-rose-950 border-rose-600 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* TOPBAR ADMIN */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                R
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg text-white">
                  RMTI Admin
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400 border border-slate-700">
                  Painel Total
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400">
                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Salvando...</span>
              </span>
            )}

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Site</span>
            </Link>

            <button
              onClick={handleLogout}
              title="Sair do Painel"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Menu de abas"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO POR ABAS DESKTOP COM CARROSSEL OTIMIZADO */}
        <div className="hidden md:block border-t border-slate-800/80 bg-slate-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2 w-full">
              {/* Botão Rolar Esquerda */}
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                disabled={!canScrollLeft}
                aria-label="Rolar abas para a esquerda"
                className={`p-2 rounded-xl border border-slate-700/80 bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex-shrink-0 ${
                  !canScrollLeft
                    ? 'opacity-25 cursor-not-allowed'
                    : 'opacity-100 cursor-pointer shadow-md'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Trilho de Rolagem do Carrossel */}
              <div
                ref={carouselRef}
                onScroll={checkCarouselScroll}
                onWheel={handleCarouselWheel}
                className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth flex-1"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      id={`tab-btn-${tab.id}`}
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id as AdminTab)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 select-none ${
                        active
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-800/40 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            active
                              ? 'bg-slate-950 text-amber-400'
                              : 'bg-orange-500 text-slate-950'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Botão Rolar Direita */}
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                disabled={!canScrollRight}
                aria-label="Rolar abas para a direita"
                className={`p-2 rounded-xl border border-slate-700/80 bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex-shrink-0 ${
                  !canScrollRight
                    ? 'opacity-25 cursor-not-allowed'
                    : 'opacity-100 cursor-pointer shadow-md'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MENU MOBILE EXPANDIDO */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 grid grid-cols-2 gap-2 animate-in slide-in-from-top-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all text-left ${
                    active
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950'
                      : 'bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL DAS ABAS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ABA: PRODUTOS & LANDING PAGES */}
        {activeTab === 'products' && (
          <ProductsTab
            products={config.products || []}
            onSaveProducts={async (newProducts) => {
              return await updateConfig({ products: newProducts });
            }}
            isSaving={isSaving}
          />
        )}

        {/* ABA: VENDAS & PEDIDOS */}
        {activeTab === 'orders' && <OrdersTab />}

        {/* ABA: GATEWAY MERCADO PAGO & PIX */}
        {activeTab === 'gateway' && (
          <GatewayTab
            integrations={config.integrations}
            onSaveIntegrations={async (newIntegrations) => {
              return await updateConfig({ integrations: newIntegrations });
            }}
            isSaving={isSaving}
          />
        )}

        {/* ABA 1: LEADS & MENSAGENS */}
        {activeTab === 'messages' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Contatos & Leads Recebidos
                </h2>
                <p className="text-slate-400 text-sm">
                  Visualize e responda mensagens enviadas pelo formulário da Landing Page.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={fetchMessages}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>
              </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail, telefone..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'unread', 'read', 'replied'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setMessageFilter(st)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      messageFilter === st
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'all' && 'Todos'}
                    {st === 'unread' && 'Não lidos'}
                    {st === 'read' && 'Lidos'}
                    {st === 'replied' && 'Respondidos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Leads */}
            {loadingMessages ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Carregando mensagens...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 flex flex-col items-center gap-3">
                <Inbox className="w-10 h-10 text-slate-600" />
                <p className="font-semibold text-base">Nenhum lead encontrado.</p>
                <p className="text-xs text-slate-500">
                  Quando visitantes preencherem o formulário no site, os contatos aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredMessages.map((msg) => {
                  const dateStr = new Date(msg.createdAt).toLocaleString('pt-BR');
                  const whatsappClean = msg.phone ? msg.phone.replace(/\D/g, '') : '';
                  const wppLink = whatsappClean
                    ? `https://wa.me/${whatsappClean.startsWith('55') ? whatsappClean : '55' + whatsappClean}?text=${encodeURIComponent(
                        `Olá ${msg.name}! Vi seu contato no site da RMTI sobre ${msg.service || 'seu projeto'}.`
                      )}`
                    : null;

                  return (
                    <div
                      key={msg.id}
                      className={`p-6 rounded-2xl border transition-all flex flex-col gap-4 ${
                        msg.status === 'unread'
                          ? 'bg-slate-900/90 border-amber-500/40 shadow-lg'
                          : 'bg-slate-900/40 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              msg.status === 'unread'
                                ? 'bg-amber-400 animate-pulse'
                                : msg.status === 'replied'
                                ? 'bg-emerald-400'
                                : 'bg-slate-600'
                            }`}
                          />
                          <div>
                            <h3 className="font-bold text-base text-white">{msg.name}</h3>
                            <span className="text-xs text-slate-400">{dateStr}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {msg.service && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 text-xs font-semibold border border-slate-700">
                              {msg.service}
                            </span>
                          )}

                          <select
                            value={msg.status}
                            onChange={(e) =>
                              handleUpdateMessageStatus(msg.id, e.target.value as any)
                            }
                            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none"
                          >
                            <option value="unread">Não Lido</option>
                            <option value="read">Lido</option>
                            <option value="replied">Respondido</option>
                          </select>

                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60 text-xs">
                        <div className="flex flex-wrap items-center gap-4 text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <a
                              href={`mailto:${msg.email}?subject=Retorno RMTI - ${encodeURIComponent(msg.service || 'Orçamento')}`}
                              className="text-slate-300 hover:text-orange-400 underline underline-offset-2"
                            >
                              {msg.email}
                            </a>
                          </span>
                          {msg.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{msg.phone}</span>
                            </span>
                          )}
                        </div>

                        {wppLink && (
                          <a
                            href={wppLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Responder no WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA 2: TEMA & CORES */}
        {activeTab === 'theme' && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-black text-white">Paleta de Cores & Temas</h2>
              <p className="text-slate-400 text-sm">
                Selecione um tema pré-configurado de 1 clique ou personalize as cores hexadecimais com visualização instantânea.
              </p>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Temas Prontos de 1 Clique
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = config.theme.presetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setThemePreset(preset.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 ${
                        isSelected
                          ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-400/10 ring-2 ring-amber-400/20'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{preset.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {preset.description}
                      </p>
                      {/* Color dots preview */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.colors.primaryColor }}
                          title="Cor Primária"
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.colors.secondaryColor }}
                          title="Cor Secundária"
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.colors.backgroundColor }}
                          title="Cor de Fundo"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hex pickers */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Ajuste Fino de Cores Personalizadas (Hex)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400">Cor Primária (Accent 1)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.theme.primaryColor}
                      onChange={(e) => updateThemeColors({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={config.theme.primaryColor}
                      onChange={(e) => updateThemeColors({ primaryColor: e.target.value })}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono w-28"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400">Cor Primária Hover</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.theme.primaryHover}
                      onChange={(e) => updateThemeColors({ primaryHover: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={config.theme.primaryHover}
                      onChange={(e) => updateThemeColors({ primaryHover: e.target.value })}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono w-28"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400">Cor Secundária (Accent 2)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.theme.secondaryColor}
                      onChange={(e) => updateThemeColors({ secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={config.theme.secondaryColor}
                      onChange={(e) => updateThemeColors({ secondaryColor: e.target.value })}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono w-28"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400">Cor de Fundo da LP</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.theme.backgroundColor}
                      onChange={(e) => updateThemeColors({ backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={config.theme.backgroundColor}
                      onChange={(e) => updateThemeColors({ backgroundColor: e.target.value })}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono w-28"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: IDENTIDADE & MARCA */}
        {activeTab === 'identity' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black text-white">Identidade da Marca</h2>
              <p className="text-slate-400 text-sm">
                Altere nome da empresa, slogans, logotipo e favicon exibido na guia do navegador.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome Curto / Marca</label>
                  <input
                    type="text"
                    value={tempIdentity.brandName}
                    onChange={(e) => setTempIdentity({ ...tempIdentity, brandName: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Razão Social / Nome Completo</label>
                  <input
                    type="text"
                    value={tempIdentity.companyName}
                    onChange={(e) => setTempIdentity({ ...tempIdentity, companyName: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Slogan / Tagline</label>
                <input
                  type="text"
                  value={tempIdentity.tagline}
                  onChange={(e) => setTempIdentity({ ...tempIdentity, tagline: e.target.value })}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">URL do Logotipo</label>
                  <input
                    type="text"
                    value={tempIdentity.logoUrl}
                    onChange={(e) => setTempIdentity({ ...tempIdentity, logoUrl: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                  {tempIdentity.logoUrl && (
                    <div className="mt-2 p-3 bg-white rounded-xl inline-flex items-center justify-center max-w-xs">
                      <img src={tempIdentity.logoUrl} alt="Logo Preview" className="h-10 object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">URL do Favicon (Ícone da Guia)</label>
                  <input
                    type="text"
                    value={tempIdentity.faviconUrl}
                    onChange={(e) => setTempIdentity({ ...tempIdentity, faviconUrl: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                  {tempIdentity.faviconUrl && (
                    <div className="mt-2 p-3 bg-slate-800 rounded-xl inline-flex items-center gap-3 max-w-xs">
                      <img src={tempIdentity.faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain" />
                      <span className="text-xs text-slate-400">Prévia 32x32</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Ano de Copyright</label>
                  <input
                    type="text"
                    value={tempIdentity.copyrightYear}
                    onChange={(e) => setTempIdentity({ ...tempIdentity, copyrightYear: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Texto do Rodapé</label>
                  <input
                    type="text"
                    value={tempIdentity.footerText}
                    onChange={(e) => setTempIdentity({ ...tempIdentity, footerText: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  const ok = await updateConfig({ identity: tempIdentity });
                  if (ok) showToast('Identidade salva!');
                }}
                className="mt-4 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 self-start cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Identidade</span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 4: APRESENTAÇÃO (HERO) */}
        {activeTab === 'hero' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black text-white">Seção de Apresentação (Hero)</h2>
              <p className="text-slate-400 text-sm">
                Edite os títulos de alto impacto, subtítulos e chamadas para ação na primeira dobra da página.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Badge de Destaque Superior</label>
                <input
                  type="text"
                  value={tempHero.badge}
                  onChange={(e) => setTempHero({ ...tempHero, badge: e.target.value })}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Título Principal (Slogan)</label>
                <input
                  type="text"
                  value={tempHero.title}
                  onChange={(e) => setTempHero({ ...tempHero, title: e.target.value })}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Subtítulo / Descrição</label>
                <textarea
                  rows={3}
                  value={tempHero.subtitle}
                  onChange={(e) => setTempHero({ ...tempHero, subtitle: e.target.value })}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Texto do Botão Primário</label>
                  <input
                    type="text"
                    value={tempHero.primaryButtonText}
                    onChange={(e) => setTempHero({ ...tempHero, primaryButtonText: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Ação do Botão Primário</label>
                  <select
                    value={tempHero.primaryButtonAction}
                    onChange={(e) => setTempHero({ ...tempHero, primaryButtonAction: e.target.value as any })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="whatsapp">Abrir WhatsApp Diretamente</option>
                    <option value="scroll_contact">Rolar até Formulário de Contato</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Texto do Botão Secundário</label>
                  <input
                    type="text"
                    value={tempHero.secondaryButtonText}
                    onChange={(e) => setTempHero({ ...tempHero, secondaryButtonText: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Link do Botão Secundário</label>
                  <input
                    type="text"
                    value={tempHero.secondaryButtonLink}
                    onChange={(e) => setTempHero({ ...tempHero, secondaryButtonLink: e.target.value })}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  const ok = await updateConfig({ hero: tempHero });
                  if (ok) showToast('Apresentação salva!');
                }}
                className="mt-4 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 self-start cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Apresentação</span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 5: SERVIÇOS */}
        {activeTab === 'services' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Serviços Oferecidos</h2>
                <p className="text-slate-400 text-sm">
                  Gerencie os cartões de serviços, vantagens, imagens ilustrativas e mensagens automáticas de WhatsApp.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingService({
                    id: `srv-${Date.now()}`,
                    title: '',
                    summary: '',
                    imageUrl: '/assets/imagens/LPS1.webp',
                    benefits: ['Vantagem 1', 'Vantagem 2'],
                    ctaText: 'Solicitar Orçamento →',
                    whatsappMessage: 'Olá! Gostaria de um orçamento.',
                    active: true,
                    order: config.services.length + 1,
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Serviço</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.services
                .sort((a, b) => a.order - b.order)
                .map((srv, idx) => (
                  <div
                    key={srv.id}
                    className={`bg-slate-900 border rounded-2xl p-6 flex flex-col gap-4 relative transition-all ${
                      srv.active ? 'border-slate-800' : 'border-rose-900/40 opacity-60'
                    }`}
                  >
                    <div className="w-full h-36 rounded-xl bg-slate-950 flex items-center justify-center p-2 overflow-hidden border border-slate-800">
                      <img src={srv.imageUrl} alt={srv.title} className="max-h-full object-contain" />
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Ordem #{srv.order}
                        </span>
                        <h3 className="font-bold text-lg text-white">{srv.title || 'Sem título'}</h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          srv.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {srv.active ? 'Ativo' : 'Oculto'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {srv.summary}
                    </p>

                    {srv.benefits && srv.benefits.length > 0 && (
                      <div className="flex flex-col gap-1 border-t border-slate-800 pt-3 text-xs text-slate-300">
                        {srv.benefits.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-1.5 truncate">
                            <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="truncate">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80 mt-auto">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveService(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Mover para cima"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveService(idx, 'down')}
                          disabled={idx === config.services.length - 1}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicateService(srv)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingService(srv)}
                          className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-slate-950 font-bold cursor-pointer"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ABA 6: PROCESSO & DIFERENCIAIS */}
        {activeTab === 'process' && (
          <div className="flex flex-col gap-10">
            {/* 1. Processo */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Etapas do Processo ("Como Funciona")</h2>
                  <p className="text-slate-400 text-xs">
                    Etapas exibidas na linha do tempo da contratação.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingProcess({
                      id: `proc-${Date.now()}`,
                      stepNumber: `0${config.process.length + 1}`,
                      title: '',
                      description: '',
                      order: config.process.length + 1,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Etapa</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.process
                  .sort((a, b) => a.order - b.order)
                  .map((step) => (
                    <div
                      key={step.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-amber-400">{step.stepNumber}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingProcess(step)}
                            className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProcess(step.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-white">{step.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* 2. Diferenciais */}
            <div className="flex flex-col gap-4 pt-6 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Diferenciais ("Por Que Me Escolher")</h2>
                  <p className="text-slate-400 text-xs">
                    Cartões de diferenciais com ícone/emoji, título e descrição.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingDiff({
                      id: `diff-${Date.now()}`,
                      icon: '⭐',
                      title: '',
                      description: '',
                      order: config.differentials.length + 1,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Diferencial</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {config.differentials
                  .sort((a, b) => a.order - b.order)
                  .map((diff) => (
                    <div
                      key={diff.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{diff.icon}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingDiff(diff)}
                            className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDiff(diff.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-white">{diff.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{diff.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 7: BANNER */}
        {activeTab === 'banner' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black text-white">Banner Publicitário / Mídia</h2>
              <p className="text-slate-400 text-sm">
                Configure as imagens responsivas separadas para Desktop e Mobile (sem cortes).
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempBanner.active}
                  onChange={(e) => setTempBanner({ ...tempBanner, active: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
                <span className="font-bold text-sm text-white">
                  Exibir seção de banner na Landing Page
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    URL Imagem Desktop
                  </label>
                  <input
                    type="text"
                    value={tempBanner.desktopImageUrl}
                    onChange={(e) =>
                      setTempBanner({ ...tempBanner, desktopImageUrl: e.target.value })
                    }
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                  {tempBanner.desktopImageUrl && (
                    <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                      <img
                        src={tempBanner.desktopImageUrl}
                        alt="Preview Banner Desktop"
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    URL Imagem Mobile (Especial para celulares)
                  </label>
                  <input
                    type="text"
                    value={tempBanner.mobileImageUrl || ''}
                    onChange={(e) =>
                      setTempBanner({ ...tempBanner, mobileImageUrl: e.target.value })
                    }
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                  {tempBanner.mobileImageUrl && (
                    <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden max-w-xs mx-auto">
                      <img
                        src={tempBanner.mobileImageUrl}
                        alt="Preview Banner Mobile"
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Texto Alternativo (Alt)</label>
                <input
                  type="text"
                  value={tempBanner.altText || ''}
                  onChange={(e) => setTempBanner({ ...tempBanner, altText: e.target.value })}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={async () => {
                  const ok = await updateConfig({ banner: tempBanner });
                  if (ok) showToast('Configuração do banner salva!');
                }}
                className="mt-4 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 self-start cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Banner</span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 8: PERGUNTAS (FAQ) */}
        {activeTab === 'faqs' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Perguntas Frequentes (FAQ)</h2>
                <p className="text-slate-400 text-sm">
                  Tire as principais dúvidas de potenciais clientes para aumentar a taxa de conversão.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingFaq({
                    id: `faq-${Date.now()}`,
                    question: '',
                    answer: '',
                    order: config.faqs.length + 1,
                    active: true,
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Pergunta</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {config.faqs
                .sort((a, b) => a.order - b.order)
                .map((faq) => (
                  <div
                    key={faq.id}
                    className={`bg-slate-900 border rounded-2xl p-5 flex flex-col gap-3 transition-all ${
                      faq.active ? 'border-slate-800' : 'border-rose-900/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center">
                          {faq.order}
                        </span>
                        <h4 className="font-bold text-base text-white">{faq.question}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            faq.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {faq.active ? 'Ativo' : 'Oculto'}
                        </span>
                        <button
                          onClick={() => setEditingFaq(faq)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed pl-8">
                      {faq.answer}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ABA 9: CONTATO & WHATSAPP */}
        {activeTab === 'contact' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black text-white">Canais de Contato & Integrações</h2>
              <p className="text-slate-400 text-sm">
                Configure número do WhatsApp, mensagens padrão, botão flutuante e credenciais do EmailJS.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Título da Seção de Contato
                  </label>
                  <input
                    type="text"
                    value={tempContact.sectionTitle}
                    onChange={(e) =>
                      setTempContact({ ...tempContact, sectionTitle: e.target.value })
                    }
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    E-mail de Notificação
                  </label>
                  <input
                    type="email"
                    value={tempContact.email || ''}
                    onChange={(e) =>
                      setTempContact({ ...tempContact, email: e.target.value })
                    }
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Subtítulo da Seção
                </label>
                <textarea
                  rows={2}
                  value={tempContact.sectionSubtitle}
                  onChange={(e) =>
                    setTempContact({ ...tempContact, sectionSubtitle: e.target.value })
                  }
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Número do WhatsApp (com DDI e DDD)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5514998627852"
                    value={tempContact.whatsappNumber}
                    onChange={(e) =>
                      setTempContact({ ...tempContact, whatsappNumber: e.target.value })
                    }
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Mensagem Padrão do WhatsApp
                  </label>
                  <input
                    type="text"
                    value={tempContact.whatsappDefaultMessage}
                    onChange={(e) =>
                      setTempContact({ ...tempContact, whatsappDefaultMessage: e.target.value })
                    }
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempContact.floatingWhatsappActive}
                    onChange={(e) =>
                      setTempContact({
                        ...tempContact,
                        floatingWhatsappActive: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-sm text-white">
                    Ativar Botão Flutuante de WhatsApp no canto inferior direito
                  </span>
                </label>

                <div className="flex flex-col gap-1.5 pl-8">
                  <label className="text-xs text-slate-400">Texto no Botão Flutuante</label>
                  <input
                    type="text"
                    value={tempContact.floatingWhatsappTooltip}
                    onChange={(e) =>
                      setTempContact({
                        ...tempContact,
                        floatingWhatsappTooltip: e.target.value,
                      })
                    }
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white max-w-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* EmailJS */}
              <div className="flex flex-col gap-4 pt-4 border-t border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white">Chaves do EmailJS (Opcional)</h3>
                  <p className="text-xs text-slate-400">
                    Permite enviar o formulário para sua caixa de entrada além de salvar no painel.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Public Key</label>
                    <input
                      type="text"
                      value={tempContact.emailjsPublicKey || ''}
                      onChange={(e) =>
                        setTempContact({ ...tempContact, emailjsPublicKey: e.target.value })
                      }
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Service ID</label>
                    <input
                      type="text"
                      value={tempContact.emailjsServiceId || ''}
                      onChange={(e) =>
                        setTempContact({ ...tempContact, emailjsServiceId: e.target.value })
                      }
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Template ID</label>
                    <input
                      type="text"
                      value={tempContact.emailjsTemplateId || ''}
                      onChange={(e) =>
                        setTempContact({ ...tempContact, emailjsTemplateId: e.target.value })
                      }
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Integrações: Microsoft Clarity, Google Ads & Meta Pixel */}
              <div className="flex flex-col gap-4 pt-6 border-t border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Rastreamento & Anúncios (Clarity, Google Ads, GA4, Meta Ads)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Insira os IDs fornecidos pelo Clarity, Google Ads e Meta Ads (Facebook/Instagram) para rastrear gravações de tela, mapas de calor e conversões automáticas em cliques de WhatsApp e envios de formulário.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Meta Pixel ID (Facebook / Instagram Ads)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2161688604424737"
                      value={tempIntegrations.metaPixelId || ''}
                      onChange={(e) =>
                        setTempIntegrations({
                          ...tempIntegrations,
                          metaPixelId: e.target.value.trim(),
                        })
                      }
                      className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">
                      ID do Pixel do Meta Events Manager. Rastreia PageView, Contact (WhatsApp) e Lead (Formulário).
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Microsoft Clarity (Project ID)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: px9z1abcde"
                      value={tempIntegrations.clarityProjectId || ''}
                      onChange={(e) =>
                        setTempIntegrations({
                          ...tempIntegrations,
                          clarityProjectId: e.target.value.trim(),
                        })
                      }
                      className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">
                      Encontrado em <em>Settings &gt; Overview</em> no Microsoft Clarity.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Google Ads (Tag ID / AW-ID)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: AW-1234567890"
                      value={tempIntegrations.googleAdsId || ''}
                      onChange={(e) =>
                        setTempIntegrations({
                          ...tempIntegrations,
                          googleAdsId: e.target.value.trim(),
                        })
                      }
                      className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">
                      Sua tag global do Google Ads (começa com AW-).
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Rótulo de Conversão do Google Ads (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1pCwCJjGoqcdEKTC04RF"
                      value={tempIntegrations.googleAdsConversionLabel || ''}
                      onChange={(e) =>
                        setTempIntegrations({
                          ...tempIntegrations,
                          googleAdsConversionLabel: e.target.value.trim(),
                        })
                      }
                      className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">
                      Dispara evento de conversão nos cliques de WhatsApp e envio de formulário.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">
                      Google Analytics 4 - GA4 (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: G-XXXXXXXXXX"
                      value={tempIntegrations.googleAnalyticsId || ''}
                      onChange={(e) =>
                        setTempIntegrations({
                          ...tempIntegrations,
                          googleAnalyticsId: e.target.value.trim(),
                        })
                      }
                      className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">
                      ID de medição do GA4 para tráfego e visualizações de página.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  const ok = await updateConfig({
                    contact: tempContact,
                    integrations: tempIntegrations,
                  });
                  if (ok) showToast('Canais de contato e rastreamento salvos!');
                }}
                className="mt-4 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 self-start cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações &amp; Rastreamento</span>
              </button>
            </div>
          </div>
        )}

        {/* ABA 10: SEGURANÇA & BACKUP */}
        {activeTab === 'backup' && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-black text-white">Segurança & Backup</h2>
              <p className="text-slate-400 text-sm">
                Altere a senha de acesso (armazenada com criptografia SHA-256), exporte ou restaure dados completos do site.
              </p>
            </div>

            {/* Mudar Senha Criptografada */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Alterar Senha Administrativa (Criptografada)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeInputs(!showPasswordChangeInputs)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPasswordChangeInputs ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPasswordChangeInputs ? 'Ocultar' : 'Exibir'} campos</span>
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Senha Atual</label>
                  <input
                    type={showPasswordChangeInputs ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPasswordChange}
                    onChange={(e) => setCurrentPasswordChange(e.target.value)}
                    className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nova Senha</label>
                  <input
                    type={showPasswordChangeInputs ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPasswordChange}
                    onChange={(e) => setNewPasswordChange(e.target.value)}
                    className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Confirmar Nova Senha</label>
                  <input
                    type={showPasswordChangeInputs ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPasswordChange}
                    onChange={(e) => setConfirmPasswordChange(e.target.value)}
                    className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {passwordFeedback && (
                  <div
                    className={`sm:col-span-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      passwordFeedback.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {passwordFeedback.type === 'success' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>{passwordFeedback.text}</span>
                  </div>
                )}

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition-colors"
                  >
                    Atualizar Senha
                  </button>
                </div>
              </form>
            </div>

            {/* Exportar / Importar JSON */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                <span>Backup das Configurações (JSON)</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Baixe um arquivo de backup com todas as configurações, textos, imagens e serviços. A sua senha nunca é incluída no arquivo de backup para total privacidade.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Baixar Backup (JSON)</span>
                </button>

                <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Restaurar de Arquivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Reset Factory */}
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
              <h3 className="font-bold text-base text-rose-400 flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <span>Restaurar Padrões de Fábrica</span>
              </h3>
              <p className="text-xs text-rose-300/80 max-w-xl">
                Atenção: Isso reverterá todas as edições, textos e imagens para o estado inicial padrão da RMTI.
              </p>
              <div>
                <button
                  onClick={async () => {
                    if (confirm('Tem certeza absoluta de que deseja resetar todas as configurações para o padrão original?')) {
                      const ok = await resetToDefaults();
                      if (ok) showToast('Configurações resetadas para o padrão!');
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Resetar para o Padrão</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAIS DE EDIÇÃO CRUD */}
      {/* 1. Modal Serviço */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 flex flex-col gap-5 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">
                {editingService.title ? `Editar: ${editingService.title}` : 'Novo Serviço'}
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Título do Serviço</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Resumo / Descrição</label>
                <textarea
                  rows={3}
                  value={editingService.summary}
                  onChange={(e) => setEditingService({ ...editingService, summary: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">URL da Imagem Ilustrativa</label>
                <input
                  type="text"
                  value={editingService.imageUrl}
                  onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
                <div className="text-[11px] text-slate-500">
                  Disponíveis no projeto: <code>/assets/imagens/LPS1.webp</code>, <code>/assets/imagens/ERP1.webp</code>, <code>/assets/imagens/APP1.webp</code>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Vantagens / Benefícios (1 por linha)
                </label>
                <textarea
                  rows={3}
                  value={editingService.benefits?.join('\n') || ''}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      benefits: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={editingService.ctaText || ''}
                    onChange={(e) => setEditingService({ ...editingService, ctaText: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={editingService.order}
                    onChange={(e) =>
                      setEditingService({ ...editingService, order: parseInt(e.target.value) || 1 })
                    }
                    className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Mensagem pré-preenchida no WhatsApp
                </label>
                <input
                  type="text"
                  value={editingService.whatsappMessage || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, whatsappMessage: e.target.value })
                  }
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={editingService.active}
                  onChange={(e) => setEditingService({ ...editingService, active: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded"
                />
                <span className="text-sm font-bold text-white">Serviço Ativo na Landing Page</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveService(editingService)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Salvar Serviço
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Etapa do Processo */}
      {editingProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Editar Etapa do Processo</h3>
              <button
                onClick={() => setEditingProcess(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Número do Passo</label>
                  <input
                    type="text"
                    value={editingProcess.stepNumber}
                    onChange={(e) => setEditingProcess({ ...editingProcess, stepNumber: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Ordem</label>
                  <input
                    type="number"
                    value={editingProcess.order}
                    onChange={(e) =>
                      setEditingProcess({ ...editingProcess, order: parseInt(e.target.value) || 1 })
                    }
                    className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Título da Etapa</label>
                <input
                  type="text"
                  value={editingProcess.title}
                  onChange={(e) => setEditingProcess({ ...editingProcess, title: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
                <textarea
                  rows={3}
                  value={editingProcess.description}
                  onChange={(e) => setEditingProcess({ ...editingProcess, description: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProcess(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveProcess(editingProcess)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Salvar Etapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Diferencial */}
      {editingDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Editar Diferencial</h3>
              <button
                onClick={() => setEditingDiff(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Ícone / Emoji</label>
                  <input
                    type="text"
                    value={editingDiff.icon}
                    onChange={(e) => setEditingDiff({ ...editingDiff, icon: e.target.value })}
                    className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-lg text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Ordem</label>
                  <input
                    type="number"
                    value={editingDiff.order}
                    onChange={(e) =>
                      setEditingDiff({ ...editingDiff, order: parseInt(e.target.value) || 1 })
                    }
                    className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
                <input
                  type="text"
                  value={editingDiff.title}
                  onChange={(e) => setEditingDiff({ ...editingDiff, title: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
                <textarea
                  rows={3}
                  value={editingDiff.description}
                  onChange={(e) => setEditingDiff({ ...editingDiff, description: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingDiff(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveDiff(editingDiff)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Salvar Diferencial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal FAQ */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Editar Pergunta (FAQ)</h3>
              <button
                onClick={() => setEditingFaq(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Pergunta</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase">Resposta</label>
                <textarea
                  rows={4}
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Ordem</label>
                  <input
                    type="number"
                    value={editingFaq.order}
                    onChange={(e) =>
                      setEditingFaq({ ...editingFaq, order: parseInt(e.target.value) || 1 })
                    }
                    className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={editingFaq.active}
                    onChange={(e) => setEditingFaq({ ...editingFaq, active: e.target.checked })}
                    className="w-5 h-5 accent-orange-500 rounded"
                  />
                  <span className="text-xs font-bold text-white">Pergunta Ativa</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveFaq(editingFaq)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Salvar Pergunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
