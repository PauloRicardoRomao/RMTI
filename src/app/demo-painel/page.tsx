'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  ExternalLink,
  MessageCircle,
  Sparkles,
  DollarSign,
  Flame,
  Award,
  Layers,
  ShieldCheck,
  Check,
  ArrowRight,
  Sliders,
  Smartphone,
  Globe,
  Trash2,
  Plus,
} from 'lucide-react';

interface ModelContent {
  id: string;
  name: string;
  nicheLabel: string;
  demoUrl: string;
  hero: {
    badge: string;
    headline: string;
    subtitle: string;
    ctaText: string;
  };
  contact: {
    whatsapp: string;
    whatsappMessage: string;
    instagram: string;
    credentials: string; // CREF, CRM, CRN, OAB, etc.
  };
  urgency: {
    active: boolean;
    bannerText: string;
  };
  plans: Array<{
    id: string;
    name: string;
    badge?: string;
    price: string;
    installments: string;
    features: string[];
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    result: string;
    comment: string;
  }>;
  tracking: {
    metaPixelId: string;
    googleAdsId: string;
  };
}

const MODELS_PRESETS: Record<string, ModelContent> = {
  '02-personal-trainer': {
    id: '02-personal-trainer',
    name: 'Personal Trainer & Consultoria Fitness',
    nicheLabel: 'Fitness & Biomecânica',
    demoUrl: '/modelos/02-personal-trainer',
    hero: {
      badge: 'CREF 185468-G/SP • +350 Vidas Transformadas',
      headline: 'Construa o Corpo que Sempre Quis com Acompanhamento Biomecânico Individual',
      subtitle: 'Treinos 100% personalizados no seu celular, correção de postura em vídeo HD e suporte diário direto comigo no WhatsApp.',
      ctaText: 'Garantir Minha Vaga no WhatsApp',
    },
    contact: {
      whatsapp: '14998627852',
      whatsappMessage: 'Olá! Gostaria de saber mais sobre a Consultoria Fitness e garantir minha vaga!',
      instagram: '@treinador.exemplo',
      credentials: 'CREF 185468-G/SP • Especialista em Biomecânica',
    },
    urgency: {
      active: true,
      bannerText: '🔥 VAGAS ABERTAS PARA A CONSULTORIA ONLINE • RESTAM APENAS 4 VAGAS NESTE MÊS',
    },
    plans: [
      {
        id: 'mensal',
        name: 'Plano Mensal Start',
        price: 'R$ 190,00',
        installments: 'ou 3x de R$ 68,00',
        features: ['Treino personalizado pelo app', 'Suporte WhatsApp segunda a sexta', 'Ajuste inicial de ficha'],
      },
      {
        id: 'trimestral',
        name: 'Plano Trimestral Pro',
        badge: 'MAIS ESCOLHIDO (RECOMENDADO)',
        price: 'R$ 450,00',
        installments: 'ou 12x de R$ 45,18',
        features: ['3 meses de evolução contínua', 'Análise biomecânica em vídeo', 'Suporte prioritário 7 dias por semana', 'Guia de nutrientes para treino'],
      },
      {
        id: 'semestral',
        name: 'Plano Semestral VIP',
        price: 'R$ 780,00',
        installments: 'ou 12x de R$ 78,31',
        features: ['6 meses de transformação completa', 'Chamadas mensais de alinhamento', 'Correções ilimitadas em vídeo', 'Acesso vitalício aos bônus'],
      },
    ],
    testimonials: [
      { id: '1', name: 'Rodrigo M.', result: '-14kg em 90 dias', comment: 'Treinos rápidos de 45 minutos que cabem na minha rotina. Sem dores no ombro!' },
      { id: '2', name: 'Juliana S.', result: 'Ganho de massa magra', comment: 'A correção em vídeo mudou tudo. Aprendi a agachar sem forçar a lombar.' },
    ],
    tracking: {
      metaPixelId: '2161688604424737',
      googleAdsId: 'AW-18531803428',
    },
  },

  '01-curso-infoproduto': {
    id: '01-curso-infoproduto',
    name: 'Curso Online & Infoproduto',
    nicheLabel: 'Educação & Cursos Digitais',
    demoUrl: '/modelos/01-curso-infoproduto',
    hero: {
      badge: 'Treinamento Prático com Acesso Vitalício + Certificado',
      headline: 'O Método Definitivo para Dominar Esta Habilidade e Multiplicar Seus Resultados',
      subtitle: 'Aprenda do zero ao avançado através de aulas práticas em vídeo com materiais de apoio e suporte exclusivo para dúvidas.',
      ctaText: 'Quero Garantir Minha Vaga com Desconto',
    },
    contact: {
      whatsapp: '14998627852',
      whatsappMessage: 'Olá! Estou na página do curso e gostaria de tirar uma dúvida sobre a matrícula.',
      instagram: '@expert.cursos',
      credentials: 'Mais de 2.400 alunos formados no Brasil e exterior',
    },
    urgency: {
      active: true,
      bannerText: '⚡ OFERTA DE LANÇAMENTO COM 60% DE DESCONTO • EXPIRA EM POUCAS HORAS',
    },
    plans: [
      {
        id: 'curso-completo',
        name: 'Acesso Completo + Todos os Bônus',
        badge: 'OFERTA ESPECIAL',
        price: 'R$ 197,00',
        installments: 'ou 12x de R$ 19,78',
        features: [
          'Acesso imediato e vitalício a todas as aulas em 4K',
          'Certificado oficial de conclusão incluso',
          'Comunidade exclusiva de alunos no WhatsApp/Telegram',
          'Garantia incondicional blindada de 7 dias',
        ],
      },
    ],
    testimonials: [
      { id: '1', name: 'Lucas F.', result: 'Primeiros resultados em 2 semanas', comment: 'Didática direta ao ponto sem enrolação. Valeu cada centavo!' },
      { id: '2', name: 'Camila R.', result: 'Transição de carreira concluída', comment: 'O suporte respondeu todas as minhas dúvidas no mesmo dia.' },
    ],
    tracking: {
      metaPixelId: '',
      googleAdsId: '',
    },
  },

  '03-coach-mentoria': {
    id: '03-coach-mentoria',
    name: 'Coach Executivo & Mentoria de Alta Performance',
    nicheLabel: 'Mentoria & Consultoria Estratégica',
    demoUrl: '/modelos/03-coach-mentoria',
    hero: {
      badge: 'Mentoria Estratégica para Líderes & Profissionais',
      headline: 'Escale Seus Resultados e Destrave o Próximo Nível da Sua Carreira',
      subtitle: 'Acompanhamento individualizado e confidencial focado em processos claros, liderança de impacto e decisões estratégicas.',
      ctaText: 'Aplicar para a Mentoria Individual',
    },
    contact: {
      whatsapp: '14998627852',
      whatsappMessage: 'Olá! Gostaria de aplicar para a sua mentoria individual.',
      instagram: '@mentor.executivo',
      credentials: 'Mais de 15 anos acelerando negócios e executivos',
    },
    urgency: {
      active: true,
      bannerText: '👑 APENAS 3 VAGAS DISPONÍVEIS PARA O NOVO CICLO DE MENTORIA',
    },
    plans: [
      {
        id: 'mentoria-individual',
        name: 'Ciclo Trimestral de Aceleração VIP',
        badge: 'EXCLUSIVO • SELEÇÃO POR PERFIL',
        price: 'R$ 2.400,00',
        installments: 'ou 12x de R$ 240,96',
        features: [
          '6 Encontros individuais e ao vivo de 90 minutos',
          'Acesso direto ao WhatsApp particular do mentor',
          'Plano de Ação Estratégico personalizado para 12 meses',
          'Diagnóstico detalhado de pontos cegos de liderança',
        ],
      },
    ],
    testimonials: [
      { id: '1', name: 'Marcelo V.', result: 'Crescimento de 140% no faturamento', comment: 'A clareza mental que ganhei nas primeiras 3 semanas pagou o investimento.' },
    ],
    tracking: {
      metaPixelId: '',
      googleAdsId: '',
    },
  },

  '04-servicos-leadgen': {
    id: '04-servicos-leadgen',
    name: 'Clínicas, Consultórios & Prestadores de Serviços',
    nicheLabel: 'Serviços Especializados',
    demoUrl: '/modelos/04-servicos-leadgen',
    hero: {
      badge: 'Atendimento com Excelência, Conforto & Tecnologia',
      headline: 'Cuidado Especializado e Tratamentos de Alta Precisão para Você',
      subtitle: 'Equipe multidisciplinar, ambiente moderno e atendimento humanizado agendado com hora marcada.',
      ctaText: 'Agendar Avaliação pelo WhatsApp',
    },
    contact: {
      whatsapp: '14998627852',
      whatsappMessage: 'Olá! Gostaria de agendar uma consulta/avaliação na clínica.',
      instagram: '@clinica.especializada',
      credentials: 'Corpo clínico com registro e mais de 10 anos de excelência',
    },
    urgency: {
      active: true,
      bannerText: '📍 ATENDIMENTO EM SÃO PAULO/SP • AGENDAMENTOS ABERTOS PARA ESTA SEMANA',
    },
    plans: [
      {
        id: 'avaliacao',
        name: 'Consulta & Avaliação Completa',
        price: 'R$ 150,00',
        installments: 'ou Pix na recepção',
        features: ['Diagnóstico completo com especialistas', 'Ambiente moderno e estacionamento', 'Orientações personalizadas'],
      },
    ],
    testimonials: [
      { id: '1', name: 'Mariana B.', result: 'Atendimento nota 10', comment: 'Pontualidade britânica e profissionais que realmente escutam o paciente.' },
    ],
    tracking: {
      metaPixelId: '',
      googleAdsId: '',
    },
  },

  '05-nutricao-saude': {
    id: '05-nutricao-saude',
    name: 'Nutrição Clínica & Emagrecimento Saudável',
    nicheLabel: 'Saúde & Nutrição',
    demoUrl: '/modelos/05-nutricao-saude',
    hero: {
      badge: 'CRN-3 / Especialista em Reeducação Alimentar',
      headline: 'Emagreça com Saúde sem Dietas Malucas ou Efeito Sanfona',
      subtitle: 'Planos alimentares adaptados à sua rotina real, suas preferências gastronômicas e com suporte contínuo no WhatsApp.',
      ctaText: 'Agendar Consulta Nutricional',
    },
    contact: {
      whatsapp: '14998627852',
      whatsappMessage: 'Olá Dra.! Gostaria de agendar minha consulta nutricional.',
      instagram: '@nutri.saude',
      credentials: 'Nutricionista Clínica e Esportiva • CRN-3 / 00000',
    },
    urgency: {
      active: true,
      bannerText: '🥗 AGENDA DE CONSULTAS ABERTA • ATENDIMENTO PRESENCIAL E ONLINE',
    },
    plans: [
      {
        id: 'consulta',
        name: 'Consulta + Bioimpedância + Plano Alimentar',
        badge: 'MAIS BUSCADO',
        price: 'R$ 220,00',
        installments: 'ou 3x de R$ 78,00',
        features: [
          'Consulta detalhada presencial ou por vídeo',
          'Plano alimentar no aplicativo com receitas práticas',
          'Suporte diário de dúvidas no WhatsApp',
          'Retorno em 30 dias para avaliar evolução',
        ],
      },
    ],
    testimonials: [
      { id: '1', name: 'Fernanda T.', result: '-9kg em 60 dias sem passar fome', comment: 'A primeira nutricionista que não cortou o pão do meu café da manhã!' },
    ],
    tracking: {
      metaPixelId: '',
      googleAdsId: '',
    },
  },
};

function DemoPainelContent() {
  const searchParams = useSearchParams();
  const requestedModel = searchParams.get('modelo') || '02-personal-trainer';

  // Normalize requested model or fallback
  const initialModelId = MODELS_PRESETS[requestedModel]
    ? requestedModel
    : requestedModel.includes('personal') || requestedModel.includes('renan')
    ? '02-personal-trainer'
    : requestedModel.includes('curso') || requestedModel.includes('infoproduto')
    ? '01-curso-infoproduto'
    : requestedModel.includes('coach') || requestedModel.includes('mentoria')
    ? '03-coach-mentoria'
    : requestedModel.includes('servico') || requestedModel.includes('leadgen')
    ? '04-servicos-leadgen'
    : requestedModel.includes('nutri') || requestedModel.includes('saude')
    ? '05-nutricao-saude'
    : '02-personal-trainer';

  const [selectedModelId, setSelectedModelId] = useState<string>(initialModelId);
  const [modelData, setModelData] = useState<ModelContent>(MODELS_PRESETS[initialModelId]);

  // Auth state (Simulation of customer's first access)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Logged in by default in demo, with option to test login
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'hero' | 'contact' | 'plans' | 'urgency' | 'tracking'>('hero');

  // Handle Model Change
  const handleModelChange = (newId: string) => {
    setSelectedModelId(newId);
    if (MODELS_PRESETS[newId]) {
      setModelData(MODELS_PRESETS[newId]);
    }
  };

  const handleSaveDemo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('Alterações salvas com sucesso! Na landing page real do cliente, isso atualiza instantaneamente no domínio dele sem precisar de programador.');
    setTimeout(() => setSaveSuccess(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Demo Banner for Visitors */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-2 text-slate-950 font-bold text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 text-[10px] uppercase font-black">
            Painel do Cliente
          </span>
          <span>
            Este é o <strong>Painel Administrativo Limpo e Exclusivo</strong> que seu cliente receberá para gerenciar a Landing Page dele.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-slate-950 hover:underline text-xs flex items-center gap-1 font-extrabold"
          >
            <span>Voltar ao Site da RMTI</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Header do Painel do Cliente */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white">Painel da Minha Página</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                  CMS Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Modelo em edição: <strong className="text-white">{modelData.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Seletor do Modelo da Demonstração */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <span className="text-slate-500 text-[11px] font-bold">Ver Modelo:</span>
              <select
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="02-personal-trainer" className="bg-slate-900 text-white">🏋️ Personal Trainer</option>
                <option value="01-curso-infoproduto" className="bg-slate-900 text-white">🎓 Curso Online &amp; Infoproduto</option>
                <option value="03-coach-mentoria" className="bg-slate-900 text-white">🧠 Mentoria &amp; Coach</option>
                <option value="04-servicos-leadgen" className="bg-slate-900 text-white">💼 Serviços &amp; Clínicas</option>
                <option value="05-nutricao-saude" className="bg-slate-900 text-white">🥗 Nutrição &amp; Saúde</option>
              </select>
            </div>

            <a
              href={modelData.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver Página no Ar</span>
            </a>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Testar como o cliente redefine a senha no primeiro acesso"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Mudar Senha (123456)</span>
            </button>
          </div>
        </div>

        {/* Abas de Edição da Landing Page do Cliente */}
        <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto no-scrollbar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 py-2">
            {[
              { id: 'hero', label: '1. Textos & Chamada (Hero)', icon: Sparkles },
              { id: 'contact', label: '2. WhatsApp & Contatos', icon: MessageCircle },
              { id: 'plans', label: '3. Planos & Preços', icon: DollarSign },
              { id: 'urgency', label: '4. Vagas & Urgência', icon: Flame },
              { id: 'tracking', label: '5. Meta Pixel & Anúncios', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Feedback Toast */}
      {saveSuccess && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4 w-full">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        </div>
      )}

      {/* Conteúdo Principal de Edição do Modelo */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSaveDemo} className="flex flex-col gap-6">
          {/* ABA 1: HERO & TEXTOS PRINCIPAIS */}
          {activeTab === 'hero' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Textos e Headline Principal da Página</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Estes são os textos que seu aluno/cliente lê no primeiro segundo que abre seu link na bio.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Etiqueta / Badge Superior
                </label>
                <input
                  type="text"
                  value={modelData.hero.badge}
                  onChange={(e) =>
                    setModelData({
                      ...modelData,
                      hero: { ...modelData.hero, badge: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Headline Principal (Sua Grande Promessa)
                </label>
                <textarea
                  rows={3}
                  value={modelData.hero.headline}
                  onChange={(e) =>
                    setModelData({
                      ...modelData,
                      hero: { ...modelData.hero, headline: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Subtítulo Explicativo (Como você entrega esse resultado)
                </label>
                <textarea
                  rows={3}
                  value={modelData.hero.subtitle}
                  onChange={(e) =>
                    setModelData({
                      ...modelData,
                      hero: { ...modelData.hero, subtitle: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Texto do Botão Principal de Conversão
                </label>
                <input
                  type="text"
                  value={modelData.hero.ctaText}
                  onChange={(e) =>
                    setModelData({
                      ...modelData,
                      hero: { ...modelData.hero, ctaText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                />
              </div>
            </div>
          )}

          {/* ABA 2: WHATSAPP & CONTATOS */}
          {activeTab === 'contact' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Configuração de WhatsApp &amp; Credenciais</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Para onde o visitante é direcionado quando clica nos botões de compra ou consultoria.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Número de WhatsApp (DDD + Número)
                  </label>
                  <input
                    type="text"
                    value={modelData.contact.whatsapp}
                    onChange={(e) =>
                      setModelData({
                        ...modelData,
                        contact: { ...modelData.contact, whatsapp: e.target.value },
                      })
                    }
                    placeholder="Ex: 14998627852"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Apenas números, com DDD. Ex: 14998627852</span>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Instagram Oficial
                  </label>
                  <input
                    type="text"
                    value={modelData.contact.instagram}
                    onChange={(e) =>
                      setModelData({
                        ...modelData,
                        contact: { ...modelData.contact, instagram: e.target.value },
                      })
                    }
                    placeholder="Ex: @seu.perfil"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Registro / Credencial Profissional
                </label>
                <input
                  type="text"
                  value={modelData.contact.credentials}
                  onChange={(e) =>
                    setModelData({
                      ...modelData,
                      contact: { ...modelData.contact, credentials: e.target.value },
                    })
                  }
                  placeholder="Ex: CREF 185468-G/SP, CRM, CRN, OAB..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Mensagem Automática Inicial do WhatsApp
                </label>
                <textarea
                  rows={2}
                  value={modelData.contact.whatsappMessage}
                  onChange={(e) =>
                    setModelData({
                      ...modelData,
                      contact: { ...modelData.contact, whatsappMessage: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Esta mensagem já vem pronta digitada na tela do cliente quando ele abre o WhatsApp.
                </span>
              </div>
            </div>
          )}

          {/* ABA 3: PLANOS & PREÇOS */}
          {activeTab === 'plans' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span>Planos de Consultoria, Valores &amp; Ofertas</span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Altere os preços das suas consultorias pelo celular sempre que quiser reajustar.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modelData.plans.map((plan, pIdx) => (
                  <div key={plan.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                      Plano 0{pIdx + 1}
                    </span>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Nome do Plano</label>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => {
                          const updated = [...modelData.plans];
                          updated[pIdx].name = e.target.value;
                          setModelData({ ...modelData, plans: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Preço (R$)</label>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = [...modelData.plans];
                            updated[pIdx].price = e.target.value;
                            setModelData({ ...modelData, plans: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Parcelamento</label>
                        <input
                          type="text"
                          value={plan.installments}
                          onChange={(e) => {
                            const updated = [...modelData.plans];
                            updated[pIdx].installments = e.target.value;
                            setModelData({ ...modelData, plans: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Badge de Destaque</label>
                      <input
                        type="text"
                        value={plan.badge || ''}
                        onChange={(e) => {
                          const updated = [...modelData.plans];
                          updated[pIdx].badge = e.target.value;
                          setModelData({ ...modelData, plans: updated });
                        }}
                        placeholder="Ex: MAIS VENDIDO"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 4: VAGAS & URGÊNCIA */}
          {activeTab === 'urgency' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>Barra de Vagas &amp; Gatilho de Urgência</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Exibe um aviso fixo no topo da página avisando que restam poucas vagas, gerando ação imediata no visitante.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="urgencyToggle"
                  checked={modelData.urgency.active}
                  onChange={(e) =>
                    setModelData({
                      ...modelData,
                      urgency: { ...modelData.urgency, active: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-800 cursor-pointer"
                />
                <label htmlFor="urgencyToggle" className="text-sm font-bold text-white cursor-pointer">
                  Exibir Barra de Urgência no Topo do Site
                </label>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Texto do Aviso de Vagas
                </label>
                <input
                  type="text"
                  value={modelData.urgency.bannerText}
                  onChange={(e) =>
                    setModelData({
                      ...modelData,
                      urgency: { ...modelData.urgency, bannerText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>
          )}

          {/* ABA 5: META PIXEL & RASTREAMENTO */}
          {activeTab === 'tracking' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  <span>Pixels de Anúncios (Meta Ads &amp; Google)</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Cole seus IDs de rastreamento para o Facebook e o Google contabilizarem cada clique de WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    ID do Meta Pixel (Facebook / Instagram)
                  </label>
                  <input
                    type="text"
                    value={modelData.tracking.metaPixelId}
                    onChange={(e) =>
                      setModelData({
                        ...modelData,
                        tracking: { ...modelData.tracking, metaPixelId: e.target.value },
                      })
                    }
                    placeholder="Ex: 2161688604424737"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    ID do Google Ads (AW-XXXXXXX)
                  </label>
                  <input
                    type="text"
                    value={modelData.tracking.googleAdsId}
                    onChange={(e) =>
                      setModelData({
                        ...modelData,
                        tracking: { ...modelData.tracking, googleAdsId: e.target.value },
                      })
                    }
                    placeholder="Ex: AW-18531803428"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botão de Salvar Alterações */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">
              💡 Qualquer alteração feita aqui atualiza o site no mesmo segundo sem tocar em código.
            </span>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações na Minha Página</span>
            </button>
          </div>
        </form>
      </main>

      {/* MODAL DE TESTE DE SENHA DO CLIENTE (Demonstração do 123456 -> Nova Senha) */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Segurança do Painel do Cliente</h3>
                <p className="text-xs text-slate-400">Senha padrão inicial: 123456</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              Ao receber o site da RMTI, seu cliente acessa com a senha inicial <strong>123456</strong> e é convidado a criar a senha dele. Teste como funciona:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Demonstração: No site real entregue pela RMTI, a nova senha é gravada criptografada em SHA-256 e protege o painel!');
                setShowPasswordModal(false);
              }}
              className="flex flex-col gap-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-300">Nova Senha Pessoal</label>
                <input
                  type="password"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Confirmar Senha</label>
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemoPainelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white text-xs">Carregando painel do cliente...</div>}>
      <DemoPainelContent />
    </Suspense>
  );
}

