const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PACKAGES, BASE_DIR, PLACEHOLDERS_DIR } = require('./build-packages');

console.log('Iniciando montagem dos 3 Pacotes de Landing Pages por Estrutura...');

// Utilitário para copiar arquivos se existirem
function copyFileSafe(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

// =============================================================================
// 1. GERAR PACOTE 01: VENDAS DIRETAS & CHECKOUT
// =============================================================================
function generatePackage01(pkg) {
  const pkgDir = path.join(BASE_DIR, pkg.id);
  if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true });

  // Criar pastas
  ['admin', 'css', 'js', 'assets/imagens'].forEach(folder => {
    fs.mkdirSync(path.join(pkgDir, folder), { recursive: true });
  });

  // Copiar placeholders
  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'logo-placeholder.png'), path.join(pkgDir, 'assets/imagens/logo-placeholder.png'));
  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'banner-placeholder.jpg'), path.join(pkgDir, 'assets/imagens/banner-placeholder.jpg'));
  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'mockup-placeholder.jpg'), path.join(pkgDir, 'assets/imagens/mockup-placeholder.jpg'));
  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'foto-placeholder.jpg'), path.join(pkgDir, 'assets/imagens/foto-placeholder.jpg'));

  // 1. config.js
  const configJs = `/**
 * Configuração Padrão do Pacote 01: Vendas Diretas & Checkout
 * Este arquivo pode ser editado manualmente ou gerenciado pelo Painel Admin (/admin).
 */
const DEFAULT_CONFIG = ${JSON.stringify(pkg.defaultConfig, null, 2)};

// Carrega alterações salvas no navegador (se houver), ou utiliza os padrões
window.PAGE_CONFIG = (function() {
  try {
    const saved = localStorage.getItem('${pkg.id}_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
})();
`;
  fs.writeFileSync(path.join(pkgDir, 'js/config.js'), configJs);

  // 2. css/style.css
  const styleCss = `/* ==========================================================================
   Estilos Personalizados • Pacote 01: Vendas Diretas
   ========================================================================== */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

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
`;
  fs.writeFileSync(path.join(pkgDir, 'css/style.css'), styleCss);

  // 3. js/app.js
  const appJs = `/**
 * Comportamento Dinâmico da Página • Pacote 01: Vendas Diretas
 */
document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.PAGE_CONFIG || {};

  // Atualizar textos dinâmicos que possuam data-bind
  document.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.getAttribute('data-bind');
    if (cfg[key] !== undefined && cfg[key] !== '') {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = cfg[key];
      } else if (el.tagName === 'IMG') {
        el.src = cfg[key];
      } else if (el.tagName === 'A' && key.toLowerCase().includes('url')) {
        el.href = cfg[key];
      } else {
        el.textContent = cfg[key];
      }
    }
  });

  // Interatividade do FAQ (Accordion)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (btn && answer) {
      btn.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');
        document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

        if (!isOpen) {
          answer.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });

  // Atualizar link do WhatsApp
  if (cfg.whatsapp) {
    const cleanNum = cfg.whatsapp.replace(/\\D/g, '');
    const msg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site.');
    document.querySelectorAll('.whatsapp-link').forEach(a => {
      a.href = \`https://wa.me/\${cleanNum}?text=\${msg}\`;
    });
  }

  // Integrar Meta Pixel se configurado
  if (cfg.metaPixelId && cfg.metaPixelId.trim() !== '') {
    console.log('Injetando Meta Pixel:', cfg.metaPixelId);
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
  fs.writeFileSync(path.join(pkgDir, 'js/app.js'), appJs);

  // 4. index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-bind="businessName">Seu Produto ou Infoproduto • Método Completo</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
  <script src="js/app.js" defer></script>
</head>
<body class="bg-[#080c14] text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-slate-950">

  <!-- BARRA DE DEMONSTRAÇÃO FLUTUANTE (REMOVÍVEL APÓS A COMPRA) -->
  <div class="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-emerald-500/30 py-2.5 px-4 sticky top-0 z-50 text-xs shadow-xl">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          PACOTE 01 • DEMONSTRAÇÃO ATIVA
        </span>
        <span class="text-slate-400 hidden sm:inline">Estrutura de Vendas Diretas &amp; Checkout</span>
      </div>
      <div class="flex items-center gap-2">
        <a href="admin/index.html" class="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold transition-all border border-emerald-500/40 flex items-center gap-1">
          <span>⚙️ Abrir Painel Admin</span>
        </a>
        <a href="checkout.html" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all border border-slate-700 flex items-center gap-1">
          <span>💳 Ver Checkout</span>
        </a>
        <a href="/checkout?plano=pro&produto=combo-5em1" class="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-all shadow-md">
          <span>Comprar Este Pacote (R$ 97)</span>
        </a>
      </div>
    </div>
  </div>

  <!-- AVISO SUPERIOR DE URGÊNCIA -->
  <div class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 py-2 text-center text-slate-950 text-xs sm:text-sm font-black tracking-wider uppercase">
    <span data-bind="topBarText">⚡ OFERTA ESPECIAL COM DESCONTO EXCLUSIVO POR TEMPO LIMITADO</span>
  </div>

  <!-- CABEÇALHO / LOGO -->
  <header class="py-6 px-4 sm:px-8 max-w-6xl mx-auto flex items-center justify-between">
    <div class="flex items-center gap-3">
      <img src="assets/imagens/logo-placeholder.png" alt="Sua Logo Aqui" class="h-10 sm:h-12 w-auto object-contain" data-bind="logoUrl">
    </div>
    <div class="flex items-center gap-3">
      <a href="#comprar" class="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition-all">
        Ver Oferta
      </a>
      <a href="checkout.html" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20">
        Inscrição Imediata
      </a>
    </div>
  </header>

  <!-- ========================================================================= -->
  <!-- SEÇÃO HERO: HEADLINE + VÍDEO / MOCKUP + CTA -->
  <!-- ========================================================================= -->
  <section class="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
    <!-- Tag -->
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-6">
      <span>🔥 MÉTODO 100% PRÁTICO &amp; VALIDADO</span>
    </div>

    <!-- Headline Principal -->
    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6 max-w-4xl" data-bind="headline">
      Descubra Como [Alcançar Grande Desejo] Sem [Principal Objeção ou Dor]
    </h1>

    <!-- Subheadline -->
    <p class="text-slate-300 text-base sm:text-xl font-normal leading-relaxed max-w-3xl mb-10" data-bind="subheadline">
      O passo a passo validado para dominar [sua habilidade] em tempo recorde, mesmo começando do absoluto zero.
    </p>

    <!-- MOCKUP OU VÍDEO PLACEHOLDER -->
    <div class="w-full max-w-3xl rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/10 mb-10 relative group bg-slate-900">
      <div class="aspect-video relative flex items-center justify-center">
        <img src="assets/imagens/banner-placeholder.jpg" alt="Seu Banner ou Vídeo Aqui" class="w-full h-full object-cover" data-bind="bannerUrl">
        <!-- Botão Play Flutuante -->
        <a href="#comprar" class="absolute w-20 h-20 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center text-3xl shadow-2xl group-hover:scale-110 transition-transform">
          ▶
        </a>
      </div>
    </div>

    <!-- BOTÃO CTA PRINCIPAL -->
    <div class="flex flex-col items-center gap-3 w-full max-w-md">
      <a href="#comprar" class="pulse-btn w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all">
        <span data-bind="ctaButtonText">QUERO GARANTIR MEU ACESSO AGORA</span>
      </a>
      <span class="text-xs text-slate-400 flex items-center gap-1.5" data-bind="ctaSubtext">
        🔒 Pagamento 100% Seguro • Acesso Imediato
      </span>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- BENEFÍCIOS & MÓDULOS (O QUE VOCÊ VAI RECEBER) -->
  <!-- ========================================================================= -->
  <section class="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800">
    <div class="text-center mb-12">
      <span class="text-emerald-400 text-xs font-bold uppercase tracking-wider">CONTEÚDO PROGRAMÁTICO</span>
      <h2 class="text-2xl sm:text-4xl font-black text-white mt-2">O Que Você Vai Aprender Passo a Passo</h2>
      <p class="text-slate-400 text-sm sm:text-base mt-2">Aulas organizadas em uma trilha lógica para você sair com o método pronto.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 glass-card-hover">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black mb-4">01</div>
        <h3 class="text-lg sm:text-xl font-bold text-white mb-2">Módulo 01: Fundamentos &amp; Mentalidade</h3>
        <p class="text-slate-300 text-sm leading-relaxed">A base sólida para começar da forma correta e sem perder tempo com erros comuns que atrasam o resultado.</p>
      </div>

      <div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 glass-card-hover">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black mb-4">02</div>
        <h3 class="text-lg sm:text-xl font-bold text-white mb-2">Módulo 02: O Método na Prática</h3>
        <p class="text-slate-300 text-sm leading-relaxed">Passo a passo detalhado, tela por tela, para você aplicar e ver os primeiros resultados na primeira semana.</p>
      </div>

      <div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 glass-card-hover">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black mb-4">03</div>
        <h3 class="text-lg sm:text-xl font-bold text-white mb-2">Módulo 03: Estratégias de Escala</h3>
        <p class="text-slate-300 text-sm leading-relaxed">Como multiplicar seus ganhos e criar uma rotina previsível, organizada e altamente lucrativa.</p>
      </div>

      <div class="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 glass-card-hover">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black mb-4">04</div>
        <h3 class="text-lg sm:text-xl font-bold text-white mb-2">Módulo 04: Ferramentas &amp; Modelos Prontos</h3>
        <p class="text-slate-300 text-sm leading-relaxed">Templates, planilhas e roteiros prontos para você copiar, colar e executar hoje mesmo sem perder tempo.</p>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- SEÇÃO DE BÔNUS EXCLUSIVOS -->
  <!-- ========================================================================= -->
  <section class="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800">
    <div class="text-center mb-12">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-black uppercase tracking-wider">
        🎁 PRESENTES EXCLUSIVOS PARA ESTA TURMA
      </span>
      <h2 class="text-2xl sm:text-4xl font-black text-white mt-3">Você Ainda Leva 3 Bônus Especiais</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 rounded-2xl border border-amber-400/20">
        <span class="text-xs font-black text-amber-400 uppercase tracking-wider">BÔNUS #1</span>
        <h3 class="text-lg font-bold text-white mt-1">Comunidade Exclusiva</h3>
        <p class="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">Networking de alto nível com outros membros e suporte diário para tirar dúvidas.</p>
        <div class="mt-4 text-xs text-slate-400">Valor separado: <span class="line-through text-slate-500">R$ 197</span> → <span class="text-emerald-400 font-bold">GRÁTIS</span></div>
      </div>

      <div class="glass-card p-6 rounded-2xl border border-amber-400/20">
        <span class="text-xs font-black text-amber-400 uppercase tracking-wider">BÔNUS #2</span>
        <h3 class="text-lg font-bold text-white mt-1">Pack de Templates Prontos</h3>
        <p class="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">Arquivos 100% editáveis para acelerar sua implementação e poupar semanas de trabalho.</p>
        <div class="mt-4 text-xs text-slate-400">Valor separado: <span class="line-through text-slate-500">R$ 147</span> → <span class="text-emerald-400 font-bold">GRÁTIS</span></div>
      </div>

      <div class="glass-card p-6 rounded-2xl border border-amber-400/20">
        <span class="text-xs font-black text-amber-400 uppercase tracking-wider">BÔNUS #3</span>
        <h3 class="text-lg font-bold text-white mt-1">Aula Secreta de Tráfego</h3>
        <p class="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">Como atrair visitantes qualificados gastando pouco em anúncios nas redes sociais.</p>
        <div class="mt-4 text-xs text-slate-400">Valor separado: <span class="line-through text-slate-500">R$ 297</span> → <span class="text-emerald-400 font-bold">GRÁTIS</span></div>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- SEÇÃO DE OFERTA & PREÇO (DIRETO AO CHECKOUT) -->
  <!-- ========================================================================= -->
  <section id="comprar" class="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center border-t border-slate-800 scroll-mt-20">
    <div class="rounded-3xl p-8 sm:p-12 pt-10 sm:pt-14 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-2xl shadow-emerald-500/10 relative">
      <!-- Tag de Destaque -->
      <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase px-6 py-1.5 rounded-full tracking-wider shadow-xl whitespace-nowrap z-20">
        🔥 OFERTA POR TEMPO LIMITADO
      </div>

      <h2 class="text-2xl sm:text-4xl font-black text-white mt-2" data-bind="productName">
        Acesso Completo ao [Nome do Seu Produto]
      </h2>
      <p class="text-sm text-slate-400 mt-2 mb-6">Receba acesso imediato a todas as aulas + os 3 bônus exclusivos.</p>

      <!-- Preço -->
      <div class="py-6 border-y border-slate-800 my-6 space-y-2">
        <div class="text-sm text-slate-400 line-through">De <span data-bind="originalPrice">R$ 297,00</span> por apenas:</div>
        <div class="text-4xl sm:text-6xl font-black text-white tracking-tight" data-bind="installments">
          12x de R$ 9,74
        </div>
        <div class="text-xs text-emerald-400 font-semibold">ou <span data-bind="salePrice">R$ 97,00</span> à vista com desconto</div>
      </div>

      <!-- Botão para o Checkout -->
      <a href="checkout.html" class="pulse-btn w-full py-5 px-8 rounded-2xl text-base sm:text-lg font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center justify-center gap-2 shadow-2xl uppercase tracking-wider">
        <span>SIM! QUERO ME INSCREVER AGORA</span>
        <span>→</span>
      </a>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <span>💳 Cartão de Crédito em até 12x</span>
        <span>💠 Pix Imediato</span>
        <span>🛡️ 7 Dias de Garantia</span>
      </div>
    </div>

    <!-- Garantia Blindada -->
    <div class="mt-8 p-6 rounded-2xl glass-card border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-left">
      <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-3xl">
        🛡️
      </div>
      <div>
        <h4 class="text-base font-bold text-white" data-bind="guaranteeTitle">Garantia Incondicional de 7 Dias</h4>
        <p class="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed" data-bind="guaranteeText">
          Você tem 7 dias para testar tudo. Se por qualquer motivo achar que não valeu a pena, basta nos enviar um e-mail e devolvemos 100% do seu dinheiro, sem perguntas.
        </p>
      </div>
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- FAQ / PERGUNTAS FREQUENTES -->
  <!-- ========================================================================= -->
  <section class="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-slate-800">
    <div class="text-center mb-10">
      <h2 class="text-2xl sm:text-3xl font-black text-white">Dúvidas Frequentes</h2>
      <p class="text-slate-400 text-sm mt-1">Clique para ver as respostas para as perguntas mais comuns.</p>
    </div>

    <div class="space-y-3">
      <div class="faq-item glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <button class="faq-question w-full p-5 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-emerald-400 transition-colors">
          <span>Como recebo o meu acesso?</span>
          <span class="faq-icon text-slate-400 transition-transform">▼</span>
        </button>
        <div class="faq-answer hidden px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
          O envio é imediato após a confirmação do pagamento. Você receberá um e-mail com seus dados de login e link de acesso à plataforma.
        </div>
      </div>

      <div class="faq-item glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <button class="faq-question w-full p-5 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-emerald-400 transition-colors">
          <span>Por quanto tempo terei acesso ao conteúdo?</span>
          <span class="faq-icon text-slate-400 transition-transform">▼</span>
        </button>
        <div class="faq-answer hidden px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
          Você terá acesso completo por 1 ano inteiro, incluindo todas as atualizações e novos materiais adicionados à plataforma.
        </div>
      </div>

      <div class="faq-item glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <button class="faq-question w-full p-5 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-emerald-400 transition-colors">
          <span>Funciona para quem está começando do absoluto zero?</span>
          <span class="faq-icon text-slate-400 transition-transform">▼</span>
        </button>
        <div class="faq-answer hidden px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
          Sim! O método foi estruturado desde o nível mais básico até as técnicas mais avançadas, com explicações práticas e suporte a dúvidas.
        </div>
      </div>
    </div>
  </section>

  <!-- RODAPÉ -->
  <footer class="py-10 px-4 text-center border-t border-slate-800/80 text-xs text-slate-500">
    <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        © 2026 <span data-bind="businessName">Seu Negócio</span>. Todos os direitos reservados.
      </div>
      <div class="flex items-center gap-4 text-slate-400">
        <a href="admin/index.html" class="hover:text-emerald-400 transition-colors">Acessar Painel Admin</a>
        <a href="checkout.html" class="hover:text-emerald-400 transition-colors">Página de Checkout</a>
        <a href="#" class="whatsapp-link hover:text-emerald-400 transition-colors">Suporte WhatsApp</a>
      </div>
    </div>
  </footer>

</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'index.html'), indexHtml);

  // 5. checkout.html
  const checkoutHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout Seguro • Finalizar Compra</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
</head>
<body class="bg-[#080c14] text-slate-100 min-h-screen py-8 px-4 sm:px-6">

  <div class="max-w-4xl mx-auto">
    <!-- Header Simples -->
    <header class="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
      <a href="index.html" class="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        ← Voltar para a página
      </a>
      <div class="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
        <span>🔒 Ambiente Seguro 256-bit SSL</span>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Coluna Formulário (Esquerda) -->
      <div class="lg:col-span-7 space-y-6">
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">1</span>
            <span>Dados do Comprador</span>
          </h2>
          <p class="text-xs text-slate-400 mb-6">Insira seus dados para liberação imediata do seu acesso.</p>

          <form id="checkoutForm" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Nome Completo *</label>
              <input type="text" id="custName" required placeholder="Ex: João da Silva" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">E-mail Principal *</label>
              <input type="email" id="custEmail" required placeholder="seuemail@exemplo.com" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">WhatsApp / Celular *</label>
                <input type="tel" id="custPhone" required placeholder="(11) 99999-9999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">CPF *</label>
                <input type="text" id="custCpf" required placeholder="000.000.000-00" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
              </div>
            </div>

            <!-- Método de Pagamento -->
            <div class="pt-6 border-t border-slate-800">
              <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">2</span>
                <span>Forma de Pagamento</span>
              </h3>

              <div class="grid grid-cols-2 gap-3 mb-4">
                <button type="button" id="tabPix" class="py-3 px-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                  <span>💠 Pix (Aprovação Imediata)</span>
                </button>
                <button type="button" id="tabCard" class="py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2">
                  <span>💳 Cartão de Crédito</span>
                </button>
              </div>

              <!-- Conteúdo Pix -->
              <div id="contentPix" class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                <p class="text-xs text-slate-300">Ao clicar em finalizar, o código Pix Copia e Cola e o QR Code serão gerados para você pagar em qualquer banco.</p>
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">
                  ✓ Liberação em menos de 10 segundos
                </div>
              </div>

              <!-- Conteúdo Cartão (Oculto inicialmente) -->
              <div id="contentCard" class="hidden p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Número do Cartão</label>
                  <input type="text" placeholder="0000 0000 0000 0000" class="w-full py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white outline-none">
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Validade</label>
                    <input type="text" placeholder="MM/AA" class="w-full py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white outline-none">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">CVV</label>
                    <input type="text" placeholder="123" class="w-full py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white outline-none">
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all mt-6">
              Finalizar Pagamento Seguro
            </button>
          </form>
        </div>
      </div>

      <!-- Coluna Resumo do Pedido (Direita) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="glass-card p-6 rounded-3xl border border-slate-800 shadow-xl">
          <h3 class="text-base font-bold text-white mb-4">Resumo do Pedido</h3>

          <div class="flex items-center gap-4 pb-4 border-b border-slate-800">
            <div class="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
              📦
            </div>
            <div>
              <h4 class="text-sm font-bold text-white" id="orderTitle">Acesso ao Produto</h4>
              <p class="text-xs text-slate-400">Liberação imediata no e-mail</p>
            </div>
          </div>

          <div class="py-4 space-y-2 text-xs border-b border-slate-800 text-slate-300">
            <div class="flex justify-between">
              <span>Preço Original:</span>
              <span class="line-through text-slate-500" id="orderOrigPrice">R$ 297,00</span>
            </div>
            <div class="flex justify-between text-emerald-400 font-bold">
              <span>Desconto Aplicado:</span>
              <span>- R$ 200,00</span>
            </div>
            <div class="flex justify-between pt-2 text-sm font-bold text-white border-t border-slate-800">
              <span>Total a Pagar:</span>
              <span class="text-emerald-400 text-lg font-black" id="orderPrice">R$ 97,00</span>
            </div>
          </div>

          <div class="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div class="flex items-center gap-1.5 text-emerald-400 font-bold">
              ✓ Garantia Incondicional de 7 Dias
            </div>
            <p>Se não ficar satisfeito, devolvemos 100% do seu dinheiro sem burocracia.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const cfg = window.PAGE_CONFIG || {};
      if (cfg.productName) document.getElementById('orderTitle').textContent = cfg.productName;
      if (cfg.salePrice) document.getElementById('orderPrice').textContent = cfg.salePrice;
      if (cfg.originalPrice) document.getElementById('orderOrigPrice').textContent = cfg.originalPrice;

      // Abas de Pagamento
      const tabPix = document.getElementById('tabPix');
      const tabCard = document.getElementById('tabCard');
      const contentPix = document.getElementById('contentPix');
      const contentCard = document.getElementById('contentCard');

      tabPix.addEventListener('click', () => {
        tabPix.className = 'py-3 px-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2';
        tabCard.className = 'py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2';
        contentPix.classList.remove('hidden');
        contentCard.classList.add('hidden');
      });

      tabCard.addEventListener('click', () => {
        tabCard.className = 'py-3 px-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2';
        tabPix.className = 'py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2';
        contentCard.classList.remove('hidden');
        contentPix.classList.add('hidden');
      });

      // Submit do formulário simulando conclusão e redirecionamento
      document.getElementById('checkoutForm').addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = 'obrigado.html';
      });
    });
  </script>
</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'checkout.html'), checkoutHtml);

  // 6. obrigado.html
  const obrigadoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parabéns! • Compra Confirmada</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
</head>
<body class="bg-[#080c14] text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-xl w-full glass-card p-8 sm:p-12 rounded-3xl border border-emerald-500/40 text-center shadow-2xl">
    <div class="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-4xl mx-auto mb-6 text-emerald-400">
      ✓
    </div>

    <span class="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
      PEDIDO CONFIRMADO COM SUCESSO
    </span>

    <h1 class="text-2xl sm:text-4xl font-black text-white mb-3">Parabéns Pela Decisão!</h1>
    <p class="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
      Os dados de acesso à sua área de membros foram enviados para o seu e-mail. Verifique sua caixa de entrada e spam.
    </p>

    <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3 mb-8">
      <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Próximos Passos:</h3>
      <div class="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
        <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
        <span>Acesse seu e-mail e procure pela mensagem com o assunto de boas-vindas.</span>
      </div>
      <div class="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
        <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
        <span>Defina sua senha e comece a assistir às primeiras aulas imediatamente.</span>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <a href="index.html" class="flex-1 py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
        Voltar à Página Inicial
      </a>
      <a href="#" class="whatsapp-link flex-1 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all">
        Falar com o Suporte
      </a>
    </div>
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'obrigado.html'), obrigadoHtml);

  // 7. PAINEL ADMIN PRÓPRIO ZERADO (admin/index.html + admin/admin.js)
  generateAdminPanel(pkg, pkgDir);

  // 8. GUIA ILUSTRADO EM HTML & PDF (INSTRUCOES-DO-PACOTE.html e .pdf)
  generateIllustratedGuide(pkg, pkgDir);

  console.log(`Pacote ${pkg.id} gerado com sucesso!`);
}

// =============================================================================
// 2. GERAR PACOTE 02: CAPTURA & WHATSAPP
// =============================================================================
function generatePackage02(pkg) {
  const pkgDir = path.join(BASE_DIR, pkg.id);
  if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true });

  ['admin', 'css', 'js', 'assets/imagens'].forEach(folder => {
    fs.mkdirSync(path.join(pkgDir, folder), { recursive: true });
  });

  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'logo-placeholder.png'), path.join(pkgDir, 'assets/imagens/logo-placeholder.png'));
  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'banner-placeholder.jpg'), path.join(pkgDir, 'assets/imagens/banner-placeholder.jpg'));
  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'foto-placeholder.jpg'), path.join(pkgDir, 'assets/imagens/foto-placeholder.jpg'));

  // config.js
  const configJs = `const DEFAULT_CONFIG = ${JSON.stringify(pkg.defaultConfig, null, 2)};
window.PAGE_CONFIG = (function() {
  try {
    const saved = localStorage.getItem('${pkg.id}_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
})();
`;
  fs.writeFileSync(path.join(pkgDir, 'js/config.js'), configJs);

  // css/style.css
  const styleCss = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #050b14;
  color: #f8fafc;
}
.glass-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
`;
  fs.writeFileSync(path.join(pkgDir, 'css/style.css'), styleCss);

  // js/app.js
  const appJs = `document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.PAGE_CONFIG || {};

  document.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.getAttribute('data-bind');
    if (cfg[key] !== undefined && cfg[key] !== '') {
      if (el.tagName === 'IMG') el.src = cfg[key];
      else el.textContent = cfg[key];
    }
  });

  if (cfg.whatsapp) {
    const cleanNum = cfg.whatsapp.replace(/\\D/g, '');
    const defaultMsg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site.');
    document.querySelectorAll('.whatsapp-btn').forEach(btn => {
      const specificMsg = btn.getAttribute('data-msg');
      const finalMsg = specificMsg ? encodeURIComponent(specificMsg) : defaultMsg;
      btn.href = \`https://wa.me/\${cleanNum}?text=\${finalMsg}\`;
    });
  }
});
`;
  fs.writeFileSync(path.join(pkgDir, 'js/app.js'), appJs);

  // index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-bind="businessName">Seu Nome • Atendimento &amp; Consultoria Individualizada</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
  <script src="js/app.js" defer></script>
</head>
<body class="bg-[#050b14] text-slate-100 min-h-screen selection:bg-sky-500 selection:text-slate-950">

  <!-- BARRA DE DEMONSTRAÇÃO FLUTUANTE -->
  <div class="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-sky-500/30 py-2.5 px-4 sticky top-0 z-50 text-xs shadow-xl">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          PACOTE 02 • DEMONSTRAÇÃO ATIVA
        </span>
        <span class="text-slate-400 hidden sm:inline">Estrutura de Captura &amp; WhatsApp VIP</span>
      </div>
      <div class="flex items-center gap-2">
        <a href="admin/index.html" class="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold transition-all border border-sky-500/40">
          <span>⚙️ Abrir Painel Admin</span>
        </a>
        <a href="checkout.html" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700">
          <span>💳 Ver Checkout Reserva</span>
        </a>
        <a href="/checkout?plano=pro&produto=combo-5em1" class="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black transition-all shadow-md">
          <span>Comprar Este Pacote (R$ 97)</span>
        </a>
      </div>
    </div>
  </div>

  <!-- AVISO SUPERIOR -->
  <div class="bg-gradient-to-r from-sky-600 to-blue-600 py-2 text-center text-white text-xs font-black tracking-wider uppercase">
    <span data-bind="topBarText">AGENDA ABERTA PARA NOVOS PACIENTES / CLIENTES NESTE MÊS</span>
  </div>

  <!-- CABEÇALHO -->
  <header class="py-6 px-4 sm:px-8 max-w-6xl mx-auto flex items-center justify-between">
    <img src="assets/imagens/logo-placeholder.png" alt="Sua Logo" class="h-10 sm:h-12 w-auto object-contain" data-bind="logoUrl">
    <a href="#planos" class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all">
      Ver Planos &amp; Vagas
    </a>
  </header>

  <!-- HERO SECTION COM FOTO DO PROFISSIONAL -->
  <section class="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
    <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider">
        <span>★ ATENDIMENTO PERSONALIZADO</span>
      </div>

      <h1 class="text-3xl sm:text-5xl font-black text-white leading-tight" data-bind="headline">
        Transforme Sua [Área de Atuação] com um Acompanhamento 100% Individualizado
      </h1>

      <p class="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl" data-bind="subheadline">
        Metodologia científica e personalizada para você atingir seus objetivos com segurança, sem fórmulas prontas ou promessas milagrosas.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
        <a href="#" class="whatsapp-btn py-4 px-8 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-sky-500/20 text-center flex items-center justify-center gap-2">
          <span>💬 FALAR COMIGO NO WHATSAPP</span>
        </a>
        <a href="#planos" class="py-4 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 text-center">
          Conhecer Modalidades
        </a>
      </div>

      <div class="text-xs text-slate-400 flex items-center justify-center lg:justify-start gap-2 pt-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span data-bind="ctaSubtext">⚡ Resposta Rápida • Vagas Limitadas</span>
      </div>
    </div>

    <!-- Foto do Especialista -->
    <div class="lg:col-span-5 flex justify-center">
      <div class="relative w-full max-w-sm rounded-3xl overflow-hidden border-2 border-sky-500/40 shadow-2xl bg-slate-900 group">
        <img src="assets/imagens/foto-placeholder.jpg" alt="Sua Foto Aqui" class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" data-bind="photoUrl">
        <div class="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
          <h3 class="text-lg font-bold text-white" data-bind="businessName">Seu Nome Aqui</h3>
          <p class="text-xs text-sky-400 font-semibold" data-bind="professionalTitle">Especialista em [Sua Área] • Registro Oficial</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PLANOS DE ATENDIMENTO -->
  <section id="planos" class="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800">
    <div class="text-center mb-12">
      <span class="text-sky-400 text-xs font-bold uppercase tracking-wider">INVESTIMENTO &amp; FORMATOS</span>
      <h2 class="text-2xl sm:text-4xl font-black text-white mt-2">Escolha Seu Formato de Acompanhamento</h2>
      <p class="text-slate-400 text-sm sm:text-base mt-2">Clique no plano desejado para falar diretamente comigo no WhatsApp.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <!-- Plano Mensal -->
      <div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-bold text-white">Plano Mensal</h3>
          <p class="text-xs text-slate-400 mt-1">Ideal para experimentar o método.</p>
          <div class="text-3xl font-black text-white mt-4">R$ 197<span class="text-xs text-slate-400">/mês</span></div>
          <ul class="space-y-2.5 text-xs text-slate-300 mt-6">
            <li>✓ Avaliação inicial completa</li>
            <li>✓ Plano personalizado de 30 dias</li>
            <li>✓ Suporte semanal via WhatsApp</li>
            <li>✓ Ajustes pontuais</li>
          </ul>
        </div>
        <a href="#" class="whatsapp-btn mt-8 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block border border-slate-700" data-msg="Olá! Gostaria de iniciar no Plano Mensal.">
          Escolher Plano Mensal
        </a>
      </div>

      <!-- Plano Trimestral VIP -->
      <div class="glass-card p-6 sm:p-8 rounded-3xl border-2 border-sky-500 bg-sky-950/20 flex flex-col justify-between relative shadow-2xl scale-105">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 text-[10px] font-black uppercase px-4 py-1 rounded-full whitespace-nowrap">
          MAIS ESCOLHIDO • 40% OFF
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">Plano Trimestral VIP</h3>
          <p class="text-xs text-sky-300 mt-1">Tempo ideal para transformação visível.</p>
          <div class="text-3xl font-black text-white mt-4">3x R$ 149<span class="text-xs text-slate-400"> ou R$ 397</span></div>
          <ul class="space-y-2.5 text-xs text-slate-200 mt-6">
            <li>✓ Tudo do Plano Mensal</li>
            <li>✓ Ajustes quinzenais de protocolo</li>
            <li>✓ Acompanhamento prioritário no WhatsApp</li>
            <li>✓ Guia complementar exclusivo</li>
            <li>✓ Avaliação postural / física completa</li>
          </ul>
        </div>
        <a href="#" class="whatsapp-btn mt-8 py-4 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center block shadow-lg shadow-sky-500/25" data-msg="Olá! Gostaria de garantir minha vaga no Plano Trimestral VIP.">
          Quero o Trimestral VIP
        </a>
      </div>

      <!-- Plano Semestral -->
      <div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-bold text-white">Plano Semestral</h3>
          <p class="text-xs text-slate-400 mt-1">Mudança de hábitos e estilo de vida.</p>
          <div class="text-3xl font-black text-white mt-4">6x R$ 119<span class="text-xs text-slate-400"> ou R$ 647</span></div>
          <ul class="space-y-2.5 text-xs text-slate-300 mt-6">
            <li>✓ Acompanhamento de 6 meses</li>
            <li>✓ Check-ins mensais em vídeo</li>
            <li>✓ Canal direto 24/7 no WhatsApp</li>
            <li>✓ Todos os materiais e bônus inclusos</li>
          </ul>
        </div>
        <a href="#" class="whatsapp-btn mt-8 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block border border-slate-700" data-msg="Olá! Gostaria de me inscrever no Plano Semestral.">
          Escolher Plano Semestral
        </a>
      </div>
    </div>
  </section>

  <!-- RODAPÉ -->
  <footer class="py-10 px-4 text-center border-t border-slate-800 text-xs text-slate-500">
    <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>© 2026 <span data-bind="businessName">Seu Nome</span>. Todos os direitos reservados.</div>
      <div class="flex items-center gap-4 text-slate-400">
        <a href="admin/index.html" class="hover:text-sky-400">Acessar Admin</a>
        <a href="checkout.html" class="hover:text-sky-400">Página de Reserva</a>
        <a href="#" class="whatsapp-btn hover:text-sky-400">WhatsApp Direto</a>
      </div>
    </div>
  </footer>

</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'index.html'), indexHtml);

  // checkout.html
  const checkoutHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva de Consulta • Pagamento Seguro</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
</head>
<body class="bg-[#050b14] text-slate-100 min-h-screen py-8 px-4 sm:px-6">
  <div class="max-w-3xl mx-auto glass-card p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-white">Reserva de Horário &amp; Inscrição</h1>
        <p class="text-xs text-slate-400 mt-1">Preencha seus dados para confirmar seu atendimento.</p>
      </div>
      <a href="index.html" class="text-xs text-sky-400 hover:underline">← Voltar</a>
    </div>

    <form class="space-y-4" onsubmit="event.preventDefault(); window.location.href='obrigado.html';">
      <div>
        <label class="block text-xs font-bold text-slate-300 mb-1">Nome Completo *</label>
        <input type="text" required placeholder="Ex: Ana Silva" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">WhatsApp *</label>
          <input type="tel" required placeholder="(11) 99999-9999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">E-mail *</label>
          <input type="email" required placeholder="email@exemplo.com" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
        </div>
      </div>
      <button type="submit" class="w-full py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm uppercase tracking-wider mt-4">
        Confirmar e Abrir no WhatsApp
      </button>
    </form>
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'checkout.html'), checkoutHtml);

  // obrigado.html
  const obrigadoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Reserva Recebida com Sucesso!</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
</head>
<body class="bg-[#050b14] text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-lg w-full glass-card p-8 rounded-3xl border border-sky-500/40 text-center shadow-2xl">
    <div class="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 text-3xl flex items-center justify-center mx-auto mb-4">✓</div>
    <h1 class="text-2xl font-black text-white mb-2">Solicitação Recebida!</h1>
    <p class="text-sm text-slate-300 mb-6">Em instantes entraremos em contato com você pelo WhatsApp para confirmar o agendamento.</p>
    <a href="index.html" class="py-3 px-6 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Voltar à Página Inicial</a>
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'obrigado.html'), obrigadoHtml);

  generateAdminPanel(pkg, pkgDir);
  generateIllustratedGuide(pkg, pkgDir);

  console.log(`Pacote ${pkg.id} gerado com sucesso!`);
}

// =============================================================================
// 3. GERAR PACOTE 03: INSTITUCIONAL & NEGÓCIOS
// =============================================================================
function generatePackage03(pkg) {
  const pkgDir = path.join(BASE_DIR, pkg.id);
  if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true });

  ['admin', 'css', 'js', 'assets/imagens'].forEach(folder => {
    fs.mkdirSync(path.join(pkgDir, folder), { recursive: true });
  });

  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'logo-placeholder.png'), path.join(pkgDir, 'assets/imagens/logo-placeholder.png'));
  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'banner-placeholder.jpg'), path.join(pkgDir, 'assets/imagens/banner-placeholder.jpg'));
  copyFileSafe(path.join(PLACEHOLDERS_DIR, 'mockup-placeholder.jpg'), path.join(pkgDir, 'assets/imagens/mockup-placeholder.jpg'));

  // config.js
  const configJs = `const DEFAULT_CONFIG = ${JSON.stringify(pkg.defaultConfig, null, 2)};
window.PAGE_CONFIG = (function() {
  try {
    const saved = localStorage.getItem('${pkg.id}_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
})();
`;
  fs.writeFileSync(path.join(pkgDir, 'js/config.js'), configJs);

  // css/style.css
  const styleCss = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #0b1120;
  color: #f8fafc;
}
.glass-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
`;
  fs.writeFileSync(path.join(pkgDir, 'css/style.css'), styleCss);

  // js/app.js
  const appJs = `document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.PAGE_CONFIG || {};

  document.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.getAttribute('data-bind');
    if (cfg[key] !== undefined && cfg[key] !== '') {
      if (el.tagName === 'IMG') el.src = cfg[key];
      else el.textContent = cfg[key];
    }
  });

  if (cfg.whatsapp) {
    const cleanNum = cfg.whatsapp.replace(/\\D/g, '');
    const msg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site institucional.');
    document.querySelectorAll('.whatsapp-btn').forEach(a => {
      a.href = \`https://wa.me/\${cleanNum}?text=\${msg}\`;
    });
  }
});
`;
  fs.writeFileSync(path.join(pkgDir, 'js/app.js'), appJs);

  // index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-bind="companyName">Sua Empresa • Soluções Corporativas &amp; Inovação</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
  <script src="js/app.js" defer></script>
</head>
<body class="bg-[#0b1120] text-slate-100 min-h-screen">

  <!-- BARRA DE DEMONSTRAÇÃO FLUTUANTE -->
  <div class="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-blue-500/30 py-2.5 px-4 sticky top-0 z-50 text-xs shadow-xl">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          PACOTE 03 • DEMONSTRAÇÃO ATIVA
        </span>
        <span class="text-slate-400 hidden sm:inline">Estrutura Institucional &amp; Comercial B2B</span>
      </div>
      <div class="flex items-center gap-2">
        <a href="admin/index.html" class="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold border border-blue-500/40">
          <span>⚙️ Abrir Painel Admin</span>
        </a>
        <a href="checkout.html" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700">
          <span>💳 Ver Proposta / Checkout</span>
        </a>
        <a href="/checkout?plano=pro&produto=combo-5em1" class="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-black transition-all shadow-md">
          <span>Comprar Este Pacote (R$ 97)</span>
        </a>
      </div>
    </div>
  </div>

  <!-- HEADER -->
  <header class="py-6 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between border-b border-slate-800/80">
    <img src="assets/imagens/logo-placeholder.png" alt="Sua Empresa" class="h-10 sm:h-12 w-auto object-contain" data-bind="logoUrl">
    <nav class="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
      <a href="#servicos" class="hover:text-blue-400">Soluções</a>
      <a href="#metricas" class="hover:text-blue-400">Resultados</a>
      <a href="#diferenciais" class="hover:text-blue-400">Diferenciais</a>
      <a href="#contato" class="hover:text-blue-400">Contato</a>
    </nav>
    <a href="#contato" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider">
      Solicitar Proposta
    </a>
  </header>

  <!-- HERO SECTION CORPORATIVO -->
  <section class="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
    <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-6">
      <span data-bind="topBarText">LÍDERES EM INOVAÇÃO E TRANSFORMAÇÃO DIGITAL</span>
    </span>

    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl mb-6" data-bind="headline">
      Aceleramos o Crescimento do Seu Negócio com Soluções de Alta Performance
    </h1>

    <p class="text-slate-300 text-base sm:text-xl max-w-3xl mb-10 leading-relaxed" data-bind="subheadline">
      Desenvolvemos tecnologia sob medida, processos eficientes e estratégias focadas em maximizar a rentabilidade e a escala da sua operação.
    </p>

    <div class="flex flex-col sm:flex-row gap-4 mb-12">
      <a href="#contato" class="py-4 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/20">
        <span data-bind="ctaButtonText">SOLICITAR PROPOSTA PERSONALIZADA</span>
      </a>
      <a href="#servicos" class="py-4 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700">
        Conhecer Nossas Soluções
      </a>
    </div>

    <!-- BANNER HERO -->
    <div class="w-full max-w-5xl rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      <img src="assets/imagens/banner-placeholder.jpg" alt="Banner Institucional" class="w-full h-auto object-cover" data-bind="bannerUrl">
    </div>
  </section>

  <!-- MÉTRICAS DE IMPACTO -->
  <section id="metricas" class="py-12 bg-slate-950/60 border-y border-slate-800">
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

  <!-- SERVIÇOS / SOLUÇÕES CORPORATIVAS -->
  <section id="servicos" class="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
    <div class="text-center mb-14">
      <span class="text-blue-400 text-xs font-bold uppercase tracking-wider">SOLUÇÕES DE PONTA</span>
      <h2 class="text-2xl sm:text-4xl font-black text-white mt-2">Tecnologia &amp; Estratégia Sob Medida</h2>
      <p class="text-slate-400 text-sm mt-2">Projetos desenvolvidos para solucionar gargalos e gerar escala sustentável.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass-card p-8 rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-bold mb-4">01</div>
        <h3 class="text-xl font-bold text-white mb-2">Consultoria Estratégica &amp; Diagnóstico</h3>
        <p class="text-slate-300 text-sm leading-relaxed">Análise aprofundada dos seus fluxos de trabalho e oportunidades de otimização de custos e processos operacionais.</p>
      </div>

      <div class="glass-card p-8 rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-bold mb-4">02</div>
        <h3 class="text-xl font-bold text-white mb-2">Desenvolvimento Tecnológico Sob Medida</h3>
        <p class="text-slate-300 text-sm leading-relaxed">Arquiteturas modernas, escaláveis e com foco na melhor experiência de uso para clientes e colaboradores.</p>
      </div>

      <div class="glass-card p-8 rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-bold mb-4">03</div>
        <h3 class="text-xl font-bold text-white mb-2">Segurança, Compliance &amp; Governança</h3>
        <p class="text-slate-300 text-sm leading-relaxed">Boas práticas rigorosas de proteção de dados (LGPD), criptografia de ponta e estabilidade 24 horas por dia.</p>
      </div>

      <div class="glass-card p-8 rounded-2xl border border-slate-800">
        <div class="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-bold mb-4">04</div>
        <h3 class="text-xl font-bold text-white mb-2">Suporte Contínuo &amp; Sustentação</h3>
        <p class="text-slate-300 text-sm leading-relaxed">Equipe dedicada para manter sua operação funcionando perfeitamente, com SLAs rigorosos e atendimento direto.</p>
      </div>
    </div>
  </section>

  <!-- FORMULÁRIO DE PROPOSTA -->
  <section id="contato" class="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800">
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
            <label class="block text-xs font-bold text-slate-300 mb-1">Nome da Empresa *</label>
            <input type="text" required placeholder="Ex: Horizon Tech" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">E-mail Corporativo *</label>
            <input type="email" required placeholder="roberto@empresa.com" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Telefone / WhatsApp *</label>
            <input type="tel" required placeholder="(11) 99999-9999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Fale Brevemente Sobre o Seu Projeto</label>
          <textarea rows="3" placeholder="Descreva os objetivos da sua empresa..." class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"></textarea>
        </div>

        <button type="submit" class="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30">
          Enviar Solicitação de Proposta
        </button>
      </form>
    </div>
  </section>

  <!-- RODAPÉ -->
  <footer class="py-10 px-4 text-center border-t border-slate-800 text-xs text-slate-500">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>© 2026 <span data-bind="companyName">Sua Empresa</span>. Todos os direitos reservados.</div>
      <div class="flex items-center gap-4 text-slate-400">
        <a href="admin/index.html" class="hover:text-blue-400">Acessar Admin</a>
        <a href="checkout.html" class="hover:text-blue-400">Página Comercial</a>
        <a href="#" class="whatsapp-btn hover:text-blue-400">WhatsApp Comercial</a>
      </div>
    </div>
  </footer>

</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'index.html'), indexHtml);

  // checkout.html
  const checkoutHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Contratação de Plano Corporativo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/config.js"></script>
</head>
<body class="bg-[#0b1120] text-slate-100 min-h-screen py-8 px-4 sm:px-6">
  <div class="max-w-2xl mx-auto glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl">
    <h1 class="text-xl font-bold text-white mb-2">Contratação de Solução Corporativa</h1>
    <p class="text-xs text-slate-400 mb-6">Preencha os dados da sua empresa para emissão da proposta e contrato.</p>
    <form onsubmit="event.preventDefault(); window.location.href='obrigado.html';" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Razão Social / Nome</label>
        <input type="text" required class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">CNPJ</label>
        <input type="text" required class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
      </div>
      <button type="submit" class="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm">
        Confirmar Dados &amp; Avançar
      </button>
    </form>
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'checkout.html'), checkoutHtml);

  // obrigado.html
  const obrigadoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Proposta Solicitada com Sucesso!</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="bg-[#0b1120] text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-lg w-full glass-card p-8 rounded-3xl border border-blue-500/40 text-center shadow-2xl">
    <div class="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 text-3xl flex items-center justify-center mx-auto mb-4">✓</div>
    <h1 class="text-2xl font-black text-white mb-2">Proposta Enviada com Sucesso!</h1>
    <p class="text-sm text-slate-300 mb-6">Nossa diretoria comercial entrará em contato diretamente para apresentar o cronograma e detalhes do projeto.</p>
    <a href="index.html" class="py-3 px-6 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Voltar à Página Principal</a>
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(pkgDir, 'obrigado.html'), obrigadoHtml);

  generateAdminPanel(pkg, pkgDir);
  generateIllustratedGuide(pkg, pkgDir);

  console.log(`Pacote ${pkg.id} gerado com sucesso!`);
}

// =============================================================================
// 4. GERADOR DO PAINEL ADMIN PRÓPRIO ZERADO (admin/index.html + admin.js)
// =============================================================================
function generateAdminPanel(pkg, pkgDir) {
  const adminDir = path.join(pkgDir, 'admin');

  const adminHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel de Gestão da Página • ${pkg.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="../js/config.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #080c14; color: #f8fafc; }
    .glass-box { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .tab-btn.active { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.4); font-weight: 800; }
  </style>
</head>
<body class="min-h-screen pb-16">

  <!-- MODAL DE PRIMEIRO ACESSO: TROCA DE SENHA OBRIGATÓRIA -->
  <div id="modalFirstAccess" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 hidden">
    <div class="max-w-md w-full glass-box p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/50 shadow-2xl text-center">
      <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center mx-auto mb-4">
        🔐
      </div>
      <h2 class="text-xl font-black text-white mb-2">Primeiro Acesso ao Painel</h2>
      <p class="text-xs text-slate-300 mb-6 leading-relaxed">
        Por segurança, altere a senha inicial padrão (<strong class="text-emerald-400">123456</strong>) para uma senha pessoal antes de continuar.
      </p>

      <form id="formChangePass" class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Senha Inicial Atual</label>
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
        <button type="submit" class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all mt-4">
          Salvar Nova Senha &amp; Entrar
        </button>
      </form>
    </div>
  </div>

  <!-- TELA DE LOGIN DO ADMIN -->
  <div id="loginScreen" class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full glass-box p-8 rounded-3xl border border-slate-800 shadow-2xl text-center">
      <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
        ⚙️
      </div>
      <h1 class="text-2xl font-black text-white mb-1">Painel Administrativo</h1>
      <p class="text-xs text-slate-400 mb-6">${pkg.name}</p>

      <form id="loginForm" class="space-y-4 text-left">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Senha de Acesso</label>
          <input type="password" id="loginPassword" required placeholder="Digite sua senha (padrão: 123456)" class="w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-sm text-white outline-none">
          <p class="text-[11px] text-slate-500 mt-1">Senha inicial de fábrica: <strong class="text-slate-400">123456</strong></p>
        </div>
        <button type="submit" class="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all">
          Acessar Painel de Controle
        </button>
      </form>
      <div class="mt-6 pt-4 border-t border-slate-800">
        <a href="../index.html" class="text-xs text-slate-400 hover:text-white transition-colors">← Ver Página Pública</a>
      </div>
    </div>
  </div>

  <!-- PAINEL PRINCIPAL (APÓS LOGIN) -->
  <div id="adminPanel" class="hidden">
    <!-- BARRA SUPERIOR -->
    <header class="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-8 py-3.5 backdrop-blur-md">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base">
            ⚙️
          </div>
          <div>
            <h1 class="text-sm sm:text-base font-bold text-white">Painel da Minha Página</h1>
            <p class="text-[11px] text-emerald-400 font-semibold">${pkg.name}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a href="../index.html" target="_blank" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all">
            <span>👁 Ver Página</span>
          </a>
          <button id="btnDownloadConfig" type="button" class="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5 transition-all">
            <span>💾 Baixar config.js</span>
          </button>
          <button id="btnSaveConfig" type="button" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20">
            Salvar Alterações
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
      <!-- TOAST DE SUCESSO -->
      <div id="saveToast" class="fixed bottom-6 right-6 bg-emerald-500 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-2 z-50 transform translate-y-24 opacity-0 transition-all duration-300">
        <span>✓ Alterações salvas com sucesso no seu navegador!</span>
      </div>

      <!-- NAVEGAÇÃO DE ABAS -->
      <div class="flex flex-wrap gap-2 pb-6 border-b border-slate-800 mb-8">
        <button class="tab-btn active px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 transition-all" data-tab="tab-identidade">
          Identidade &amp; Imagens
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 transition-all" data-tab="tab-hero">
          Hero &amp; Título
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 transition-all" data-tab="tab-oferta">
          Oferta, Preços &amp; Venda
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 transition-all" data-tab="tab-contato">
          WhatsApp &amp; Contato
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 transition-all" data-tab="tab-faq">
          Dúvidas Frequentes (FAQ)
        </button>
        <button class="tab-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 transition-all" data-tab="tab-pixels">
          Pixels &amp; Anúncios
        </button>
      </div>

      <!-- CONTEÚDO DAS ABAS -->
      <div class="glass-box p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
        
        <!-- ABA 1: IDENTIDADE & IMAGENS -->
        <div id="tab-identidade" class="tab-content space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-slate-800 pb-3">Identidade Visual &amp; Banners</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Nome do Seu Negócio / Especialista</label>
              <input type="text" id="cfg_businessName" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Slogan / Tagline do Negócio</label>
              <input type="text" id="cfg_tagline" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Caminho / URL da Logo ("SUA LOGO AQUI")</label>
              <input type="text" id="cfg_logoUrl" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              <p class="text-[11px] text-slate-500 mt-1">Coloque o caminho da sua imagem ou link público (ex: assets/imagens/minhalogo.png)</p>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Caminho / URL do Banner Principal ("SEU BANNER AQUI")</label>
              <input type="text" id="cfg_bannerUrl" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
              <p class="text-[11px] text-slate-500 mt-1">Recomendado 1200x630px para destaque de alta qualidade</p>
            </div>
          </div>
        </div>

        <!-- ABA 2: HERO & TÍTULOS -->
        <div id="tab-hero" class="tab-content hidden space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-slate-800 pb-3">Seção Principal (Hero)</h2>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Tag de Aviso Superior (Barra colorida)</label>
            <input type="text" id="cfg_topBarText" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
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
              <input type="text" id="cfg_ctaButtonText" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Texto de Apoio (Micro-trust)</label>
              <input type="text" id="cfg_ctaSubtext" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
        </div>

        <!-- ABA 3: OFERTA, PREÇOS & CHECKOUT -->
        <div id="tab-oferta" class="tab-content hidden space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-slate-800 pb-3">Oferta, Preços &amp; Checkout</h2>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Nome do Produto / Oferta Principal</label>
            <input type="text" id="cfg_productName" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Preço De (Original R$)</label>
              <input type="text" id="cfg_originalPrice" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Preço Por (À Vista R$)</label>
              <input type="text" id="cfg_salePrice" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Texto de Parcelamento (ex: 12x de...)</label>
              <input type="text" id="cfg_installments" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Link de Checkout / Destino da Compra</label>
            <input type="text" id="cfg_checkoutUrl" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            <p class="text-[11px] text-slate-500 mt-1">Use <strong class="text-slate-400">checkout.html</strong> para o checkout incluso, ou coloque seu link da Kiwify, Hotmart, Eduzz ou Mercado Pago.</p>
          </div>
        </div>

        <!-- ABA 4: WHATSAPP & CONTATO -->
        <div id="tab-contato" class="tab-content hidden space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-slate-800 pb-3">WhatsApp &amp; Suporte</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Número de WhatsApp (com DDI e DDD)</label>
              <input type="text" id="cfg_whatsapp" placeholder="Ex: 5511999999999" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">E-mail de Suporte / Atendimento</label>
              <input type="email" id="cfg_email" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Mensagem Padrão que o Cliente Envia ao Clicar</label>
            <input type="text" id="cfg_whatsappMessage" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
          </div>
        </div>

        <!-- ABA 5: FAQ -->
        <div id="tab-faq" class="tab-content hidden space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-slate-800 pb-3">Perguntas Frequentes (FAQ)</h2>
          <p class="text-xs text-slate-400">As dúvidas frequentes que aparecem no acordeão da sua página.</p>
          <div id="faqList" class="space-y-4">
            <!-- Gerado dinamicamente -->
          </div>
        </div>

        <!-- ABA 6: PIXELS & ANÚNCIOS -->
        <div id="tab-pixels" class="tab-content hidden space-y-6">
          <h2 class="text-lg font-bold text-white border-b border-slate-800 pb-3">Rastreamento de Tráfego Pago &amp; Conversão</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Meta Pixel ID (Facebook / Instagram)</label>
              <input type="text" id="cfg_metaPixelId" placeholder="Ex: 2161688604424737" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Google Ads ID / Tag de Conversão</label>
              <input type="text" id="cfg_googleAdsId" placeholder="Ex: AW-18531803428" class="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white">
            </div>
          </div>
        </div>

      </div>

      <!-- BOTÃO INFERIOR DE RESTAURAR PADRÕES -->
      <div class="mt-8 flex justify-between items-center text-xs text-slate-500">
        <span>© RMTI • Sistema de Gestão de Landing Pages</span>
        <button id="btnResetDefault" type="button" class="text-red-400 hover:underline">
          🔄 Restaurar Valores Originais de Fábrica
        </button>
      </div>
    </div>
  </div>

  <script src="admin.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(adminDir, 'index.html'), adminHtml);

  // admin/admin.js
  const adminJs = `/**
 * Lógica do Painel de Controle • ${pkg.name}
 */
document.addEventListener('DOMContentLoaded', () => {
  const PKG_ID = '${pkg.id}';
  const PASSWORD_KEY = PKG_ID + '_admin_password';
  const FIRST_LOGIN_KEY = PKG_ID + '_first_login_done';

  const loginScreen = document.getElementById('loginScreen');
  const adminPanel = document.getElementById('adminPanel');
  const modalFirstAccess = document.getElementById('modalFirstAccess');

  // Verificar se o usuário já está logado na sessão atual
  if (sessionStorage.getItem(PKG_ID + '_logged') === 'true') {
    showPanel();
  }

  // Login Handler
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('loginPassword').value.trim();
    const currentPass = localStorage.getItem(PASSWORD_KEY) || '123456';

    if (pass === currentPass) {
      // Verificar se é o primeiro acesso
      const isFirstLogin = !localStorage.getItem(FIRST_LOGIN_KEY);
      if (isFirstLogin) {
        modalFirstAccess.classList.remove('hidden');
      } else {
        sessionStorage.setItem(PKG_ID + '_logged', 'true');
        showPanel();
      }
    } else {
      alert('Senha incorreta! Digite a senha padrão (123456) ou a nova senha cadastrada.');
    }
  });

  // Troca de Senha Obrigatória no Primeiro Acesso
  document.getElementById('formChangePass').addEventListener('submit', (e) => {
    e.preventDefault();
    const cur = document.getElementById('curPass').value.trim();
    const n1 = document.getElementById('newPass').value.trim();
    const n2 = document.getElementById('confirmPass').value.trim();
    const stored = localStorage.getItem(PASSWORD_KEY) || '123456';

    if (cur !== stored) {
      alert('A senha inicial digitada está incorreta.');
      return;
    }
    if (n1.length < 4) {
      alert('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (n1 !== n2) {
      alert('As novas senhas digitadas não coincidem.');
      return;
    }

    localStorage.setItem(PASSWORD_KEY, n1);
    localStorage.setItem(FIRST_LOGIN_KEY, 'true');
    modalFirstAccess.classList.add('hidden');
    sessionStorage.setItem(PKG_ID + '_logged', 'true');
    alert('Senha alterada com sucesso! Bem-vindo ao painel.');
    showPanel();
  });

  function showPanel() {
    loginScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadFormValues();
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

  // Carregar dados no formulário
  function loadFormValues() {
    const cfg = window.PAGE_CONFIG || {};

    const fields = [
      'businessName', 'tagline', 'logoUrl', 'bannerUrl',
      'topBarText', 'headline', 'subheadline', 'ctaButtonText', 'ctaSubtext',
      'productName', 'originalPrice', 'salePrice', 'installments', 'checkoutUrl',
      'whatsapp', 'email', 'whatsappMessage', 'metaPixelId', 'googleAdsId'
    ];

    fields.forEach(f => {
      const el = document.getElementById('cfg_' + f);
      if (el && cfg[f] !== undefined) {
        el.value = cfg[f];
      }
    });
  }

  // Salvar Alterações
  document.getElementById('btnSaveConfig').addEventListener('click', () => {
    const current = window.PAGE_CONFIG || {};

    const fields = [
      'businessName', 'tagline', 'logoUrl', 'bannerUrl',
      'topBarText', 'headline', 'subheadline', 'ctaButtonText', 'ctaSubtext',
      'productName', 'originalPrice', 'salePrice', 'installments', 'checkoutUrl',
      'whatsapp', 'email', 'whatsappMessage', 'metaPixelId', 'googleAdsId'
    ];

    fields.forEach(f => {
      const el = document.getElementById('cfg_' + f);
      if (el) current[f] = el.value.trim();
    });

    localStorage.setItem(PKG_ID + '_config', JSON.stringify(current));
    window.PAGE_CONFIG = current;

    // Toast de Sucesso
    const toast = document.getElementById('saveToast');
    toast.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3000);
  });

  // Baixar config.js permanente
  document.getElementById('btnDownloadConfig').addEventListener('click', () => {
    const current = window.PAGE_CONFIG || {};
    const content = '/**\\n * Arquivo gerado pelo Painel Admin • ' + PKG_ID + '\\n */\\nconst DEFAULT_CONFIG = ' + JSON.stringify(current, null, 2) + ';\\nwindow.PAGE_CONFIG = DEFAULT_CONFIG;\\n';
    
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
    if (confirm('Tem certeza de que deseja restaurar as configurações originais de fábrica? Todas as suas edições salvas serão apagadas.')) {
      localStorage.removeItem(PKG_ID + '_config');
      location.reload();
    }
  });
});
`;
  fs.writeFileSync(path.join(adminDir, 'admin.js'), adminJs);
}

// =============================================================================
// 5. GERADOR DO MANUAL DE INSTRUÇÕES ILUSTRADO EM HTML & PDF
// =============================================================================
function generateIllustratedGuide(pkg, pkgDir) {
  const guideHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Manual Ilustrado • ${pkg.name}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #0f172a; font-size: 24px; margin: 0; }
    .header p { color: #64748b; font-size: 14px; margin: 5px 0 0 0; }
    .badge { display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 10px; }
    .step-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .step-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .step-num { background: #10b981; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">MANUAL OFICIAL • RMTI TECNOLOGIA</div>
    <h1>${pkg.name}</h1>
    <p>Guia de Implementação Rápida, Personalização e Hospedagem</p>
  </div>

  <div class="step-box">
    <h3 class="step-title"><span class="step-num">1</span> Estrutura de Arquivos do Seu Pacote</h3>
    <p>O pacote que você adquiriu é 100% seu e totalmente autônomo. Você encontrará os seguintes arquivos:</p>
    <ul>
      <li><code>index.html</code>: A sua página de alta conversão pronta para ir ao ar.</li>
      <li><code>checkout.html</code>: Sua página de checkout pronta com formulário, Pix e cartão.</li>
      <li><code>obrigado.html</code>: A página de agradecimento exibida após a compra.</li>
      <li><code>admin/index.html</code>: O seu Painel de Gestão próprio para alterar tudo sem código.</li>
      <li><code>assets/imagens/</code>: Onde ficam a logo, banner e imagens do site.</li>
    </ul>
  </div>

  <div class="step-box">
    <h3 class="step-title"><span class="step-num">2</span> Como Testar no Seu Computador</h3>
    <p>Você não precisa de nenhum programa especial. Basta dar <strong>duplo clique em index.html</strong> para abrir a página no seu navegador (Google Chrome, Edge, Safari).</p>
  </div>

  <div class="step-box">
    <h3 class="step-title"><span class="step-num">3</span> Como Usar o Painel Admin para Editar Tudo</h3>
    <p>Abra a pasta <code>admin/</code> e dê duplo clique em <code>index.html</code>:</p>
    <ul>
      <li><strong>Senha de primeiro acesso:</strong> <code>123456</code></li>
      <li>O sistema solicitará a troca para sua senha pessoal por segurança.</li>
      <li>Altere títulos, logotipo, preços, botão de WhatsApp e chaves de pixels.</li>
      <li>Clique em <strong>"Salvar Alterações"</strong>. O site atualizará no mesmo instante!</li>
      <li>Para tornar as alterações definitivas em qualquer hospedagem, clique em <strong>"Baixar config.js"</strong> e substitua o arquivo dentro da pasta <code>js/</code>.</li>
    </ul>
  </div>

  <div class="step-box">
    <h3 class="step-title"><span class="step-num">4</span> Como Publicar Gratuitamente na Vercel (Em 3 Minutos)</h3>
    <ol>
      <li>Acesse <strong>vercel.com</strong> e crie uma conta gratuita.</li>
      <li>Arraste a pasta descompactada deste pacote para dentro do painel da Vercel.</li>
      <li>Clique em <strong>Deploy</strong>. Seu site estará no ar mundialmente com certificado SSL (https) gratuito!</li>
      <li>Opcional: Conecte seu domínio próprio (ex: <code>seunegocio.com.br</code>) na aba <em>Settings > Domains</em>.</li>
    </ol>
  </div>

  <div class="footer">
    Desenvolvido com excelência por <strong>RMTI • Soluções em Tecnologia</strong> | Suporte: pauloromao.dev2020@gmail.com
  </div>
</body>
</html>
`;

  const htmlGuidePath = path.join(pkgDir, 'INSTRUCOES-DO-PACOTE.html');
  const pdfGuidePath = path.join(pkgDir, 'INSTRUCOES-DO-PACOTE.pdf');
  const readmePath = path.join(pkgDir, 'README.md');

  fs.writeFileSync(htmlGuidePath, guideHtml);

  // README rápido em Markdown
  const readmeMd = `# ${pkg.name}
**Estrutura:** ${pkg.structureType}
**Desenvolvido por:** RMTI Tecnologia

---

## 🚀 Como Começar
1. Abra \`index.html\` no seu navegador para ver a página.
2. Acesse \`admin/index.html\` para alterar textos, logos, preços e contatos.
   - **Senha inicial:** \`123456\`
3. Veja o arquivo \`INSTRUCOES-DO-PACOTE.pdf\` para o tutorial passo a passo ilustrado.

---
© 2026 RMTI. Todos os direitos reservados.
`;
  fs.writeFileSync(readmePath, readmeMd);

  // Compilar PDF via Microsoft Edge Headless
  try {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    if (fs.existsSync(edgePath)) {
      execSync(`"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfGuidePath}" "${htmlGuidePath}"`, { stdio: 'ignore' });
      console.log(`PDF de instruções gerado: ${pdfGuidePath}`);
    }
  } catch (err) {
    console.warn(`Não foi possível gerar PDF para ${pkg.id}:`, err.message);
  }
}

// =============================================================================
// EXECUÇÃO PRINCIPAL
// =============================================================================
PACKAGES.forEach(pkg => {
  if (pkg.id === 'pacote-01-vendas-diretas') generatePackage01(pkg);
  else if (pkg.id === 'pacote-02-leads-whatsapp') generatePackage02(pkg);
  else if (pkg.id === 'pacote-03-institucional-negocios') generatePackage03(pkg);
});

console.log('Todos os 3 pacotes foram criados e estruturados com sucesso!');
