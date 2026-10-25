# 🚀 Pacote de Landing Page All-in-One • Documentação Técnica

[![Versão](https://img.shields.io/badge/versão-2.5%20LTS-emerald.svg)](#)
[![Stack](https://img.shields.io/badge/stack-Vanilla%20ES6%2B%20%7C%20Tailwind%20CDN-blue.svg)](#)
[![Compatibilidade](https://img.shields.io/badge/hospedagem-Vercel%20%7C%20cPanel%20%7C%20Netlify%20%7C%20Offline-green.svg)](#)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-RMTI%20Propriet%C3%A1ria-black.svg)](#)

Esta documentação foi elaborada para **desenvolvedores, agências e equipes técnicas** encarregadas de dar suporte, customizar, integrar ou manter este projeto para clientes finais.

---

## 🏛️ 1. Visão Geral da Arquitetura

O projeto foi intencionalmente construído com **padrões abertos da Web (Vanilla HTML5, CSS3 Moderno e JavaScript ES6+)** e **Tailwind CSS via CDN oficial**, dispensando qualquer etapa de compilação complexa (*no build step*).

### Por que esta arquitetura foi escolhida:
- **Zero Dependências de Runtime:** Não necessita de Node.js, Webpack, Vite, Gulp ou npm para rodar em produção.
- **Portabilidade Total:** Pode ser hospedado na Vercel, Netlify, Cloudflare Pages, GitHub Pages, servidores Linux cPanel/Apache/Nginx ou ser aberto localmente com duplo clique via protocolo `file://`.
- **Manutenção Simplificada:** Qualquer desenvolvedor front-end consegue inspecionar, alterar e estender o código em minutos.

---

## 📂 2. Estrutura Completa de Pastas e Arquivos

```text
pacote-landing-page/
├── index.html                   # Landing page universal (contém os 3 layouts dinâmicos)
├── checkout.html                # Página de checkout unificada (3 modelos de alta conversão)
├── obrigado.html                # Tela de agradecimento e confirmação com botão WhatsApp
├── admin/                       # Painel Administrativo Próprio do Cliente
│   ├── index.html               # Interface visual (Geral, Modelos, Conteúdo, Ofertas, Senha)
│   └── admin.js                 # Lógica de autenticação, binding reativo e gerador de config.js
├── css/
│   └── style.css                # Estilização complementar, efeitos glassmorphism e regras de layout
├── js/
│   ├── config.js                # Objeto de configuração mestre (window.PAGE_CONFIG)
│   └── app.js                   # Motor de renderização, FAQ retrátil e integração WhatsApp
├── assets/
│   └── imagens/                 # Imagens placeholders e logotipos oficiais
│       ├── logo-placeholder.png           # (400x120px) Placeholder "SUA LOGO AQUI"
│       ├── banner-placeholder.png         # (1200x675px) Placeholder "SEU BANNER AQUI"
│       ├── especialista-placeholder.png   # (600x750px) Placeholder do Modelo 02
│       ├── rmti-logo.png                  # Logotipo oficial da RMTI Tecnologia
│       └── rmti-icone.png                 # Ícone oficial da RMTI
├── MANUAL-ILUSTRADO.html        # Manual do cliente formatado para visualização em navegadores
├── MANUAL-ILUSTRADO.pdf         # Manual ilustrado compilado em PDF de alta resolução (A4)
└── README.md                    # Esta documentação técnica
```

---

## 🔄 3. Motor de Alternância de Layouts (`data-active-layout`)

Os 3 modelos de layout residem no mesmo arquivo `index.html`. Cada bloco de conteúdo recebe o atributo `data-layout="nome-do-layout"`.

### Os 3 Layouts Disponíveis:
1. `vendas-diretas`: **Modelo 01** — Urgência superior, headline com promessa, player VSL dark, grid de 4 módulos, box de garantia de 7 dias, oferta promocional (R$ 497 por R$ 197), FAQ retrátil e CTA de checkout.
2. `leads-whatsapp`: **Modelo 02** — Header de contato, especialista com foto em moldura neon esmeralda, 4 pilares metodológicos, 3 planos comparativos de investimento e botão WhatsApp pulsante.
3. `institucional`: **Modelo 03** — Posicionamento executivo B2B, estatísticas de impacto (+500 Projetos, 99.8% Uptime), catálogo de 4 serviços e formulário/CTA de proposta comercial.

### Como a Alternância é Executada:
Ao carregar a página, `js/app.js` lê o valor `config.activeLayout` e aplica no `<body>`:

```javascript
document.body.setAttribute('data-active-layout', config.activeLayout || 'vendas-diretas');
```

No arquivo `css/style.css`, as regras de exibição e ocultação garantem isolamento perfeito:

```css
/* Oculta seções pertencentes a outros layouts */
body[data-active-layout="vendas-diretas"] [data-layout]:not([data-layout="vendas-diretas"]) {
  display: none !important;
}
body[data-active-layout="leads-whatsapp"] [data-layout]:not([data-layout="leads-whatsapp"]) {
  display: none !important;
}
body[data-active-layout="institucional"] [data-layout]:not([data-layout="institucional"]) {
  display: none !important;
}
```

---

## 💳 4. Motor dos 3 Modelos de Checkout Integrados (`data-active-checkout`)

A página `checkout.html` conta com 3 estruturas visuais especializadas:

| Modelo | Identificador | Foco & Recursos Especiais |
| :--- | :--- | :--- |
| **01** | `conversao-rapida` | **Conversão Rápida (1 Coluna Mobile-First):** Cronômetro de urgência de 15 min, resumo direto, botão Pix com cópia em 1 clique. Ideal para tráfego pago via Instagram/TikTok. |
| **02** | `duas-colunas` | **Alta Conversão (2 Colunas):** Layout dividido com foto do produto, depoimento 5 estrelas e caixinha de **Order Bump (+R$ 47)** que soma o valor ao vivo com animação. |
| **03** | `clean-minimalista` | **Clean B2B Corporativo:** Estética Dark Titanium com seletor de Pessoa Física (CPF) vs. Jurídica (CNPJ) e discriminação detalhada de fatura comercial. |

A alternância segue o mesmo padrão elegante do layout:
```javascript
document.body.setAttribute('data-active-checkout', chk.activeModel || 'conversao-rapida');
```

---

## 🏦 5. Integração com Gateways e Métodos de Recebimento

Na aba *"💳 Modelos & Checkout"* do Painel Admin, o usuário configura o método de recebimento através da chave `paymentMethod`:

### 1. 🔵 Mercado Pago (`paymentMethod: 'mercadopago'`)
- **Modo Link Direto (Sem código):** O cliente cria um link de pagamento no app do Mercado Pago e cola no campo `mercadopagoLink`. No checkout, ao clicar em pagar, é redirecionado instantaneamente.
- **Campos Opcionais para Desenvolvedores:** `mercadopagoPublicKey` e `mercadopagoAccessToken` já previstos no `config.js` para quem desejar plugar a API REST transparente oficial do Mercado Pago.

### 2. ⚡ Pix Direto (`paymentMethod: 'pix_direto'`)
- O cliente preenche: chave Pix (`pixKey`), nome do titular (`pixName`) e instituição (`pixBank`).
- O checkout exibe os dados para transferência imediata com botão de **"Copiar Chave Pix"** e botão de **"Enviar Comprovante no WhatsApp"**.

### 3. 🚀 Outro Gateway (`paymentMethod: 'link_externo'`)
- Permite conectar qualquer plataforma de afiliados e checkout externo: **Kiwify, Hotmart, Eduzz, Stripe, Braip, Monetizze ou Asaas**.
- O checkout redireciona diretamente para o link configurado.

### 4. 💬 Vendas no WhatsApp (`paymentMethod: 'whatsapp'`)
- O cliente preenche seus dados no checkout e, ao submeter, é gerada uma URL `https://wa.me/...` com o pedido completo e formatado.

---

## 🛡️ 6. Isolamento do Modo Demonstração vs. Produção

Para que o pacote funcione tanto como demonstrador no site oficial da RMTI quanto como produto independente vendido ao cliente final, implementamos a detecção de ambiente:

```javascript
const isHttpDemoRoute = window.location.protocol.startsWith('http') &&
  (window.location.pathname === '/pacote' || window.location.pathname.startsWith('/pacote/'));

const isDemoMode = Boolean(
  cfg.isDemo === true ||
  isHttpDemoRoute ||
  new URLSearchParams(window.location.search).get('demo') === 'true'
);

if (!isDemoMode) {
  document.body.classList.remove('demo-mode');
  document.querySelectorAll('.demo-only, #demoTopBar, #btnEditAdmin').forEach(el => el.remove());
}
```

Dessa forma, o comprador recebe um site **100% limpo, sem marcas de teste**, preservando apenas o selo elegante no rodapé:
`Desenvolvido por RMTI • Soluções em Tecnologia`.

---

## ⚙️ 7. Ciclo de Vida dos Dados e Painel Admin

1. **Camada 1 — Padrão de Fábrica:** `DEFAULT_CONFIG` declarado em `js/config.js`.
2. **Camada 2 — Cache do Navegador:** O Painel Admin salva alterações no `localStorage` sob a chave `LP_ALLINONE_CONFIG`.
3. **Camada 3 — Persistência Definitiva:** O botão **"Baixar config.js"** gera via JavaScript `Blob` um novo arquivo `config.js` contendo o estado atualizado. Basta substituir o arquivo em `js/config.js` para persistir em qualquer servidor.

### Segurança do Admin:
- Senha de fábrica: `123456`.
- Primeiro login exige obrigatoriamente a troca de senha.
- A senha pessoal é gravada sob a chave `LP_ADMIN_PASSWORD` no `localStorage`.

---

## 🚀 8. Guia de Publicação e Servidores

### Deploy na Vercel (Recomendado):
```bash
# Usando Vercel CLI
vercel --prod
```
Ou simplesmente conecte seu repositório Git ou arraste a pasta para o dashboard da Vercel.

### Configuração Apache (`.htaccess`):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  # Forçar HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Configuração Nginx:
```nginx
server {
    listen 80;
    server_name seusite.com.br;
    root /var/www/pacote-landing-page;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(jpg|jpeg|png|webp|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 📋 9. Checklist de Entrega para Clientes

Ao entregar a landing page para um cliente, realize a checagem:
- [ ] Logotipo inserido em `assets/imagens/logo-placeholder.png` (400x120px)
- [ ] Banner e fotos atualizados com as imagens do cliente
- [ ] Modelo de layout escolhido e testado (01, 02 ou 03)
- [ ] Modelo de checkout selecionado (1, 2 ou 3)
- [ ] Forma de recebimento configurada (Mercado Pago, Pix ou Link Externo)
- [ ] Preços e parcelas alinhados com a oferta do cliente
- [ ] Número do WhatsApp testado no botão flutuante e no formulário
- [ ] Arquivo `config.js` baixado e substituído em `js/config.js`
- [ ] Senha do Admin trocada pelo cliente

---

## 📞 Suporte Oficial & Licenciamento

Este pacote é um produto com direitos de uso e desenvolvimento protegidos pela **RMTI • Soluções em Tecnologia**.

- **E-mail de Suporte:** pauloromao.dev2020@gmail.com
- **Site Oficial:** https://rmti-tecnologia.vercel.app
- **Desenvolvido por:** Equipe de Engenharia de Software da RMTI

© 2026 RMTI • Todos os direitos reservados.

