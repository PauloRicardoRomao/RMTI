const DEFAULT_CONFIG = {
  "companyName": "Sua Empresa & Soluções",
  "tagline": "Engenharia, Soluções Inteligentes e Resultados que Impulsionam Negócios",
  "logoUrl": "assets/imagens/logo-placeholder.png",
  "bannerUrl": "assets/imagens/banner-placeholder.jpg",
  "primaryColor": "#2563eb",
  "secondaryColor": "#f59e0b",
  "whatsapp": "5511999999999",
  "whatsappMessage": "Olá! Gostaria de solicitar uma proposta comercial para minha empresa.",
  "email": "comercial@suaempresa.com.br",
  "address": "Av. Paulista, 1000 - São Paulo, SP",
  "topBarText": "LÍDERES EM INOVAÇÃO E TRANSFORMAÇÃO DIGITAL PARA MÉDIAS E GRANDES EMPRESAS",
  "headline": "Aceleramos o Crescimento do Seu Negócio com Soluções de Alta Performance",
  "subheadline": "Desenvolvemos tecnologia sob medida, processos eficientes e estratégias focadas em maximizar a rentabilidade e a escala da sua operação.",
  "ctaButtonText": "SOLICITAR PROPOSTA PERSONALIZADA",
  "ctaSubtext": "Atendimento Executivo • Proposta em até 24 Horas",
  "stats": [
    {
      "number": "+500",
      "label": "Projetos Entregues com Sucesso"
    },
    {
      "number": "99.4%",
      "label": "Índice de Satisfação dos Clientes"
    },
    {
      "number": "10+",
      "label": "Anos de Atuação no Mercado"
    },
    {
      "number": "R$ 15M+",
      "label": "Em Receita Gerada para Clientes"
    }
  ],
  "services": [
    {
      "title": "Consultoria Estratégica & Diagnóstico",
      "desc": "Análise aprofundada dos seus fluxos de trabalho e oportunidades de otimização de custos e processos operacionais."
    },
    {
      "title": "Desenvolvimento Tecnológico sob Medida",
      "desc": "Arquiteturas modernas, escaláveis e com foco na melhor experiência de uso para clientes e colaboradores."
    },
    {
      "title": "Segurança, Compliance & Governança",
      "desc": "Boas práticas rigorosas de proteção de dados (LGPD), criptografia de ponta e estabilidade 24 horas por dia."
    },
    {
      "title": "Suporte Contínuo & Sustentação",
      "desc": "Equipe dedicada para manter sua operação funcionando perfeitamente, com SLAs rigorosos e atendimento direto."
    }
  ],
  "differentials": [
    {
      "title": "Entregas Ágeis e no Prazo",
      "desc": "Metodologias comprovadas que eliminam retrabalhos e garantem datas cumpridas à risca."
    },
    {
      "title": "Transparência de Custos",
      "desc": "Escopos claros, sem surpresas no faturamento ou taxas ocultas de manutenção."
    },
    {
      "title": "Propriedade 100% Sua",
      "desc": "Todo o código, dados e entregáveis pertencem integralmente à sua empresa."
    }
  ],
  "testimonials": [
    {
      "name": "Roberto Junqueira",
      "role": "CEO • Grupo Horizon Tech",
      "text": "A parceria com a equipe transformou a eficiência operacional da nossa rede. Recomendo fortemente para qualquer empresa que busque excelência."
    },
    {
      "name": "Mariana Duarte",
      "role": "Diretora de Operações • Nexa Log",
      "text": "Profissionalismo impecável do início ao fim do projeto. A entrega aconteceu antes do prazo e com qualidade excepcional."
    }
  ],
  "faqs": [
    {
      "q": "Como funciona o processo de contratação?",
      "a": "Iniciamos com uma reunião de alinhamento para entender seu escopo, elaboramos a proposta comercial personalizada e iniciamos em até 48h após a aprovação."
    },
    {
      "q": "Vocês emitem Nota Fiscal e assinam NDA?",
      "a": "Com certeza! Emitimos NF para todos os serviços e assinamos termo de confidencialidade (NDA) para proteger seus dados estratégicos."
    },
    {
      "q": "Existe suporte após a entrega do projeto?",
      "a": "Sim, todos os contratos possuem garantia de suporte técnico contínuo e canal direto com o gerente de projeto."
    }
  ],
  "metaPixelId": "",
  "googleAdsId": ""
};
window.PAGE_CONFIG = (function() {
  try {
    const saved = localStorage.getItem('pacote-03-institucional-negocios_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
})();
