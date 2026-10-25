/**
 * RMTI - Integração com EmailJS e Gerenciamento de Modal Nativo (<dialog>)
 * Em conformidade com modern-web-guidance (light-dismiss-a-dialog, forms)
 */

// ==========================================
// 1. CONFIGURAÇÃO EMAILJS
// ==========================================
const EMAILJS_CONFIG = {
    publicKey: "tZWo-0d__8j4AmxKX",
    serviceId: "service_42c8knx",
    templateId: "template_g7hu216"
};

// Inicializa o EmailJS
if (window.emailjs) {
    emailjs.init({
        publicKey: EMAILJS_CONFIG.publicKey
    });
}

// ==========================================
// 2. CONTROLE DO MODAL NATIVO (<dialog>)
// ==========================================
function exibirModalFeedback(tipo, titulo, mensagem) {
    const dialog = document.getElementById("modal-feedback");
    const modalIcone = document.getElementById("modal-icone");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalMensagem = document.getElementById("modal-mensagem");

    if (!dialog) return;

    if (modalTitulo) modalTitulo.textContent = titulo;
    if (modalMensagem) modalMensagem.textContent = mensagem;

    if (modalIcone) {
        if (tipo === 'sucesso') {
            modalIcone.textContent = "✓";
            modalIcone.className = "modal-icone icone-sucesso";
        } else {
            modalIcone.textContent = "✕";
            modalIcone.className = "modal-icone icone-erro";
        }
    }

    // Abre o modal nativo acessível com foco gerenciado
    dialog.showModal();
}

// ==========================================
// 3. INICIALIZAÇÃO E ENVIO DO FORMULÁRIO
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-contato");
    const campoTime = document.getElementById("time");
    const botaoEnviar = document.getElementById("btn-enviar-form");
    const dialog = document.getElementById("modal-feedback");
    const btnFechar = document.getElementById("btn-fechar-modal");
    const btnConfirmar = document.getElementById("btn-confirmar-modal");

    if (!form) return;

    // 3.1 Botões de fechamento do Modal
    if (btnFechar && dialog) {
        btnFechar.addEventListener("click", () => dialog.close());
    }
    if (btnConfirmar && dialog) {
        btnConfirmar.addEventListener("click", () => dialog.close());
    }

    // 3.2 Fallback para Light-Dismiss em navegadores sem suporte ao atributo closedby="any"
    // (Padrão do modern-web-guidance: light-dismiss-a-dialog)
    if (dialog && !('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener('click', (event) => {
            if (event.target !== dialog) return;

            const rect = dialog.getBoundingClientRect();
            const isDialogContent = (
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width
            );

            if (!isDialogContent) {
                dialog.close();
            }
        });
    }

    // 3.3 Submissão do Formulário
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // 3.3.1 Proteção Anti-Spam (Honeypot)
        const honeypot = form.querySelector("input[name='_honeypot']");
        if (honeypot && honeypot.value.trim() !== "") {
            // Robô detectado: simula sucesso silenciosamente sem gastar cota
            form.reset();
            exibirModalFeedback(
                'sucesso',
                'Mensagem Enviada!',
                'Sua mensagem foi recebida com sucesso. Em breve entraremos em contato!'
            );
            return;
        }

        // 3.3.2 Validação nativa do formulário
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 3.3.3 Gravação do timestamp de envio
        if (campoTime) {
            campoTime.value = new Date().toLocaleString("pt-BR");
        }

        // Estado visual de carregamento no botão
        const textoOriginalBtn = botaoEnviar.innerHTML;
        botaoEnviar.disabled = true;
        botaoEnviar.innerHTML = "<span class='btn-texto'>Enviando mensagem...</span>";

        // 3.3.4 Disparo via EmailJS
        emailjs.sendForm(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, form)
            .then(function () {
                form.reset();
                exibirModalFeedback(
                    'sucesso',
                    'Mensagem Enviada!',
                    'Obrigado pelo contato! Sua mensagem foi enviada e entraremos em contato em breve.'
                );
            })
            .catch(function (error) {
                console.error("Erro ao enviar mensagem via EmailJS:", error);
                exibirModalFeedback(
                    'erro',
                    'Erro no Envio',
                    'Não foi possível enviar sua mensagem no momento. Por favor, tente novamente ou fale conosco diretamente pelo WhatsApp.'
                );
            })
            .finally(function () {
                botaoEnviar.disabled = false;
                botaoEnviar.innerHTML = textoOriginalBtn;
            });
    });
});