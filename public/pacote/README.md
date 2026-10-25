# 🚀 Pacote de Landing Page All-in-One • Documentação Técnica

Este documento foi elaborado para desenvolvedores e equipes técnicas que forem dar suporte, estender ou integrar este projeto.

---

## 🏛️ 1. Arquitetura do Projeto

O projeto foi construído utilizando **Vanilla Web Standards (HTML5, CSS3 moderno e JavaScript ES6+)** com suporte a **Tailwind CSS via CDN**. 
Não há dependência de compiladores complexos (Webpack, Vite, npm ou Node.js em runtime), o que garante que a página execute em:
- Qualquer servidor estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages)
- Servidores tradicionais Apache / Nginx / cPanel
- Execução local offline via protocolo `file://` com duplo clique

---

## 📂 2. Estrutura de Pastas e Arquivos

```text
pacote-landing-page/
├── index.html                   # Página principal contendo os 3 layouts dinâmicos
├── checkout.html                # Checkout universal limpo (Pix Copia e Cola / Cartão)
├── obrigado.html                # Página de agradecimento pós-conversão
├── admin/                       # Painel Administrativo do Cliente
│   ├── index.html               # Interface de controle com seletor de modelos
│   └── admin.js                 # Lógica de autenticação e exportação de config.js
├── css/
│   └── style.css                # Estilização complementar, fontes e regras de layout
├── js/
│   ├── app.js                   # Controlador de dados, acordeão FAQ e WhatsApp
│   └── config.js                # Objeto de configuração padrão (window.PAGE_CONFIG)
├── assets/
│   └── imagens/                 # Imagens placeholders ("SUA LOGO AQUI", banners, fotos)
├── MANUAL-ILUSTRADO.pdf         # Manual ilustrado para usuários não técnicos
├── MANUAL-ILUSTRADO.html        # Versão web do manual ilustrado
└── README.md                    # Esta documentação técnica
```

---

## 🔄 3. Como Funciona a Alternância dos 3 Layouts

A alternância entre os 3 modelos de layout é controlada pelo atributo `activeLayout` no arquivo `js/config.js` ou no `localStorage`:

- `vendas-diretas`: Layout 01 com foco em VSL, módulos de curso, oferta com preço e checkout.
- `leads-whatsapp`: Layout 02 com foco em autoridade do especialista, planos e botão WhatsApp.
- `institucional`: Layout 03 com foco corporativo, métricas de impacto (+500 Projetos) e proposta comercial.

No CSS (`css/style.css`), as seções recebem o atributo `data-layout="nome-do-layout"`. Ao alterar o atributo no `<body>`, o CSS e o script `js/app.js` ativam apenas a estrutura correspondente:

```css
body[data-active-layout="vendas-diretas"] [data-layout]:not([data-layout="vendas-diretas"]) {
  display: none !important;
}
```

---

## 💳 4. Os 3 Modelos de Checkout Integrados

O projeto acompanha 3 estruturas de checkout configuráveis no painel:

1. **⚡ Modelo 1: Conversão Rápida (1 Coluna Mobile-First):** Focado em velocidade para tráfego mobile, com cronômetro de urgência, resumo condensado e botão Pix com cópia em 1 clique.
2. **📊 Modelo 2: Alta Conversão (2 Colunas com Order Bump & Prova Social):** Estrutura clássica de grandes lançamentos. Inclui resumo lateral com foto do produto, depoimento com 5 estrelas e caixinha dinâmica de **Order Bump (+R$ 47)** que recalcula o valor total na hora.
3. **🏢 Modelo 3: Minimalista Premium (Clean B2B Corporativo):** Interface dark titanium com seletor de Pessoa Física (CPF) vs. Jurídica (CNPJ) e discriminação detalhada da fatura comercial.

A alternância é controlada por `body[data-active-checkout="nome-do-modelo"]` e configurável visualmente na aba **"Modelos & Checkout"** do Painel Admin.

---

## 🛡️ 5. Separação de Modo Demonstração vs. Produção

- **No pacote do cliente:** A barra superior de demonstração ("PACOTE DE LANDING PAGE") e o botão "⚙️ Editar no Admin" da navbar ficam **ocultos e desativados**. O cliente e seus visitantes veem apenas o site limpo e profissional.
- **Na demonstração pública da RMTI:** Caso acesse via rota `/pacote` ou com `?demo=true`, os controles de teste são ativados para os visitantes experimentarem os recursos.
- **Assinatura no Rodapé:** O rodapé carrega o selo elegante com a logo oficial da **RMTI (Desenvolvido por RMTI • Soluções em Tecnologia)** com link para o site oficial.

---

## ⚙️ 6. Fluxo de Dados e Painel Admin

1. **Leitura de Dados:** O arquivo `js/config.js` define o objeto `DEFAULT_CONFIG` e expõe `window.PAGE_CONFIG`. Se existir uma cópia salva em `localStorage.getItem('LP_ALLINONE_CONFIG')`, ela tem precedência.
2. **Edição Visual:** Ao abrir `admin/index.html`, o cliente altera textos, preços, telefones, checkout e modelos.
3. **Persistência Temporária:** Ao clicar em "Salvar Alterações", os dados são persistidos no `localStorage`.
4. **Persistência Definitiva:** Ao clicar em "Baixar config.js", o script cria dinamicamente um arquivo `config.js` contendo os dados atuais. O desenvolvedor ou cliente só precisa substituir o arquivo dentro de `js/config.js`.

---

## 🔐 7. Autenticação do Painel Admin

- A autenticação é executada no cliente em `admin/admin.js`.
- **Senha inicial:** `123456`.
- No primeiro acesso, a chave `LP_FIRST_LOGIN_DONE` é checada. Se for o primeiro acesso, o modal de troca de senha é disparado obrigatoriamente.
- A nova senha é salva sob a chave `LP_ADMIN_PASSWORD` no `localStorage`.

---

## 🚀 8. Instruções para Publicação

### Deploy na Vercel:
1. Conecte o repositório ou arraste a pasta diretamente para o dashboard da Vercel.
2. Framework Preset: **Other**.
3. Output Directory: **./** (raiz).
4. O deploy será concluído em menos de 1 minuto.

### Hospedagem cPanel / Apache / Nginx:
1. Envie todos os arquivos para a pasta `public_html`.
2. Certifique-se de que o certificado SSL esteja ativado.

---
© 2026 RMTI • Soluções Inteligentes em Tecnologia.
