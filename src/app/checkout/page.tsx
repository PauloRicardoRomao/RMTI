'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Clock, 
  QrCode, 
  CreditCard, 
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Crown,
  Layers,
  Flame,
  GraduationCap,
  Dumbbell,
  BrainCircuit,
  Briefcase
} from 'lucide-react';
import { trackInitiateCheckout, getStoredUTMs } from '@/lib/analytics';

interface PlanInfo {
  id: string;
  name: string;
  tagline: string;
  originalPrice: string;
  price: number;
  priceFormatted: string;
  installments: string;
  hasAdmin: boolean;
  badge?: string;
  deliverables: string[];
}

export interface TemplateChoice {
  id: string;
  name: string;
  niche: string;
  badge: string;
  description: string;
  iconName: string;
  themeColor: string;
}

const AVAILABLE_PLANS: Record<string, PlanInfo> = {
  starter: {
    id: 'starter',
    name: 'Pacote Individual por Estrutura',
    tagline: '1 Estrutura de alta conversão à sua escolha + Painel Admin Próprio Zerado.',
    originalPrice: 'R$ 297',
    price: 97.0,
    priceFormatted: 'R$ 97',
    installments: 'ou 12x de R$ 9,74',
    hasAdmin: true,
    deliverables: [
      '1 Estrutura de Alta Conversão à sua escolha (Vendas Diretas, Leads WhatsApp ou Institucional)',
      '🔥 Painel Admin Próprio Zerado (senha inicial 123456)',
      'Página de Checkout Própria Zerada com Pix e Cartão',
      'Arquivos Completos (HTML, CSS, JS) e Pastas Organizadas',
      'Placeholders profissionais: SUA LOGO AQUI e SEU BANNER AQUI',
      'Manual de Instruções Ilustrado em PDF incluso',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Combo Completo com as 3 Estruturas',
    tagline: 'O mais vendido: Todos os 3 Pacotes por Estrutura com desconto especial.',
    originalPrice: 'R$ 497',
    price: 197.0,
    priceFormatted: 'R$ 197',
    installments: 'ou 12x de R$ 19,78',
    hasAdmin: true,
    badge: 'COMBO 3 EM 1 • MELHOR CUSTO-BENEFÍCIO',
    deliverables: [
      'Acesso Completo aos 3 Pacotes por Estrutura (Vendas, Leads e Institucional)',
      '🔥 3 Painéis Admin Próprios Zerados (1 para cada estrutura)',
      '3 Páginas de Checkout Zeradas com Pix e Cartão',
      '3 Manuais de Instruções Ilustrados em PDF',
      'Download dos 3 Arquivos ZIP completos',
      'Suporte prioritário da equipe RMTI via WhatsApp',
    ],
  },
  vip: {
    id: 'vip',
    name: 'Implementação VIP Done-For-You',
    tagline: 'Nossa equipe instala, configura e entrega no seu domínio em 72h.',
    originalPrice: 'R$ 1.497',
    price: 697.0,
    priceFormatted: 'R$ 697',
    installments: 'ou 12x de R$ 70,05',
    hasAdmin: true,
    badge: 'INSTALAÇÃO COMPLETA PELA RMTI',
    deliverables: [
      'Implementação completa no seu domínio com SSL grátis',
      'Configuração de textos, logos e fotos pela equipe RMTI',
      '🔥 PAINEL DE ADMIN DINÂMICO CONFIGURADO NO SEU DOMÍNIO',
      'Instalação de Pixels (Meta Ads e Google Analytics)',
      'Treinamento VIP individual no Painel Admin',
      'Entrega no ar em até 72 horas úteis',
    ],
  },
};

const AVAILABLE_PLANS_EN: Record<string, PlanInfo> = {
  starter: {
    id: 'starter',
    name: 'Single Structure Pack',
    tagline: '1 High-converting structure of your choice + Zeroed Admin Panel.',
    originalPrice: '$49 USD',
    price: 19.0,
    priceFormatted: '$19 USD',
    installments: 'or ~R$ 97 one-time',
    hasAdmin: true,
    deliverables: [
      '1 Complete High-Converting Structure of your choice',
      '🔥 Zeroed CMS Admin Panel Included (Easy visual editing)',
      'Zeroed Checkout Page with Pix and Credit Card',
      'Placeholder assets: YOUR LOGO HERE and YOUR BANNER HERE',
      'Illustrated PDF Instructions Manual included',
    ],
  },
  pro: {
    id: 'pro',
    name: 'All 3 Structures Complete Combo',
    tagline: 'Best Seller: All 3 conversion structures + 3 CMS Admin Panels.',
    originalPrice: '$99 USD',
    price: 39.0,
    priceFormatted: '$39 USD',
    installments: 'or ~R$ 197 one-time',
    hasAdmin: true,
    badge: 'BESTSELLER • 3-IN-1 COMBO',
    deliverables: [
      'Instant Access to ALL 3 Conversion Structures',
      '🔥 3 ZEROED CMS ADMIN PANELS INCLUDED',
      '3 Zeroed Checkout and Thank-You pages',
      '3 Illustrated PDF Instructions Manuals',
      'Instant ZIP downloads ready to deploy',
      'Priority WhatsApp & Email Support',
    ],
  },
  vip: {
    id: 'vip',
    name: 'Done-For-You VIP Implementation',
    tagline: 'Turnkey setup: Our engineers install, customize, and launch on your domain in 72h.',
    originalPrice: '$299 USD',
    price: 139.0,
    priceFormatted: '$139 USD',
    installments: 'or ~R$ 697 one-time',
    hasAdmin: true,
    badge: 'TURNKEY DEPLOYMENT BY RMTI',
    deliverables: [
      'Turnkey deployment on your custom domain with SSL',
      'Copy, logo, images, and payment links configured by RMTI',
      '🔥 DYNAMIC CMS ADMIN PANEL INCLUDED',
      'Full Tracking Setup (Meta Ads Pixel, GA4, TikTok)',
      '1-on-1 VIP Strategy & CMS Walkthrough Call',
      'Live in production within 72 business hours',
    ],
  },
};

const TEMPLATES_BY_PACKAGE: Record<string, TemplateChoice[]> = {
  starter: [
    {
      id: 'starter-1',
      name: 'Pacote 01: Vendas Diretas & Checkout',
      niche: 'Estrutura VSL / Infoproduto / Oferta',
      badge: 'VENDAS DIRETAS',
      description: 'Headline hipnótica, mockup/VSL, benefícios, bônus, oferta com preço e checkout próprio zerado.',
      iconName: 'GraduationCap',
      themeColor: 'indigo',
    },
    {
      id: 'starter-2',
      name: 'Pacote 02: Captura & WhatsApp VIP',
      niche: 'Estrutura Leads / Serviços / High-Ticket',
      badge: 'LEADS WHATSAPP',
      description: 'Autoridade com foto, serviços, dores/sintomas, planos com botões para WhatsApp e agendamento.',
      iconName: 'Dumbbell',
      themeColor: 'emerald',
    },
    {
      id: 'starter-3',
      name: 'Pacote 03: Institucional & B2B',
      niche: 'Estrutura Corporativa / Empresas / B2B',
      badge: 'CORPORATIVO B2B',
      description: 'Métricas de impacto, serviços corporativos, diferenciais, cases e formulário de proposta comercial.',
      iconName: 'Briefcase',
      themeColor: 'cyan',
    },
  ],
  pro: [
    {
      id: 'pro-1',
      name: 'Combo Completo com as 3 Estruturas',
      niche: 'Vendas Diretas + Leads WhatsApp + Institucional B2B',
      badge: 'COMBO 3 EM 1',
      description: 'Tenha as 3 estruturas mais lucrativas da internet com seus 3 painéis admin próprios e manuais em PDF.',
      iconName: 'Layers',
      themeColor: 'indigo',
    },
  ],
  vip: [
    {
      id: 'vip-1',
      name: 'Estrutura VIP sob Medida (Escolha sua Estrutura)',
      niche: 'Vendas Diretas, Leads ou Corporativo',
      badge: '100% DONE-FOR-YOU',
      description: 'Nossa equipe de engenharia cuida de todo o setup, domínio, DNS, SSL, textos, logos e pixels.',
      iconName: 'Sparkles',
      themeColor: 'amber',
    },
  ],
};

const TEMPLATES_BY_PACKAGE_EN: Record<string, TemplateChoice[]> = {
  starter: [
    {
      id: 'starter-1',
      name: 'Pack 01: Direct Sales & Checkout',
      niche: 'VSL / Info Products / Digital Offers',
      badge: 'DIRECT SALES',
      description: 'High-converting headline, VSL mockup, curriculum modules, value-stacked bonuses, and zeroed checkout.',
      iconName: 'GraduationCap',
      themeColor: 'indigo',
    },
    {
      id: 'starter-2',
      name: 'Pack 02: Lead Capture & VIP WhatsApp',
      niche: 'Lead Generation & High-Ticket Services',
      badge: 'WHATSAPP LEADS',
      description: 'Executive authority positioning, tiered services, pain point breakdown, and 1-tap WhatsApp consultation.',
      iconName: 'Dumbbell',
      themeColor: 'emerald',
    },
    {
      id: 'starter-3',
      name: 'Pack 03: Corporate & B2B Showcase',
      niche: 'Corporate Institutions & Enterprises',
      badge: 'B2B CORPORATE',
      description: 'Hard metrics, corporate solutions grid, competitive differentials, client cases, and proposal intake form.',
      iconName: 'Briefcase',
      themeColor: 'cyan',
    },
  ],
  pro: [
    {
      id: 'pro-1',
      name: 'All 3 Conversion Structures Combo',
      niche: 'Direct Sales + WhatsApp Leads + B2B Corporate',
      badge: '3-IN-1 COMBO',
      description: 'Get all 3 highest-converting structures online with 3 dedicated zeroed admin panels and illustrated manuals.',
      iconName: 'Layers',
      themeColor: 'indigo',
    },
  ],
  vip: [
    {
      id: 'vip-1',
      name: 'Tailored VIP Architecture (Choose Your Structure)',
      niche: 'Direct Sales, Leads, or Corporate',
      badge: '100% DONE-FOR-YOU',
      description: 'Turnkey engineering setup: custom domain, DNS, SSL, copy adjustments, logos, and server-side tracking.',
      iconName: 'Sparkles',
      themeColor: 'amber',
    },
  ],
};

function renderTemplateIcon(iconName: string) {
  switch (iconName) {
    case 'GraduationCap':
      return <GraduationCap className="w-5 h-5 text-indigo-400" />;
    case 'Dumbbell':
      return <Dumbbell className="w-5 h-5 text-emerald-400" />;
    case 'BrainCircuit':
      return <BrainCircuit className="w-5 h-5 text-amber-400" />;
    case 'Briefcase':
      return <Briefcase className="w-5 h-5 text-cyan-400" />;
    case 'Crown':
      return <Crown className="w-5 h-5 text-amber-400" />;
    case 'Flame':
      return <Flame className="w-5 h-5 text-rose-400" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
    case 'Layers':
      return <Layers className="w-5 h-5 text-purple-400" />;
    default:
      return <Sparkles className="w-5 h-5 text-emerald-400" />;
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const langParam = searchParams.get('lang');
  const [lang, setLang] = useState<'pt' | 'en'>(langParam === 'en' ? 'en' : 'pt');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('rmti_lang');
      if (langParam === 'en' || langParam === 'pt') {
        setLang(langParam);
      } else if (savedLang === 'en') {
        setLang('en');
      }
    } catch {
      // ignore
    }
  }, [langParam]);

  const isEn = lang === 'en';
  const plansMap = isEn ? AVAILABLE_PLANS_EN : AVAILABLE_PLANS;

  const planParam = searchParams.get('plano') || 'pro';
  const templateParam = searchParams.get('template') || '';
  const initialPlan = plansMap[planParam] ? planParam : 'pro';

  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlan);
  const currentPlan = plansMap[selectedPlanId] || plansMap.pro;

  // Template Selection
  const templatesMap = isEn ? TEMPLATES_BY_PACKAGE_EN : TEMPLATES_BY_PACKAGE;
  const planTemplates = templatesMap[selectedPlanId] || templatesMap.pro;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    if (templateParam && planTemplates.some((t) => t.id === templateParam)) {
      return templateParam;
    }
    return planTemplates[0]?.id || 'starter-1';
  });

  // When plan changes, set default template for that plan if not in current plan
  const handlePlanSelect = (newPlanId: string) => {
    setSelectedPlanId(newPlanId);
    setPixData(null);
    setPaymentStatus('idle');
    const newTemplates = templatesMap[newPlanId] || templatesMap.pro;
    setSelectedTemplateId(newTemplates[0]?.id || '');
  };

  const selectedTemplate = planTemplates.find((t) => t.id === selectedTemplateId) || planTemplates[0];

  // Track InitiateCheckout conversion event
  useEffect(() => {
    trackInitiateCheckout(currentPlan.name, currentPlan.price);
  }, [currentPlan.name, currentPlan.price]);

  // Customer Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  // Payment method: 'pix' | 'card' | 'mercadopago'
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'mercadopago'>('pix');

  // Pix generation states
  const [pixLoading, setPixLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    ticketUrl: string;
    isDemo?: boolean;
  } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'approved'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Credit Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');
  const [cardLoading, setCardLoading] = useState(false);

  // Offer timer: 14m 59s
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Mask helpers
  const handleCpfChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    setCpf(formatted);
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    setPhone(formatted);
  };

  // Polling for Pix approval
  useEffect(() => {
    if (!pixData?.paymentId || paymentStatus === 'approved') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mercadopago/status?payment_id=${pixData.paymentId}`);
        const data = await res.json();
        if (data.status === 'approved') {
          setPaymentStatus('approved');
          clearInterval(interval);
          setTimeout(() => {
            router.push(
              `/obrigado?plano=${selectedPlanId}&template=${selectedTemplateId}&payment_id=${pixData.paymentId}`
            );
          }, 1500);
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [pixData, paymentStatus, router, selectedPlanId, selectedTemplateId]);

  // Handle Pix generation
  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || (!isEn && !cpf)) {
      setErrorMessage(
        isEn
          ? 'Please fill in your Name, Email, and Tax ID/CPF to generate Pix.'
          : 'Por favor, preencha seu Nome, E-mail e CPF para gerar o Pix.'
      );
      return;
    }

    setPixLoading(true);

    try {
      const utms = getStoredUTMs();
      const res = await fetch('/api/mercadopago/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          templateId: selectedTemplateId,
          templateName: selectedTemplate?.name,
          name,
          email,
          cpf,
          phone,
          utmSource: utms.utmSource || '',
          utmMedium: utms.utmMedium || '',
          utmCampaign: utms.utmCampaign || '',
          utmContent: utms.utmContent || '',
          utmTerm: utms.utmTerm || '',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPixData({
          paymentId: data.paymentId,
          qrCode: data.qrCode,
          qrCodeBase64: data.qrCodeBase64,
          ticketUrl: data.ticketUrl,
          isDemo: data.isDemo,
        });
        setPaymentStatus('pending');
      } else {
        setErrorMessage(
          data.error || (isEn ? 'Unable to generate Pix. Please verify your details.' : 'Não foi possível gerar o Pix. Verifique os dados.')
        );
      }
    } catch {
      setErrorMessage(
        isEn ? 'Connection error while contacting payment processor.' : 'Erro de conexão ao gerar Pix com Mercado Pago.'
      );
    } finally {
      setPixLoading(false);
    }
  };

  // Copy Pix code
  const handleCopyPix = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  // Handle Credit Card Payment
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      setErrorMessage(
        isEn ? 'Please fill in all credit card fields.' : 'Preencha todos os dados do cartão de crédito.'
      );
      return;
    }

    setCardLoading(true);

    try {
      const utms = getStoredUTMs();
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone || '',
          customerCpf: cpf || '',
          planId: selectedPlanId,
          planName: currentPlan.name,
          templateId: selectedTemplateId,
          templateName: selectedTemplate?.name,
          amount: currentPlan.price,
          paymentMethod: 'credit_card',
          status: 'approved',
          notes: 'Pagamento aprovado via Cartão de Crédito.',
          utmSource: utms.utmSource || '',
          utmMedium: utms.utmMedium || '',
          utmCampaign: utms.utmCampaign || '',
          utmContent: utms.utmContent || '',
          utmTerm: utms.utmTerm || '',
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    setTimeout(() => {
      setCardLoading(false);
      router.push(`/obrigado?plano=${selectedPlanId}&template=${selectedTemplateId}&method=card`);
    }, 1500);
  };

  // Handle Mercado Pago Redirect (Checkout Pro)
  const handleMercadoPagoRedirect = async () => {
    setErrorMessage('');
    try {
      const res = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          payerEmail: email || 'cliente@rmti.com.br',
        }),
      });
      const data = await res.json();
      if (data.success && (data.initPoint || data.sandboxInitPoint)) {
        window.location.href = data.initPoint || data.sandboxInitPoint;
      } else {
        window.open('https://www.mercadopago.com.br', '_blank');
      }
    } catch {
      setErrorMessage('Falha ao abrir checkout do Mercado Pago.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-gray-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#090b10]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-md border border-white/90 transition-transform group-hover:scale-105 flex items-center justify-center">
              <img
                src="/assets/imagens/IconeNovo-trimmed.webp"
                alt="RMTI - Soluções Inteligentes"
                className="h-8 sm:h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/rmti/IconeNovo-trimmed.png';
                }}
              />
            </div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-300 hidden sm:inline">
              Checkout Seguro
            </span>
          </Link>

          {/* Security Indicator & Language Switcher */}
          <div className="flex items-center gap-3 text-xs">
            {/* Language Switcher */}
            <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLang('pt');
                  try { localStorage.setItem('rmti_lang', 'pt'); } catch {}
                }}
                className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  !isEn ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Português"
              >
                <span>🇧🇷 PT</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  try { localStorage.setItem('rmti_lang', 'en'); } catch {}
                }}
                className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isEn ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
                aria-label="English"
              >
                <span>🇺🇸 EN</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Official Secure Checkout' : 'Checkout Oficial Mercado Pago'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL 256-Bit</span>
            </div>
          </div>
        </div>

        {/* Offer Timer Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-indigo-950 to-emerald-950 border-t border-b border-white/5 py-1.5 px-4 text-center text-xs text-gray-300 flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>
            {isEn ? 'Your exclusive discounted pricing is reserved for: ' : 'Sua oferta com desconto exclusivo está reservada por: '}
            <strong className="text-white font-mono font-bold text-sm text-amber-300">
              {formatTimer(timeLeft)}
            </strong>
          </span>
        </div>
      </header>

      {/* 3-Step Progress Bar Indicator */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2 w-full">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-0" />
          
          <div className="flex items-center gap-2 bg-[#080a0f] px-2.5 z-10">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-gray-950 font-bold text-xs flex items-center justify-center shadow-lg shadow-emerald-500/30">
              ✓
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline">
              {isEn ? '1. Selected Package' : '1. Pacote Escolhido'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#080a0f] px-2.5 z-10">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40">
              2
            </div>
            <span className="text-xs font-bold text-indigo-300 hidden sm:inline">
              {isEn ? '2. Your Details' : '2. Seus Dados'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#080a0f] px-2.5 z-10">
            <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
              pixData ? 'bg-emerald-500 text-gray-950 shadow-lg' : 'bg-white/10 text-gray-400'
            }`}>
              3
            </div>
            <span className="text-xs font-semibold text-gray-400 hidden sm:inline">
              {isEn ? '3. Secure Payment' : '3. Pagamento Seguro'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Checkout Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT: Customer Form, Template Selection & Payment */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Personal Info */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {isEn ? 'Account Access Details' : 'Dados de Acesso'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {isEn ? 'Your files, source code, and admin credentials will be delivered to this email.' : 'É para este e-mail que enviaremos o acesso aos arquivos e ao painel.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {isEn ? 'Full Name *' : 'Nome Completo *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isEn ? 'e.g. John Miller' : 'Ex: Carlos Eduardo Silva'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {isEn ? 'Primary Email Address *' : 'Seu Melhor E-mail *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isEn ? 'e.g. john@company.com' : 'Ex: carlos@gmail.com'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {isEn ? 'Tax ID / Document (Optional for Intl)' : 'CPF / CNPJ * (Obrigatório Mercado Pago)'}
                    </label>
                    <input
                      type="text"
                      required={!isEn}
                      value={cpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      placeholder={isEn ? 'Optional / Optional Tax ID' : '000.000.000-00'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {isEn ? 'WhatsApp with Country Code (For instant support & delivery)' : 'WhatsApp com DDD (Para suporte e entrega rápida)'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={isEn ? '+1 (555) 123-4567' : '(11) 99999-9999'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* Step 2: TEMPLATE SELECTION BY PACKAGE */}
            {/* ========================================================= */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                  2
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    {isEn ? (
                      <>
                        {selectedPlanId === 'starter' && 'Choose Your Template (1 included):'}
                        {selectedPlanId === 'pro' && 'Your 5 Pro Bundle Templates + Dynamic CMS:'}
                        {selectedPlanId === 'vip' && 'Select Your Flagship Architecture for VIP Setup:'}
                      </>
                    ) : (
                      <>
                        {selectedPlanId === 'starter' && 'Escolha o seu Template (1 incluso):'}
                        {selectedPlanId === 'pro' && 'Seus 5 Templates do Combo + Painel Admin:'}
                        {selectedPlanId === 'vip' && 'Escolha o Template Principal Para Setup VIP:'}
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {isEn ? (
                      <>
                        {selectedPlanId === 'starter' && 'Select which of the conversion-focused architectures you want delivered ready for your business.'}
                        {selectedPlanId === 'pro' && 'You get full access to all templates! Choose which one will be set as default in your Admin CMS:'}
                        {selectedPlanId === 'vip' && 'Which ultra-premium architecture do you want the RMTI engineering team to deploy on your domain?'}
                      </>
                    ) : (
                      <>
                        {selectedPlanId === 'starter' && 'Selecione qual das 5 estruturas você deseja receber pronta para o seu nicho.'}
                        {selectedPlanId === 'pro' && 'Você receberá todos os 5 templates! Selecione qual você deseja iniciar primeiro:'}
                        {selectedPlanId === 'vip' && 'Qual estrutura ultra-premium você deseja que a equipe RMTI configure no seu domínio?'}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Template Cards Grid */}
              <div className="space-y-2.5 pt-1">
                {planTemplates.map((t) => {
                  const isChosen = t.id === selectedTemplateId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChosen
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/15 ring-1 ring-emerald-400/40'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isChosen
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-white/5 border-white/10 text-gray-400'
                          }`}
                        >
                          {renderTemplateIcon(t.iconName)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {t.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                              {t.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 truncate">{t.description}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isChosen ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="hidden sm:inline">{isEn ? 'Selected' : 'Selecionado'}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1">
                            {isEn ? 'Select' : 'Selecionar'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPlanId === 'pro' && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isEn ? (
                      <>In the <strong>All-Access Pro Combo</strong>, you receive <strong>all 5 templates</strong>. The one selected above will be configured as default in your dynamic Admin CMS.</>
                    ) : (
                      <>No Combo Completo você tem <strong>acesso a todas as 5 estruturas</strong>. O template marcado acima será o configurado como padrão no seu Painel Admin.</>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {isEn ? 'Secure Checkout via Mercado Pago' : 'Pagamento Seguro Mercado Pago'}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {isEn ? 'Choose how you would like to complete your order with instant approval.' : 'Escolha como prefere pagar com aprovação imediata.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <QrCode className={`w-5 h-5 ${paymentMethod === 'pix' ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold">{isEn ? 'Instant Pix (BR)' : 'PIX Imediato'}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold leading-none">{isEn ? 'Instant access' : 'Aprova na hora'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold">{isEn ? 'Credit Card' : 'Cartão de Crédito'}</span>
                  <span className="text-[10px] text-gray-400 leading-none">{isEn ? 'Up to 12x or 1x' : 'Em até 12x'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'mercadopago'
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <ExternalLink className={`w-5 h-5 ${paymentMethod === 'mercadopago' ? 'text-cyan-400' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold">{isEn ? 'MP Account' : 'Conta MP'}</span>
                  <span className="text-[10px] text-gray-400 leading-none">Checkout Pro</span>
                </button>
              </div>

              {/* TAB 1: PIX */}
              {paymentMethod === 'pix' && (
                <div className="space-y-4 pt-2">
                  {!pixData ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs text-gray-300">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>{isEn ? 'Why pay with Pix?' : 'Por que pagar no Pix?'}</span>
                        </div>
                        <ul className="space-y-1.5 text-gray-400 list-disc list-inside">
                          <li>{isEn ? 'Instant asset delivery in less than 10 seconds.' : 'Liberação instantânea dos arquivos em menos de 10 segundos.'}</li>
                          <li>{isEn ? 'Dynamic QR Code generated securely through Mercado Pago.' : 'QR Code com chave Pix Copia e Cola gerado pelo Mercado Pago.'}</li>
                          <li>{isEn ? 'Compatible with any banking app in Brazil.' : 'Você pode pagar pelo app de qualquer banco.'}</li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={handleGeneratePix}
                        disabled={pixLoading}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                      >
                        {pixLoading ? (
                          <span>{isEn ? 'Generating QR Code with Mercado Pago...' : 'Gerando QR Code no Mercado Pago...'}</span>
                        ) : (
                          <>
                            <QrCode className="w-5 h-5" />
                            <span>{isEn ? `Generate Official Pix - ${currentPlan.priceFormatted}` : `Gerar Pix Oficial Mercado Pago - ${currentPlan.priceFormatted}`}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Generated Pix Area */
                    <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-emerald-500/30 space-y-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        {isEn ? 'Pix Generated Successfully!' : 'Pix Gerado com Sucesso!'}
                      </div>

                      <p className="text-xs text-gray-300 max-w-sm mx-auto">
                        {isEn ? (
                          <>Open your banking app, choose <strong>Pix &gt; Scan QR Code</strong> or paste the code below:</>
                        ) : (
                          <>Abra o app do seu banco, escolha <strong>Pix &gt; Ler QR Code</strong> ou cole o código Copia e Cola abaixo:</>
                        )}
                      </p>

                      {/* QR Code Display */}
                      <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                        {pixData.qrCodeBase64 ? (
                          <img
                            src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                            alt="QR Code Pix Mercado Pago"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                              pixData.qrCode
                            )}`}
                            alt="QR Code Pix Mercado Pago"
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>

                      {/* Copia e Cola Field */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-semibold block text-left">
                          {isEn ? 'Pix Copy & Paste Code:' : 'Código Pix Copia e Cola:'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={pixData.qrCode}
                            className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-300 select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                              pixCopied
                                ? 'bg-emerald-400 text-gray-950 scale-105 shadow-xl shadow-emerald-400/40'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-md'
                            }`}
                          >
                            {pixCopied ? <CheckCircle2 className="w-4 h-4 text-gray-950" /> : <Copy className="w-4 h-4" />}
                            <span>{pixCopied ? (isEn ? 'CODE COPIED!' : 'CÓDIGO COPIADO!') : (isEn ? 'Copy Code' : 'Copiar Código')}</span>
                          </button>
                        </div>
                        {pixCopied && (
                          <p className="text-[11px] text-emerald-400 font-bold animate-fadeIn text-left pt-1">
                            {isEn
                              ? '✓ Pix code copied! Open your bank app and paste it into "Pix Copia e Cola".'
                              : '✓ Código Pix copiado com sucesso! Abra o app do seu banco e cole na opção "Pix Copia e Cola".'}
                          </p>
                        )}
                      </div>

                      {/* Status Watcher */}
                      <div className="pt-2 border-t border-white/10 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span>{isEn ? 'Verifying payment with Mercado Pago...' : 'Identificando pagamento no Mercado Pago...'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              fetch('/api/orders', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  orderId: pixData.paymentId,
                                  status: 'approved',
                                  notes: 'Pagamento confirmado e compensado.',
                                }),
                              }).catch(() => {});
                            } catch {
                              // ignore
                            }
                            router.push(
                              `/obrigado?plano=${selectedPlanId}&template=${selectedTemplateId}&payment_id=${pixData.paymentId}`
                            );
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline pt-1 cursor-pointer"
                        >
                          {isEn ? 'I have already completed the payment in my bank →' : 'Já realizei o pagamento no banco →'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT CARD */}
              {paymentMethod === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-3.5 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {isEn ? 'Card Number' : 'Número do Cartão'}
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {isEn ? 'Cardholder Name' : 'Nome Impresso no Cartão'}
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder={isEn ? 'JOHN MILLER' : 'CARLOS E SILVA'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        {isEn ? 'Expiration (MM/YY)' : 'Validade (MM/AA)'}
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="12/28"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        {isEn ? 'CVV (Security Code)' : 'CVV (Código de Segurança)'}
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {isEn ? 'Payment Plan' : 'Parcelamento no Cartão'}
                    </label>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="1" className="bg-gray-900 text-white">
                        {isEn ? `1x of ${currentPlan.priceFormatted} (Single Payment)` : `1x de ${currentPlan.priceFormatted} à vista`}
                      </option>
                      {!isEn && (
                        <>
                          <option value="2" className="bg-gray-900 text-white">2x de R$ {(currentPlan.price / 2 * 1.03).toFixed(2)}</option>
                          <option value="3" className="bg-gray-900 text-white">3x de R$ {(currentPlan.price / 3 * 1.04).toFixed(2)}</option>
                          <option value="6" className="bg-gray-900 text-white">6x de R$ {(currentPlan.price / 6 * 1.06).toFixed(2)}</option>
                          <option value="12" className="bg-gray-900 text-white">12x de {currentPlan.installments.replace('ou ', '')}</option>
                        </>
                      )}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={cardLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {cardLoading ? (
                      <span>{isEn ? 'Processing with Mercado Pago...' : 'Processando no Mercado Pago...'}</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{isEn ? `Pay ${currentPlan.priceFormatted} with Credit Card` : `Pagar ${currentPlan.priceFormatted} no Cartão com Mercado Pago`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: MERCADO PAGO CHECKOUT PRO */}
              {paymentMethod === 'mercadopago' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-gray-300 space-y-2">
                    <p>
                      {isEn
                        ? 'You will be redirected to the secure Mercado Pago portal to complete your payment with your account, saved cards, or digital wallets.'
                        : 'Você será redirecionado para o ambiente do Mercado Pago para pagar com sua conta Mercado Livre, cartões já salvos ou saldo disponível.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleMercadoPagoRedirect}
                    className="w-full py-4 px-6 rounded-2xl bg-[#009EE3] hover:bg-[#0089c7] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>{isEn ? 'Open Official Mercado Pago Portal' : 'Abrir Tela Oficial do Mercado Pago'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: Order Summary & Plan Selector */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Order Card */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6 relative shadow-2xl">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {isEn ? 'Order Summary' : 'Resumo do Pedido'}
                </span>
                <h3 className="text-xl font-bold text-white">
                  {isEn ? 'Choose Your Package:' : 'Escolha Seu Pacote:'}
                </h3>
              </div>

              {/* Plan Switcher Radio Cards */}
              <div className="space-y-3">
                {Object.values(plansMap).map((p) => {
                  const isSelected = p.id === selectedPlanId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handlePlanSelect(p.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500/60 ring-1 ring-indigo-400/30'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-gray-500'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {p.name}
                            </span>
                            {p.badge && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 truncate">{p.tagline}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-base font-extrabold text-white block">
                          {p.priceFormatted}
                        </span>
                        <span className="text-[10px] text-gray-400 block line-through">
                          {p.originalPrice}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Template Badge in Order Summary */}
              {selectedTemplate && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {isEn ? (
                      <>
                        {selectedPlanId === 'starter' && '🎯 Selected Template:'}
                        {selectedPlanId === 'pro' && '🎯 Primary Template:'}
                        {selectedPlanId === 'vip' && '👑 Flagship Architecture for VIP Setup:'}
                      </>
                    ) : (
                      <>
                        {selectedPlanId === 'starter' && '🎯 Template Selecionado:'}
                        {selectedPlanId === 'pro' && '🎯 Template Principal:'}
                        {selectedPlanId === 'vip' && '👑 Estrutura para Setup VIP:'}
                      </>
                    )}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {selectedTemplate.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {selectedTemplate.niche}
                    </span>
                  </div>
                </div>
              )}

              {/* Admin Highlight Pill */}
              {currentPlan.hasAdmin ? (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isEn ? '🔥 DYNAMIC CMS ADMIN PANEL INCLUDED IN THIS PACKAGE' : '🔥 PAINEL DE ADMIN DINÂMICO INCLUSO NESTE PACOTE'}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isEn ? 'Clean static HTML/Tailwind codebase (no admin panel)' : 'Código estático em HTML/Tailwind (sem painel de admin)'}
                  </span>
                </div>
              )}

              {/* Deliverables List */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {isEn ? 'What is included in your purchase:' : 'Itens Inclusos na sua compra:'}
                </span>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {currentPlan.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>{isEn ? 'List Price:' : 'Valor de Tabela:'}</span>
                  <span className="line-through">{currentPlan.originalPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>{isEn ? 'Exclusive Today Discount:' : 'Desconto Exclusivo Hoje:'}</span>
                  <span>{isEn ? '- Guaranteed Savings' : '- Economia Garantida'}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                  <span className="text-sm font-bold text-white">
                    {isEn ? 'Total to Pay:' : 'Total a Pagar:'}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {currentPlan.priceFormatted}
                    </span>
                    <span className="text-[11px] text-gray-400 block">{currentPlan.installments}</span>
                  </div>
                </div>
              </div>

              {/* Guarantee Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <strong className="text-white block font-bold">
                    {isEn ? '7-Day Ironclad Guarantee' : 'Garantia Blindada de 7 Dias'}
                  </strong>
                  <p className="text-gray-400 leading-relaxed">
                    {isEn
                      ? 'You have 7 full days to test all architectures. If you do not love the speed, design, and code quality, we refund 100% of your investment immediately.'
                      : 'Você tem 7 dias para testar as estruturas. Se não gostar, devolvemos 100% do seu dinheiro imediatamente.'}
                  </p>
                </div>
              </div>

              {/* Help Line */}
              <div className="text-center pt-2">
                <a
                  href={`https://wa.me/5514998627852?text=${encodeURIComponent(
                    isEn
                      ? `Hello RMTI! I'm on checkout choosing the ${currentPlan.name} package (template: ${selectedTemplate?.name}) and had a quick question.`
                      : `Olá RMTI! Estou no checkout escolhendo o plano ${currentPlan.name} (template: ${selectedTemplate?.name}) e gostaria de tirar uma dúvida.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isEn ? 'Questions before paying? Chat with us on WhatsApp' : 'Dúvida antes de pagar? Fale no WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{isEn ? '© 2026 RMTI • High-Converting Digital Solutions.' : '© 2026 RMTI • Soluções Digitais sob Medida.'}</span>
          <div className="flex items-center gap-3 text-gray-400">
            <span>{isEn ? 'Payments processed securely with official Mercado Pago / SSL encryption' : 'Pagamentos processados com a segurança oficial do Mercado Pago'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-white text-sm">
          Loading secure checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
