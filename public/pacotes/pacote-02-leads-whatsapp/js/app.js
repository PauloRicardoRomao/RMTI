document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.PAGE_CONFIG || {};

  document.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.getAttribute('data-bind');
    if (cfg[key] !== undefined && cfg[key] !== '') {
      if (el.tagName === 'IMG') el.src = cfg[key];
      else el.textContent = cfg[key];
    }
  });

  if (cfg.whatsapp) {
    const cleanNum = cfg.whatsapp.replace(/\D/g, '');
    const defaultMsg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site.');
    document.querySelectorAll('.whatsapp-btn').forEach(btn => {
      const specificMsg = btn.getAttribute('data-msg');
      const finalMsg = specificMsg ? encodeURIComponent(specificMsg) : defaultMsg;
      btn.href = `https://wa.me/${cleanNum}?text=${finalMsg}`;
    });
  }
});
