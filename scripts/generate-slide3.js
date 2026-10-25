const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateSlide3() {
  console.log('Gerando Slide 03 com foto e rosto do Treinador Renan em destaque...');

  const width = 1024;
  const height = 1024;

  // 1. Processar foto do Renan Guilherme com foco perfeito no rosto
  // foto-1.jpg é 1080x1080
  const photoW = 428;
  const photoH = 410;
  
  // Extrair corte focado na face e torso de Renan
  const renanBuffer = await sharp(path.join(__dirname, '../public/assets/cases/foto-1.jpg'))
    .extract({ left: 140, top: 0, width: 800, height: 860 })
    .resize(photoW, photoH, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 95 })
    .toBuffer();

  const photoBase64 = `data:image/jpeg;base64,${renanBuffer.toString('base64')}`;

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
      <radialGradient id="glowEmerald" cx="20%" cy="25%" r="65%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowBlue" cx="80%" cy="75%" r="65%">
        <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
      </radialGradient>

      <!-- Card Gradients -->
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#162032" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#0e1726" stop-opacity="0.9"/>
      </linearGradient>
      <linearGradient id="borderEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#059669" stop-opacity="0.2"/>
      </linearGradient>
      <linearGradient id="borderBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.2"/>
      </linearGradient>

      <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
      </filter>

      <!-- ClipPath para foto com cantos arredondados -->
      <clipPath id="photoClip">
        <rect width="${photoW}" height="${photoH}" rx="20" ry="20"/>
      </clipPath>
    </defs>

    <style>
      .font-sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .title-bold { font-weight: 800; letter-spacing: -0.03em; }
      .desc-text { font-weight: 400; line-height: 1.45; }
    </style>

    <!-- Background Base -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
    <rect width="${width}" height="${height}" fill="url(#glowEmerald)"/>
    <rect width="${width}" height="${height}" fill="url(#glowBlue)"/>

    <!-- Subtle Tech Grid Lines -->
    <g opacity="0.06" stroke="#38bdf8" stroke-width="1">
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
    <g transform="translate(64, 46)">
      <rect width="360" height="36" rx="18" fill="#1e293b" stroke="#10b981" stroke-width="1.5" opacity="0.9"/>
      <circle cx="20" cy="18" r="5" fill="#10b981"/>
      <text x="36" y="23" fill="#6ee7b7" font-size="13" font-weight="700" class="font-sans" letter-spacing="0.08em">CASE DE SUCESSO • RESULTADO REAL</text>
    </g>

    <!-- Header Section -->
    <text x="64" y="132" fill="#f8fafc" font-size="40" font-weight="800" class="font-sans title-bold">Depoimento &amp; Resultados Reais</text>
    <text x="64" y="168" fill="#94a3b8" font-size="19" font-weight="500" class="font-sans">
      O impacto da estrutura digital de alta performance na consultoria do Treinador Renan:
    </text>

    <!-- ========================================================================= -->
    <!-- MEIO: FOTO DO RENAN (ESQUERDA) + DEPOIMENTO (DIREITA) -->
    <!-- ========================================================================= -->

    <!-- FOTO DO RENAN COM MOLDURA GLOW -->
    <g transform="translate(64, 205)" filter="url(#dropShadow)">
      <!-- Moldura exterior glow -->
      <rect width="${photoW}" height="${photoH}" rx="20" fill="#0f172a" stroke="url(#borderEmerald)" stroke-width="2"/>
      
      <!-- Imagem do Renan clipada -->
      <g clip-path="url(#photoClip)">
        <image href="${photoBase64}" width="${photoW}" height="${photoH}" preserveAspectRatio="xMidYMin slice"/>
        
        <!-- Gradiente escuro no rodapé da foto para legibilidade do nome -->
        <rect y="${photoH - 110}" width="${photoW}" height="110" fill="url(#bgGrad)" opacity="0.92"/>
      </g>

      <!-- Badge VIP no topo da foto -->
      <rect x="18" y="18" width="168" height="30" rx="15" fill="#0f172a" fill-opacity="0.85" stroke="#10b981" stroke-width="1.2"/>
      <circle cx="33" cy="33" r="4" fill="#34d399"/>
      <text x="44" y="38" fill="#6ee7b7" font-size="12" font-weight="800" class="font-sans">CLIENTE OFICIAL</text>

      <!-- Informações do Renan no rodapé da foto -->
      <text x="20" y="${photoH - 62}" fill="#ffffff" font-size="20" font-weight="800" class="font-sans">Prof. Renan Guilherme</text>
      <text x="20" y="${photoH - 38}" fill="#94a3b8" font-size="13" font-weight="600" class="font-sans">CREF 185468-G/SP • Consultoria Fitness</text>
      <text x="20" y="${photoH - 16}" fill="#34d399" font-size="12" font-weight="700" class="font-sans">★ Caso Real de Sucesso • RMTI</text>
    </g>

    <!-- CARD DO DEPOIMENTO (DIREITA) -->
    <g transform="translate(520, 205)" filter="url(#dropShadow)">
      <rect width="440" height="${photoH}" rx="20" fill="url(#cardGrad)" stroke="url(#borderBlue)" stroke-width="1.8"/>

      <!-- Aspas decorativas -->
      <text x="28" y="70" fill="#38bdf8" fill-opacity="0.3" font-size="70" font-family="Georgia, serif" font-weight="bold">“</text>

      <!-- Estrelas de Avaliação -->
      <g transform="translate(28, 42)">
        <text x="0" y="0" fill="#fbbf24" font-size="18">★★★★★</text>
        <rect x="90" y="-16" width="130" height="24" rx="12" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1"/>
        <text x="100" y="-3" fill="#7dd3fc" font-size="11" font-weight="700" class="font-sans">AVALIAÇÃO NOTA 5.0</text>
      </g>

      <!-- Texto do Depoimento Real -->
      <text x="28" y="112" fill="#f8fafc" font-size="18" font-weight="600" class="font-sans desc-text">
        <tspan x="28" dy="0">"Antes eu perdia horas no direct</tspan>
        <tspan x="28" dy="28">com curiosos pedindo desconto.</tspan>
        <tspan x="28" dy="28">Com a nova estrutura da RMTI,</tspan>
        <tspan x="28" dy="28">fechei <tspan fill="#34d399" font-weight="800">11 novos alunos</tspan> no primeiro</tspan>
        <tspan x="28" dy="28">fim de semana e hoje os alunos já</tspan>
        <tspan x="28" dy="28">chegam prontos para fechar os</tspan>
        <tspan x="28" dy="28">planos de <tspan fill="#38bdf8" font-weight="800">até R$ 780</tspan> no WhatsApp!"</tspan>
      </text>

      <!-- Tag de Impacto no final do depoimento -->
      <g transform="translate(28, 335)">
        <rect width="384" height="48" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1.2"/>
        <text x="16" y="29" fill="#94a3b8" font-size="13" font-weight="600" class="font-sans">
          Ticket Médio: <tspan fill="#f87171" text-decoration="line-through">R$ 80</tspan> → <tspan fill="#34d399" font-weight="800">R$ 697 a R$ 780 (VIP)</tspan>
        </text>
      </g>
    </g>

    <!-- ========================================================================= -->
    <!-- 4 CARDS DE MÉTRICAS VALIDADAS (Y: 645) -->
    <!-- ========================================================================= -->

    <!-- Métrica 1: +11 Alunos -->
    <g transform="translate(64, 645)" filter="url(#dropShadow)">
      <rect width="206" height="180" rx="18" fill="url(#cardGrad)" stroke="url(#borderEmerald)" stroke-width="1.5"/>
      <text x="103" y="65" text-anchor="middle" fill="#34d399" font-size="38" font-weight="900" class="font-sans title-bold">+11</text>
      <text x="103" y="100" text-anchor="middle" fill="#f1f5f9" font-size="16" font-weight="700" class="font-sans">Alunos Fechados</text>
      <text x="103" y="125" text-anchor="middle" fill="#94a3b8" font-size="13" font-weight="500" class="font-sans">Em apenas 48 horas</text>
      <text x="103" y="148" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700" class="font-sans">Estreia no WhatsApp</text>
    </g>

    <!-- Métrica 2: Ticket R$ 780 -->
    <g transform="translate(294, 645)" filter="url(#dropShadow)">
      <rect width="206" height="180" rx="18" fill="url(#cardGrad)" stroke="url(#borderBlue)" stroke-width="1.5"/>
      <text x="103" y="65" text-anchor="middle" fill="#38bdf8" font-size="34" font-weight="900" class="font-sans title-bold">R$ 780</text>
      <text x="103" y="100" text-anchor="middle" fill="#f1f5f9" font-size="16" font-weight="700" class="font-sans">Ticket Médio VIP</text>
      <text x="103" y="125" text-anchor="middle" fill="#94a3b8" font-size="13" font-weight="500" class="font-sans">Planos semestrais</text>
      <text x="103" y="148" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700" class="font-sans">Valorização do serviço</text>
    </g>

    <!-- Métrica 3: 0.4s -->
    <g transform="translate(524, 645)" filter="url(#dropShadow)">
      <rect width="206" height="180" rx="18" fill="url(#cardGrad)" stroke="url(#borderEmerald)" stroke-width="1.5"/>
      <text x="103" y="65" text-anchor="middle" fill="#34d399" font-size="38" font-weight="900" class="font-sans title-bold">0.4s</text>
      <text x="103" y="100" text-anchor="middle" fill="#f1f5f9" font-size="16" font-weight="700" class="font-sans">Velocidade Edge</text>
      <text x="103" y="125" text-anchor="middle" fill="#94a3b8" font-size="13" font-weight="500" class="font-sans">PageSpeed 100 Google</text>
      <text x="103" y="148" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700" class="font-sans">Zero fuga de tráfego</text>
    </g>

    <!-- Métrica 4: 21.2% Conversão -->
    <g transform="translate(754, 645)" filter="url(#dropShadow)">
      <rect width="206" height="180" rx="18" fill="url(#cardGrad)" stroke="url(#borderBlue)" stroke-width="1.5"/>
      <text x="103" y="65" text-anchor="middle" fill="#38bdf8" font-size="36" font-weight="900" class="font-sans title-bold">21.2%</text>
      <text x="103" y="100" text-anchor="middle" fill="#f1f5f9" font-size="16" font-weight="700" class="font-sans">Taxa de Conversão</text>
      <text x="103" y="125" text-anchor="middle" fill="#94a3b8" font-size="13" font-weight="500" class="font-sans">Tráfego do Instagram</text>
      <text x="103" y="148" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700" class="font-sans">Meta Ads + Orgânico</text>
    </g>

    <!-- ========================================================================= -->
    <!-- BOTTOM FOOTER BAR (Y: 865) -->
    <!-- ========================================================================= -->
    <g transform="translate(64, 865)">
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

  const outputPath = path.join(__dirname, '../public/assets/cases/slide-03-resultado.jpg');
  
  await sharp(Buffer.from(svgContent))
    .jpeg({ quality: 95, progressive: true })
    .toFile(outputPath);

  console.log('Slide 03 gerado com sucesso em:', outputPath);
}

generateSlide3().catch(console.error);

