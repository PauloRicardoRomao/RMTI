/**
 * Configuração Padrão do Pacote 01: Vendas Diretas & Checkout
 * Este arquivo pode ser editado manualmente ou gerenciado pelo Painel Admin (/admin).
 */
const DEFAULT_CONFIG = {
  "businessName": "Seu Produto ou Infoproduto",
  "tagline": "Método Passo a Passo para Alcançar [Seu Grande Resultado]",
  "logoUrl": "assets/imagens/logo-placeholder.png",
  "bannerUrl": "assets/imagens/banner-placeholder.jpg",
  "mockupUrl": "assets/imagens/mockup-placeholder.jpg",
  "primaryColor": "#10b981",
  "secondaryColor": "#38bdf8",
  "whatsapp": "5511999999999",
  "whatsappMessage": "Olá! Gostaria de tirar uma dúvida sobre o [Seu Produto].",
  "email": "contato@seudominio.com.br",
  "topBarText": "⚡ OFERTA ESPECIAL COM DESCONTO EXCLUSIVO POR TEMPO LIMITADO",
  "headline": "Descubra Como [Alcançar Grande Desejo] Sem [Principal Objeção ou Dor]",
  "subheadline": "O passo a passo validado para dominar [sua habilidade] em tempo recorde, mesmo começando do absoluto zero.",
  "ctaButtonText": "QUERO GARANTIR MEU ACESSO AGORA",
  "ctaSubtext": "🔒 Pagamento 100% Seguro • Acesso Imediato",
  "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "productName": "Acesso Completo ao [Nome do Seu Produto]",
  "originalPrice": "R$ 297,00",
  "salePrice": "R$ 97,00",
  "installments": "12x de R$ 9,74",
  "checkoutUrl": "checkout.html",
  "benefits": [
    {
      "title": "Módulo 01: Fundamentos & Mentalidade",
      "desc": "A base sólida para começar da forma correta e sem perder tempo com erros comuns."
    },
    {
      "title": "Módulo 02: O Método na Prática",
      "desc": "Passo a passo detalhado, tela por tela, para você aplicar e ver os primeiros resultados."
    },
    {
      "title": "Módulo 03: Estratégias de Escala",
      "desc": "Como multiplicar seus ganhos e criar uma rotina previsível e altamente lucrativa."
    },
    {
      "title": "Módulo 04: Ferramentas & Modelos Prontos",
      "desc": "Templates, planilhas e roteiros prontos para você copiar, colar e executar hoje mesmo."
    }
  ],
  "bonuses": [
    {
      "title": "Bônus 01: Comunidade Exclusiva",
      "value": "R$ 197",
      "desc": "Networking com outros membros e suporte diário para tirar dúvidas."
    },
    {
      "title": "Bônus 02: Pack de Templates Prontos",
      "value": "R$ 147",
      "desc": "Arquivos 100% editáveis para acelerar sua implementação em 5x."
    },
    {
      "title": "Bônus 03: Aula Secreta de Tráfego",
      "value": "R$ 297",
      "desc": "Como atrair visitantes qualificados gastando pouco em anúncios."
    }
  ],
  "testimonials": [
    {
      "name": "Carlos Mendes",
      "role": "Aluno Verificado",
      "rating": 5,
      "text": "O conteúdo superou todas as minhas expectativas. Em menos de 2 semanas recuperei o valor investido 10 vezes!"
    },
    {
      "name": "Fernanda Lima",
      "role": "Aluna Verificada",
      "rating": 5,
      "text": "Didática impecável, direto ao ponto e sem enrolação. A melhor compra que fiz este ano."
    },
    {
      "name": "Rodrigo Alves",
      "role": "Aluno Verificado",
      "rating": 5,
      "text": "A estrutura do método me deu a clareza que eu procurava há meses na internet. Recomendo de olhos fechados!"
    }
  ],
  "guaranteeDays": "7",
  "guaranteeTitle": "Garantia Incondicional de 7 Dias",
  "guaranteeText": "Você tem 7 dias para testar tudo. Se por qualquer motivo achar que não valeu a pena, basta nos enviar um e-mail e devolvemos 100% do seu dinheiro, sem perguntas.",
  "faqs": [
    {
      "q": "Como recebo o meu acesso?",
      "a": "O envio é imediato após a confirmação do pagamento. Você receberá um e-mail com seus dados de login e senha para a plataforma."
    },
    {
      "q": "Por quanto tempo terei acesso ao conteúdo?",
      "a": "Você terá acesso completo por 1 ano inteiro, incluindo todas as futuras atualizações e melhorias."
    },
    {
      "q": "Funciona para quem está começando do zero?",
      "a": "Sim! O método foi estruturado desde o nível mais básico até as técnicas mais avançadas, com suporte a dúvidas."
    },
    {
      "q": "Quais são as formas de pagamento disponíveis?",
      "a": "Você pode pagar via Pix (com liberação na hora) ou Cartão de Crédito em até 12x."
    }
  ],
  "metaPixelId": "",
  "googleAdsId": ""
};

// Carrega alterações salvas no navegador (se houver), ou utiliza os padrões
window.PAGE_CONFIG = (function() {
  try {
    const saved = localStorage.getItem('pacote-01-vendas-diretas_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
})();
