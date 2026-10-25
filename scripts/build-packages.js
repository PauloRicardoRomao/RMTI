const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = path.join(__dirname, '../public/pacotes');
const PLACEHOLDERS_DIR = path.join(__dirname, '../public/assets/placeholders');

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
}

// =============================================================================
// DEFINIÇÃO DOS 3 PACOTES POR ESTRUTURA
// =============================================================================
const PACKAGES = [
  {
    id: 'pacote-01-vendas-diretas',
    name: 'Pacote 01: Vendas Diretas & Checkout Integrado',
    structureType: 'Vendas Diretas (Direct Response / VSL / Infoprodutos)',
    tagline: 'Estrutura completa com foco em conversão imediata, vídeo/VSL, bônus, oferta irresistível e checkout próprio.',
    price: 97,
    originalPrice: 'R$ 297',
    badge: 'ALTA CONVERSÃO • VENDAS DIRETAS',
    targetAudience: 'Infoprodutores, criadores de cursos, e-books, mentorias gravadas e produtos com venda direta online.',
    defaultConfig: {
      businessName: 'Seu Produto ou Infoproduto',
      tagline: 'Método Passo a Passo para Alcançar [Seu Grande Resultado]',
      logoUrl: 'assets/imagens/logo-placeholder.png',
      bannerUrl: 'assets/imagens/banner-placeholder.jpg',
      mockupUrl: 'assets/imagens/mockup-placeholder.jpg',
      primaryColor: '#10b981', // Emerald
      secondaryColor: '#38bdf8', // Sky
      whatsapp: '5511999999999',
      whatsappMessage: 'Olá! Gostaria de tirar uma dúvida sobre o [Seu Produto].',
      email: 'contato@seudominio.com.br',
      
      // Hero
      topBarText: '⚡ OFERTA ESPECIAL COM DESCONTO EXCLUSIVO POR TEMPO LIMITADO',
      headline: 'Descubra Como [Alcançar Grande Desejo] Sem [Principal Objeção ou Dor]',
      subheadline: 'O passo a passo validado para dominar [sua habilidade] em tempo recorde, mesmo começando do absoluto zero.',
      ctaButtonText: 'QUERO GARANTIR MEU ACESSO AGORA',
      ctaSubtext: '🔒 Pagamento 100% Seguro • Acesso Imediato',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // ou placeholder
      
      // Oferta & Preço
      productName: 'Acesso Completo ao [Nome do Seu Produto]',
      originalPrice: 'R$ 297,00',
      salePrice: 'R$ 97,00',
      installments: '12x de R$ 9,74',
      checkoutUrl: 'checkout.html', // Próprio checkout do pacote ou Kiwify/Hotmart
      
      // Benefícios (O que você vai aprender)
      benefits: [
        { title: 'Módulo 01: Fundamentos & Mentalidade', desc: 'A base sólida para começar da forma correta e sem perder tempo com erros comuns.' },
        { title: 'Módulo 02: O Método na Prática', desc: 'Passo a passo detalhado, tela por tela, para você aplicar e ver os primeiros resultados.' },
        { title: 'Módulo 03: Estratégias de Escala', desc: 'Como multiplicar seus ganhos e criar uma rotina previsível e altamente lucrativa.' },
        { title: 'Módulo 04: Ferramentas & Modelos Prontos', desc: 'Templates, planilhas e roteiros prontos para você copiar, colar e executar hoje mesmo.' }
      ],

      // Bônus
      bonuses: [
        { title: 'Bônus 01: Comunidade Exclusiva', value: 'R$ 197', desc: 'Networking com outros membros e suporte diário para tirar dúvidas.' },
        { title: 'Bônus 02: Pack de Templates Prontos', value: 'R$ 147', desc: 'Arquivos 100% editáveis para acelerar sua implementação em 5x.' },
        { title: 'Bônus 03: Aula Secreta de Tráfego', value: 'R$ 297', desc: 'Como atrair visitantes qualificados gastando pouco em anúncios.' }
      ],

      // Depoimentos
      testimonials: [
        { name: 'Carlos Mendes', role: 'Aluno Verificado', rating: 5, text: 'O conteúdo superou todas as minhas expectativas. Em menos de 2 semanas recuperei o valor investido 10 vezes!' },
        { name: 'Fernanda Lima', role: 'Aluna Verificada', rating: 5, text: 'Didática impecável, direto ao ponto e sem enrolação. A melhor compra que fiz este ano.' },
        { name: 'Rodrigo Alves', role: 'Aluno Verificado', rating: 5, text: 'A estrutura do método me deu a clareza que eu procurava há meses na internet. Recomendo de olhos fechados!' }
      ],

      // Garantia
      guaranteeDays: '7',
      guaranteeTitle: 'Garantia Incondicional de 7 Dias',
      guaranteeText: 'Você tem 7 dias para testar tudo. Se por qualquer motivo achar que não valeu a pena, basta nos enviar um e-mail e devolvemos 100% do seu dinheiro, sem perguntas.',

      // FAQ
      faqs: [
        { q: 'Como recebo o meu acesso?', a: 'O envio é imediato após a confirmação do pagamento. Você receberá um e-mail com seus dados de login e senha para a plataforma.' },
        { q: 'Por quanto tempo terei acesso ao conteúdo?', a: 'Você terá acesso completo por 1 ano inteiro, incluindo todas as futuras atualizações e melhorias.' },
        { q: 'Funciona para quem está começando do zero?', a: 'Sim! O método foi estruturado desde o nível mais básico até as técnicas mais avançadas, com suporte a dúvidas.' },
        { q: 'Quais são as formas de pagamento disponíveis?', a: 'Você pode pagar via Pix (com liberação na hora) ou Cartão de Crédito em até 12x.' }
      ],

      // Pixels
      metaPixelId: '',
      googleAdsId: ''
    }
  },
  {
    id: 'pacote-02-leads-whatsapp',
    name: 'Pacote 02: Captura & WhatsApp Pré-Qualificado',
    structureType: 'Geração de Leads & Serviços (High-Ticket / Consultorias / Clínicas)',
    tagline: 'Estrutura para profissionais liberais, consultores e clínicas que vendem serviços de alto valor via WhatsApp.',
    price: 97,
    originalPrice: 'R$ 297',
    badge: 'QUALIFICAÇÃO • WHATSAPP VIP',
    targetAudience: 'Personal trainers, médicos, dentistas, nutricionistas, advogados, consultores e prestadores de serviço.',
    defaultConfig: {
      businessName: 'Seu Nome / Sua Clínica',
      professionalTitle: 'Especialista em [Sua Especialidade] • [Registro Profissional]',
      logoUrl: 'assets/imagens/logo-placeholder.png',
      bannerUrl: 'assets/imagens/banner-placeholder.jpg',
      photoUrl: 'assets/imagens/foto-placeholder.jpg',
      primaryColor: '#0284c7', // Sky Blue
      secondaryColor: '#10b981', // Emerald
      whatsapp: '5511999999999',
      whatsappMessage: 'Olá! Vim pelo site e gostaria de agendar uma consulta/avaliação.',
      email: 'contato@seunome.com.br',
      address: 'Atendimento Online para todo o Brasil ou Presencial no seu Endereço',

      // Hero
      topBarText: 'AGENDA ABERTA PARA NOVOS PACIENTES / CLIENTES NESTE MÊS',
      headline: 'Transforme Sua [Área de Atuação] com um Acompanhamento 100% Individualizado',
      subheadline: 'Metodologia científica e personalizada para você atingir seus objetivos com segurança, sem fórmulas prontas ou promessas milagrosas.',
      ctaButtonText: 'FALAR COMIGO NO WHATSAPP',
      ctaSubtext: '⚡ Resposta Rápida • Vagas Limitadas',

      // Dores & Soluções
      painPointsTitle: 'Você se identifica com algum desses desafios?',
      painPoints: [
        'Sensação de esforço constante sem ver resultados concretos na balança ou no espelho.',
        'Falta de tempo para rotinas complexas e dietas/treinos insustentáveis.',
        'Insegurança sobre a execução correta e medo de lesões ou efeito sanfona.',
        'Atendimentos genéricos onde você é apenas mais um número em uma planilha.'
      ],

      // Como Funciona / Serviços
      services: [
        { title: '01. Diagnóstico Inicial Detalhado', desc: 'Avaliação completa do seu histórico, rotina, exames e objetivos antes de qualquer prescrição.' },
        { title: '02. Planejamento 100% Sob Medida', desc: 'Protocolo desenhado exclusivamente para sua realidade, adaptando-se à sua rotina diária.' },
        { title: '03. Acompanhamento Contínuo', desc: 'Suporte direto via WhatsApp para tirar dúvidas, ajustar planos e manter sua motivação em alta.' },
        { title: '04. Reavaliações Periódicas', desc: 'Análise de métricas e fotos para garantir que você continue evoluindo semana após semana.' }
      ],

      // Planos de Atendimento
      plans: [
        {
          name: 'Plano Mensal',
          price: 'R$ 197',
          period: '/mês',
          highlight: false,
          features: ['Avaliação inicial completa', 'Plano personalizado de 30 dias', 'Suporte semanal via WhatsApp', 'Ajuste de dúvidas pontuais'],
          ctaText: 'Escolher Plano Mensal',
          whatsappMsg: 'Olá! Gostaria de iniciar no Plano Mensal.'
        },
        {
          name: 'Plano Trimestral',
          price: '3x R$ 149',
          period: 'ou R$ 397 à vista',
          highlight: true,
          badge: 'MAIS RECOMENDADO',
          features: ['Tudo do Plano Mensal', 'Ajustes quinzenais de protocolo', 'Acompanhamento prioritário VIP', 'Guia complementar de hábitos saudáveis', 'Avaliação postural/física por foto'],
          ctaText: 'Quero o Plano Trimestral VIP',
          whatsappMsg: 'Olá! Gostaria de garantir minha vaga no Plano Trimestral VIP.'
        },
        {
          name: 'Plano Semestral',
          price: '6x R$ 119',
          period: 'ou R$ 647 à vista',
          highlight: false,
          features: ['Transformação de longo prazo', 'Protocolo completo de 6 meses', 'Check-ins em vídeo mensais', 'Canal direto no WhatsApp 24/7', 'Acesso a todos os materiais extras'],
          ctaText: 'Escolher Plano Semestral',
          whatsappMsg: 'Olá! Gostaria de me inscrever no Plano Semestral.'
        }
      ],

      // Depoimentos / Transformações
      testimonials: [
        { name: 'Patrícia Rocha', role: 'Cliente há 6 meses', rating: 5, text: 'Foi o melhor investimento na minha saúde! Perdi 12kg sem passar fome e minha energia no trabalho triplicou.' },
        { name: 'Marcos Vinicius', role: 'Cliente há 1 ano', rating: 5, text: 'O atendimento individualizado faz toda a diferença. Ele entende minha rotina de viagens e adapta tudo perfeitamente.' },
        { name: 'Juliana Costa', role: 'Cliente há 3 meses', rating: 5, text: 'Atenção nota 10 no WhatsApp. Nunca me senti desamparada durante o processo. Super recomendo!' }
      ],

      // FAQ
      faqs: [
        { q: 'O atendimento pode ser feito 100% online?', a: 'Sim! Toda a avaliação, envio de protocolos, ajustes e suporte acontecem pelo aplicativo e WhatsApp, com a mesma eficácia do presencial.' },
        { q: 'Como funciona o suporte no WhatsApp?', a: 'Você terá um canal direto comigo de segunda a sexta para tirar dúvidas, enviar vídeos de execução e receber feedbacks rápidos.' },
        { q: 'Como realizo o pagamento?', a: 'O pagamento é feito com total segurança via Pix ou Cartão de Crédito parcelado através da nossa plataforma.' }
      ],

      metaPixelId: '',
      googleAdsId: ''
    }
  },
  {
    id: 'pacote-03-institucional-negocios',
    name: 'Pacote 03: Institucional & Apresentação Comercial',
    structureType: 'Institucional Corporativo & Catálogo (Empresas / Startups / B2B)',
    tagline: 'Estrutura corporativa de alta autoridade para empresas, agências e negócios que buscam fechar contratos de valor.',
    price: 97,
    originalPrice: 'R$ 297',
    badge: 'AUTORIDADE MÁXIMA • CORPORATIVO',
    targetAudience: 'Empresas de tecnologia, agências, escritórios de advocacia, construtoras, indústrias e negócios B2B.',
    defaultConfig: {
      companyName: 'Sua Empresa & Soluções',
      tagline: 'Engenharia, Soluções Inteligentes e Resultados que Impulsionam Negócios',
      logoUrl: 'assets/imagens/logo-placeholder.png',
      bannerUrl: 'assets/imagens/banner-placeholder.jpg',
      primaryColor: '#2563eb', // Royal Blue
      secondaryColor: '#f59e0b', // Amber
      whatsapp: '5511999999999',
      whatsappMessage: 'Olá! Gostaria de solicitar uma proposta comercial para minha empresa.',
      email: 'comercial@suaempresa.com.br',
      address: 'Av. Paulista, 1000 - São Paulo, SP',

      // Hero
      topBarText: 'LÍDERES EM INOVAÇÃO E TRANSFORMAÇÃO DIGITAL PARA MÉDIAS E GRANDES EMPRESAS',
      headline: 'Aceleramos o Crescimento do Seu Negócio com Soluções de Alta Performance',
      subheadline: 'Desenvolvemos tecnologia sob medida, processos eficientes e estratégias focadas em maximizar a rentabilidade e a escala da sua operação.',
      ctaButtonText: 'SOLICITAR PROPOSTA PERSONALIZADA',
      ctaSubtext: 'Atendimento Executivo • Proposta em até 24 Horas',

      // Métricas de Impacto
      stats: [
        { number: '+500', label: 'Projetos Entregues com Sucesso' },
        { number: '99.4%', label: 'Índice de Satisfação dos Clientes' },
        { number: '10+', label: 'Anos de Atuação no Mercado' },
        { number: 'R$ 15M+', label: 'Em Receita Gerada para Clientes' }
      ],

      // Pilares / Serviços Corporativos
      services: [
        {
          title: 'Consultoria Estratégica & Diagnóstico',
          desc: 'Análise aprofundada dos seus fluxos de trabalho e oportunidades de otimização de custos e processos operacionais.'
        },
        {
          title: 'Desenvolvimento Tecnológico sob Medida',
          desc: 'Arquiteturas modernas, escaláveis e com foco na melhor experiência de uso para clientes e colaboradores.'
        },
        {
          title: 'Segurança, Compliance & Governança',
          desc: 'Boas práticas rigorosas de proteção de dados (LGPD), criptografia de ponta e estabilidade 24 horas por dia.'
        },
        {
          title: 'Suporte Contínuo & Sustentação',
          desc: 'Equipe dedicada para manter sua operação funcionando perfeitamente, com SLAs rigorosos e atendimento direto.'
        }
      ],

      // Diferenciais Corporativos
      differentials: [
        { title: 'Entregas Ágeis e no Prazo', desc: 'Metodologias comprovadas que eliminam retrabalhos e garantem datas cumpridas à risca.' },
        { title: 'Transparência de Custos', desc: 'Escopos claros, sem surpresas no faturamento ou taxas ocultas de manutenção.' },
        { title: 'Propriedade 100% Sua', desc: 'Todo o código, dados e entregáveis pertencem integralmente à sua empresa.' }
      ],

      // Depoimentos Corporativos
      testimonials: [
        { name: 'Roberto Junqueira', role: 'CEO • Grupo Horizon Tech', text: 'A parceria com a equipe transformou a eficiência operacional da nossa rede. Recomendo fortemente para qualquer empresa que busque excelência.' },
        { name: 'Mariana Duarte', role: 'Diretora de Operações • Nexa Log', text: 'Profissionalismo impecável do início ao fim do projeto. A entrega aconteceu antes do prazo e com qualidade excepcional.' }
      ],

      // FAQ
      faqs: [
        { q: 'Como funciona o processo de contratação?', a: 'Iniciamos com uma reunião de alinhamento para entender seu escopo, elaboramos a proposta comercial personalizada e iniciamos em até 48h após a aprovação.' },
        { q: 'Vocês emitem Nota Fiscal e assinam NDA?', a: 'Com certeza! Emitimos NF para todos os serviços e assinamos termo de confidencialidade (NDA) para proteger seus dados estratégicos.' },
        { q: 'Existe suporte após a entrega do projeto?', a: 'Sim, todos os contratos possuem garantia de suporte técnico contínuo e canal direto com o gerente de projeto.' }
      ],

      metaPixelId: '',
      googleAdsId: ''
    }
  }
];

console.log('Estrutura dos 3 Pacotes carregada com sucesso.');
module.exports = { PACKAGES, BASE_DIR, PLACEHOLDERS_DIR };
