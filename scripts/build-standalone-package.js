const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_DIR = 'C:\\Users\\ADM\\Desktop\\pacote-landing-page';
const RMTI_DIR = path.join(__dirname, '..');
const PLACEHOLDERS_DIR = path.join(RMTI_DIR, 'public/assets/placeholders');

console.log('Iniciando construção do Projeto Separado:', TARGET_DIR);

// 1. Criar estrutura de diretórios no Desktop
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

['admin', 'css', 'js', 'assets/imagens'].forEach(folder => {
  const fPath = path.join(TARGET_DIR, folder);
  if (!fs.existsSync(fPath)) fs.mkdirSync(fPath, { recursive: true });
});

// 2. Copiar placeholders
const placeholders = [
  'logo-placeholder.png',
  'banner-placeholder.jpg',
  'foto-placeholder.jpg',
  'mockup-placeholder.jpg'
];

placeholders.forEach(file => {
  const src = path.join(PLACEHOLDERS_DIR, file);
  const dest = path.join(TARGET_DIR, 'assets/imagens', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

// =============================================================================
// 3. CONFIGURAÇÃO UNIFICADA (config.js)
// =============================================================================
const unifiedConfig = {
  // SELETOR DO MODELO / LAYOUT ATIVO:
  // 'vendas-diretas' | 'leads-whatsapp' | 'institucional'
  activeLayout: 'vendas-diretas',

  // Identidade Geral
  businessName: 'Seu Negócio ou Especialista',
  tagline: 'Soluções de Alta Performance para Alavancar Seus Resultados',
  logoUrl: 'assets/imagens/logo-placeholder.png',
  bannerUrl: 'assets/imagens/banner-placeholder.jpg',
  photoUrl: 'assets/imagens/foto-placeholder.jpg',
  mockupUrl: 'assets/imagens/mockup-placeholder.jpg',
  primaryColor: '#10b981', // Verde esmeralda padrão

  // Contato & WhatsApp
  whatsapp: '5511999999999',
  whatsappMessage: 'Olá! Vim pelo site e gostaria de mais informações.',
  email: 'contato@seudominio.com.br',

  // ==========================================================
  // CONFIGURAÇÃO DO LAYOUT 1: VENDAS DIRETAS (VSL / OFERTA)
  // ==========================================================
  vendas: {
    topBar: '⚡ OFERTA ESPECIAL COM DESCONTO EXCLUSIVO POR TEMPO LIMITADO',
    badge: '🔥 MÉTODO 100% PRÁTICO & VALIDADO',
    headline: 'Descubra Como [Alcançar Grande Desejo] Sem [Principal Objeção ou Dor]',
    subheadline: 'O passo a passo validado para dominar [sua habilidade] em tempo recorde, mesmo começando do absoluto zero.',
    ctaButton: 'QUERO GARANTIR MEU ACESSO AGORA',
    ctaSubtext: '🔒 Pagamento 100% Seguro • Acesso Imediato',
    videoUrl: '', // URL do YouTube/Vimeo ou usa o mockup
    productName: 'Acesso Completo ao [Nome do Seu Produto]',
    originalPrice: 'R$ 497,00',
    salePrice: 'R$ 197,00',
    installments: '12x de R$ 19,78',
    checkoutUrl: 'checkout.html',
    guaranteeDays: '7',
    guaranteeText: 'Você tem 7 dias para testar tudo. Se por qualquer motivo achar que não valeu a pena, basta nos enviar um e-mail e devolvemos 100% do seu dinheiro, sem perguntas.',
    modules: [
      { title: 'Módulo 01: Fundamentos & Mentalidade', desc: 'A base sólida para começar da forma correta e sem perder tempo com erros comuns.' },
      { title: 'Módulo 02: O Método na Prática', desc: 'Passo a passo detalhado, tela por tela, para você aplicar e ver os primeiros resultados.' },
      { title: 'Módulo 03: Estratégias de Escala', desc: 'Como multiplicar seus ganhos e criar uma rotina previsível e altamente lucrativa.' },
      { title: 'Módulo 04: Ferramentas & Modelos Prontos', desc: 'Templates, planilhas e roteiros prontos para você copiar, colar e executar hoje mesmo.' }
    ],
    bonuses: [
      { title: 'Bônus 01: Comunidade Exclusiva', value: 'R$ 197', desc: 'Networking com outros membros e suporte diário para tirar dúvidas.' },
      { title: 'Bônus 02: Pack de Templates Prontos', value: 'R$ 147', desc: 'Arquivos 100% editáveis para acelerar sua implementação em 5x.' },
      { title: 'Bônus 03: Aula Secreta de Tráfego', value: 'R$ 297', desc: 'Como atrair visitantes qualificados gastando pouco em anúncios.' }
    ]
  },

  // ==========================================================
  // CONFIGURAÇÃO DO LAYOUT 2: LEADS & WHATSAPP (ESPECIALISTA)
  // ==========================================================
  leads: {
    topBar: 'AGENDA ABERTA PARA NOVOS PACIENTES / CLIENTES NESTE MÊS',
    badge: '★ ATENDIMENTO PERSONALIZADO',
    headline: 'Transforme Sua [Área de Atuação] com um Acompanhamento 100% Individualizado',
    subheadline: 'Metodologia científica e personalizada para você atingir seus objetivos com segurança, sem fórmulas prontas ou promessas milagrosas.',
    ctaButton: '💬 FALAR COMIGO NO WHATSAPP',
    ctaSubtext: '⚡ Resposta Rápida • Vagas Limitadas',
    professionalTitle: 'Especialista em [Sua Área] • Registro Profissional Oficial',
    plans: [
      {
        name: 'Plano Mensal',
        price: 'R$ 197',
        period: '/mês',
        highlight: false,
        features: ['Avaliação inicial completa', 'Plano personalizado de 30 dias', 'Suporte semanal via WhatsApp', 'Ajustes pontuais'],
        msg: 'Olá! Gostaria de iniciar no Plano Mensal.'
      },
      {
        name: 'Plano Trimestral VIP',
        price: '3x R$ 149',
        period: 'ou R$ 397',
        highlight: true,
        badge: 'MAIS ESCOLHIDO • 40% OFF',
        features: ['Tudo do Plano Mensal', 'Ajustes quinzenais de protocolo', 'Acompanhamento prioritário no WhatsApp', 'Guia complementar exclusivo', 'Avaliação postural / física completa'],
        msg: 'Olá! Gostaria de garantir minha vaga no Plano Trimestral VIP.'
      },
      {
        name: 'Plano Semestral',
        price: '6x R$ 119',
        period: 'ou R$ 647',
        highlight: false,
        features: ['Acompanhamento de 6 meses', 'Check-ins mensais em vídeo', 'Canal direto 24/7 no WhatsApp', 'Todos os materiais e bônus inclusos'],
        msg: 'Olá! Gostaria de me inscrever no Plano Semestral.'
      }
    ]
  },

  // ==========================================================
  // CONFIGURAÇÃO DO LAYOUT 3: INSTITUCIONAL & B2B (CORPORATIVO)
  // ==========================================================
  institucional: {
    topBar: 'LÍDERES EM INOVAÇÃO E TRANSFORMAÇÃO DIGITAL PARA MÉDIAS E GRANDES EMPRESAS',
    badge: '★ SOLUÇÕES CORPORATIVAS DE ALTA PERFORMANCE',
    headline: 'Aceleramos o Crescimento do Seu Negócio com Soluções de Alta Performance',
    subheadline: 'Desenvolvemos tecnologia sob medida, processos eficientes e estratégias focadas em maximizar a rentabilidade e a escala da sua operação.',
    ctaButton: 'SOLICITAR PROPOSTA PERSONALIZADA',
    ctaSubtext: 'Atendimento Executivo • Proposta em até 24 Horas',
    stats: [
      { num: '+500', label: 'Projetos Entregues' },
      { num: '99.4%', label: 'Satisfação dos Clientes' },
      { num: '10+', label: 'Anos de Mercado' },
      { num: 'R$ 15M+', label: 'Receita Gerada' }
    ],
    services: [
      { title: 'Consultoria Estratégica & Diagnóstico', desc: 'Análise aprofundada dos seus fluxos de trabalho e oportunidades de otimização de custos e processos.' },
      { title: 'Desenvolvimento Tecnológico Sob Medida', desc: 'Arquiteturas modernas, escaláveis e com foco na melhor experiência de uso para clientes e equipes.' },
      { title: 'Segurança, Compliance & Governança', desc: 'Boas práticas rigorosas de proteção de dados (LGPD), criptografia de ponta e estabilidade 24 horas.' },
      { title: 'Suporte Contínuo & Sustentação', desc: 'Equipe dedicada para manter sua operação funcionando perfeitamente, com SLAs rigorosos e atendimento direto.' }
    ]
  },

  // Dúvidas Frequentes Compartilhadas
  faqs: [
    { q: 'Como recebo o acesso ou atendimento?', a: 'O contato e envio são imediatos após a confirmação. Nossa equipe entrará em contato ou você receberá os dados no seu e-mail.' },
    { q: 'Funciona para qualquer tipo de nicho?', a: 'Sim! Toda a estrutura foi pensada para ser adaptada a infoprodutos, serviços, consultorias e empresas com alta conversão.' },
    { q: 'Como realizo a alteração de textos e imagens?', a: 'Basta acessar a pasta /admin pelo navegador e alterar qualquer item com 1 clique, sem precisar mexer em códigos.' }
  ],

  // Rastreamento
  metaPixelId: '',
  googleAdsId: ''
};

const configJsContent = `/**
 * Configuração Central do Pacote All-in-One de Landing Page
 * Você pode alterar os valores aqui manualmente ou usar o Painel Admin (/admin).
 */
const DEFAULT_CONFIG = ${JSON.stringify(unifiedConfig, null, 2)};

window.PAGE_CONFIG = (function() {
  try {
    const saved = localStorage.getItem('LP_ALLINONE_CONFIG');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
})();
`;
fs.writeFileSync(path.join(TARGET_DIR, 'js/config.js'), configJsContent);

console.log('js/config.js gerado com sucesso.');

module.exports = { TARGET_DIR, unifiedConfig };

