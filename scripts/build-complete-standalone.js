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

  // Modo de Demonstração: ativo apenas se configurado explicitamente, se estiver servido em /pacote na RMTI ou com ?demo=true
  const isDemoMode = Boolean(
    cfg.isDemo === true ||
    (window.location.protocol.startsWith('http') && (window.location.pathname === '/pacote' || window.location.pathname.startsWith('/pacote/'))) ||
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

  // Função auxiliar para converter link do YouTube/Vimeo em embed
  function getEmbedUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.includes('youtube.com/embed/') || trimmed.includes('player.vimeo.com/video/')) return trimmed;
    const ytMatch = trimmed.match(/(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/|youtube\\.com\\/shorts\\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) return 'https://www.youtube.com/embed/' + ytMatch[1];
    const vimeoMatch = trimmed.match(/vimeo\\.com\\/([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) return 'https://player.vimeo.com/video/' + vimeoMatch[1];
    return '';
  }

  // Preencher campos de acordo com o layout ativo
  if (activeLayout === 'vendas-diretas' && cfg.vendas) {
    const v = cfg.vendas;
    const setText = (sel, txt) => {
      if (txt === undefined) return;
      document.querySelectorAll(sel).forEach(el => el.textContent = txt);
    };
    setText('.vendas-topBar', v.topBar);
    setText('.vendas-badge', v.badge);
    setText('.vendas-headline', v.headline);
    setText('.vendas-subheadline', v.subheadline);
    setText('.vendas-ctaButton', v.ctaButton);
    setText('.vendas-ctaSubtext', v.ctaSubtext);
    setText('.vendas-productName', v.productName);
    setText('.vendas-originalPrice', v.originalPrice);
    setText('.vendas-salePrice', v.salePrice);
    setText('.vendas-installments', v.installments);
    setText('.vendas-guaranteeDays', v.guaranteeDays);
    setText('.vendas-guaranteeText', v.guaranteeText);

    // Vídeo VSL se configurado
    const embedUrl = getEmbedUrl(v.videoUrl);
    const vslContainer = document.getElementById('vendasVslContainer');
    if (embedUrl && vslContainer) {
      vslContainer.innerHTML = '<iframe src="' + embedUrl + '" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Vídeo de Apresentação"></iframe>';
    }

    // Módulos dinâmicos
    if (Array.isArray(v.modules) && v.modules.length > 0) {
      const modGrid = document.getElementById('vendasModulesGrid');
      if (modGrid) {
        modGrid.innerHTML = v.modules.map((m, idx) => {
          const num = (idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1);
          return '<div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800">' +
            '<div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-black mb-3">' + num + '</div>' +
            '<h3 class="text-lg font-bold text-white mb-1">' + (m.title || '') + '</h3>' +
            '<p class="text-slate-300 text-sm">' + (m.desc || '') + '</p>' +
          '</div>';
        }).join('');
      }
    }

    // Bônus dinâmicos
    if (Array.isArray(v.bonuses) && v.bonuses.length > 0) {
      const bonusGrid = document.getElementById('vendasBonusesGrid');
      if (bonusGrid) {
        bonusGrid.innerHTML = v.bonuses.map((b, idx) => {
          return '<div class="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">' +
            '<div>' +
              '<span class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-3">🎁 Bônus 0' + (idx + 1) + '</span>' +
              '<h3 class="text-base font-bold text-white mb-1.5">' + (b.title || '') + '</h3>' +
              '<p class="text-slate-300 text-xs leading-relaxed">' + (b.desc || '') + '</p>' +
            '</div>' +
            '<div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">' +
              '<span class="text-slate-400 line-through">Vendido por ' + (b.value || 'R$ 197') + '</span>' +
              '<span class="text-emerald-400 font-black uppercase">GRÁTIS HOJE</span>' +
            '</div>' +
          '</div>';
        }).join('');
      }
    }
  } else if (activeLayout === 'leads-whatsapp' && cfg.leads) {
    const l = cfg.leads;
    const setText = (sel, txt) => {
      if (txt === undefined) return;
      document.querySelectorAll(sel).forEach(el => el.textContent = txt);
    };
    setText('.leads-topBar', l.topBar);
    setText('.leads-badge', l.badge);
    setText('.leads-headline', l.headline);
    setText('.leads-subheadline', l.subheadline);
    setText('.leads-ctaButton', l.ctaButton);
    setText('.leads-ctaSubtext', l.ctaSubtext);
    setText('.leads-professionalTitle', l.professionalTitle);

    // Planos dinâmicos
    if (Array.isArray(l.plans) && l.plans.length > 0) {
      const plansGrid = document.getElementById('leadsPlansGrid');
      if (plansGrid) {
        plansGrid.innerHTML = l.plans.map((p) => {
          const isHigh = Boolean(p.highlight);
          const feats = Array.isArray(p.features) ? p.features : [];
          return '<div class="glass-card p-6 sm:p-8 rounded-3xl ' + (isHigh ? 'border-2 border-sky-500 bg-sky-950/20 relative shadow-2xl scale-105' : 'border border-slate-800') + ' flex flex-col justify-between">' +
            (isHigh ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 text-[10px] font-black uppercase px-4 py-1 rounded-full whitespace-nowrap">' + (p.badge || 'MAIS ESCOLHIDO') + '</div>' : '') +
            '<div>' +
              '<h3 class="text-xl font-bold text-white">' + (p.name || '') + '</h3>' +
              '<div class="text-3xl font-black text-white mt-4">' + (p.price || '') + '<span class="text-xs text-slate-400"> ' + (p.period || '') + '</span></div>' +
              '<ul class="space-y-2.5 text-xs ' + (isHigh ? 'text-slate-200' : 'text-slate-300') + ' mt-6">' +
                feats.map(f => '<li>✓ ' + f + '</li>').join('') +
              '</ul>' +
            '</div>' +
            '<a href="#" class="whatsapp-btn mt-8 ' + (isHigh ? 'py-4 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center block shadow-lg shadow-sky-500/25' : 'py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block border border-slate-700') + '" data-msg="' + (p.msg || ('Olá! Quero saber mais sobre o ' + p.name)) + '">' +
              (isHigh ? 'Quero o ' + (p.name || 'Plano VIP') : 'Escolher ' + (p.name || 'Plano')) +
            '</a>' +
          '</div>';
        }).join('');
      }
    }
  } else if (activeLayout === 'institucional' && cfg.institucional) {
    const i = cfg.institucional;
    const setText = (sel, txt) => {
      if (txt === undefined) return;
      document.querySelectorAll(sel).forEach(el => el.textContent = txt);
    };
    setText('.inst-topBar', i.topBar);
    setText('.inst-badge', i.badge);
    setText('.inst-headline', i.headline);
    setText('.inst-subheadline', i.subheadline);
    setText('.inst-ctaButton', i.ctaButton);
    setText('.inst-ctaSubtext', i.ctaSubtext);

    // Estatísticas dinâmicas
    if (Array.isArray(i.stats) && i.stats.length > 0) {
      const statsGrid = document.getElementById('instStatsGrid');
      if (statsGrid) {
        statsGrid.innerHTML = i.stats.map(s => (
          '<div>' +
            '<div class="text-3xl sm:text-5xl font-black text-blue-400">' + (s.num || '') + '</div>' +
            '<div class="text-xs sm:text-sm text-slate-400 mt-1">' + (s.label || '') + '</div>' +
          '</div>'
        )).join('');
      }
    }

    // Serviços Corporativos dinâmicos
    if (Array.isArray(i.services) && i.services.length > 0) {
      const srvGrid = document.getElementById('instServicesGrid');
      if (srvGrid) {
        srvGrid.innerHTML = i.services.map((s, idx) => {
          const num = '0' + (idx + 1);
          return '<div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-colors">' +
            '<div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-black mb-4">' + num + '</div>' +
            '<h3 class="text-lg font-bold text-white mb-2">' + (s.title || '') + '</h3>' +
            '<p class="text-slate-300 text-sm leading-relaxed">' + (s.desc || '') + '</p>' +
          '</div>';
        }).join('');
      }
    }
  }

  // FAQs dinâmicos (Compartilhado em todos os layouts)
  if (Array.isArray(cfg.faqs) && cfg.faqs.length > 0) {
    const faqContainer = document.getElementById('faqListContainer');
    if (faqContainer) {
      faqContainer.innerHTML = cfg.faqs.map(f => (
        '<div class="faq-item glass-card rounded-2xl border border-slate-800 overflow-hidden">' +
          '<button type="button" class="faq-question w-full p-5 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-emerald-400 transition-colors">' +
            '<span>' + (f.q || '') + '</span>' +
            '<span class="faq-icon text-slate-400 transition-transform">▼</span>' +
          '</button>' +
          '<div class="faq-answer hidden px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">' +
            (f.a || '') +
          '</div>' +
        '</div>'
      )).join('');
    }
  }

  // Configurar links de WhatsApp (após renderizar planos dinâmicos)
  if (cfg.whatsapp) {
    const cleanNum = cfg.whatsapp.replace(/\\D/g, '');
    const defaultMsg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site.');
    document.querySelectorAll('.whatsapp-btn').forEach(btn => {
      const specificMsg = btn.getAttribute('data-msg');
      const msg = specificMsg ? encodeURIComponent(specificMsg) : defaultMsg;
      btn.href = \`https://wa.me/\${cleanNum}?text=\${msg}\`;
    });
  }

  // Formulário B2B Institucional
  const b2bForm = document.getElementById('b2bProposalForm');
  if (b2bForm) {
    b2bForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('b2bName') || {}).value || '';
      const company = (document.getElementById('b2bCompany') || {}).value || '';
      const phone = (document.getElementById('b2bPhone') || {}).value || '';
      const need = (document.getElementById('b2bNeed') || {}).value || '';
      if (cfg.whatsapp) {
        const cleanNum = cfg.whatsapp.replace(/\\D/g, '');
        const msg = encodeURIComponent('Olá! Solicito uma Proposta Comercial B2B.\\n\\n• Nome: ' + name + '\\n• Empresa: ' + company + '\\n• Contato: ' + phone + '\\n• Demanda: ' + need);
        window.open('https://wa.me/' + cleanNum + '?text=' + msg, '_blank');
      }
      window.location.href = 'obrigado.html';
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
        <span class="vendas-badge">🔥 MÉTODO 100% PRÁTICO &amp; VALIDADO</span>
      </div>

      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6 max-w-4xl vendas-headline">
        Descubra Como [Alcançar Grande Desejo] Sem [Principal Objeção ou Dor]
      </h1>

      <p class="text-slate-300 text-base sm:text-xl font-normal leading-relaxed max-w-3xl mb-10 vendas-subheadline">
        O passo a passo validado para dominar [sua habilidade] em tempo recorde, mesmo começando do absoluto zero.
      </p>

      <!-- Banner / VSL Mockup -->
      <div class="w-full max-w-3xl rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl mb-10 relative group bg-slate-900">
        <div id="vendasVslContainer" class="aspect-video relative flex items-center justify-center">
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
      <div id="vendasModulesGrid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

    <!-- Bônus Exclusivos -->
    <section class="py-16 px-4 max-w-5xl mx-auto border-t border-slate-800">
      <div class="text-center mb-12">
        <span class="text-emerald-400 text-xs font-bold uppercase tracking-wider">PRESENTES EXCLUSIVOS</span>
        <h2 class="text-2xl sm:text-4xl font-black text-white mt-2">Bônus Gratuitos Para Quem Entrar Hoje</h2>
      </div>
      <div id="vendasBonusesGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
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
          <span class="vendas-ctaButton">SIM! QUERO ME INSCREVER AGORA</span>
          <span>→</span>
        </a>
        <div class="mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col items-center gap-1">
          <span class="font-bold text-emerald-400">🛡️ Garantia Incondicional de <span class="vendas-guaranteeDays">7</span> Dias</span>
          <p class="max-w-lg vendas-guaranteeText">Você tem 7 dias para testar tudo. Se por qualquer motivo achar que não valeu a pena, devolvemos 100% do seu dinheiro.</p>
        </div>
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
          <span class="leads-badge">★ ATENDIMENTO PERSONALIZADO</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white leading-tight leads-headline">
          Transforme Sua [Área de Atuação] com um Acompanhamento 100% Individualizado
        </h1>
        <p class="text-slate-300 text-base sm:text-lg leading-relaxed leads-subheadline">
          Metodologia científica e personalizada para você atingir seus objetivos com segurança, sem fórmulas prontas ou promessas milagrosas.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
          <a href="#" class="whatsapp-btn py-4 px-8 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-sky-500/20 text-center flex items-center justify-center gap-2">
            <span class="leads-ctaButton">💬 FALAR COMIGO NO WHATSAPP</span>
          </a>
          <a href="#planos-servico" class="py-4 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 text-center">
            Ver Modalidades
          </a>
        </div>
        <p class="text-xs text-slate-400 leads-ctaSubtext">⚡ Resposta Rápida • Vagas Limitadas</p>
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

      <div id="leadsPlansGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"></div>
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
        <span class="inst-badge">★ SOLUÇÕES CORPORATIVAS DE ALTA PERFORMANCE</span>
      </span>
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl mb-6 inst-headline">
        Aceleramos o Crescimento do Seu Negócio com Soluções de Alta Performance
      </h1>
      <p class="text-slate-300 text-base sm:text-xl max-w-3xl mb-10 leading-relaxed inst-subheadline">
        Desenvolvemos tecnologia sob medida, processos eficientes e estratégias focadas em maximizar a rentabilidade e a escala da sua operação.
      </p>
      <div class="flex flex-col items-center gap-2 mb-12">
        <a href="#proposta" class="py-4 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/20">
          <span class="inst-ctaButton">SOLICITAR PROPOSTA PERSONALIZADA</span>
        </a>
        <span class="text-xs text-slate-400 inst-ctaSubtext">Atendimento Executivo • Proposta em até 24 Horas</span>
      </div>

      <!-- Banner Corporativo -->
      <div class="w-full max-w-5xl rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <img src="assets/imagens/banner-placeholder.jpg" alt="Banner Institucional" class="w-full h-auto object-cover val-bannerUrl">
      </div>
    </section>

    <!-- Métricas de Impacto -->
    <section class="py-12 bg-slate-950/60 border-y border-slate-800">
      <div id="instStatsGrid" class="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"></div>
    </section>

    <!-- Soluções & Serviços Corporativos -->
    <section class="py-16 px-4 max-w-6xl mx-auto border-b border-slate-800">
      <div class="text-center mb-12">
        <span class="text-blue-400 text-xs font-bold uppercase tracking-wider">NOSSAS ESPECIALIDADES</span>
        <h2 class="text-2xl sm:text-4xl font-black text-white mt-2">Soluções Corporativas Sob Medida</h2>
      </div>
      <div id="instServicesGrid" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
    </section>

    <!-- Formulário de Proposta B2B -->
    <section id="proposta" class="py-20 px-4 max-w-4xl mx-auto">
      <div class="glass-card p-8 sm:p-12 rounded-3xl border border-blue-500/40 shadow-2xl">
        <div class="text-center mb-8">
          <h2 class="text-2xl sm:text-3xl font-black text-white">Solicite uma Proposta Comercial</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-2">Nossa equipe executiva entrará em contato em até 24 horas úteis.</p>
        </div>
        <form id="b2bProposalForm" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Seu Nome *</label>
              <input type="text" id="b2bName" required placeholder="Ex: Roberto Silva" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Empresa *</label>
              <input type="text" id="b2bCompany" required placeholder="Ex: Horizon Tech" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">WhatsApp / Telefone *</label>
              <input type="tel" id="b2bPhone" required placeholder="(11) 99999-9999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Resumo da Necessidade / Escopo</label>
            <textarea id="b2bNeed" rows="2" placeholder="Conte brevemente sobre o que sua empresa precisa..." class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"></textarea>
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

    <div id="faqListContainer" class="space-y-3"></div>
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

      // Controle de visibilidade de Demonstração (Apenas na rota /pacote da RMTI via HTTP/HTTPS ou com ?demo=true)
      const isHttpDemoRoute = window.location.protocol.startsWith('http') &&
        (window.location.pathname === '/pacote' || window.location.pathname.startsWith('/pacote/'));
      const isDemo = Boolean(
        cfg.isDemo === true ||
        isHttpDemoRoute ||
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
          <input type="password" id="loginPassword" required placeholder="Digite sua senha de acesso" class="w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
          <p id="defaultPassHint" class="text-[11px] text-slate-500 mt-1">Primeiro acesso? Senha inicial: <strong class="text-slate-400">123456</strong></p>
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
          <button id="btnOpenChangePass" type="button" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1" title="Alterar Senha do Painel">
            <span>🔐 Alterar Senha</span>
          </button>
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

        <!-- ABA 2: TEXTOS ESPECÍFICOS (100% DA PÁGINA EDITÁVEL) -->
        <div id="tab-textos" class="tab-content hidden space-y-6">
          <h3 class="text-base font-bold text-white border-b border-slate-800 pb-3">Textos, Seções e Oferta do Modelo Ativo</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Barra Superior de Aviso / Urgência</label>
              <input type="text" id="cfg_topBar" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Selo / Badge Acima da Headline</label>
              <input type="text" id="cfg_badge" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
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

          <!-- =============================================================== -->
          <!-- CAMPOS EXCLUSIVOS DO MODELO 01: VENDAS DIRETAS & VSL -->
          <!-- =============================================================== -->
          <div id="vendasPriceFields" class="pt-6 border-t border-slate-800 space-y-6">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Vídeo VSL, Oferta &amp; Garantia (Modelo 01)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">URL do Vídeo de Vendas (YouTube ou Vimeo - Opcional)</label>
                <input type="text" id="cfg_vendas_videoUrl" placeholder="Ex: https://www.youtube.com/watch?v=... (vazio usa o Banner)" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Nome da Oferta / Produto</label>
                <input type="text" id="cfg_vendas_productName" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
            </div>
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Dias de Garantia</label>
                <input type="text" id="cfg_vendas_guaranteeDays" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-bold text-slate-300 mb-1.5">Texto da Garantia</label>
                <input type="text" id="cfg_vendas_guaranteeText" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              </div>
            </div>

            <!-- 4 Módulos do Modelo 01 -->
            <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Módulos / Pilares do Produto (4 Blocos)</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <input type="text" id="cfg_mod_0_title" placeholder="Título do Módulo 01" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  <textarea id="cfg_mod_0_desc" rows="2" placeholder="Descrição do Módulo 01" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"></textarea>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <input type="text" id="cfg_mod_1_title" placeholder="Título do Módulo 02" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  <textarea id="cfg_mod_1_desc" rows="2" placeholder="Descrição do Módulo 02" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"></textarea>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <input type="text" id="cfg_mod_2_title" placeholder="Título do Módulo 03" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  <textarea id="cfg_mod_2_desc" rows="2" placeholder="Descrição do Módulo 03" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"></textarea>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <input type="text" id="cfg_mod_3_title" placeholder="Título do Módulo 04" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  <textarea id="cfg_mod_3_desc" rows="2" placeholder="Descrição do Módulo 04" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"></textarea>
                </div>
              </div>
            </div>

            <!-- 3 Bônus do Modelo 01 -->
            <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h5 class="text-xs font-bold text-amber-400 uppercase tracking-wider">Bônus Exclusivos (3 Cards)</h5>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <input type="text" id="cfg_bon_0_title" placeholder="Título do Bônus 1" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  <input type="text" id="cfg_bon_0_val" placeholder="Valor (Ex: R$ 197)" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-400">
                  <textarea id="cfg_bon_0_desc" rows="2" placeholder="Descrição do Bônus 1" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"></textarea>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <input type="text" id="cfg_bon_1_title" placeholder="Título do Bônus 2" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  <input type="text" id="cfg_bon_1_val" placeholder="Valor (Ex: R$ 147)" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-400">
                  <textarea id="cfg_bon_1_desc" rows="2" placeholder="Descrição do Bônus 2" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"></textarea>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <input type="text" id="cfg_bon_2_title" placeholder="Título do Bônus 3" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                  <input type="text" id="cfg_bon_2_val" placeholder="Valor (Ex: R$ 297)" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-400">
                  <textarea id="cfg_bon_2_desc" rows="2" placeholder="Descrição do Bônus 3" class="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================================== -->
          <!-- CAMPOS EXCLUSIVOS DO MODELO 02: ESPECIALISTA & WHATSAPP VIP -->
          <!-- =============================================================== -->
          <div id="leadsExtraFields" class="hidden pt-6 border-t border-slate-800 space-y-6">
            <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">Credenciais &amp; Planos de Atendimento (Modelo 02)</h4>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Registro Profissional / Especialidade (Ex: CRM, OAB, CREFITO, Consultor)</label>
              <input type="text" id="cfg_leads_professionalTitle" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <span class="text-[10px] font-bold text-sky-400 uppercase">Plano / Modalidade 01</span>
                <input type="text" id="cfg_plan_0_name" placeholder="Nome do Plano 1" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <input type="text" id="cfg_plan_0_price" placeholder="Valor ou Sob Consulta" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-emerald-400">
                <input type="text" id="cfg_plan_0_period" placeholder="Subtítulo (Ex: Sessão Única)" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300">
                <textarea id="cfg_plan_0_features" rows="3" placeholder="Benefícios separados por vírgula" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
              <div class="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/40 space-y-2.5">
                <span class="text-[10px] font-bold text-emerald-400 uppercase">Plano 02 (Destaque Principal)</span>
                <input type="text" id="cfg_plan_1_name" placeholder="Nome do Plano 2" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <input type="text" id="cfg_plan_1_price" placeholder="Valor ou Mais Procurado" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-emerald-400">
                <input type="text" id="cfg_plan_1_period" placeholder="Subtítulo (Ex: Acompanhamento)" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300">
                <textarea id="cfg_plan_1_features" rows="3" placeholder="Benefícios separados por vírgula" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
              <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <span class="text-[10px] font-bold text-sky-400 uppercase">Plano / Modalidade 03</span>
                <input type="text" id="cfg_plan_2_name" placeholder="Nome do Plano 3" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <input type="text" id="cfg_plan_2_price" placeholder="Valor ou Sob Medida" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-emerald-400">
                <input type="text" id="cfg_plan_2_period" placeholder="Subtítulo (Ex: Corporativo)" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300">
                <textarea id="cfg_plan_2_features" rows="3" placeholder="Benefícios separados por vírgula" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
            </div>
          </div>

          <!-- =============================================================== -->
          <!-- CAMPOS EXCLUSIVOS DO MODELO 03: INSTITUCIONAL & B2B -->
          <!-- =============================================================== -->
          <div id="instExtraFields" class="hidden pt-6 border-t border-slate-800 space-y-6">
            <h4 class="text-xs font-bold text-blue-400 uppercase tracking-wider">Métricas de Autoridade &amp; Soluções Corporativas (Modelo 03)</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_stat_0_num" placeholder="Ex: +500" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-emerald-400">
                <input type="text" id="cfg_stat_0_lbl" placeholder="Projetos Entregues" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white">
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_stat_1_num" placeholder="Ex: 98%" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-emerald-400">
                <input type="text" id="cfg_stat_1_lbl" placeholder="Índice de Satisfação" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white">
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_stat_2_num" placeholder="Ex: 10+ Anos" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-emerald-400">
                <input type="text" id="cfg_stat_2_lbl" placeholder="Experiência de Mercado" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white">
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_stat_3_num" placeholder="Ex: 24/7" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-emerald-400">
                <input type="text" id="cfg_stat_3_lbl" placeholder="Suporte Dedicado" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_srv_0_title" placeholder="Título do Serviço 01" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <textarea id="cfg_srv_0_desc" rows="2" placeholder="Descrição do Serviço 01" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_srv_1_title" placeholder="Título do Serviço 02" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <textarea id="cfg_srv_1_desc" rows="2" placeholder="Descrição do Serviço 02" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_srv_2_title" placeholder="Título do Serviço 03" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <textarea id="cfg_srv_2_desc" rows="2" placeholder="Descrição do Serviço 03" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_srv_3_title" placeholder="Título do Serviço 04" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <textarea id="cfg_srv_3_desc" rows="2" placeholder="Descrição do Serviço 04" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
            </div>
          </div>

          <!-- =============================================================== -->
          <!-- PERGUNTAS FREQUENTES (FAQ COMPARTILHADO NOS 3 MODELOS) -->
          <!-- =============================================================== -->
          <div class="pt-6 border-t border-slate-800 space-y-4">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Perguntas Frequentes (FAQ da Página)</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_faq_0_q" placeholder="Pergunta 1" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <textarea id="cfg_faq_0_a" rows="3" placeholder="Resposta 1" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_faq_1_q" placeholder="Pergunta 2" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <textarea id="cfg_faq_1_a" rows="3" placeholder="Resposta 2" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <input type="text" id="cfg_faq_2_q" placeholder="Pergunta 3" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white">
                <textarea id="cfg_faq_2_a" rows="3" placeholder="Resposta 3" class="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300"></textarea>
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

  function simpleHash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return 'h_' + h.toString(16);
  }

  function isPasswordConfigured() {
    return Boolean(
      localStorage.getItem(FIRST_LOGIN_KEY) === 'true' ||
      localStorage.getItem(PASSWORD_KEY) ||
      currentConfig.customAdminPassHash
    );
  }

  function verifyAdminPassword(inputPass) {
    const localPass = localStorage.getItem(PASSWORD_KEY);
    if (localPass) return inputPass === localPass;
    if (currentConfig.customAdminPassHash) {
      return simpleHash(inputPass) === currentConfig.customAdminPassHash;
    }
    return inputPass === '123456';
  }

  // Oculta a dica "123456" da tela de login assim que o cliente tiver definido sua própria senha
  const defaultPassHint = document.getElementById('defaultPassHint');
  if (defaultPassHint && isPasswordConfigured()) {
    defaultPassHint.classList.add('hidden');
  }

  // Sessão
  if (sessionStorage.getItem('LP_ADMIN_LOGGED') === 'true') {
    showPanel();
  }

  // Login
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('loginPassword').value.trim();

    if (verifyAdminPassword(pass)) {
      if (!isPasswordConfigured()) {
        modalFirstAccess.classList.remove('hidden');
      } else {
        sessionStorage.setItem('LP_ADMIN_LOGGED', 'true');
        showPanel();
      }
    } else {
      alert('Senha incorreta! Verifique sua senha de acesso.');
    }
  });

  // Troca de Senha
  document.getElementById('formChangePass').addEventListener('submit', (e) => {
    e.preventDefault();
    const cur = document.getElementById('curPass').value.trim();
    const n1 = document.getElementById('newPass').value.trim();
    const n2 = document.getElementById('confirmPass').value.trim();

    if (!verifyAdminPassword(cur)) return alert('A senha atual está incorreta.');
    if (n1.length < 4) return alert('A nova senha deve ter ao menos 4 caracteres.');
    if (n1 === '123456') return alert('Por segurança, escolha uma senha diferente de 123456.');
    if (n1 !== n2) return alert('As senhas digitadas não coincidem.');

    localStorage.setItem(PASSWORD_KEY, n1);
    localStorage.setItem(FIRST_LOGIN_KEY, 'true');
    currentConfig.customAdminPassHash = simpleHash(n1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
    if (defaultPassHint) defaultPassHint.classList.add('hidden');

    modalFirstAccess.classList.add('hidden');
    sessionStorage.setItem('LP_ADMIN_LOGGED', 'true');
    alert('Senha pessoal cadastrada e protegida com sucesso!');
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

    // FAQs compartilhadas
    const faqs = Array.isArray(cfg.faqs) ? cfg.faqs : [];
    for (let idx = 0; idx < 3; idx++) {
      setVal('cfg_faq_' + idx + '_q', faqs[idx] ? faqs[idx].q : '');
      setVal('cfg_faq_' + idx + '_a', faqs[idx] ? faqs[idx].a : '');
    }

    loadLayoutSpecificFields(active);
  }

  // Botão para abrir modal de troca de senha a qualquer momento
  const btnOpenChangePass = document.getElementById('btnOpenChangePass');
  if (btnOpenChangePass) {
    btnOpenChangePass.addEventListener('click', () => {
      modalFirstAccess.classList.remove('hidden');
    });
  }

  function loadLayoutSpecificFields(layout) {
    const cfg = currentConfig;
    const priceFields = document.getElementById('vendasPriceFields');
    const leadsFields = document.getElementById('leadsExtraFields');
    const instFields = document.getElementById('instExtraFields');

    if (priceFields) priceFields.classList.add('hidden');
    if (leadsFields) leadsFields.classList.add('hidden');
    if (instFields) instFields.classList.add('hidden');

    if (layout === 'vendas-diretas') {
      const v = cfg.vendas || {};
      setVal('cfg_topBar', v.topBar);
      setVal('cfg_badge', v.badge);
      setVal('cfg_headline', v.headline);
      setVal('cfg_subheadline', v.subheadline);
      setVal('cfg_ctaButton', v.ctaButton);
      setVal('cfg_ctaSubtext', v.ctaSubtext);
      setVal('cfg_vendas_videoUrl', v.videoUrl || '');
      setVal('cfg_vendas_productName', v.productName || '');
      setVal('cfg_vendas_originalPrice', v.originalPrice);
      setVal('cfg_vendas_salePrice', v.salePrice);
      setVal('cfg_vendas_installments', v.installments);
      setVal('cfg_vendas_guaranteeDays', v.guaranteeDays || '7');
      setVal('cfg_vendas_guaranteeText', v.guaranteeText || '');

      const mods = Array.isArray(v.modules) ? v.modules : [];
      for (let m = 0; m < 4; m++) {
        setVal('cfg_mod_' + m + '_title', mods[m] ? mods[m].title : '');
        setVal('cfg_mod_' + m + '_desc', mods[m] ? mods[m].desc : '');
      }
      const bons = Array.isArray(v.bonuses) ? v.bonuses : [];
      for (let b = 0; b < 3; b++) {
        setVal('cfg_bon_' + b + '_title', bons[b] ? bons[b].title : '');
        setVal('cfg_bon_' + b + '_val', bons[b] ? bons[b].value : '');
        setVal('cfg_bon_' + b + '_desc', bons[b] ? bons[b].desc : '');
      }
      if (priceFields) priceFields.classList.remove('hidden');
    } else if (layout === 'leads-whatsapp') {
      const l = cfg.leads || {};
      setVal('cfg_topBar', l.topBar);
      setVal('cfg_badge', l.badge);
      setVal('cfg_headline', l.headline);
      setVal('cfg_subheadline', l.subheadline);
      setVal('cfg_ctaButton', l.ctaButton);
      setVal('cfg_ctaSubtext', l.ctaSubtext);
      setVal('cfg_leads_professionalTitle', l.professionalTitle || '');

      const plans = Array.isArray(l.plans) ? l.plans : [];
      for (let p = 0; p < 3; p++) {
        setVal('cfg_plan_' + p + '_name', plans[p] ? plans[p].name : '');
        setVal('cfg_plan_' + p + '_price', plans[p] ? plans[p].price : '');
        setVal('cfg_plan_' + p + '_period', plans[p] ? plans[p].period : '');
        setVal('cfg_plan_' + p + '_features', plans[p] && Array.isArray(plans[p].features) ? plans[p].features.join(', ') : '');
      }
      if (leadsFields) leadsFields.classList.remove('hidden');
    } else {
      const i = cfg.institucional || {};
      setVal('cfg_topBar', i.topBar);
      setVal('cfg_badge', i.badge);
      setVal('cfg_headline', i.headline);
      setVal('cfg_subheadline', i.subheadline);
      setVal('cfg_ctaButton', i.ctaButton);
      setVal('cfg_ctaSubtext', i.ctaSubtext);

      const stats = Array.isArray(i.stats) ? i.stats : [];
      for (let s = 0; s < 4; s++) {
        setVal('cfg_stat_' + s + '_num', stats[s] ? stats[s].num : '');
        setVal('cfg_stat_' + s + '_lbl', stats[s] ? stats[s].label : '');
      }
      const srvs = Array.isArray(i.services) ? i.services : [];
      for (let sv = 0; sv < 4; sv++) {
        setVal('cfg_srv_' + sv + '_title', srvs[sv] ? srvs[sv].title : '');
        setVal('cfg_srv_' + sv + '_desc', srvs[sv] ? srvs[sv].desc : '');
      }
      if (instFields) instFields.classList.remove('hidden');
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

  function collectFormIntoConfig() {
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

    // Salvar FAQs
    currentConfig.faqs = [0, 1, 2].map(idx => ({
      q: getVal('cfg_faq_' + idx + '_q'),
      a: getVal('cfg_faq_' + idx + '_a')
    })).filter(f => f.q || f.a);

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
      currentConfig.vendas.badge = getVal('cfg_badge');
      currentConfig.vendas.headline = getVal('cfg_headline');
      currentConfig.vendas.subheadline = getVal('cfg_subheadline');
      currentConfig.vendas.ctaButton = getVal('cfg_ctaButton');
      currentConfig.vendas.ctaSubtext = getVal('cfg_ctaSubtext');
      currentConfig.vendas.videoUrl = getVal('cfg_vendas_videoUrl');
      currentConfig.vendas.productName = getVal('cfg_vendas_productName');
      currentConfig.vendas.originalPrice = getVal('cfg_vendas_originalPrice');
      currentConfig.vendas.salePrice = getVal('cfg_vendas_salePrice');
      currentConfig.vendas.installments = getVal('cfg_vendas_installments');
      currentConfig.vendas.guaranteeDays = getVal('cfg_vendas_guaranteeDays');
      currentConfig.vendas.guaranteeText = getVal('cfg_vendas_guaranteeText');
      currentConfig.vendas.modules = [0, 1, 2, 3].map(m => ({
        title: getVal('cfg_mod_' + m + '_title'),
        desc: getVal('cfg_mod_' + m + '_desc')
      })).filter(m => m.title || m.desc);
      currentConfig.vendas.bonuses = [0, 1, 2].map(b => ({
        title: getVal('cfg_bon_' + b + '_title'),
        value: getVal('cfg_bon_' + b + '_val'),
        desc: getVal('cfg_bon_' + b + '_desc')
      })).filter(b => b.title || b.desc);
    } else if (active === 'leads-whatsapp') {
      if (!currentConfig.leads) currentConfig.leads = {};
      currentConfig.leads.topBar = getVal('cfg_topBar');
      currentConfig.leads.badge = getVal('cfg_badge');
      currentConfig.leads.headline = getVal('cfg_headline');
      currentConfig.leads.subheadline = getVal('cfg_subheadline');
      currentConfig.leads.ctaButton = getVal('cfg_ctaButton');
      currentConfig.leads.ctaSubtext = getVal('cfg_ctaSubtext');
      currentConfig.leads.professionalTitle = getVal('cfg_leads_professionalTitle');
      currentConfig.leads.plans = [0, 1, 2].map(p => ({
        name: getVal('cfg_plan_' + p + '_name'),
        price: getVal('cfg_plan_' + p + '_price'),
        period: getVal('cfg_plan_' + p + '_period'),
        featured: p === 1,
        features: getVal('cfg_plan_' + p + '_features').split(',').map(s => s.trim()).filter(Boolean)
      })).filter(p => p.name);
    } else {
      if (!currentConfig.institucional) currentConfig.institucional = {};
      currentConfig.institucional.topBar = getVal('cfg_topBar');
      currentConfig.institucional.badge = getVal('cfg_badge');
      currentConfig.institucional.headline = getVal('cfg_headline');
      currentConfig.institucional.subheadline = getVal('cfg_subheadline');
      currentConfig.institucional.ctaButton = getVal('cfg_ctaButton');
      currentConfig.institucional.ctaSubtext = getVal('cfg_ctaSubtext');
      currentConfig.institucional.stats = [0, 1, 2, 3].map(s => ({
        num: getVal('cfg_stat_' + s + '_num'),
        label: getVal('cfg_stat_' + s + '_lbl')
      })).filter(s => s.num || s.label);
      currentConfig.institucional.services = [0, 1, 2, 3].map(sv => ({
        title: getVal('cfg_srv_' + sv + '_title'),
        desc: getVal('cfg_srv_' + sv + '_desc')
      })).filter(sv => sv.title || sv.desc);
    }
  }

  // Salvar no localStorage
  document.getElementById('btnSaveConfig').addEventListener('click', () => {
    collectFormIntoConfig();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
    window.PAGE_CONFIG = currentConfig;

    const toast = document.getElementById('saveToast');
    toast.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3000);
  });

  // Baixar config.js permanente (já salva antes e garante isDemo = false + suporte localStorage)
  document.getElementById('btnDownloadConfig').addEventListener('click', () => {
    collectFormIntoConfig();
    const exportCfg = JSON.parse(JSON.stringify(currentConfig));
    exportCfg.isDemo = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exportCfg));

    const content = '/**\\n * Arquivo gerado pelo Painel Admin • Pacote All-in-One RMTI\\n * Substitua este arquivo na pasta /js/config.js antes de publicar na hospedagem.\\n */\\nconst DEFAULT_CONFIG = ' + JSON.stringify(exportCfg, null, 2) + ';\\n\\n(function() {\\n  const saved = localStorage.getItem(\\'' + STORAGE_KEY + '\\');\\n  if (saved) {\\n    try {\\n      window.PAGE_CONFIG = Object.assign({}, DEFAULT_CONFIG, JSON.parse(saved));\\n    } catch (e) {\\n      window.PAGE_CONFIG = DEFAULT_CONFIG;\\n    }\\n  } else {\\n    window.PAGE_CONFIG = DEFAULT_CONFIG;\\n  }\\n})();\\n';
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
const manualHtmlPath = path.join(__dirname, 'templates/MANUAL-ILUSTRADO.html');
const manualHtml = fs.readFileSync(manualHtmlPath, 'utf8');
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
const readmePath = path.join(__dirname, 'templates/README-PACOTE.md');
const readmeMd = fs.readFileSync(readmePath, 'utf8');
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
