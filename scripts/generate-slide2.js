const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateSlide2() {
  console.log('Gerando novo slide 02 para o Case de Sucesso...');

  const width = 1024;
  const height = 1024;

  const svgContent = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#080c16"/>
        <stop offset="50%" stop-color="#0c1322"/>
        <stop offset="100%" stop-color="#060911"/>
      </linearGradient>

      <!-- Glow radial -->
      <radialGradient id="glowBlue" cx="20%" cy="15%" r="60%">
        <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowEmerald" cx="80%" cy="85%" r="60%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </radialGradient>

      <!-- Card Gradients -->
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#162032" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#0e1726" stop-opacity="0.85"/>
      </linearGradient>
      <linearGradient id="cardBorder1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.2"/>
      </linearGradient>
      <linearGradient id="cardBorder2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#059669" stop-opacity="0.2"/>
      </linearGradient>

      <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <style>
      .font-sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .title-bold { font-weight: 800; letter-spacing: -0.03em; }
      .desc-text { font-weight: 400; line-height: 1.45; }
    </style>

    <!-- Background Base -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
    <rect width="${width}" height="${height}" fill="url(#glowBlue)"/>
    <rect width="${width}" height="${height}" fill="url(#glowEmerald)"/>

    <!-- Subtle Tech Grid Lines -->
    <g opacity="0.07" stroke="#38bdf8" stroke-width="1">
      <line x1="0" y1="128" x2="1024" y2="128"/>
      <line x1="0" y1="256" x2="1024" y2="256"/>
      <line x1="0" y1="384" x2="1024" y2="384"/>
      <line x1="0" y1="512" x2="1024" y2="512"/>
      <line x1="0" y1="640" x2="1024" y2="640"/>
      <line x1="0" y1="768" x2="1024" y2="768"/>
      <line x1="0" y1="896" x2="1024" y2="896"/>
      
      <line x1="128" y1="0" x2="128" y2="1024"/>
      <line x1="256" y1="0" x2="256" y2="1024"/>
      <line x1="384" y1="0" x2="384" y2="1024"/>
      <line x1="512" y1="0" x2="512" y2="1024"/>
      <line x1="640" y1="0" x2="640" y2="1024"/>
      <line x1="768" y1="0" x2="768" y2="1024"/>
      <line x1="896" y1="0" x2="896" y2="1024"/>
    </g>

    <!-- Top Badge -->
    <g transform="translate(64, 52)">
      <rect width="320" height="36" rx="18" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" opacity="0.9"/>
      <circle cx="20" cy="18" r="5" fill="#10b981"/>
      <text x="36" y="23" fill="#93c5fd" font-size="13" font-weight="700" class="font-sans" letter-spacing="0.08em">CASE DE SUCESSO • RMTI</text>
    </g>

    <!-- Header Section -->
    <text x="64" y="145" fill="#f8fafc" font-size="44" font-weight="800" class="font-sans title-bold">A Solução Desenvolvida</text>
    <text x="64" y="185" fill="#94a3b8" font-size="20" font-weight="500" class="font-sans">
      Pilares da estrutura digital que multiplicou a captação do Treinador Renan:
    </text>

    <!-- 4 Deliverable Cards Grid (2x2) -->

    <!-- CARD 1: Velocidade -->
    <g transform="translate(64, 230)" filter="url(#dropShadow)">
      <rect width="428" height="290" rx="20" fill="url(#cardGrad)" stroke="url(#cardBorder1)" stroke-width="1.5"/>
      <rect x="24" y="24" width="52" height="52" rx="14" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="40" y="58" fill="#38bdf8" font-size="24" font-weight="800" class="font-sans">⚡</text>

      <rect x="330" y="24" width="74" height="28" rx="14" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1"/>
      <text x="342" y="43" fill="#7dd3fc" font-size="12" font-weight="700" class="font-sans">0.4s EDGE</text>

      <text x="24" y="115" fill="#38bdf8" font-size="13" font-weight="800" class="font-sans" letter-spacing="0.1em">01. PERFORMANCE EXTREMA</text>
      <text x="24" y="150" fill="#f1f5f9" font-size="24" font-weight="700" class="font-sans">Carregamento em 0.4s</text>
      
      <text x="24" y="186" fill="#94a3b8" font-size="15" class="font-sans desc-text">
        <tspan x="24" dy="0">Desenvolvida com Next.js 16 e Vercel Edge.</tspan>
        <tspan x="24" dy="24">Elimina a fuga de visitantes com nota 100</tspan>
        <tspan x="24" dy="24">no Google PageSpeed no mobile e desktop.</tspan>
      </text>
    </g>

    <!-- CARD 2: Vídeos & Biomecânica -->
    <g transform="translate(532, 230)" filter="url(#dropShadow)">
      <rect width="428" height="290" rx="20" fill="url(#cardGrad)" stroke="url(#cardBorder2)" stroke-width="1.5"/>
      <rect x="24" y="24" width="52" height="52" rx="14" fill="#059669" fill-opacity="0.2" stroke="#34d399" stroke-width="1.5"/>
      <text x="40" y="58" fill="#34d399" font-size="24" font-weight="800" class="font-sans">▶</text>

      <rect x="316" y="24" width="88" height="28" rx="14" fill="#065f46" fill-opacity="0.3" stroke="#34d399" stroke-width="1"/>
      <text x="328" y="43" fill="#6ee7b7" font-size="12" font-weight="700" class="font-sans">HD PLAYER</text>

      <text x="24" y="115" fill="#34d399" font-size="13" font-weight="800" class="font-sans" letter-spacing="0.1em">02. AUTORIDADE VISUAL</text>
      <text x="24" y="150" fill="#f1f5f9" font-size="24" font-weight="700" class="font-sans">Player Biomecânico HD</text>
      
      <text x="24" y="186" fill="#94a3b8" font-size="15" class="font-sans desc-text">
        <tspan x="24" dy="0">Demonstração interativa de execuções</tspan>
        <tspan x="24" dy="24">corretas de exercícios e postura, gerando</tspan>
        <tspan x="24" dy="24">autoridade e desejo de consultoria imediato.</tspan>
      </text>
    </g>

    <!-- CARD 3: Painel CMS -->
    <g transform="translate(64, 550)" filter="url(#dropShadow)">
      <rect width="428" height="290" rx="20" fill="url(#cardGrad)" stroke="url(#cardBorder2)" stroke-width="1.5"/>
      <rect x="24" y="24" width="52" height="52" rx="14" fill="#059669" fill-opacity="0.2" stroke="#34d399" stroke-width="1.5"/>
      <text x="40" y="58" fill="#34d399" font-size="24" font-weight="800" class="font-sans">⚙</text>

      <rect x="312" y="24" width="92" height="28" rx="14" fill="#065f46" fill-opacity="0.3" stroke="#34d399" stroke-width="1"/>
      <text x="325" y="43" fill="#6ee7b7" font-size="12" font-weight="700" class="font-sans">SEM CÓDIGO</text>

      <text x="24" y="115" fill="#34d399" font-size="13" font-weight="800" class="font-sans" letter-spacing="0.1em">03. GESTÃO AUTÔNOMA</text>
      <text x="24" y="150" fill="#f1f5f9" font-size="24" font-weight="700" class="font-sans">Painel CMS Exclusivo</text>
      
      <text x="24" y="186" fill="#94a3b8" font-size="15" class="font-sans desc-text">
        <tspan x="24" dy="0">Painel administrativo (/admin) próprio onde</tspan>
        <tspan x="24" dy="24">o treinador altera planos, vagas e depoimentos</tspan>
        <tspan x="24" dy="24">pelo celular, sem depender de programador.</tspan>
      </text>
    </g>

    <!-- CARD 4: Conversão WhatsApp -->
    <g transform="translate(532, 550)" filter="url(#dropShadow)">
      <rect width="428" height="290" rx="20" fill="url(#cardGrad)" stroke="url(#cardBorder1)" stroke-width="1.5"/>
      <rect x="24" y="24" width="52" height="52" rx="14" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="40" y="58" fill="#38bdf8" font-size="24" font-weight="800" class="font-sans">💬</text>

      <rect x="306" y="24" width="98" height="28" rx="14" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1"/>
      <text x="317" y="43" fill="#7dd3fc" font-size="12" font-weight="700" class="font-sans">R$ 780 TICKET</text>

      <text x="24" y="115" fill="#38bdf8" font-size="13" font-weight="800" class="font-sans" letter-spacing="0.1em">04. FILTRO DE CONVERSÃO</text>
      <text x="24" y="150" fill="#f1f5f9" font-size="24" font-weight="700" class="font-sans">WhatsApp Pré-Qualificado</text>
      
      <text x="24" y="186" fill="#94a3b8" font-size="15" class="font-sans desc-text">
        <tspan x="24" dy="0">Botões com parâmetros de plano e UTM.</tspan>
        <tspan x="24" dy="24">O aluno chega ciente dos valores e metodologia,</tspan>
        <tspan x="24" dy="24">eliminando curiosos e fechando planos altos.</tspan>
      </text>
    </g>

    <!-- Bottom Footer Bar -->
    <g transform="translate(64, 880)">
      <rect width="896" height="84" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      
      <!-- Brand icon / text -->
      <rect x="24" y="18" width="48" height="48" rx="12" fill="#2563eb"/>
      <text x="33" y="50" fill="#ffffff" font-size="20" font-weight="900" class="font-sans">RMTI</text>
      
      <text x="86" y="40" fill="#f8fafc" font-size="18" font-weight="700" class="font-sans">RMTI • Soluções em Tecnologia</text>
      <text x="86" y="60" fill="#64748b" font-size="14" font-weight="500" class="font-sans">Engenharia de Software, Landing Pages &amp; Sistemas</text>

      <!-- Badge Result -->
      <rect x="616" y="24" width="256" height="36" rx="18" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5"/>
      <circle cx="634" cy="42" r="4" fill="#34d399"/>
      <text x="646" y="47" fill="#6ee7b7" font-size="13" font-weight="700" class="font-sans">100% Validado em Produção</text>
    </g>
  </svg>
  `;

  const outputPath = path.join(__dirname, '../public/assets/cases/slide-02-solucao.jpg');
  
  await sharp(Buffer.from(svgContent))
    .jpeg({ quality: 95, progressive: true })
    .toFile(outputPath);

  console.log('Slide 02 gerado com sucesso em:', outputPath);
}

generateSlide2().catch(console.error);

