/**
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
    const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) return 'https://www.youtube.com/embed/' + ytMatch[1];
    const vimeoMatch = trimmed.match(/vimeo\.com\/([0-9]+)/);
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
    const cleanNum = cfg.whatsapp.replace(/\D/g, '');
    const defaultMsg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site.');
    document.querySelectorAll('.whatsapp-btn').forEach(btn => {
      const specificMsg = btn.getAttribute('data-msg');
      const msg = specificMsg ? encodeURIComponent(specificMsg) : defaultMsg;
      btn.href = `https://wa.me/${cleanNum}?text=${msg}`;
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
        const cleanNum = cfg.whatsapp.replace(/\D/g, '');
        const msg = encodeURIComponent('Olá! Solicito uma Proposta Comercial B2B.\n\n• Nome: ' + name + '\n• Empresa: ' + company + '\n• Contato: ' + phone + '\n• Demanda: ' + need);
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
