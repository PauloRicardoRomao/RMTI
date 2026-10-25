/**
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
    const content = '/**\n * Arquivo gerado pelo Painel Admin • Pacote All-in-One\n */\nconst DEFAULT_CONFIG = ' + JSON.stringify(currentConfig, null, 2) + ';\nwindow.PAGE_CONFIG = DEFAULT_CONFIG;\n';
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
