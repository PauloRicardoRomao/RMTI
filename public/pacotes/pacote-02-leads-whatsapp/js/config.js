const DEFAULT_CONFIG = {
  "businessName": "Seu Nome / Sua Clínica",
  "professionalTitle": "Especialista em [Sua Especialidade] • [Registro Profissional]",
  "logoUrl": "assets/imagens/logo-placeholder.png",
  "bannerUrl": "assets/imagens/banner-placeholder.jpg",
  "photoUrl": "assets/imagens/foto-placeholder.jpg",
  "primaryColor": "#0284c7",
  "secondaryColor": "#10b981",
  "whatsapp": "5511999999999",
  "whatsappMessage": "Olá! Vim pelo site e gostaria de agendar uma consulta/avaliação.",
  "email": "contato@seunome.com.br",
  "address": "Atendimento Online para todo o Brasil ou Presencial no seu Endereço",
  "topBarText": "AGENDA ABERTA PARA NOVOS PACIENTES / CLIENTES NESTE MÊS",
  "headline": "Transforme Sua [Área de Atuação] com um Acompanhamento 100% Individualizado",
  "subheadline": "Metodologia científica e personalizada para você atingir seus objetivos com segurança, sem fórmulas prontas ou promessas milagrosas.",
  "ctaButtonText": "FALAR COMIGO NO WHATSAPP",
  "ctaSubtext": "⚡ Resposta Rápida • Vagas Limitadas",
  "painPointsTitle": "Você se identifica com algum desses desafios?",
  "painPoints": [
    "Sensação de esforço constante sem ver resultados concretos na balança ou no espelho.",
    "Falta de tempo para rotinas complexas e dietas/treinos insustentáveis.",
    "Insegurança sobre a execução correta e medo de lesões ou efeito sanfona.",
    "Atendimentos genéricos onde você é apenas mais um número em uma planilha."
  ],
  "services": [
    {
      "title": "01. Diagnóstico Inicial Detalhado",
      "desc": "Avaliação completa do seu histórico, rotina, exames e objetivos antes de qualquer prescrição."
    },
    {
      "title": "02. Planejamento 100% Sob Medida",
      "desc": "Protocolo desenhado exclusivamente para sua realidade, adaptando-se à sua rotina diária."
    },
    {
      "title": "03. Acompanhamento Contínuo",
      "desc": "Suporte direto via WhatsApp para tirar dúvidas, ajustar planos e manter sua motivação em alta."
    },
    {
      "title": "04. Reavaliações Periódicas",
      "desc": "Análise de métricas e fotos para garantir que você continue evoluindo semana após semana."
    }
  ],
  "plans": [
    {
      "name": "Plano Mensal",
      "price": "R$ 197",
      "period": "/mês",
      "highlight": false,
      "features": [
        "Avaliação inicial completa",
        "Plano personalizado de 30 dias",
        "Suporte semanal via WhatsApp",
        "Ajuste de dúvidas pontuais"
      ],
      "ctaText": "Escolher Plano Mensal",
      "whatsappMsg": "Olá! Gostaria de iniciar no Plano Mensal."
    },
    {
      "name": "Plano Trimestral",
      "price": "3x R$ 149",
      "period": "ou R$ 397 à vista",
      "highlight": true,
      "badge": "MAIS RECOMENDADO",
      "features": [
        "Tudo do Plano Mensal",
        "Ajustes quinzenais de protocolo",
        "Acompanhamento prioritário VIP",
        "Guia complementar de hábitos saudáveis",
        "Avaliação postural/física por foto"
      ],
      "ctaText": "Quero o Plano Trimestral VIP",
      "whatsappMsg": "Olá! Gostaria de garantir minha vaga no Plano Trimestral VIP."
    },
    {
      "name": "Plano Semestral",
      "price": "6x R$ 119",
      "period": "ou R$ 647 à vista",
      "highlight": false,
      "features": [
        "Transformação de longo prazo",
        "Protocolo completo de 6 meses",
        "Check-ins em vídeo mensais",
        "Canal direto no WhatsApp 24/7",
        "Acesso a todos os materiais extras"
      ],
      "ctaText": "Escolher Plano Semestral",
      "whatsappMsg": "Olá! Gostaria de me inscrever no Plano Semestral."
    }
  ],
  "testimonials": [
    {
      "name": "Patrícia Rocha",
      "role": "Cliente há 6 meses",
      "rating": 5,
      "text": "Foi o melhor investimento na minha saúde! Perdi 12kg sem passar fome e minha energia no trabalho triplicou."
    },
    {
      "name": "Marcos Vinicius",
      "role": "Cliente há 1 ano",
      "rating": 5,
      "text": "O atendimento individualizado faz toda a diferença. Ele entende minha rotina de viagens e adapta tudo perfeitamente."
    },
    {
      "name": "Juliana Costa",
      "role": "Cliente há 3 meses",
      "rating": 5,
      "text": "Atenção nota 10 no WhatsApp. Nunca me senti desamparada durante o processo. Super recomendo!"
    }
  ],
  "faqs": [
    {
      "q": "O atendimento pode ser feito 100% online?",
      "a": "Sim! Toda a avaliação, envio de protocolos, ajustes e suporte acontecem pelo aplicativo e WhatsApp, com a mesma eficácia do presencial."
    },
    {
      "q": "Como funciona o suporte no WhatsApp?",
      "a": "Você terá um canal direto comigo de segunda a sexta para tirar dúvidas, enviar vídeos de execução e receber feedbacks rápidos."
    },
    {
      "q": "Como realizo o pagamento?",
      "a": "O pagamento é feito com total segurança via Pix ou Cartão de Crédito parcelado através da nossa plataforma."
    }
  ],
  "metaPixelId": "",
  "googleAdsId": ""
};
window.PAGE_CONFIG = (function() {
  try {
    const saved = localStorage.getItem('pacote-02-leads-whatsapp_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
})();
