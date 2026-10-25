const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { TARGET_DIR, unifiedConfig } = require('./build-standalone-package');
const RMTI_DIR = path.resolve(__dirname, '..');

console.log('Construindo aplicação completa do Pacote All-in-One em:', TARGET_DIR);

// =============================================================================
// 1. css/style.css
// =============================================================================
const styleCss = `/* ==========================================================================
   Estilos Globais • Pacote All-in-One de Landing Page
   ========================================================================== */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary-color: #10b981;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #080c14;
  color: #f8fafc;
  overflow-x: hidden;
}

.glass-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-card-hover:hover {
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateY(-4px);
  transition: all 0.3s ease;
}

.pulse-btn {
  animation: pulse-glow 2.5s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
  }
  50% {
    box-shadow: 0 0 0 16px rgba(16, 185, 129, 0);
  }
}

/* Oculta seções que não pertencem ao layout ativo */
body[data-active-layout="vendas-diretas"] [data-layout]:not([data-layout="vendas-diretas"]),
body[data-active-layout="leads-whatsapp"] [data-layout]:not([data-layout="leads-whatsapp"]),
body[data-active-layout="institucional"] [data-layout]:not([data-layout="institucional"]) {
  display: none !important;
}

/* Oculta modelos de checkout que não pertencem ao modelo ativo */
body[data-active-checkout="conversao-rapida"] [data-checkout-layout]:not([data-checkout-layout="conversao-rapida"]),
body[data-active-checkout="duas-colunas"] [data-checkout-layout]:not([data-checkout-layout="duas-colunas"]),
body[data-active-checkout="clean-minimalista"] [data-checkout-layout]:not([data-checkout-layout="clean-minimalista"]) {
  display: none !important;
}

/* Elementos de Demonstração RMTI (ocultos por padrão no pacote do cliente) */
.demo-only,
#demoTopBar,
.demo-bar,
#btnEditAdmin,
.demo-checkout-bar {
  display: none !important;
}

/* Visíveis APENAS quando a página estiver explicitamente em modo demonstração */
body.demo-mode .demo-only,
body.demo-mode #demoTopBar,
body.demo-mode .demo-bar,
body.demo-mode .demo-checkout-bar {
  display: block !important;
}

body.demo-mode header #btnEditAdmin {
  display: inline-flex !important;
}
`;
fs.writeFileSync(path.join(TARGET_DIR, 'css/style.css'), styleCss);

// =============================================================================
// 2. js/app.js (Gerenciador dos 3 Layouts e Dados)
// =============================================================================
const appJs = `/**
 * Controlador de Layouts e Dados Dinâmicos • Pacote All-in-One
 */
document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.PAGE_CONFIG || {};
  const activeLayout = cfg.activeLayout || 'vendas-diretas';

  // Modo de Demonstração: ativo apenas se configurado explicitamente, se estiver na rota /pacote da RMTI ou com ?demo=true
  const isDemoMode = Boolean(
    cfg.isDemo === true ||
    window.location.pathname.includes('/pacote') ||
    new URLSearchParams(window.location.search).get('demo') === 'true'
  );

  if (isDemoMode) {
    document.body.classList.add('demo-mode');
    const demoLayoutName = document.getElementById('demoLayoutName');
    if (demoLayoutName) {
      if (activeLayout === 'vendas-diretas') demoLayoutName.textContent = 'Modelo 01: Vendas Diretas & VSL';
      else if (activeLayout === 'leads-whatsapp') demoLayoutName.textContent = 'Modelo 02: Captura & WhatsApp VIP';
      else if (activeLayout === 'institucional') demoLayoutName.textContent = 'Modelo 03: Institucional & B2B';
    }
  } else {
    document.body.classList.remove('demo-mode');
    // Remove fisicamente os elementos de demonstração para não ocupar espaço no pacote do cliente
    document.querySelectorAll('.demo-only, #demoTopBar, .demo-bar, #btnEditAdmin, .demo-checkout-bar').forEach(el => el.remove());
  }

  // Aplicar layout ativo no body
  document.body.setAttribute('data-active-layout', activeLayout);

  // Preencher dados comuns
  if (cfg.businessName) {
    document.querySelectorAll('.val-businessName').forEach(el => el.textContent = cfg.businessName);
  }
  if (cfg.logoUrl) {
    document.querySelectorAll('.val-logoUrl').forEach(el => el.src = cfg.logoUrl);
  }
  if (cfg.bannerUrl) {
    document.querySelectorAll('.val-bannerUrl').forEach(el => el.src = cfg.bannerUrl);
  }
  if (cfg.photoUrl) {
    document.querySelectorAll('.val-photoUrl').forEach(el => el.src = cfg.photoUrl);
  }
  if (cfg.mockupUrl) {
    document.querySelectorAll('.val-mockupUrl').forEach(el => el.src = cfg.mockupUrl);
  }

  // Preencher campos de acordo com o layout ativo
  if (activeLayout === 'vendas-diretas' && cfg.vendas) {
    const v = cfg.vendas;
    if (v.topBar) document.querySelector('.vendas-topBar').textContent = v.topBar;
    if (v.headline) document.querySelector('.vendas-headline').textContent = v.headline;
    if (v.subheadline) document.querySelector('.vendas-subheadline').textContent = v.subheadline;
    if (v.ctaButton) document.querySelector('.vendas-ctaButton').textContent = v.ctaButton;
    if (v.ctaSubtext) document.querySelector('.vendas-ctaSubtext').textContent = v.ctaSubtext;
    if (v.productName) document.querySelector('.vendas-productName').textContent = v.productName;
    if (v.originalPrice) document.querySelector('.vendas-originalPrice').textContent = v.originalPrice;
    if (v.salePrice) document.querySelector('.vendas-salePrice').textContent = v.salePrice;
    if (v.installments) document.querySelector('.vendas-installments').textContent = v.installments;
  } else if (activeLayout === 'leads-whatsapp' && cfg.leads) {
    const l = cfg.leads;
    if (l.topBar) document.querySelector('.leads-topBar').textContent = l.topBar;
    if (l.headline) document.querySelector('.leads-headline').textContent = l.headline;
    if (l.subheadline) document.querySelector('.leads-subheadline').textContent = l.subheadline;
    if (l.professionalTitle) document.querySelector('.leads-professionalTitle').textContent = l.professionalTitle;
  } else if (activeLayout === 'institucional' && cfg.institucional) {
    const i = cfg.institucional;
    if (i.topBar) document.querySelector('.inst-topBar').textContent = i.topBar;
    if (i.headline) document.querySelector('.inst-headline').textContent = i.headline;
    if (i.subheadline) document.querySelector('.inst-subheadline').textContent = i.subheadline;
  }

  // Configurar links de WhatsApp
  if (cfg.whatsapp) {
    const cleanNum = cfg.whatsapp.replace(/\\D/g, '');
    const defaultMsg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site.');
    document.querySelectorAll('.whatsapp-btn').forEach(btn => {
      const specificMsg = btn.getAttribute('data-msg');
      const msg = specificMsg ? encodeURIComponent(specificMsg) : defaultMsg;
      btn.href = \`https://wa.me/\${cleanNum}?text=\${msg}\`;
    });
  }

  // Interatividade do FAQ (Acordeão)
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');
      const isOpen = !answer.classList.contains('hidden');

      document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

      if (!isOpen) {
        answer.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  // Injetar Meta Pixel se houver
  if (cfg.metaPixelId && cfg.metaPixelId.trim() !== '') {
    (function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', cfg.metaPixelId);
    fbq('track', 'PageView');
  }
});
`;
fs.writeFileSync(path.join(TARGET_DIR, 'js/app.js'), appJs);

// =============================================================================
// 3. index.html (Página All-in-One com 3 Layouts Alternáveis)
// =============================================================================
const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title class="val-businessName">Sua Landing Page • Alta Conversão</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
  <script src="js/app.js" defer></script>
</head>
<body class="bg-[#080c14] text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-slate-950">

  <!-- ========================================================================= -->
  <!-- BARRA DE DEMONSTRAÇÃO / CONTROLE DO PACOTE (EXIBIDA APENAS NA DEMO DA RMTI) -->
  <!-- ========================================================================= -->
  <div id="demoTopBar" class="demo-bar demo-only bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-emerald-500/30 py-2.5 px-4 sticky top-0 z-50 text-xs shadow-xl">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          PACOTE DE LANDING PAGE • RMTI
        </span>
        <span id="demoLayoutName" class="text-slate-300 font-semibold hidden sm:inline">Modelo Ativo: Carregando...</span>
      </div>
      <div class="flex items-center gap-2">
        <a href="admin/index.html" class="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-all shadow-md flex items-center gap-1.5">
          <span>⚙️ Abrir Painel Admin (Trocar Modelo)</span>
        </a>
        <a href="checkout.html" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 flex items-center gap-1">
          <span>💳 Ver Checkout</span>
        </a>
      </div>
    </div>
  </div>

  <!-- CABEÇALHO UNIFICADO -->
  <header class="py-6 px-4 sm:px-8 max-w-6xl mx-auto flex items-center justify-between">
    <div class="flex items-center gap-3">
      <img src="assets/imagens/logo-placeholder.png" alt="Sua Logo Aqui" class="h-10 sm:h-12 w-auto object-contain val-logoUrl">
    </div>
    <div class="flex items-center gap-3">
      <a href="admin/index.html" id="btnEditAdmin" class="demo-only hidden sm:inline-flex px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all border border-white/10">
        ⚙️ Editar no Admin
      </a>
      <a href="checkout.html" data-layout="vendas-diretas" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20">
        Inscrição Imediata
      </a>
      <a href="#" data-layout="leads-whatsapp" class="whatsapp-btn px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all">
        Falar no WhatsApp
      </a>
      <a href="#proposta" data-layout="institucional" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all">
        Solicitar Proposta
      </a>
    </div>
  </header>

  <!-- ========================================================================= -->
  <!-- LAYOUT 1: ESTRUTURA DE VENDAS DIRETAS & CHECKOUT (VSL / OFERTA) -->
  <!-- ========================================================================= -->
  <div data-layout="vendas-diretas">
    <!-- Top Bar URGÊNCIA -->
    <div class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 py-2 text-center text-slate-950 text-xs sm:text-sm font-black tracking-wider uppercase">
      <span class="vendas-topBar">⚡ OFERTA ESPECIAL COM DESCONTO EXCLUSIVO POR TEMPO LIMITADO</span>
    </div>

    <!-- Hero Vendas Diretas -->
    <section class="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-6">
        <span>🔥 MÉTODO 100% PRÁTICO &amp; VALIDADO</span>
      </div>

      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6 max-w-4xl vendas-headline">
        Descubra Como [Alcançar Grande Desejo] Sem [Principal Objeção ou Dor]
      </h1>

      <p class="text-slate-300 text-base sm:text-xl font-normal leading-relaxed max-w-3xl mb-10 vendas-subheadline">
        O passo a passo validado para dominar [sua habilidade] em tempo recorde, mesmo começando do absoluto zero.
      </p>

      <!-- Banner / VSL Mockup -->
      <div class="w-full max-w-3xl rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl mb-10 relative group bg-slate-900">
        <div class="aspect-video relative flex items-center justify-center">
          <img src="assets/imagens/banner-placeholder.jpg" alt="Seu Banner ou Vídeo" class="w-full h-full object-cover val-bannerUrl">
          <a href="#comprar" class="absolute w-20 h-20 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center text-3xl shadow-2xl group-hover:scale-110 transition-transform">
            ▶
          </a>
        </div>
      </div>

      <!-- CTA Principal -->
      <div class="flex flex-col items-center gap-3 w-full max-w-md">
        <a href="#comprar" class="pulse-btn w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider shadow-xl shadow-emerald-500/25">
          <span class="vendas-ctaButton">QUERO GARANTIR MEU ACESSO AGORA</span>
        </a>
        <span class="text-xs text-slate-400 vendas-ctaSubtext">🔒 Pagamento 100% Seguro • Acesso Imediato</span>
      </div>
    </section>

    <!-- Módulos do Método -->
    <section class="py-16 px-4 max-w-5xl mx-auto border-t border-slate-800">
      <div class="text-center mb-12">
        <span class="text-emerald-400 text-xs font-bold uppercase tracking-wider">CONTEÚDO COMPLETO</span>
        <h2 class="text-2xl sm:text-4xl font-black text-white mt-2">O Que Você Vai Aprender Passo a Passo</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-black mb-3">01</div>
          <h3 class="text-lg font-bold text-white mb-1">Módulo 01: Fundamentos &amp; Mentalidade</h3>
          <p class="text-slate-300 text-sm">A base sólida para começar da forma correta e sem perder tempo com erros comuns.</p>
        </div>
        <div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-black mb-3">02</div>
          <h3 class="text-lg font-bold text-white mb-1">Módulo 02: O Método na Prática</h3>
          <p class="text-slate-300 text-sm">Passo a passo detalhado, tela por tela, para você aplicar e ver os primeiros resultados.</p>
        </div>
        <div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-black mb-3">03</div>
          <h3 class="text-lg font-bold text-white mb-1">Módulo 03: Estratégias de Escala</h3>
          <p class="text-slate-300 text-sm">Como multiplicar seus ganhos e criar uma rotina previsível e altamente lucrativa.</p>
        </div>
        <div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-black mb-3">04</div>
          <h3 class="text-lg font-bold text-white mb-1">Módulo 04: Ferramentas &amp; Modelos Prontos</h3>
          <p class="text-slate-300 text-sm">Templates, planilhas e roteiros prontos para você copiar, colar e executar hoje mesmo.</p>
        </div>
      </div>
    </section>

    <!-- Oferta & Preço -->
    <section id="comprar" class="py-20 px-4 max-w-3xl mx-auto text-center border-t border-slate-800 scroll-mt-20">
      <div class="rounded-3xl p-8 sm:p-12 pt-10 sm:pt-14 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-2xl relative">
        <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase px-6 py-1.5 rounded-full tracking-wider shadow-xl whitespace-nowrap z-20">
          🔥 OFERTA POR TEMPO LIMITADO
        </div>
        <h2 class="text-2xl sm:text-4xl font-black text-white mt-2 vendas-productName">Acesso Completo ao [Nome do Seu Produto]</h2>
        <p class="text-sm text-slate-400 mt-2 mb-6">Receba acesso imediato com todas as aulas e bônus inclusos.</p>
        <div class="py-6 border-y border-slate-800 my-6 space-y-2">
          <div class="text-sm text-slate-400 line-through">De <span class="vendas-originalPrice">R$ 497,00</span> por apenas:</div>
          <div class="text-4xl sm:text-6xl font-black text-white tracking-tight vendas-installments">12x de R$ 19,78</div>
          <div class="text-xs text-emerald-400 font-semibold">ou <span class="vendas-salePrice">R$ 197,00</span> à vista com desconto</div>
        </div>
        <a href="checkout.html" class="pulse-btn w-full py-5 px-8 rounded-2xl text-base sm:text-lg font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center gap-2 shadow-2xl uppercase tracking-wider">
          <span>SIM! QUERO ME INSCREVER AGORA</span>
          <span>→</span>
        </a>
      </div>
    </section>
  </div>

  <!-- ========================================================================= -->
  <!-- LAYOUT 2: ESTRUTURA DE CAPTURA & WHATSAPP (ESPECIALISTA / SERVIÇOS) -->
  <!-- ========================================================================= -->
  <div data-layout="leads-whatsapp">
    <!-- Top Bar -->
    <div class="bg-gradient-to-r from-sky-600 to-blue-600 py-2 text-center text-white text-xs font-black tracking-wider uppercase">
      <span class="leads-topBar">AGENDA ABERTA PARA NOVOS PACIENTES / CLIENTES NESTE MÊS</span>
    </div>

    <!-- Hero Especialista -->
    <section class="py-12 sm:py-20 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <span>★ ATENDIMENTO PERSONALIZADO</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white leading-tight leads-headline">
          Transforme Sua [Área de Atuação] com um Acompanhamento 100% Individualizado
        </h1>
        <p class="text-slate-300 text-base sm:text-lg leading-relaxed leads-subheadline">
          Metodologia científica e personalizada para você atingir seus objetivos com segurança, sem fórmulas prontas ou promessas milagrosas.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
          <a href="#" class="whatsapp-btn py-4 px-8 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-sky-500/20 text-center flex items-center justify-center gap-2">
            <span>💬 FALAR COMIGO NO WHATSAPP</span>
          </a>
          <a href="#planos-servico" class="py-4 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 text-center">
            Ver Modalidades
          </a>
        </div>
      </div>

      <!-- Foto Especialista -->
      <div class="lg:col-span-5 flex justify-center">
        <div class="relative w-full max-w-sm rounded-3xl overflow-hidden border-2 border-sky-500/40 shadow-2xl bg-slate-900 group">
          <img src="assets/imagens/foto-placeholder.jpg" alt="Sua Foto" class="w-full h-auto object-cover val-photoUrl">
          <div class="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
            <h3 class="text-lg font-bold text-white val-businessName">Seu Nome Aqui</h3>
            <p class="text-xs text-sky-400 font-semibold leads-professionalTitle">Especialista • Registro Oficial</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Planos de Atendimento -->
    <section id="planos-servico" class="py-16 px-4 max-w-6xl mx-auto border-t border-slate-800">
      <div class="text-center mb-12">
        <span class="text-sky-400 text-xs font-bold uppercase tracking-wider">INVESTIMENTO &amp; FORMATOS</span>
        <h2 class="text-2xl sm:text-4xl font-black text-white mt-2">Escolha Seu Formato de Acompanhamento</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold text-white">Plano Mensal</h3>
            <div class="text-3xl font-black text-white mt-4">R$ 197<span class="text-xs text-slate-400">/mês</span></div>
            <ul class="space-y-2.5 text-xs text-slate-300 mt-6">
              <li>✓ Avaliação inicial completa</li>
              <li>✓ Plano personalizado de 30 dias</li>
              <li>✓ Suporte semanal via WhatsApp</li>
            </ul>
          </div>
          <a href="#" class="whatsapp-btn mt-8 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block border border-slate-700" data-msg="Olá! Gostaria de iniciar no Plano Mensal.">
            Escolher Plano Mensal
          </a>
        </div>

        <div class="glass-card p-6 sm:p-8 rounded-3xl border-2 border-sky-500 bg-sky-950/20 flex flex-col justify-between relative shadow-2xl scale-105">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 text-[10px] font-black uppercase px-4 py-1 rounded-full whitespace-nowrap">
            MAIS ESCOLHIDO • 40% OFF
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">Plano Trimestral VIP</h3>
            <div class="text-3xl font-black text-white mt-4">3x R$ 149<span class="text-xs text-slate-400"> ou R$ 397</span></div>
            <ul class="space-y-2.5 text-xs text-slate-200 mt-6">
              <li>✓ Tudo do Plano Mensal</li>
              <li>✓ Ajustes quinzenais de protocolo</li>
              <li>✓ Acompanhamento prioritário no WhatsApp</li>
              <li>✓ Guia complementar de hábitos saudáveis</li>
            </ul>
          </div>
          <a href="#" class="whatsapp-btn mt-8 py-4 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center block shadow-lg shadow-sky-500/25" data-msg="Olá! Gostaria de garantir minha vaga no Plano Trimestral VIP.">
            Quero o Trimestral VIP
          </a>
        </div>

        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold text-white">Plano Semestral</h3>
            <div class="text-3xl font-black text-white mt-4">6x R$ 119<span class="text-xs text-slate-400"> ou R$ 647</span></div>
            <ul class="space-y-2.5 text-xs text-slate-300 mt-6">
              <li>✓ Acompanhamento de 6 meses</li>
              <li>✓ Check-ins mensais em vídeo</li>
              <li>✓ Canal direto 24/7 no WhatsApp</li>
            </ul>
          </div>
          <a href="#" class="whatsapp-btn mt-8 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block border border-slate-700" data-msg="Olá! Gostaria de me inscrever no Plano Semestral.">
            Escolher Plano Semestral
          </a>
        </div>
      </div>
    </section>
  </div>

  <!-- ========================================================================= -->
  <!-- LAYOUT 3: ESTRUTURA INSTITUCIONAL & B2B (CORPORATIVO) -->
  <!-- ========================================================================= -->
  <div data-layout="institucional">
    <!-- Top Bar -->
    <div class="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 py-2 text-center text-white text-xs font-black tracking-wider uppercase">
      <span class="inst-topBar">LÍDERES EM INOVAÇÃO E TRANSFORMAÇÃO DIGITAL PARA MÉDIAS E GRANDES EMPRESAS</span>
    </div>

    <!-- Hero Corporativo -->
    <section class="py-16 sm:py-24 px-4 max-w-6xl mx-auto text-center flex flex-col items-center">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-6">
        <span>★ SOLUÇÕES CORPORATIVAS DE ALTA PERFORMANCE</span>
      </span>
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl mb-6 inst-headline">
        Aceleramos o Crescimento do Seu Negócio com Soluções de Alta Performance
      </h1>
      <p class="text-slate-300 text-base sm:text-xl max-w-3xl mb-10 leading-relaxed inst-subheadline">
        Desenvolvemos tecnologia sob medida, processos eficientes e estratégias focadas em maximizar a rentabilidade e a escala da sua operação.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 mb-12">
        <a href="#proposta" class="py-4 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/20">
          SOLICITAR PROPOSTA PERSONALIZADA
        </a>
      </div>

      <!-- Banner Corporativo -->
      <div class="w-full max-w-5xl rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <img src="assets/imagens/banner-placeholder.jpg" alt="Banner Institucional" class="w-full h-auto object-cover val-bannerUrl">
      </div>
    </section>

    <!-- Métricas de Impacto -->
    <section class="py-12 bg-slate-950/60 border-y border-slate-800">
      <div class="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div class="text-3xl sm:text-5xl font-black text-blue-400">+500</div>
          <div class="text-xs sm:text-sm text-slate-400 mt-1">Projetos Entregues</div>
        </div>
        <div>
          <div class="text-3xl sm:text-5xl font-black text-blue-400">99.4%</div>
          <div class="text-xs sm:text-sm text-slate-400 mt-1">Satisfação dos Clientes</div>
        </div>
        <div>
          <div class="text-3xl sm:text-5xl font-black text-blue-400">10+</div>
          <div class="text-xs sm:text-sm text-slate-400 mt-1">Anos de Mercado</div>
        </div>
        <div>
          <div class="text-3xl sm:text-5xl font-black text-blue-400">R$ 15M+</div>
          <div class="text-xs sm:text-sm text-slate-400 mt-1">Em Receita Gerada</div>
        </div>
      </div>
    </section>

    <!-- Formulário de Proposta B2B -->
    <section id="proposta" class="py-20 px-4 max-w-4xl mx-auto border-t border-slate-800">
      <div class="glass-card p-8 sm:p-12 rounded-3xl border border-blue-500/40 shadow-2xl">
        <div class="text-center mb-8">
          <h2 class="text-2xl sm:text-3xl font-black text-white">Solicite uma Proposta Comercial</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-2">Nossa equipe executiva entrará em contato em até 24 horas úteis.</p>
        </div>
        <form class="space-y-4" onsubmit="event.preventDefault(); window.location.href='obrigado.html';">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Seu Nome *</label>
              <input type="text" required placeholder="Ex: Roberto Silva" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Empresa *</label>
              <input type="text" required placeholder="Ex: Horizon Tech" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
          <button type="submit" class="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30">
            Enviar Solicitação de Proposta
          </button>
        </form>
      </div>
    </section>
  </div>

  <!-- ========================================================================= -->
  <!-- DÚVIDAS FREQUENTES (COMPARTILHADO EM TODOS OS MODELOS) -->
  <!-- ========================================================================= -->
  <section class="py-16 px-4 max-w-3xl mx-auto border-t border-slate-800">
    <div class="text-center mb-10">
      <h2 class="text-2xl sm:text-3xl font-black text-white">Dúvidas Frequentes</h2>
      <p class="text-slate-400 text-sm mt-1">Respostas para as perguntas mais comuns.</p>
    </div>

    <div class="space-y-3">
      <div class="faq-item glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <button class="faq-question w-full p-5 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-emerald-400 transition-colors">
          <span>Como recebo o acesso ou atendimento?</span>
          <span class="faq-icon text-slate-400 transition-transform">▼</span>
        </button>
        <div class="faq-answer hidden px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
          O contato e envio são imediatos após a confirmação. Nossa equipe entrará em contato ou você receberá os dados no seu e-mail cadastrado.
        </div>
      </div>

      <div class="faq-item glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <button class="faq-question w-full p-5 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-emerald-400 transition-colors">
          <span>Como realizo a alteração de textos e imagens?</span>
          <span class="faq-icon text-slate-400 transition-transform">▼</span>
        </button>
        <div class="faq-answer hidden px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
          Basta acessar a pasta /admin pelo navegador e alterar qualquer item com 1 clique, sem precisar mexer em códigos.
        </div>
      </div>
    </div>
  </section>

  <!-- RODAPÉ UNIFICADO COM ASSINATURA RMTI -->
  <footer class="py-12 px-4 border-t border-slate-800 text-xs text-slate-400 bg-[#060910]">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
      <div class="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
        <div>© 2026 <span class="val-businessName font-bold text-slate-200">Seu Negócio</span>. Todos os direitos reservados.</div>
        <span class="hidden sm:inline text-slate-700">•</span>
        <a href="#" class="whatsapp-btn hover:text-emerald-400 text-slate-400 transition-colors">Atendimento &amp; Suporte</a>
      </div>

      <!-- SELO DESENVOLVIDO POR RMTI -->
      <a href="https://rmti.com.br" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all hover:bg-slate-800/80 shadow-sm" title="Desenvolvido por RMTI • Soluções em Tecnologia">
        <span class="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors">Desenvolvido por</span>
        <div class="flex items-center gap-1.5">
          <img src="assets/imagens/rmti-logo.png" alt="RMTI" class="h-4 sm:h-5 w-auto object-contain transition-transform group-hover:scale-105" onerror="this.onerror=null; this.src='assets/imagens/logo-placeholder.png';">
          <span class="font-extrabold text-xs tracking-wider text-emerald-400 group-hover:text-emerald-300">RMTI</span>
        </div>
      </a>
    </div>
  </footer>

</body>
</html>
`;
fs.writeFileSync(path.join(TARGET_DIR, 'index.html'), indexHtml);

// =============================================================================
// 4. checkout.html & obrigado.html
// =============================================================================
const checkoutHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout Seguro • Finalizar Pedido</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
  <style>
    .order-bump-box {
      border: 2px dashed #10b981;
      background: rgba(16, 185, 129, 0.05);
      transition: all 0.2s ease;
    }
    .order-bump-box:hover {
      background: rgba(16, 185, 129, 0.1);
      border-color: #34d399;
    }
  </style>
</head>
<body class="bg-[#080c14] text-slate-100 min-h-screen py-4 px-3 sm:px-6" data-active-checkout="conversao-rapida">

  <!-- BARRA SUPERIOR DE PRÉ-VISUALIZAÇÃO / SELETOR RÁPIDO DE MODELO (EXIBIDA APENAS NA DEMO DA RMTI) -->
  <div id="checkoutDemoBar" class="demo-checkout-bar demo-only max-w-5xl mx-auto mb-6 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs shadow-lg">
    <div class="flex items-center gap-2 px-2">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-slate-400 font-bold hidden sm:inline">Modelo de Checkout:</span>
      <span id="currentCheckoutLabel" class="text-emerald-400 font-extrabold">1. Conversão Rápida</span>
    </div>
    <div class="flex flex-wrap items-center gap-1.5">
      <button type="button" onclick="switchCheckoutModel('conversao-rapida')" class="chk-switch-btn px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white font-semibold text-[11px] transition-all" data-m="conversao-rapida">
        ⚡ 1. Conversão Rápida
      </button>
      <button type="button" onclick="switchCheckoutModel('duas-colunas')" class="chk-switch-btn px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white font-semibold text-[11px] transition-all" data-m="duas-colunas">
        📊 2. Duas Colunas + Bump
      </button>
      <button type="button" onclick="switchCheckoutModel('clean-minimalista')" class="chk-switch-btn px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white font-semibold text-[11px] transition-all" data-m="clean-minimalista">
        🏢 3. Minimalista Clean
      </button>
      <a href="admin/index.html" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center gap-1 transition-all">
        <span>⚙️ Painel Admin</span>
      </a>
    </div>
  </div>

  <!-- TOAST DE CHAVE PIX COPIADA -->
  <div id="pixToast" class="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none">
    <span>✓ Chave Pix copiada com sucesso!</span>
  </div>

  <!-- ========================================================================= -->
  <!-- MODELO 1: CONVERSÃO RÁPIDA (1 COLUNA MOBILE-FIRST) -->
  <!-- ========================================================================= -->
  <div data-checkout-layout="conversao-rapida" class="max-w-xl mx-auto space-y-5">
    <!-- Barra de Urgência -->
    <div class="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/20 to-emerald-500/10 border border-emerald-500/30 text-center text-xs">
      <span class="text-emerald-400 font-extrabold">⚡ OFERTA RESERVADA:</span>
      <span class="text-slate-300"> Conclua seu pedido antes que o tempo expire em </span>
      <span class="chk-timer font-mono font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">14:59</span>
    </div>

    <!-- Header com Logo e Voltar -->
    <div class="flex items-center justify-between">
      <a href="index.html" class="text-xs text-slate-400 hover:text-white">← Voltar para a página</a>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-[11px] font-bold">
        🔒 SSL 256-bit Seguro
      </span>
    </div>

    <!-- Card Resumo do Produto -->
    <div class="glass-card p-5 rounded-3xl border border-slate-800 flex items-center gap-4">
      <img src="assets/imagens/mockup-placeholder.jpg" alt="Produto" class="w-16 h-16 rounded-2xl object-cover border border-slate-700 chk-val-productImage shrink-0">
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-bold text-white truncate chk-val-productName">Acesso Completo ao Produto</h3>
        <p class="text-xs text-slate-400 truncate chk-val-productDescription">Acesso imediato com suporte prioritário</p>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="text-xs text-slate-500 line-through chk-val-originalPrice">De R$ 497,00</span>
          <span class="text-lg font-black text-emerald-400 chk-val-salePrice">R$ 197,00</span>
          <span class="text-[11px] text-slate-400 chk-val-installments hidden sm:inline">(ou 12x de R$ 19,78)</span>
        </div>
      </div>
    </div>

    <!-- Formulário do Modelo 1 -->
    <div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
      <!-- Abas de Pagamento (Pix / Cartão) -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Forma de Pagamento</label>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" onclick="setPayMethod('m1', 'pix')" id="m1-btn-pix" class="py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
            <span>⚡ Pix (Imediato)</span>
          </button>
          <button type="button" onclick="setPayMethod('m1', 'card')" id="m1-btn-card" class="py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
            <span>💳 Cartão de Crédito</span>
          </button>
        </div>
      </div>

      <form class="space-y-4" onsubmit="event.preventDefault(); handleCheckoutSubmit('m1');">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Seu Nome Completo *</label>
          <input type="text" required placeholder="Digite seu nome completo" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">E-mail para Acesso *</label>
            <input type="email" required placeholder="seuemail@exemplo.com" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">WhatsApp *</label>
            <input type="tel" required placeholder="(11) 99999-9999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
          </div>
        </div>

        <!-- Seção Pix M1 -->
        <div id="m1-sec-pix" class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-white flex items-center gap-1.5">
              <span>⚡ Chave Pix para Transferência:</span>
            </span>
            <span class="text-emerald-400 font-extrabold chk-val-salePrice">R$ 197,00</span>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" readonly id="m1-pix-input" class="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-mono select-all">
            <button type="button" onclick="copyPixKey('m1-pix-input')" class="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shrink-0 transition-colors">
              Copiar
            </button>
          </div>
          <div class="text-[11px] text-slate-400 space-y-0.5">
            <p>Beneficiário: <strong class="text-white chk-val-pixReceiver">Seu Negócio</strong></p>
            <p>Instituição: <span class="text-slate-300 chk-val-pixBank">Banco Inter / Nubank</span></p>
          </div>
          <button type="button" onclick="handleWhatsAppProof('m1')" class="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all">
            <span>💬 Já fiz o Pix! Enviar Comprovante no WhatsApp →</span>
          </button>
        </div>

        <!-- Seção Cartão M1 -->
        <div id="m1-sec-card" class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hidden">
          <div class="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300 space-y-2">
            <div class="flex items-center justify-between font-bold text-sky-400">
              <span class="flex items-center gap-1.5">
                <span>🔒 Pagamento Seguro</span>
              </span>
              <span class="chk-val-salePrice text-white">R$ 197,00</span>
            </div>
            <p class="text-[11px] text-slate-400">Pague no cartão de crédito em até 12x com proteção bancária.</p>
            <button type="button" onclick="handleCheckoutSubmit('m1')" class="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md">
              <span class="chk-card-btn-text">Pagar com Mercado Pago (em até 12x) →</span>
            </button>
          </div>
        </div>

        <button type="submit" class="chk-main-btn pulse-btn w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20">
          Confirmar e Liberar Acesso Imediato →
        </button>
      </form>

      <!-- Garantia e Selos -->
      <div class="pt-4 border-t border-slate-800 text-center space-y-2">
        <p class="text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5">
          <span>🛡️</span>
          <span>Garantia Incondicional de 7 Dias</span>
        </p>
        <p class="text-[11px] text-slate-500 chk-val-guaranteeText">
          Se você não ficar 100% satisfeito com o material, devolvemos seu dinheiro integralmente.
        </p>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODELO 2: DUAS COLUNAS COM ORDER BUMP & PROVA SOCIAL (ALTA CONVERSÃO) -->
  <!-- ========================================================================= -->
  <div data-checkout-layout="duas-colunas" class="max-w-5xl mx-auto space-y-6">
    <header class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <img src="assets/imagens/logo-placeholder.png" alt="Logo" class="h-8 sm:h-10 w-auto object-contain val-logoUrl">
        <span class="text-xs text-slate-400 hidden sm:inline">Checkout Oficial Seguro</span>
      </div>
      <div class="flex items-center gap-3">
        <a href="index.html" class="text-xs text-slate-400 hover:text-white">← Voltar</a>
        <span class="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          🔒 Compra Segura
        </span>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Coluna da Esquerda (Formulário e Pagamento) -->
      <div class="lg:col-span-7 space-y-6">
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-800">
            <span class="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
            <h3 class="text-base font-bold text-white">Dados Pessoais</h3>
          </div>

          <form class="space-y-4" onsubmit="event.preventDefault(); handleCheckoutSubmit('m2');">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Nome Completo *</label>
              <input type="text" required placeholder="Ex: João da Silva" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">E-mail para Recebimento *</label>
              <input type="email" required placeholder="seuemail@exemplo.com" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">WhatsApp *</label>
                <input type="tel" required placeholder="(11) 99999-9999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">CPF (emissão de recibo) *</label>
                <input type="text" required placeholder="000.000.000-00" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
            </div>

            <!-- Etapa 2: Pagamento -->
            <div class="pt-4 border-t border-slate-800 space-y-4">
              <div class="flex items-center gap-2 pb-2">
                <span class="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                <h3 class="text-base font-bold text-white">Pagamento</h3>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button type="button" onclick="setPayMethod('m2', 'pix')" id="m2-btn-pix" class="py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                  <span>⚡ Pix Instantâneo</span>
                </button>
                <button type="button" onclick="setPayMethod('m2', 'card')" id="m2-btn-card" class="py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                  <span>💳 Cartão de Crédito</span>
                </button>
              </div>

              <!-- Pix M2 -->
              <div id="m2-sec-pix" class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white">Chave Pix Oficial:</span>
                  <span class="text-emerald-400 font-extrabold m2-final-total">R$ 197,00</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="text" readonly id="m2-pix-input" class="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-mono select-all">
                  <button type="button" onclick="copyPixKey('m2-pix-input')" class="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase shrink-0">
                    Copiar
                  </button>
                </div>
                <div class="text-[11px] text-slate-400 space-y-0.5">
                  <p>Beneficiário: <strong class="text-white chk-val-pixReceiver">Seu Negócio</strong></p>
                  <p>Instituição: <span class="text-slate-300 chk-val-pixBank">Banco Inter / Nubank</span></p>
                </div>
                <button type="button" onclick="handleWhatsAppProof('m2')" class="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all">
                  <span>💬 Já fiz o Pix! Enviar Comprovante no WhatsApp →</span>
                </button>
              </div>

              <!-- Cartão M2 -->
              <div id="m2-sec-card" class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hidden">
                <div class="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300 space-y-2">
                  <div class="flex items-center justify-between font-bold text-sky-400">
                    <span>🔒 Pagamento no Cartão</span>
                    <span class="m2-final-total text-white">R$ 197,00</span>
                  </div>
                  <p class="text-[11px] text-slate-400">Em até 12x no cartão com aprovação imediata.</p>
                  <button type="button" onclick="handleCheckoutSubmit('m2')" class="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md">
                    <span class="chk-card-btn-text">Pagar com Mercado Pago (em até 12x) →</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- ORDER BUMP INTERATIVO -->
            <div id="m2-order-bump" class="order-bump-box p-4 rounded-2xl space-y-2 mt-4 cursor-pointer" onclick="toggleOrderBump(event)">
              <div class="flex items-start gap-3">
                <input type="checkbox" id="m2BumpCheckbox" class="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400 mt-1 cursor-pointer">
                <div class="flex-1">
                  <span class="inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
                    ★ OFERTA COMPLEMENTAR EXCLUSIVA
                  </span>
                  <h4 class="text-xs font-bold text-white chk-val-orderBumpTitle">Adicionar Acompanhamento VIP Individual</h4>
                  <p class="text-[11px] text-slate-400 chk-val-orderBumpDesc leading-relaxed">
                    Tenha 1 hora de consultoria individual para acelerar seus resultados.
                  </p>
                  <div class="mt-1 text-xs text-emerald-400 font-extrabold">
                    Por apenas + <span class="chk-val-orderBumpPrice">R$ 47,00</span>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" class="chk-main-btn pulse-btn w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 mt-6">
              Finalizar Pedido Seguro →
            </button>
          </form>
        </div>
      </div>

      <!-- Coluna da Direita (Resumo, Depoimento e Garantia) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="glass-card p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
          <h3 class="text-base font-bold text-white border-b border-slate-800 pb-3">Resumo da Compra</h3>
          
          <div class="flex items-center gap-4">
            <img src="assets/imagens/mockup-placeholder.jpg" alt="Produto" class="w-16 h-16 rounded-2xl object-cover border border-slate-700 chk-val-productImage shrink-0">
            <div>
              <h4 class="text-sm font-bold text-white chk-val-productName">Acesso Completo ao Produto</h4>
              <p class="text-xs text-slate-400 chk-val-productDescription">Acesso vitalício + suporte</p>
            </div>
          </div>

          <!-- Bônus inclusos -->
          <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">🎁 Bônus Inclusos Gratuitamente:</span>
            <ul class="space-y-1 text-[11px]">
              <li class="flex items-center gap-2">✓ Comunidade Exclusiva de Membros</li>
              <li class="flex items-center gap-2">✓ Templates &amp; Roteiros Editáveis</li>
              <li class="flex items-center gap-2">✓ Aulas Secretas de Tráfego e Escala</li>
            </ul>
          </div>

          <!-- Totais -->
          <div class="py-3 border-y border-slate-800 space-y-2 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>Valor do Produto:</span>
              <span class="text-white font-bold chk-val-salePrice">R$ 197,00</span>
            </div>
            <div id="m2BumpRow" class="flex justify-between text-amber-400 hidden">
              <span>Oferta Complementar (Bump):</span>
              <span class="font-bold chk-val-orderBumpPrice">+ R$ 47,00</span>
            </div>
            <div class="flex justify-between items-baseline pt-2 border-t border-slate-800">
              <span class="text-sm font-bold text-white">Total a Pagar:</span>
              <span class="text-2xl font-black text-emerald-400 m2-final-total">R$ 197,00</span>
            </div>
          </div>

          <!-- Prova Social / Depoimento -->
          <div id="m2TestimonialBox" class="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
            <div class="flex items-center gap-3">
              <img src="assets/imagens/foto-placeholder.jpg" alt="Cliente" class="w-10 h-10 rounded-full object-cover border border-emerald-500/40">
              <div>
                <h5 class="text-xs font-bold text-white chk-val-testimonialName">Mariana Costa</h5>
                <p class="text-[10px] text-slate-400 chk-val-testimonialRole">Aluna Verificada</p>
              </div>
              <div class="ml-auto text-amber-400 text-xs tracking-widest">★★★★★</div>
            </div>
            <p class="text-xs text-slate-300 italic chk-val-testimonialText">
              "O material é super direto ao ponto. Consegui colocar tudo para rodar no mesmo dia!"
            </p>
          </div>

          <!-- Box de Garantia -->
          <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <span class="text-xl">🛡️</span>
            <div>
              <h5 class="text-xs font-bold text-emerald-400">Garantia Incondicional de 7 Dias</h5>
              <p class="text-[11px] text-slate-400 mt-0.5 chk-val-guaranteeText">
                Satisfação garantida ou seu dinheiro 100% de volta, sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- MODELO 3: MINIMALISTA PREMIUM (CLEAN B2B CORPORATIVO) -->
  <!-- ========================================================================= -->
  <div data-checkout-layout="clean-minimalista" class="max-w-2xl mx-auto space-y-6">
    <header class="text-center space-y-2 pb-6 border-b border-slate-800">
      <a href="index.html" class="text-xs text-slate-500 hover:text-slate-300">← Voltar à Apresentação Institucional</a>
      <h2 class="text-2xl font-black text-white">Pedido &amp; Faturamento Comercial</h2>
      <p class="text-xs text-slate-400">Emissão de nota fiscal, faturamento direto e liberação em alta prioridade.</p>
    </header>

    <div class="glass-card p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
      <!-- Seletor PF / PJ -->
      <div>
        <label class="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Tipo de Contratante</label>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" onclick="setCompanyType('pf')" id="m3-btn-pf" class="py-2.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold text-xs">
            Pessoa Física (CPF)
          </button>
          <button type="button" onclick="setCompanyType('pj')" id="m3-btn-pj" class="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold text-xs">
            Pessoa Jurídica (CNPJ / Empresa)
          </button>
        </div>
      </div>

      <form class="space-y-4" onsubmit="event.preventDefault(); handleCheckoutSubmit('m3');">
        <div id="m3-pf-fields" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Nome do Titular *</label>
            <input type="text" placeholder="Nome completo" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">CPF *</label>
              <input type="text" placeholder="000.000.000-00" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Telefone / WhatsApp *</label>
              <input type="tel" placeholder="(11) 99999-9999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
        </div>

        <div id="m3-pj-fields" class="space-y-4 hidden">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Razão Social / Nome da Empresa *</label>
            <input type="text" placeholder="Empresa S/A ou LTDA" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">CNPJ *</label>
              <input type="text" placeholder="00.000.000/0001-00" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Responsável Comercial *</label>
              <input type="text" placeholder="Nome do responsável" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">E-mail Corporativo para Envio de NF e Acesso *</label>
          <input type="email" placeholder="financeiro@empresa.com.br" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
        </div>

        <!-- Discriminação de Valores -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Discriminação da Fatura</h4>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-slate-300">
              <span class="chk-val-productName">Acesso Completo ao Pacote</span>
              <span class="chk-val-originalPrice line-through text-slate-500">R$ 497,00</span>
            </div>
            <div class="flex justify-between text-emerald-400 font-semibold">
              <span>Desconto de Lançamento Aplicado:</span>
              <span>- R$ 300,00</span>
            </div>
            <div class="flex justify-between items-baseline pt-3 border-t border-slate-800">
              <span class="text-sm font-bold text-white">Valor Líquido Faturado:</span>
              <span class="text-2xl font-black text-emerald-400 chk-val-salePrice">R$ 197,00</span>
            </div>
          </div>
        </div>

        <!-- Pix Corporativo M3 -->
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="text-white font-bold">Chave Pix Direta:</span>
            <span class="text-emerald-400 font-mono chk-val-salePrice">R$ 197,00</span>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" readonly id="m3-pix-input" class="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-mono select-all">
            <button type="button" onclick="copyPixKey('m3-pix-input')" class="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase">
              Copiar
            </button>
          </div>
          <div class="text-[11px] text-slate-400 space-y-0.5">
            <p>Beneficiário: <strong class="text-white chk-val-pixReceiver">Seu Negócio</strong></p>
            <p>Instituição: <span class="text-slate-300 chk-val-pixBank">Banco Inter / Nubank</span></p>
          </div>
          <button type="button" onclick="handleWhatsAppProof('m3')" class="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all">
            <span>💬 Confirmar Pagamento no WhatsApp →</span>
          </button>
        </div>

        <button type="submit" class="chk-main-btn w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all">
          Confirmar Faturamento &amp; Liberar Acesso →
        </button>
      </form>
    </div>
  </div>

  <!-- RODAPÉ DE CHECKOUT COM ASSINATURA RMTI -->
  <footer class="mt-16 py-8 border-t border-slate-800 text-center text-xs text-slate-500">
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
      <p>© 2026 <span class="val-businessName">Seu Negócio</span>. Pagamentos processados com segurança SSL de 256 bits.</p>
      <a href="https://rmti.com.br" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all hover:bg-slate-800 text-slate-400 hover:text-slate-200" title="Desenvolvido por RMTI • Soluções em Tecnologia">
        <span class="text-[11px]">Desenvolvido por</span>
        <div class="flex items-center gap-1.5">
          <img src="assets/imagens/rmti-logo.png" alt="RMTI" class="h-4 w-auto object-contain" onerror="this.onerror=null; this.src='assets/imagens/logo-placeholder.png';">
          <span class="font-extrabold text-xs text-emerald-400">RMTI</span>
        </div>
      </a>
    </div>
  </footer>

  <!-- SCRIPT DE SINCRONIZAÇÃO E CONTROLE DOS 3 CHECKOUTS -->
  <script>
    let activeCheckoutModel = 'conversao-rapida';
    let basePriceNum = 197;
    let bumpPriceNum = 47;
    let isBumpChecked = false;

    document.addEventListener('DOMContentLoaded', () => {
      const cfg = window.PAGE_CONFIG || {};
      const chk = cfg.checkout || {};

      // Controle de visibilidade de Demonstração
      const isDemo = Boolean(
        cfg.isDemo === true ||
        window.location.pathname.includes('/pacote') ||
        new URLSearchParams(window.location.search).get('demo') === 'true'
      );
      if (isDemo) {
        document.body.classList.add('demo-mode');
      } else {
        document.body.classList.remove('demo-mode');
        document.querySelectorAll('.demo-only, #checkoutDemoBar, .demo-checkout-bar').forEach(el => el.remove());
      }

      // 1. Determina o modelo ativo (parâmetro da URL tem prioridade para testes rápidos)
      const urlParams = new URLSearchParams(window.location.search);
      const urlModel = urlParams.get('modelo');
      activeCheckoutModel = urlModel || chk.activeModel || 'conversao-rapida';

      applyCheckoutModel(activeCheckoutModel);

      // 2. Popula campos dinâmicos
      const prodName = chk.productName || (cfg.vendas && cfg.vendas.productName) || 'Acesso Completo ao Produto';
      const prodDesc = chk.productDescription || 'Acesso imediato com atualizações e suporte';
      const origPrice = chk.originalPrice || (cfg.vendas && cfg.vendas.originalPrice) || 'R$ 497,00';
      const salePrice = chk.salePrice || (cfg.vendas && cfg.vendas.salePrice) || 'R$ 197,00';
      const installments = chk.installments || (cfg.vendas && cfg.vendas.installments) || '12x de R$ 19,78';
      const pixKey = chk.pixKey || 'sua-chave-pix-aqui@empresa.com';
      const guarText = chk.guaranteeText || 'Você tem 7 dias de garantia incondicional com reembolso 100% imediato.';

      // Extrai número do preço
      const numMatch = salePrice.match(/[0-9]+/);
      if (numMatch) basePriceNum = parseInt(numMatch[0], 10);

      document.querySelectorAll('.chk-val-productName').forEach(el => el.textContent = prodName);
      document.querySelectorAll('.chk-val-productDescription').forEach(el => el.textContent = prodDesc);
      document.querySelectorAll('.chk-val-originalPrice').forEach(el => el.textContent = origPrice);
      document.querySelectorAll('.chk-val-salePrice').forEach(el => el.textContent = salePrice);
      document.querySelectorAll('.chk-val-installments').forEach(el => el.textContent = installments);
      document.querySelectorAll('.chk-val-guaranteeText').forEach(el => el.textContent = guarText);

      // Pix inputs
      const pPix = chk.pix || {};
      const activePixKey = pPix.key || pixKey;
      ['m1-pix-input', 'm2-pix-input', 'm3-pix-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = activePixKey;
      });

      const pixReceiver = pPix.receiverName || cfg.businessName || 'Seu Negócio';
      const pixBank = pPix.bankName || 'Banco Inter / Nubank';
      document.querySelectorAll('.chk-val-pixReceiver').forEach(el => el.textContent = pixReceiver);
      document.querySelectorAll('.chk-val-pixBank').forEach(el => el.textContent = pixBank);

      // Ajuste dinâmico de botões conforme Gateway
      const payMethod = chk.paymentMethod || 'mercadopago';
      const extObj = chk.externalCheckout || {};
      const extPlatform = extObj.platformName || 'Plataforma';
      document.querySelectorAll('.chk-val-extPlatform').forEach(el => el.textContent = extPlatform);

      if (payMethod === 'mercadopago') {
        const mpLink = (chk.mercadoPago && chk.mercadoPago.paymentLink) || '';
        if (mpLink) {
          document.querySelectorAll('.chk-card-btn-text').forEach(el => el.textContent = 'Pagar com Mercado Pago (em até 12x) →');
          document.querySelectorAll('.chk-main-btn').forEach(el => el.textContent = 'Pagar no Mercado Pago (em até 12x) →');
        }
      } else if (payMethod === 'link_externo') {
        document.querySelectorAll('.chk-main-btn').forEach(el => el.textContent = 'Ir para Pagamento Seguro (' + extPlatform + ') →');
      } else if (payMethod === 'whatsapp') {
        document.querySelectorAll('.chk-main-btn').forEach(el => el.textContent = 'Finalizar Pedido pelo WhatsApp →');
      }

      // Order Bump
      const bump = chk.orderBump || {};
      if (bump.title) document.querySelectorAll('.chk-val-orderBumpTitle').forEach(el => el.textContent = bump.title);
      if (bump.description) document.querySelectorAll('.chk-val-orderBumpDesc').forEach(el => el.textContent = bump.description);
      if (bump.price) {
        document.querySelectorAll('.chk-val-orderBumpPrice').forEach(el => el.textContent = bump.price);
        const bMatch = bump.price.match(/[0-9]+/);
        if (bMatch) bumpPriceNum = parseInt(bMatch[0], 10);
      }
      if (bump.active === false) {
        const bEl = document.getElementById('m2-order-bump');
        if (bEl) bEl.style.display = 'none';
      }

      // Prova Social / Depoimento
      const testm = chk.testimonial || {};
      if (testm.name) document.querySelectorAll('.chk-val-testimonialName').forEach(el => el.textContent = testm.name);
      if (testm.role) document.querySelectorAll('.chk-val-testimonialRole').forEach(el => el.textContent = testm.role);
      if (testm.text) document.querySelectorAll('.chk-val-testimonialText').forEach(el => el.textContent = '"' + testm.text + '"');
      if (testm.active === false) {
        const tBox = document.getElementById('m2TestimonialBox');
        if (tBox) tBox.style.display = 'none';
      }

      // Inicia cronômetro
      startCountdown(15 * 60);
    });

    function applyCheckoutModel(model) {
      document.body.setAttribute('data-active-checkout', model);

      const labels = {
        'conversao-rapida': '1. Conversão Rápida (1 Coluna)',
        'duas-colunas': '2. Duas Colunas + Order Bump',
        'clean-minimalista': '3. Minimalista Clean B2B'
      };
      const lbl = document.getElementById('currentCheckoutLabel');
      if (lbl) lbl.textContent = labels[model] || model;

      document.querySelectorAll('.chk-switch-btn').forEach(btn => {
        if (btn.getAttribute('data-m') === model) {
          btn.classList.add('border-emerald-500', 'bg-emerald-500/20', 'text-emerald-400');
          btn.classList.remove('border-slate-700', 'bg-slate-800', 'text-slate-200');
        } else {
          btn.classList.remove('border-emerald-500', 'bg-emerald-500/20', 'text-emerald-400');
          btn.classList.add('border-slate-700', 'bg-slate-800', 'text-slate-200');
        }
      });
    }

    function switchCheckoutModel(model) {
      applyCheckoutModel(model);
      const url = new URL(window.location);
      url.searchParams.set('modelo', model);
      window.history.replaceState({}, '', url);
    }

    function setPayMethod(prefix, method) {
      const btnPix = document.getElementById(prefix + '-btn-pix');
      const btnCard = document.getElementById(prefix + '-btn-card');
      const secPix = document.getElementById(prefix + '-sec-pix');
      const secCard = document.getElementById(prefix + '-sec-card');

      if (method === 'pix') {
        btnPix.className = 'py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2';
        btnCard.className = 'py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold text-xs flex items-center justify-center gap-2';
        secPix.classList.remove('hidden');
        secCard.classList.add('hidden');
      } else {
        btnCard.className = 'py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2';
        btnPix.className = 'py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold text-xs flex items-center justify-center gap-2';
        secCard.classList.remove('hidden');
        secPix.classList.add('hidden');
      }
    }

    function toggleOrderBump(e) {
      const chkBox = document.getElementById('m2BumpCheckbox');
      if (e.target !== chkBox) {
        chkBox.checked = !chkBox.checked;
      }
      isBumpChecked = chkBox.checked;

      const bumpRow = document.getElementById('m2BumpRow');
      if (bumpRow) {
        if (isBumpChecked) bumpRow.classList.remove('hidden');
        else bumpRow.classList.add('hidden');
      }

      const finalNum = isBumpChecked ? (basePriceNum + bumpPriceNum) : basePriceNum;
      const formatted = 'R$ ' + finalNum + ',00';
      document.querySelectorAll('.m2-final-total').forEach(el => el.textContent = formatted);
    }

    function setCompanyType(type) {
      const btnPf = document.getElementById('m3-btn-pf');
      const btnPj = document.getElementById('m3-btn-pj');
      const secPf = document.getElementById('m3-pf-fields');
      const secPj = document.getElementById('m3-pj-fields');

      if (type === 'pf') {
        btnPf.className = 'py-2.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold text-xs';
        btnPj.className = 'py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold text-xs';
        secPf.classList.remove('hidden');
        secPj.classList.add('hidden');
      } else {
        btnPj.className = 'py-2.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold text-xs';
        btnPf.className = 'py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 font-bold text-xs';
        secPj.classList.remove('hidden');
        secPf.classList.add('hidden');
      }
    }

    function copyPixKey(inputId) {
      const input = document.getElementById(inputId);
      if (input) {
        navigator.clipboard.writeText(input.value).then(() => {
          const toast = document.getElementById('pixToast');
          toast.classList.remove('translate-y-24', 'opacity-0');
          setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 2500);
        });
      }
    }

    function startCountdown(duration) {
      let timer = duration;
      setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        const formatted = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        document.querySelectorAll('.chk-timer').forEach(el => el.textContent = formatted);
        if (--timer < 0) timer = duration;
      }, 1000);
    }
    function handleCheckoutSubmit(modelPrefix) {
      const cfg = window.PAGE_CONFIG || {};
      const chk = cfg.checkout || {};
      const payMethod = chk.paymentMethod || 'mercadopago';

      const layoutScope = document.querySelector('[data-checkout-layout="' + activeCheckoutModel + '"]');
      const nameInput = layoutScope ? layoutScope.querySelector('input[type="text"][required], input[placeholder*="nome" i], input[placeholder*="Nome" i]') : null;
      const emailInput = layoutScope ? layoutScope.querySelector('input[type="email"]') : null;
      const phoneInput = layoutScope ? layoutScope.querySelector('input[type="tel"]') : null;

      const buyerName = nameInput ? nameInput.value.trim() : '';
      const buyerEmail = emailInput ? emailInput.value.trim() : '';
      const buyerPhone = phoneInput ? phoneInput.value.trim() : '';

      if (!buyerName || !buyerPhone) {
        alert('Por favor, preencha os dados de contato (Nome e WhatsApp) para prosseguir.');
        return;
      }

      const prodName = chk.productName || 'Acesso ao Produto';
      const finalPrice = isBumpChecked ? ('R$ ' + (basePriceNum + bumpPriceNum) + ',00') : (chk.salePrice || 'R$ ' + basePriceNum + ',00');

      // 1. MERCADO PAGO
      if (payMethod === 'mercadopago') {
        const mpLink = (chk.mercadoPago && chk.mercadoPago.paymentLink) ? chk.mercadoPago.paymentLink.trim() : '';
        if (mpLink) {
          window.location.href = mpLink;
          return;
        }
        const pixKey = (chk.pix && chk.pix.key) || chk.pixKey;
        if (pixKey) {
          copyPixKey(modelPrefix + '-pix-input');
        }
        window.location.href = 'obrigado.html';
        return;
      }

      // 2. PIX DIRETO (COM ENVIO DE COMPROVANTE VIA WHATSAPP)
      if (payMethod === 'pix_direto') {
        copyPixKey(modelPrefix + '-pix-input');
        const waNumber = (chk.whatsappSales && chk.whatsappSales.phone) || cfg.whatsapp || '5511999999999';
        const cleanPhone = waNumber.replace(/\\D/g, '');
        const receiver = (chk.pix && chk.pix.receiverName) || cfg.businessName || 'Equipe';
        const msg = encodeURIComponent('Olá ' + receiver + '! Realizei o pagamento via Pix de ' + finalPrice + ' referente ao pedido de "' + prodName + '".\\n\\n• Meu Nome: ' + buyerName + '\\n• E-mail: ' + buyerEmail + '\\n• Telefone: ' + buyerPhone + '\\n\\nSegue o comprovante em anexo!');
        setTimeout(() => {
          window.open('https://wa.me/' + cleanPhone + '?text=' + msg, '_blank');
          window.location.href = 'obrigado.html';
        }, 1200);
        return;
      }

      // 3. LINK DE OUTRO GATEWAY (KIWIFY, HOTMART, EDUZZ, ETC)
      if (payMethod === 'link_externo') {
        const extUrl = (chk.externalCheckout && chk.externalCheckout.checkoutUrl) ? chk.externalCheckout.checkoutUrl.trim() : '';
        if (extUrl) {
          window.location.href = extUrl;
          return;
        }
        window.location.href = 'obrigado.html';
        return;
      }

      // 4. VENDA NO WHATSAPP
      if (payMethod === 'whatsapp') {
        const waNumber = (chk.whatsappSales && chk.whatsappSales.phone) || cfg.whatsapp || '5511999999999';
        const cleanPhone = waNumber.replace(/\\D/g, '');
        const msg = encodeURIComponent('Olá! Gostaria de concluir o pedido de "' + prodName + '" no valor de ' + finalPrice + '.\\n\\n• Nome: ' + buyerName + '\\n• E-mail: ' + buyerEmail + '\\n• Telefone: ' + buyerPhone);
        window.open('https://wa.me/' + cleanPhone + '?text=' + msg, '_blank');
        window.location.href = 'obrigado.html';
        return;
      }

      window.location.href = 'obrigado.html';
    }

    function handleWhatsAppProof(modelPrefix) {
      const cfg = window.PAGE_CONFIG || {};
      const chk = cfg.checkout || {};
      copyPixKey(modelPrefix + '-pix-input');
      const waNumber = (chk.whatsappSales && chk.whatsappSales.phone) || cfg.whatsapp || '5511999999999';
      const cleanPhone = waNumber.replace(/\\D/g, '');
      const prodName = chk.productName || 'Acesso ao Produto';
      const finalPrice = isBumpChecked ? ('R$ ' + (basePriceNum + bumpPriceNum) + ',00') : (chk.salePrice || 'R$ ' + basePriceNum + ',00');
      const msg = encodeURIComponent('Olá! Realizei o Pix de ' + finalPrice + ' referente ao pedido de "' + prodName + '". Segue o comprovante.');
      window.open('https://wa.me/' + cleanPhone + '?text=' + msg, '_blank');
    }
  </script>
</body>
</html>
`;
fs.writeFileSync(path.join(TARGET_DIR, 'checkout.html'), checkoutHtml);

const obrigadoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Parabéns! • Solicitação Confirmada</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
</head>
<body class="bg-[#080c14] text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full glass-card p-8 rounded-3xl border border-emerald-500/40 text-center shadow-2xl">
    <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto mb-4">✓</div>
    <h1 class="text-2xl font-black text-white mb-2">Pedido Confirmado!</h1>
    <p class="text-sm text-slate-300 mb-6">Recebemos seus dados com sucesso. Verifique seu e-mail e seu WhatsApp para os próximos passos.</p>
    <a href="index.html" class="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs inline-block transition-colors">Voltar à Página Inicial</a>

    <div class="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
      <span>Desenvolvido por</span>
      <a href="https://rmti.com.br" target="_blank" rel="noopener noreferrer" class="font-extrabold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 transition-colors">
        <img src="assets/imagens/rmti-logo.png" alt="RMTI" class="h-4 w-auto object-contain" onerror="this.onerror=null; this.src='assets/imagens/logo-placeholder.png';">
        <span>RMTI</span>
      </a>
    </div>
  </div>
</body>
</html>
`;
fs.writeFileSync(path.join(TARGET_DIR, 'obrigado.html'), obrigadoHtml);

// =============================================================================
// 5. PAINEL ADMIN COM SELETOR DE LAYOUT & EDIÇÃO TOTAL (admin/index.html & admin.js)
// =============================================================================
const adminHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel de Controle • Pacote de Landing Page All-in-One</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="../js/config.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #080c14; color: #f8fafc; }
    .glass-box { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .tab-btn.active { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.4); font-weight: 800; }
    .layout-card.selected { border-color: #10b981; background: rgba(16, 185, 129, 0.12); box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
    .checkout-model-card.selected { border-color: #10b981; background: rgba(16, 185, 129, 0.12); box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
    .payment-method-card.selected { border-color: #10b981; background: rgba(16, 185, 129, 0.12); box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
    .payment-method-card[data-payment-val="mercadopago"].selected { border-color: #0ea5e9; background: rgba(14, 165, 233, 0.12); box-shadow: 0 0 20px rgba(14, 165, 233, 0.2); }
    .payment-method-card[data-payment-val="link_externo"].selected { border-color: #a855f7; background: rgba(168, 85, 247, 0.12); box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
  </style>
</head>
<body class="min-h-screen pb-20">

  <!-- MODAL DE TROCA DE SENHA NO 1º ACESSO -->
  <div id="modalFirstAccess" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 hidden">
    <div class="max-w-md w-full glass-box p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/50 shadow-2xl text-center">
      <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center mx-auto mb-4">🔐</div>
      <h2 class="text-xl font-black text-white mb-2">Primeiro Acesso ao Painel</h2>
      <p class="text-xs text-slate-300 mb-6 leading-relaxed">
        Por segurança, altere a senha padrão de fábrica (<strong class="text-emerald-400">123456</strong>) para uma senha pessoal.
      </p>
      <form id="formChangePass" class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Senha Atual (123456)</label>
          <input type="password" id="curPass" required placeholder="Digite 123456" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Nova Senha Pessoal</label>
          <input type="password" id="newPass" required placeholder="Crie sua nova senha" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Confirmar Nova Senha</label>
          <input type="password" id="confirmPass" required placeholder="Repita a nova senha" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider mt-4">
          Salvar Nova Senha &amp; Entrar
        </button>
      </form>
    </div>
  </div>

  <!-- TELA DE LOGIN -->
  <div id="loginScreen" class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full glass-box p-8 rounded-3xl border border-slate-800 shadow-2xl text-center">
      <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto mb-4">⚙️</div>
      <h1 class="text-2xl font-black text-white mb-1">Painel Administrativo</h1>
      <p class="text-xs text-slate-400 mb-6">Pacote All-in-One de Landing Page</p>
      <form id="loginForm" class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Senha de Acesso</label>
          <input type="password" id="loginPassword" required placeholder="Digite sua senha (padrão: 123456)" class="w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
          <p class="text-[11px] text-slate-500 mt-1">Senha inicial: <strong class="text-slate-400">123456</strong></p>
        </div>
        <button type="submit" class="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider">
          Entrar no Painel de Controle
        </button>
      </form>
      <div class="mt-6 pt-4 border-t border-slate-800">
        <a href="../index.html" class="text-xs text-slate-400 hover:text-white">← Ver Página Pública</a>
      </div>
    </div>
  </div>

  <!-- PAINEL PRINCIPAL -->
  <div id="adminPanel" class="hidden">
    <header class="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-8 py-3.5 backdrop-blur-md">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base">⚙️</div>
          <div>
            <h1 class="text-sm sm:text-base font-bold text-white">Gestão da Landing Page</h1>
            <p class="text-[11px] text-emerald-400 font-semibold">1 Pacote • 3 Modelos de Layout Alternáveis</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a href="../index.html" target="_blank" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5">
            <span>👁 Ver Página</span>
          </a>
          <button id="btnDownloadConfig" type="button" class="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5">
            <span>💾 Baixar config.js</span>
          </button>
          <button id="btnSaveConfig" type="button" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20">
            Salvar Alterações
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
      <!-- TOAST DE SUCESSO -->
      <div id="saveToast" class="fixed bottom-6 right-6 bg-emerald-500 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-2 z-50 transform translate-y-24 opacity-0 transition-all duration-300">
        <span>✓ Alterações salvas com sucesso no navegador!</span>
      </div>

      <!-- ========================================================================= -->
      <!-- SELETOR DE LAYOUT VISUAL (O GRANDE DESTAQUE) -->
      <!-- ========================================================================= -->
      <div class="mb-10 glass-box p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">CONFIGURAÇÃO DE MODELO</span>
            <h2 class="text-xl font-black text-white">Escolha o Modelo de Layout da Sua Página</h2>
          </div>
          <span class="text-xs text-slate-400 hidden sm:inline">Altere com 1 clique</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Card Modelo 1 -->
          <div class="layout-card p-5 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-slate-600" data-layout-val="vendas-diretas">
            <div class="flex items-center justify-between mb-2">
              <span class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">01</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">VSL &amp; Checkout</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1">Vendas Diretas &amp; VSL</h3>
            <p class="text-xs text-slate-400 leading-relaxed">Ideal para infoprodutos, cursos, e-books e produtos com botão de compra imediato e checkout.</p>
          </div>

          <!-- Card Modelo 2 -->
          <div class="layout-card p-5 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-slate-600" data-layout-val="leads-whatsapp">
            <div class="flex items-center justify-between mb-2">
              <span class="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm">02</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 uppercase">WhatsApp VIP</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1">Captura &amp; WhatsApp VIP</h3>
            <p class="text-xs text-slate-400 leading-relaxed">Ideal para especialistas, consultorias, clínicas e profissionais que vendem serviços pelo WhatsApp.</p>
          </div>

          <!-- Card Modelo 3 -->
          <div class="layout-card p-5 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-slate-600" data-layout-val="institucional">
            <div class="flex items-center justify-between mb-2">
              <span class="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm">03</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 uppercase">Corporativo B2B</span>
            </div>
            <h3 class="text-base font-bold text-white mb-1">Institucional &amp; Comercial</h3>
            <p class="text-xs text-slate-400 leading-relaxed">Ideal para empresas, agências, indústrias e negócios que precisam de apresentação institucional e propostas.</p>
          </div>
        </div>
      </div>

      <!-- NAVEGAÇÃO DE ABAS DE EDIÇÃO -->
      <div class="flex flex-wrap gap-2 pb-6 border-b border-slate-800 mb-8">
        <button class="tab-btn active px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300" data-tab="tab-identidade">
          Identidade &amp; Banners
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300" data-tab="tab-textos">
          Textos do Modelo Ativo
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300" data-tab="tab-contatos">
          WhatsApp &amp; Contatos
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300" data-tab="tab-pixels">
          Pixels &amp; Anúncios
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 flex items-center gap-1.5" data-tab="tab-checkout">
          <span>💳 Modelos &amp; Checkout</span>
          <span class="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">3 Modelos</span>
        </button>
      </div>

      <!-- CONTEÚDO DAS ABAS -->
      <div class="glass-box p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
        <!-- ABA 1: IDENTIDADE -->
        <div id="tab-identidade" class="tab-content space-y-6">
          <h3 class="text-base font-bold text-white border-b border-slate-800 pb-3">Identidade da Marca &amp; Imagens</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Nome do Seu Negócio / Especialista</label>
              <input type="text" id="cfg_businessName" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Slogan / Tagline Geral</label>
              <input type="text" id="cfg_tagline" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Caminho da Logo ("SUA LOGO AQUI")</label>
              <input type="text" id="cfg_logoUrl" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              <p class="text-[11px] text-slate-500 mt-1">Ex: assets/imagens/logo-placeholder.png</p>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Caminho do Banner ("SEU BANNER AQUI")</label>
              <input type="text" id="cfg_bannerUrl" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              <p class="text-[11px] text-slate-500 mt-1">Recomendado 1200x630px</p>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Caminho da Foto ("SUA FOTO AQUI")</label>
              <input type="text" id="cfg_photoUrl" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              <p class="text-[11px] text-slate-500 mt-1">Para Modelo 2 (Especialista)</p>
            </div>
          </div>
        </div>

        <!-- ABA 2: TEXTOS ESPECÍFICOS -->
        <div id="tab-textos" class="tab-content hidden space-y-6">
          <h3 class="text-base font-bold text-white border-b border-slate-800 pb-3">Textos e Oferta da Página</h3>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Barra Superior de Aviso / Urgência</label>
            <input type="text" id="cfg_topBar" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Headline Principal (Título Forte)</label>
            <textarea id="cfg_headline" rows="2" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Subheadline (Texto Explicativo)</label>
            <textarea id="cfg_subheadline" rows="3" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Texto do Botão Principal (CTA)</label>
              <input type="text" id="cfg_ctaButton" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Texto de Apoio (Micro-trust)</label>
              <input type="text" id="cfg_ctaSubtext" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>

          <!-- Campos de Preço para Modelo 1 -->
          <div id="vendasPriceFields" class="pt-4 border-t border-slate-800 space-y-4">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Configurações de Preço (Modelo 1)</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Preço Original (De:)</label>
                <input type="text" id="cfg_vendas_originalPrice" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Preço com Desconto (Por:)</label>
                <input type="text" id="cfg_vendas_salePrice" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Texto de Parcelamento</label>
                <input type="text" id="cfg_vendas_installments" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
            </div>
          </div>
        </div>

        <!-- ABA 3: CONTATOS -->
        <div id="tab-contatos" class="tab-content hidden space-y-6">
          <h3 class="text-base font-bold text-white border-b border-slate-800 pb-3">WhatsApp &amp; Atendimento</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Número de WhatsApp (com DDI e DDD)</label>
              <input type="text" id="cfg_whatsapp" placeholder="5511999999999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">E-mail de Contato</label>
              <input type="email" id="cfg_email" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Mensagem Padrão Pré-preenchida no WhatsApp</label>
            <input type="text" id="cfg_whatsappMessage" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
        </div>

        <!-- ABA 4: PIXELS -->
        <div id="tab-pixels" class="tab-content hidden space-y-6">
          <h3 class="text-base font-bold text-white border-b border-slate-800 pb-3">Pixels de Tráfego Pago &amp; Rastreamento</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Meta Pixel ID (Facebook / Instagram)</label>
              <input type="text" id="cfg_metaPixelId" placeholder="Ex: 2161688604424737" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Google Ads ID</label>
              <input type="text" id="cfg_googleAdsId" placeholder="Ex: AW-18531803428" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
        </div>

        <!-- ABA 5: MODELOS & PERSONALIZAÇÃO DO CHECKOUT -->
        <div id="tab-checkout" class="tab-content hidden space-y-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">CHECKOUT INTELIGENTE</span>
              <h3 class="text-lg font-black text-white">Escolha o Modelo de Checkout para Seus Clientes</h3>
              <p class="text-xs text-slate-400">Selecione o modelo ativo e personalize os dados da oferta, Pix e prova social abaixo.</p>
            </div>
            <a href="../checkout.html" target="_blank" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 shrink-0 transition-colors">
              <span>👁 Testar Checkout no Navegador</span>
            </a>
          </div>

          <!-- CARDS DOS 3 MODELOS DE CHECKOUT -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Modelo Checkout 1 -->
            <div class="checkout-model-card p-5 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-slate-600" data-checkout-val="conversao-rapida">
              <div class="flex items-center justify-between mb-2">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">01</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">Mobile-First</span>
              </div>
              <h4 class="text-base font-bold text-white mb-1">Conversão Rápida (1 Coluna)</h4>
              <p class="text-xs text-slate-400 leading-relaxed">Máxima velocidade no celular. Foco em compra direta com menos campos, Pix de 1 clique e cronômetro de urgência.</p>
            </div>

            <!-- Modelo Checkout 2 -->
            <div class="checkout-model-card p-5 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-slate-600" data-checkout-val="duas-colunas">
              <div class="flex items-center justify-between mb-2">
                <span class="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm">02</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 uppercase">Order Bump &amp; Prova Social</span>
              </div>
              <h4 class="text-base font-bold text-white mb-1">Alta Conversão (2 Colunas)</h4>
              <p class="text-xs text-slate-400 leading-relaxed">Formulário à esquerda e resumo à direita com lista de bônus, caixinha de Order Bump (+R$ 47) e depoimento com estrelas.</p>
            </div>

            <!-- Modelo Checkout 3 -->
            <div class="checkout-model-card p-5 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-slate-600" data-checkout-val="clean-minimalista">
              <div class="flex items-center justify-between mb-2">
                <span class="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm">03</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 uppercase">Clean &amp; B2B</span>
              </div>
              <h4 class="text-base font-bold text-white mb-1">Minimalista Premium (Clean B2B)</h4>
              <p class="text-xs text-slate-400 leading-relaxed">Estética elegante dark titanium, discriminação de valores, seletor de Pessoa Física (CPF) / Jurídica (CNPJ) e máxima sobriedade.</p>
            </div>
          </div>

          <!-- SELETOR DE FORMA DE RECEBIMENTO & GATEWAY -->
          <div class="pt-6 border-t border-slate-800 space-y-4">
            <div>
              <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">GATEWAY &amp; FORMA DE RECEBIMENTO</span>
              <h4 class="text-base font-black text-white">Como Você Quer Receber Seus Pagamentos?</h4>
              <p class="text-xs text-slate-400">Escolha como seus clientes pagarão no checkout. Você só precisa preencher o estritamente necessário para seu método.</p>
            </div>

            <!-- 4 Cards de Seleção de Forma de Recebimento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- Card Mercado Pago -->
              <div class="payment-method-card p-4 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-sky-500" data-payment-val="mercadopago">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xl">🔵</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 uppercase">Pix + Cartão 12x</span>
                </div>
                <h5 class="text-sm font-bold text-white">Mercado Pago</h5>
                <p class="text-[11px] text-slate-400 mt-1">Cole o link gerado no app do Mercado Pago.</p>
              </div>

              <!-- Card Pix Direto -->
              <div class="payment-method-card p-4 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-emerald-500" data-payment-val="pix_direto">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xl">⚡</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">Sem Taxas</span>
                </div>
                <h5 class="text-sm font-bold text-white">Pix Direto (Sua Chave)</h5>
                <p class="text-[11px] text-slate-400 mt-1">Receba na sua conta com confirmação no WhatsApp.</p>
              </div>

              <!-- Card Outro Gateway -->
              <div class="payment-method-card p-4 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-purple-500" data-payment-val="link_externo">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xl">🚀</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 uppercase">Kiwify / Hotmart</span>
                </div>
                <h5 class="text-sm font-bold text-white">Outro Gateway</h5>
                <p class="text-[11px] text-slate-400 mt-1">Link de checkout de qualquer plataforma externa.</p>
              </div>

              <!-- Card WhatsApp -->
              <div class="payment-method-card p-4 rounded-2xl border-2 border-slate-800 bg-slate-900/60 cursor-pointer transition-all hover:border-emerald-500" data-payment-val="whatsapp">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xl">💬</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">1 a 1</span>
                </div>
                <h5 class="text-sm font-bold text-white">Vendas no WhatsApp</h5>
                <p class="text-[11px] text-slate-400 mt-1">O pedido chega pronto no seu WhatsApp.</p>
              </div>
            </div>

            <!-- Painéis Específicos (Mostram apenas o necessário) -->
            <!-- 1. Painel Mercado Pago -->
            <div id="panel_pay_mercadopago" class="pay-method-panel p-5 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-4">
              <div class="flex items-center justify-between">
                <h5 class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔵 Integração Mercado Pago</span>
                </h5>
                <span class="text-[11px] text-slate-400">Zero Código • Pronto em 1 minuto</span>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-200 mb-1">Link de Pagamento do Mercado Pago (Recomendado)</label>
                <input type="url" id="cfg_payment_mp_link" placeholder="Ex: https://mpago.la/xxxx ou https://link.mercadopago.com.br/xxxx" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
                <p class="text-[11px] text-slate-400 mt-1.5">
                  💡 <strong>Como pegar seu link em 30 segundos:</strong> Abra o aplicativo do Mercado Pago &gt; Toque em <em>"Cobrar com Link"</em> &gt; Defina o valor ou nome do produto &gt; Copie o link e cole aqui.
                </p>
              </div>

              <details class="text-xs text-slate-400 border border-slate-800 rounded-xl p-3 bg-slate-900/50">
                <summary class="cursor-pointer font-bold text-slate-300 hover:text-white">Opções Avançadas para Desenvolvedores (Access Token / Public Key)</summary>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-800">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Access Token Mercado Pago</label>
                    <input type="password" id="cfg_payment_mp_token" placeholder="APP_USR-..." class="w-full py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Public Key Mercado Pago</label>
                    <input type="text" id="cfg_payment_mp_key" placeholder="APP_USR-..." class="w-full py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white">
                  </div>
                </div>
              </details>
            </div>

            <!-- 2. Painel Pix Direto -->
            <div id="panel_pay_pix_direto" class="pay-method-panel p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
              <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡ Configuração do Pix Direto (Receba 100% sem Intermediários)</span>
              </h5>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Tipo de Chave Pix</label>
                  <select id="cfg_payment_pix_type" class="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="telefone">Telefone Celular</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-300 mb-1">Sua Chave Pix</label>
                  <input type="text" id="cfg_payment_pix_key" placeholder="Digite sua chave Pix" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono">
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Nome do Titular / Favorecido</label>
                  <input type="text" id="cfg_payment_pix_name" placeholder="Ex: Paulo Romão / Seu Negócio" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Banco / Instituição</label>
                  <input type="text" id="cfg_payment_pix_bank" placeholder="Ex: Nubank, Inter, Itaú, Bradesco" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
              </div>
            </div>

            <!-- 3. Painel Outro Gateway -->
            <div id="panel_pay_link_externo" class="pay-method-panel p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-4">
              <h5 class="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🚀 Plataforma Externa (Kiwify, Hotmart, Eduzz, Stripe, etc.)</span>
              </h5>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Nome da Plataforma</label>
                  <input type="text" id="cfg_payment_ext_platform" placeholder="Ex: Kiwify, Hotmart, Eduzz, Stripe" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-300 mb-1">Link Direto do Checkout</label>
                  <input type="url" id="cfg_payment_ext_url" placeholder="https://pay.kiwify.com.br/seu-produto" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
              </div>
            </div>

            <!-- 4. Painel WhatsApp -->
            <div id="panel_pay_whatsapp" class="pay-method-panel p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
              <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>💬 Fechamento de Vendas pelo WhatsApp</span>
              </h5>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Número do WhatsApp (com DDD)</label>
                  <input type="text" id="cfg_payment_wa_phone" placeholder="5511999999999" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Mensagem Inicial do Pedido</label>
                  <input type="text" id="cfg_payment_wa_msg" placeholder="Olá! Quero concluir o pagamento do meu pedido." class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
              </div>
            </div>
          </div>

          <!-- CAMPOS DE PERSONALIZAÇÃO DO CHECKOUT -->
          <div class="pt-4 border-t border-slate-800 space-y-6">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Dados da Oferta no Checkout</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Nome do Produto no Checkout</label>
                <input type="text" id="cfg_checkout_productName" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Descrição Curta / Subtítulo</label>
                <input type="text" id="cfg_checkout_productDescription" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Preço Riscado (De:)</label>
                <input type="text" id="cfg_checkout_originalPrice" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Preço Final (Por:)</label>
                <input type="text" id="cfg_checkout_salePrice" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Parcelamento</label>
                <input type="text" id="cfg_checkout_installments" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Chave Pix de Recebimento</label>
                <input type="text" id="cfg_checkout_pixKey" placeholder="suachavepix@email.com" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Garantia (Dias)</label>
                <input type="text" id="cfg_checkout_guaranteeDays" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Texto da Garantia</label>
                <input type="text" id="cfg_checkout_guaranteeText" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
            </div>

            <!-- PERSONALIZAÇÃO DE ORDER BUMP (MODELO 2) -->
            <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">OFERTA COMPLEMENTAR (ORDER BUMP)</span>
                  <h5 class="text-sm font-bold text-white">Configurar Produto Extra no Checkout</h5>
                </div>
                <label class="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="cfg_checkout_orderBumpActive" class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400">
                  <span>Ativar Order Bump</span>
                </label>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-[11px] font-bold text-slate-300 mb-1">Título do Bump</label>
                  <input type="text" id="cfg_checkout_orderBumpTitle" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-300 mb-1">Descrição</label>
                  <input type="text" id="cfg_checkout_orderBumpDesc" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-300 mb-1">Valor Extra (R$)</label>
                  <input type="text" id="cfg_checkout_orderBumpPrice" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
              </div>
            </div>

            <!-- PERSONALIZAÇÃO DO DEPOIMENTO / PROVA SOCIAL -->
            <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">PROVA SOCIAL NO CHECKOUT</span>
                  <h5 class="text-sm font-bold text-white">Depoimento em Destaque</h5>
                </div>
                <label class="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="cfg_checkout_testimonialActive" class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400">
                  <span>Exibir Depoimento</span>
                </label>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-bold text-slate-300 mb-1">Nome do Cliente</label>
                  <input type="text" id="cfg_checkout_testimonialName" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-300 mb-1">Cargo / Identificação</label>
                  <input type="text" id="cfg_checkout_testimonialRole" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Texto do Depoimento</label>
                <textarea id="cfg_checkout_testimonialText" rows="2" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-between items-center text-xs text-slate-500">
        <span>Pacote de Landing Page All-in-One • RMTI Tecnologia</span>
        <button id="btnResetDefault" type="button" class="text-red-400 hover:underline">
          🔄 Restaurar Configurações Originais de Fábrica
        </button>
      </div>
    </div>
  </div>

  <script src="admin.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(TARGET_DIR, 'admin/index.html'), adminHtml);

// =============================================================================
// 6. admin/admin.js (Com Troca Visual de Layout e Persistência)
// =============================================================================
const adminJs = `/**
 * Lógica do Painel de Controle • Pacote All-in-One
 */
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'LP_ALLINONE_CONFIG';
  const PASSWORD_KEY = 'LP_ADMIN_PASSWORD';
  const FIRST_LOGIN_KEY = 'LP_FIRST_LOGIN_DONE';

  const loginScreen = document.getElementById('loginScreen');
  const adminPanel = document.getElementById('adminPanel');
  const modalFirstAccess = document.getElementById('modalFirstAccess');

  let currentConfig = window.PAGE_CONFIG || {};

  // Sessão
  if (sessionStorage.getItem('LP_ADMIN_LOGGED') === 'true') {
    showPanel();
  }

  // Login
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('loginPassword').value.trim();
    const storedPass = localStorage.getItem(PASSWORD_KEY) || '123456';

    if (pass === storedPass) {
      if (!localStorage.getItem(FIRST_LOGIN_KEY)) {
        modalFirstAccess.classList.remove('hidden');
      } else {
        sessionStorage.setItem('LP_ADMIN_LOGGED', 'true');
        showPanel();
      }
    } else {
      alert('Senha incorreta! Digite a senha padrão (123456) ou sua senha cadastrada.');
    }
  });

  // Troca de Senha
  document.getElementById('formChangePass').addEventListener('submit', (e) => {
    e.preventDefault();
    const cur = document.getElementById('curPass').value.trim();
    const n1 = document.getElementById('newPass').value.trim();
    const n2 = document.getElementById('confirmPass').value.trim();
    const stored = localStorage.getItem(PASSWORD_KEY) || '123456';

    if (cur !== stored) return alert('A senha atual está incorreta.');
    if (n1.length < 4) return alert('A nova senha deve ter ao menos 4 caracteres.');
    if (n1 !== n2) return alert('As senhas digitadas não coincidem.');

    localStorage.setItem(PASSWORD_KEY, n1);
    localStorage.setItem(FIRST_LOGIN_KEY, 'true');
    modalFirstAccess.classList.add('hidden');
    sessionStorage.setItem('LP_ADMIN_LOGGED', 'true');
    alert('Senha alterada com sucesso!');
    showPanel();
  });

  function showPanel() {
    loginScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadFormData();
  }

  // Alternância de Abas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      document.getElementById(target).classList.remove('hidden');
    });
  });

  // SELETOR DE LAYOUT VISUAL
  document.querySelectorAll('.layout-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.layout-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const chosen = card.getAttribute('data-layout-val');
      currentConfig.activeLayout = chosen;
      loadLayoutSpecificFields(chosen);
    });
  });

  // SELETOR DE MODELO DE CHECKOUT VISUAL
  document.querySelectorAll('.checkout-model-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.checkout-model-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const chosen = card.getAttribute('data-checkout-val');
      if (!currentConfig.checkout) currentConfig.checkout = {};
      currentConfig.checkout.activeModel = chosen;
    });
  });

  // SELETOR DE FORMA DE RECEBIMENTO & GATEWAY
  document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const chosenPay = card.getAttribute('data-payment-val');
      if (!currentConfig.checkout) currentConfig.checkout = {};
      currentConfig.checkout.paymentMethod = chosenPay;
      showPaymentPanel(chosenPay);
    });
  });

  function showPaymentPanel(method) {
    document.querySelectorAll('.pay-method-panel').forEach(p => p.classList.add('hidden'));
    const p = document.getElementById('panel_pay_' + method);
    if (p) p.classList.remove('hidden');
  }

  function loadFormData() {
    const cfg = currentConfig;
    const active = cfg.activeLayout || 'vendas-diretas';

    // Marcar card do layout selecionado
    document.querySelectorAll('.layout-card').forEach(c => {
      if (c.getAttribute('data-layout-val') === active) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    // Campos Gerais
    setVal('cfg_businessName', cfg.businessName);
    setVal('cfg_tagline', cfg.tagline);
    setVal('cfg_logoUrl', cfg.logoUrl);
    setVal('cfg_bannerUrl', cfg.bannerUrl);
    setVal('cfg_photoUrl', cfg.photoUrl);
    setVal('cfg_whatsapp', cfg.whatsapp);
    setVal('cfg_email', cfg.email);
    setVal('cfg_whatsappMessage', cfg.whatsappMessage);
    setVal('cfg_metaPixelId', cfg.metaPixelId);
    setVal('cfg_googleAdsId', cfg.googleAdsId);

    // Configurações do Checkout
    const chk = cfg.checkout || {};
    const activeCheckout = chk.activeModel || 'conversao-rapida';
    document.querySelectorAll('.checkout-model-card').forEach(c => {
      if (c.getAttribute('data-checkout-val') === activeCheckout) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    // Forma de Recebimento / Gateway
    const payMethod = chk.paymentMethod || 'mercadopago';
    document.querySelectorAll('.payment-method-card').forEach(c => {
      if (c.getAttribute('data-payment-val') === payMethod) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });
    showPaymentPanel(payMethod);

    const mp = chk.mercadoPago || {};
    setVal('cfg_payment_mp_link', mp.paymentLink || '');
    setVal('cfg_payment_mp_token', mp.accessToken || '');
    setVal('cfg_payment_mp_key', mp.publicKey || '');

    const pPix = chk.pix || {};
    setVal('cfg_payment_pix_type', pPix.keyType || 'aleatoria');
    setVal('cfg_payment_pix_key', pPix.key || chk.pixKey || 'sua-chave-pix-aqui@empresa.com');
    setVal('cfg_payment_pix_name', pPix.receiverName || cfg.businessName || 'Seu Negócio');
    setVal('cfg_payment_pix_bank', pPix.bankName || 'Banco Inter / Nubank');

    const ext = chk.externalCheckout || {};
    setVal('cfg_payment_ext_platform', ext.platformName || 'Kiwify');
    setVal('cfg_payment_ext_url', ext.checkoutUrl || '');

    const waSales = chk.whatsappSales || {};
    setVal('cfg_payment_wa_phone', waSales.phone || cfg.whatsapp || '5511999999999');
    setVal('cfg_payment_wa_msg', waSales.message || 'Olá! Preenchi meus dados no checkout e gostaria de concluir meu pagamento.');

    setVal('cfg_checkout_productName', chk.productName || 'Acesso Completo ao [Nome do Seu Produto]');
    setVal('cfg_checkout_productDescription', chk.productDescription || 'Acesso imediato com todas as atualizações e suporte prioritário.');
    setVal('cfg_checkout_originalPrice', chk.originalPrice || 'R$ 497,00');
    setVal('cfg_checkout_salePrice', chk.salePrice || 'R$ 197,00');
    setVal('cfg_checkout_installments', chk.installments || '12x de R$ 19,78');
    setVal('cfg_checkout_pixKey', chk.pixKey || 'sua-chave-pix-aqui@empresa.com');
    setVal('cfg_checkout_guaranteeDays', chk.guaranteeDays || '7');
    setVal('cfg_checkout_guaranteeText', chk.guaranteeText || 'Você tem 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro.');

    const bump = chk.orderBump || {};
    setCheckbox('cfg_checkout_orderBumpActive', bump.active !== false);
    setVal('cfg_checkout_orderBumpTitle', bump.title || 'Adicionar Acompanhamento VIP Individual');
    setVal('cfg_checkout_orderBumpDesc', bump.description || 'Tenha 1 hora de consultoria individual para acelerar seus resultados.');
    setVal('cfg_checkout_orderBumpPrice', bump.price || 'R$ 47,00');

    const testm = chk.testimonial || {};
    setCheckbox('cfg_checkout_testimonialActive', testm.active !== false);
    setVal('cfg_checkout_testimonialName', testm.name || 'Mariana Costa');
    setVal('cfg_checkout_testimonialRole', testm.role || 'Aluna / Cliente Verificada');
    setVal('cfg_checkout_testimonialText', testm.text || 'O suporte e a estrutura são impecáveis! Consegui aplicar no meu negócio no mesmo dia da compra.');

    loadLayoutSpecificFields(active);
  }

  function loadLayoutSpecificFields(layout) {
    const cfg = currentConfig;
    const priceFields = document.getElementById('vendasPriceFields');

    if (layout === 'vendas-diretas') {
      const v = cfg.vendas || {};
      setVal('cfg_topBar', v.topBar);
      setVal('cfg_headline', v.headline);
      setVal('cfg_subheadline', v.subheadline);
      setVal('cfg_ctaButton', v.ctaButton);
      setVal('cfg_ctaSubtext', v.ctaSubtext);
      setVal('cfg_vendas_originalPrice', v.originalPrice);
      setVal('cfg_vendas_salePrice', v.salePrice);
      setVal('cfg_vendas_installments', v.installments);
      if (priceFields) priceFields.classList.remove('hidden');
    } else if (layout === 'leads-whatsapp') {
      const l = cfg.leads || {};
      setVal('cfg_topBar', l.topBar);
      setVal('cfg_headline', l.headline);
      setVal('cfg_subheadline', l.subheadline);
      setVal('cfg_ctaButton', l.ctaButton);
      setVal('cfg_ctaSubtext', l.ctaSubtext);
      if (priceFields) priceFields.classList.add('hidden');
    } else {
      const i = cfg.institucional || {};
      setVal('cfg_topBar', i.topBar);
      setVal('cfg_headline', i.headline);
      setVal('cfg_subheadline', i.subheadline);
      setVal('cfg_ctaButton', i.ctaButton);
      setVal('cfg_ctaSubtext', i.ctaSubtext);
      if (priceFields) priceFields.classList.add('hidden');
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setCheckbox(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  }

  function getCheckbox(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  }

  // Salvar no localStorage
  document.getElementById('btnSaveConfig').addEventListener('click', () => {
    currentConfig.businessName = getVal('cfg_businessName');
    currentConfig.tagline = getVal('cfg_tagline');
    currentConfig.logoUrl = getVal('cfg_logoUrl');
    currentConfig.bannerUrl = getVal('cfg_bannerUrl');
    currentConfig.photoUrl = getVal('cfg_photoUrl');
    currentConfig.whatsapp = getVal('cfg_whatsapp');
    currentConfig.email = getVal('cfg_email');
    currentConfig.whatsappMessage = getVal('cfg_whatsappMessage');
    currentConfig.metaPixelId = getVal('cfg_metaPixelId');
    currentConfig.googleAdsId = getVal('cfg_googleAdsId');

    // Salvar Checkout
    if (!currentConfig.checkout) currentConfig.checkout = {};
    currentConfig.checkout.productName = getVal('cfg_checkout_productName');
    currentConfig.checkout.productDescription = getVal('cfg_checkout_productDescription');
    currentConfig.checkout.originalPrice = getVal('cfg_checkout_originalPrice');
    currentConfig.checkout.salePrice = getVal('cfg_checkout_salePrice');
    currentConfig.checkout.installments = getVal('cfg_checkout_installments');
    currentConfig.checkout.pixKey = getVal('cfg_payment_pix_key') || getVal('cfg_checkout_pixKey');
    currentConfig.checkout.guaranteeDays = getVal('cfg_checkout_guaranteeDays');
    currentConfig.checkout.guaranteeText = getVal('cfg_checkout_guaranteeText');

    const activePayCard = document.querySelector('.payment-method-card.selected');
    currentConfig.checkout.paymentMethod = activePayCard ? activePayCard.getAttribute('data-payment-val') : 'mercadopago';

    currentConfig.checkout.mercadoPago = {
      paymentLink: getVal('cfg_payment_mp_link'),
      accessToken: getVal('cfg_payment_mp_token'),
      publicKey: getVal('cfg_payment_mp_key')
    };

    currentConfig.checkout.pix = {
      keyType: getVal('cfg_payment_pix_type'),
      key: getVal('cfg_payment_pix_key') || getVal('cfg_checkout_pixKey'),
      receiverName: getVal('cfg_payment_pix_name'),
      bankName: getVal('cfg_payment_pix_bank'),
      sendWhatsAppProof: true
    };

    currentConfig.checkout.externalCheckout = {
      platformName: getVal('cfg_payment_ext_platform'),
      checkoutUrl: getVal('cfg_payment_ext_url')
    };

    currentConfig.checkout.whatsappSales = {
      phone: getVal('cfg_payment_wa_phone'),
      message: getVal('cfg_payment_wa_msg')
    };

    currentConfig.checkout.orderBump = {
      active: getCheckbox('cfg_checkout_orderBumpActive'),
      title: getVal('cfg_checkout_orderBumpTitle'),
      description: getVal('cfg_checkout_orderBumpDesc'),
      price: getVal('cfg_checkout_orderBumpPrice')
    };

    currentConfig.checkout.testimonial = {
      active: getCheckbox('cfg_checkout_testimonialActive'),
      name: getVal('cfg_checkout_testimonialName'),
      role: getVal('cfg_checkout_testimonialRole'),
      text: getVal('cfg_checkout_testimonialText'),
      stars: 5,
      avatarUrl: 'assets/imagens/foto-placeholder.jpg'
    };

    const active = currentConfig.activeLayout || 'vendas-diretas';
    if (active === 'vendas-diretas') {
      if (!currentConfig.vendas) currentConfig.vendas = {};
      currentConfig.vendas.topBar = getVal('cfg_topBar');
      currentConfig.vendas.headline = getVal('cfg_headline');
      currentConfig.vendas.subheadline = getVal('cfg_subheadline');
      currentConfig.vendas.ctaButton = getVal('cfg_ctaButton');
      currentConfig.vendas.ctaSubtext = getVal('cfg_ctaSubtext');
      currentConfig.vendas.originalPrice = getVal('cfg_vendas_originalPrice');
      currentConfig.vendas.salePrice = getVal('cfg_vendas_salePrice');
      currentConfig.vendas.installments = getVal('cfg_vendas_installments');
    } else if (active === 'leads-whatsapp') {
      if (!currentConfig.leads) currentConfig.leads = {};
      currentConfig.leads.topBar = getVal('cfg_topBar');
      currentConfig.leads.headline = getVal('cfg_headline');
      currentConfig.leads.subheadline = getVal('cfg_subheadline');
      currentConfig.leads.ctaButton = getVal('cfg_ctaButton');
      currentConfig.leads.ctaSubtext = getVal('cfg_ctaSubtext');
    } else {
      if (!currentConfig.institucional) currentConfig.institucional = {};
      currentConfig.institucional.topBar = getVal('cfg_topBar');
      currentConfig.institucional.headline = getVal('cfg_headline');
      currentConfig.institucional.subheadline = getVal('cfg_subheadline');
      currentConfig.institucional.ctaButton = getVal('cfg_ctaButton');
      currentConfig.institucional.ctaSubtext = getVal('cfg_ctaSubtext');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
    window.PAGE_CONFIG = currentConfig;

    const toast = document.getElementById('saveToast');
    toast.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3000);
  });

  // Baixar config.js permanente
  document.getElementById('btnDownloadConfig').addEventListener('click', () => {
    const content = '/**\\n * Arquivo gerado pelo Painel Admin • Pacote All-in-One\\n */\\nconst DEFAULT_CONFIG = ' + JSON.stringify(currentConfig, null, 2) + ';\\nwindow.PAGE_CONFIG = DEFAULT_CONFIG;\\n';
    const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.js';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Restaurar Padrões
  document.getElementById('btnResetDefault').addEventListener('click', () => {
    if (confirm('Deseja restaurar as configurações originais de fábrica?')) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });
});
`;
fs.writeFileSync(path.join(TARGET_DIR, 'admin/admin.js'), adminJs);

// =============================================================================
// 7. MANUAL ILUSTRADO EM HTML & PDF
// =============================================================================
const manualHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Manual do Cliente • Pacote de Landing Page All-in-One</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6; font-size: 13px; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
    .header h1 { color: #0f172a; font-size: 24px; margin: 0; }
    .header p { color: #64748b; font-size: 13px; margin: 5px 0 0 0; }
    .badge { display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 10px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 18px; }
    .box-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .num { background: #10b981; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .model-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-top: 8px; background: #ffffff; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">MANUAL ILUSTRADO DO CLIENTE • RMTI TECNOLOGIA</div>
    <h1>Pacote de Landing Page All-in-One</h1>
    <p>1 Estrutura • 3 Modelos Selecionáveis • Painel Admin Próprio • Checkout Incluso</p>
  </div>

  <div class="box">
    <h3 class="box-title"><span class="num">1</span> Como Testar Sua Página em 5 Segundos</h3>
    <p>Você não precisa instalar nenhum programa ou servidor. Basta dar <strong>duplo clique no arquivo index.html</strong> para abrir sua página diretamente no navegador (Google Chrome, Edge ou Safari).</p>
  </div>

  <div class="box">
    <h3 class="box-title"><span class="num">2</span> Como Escolher Seu Modelo de Layout e Editar Tudo</h3>
    <p>Abra a pasta <code>admin/</code> e dê duplo clique em <code>index.html</code>:</p>
    <ul>
      <li><strong>Senha inicial de fábrica:</strong> <code>123456</code></li>
      <li>No primeiro acesso, você cadastrará sua senha pessoal para proteção.</li>
      <li>No topo do painel, você verá o <strong>Seletor de Modelos</strong>:</li>
    </ul>
    <div class="model-card">
      <strong>⚡ Modelo 01: Vendas Diretas &amp; VSL</strong> — Para cursos, e-books e produtos com compra imediata e checkout.
    </div>
    <div class="model-card">
      <strong>💬 Modelo 02: Captura &amp; WhatsApp VIP</strong> — Para especialistas, clínicas, consultores e serviços high-ticket.
    </div>
    <div class="model-card">
      <strong>🏢 Modelo 03: Institucional &amp; B2B</strong> — Para empresas, agências e negócios que buscam autoridade corporativa.
    </div>
    <p style="margin-top:10px;">Basta clicar no modelo desejado, alterar títulos, logotipo e preços, e clicar em <strong>"Salvar Alterações"</strong>. A página atualizará instantaneamente!</p>
  </div>

  <div class="box">
    <h3 class="box-title"><span class="num">3</span> Escolhendo e Personalizando o Modelo de Checkout</h3>
    <p>O pacote inclui <strong>3 Modelos de Checkout</strong> de alta conversão selecionáveis na aba <em>"💳 Modelos & Checkout"</em> do Painel Admin:</p>
    <ul>
      <li><strong>1. Conversão Rápida (1 Coluna Mobile-First):</strong> Foco em rapidez no celular com cronômetro de urgência e Pix em 1 clique.</li>
      <li><strong>2. Duas Colunas (Order Bump & Prova Social):</strong> Layout dividido com resumo lateral, depoimento com 5 estrelas e caixinha de Order Bump (+R$ 47).</li>
      <li><strong>3. Minimalista Premium (Clean B2B Corporativo):</strong> Estética elegante com seletor de Pessoa Física (CPF) ou Jurídica (CNPJ) e discriminação de fatura.</li>
    </ul>
    <p style="margin-top:8px;">Você pode personalizar nome do produto, preços, garantia e depoimentos diretamente pelo painel!</p>
  </div>

  <div class="box">
    <h3 class="box-title"><span class="num">4</span> Como Escolher e Configurar Sua Forma de Recebimento</h3>
    <p>Na mesma aba <em>"💳 Modelos & Checkout"</em>, você escolhe como receberá o dinheiro das suas vendas:</p>
    <ul>
      <li><strong>🔵 Mercado Pago (Recomendado):</strong> Basta criar um link de cobrança no app do Mercado Pago e colar no campo. Seu cliente poderá pagar via Pix automático e Cartão em até 12x.</li>
      <li><strong>⚡ Pix Direto (Sua Chave):</strong> Receba direto na sua conta bancária sem intermediários e sem taxas, com botão automático para o cliente enviar o comprovante no seu WhatsApp.</li>
      <li><strong>🚀 Outro Gateway:</strong> Redirecione o cliente diretamente para seu link de checkout do Kiwify, Hotmart, Eduzz, Stripe ou qualquer plataforma.</li>
      <li><strong>💬 Vendas no WhatsApp:</strong> O cliente preenche o formulário e o pedido chega pronto para você fechar no WhatsApp.</li>
    </ul>
  </div>

  <div class="box">
    <h3 class="box-title"><span class="num">5</span> Tornando as Alterações Definitivas</h3>
    <p>Ao terminar de editar no Painel Admin, clique no botão azul <strong>"Baixar config.js"</strong>. Substitua o arquivo dentro da pasta <code>js/</code>. Desta forma, suas edições ficam salvas permanentemente em qualquer servidor ou hospedagem!</p>
  </div>

  <div class="box">
    <h3 class="box-title"><span class="num">6</span> Como Publicar Gratuitamente na Vercel (Em 3 Minutos)</h3>
    <ol>
      <li>Crie uma conta gratuita em <strong>vercel.com</strong>.</li>
      <li>Arraste a pasta descompactada deste projeto para o painel da Vercel.</li>
      <li>Clique em <strong>Deploy</strong>. Seu site estará no ar mundialmente com certificado SSL gratuito (https://)!</li>
      <li>Opcional: Conecte seu domínio próprio (ex: <code>seunegocio.com.br</code>) na aba <em>Settings > Domains</em>.</li>
    </ol>
  </div>

  <div class="footer">
    Desenvolvido com excelência por <strong>RMTI • Soluções em Tecnologia</strong> | Suporte: pauloromao.dev2020@gmail.com
  </div>
</body>
</html>
`;
fs.writeFileSync(path.join(TARGET_DIR, 'MANUAL-ILUSTRADO.html'), manualHtml);

// Compilar PDF via Microsoft Edge Headless
try {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const pdfOut = path.join(TARGET_DIR, 'MANUAL-ILUSTRADO.pdf');
  if (fs.existsSync(edgePath)) {
    execSync(`"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOut}" "${path.join(TARGET_DIR, 'MANUAL-ILUSTRADO.html')}"`, { stdio: 'ignore' });
    console.log('MANUAL-ILUSTRADO.pdf gerado com sucesso em:', pdfOut);
  }
} catch (e) {
  console.warn('Erro ao compilar PDF:', e.message);
}

// =============================================================================
// 8. README.md TÉCNICO EXPLICATIVO PARA DESENVOLVEDOR
// =============================================================================
const readmeMd = `# 🚀 Pacote de Landing Page All-in-One • Documentação Técnica

Este documento foi elaborado para desenvolvedores e equipes técnicas que forem dar suporte, estender ou integrar este projeto.

---

## 🏛️ 1. Arquitetura do Projeto

O projeto foi construído utilizando **Vanilla Web Standards (HTML5, CSS3 moderno e JavaScript ES6+)** com suporte a **Tailwind CSS via CDN**. 
Não há dependência de compiladores complexos (Webpack, Vite, npm ou Node.js em runtime), o que garante que a página execute em:
- Qualquer servidor estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages)
- Servidores tradicionais Apache / Nginx / cPanel
- Execução local offline via protocolo \`file://\` com duplo clique

---

## 📂 2. Estrutura de Pastas e Arquivos

\`\`\`text
pacote-landing-page/
├── index.html                   # Página principal contendo os 3 layouts dinâmicos
├── checkout.html                # Checkout universal limpo (Pix Copia e Cola / Cartão)
├── obrigado.html                # Página de agradecimento pós-conversão
├── admin/                       # Painel Administrativo do Cliente
│   ├── index.html               # Interface de controle com seletor de modelos
│   └── admin.js                 # Lógica de autenticação e exportação de config.js
├── css/
│   └── style.css                # Estilização complementar, fontes e regras de layout
├── js/
│   ├── app.js                   # Controlador de dados, acordeão FAQ e WhatsApp
│   └── config.js                # Objeto de configuração padrão (window.PAGE_CONFIG)
├── assets/
│   └── imagens/                 # Imagens placeholders ("SUA LOGO AQUI", banners, fotos)
├── MANUAL-ILUSTRADO.pdf         # Manual ilustrado para usuários não técnicos
├── MANUAL-ILUSTRADO.html        # Versão web do manual ilustrado
└── README.md                    # Esta documentação técnica
\`\`\`

---

## 🔄 3. Como Funciona a Alternância dos 3 Layouts

A alternância entre os 3 modelos de layout é controlada pelo atributo \`activeLayout\` no arquivo \`js/config.js\` ou no \`localStorage\`:

- \`vendas-diretas\`: Layout 01 com foco em VSL, módulos de curso, oferta com preço e checkout.
- \`leads-whatsapp\`: Layout 02 com foco em autoridade do especialista, planos e botão WhatsApp.
- \`institucional\`: Layout 03 com foco corporativo, métricas de impacto (+500 Projetos) e proposta comercial.

No CSS (\`css/style.css\`), as seções recebem o atributo \`data-layout="nome-do-layout"\`. Ao alterar o atributo no \`<body>\`, o CSS e o script \`js/app.js\` ativam apenas a estrutura correspondente:

\`\`\`css
body[data-active-layout="vendas-diretas"] [data-layout]:not([data-layout="vendas-diretas"]) {
  display: none !important;
}
\`\`\`

---

## 💳 4. Os 3 Modelos de Checkout Integrados

O projeto acompanha 3 estruturas de checkout configuráveis no painel:

1. **⚡ Modelo 1: Conversão Rápida (1 Coluna Mobile-First):** Focado em velocidade para tráfego mobile, com cronômetro de urgência, resumo condensado e botão Pix com cópia em 1 clique.
2. **📊 Modelo 2: Alta Conversão (2 Colunas com Order Bump & Prova Social):** Estrutura clássica de grandes lançamentos. Inclui resumo lateral com foto do produto, depoimento com 5 estrelas e caixinha dinâmica de **Order Bump (+R$ 47)** que recalcula o valor total na hora.
3. **🏢 Modelo 3: Minimalista Premium (Clean B2B Corporativo):** Interface dark titanium com seletor de Pessoa Física (CPF) vs. Jurídica (CNPJ) e discriminação detalhada da fatura comercial.

A alternância é controlada por \`body[data-active-checkout="nome-do-modelo"]\` e configurável visualmente na aba **"Modelos & Checkout"** do Painel Admin.

---

## 🏦 5. Formas de Recebimento & Gateways Suportados

O cliente pode definir como deseja receber seus pagamentos sem complicação:

1. **🔵 Mercado Pago (Recomendado):** Basta colar o link de pagamento gerado no app do Mercado Pago. Aceita Pix e Cartão de Crédito em até 12x. Também oferece campos opcionais de Access Token e Public Key para integrações diretas.
2. **⚡ Pix Direto (Sua Chave):** O cliente cadastra sua chave Pix, nome do favorecido e banco. No checkout, o comprador tem cópia em 1 clique e botão para enviar o comprovante diretamente no WhatsApp do vendedor.
3. **🚀 Outro Gateway:** Suporte para Kiwify, Hotmart, Eduzz, Stripe, Asaas ou qualquer checkout externo via link direto.
4. **💬 Vendas no WhatsApp:** O cliente preenche seus dados e é redirecionado para o WhatsApp com a mensagem do pedido formatada.

---

## 🛡️ 6. Separação de Modo Demonstração vs. Produção

- **No pacote do cliente:** A barra superior de demonstração ("PACOTE DE LANDING PAGE") e o botão "⚙️ Editar no Admin" da navbar ficam **ocultos e desativados**. O cliente e seus visitantes veem apenas o site limpo e profissional.
- **Na demonstração pública da RMTI:** Caso acesse via rota \`/pacote\` ou com \`?demo=true\`, os controles de teste são ativados para os visitantes experimentarem os recursos.
- **Assinatura no Rodapé:** O rodapé carrega o selo elegante com a logo oficial da **RMTI (Desenvolvido por RMTI • Soluções em Tecnologia)** com link para o site oficial.

---

## ⚙️ 7. Fluxo de Dados e Painel Admin

1. **Leitura de Dados:** O arquivo \`js/config.js\` define o objeto \`DEFAULT_CONFIG\` e expõe \`window.PAGE_CONFIG\`. Se existir uma cópia salva em \`localStorage.getItem('LP_ALLINONE_CONFIG')\`, ela tem precedência.
2. **Edição Visual:** Ao abrir \`admin/index.html\`, o cliente altera textos, preços, telefones, checkout e modelos.
3. **Persistência Temporária:** Ao clicar em "Salvar Alterações", os dados são persistidos no \`localStorage\`.
4. **Persistência Definitiva:** Ao clicar em "Baixar config.js", o script cria dinamicamente um arquivo \`config.js\` contendo os dados atuais. O desenvolvedor ou cliente só precisa substituir o arquivo dentro de \`js/config.js\`.

---

## 🔐 8. Autenticação do Painel Admin

- A autenticação é executada no cliente em \`admin/admin.js\`.
- **Senha inicial:** \`123456\`.
- No primeiro acesso, a chave \`LP_FIRST_LOGIN_DONE\` é checada. Se for o primeiro acesso, o modal de troca de senha é disparado obrigatoriamente.
- A nova senha é salva sob a chave \`LP_ADMIN_PASSWORD\` no \`localStorage\`.

---

## 🚀 9. Instruções para Publicação

### Deploy na Vercel:
1. Conecte o repositório ou arraste a pasta diretamente para o dashboard da Vercel.
2. Framework Preset: **Other**.
3. Output Directory: **./** (raiz).
4. O deploy será concluído em menos de 1 minuto.

### Hospedagem cPanel / Apache / Nginx:
1. Envie todos os arquivos para a pasta \`public_html\`.
2. Certifique-se de que o certificado SSL esteja ativado.

---
© 2026 RMTI • Soluções Inteligentes em Tecnologia.
`;
fs.writeFileSync(path.join(TARGET_DIR, 'README.md'), readmeMd);

// Copiar logotipo oficial e ícone da RMTI para os assets do pacote
const rmtiLogoPng = path.join(RMTI_DIR, 'public/assets/imagens/logo.png');
const rmtiLogoWebp = path.join(RMTI_DIR, 'public/assets/imagens/logo.webp');
const rmtiIconPng = path.join(RMTI_DIR, 'public/assets/imagens/IconeNovo-trimmed.png');

if (fs.existsSync(rmtiLogoPng)) {
  fs.copyFileSync(rmtiLogoPng, path.join(TARGET_DIR, 'assets/imagens/rmti-logo.png'));
  console.log('Logo RMTI copiado para assets/imagens/rmti-logo.png');
}
if (fs.existsSync(rmtiLogoWebp)) {
  fs.copyFileSync(rmtiLogoWebp, path.join(TARGET_DIR, 'assets/imagens/rmti-logo.webp'));
}
if (fs.existsSync(rmtiIconPng)) {
  fs.copyFileSync(rmtiIconPng, path.join(TARGET_DIR, 'assets/imagens/rmti-icone.png'));
}

// =============================================================================
// 9. COMPACTAR O PROJETO EM .ZIP PARA ENTREGA
// =============================================================================
const zipDesktop = path.join(TARGET_DIR, 'pacote-landing-page.zip');
const zipRmti = path.join(RMTI_DIR, 'public/downloads/pacote-landing-page-rmti.zip');

if (fs.existsSync(zipDesktop)) fs.unlinkSync(zipDesktop);
if (!fs.existsSync(path.dirname(zipRmti))) fs.mkdirSync(path.dirname(zipRmti), { recursive: true });
if (fs.existsSync(zipRmti)) fs.unlinkSync(zipRmti);

try {
  console.log('Compactando pacote final em ZIP...');
  // Compacta todo o diretório excluindo o próprio zip
  execSync(`powershell -Command "Compress-Archive -Path '${TARGET_DIR}\\*' -DestinationPath '${zipDesktop}' -Force"`);
  console.log('ZIP gerado no Desktop:', zipDesktop);
  fs.copyFileSync(zipDesktop, zipRmti);
  console.log('ZIP copiado para RMTI downloads:', zipRmti);
} catch (e) {
  console.warn('Erro ao compactar ZIP:', e.message);
}

// 10. Copiar a pasta inteira também para dentro de RMTI em public/pacote para visualização no site
const rmtiDemoDir = path.join(RMTI_DIR, 'public/pacote');
if (!fs.existsSync(rmtiDemoDir)) fs.mkdirSync(rmtiDemoDir, { recursive: true });

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirRecursive(TARGET_DIR, rmtiDemoDir);
console.log('Cópia do pacote sincronizada em public/pacote para demonstração no site.');

console.log('Construção do Pacote All-in-One finalizada com sucesso absoluto!');
