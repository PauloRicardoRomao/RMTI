/**
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
    const cleanNum = cfg.whatsapp.replace(/\D/g, '');
    const msg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site.');
    document.querySelectorAll('.whatsapp-link').forEach(a => {
      a.href = `https://wa.me/${cleanNum}?text=${msg}`;
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
