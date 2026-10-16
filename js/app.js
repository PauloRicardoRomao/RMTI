/**
 * RMTI - Script Principal de Interação
 */

// ==========================================
// 1. CONFIGURAÇÃO DE CONTATO (WHATSAPP)
// ==========================================
// Nota: O formato internacional para o WhatsApp é: 55 + DDD (2 dígitos) + 9 dígitos.
// Exemplo DDD 81: 5581998627852.
const WHATSAPP_CONFIG = {
    numero: '55814998627852', // Verifique o número comercial aqui
    mensagemPadrao: 'Olá! Vim pelo site da RMTI e gostaria de solicitar um orçamento para o meu projeto.'
};

function abrirWhatsApp(mensagem = WHATSAPP_CONFIG.mensagemPadrao) {
    const url = `https://wa.me/${WHATSAPP_CONFIG.numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

// ==========================================
// 2. INICIALIZAÇÃO DE EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 2.1 Botões de WhatsApp (Hero e Header)
    const btnOrcamento = document.getElementById('btn-orcamento');
    const btnWppNav = document.getElementById('btn-wpp-nav');

    if (btnOrcamento) {
        btnOrcamento.addEventListener('click', () => abrirWhatsApp());
    }

    if (btnWppNav) {
        btnWppNav.addEventListener('click', () => abrirWhatsApp());
    }

    // 2.2 Menu Hambúrguer Mobile
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const menuLinks = document.getElementById('menu-links');

    if (btnMenuToggle && menuLinks) {
        btnMenuToggle.addEventListener('click', () => {
            const isAberto = menuLinks.classList.toggle('menu-aberto');
            btnMenuToggle.classList.toggle('ativo', isAberto);
            btnMenuToggle.setAttribute('aria-expanded', isAberto ? 'true' : 'false');
        });

        // Fechar menu ao clicar em qualquer link
        const linksNav = menuLinks.querySelectorAll('.item-menu a');
        linksNav.forEach(link => {
            link.addEventListener('click', () => {
                menuLinks.classList.remove('menu-aberto');
                btnMenuToggle.classList.remove('ativo');
                btnMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Fechar menu ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (!menuLinks.contains(e.target) && !btnMenuToggle.contains(e.target)) {
                menuLinks.classList.remove('menu-aberto');
                btnMenuToggle.classList.remove('ativo');
                btnMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 2.3 Máscara de Telefone / WhatsApp no Formulário
    const campoTelefone = document.getElementById('campo-telefone');
    if (campoTelefone) {
        campoTelefone.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, ''); // Remove não dígitos
            if (valor.length > 11) valor = valor.slice(0, 11);

            if (valor.length > 10) {
                // Formato Celular: (XX) XXXXX-XXXX
                e.target.value = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            } else if (valor.length > 6) {
                // Formato Fixo/Parcial: (XX) XXXX-XXXX
                e.target.value = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
            } else if (valor.length > 2) {
                e.target.value = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
            } else if (valor.length > 0) {
                e.target.value = valor.replace(/^(\d*)$/, '($1');
            }
        });
    }

    // 2.4 Ano Dinâmico no Rodapé
    const elementoAno = document.getElementById('ano-atual');
    if (elementoAno) {
        elementoAno.textContent = new Date().getFullYear();
    }
});