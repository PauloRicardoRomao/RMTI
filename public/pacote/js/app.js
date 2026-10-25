/**
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
    const cleanNum = cfg.whatsapp.replace(/\D/g, '');
    const defaultMsg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site.');
    document.querySelectorAll('.whatsapp-btn').forEach(btn => {
      const specificMsg = btn.getAttribute('data-msg');
      const msg = specificMsg ? encodeURIComponent(specificMsg) : defaultMsg;
      btn.href = `https://wa.me/${cleanNum}?text=${msg}`;
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
