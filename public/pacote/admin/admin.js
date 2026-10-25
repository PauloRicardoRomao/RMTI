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

    const content = '/**\n * Arquivo gerado pelo Painel Admin • Pacote All-in-One RMTI\n * Substitua este arquivo na pasta /js/config.js antes de publicar na hospedagem.\n */\nconst DEFAULT_CONFIG = ' + JSON.stringify(exportCfg, null, 2) + ';\n\n(function() {\n  const saved = localStorage.getItem(\'' + STORAGE_KEY + '\');\n  if (saved) {\n    try {\n      window.PAGE_CONFIG = Object.assign({}, DEFAULT_CONFIG, JSON.parse(saved));\n    } catch (e) {\n      window.PAGE_CONFIG = DEFAULT_CONFIG;\n    }\n  } else {\n    window.PAGE_CONFIG = DEFAULT_CONFIG;\n  }\n})();\n';
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
