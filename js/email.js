emailjs.init({
    publicKey: "tZWo-0d__8j4AmxKX"
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-contato");
    const campoTime = document.getElementById("time");
    const msgStatus = document.getElementById("msg-status");
    const botao = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        campoTime.value = new Date().toLocaleString("pt-BR");
        msgStatus.innerHTML = "";
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
});