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
    const msg = encodeURIComponent(cfg.whatsappMessage || 'Olá! Vim pelo site institucional.');
    document.querySelectorAll('.whatsapp-btn').forEach(a => {
      a.href = `https://wa.me/${cleanNum}?text=${msg}`;
    });
  }
});
