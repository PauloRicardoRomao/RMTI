/**
 * Lógica do Painel de Controle • Pacote 02: Captura & WhatsApp Pré-Qualificado
 */
document.addEventListener('DOMContentLoaded', () => {
  const PKG_ID = 'pacote-02-leads-whatsapp';
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
    const content = '/**\n * Arquivo gerado pelo Painel Admin • ' + PKG_ID + '\n */\nconst DEFAULT_CONFIG = ' + JSON.stringify(current, null, 2) + ';\nwindow.PAGE_CONFIG = DEFAULT_CONFIG;\n';
    
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
