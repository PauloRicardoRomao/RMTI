emailjs.init({
    publicKey: "tZWo-0d__8j4AmxKX"
});

function Mensagem() {
    const modal = document.getElementById("msg-status");

    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    const conteudoModal = `
        <div class="conteudoModal" id="conteudoModal">
            <button id="btn-fechar-modal" class="btn-fechar">X</button>
            <div id="mensagem-modal"></div>
        </div>
    `;

    modal.innerHTML = conteudoModal;

    document.getElementById("btn-fechar-modal").addEventListener("click", function () {
        modal.style.display = "none";
        modal.innerHTML = "";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-contato");
    const campoTime = document.getElementById("time");
    const modal = document.getElementById("msg-status");
    const botao = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        campoTime.value = new Date().toLocaleString("pt-BR");

        Mensagem();

        const msgStatus = document.getElementById("mensagem-modal");

        botao.disabled = true;
        botao.textContent = "Enviando...";

        emailjs.sendForm("service_42c8knx", "template_g7hu216", form)
            .then(function () {
                form.reset();
                msgStatus.innerHTML = "<p class='sucesso-envio'>Mensagem enviada com sucesso! Em breve entraremos em contato.</p>";
                botao.disabled = false;
                botao.textContent = "Enviar";
            })
            .catch(function (error) {
                console.error("Erro ao enviar:", error);
                msgStatus.innerHTML = "<p class='erro-envio'>Erro ao enviar mensagem. Tente novamente mais tarde.</p>";
                botao.disabled = false;
                botao.textContent = "Enviar";
            });
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
            modal.innerHTML = "";
        }
    });
});