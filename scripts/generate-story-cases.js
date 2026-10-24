const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/ADM/Desktop/20102026/node_modules/sharp');

const RMTI_DIR = 'C:/Users/ADM/Desktop/15102026/RMTI';
const SOURCE_2010 = 'C:/Users/ADM/Desktop/20102026';
const OUTPUT_DIR = path.join(RMTI_DIR, 'public', 'assets', 'cases');
const ARTIFACT_DIR = 'C:/Users/ADM/.gemini/antigravity/brain/6e3d4e92-e9ae-46af-9323-aefd108d6b65';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateStoryVariationA() {
  console.log('Gerando Story Variação A: Logo RMTI no Topo Esquerdo + Badge Case no Topo Direito (Alinhados)...');

  const renanPhotoWidth = 920;
  const renanPhotoHeight = 720;

  // 1. Foto do Treinador Renan
  const renanResized = await sharp(path.join(SOURCE_2010, 'public', 'treinador-renan', 'foto-1.jpg'))
    .resize(renanPhotoWidth, renanPhotoHeight, { fit: 'cover', position: 'top' })
    .toBuffer();

  const roundedCornersMask = Buffer.from(`
    <svg width="${renanPhotoWidth}" height="${renanPhotoHeight}">
      <rect x="0" y="0" width="${renanPhotoWidth}" height="${renanPhotoHeight}" rx="36" ry="36" fill="#fff"/>
    </svg>
  `);

  const renanRounded = await sharp(renanResized)
    .composite([{ input: roundedCornersMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2. Logo RMTI redimensionada com precisão matemática (proporção 1114 x 546)
  // Largura: 180px -> Altura calculada: 180 * 546 / 1114 = 88.2px
  // Se quisermos altura 60px: 60 * 1114 / 546 = 122.4px
  const targetLogoH = 58;
  const targetLogoW = Math.round(targetLogoH * (1114 / 546)); // 118px
  const logoRMTI = await sharp(path.join(SOURCE_2010, 'public', 'rmti', 'IconeNovo-trimmed.png'))
    .resize(targetLogoW, targetLogoH, { fit: 'contain' })
    .toBuffer();

  // Dimensões do card branco da logo:
  // Card em x: 80, y: 110, width: 230, height: 84, rx: 22
  const pillX = 80;
  const pillY = 110;
  const pillW = 230;
  const pillH = 84;
  const logoLeft = pillX + Math.round((pillW - targetLogoW) / 2);
  const logoTop = pillY + Math.round((pillH - targetLogoH) / 2);

  const svgBackground = `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradientes -->
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05070a"/>
        <stop offset="35%" stop-color="#080c14"/>
        <stop offset="70%" stop-color="#0a0f1d"/>
        <stop offset="100%" stop-color="#040608"/>
      </linearGradient>

      <!-- Glows -->
      <radialGradient id="emeraldGlow" cx="0.85" cy="0.15" r="0.6">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="indigoGlow" cx="0.15" cy="0.65" r="0.6">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="goldGlow" cx="0.5" cy="0.9" r="0.5">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>

      <linearGradient id="stickerGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
    </defs>

    <!-- Fundo Obsidian com Glows -->
    <rect width="1080" height="1920" fill="url(#bgGrad)"/>
    <rect width="1080" height="1920" fill="url(#emeraldGlow)"/>
    <rect width="1080" height="1920" fill="url(#indigoGlow)"/>
    <rect width="1080" height="1920" fill="url(#goldGlow)"/>

    <!-- Grid lines elegantes -->
    <g opacity="0.05" stroke="#ffffff" stroke-width="1">
      <line x1="80" y1="0" x2="80" y2="1920"/>
      <line x1="1000" y1="0" x2="1000" y2="1920"/>
    </g>

    <!-- ========================================================================= -->
    <!-- HEADER BARRA SUPERIOR HARMONIZADA (Y: 110) -->
    <!-- ========================================================================= -->
    
    <!-- ESQUERDA: Card Branco com a Logo da RMTI (x: 80, y: 110) -->
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="22" fill="#ffffff" filter="drop-shadow(0 10px 24px rgba(0,0,0,0.55))"/>

    <!-- DIREITA: Badge de Case de Sucesso + Selo Oficial RMTI (Alinhado verticalmente) -->
    <g transform="translate(620, 110)">
      <rect width="380" height="42" rx="21" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.45)" stroke-width="1.5"/>
      <circle cx="22" cy="21" r="6" fill="#10b981"/>
      <text x="38" y="27" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" letter-spacing="1">
        CASE DE SUCESSO REAL
      </text>
      
      <text x="375" y="74" text-anchor="end" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" letter-spacing="2">
        CLIENTE OFICIAL RMTI
      </text>
    </g>

    <!-- Moldura Glow atrás da Foto do Renan (Y: 250) -->
    <rect x="74" y="250" width="932" height="732" rx="40" fill="none" stroke="rgba(16, 185, 129, 0.5)" stroke-width="3"/>

    <!-- ========================================================================= -->
    <!-- TEXTOS E HEADLINE (Y: 1030 adiante) -->
    <!-- ========================================================================= -->
    <text x="80" y="1045" font-family="system-ui, -apple-system, sans-serif">
      <tspan x="80" dy="0" fill="#94a3b8" font-size="28" font-weight="800" letter-spacing="3">DE UM LINKTREE AMADOR...</tspan>
      <tspan x="80" dy="58" fill="#ffffff" font-size="52" font-weight="900" letter-spacing="-1">PARA </tspan>
      <tspan fill="#34d399" font-size="52" font-weight="900">11 CONSULTORIAS</tspan>
      <tspan x="80" dy="58" fill="#ffffff" font-size="52" font-weight="900" letter-spacing="-1">NO 1º FINAL DE SEMANA.</tspan>
    </text>

    <!-- DEPOIMENTO REAL COM ASPAS -->
    <g transform="translate(80, 1215)">
      <rect width="920" height="150" rx="26" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5"/>
      <text x="35" y="65" fill="rgba(99, 102, 241, 0.45)" font-family="Georgia, serif" font-size="75" font-weight="bold">“</text>
      <text x="80" y="55" fill="#f1f5f9" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600">
        <tspan x="80" dy="0">"Troquei meu linktree pela Landing Page da RMTI. No primeiro</tspan>
        <tspan x="80" dy="32">final de semana fechei <tspan fill="#34d399" font-weight="900">11 novos alunos trimestrais</tspan> direto no</tspan>
        <tspan x="80" dy="32">WhatsApp! A taxa de resposta simplesmente explodiu."</tspan>
      </text>
    </g>

    <!-- 3 CARDS DE MÉTRICAS -->
    <g transform="translate(80, 1395)">
      <rect width="288" height="150" rx="24" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1.5"/>
      <text x="144" y="65" text-anchor="middle" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">0.4s</text>
      <text x="144" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800">PageSpeed 99</text>
      <text x="144" y="125" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">Abre no 1º clique</text>
    </g>

    <g transform="translate(396, 1395)">
      <rect width="288" height="150" rx="24" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(99, 102, 241, 0.4)" stroke-width="1.5"/>
      <text x="144" y="65" text-anchor="middle" fill="#818cf8" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">+11</text>
      <text x="144" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800">Alunos Fechados</text>
      <text x="144" y="125" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">Em apenas 48h</text>
    </g>

    <g transform="translate(712, 1395)">
      <rect width="288" height="150" rx="24" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5"/>
      <text x="144" y="65" text-anchor="middle" fill="#fbbf24" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">21.2%</text>
      <text x="144" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800">Conversão Whats</text>
      <text x="144" y="125" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">Tráfego do Instagram</text>
    </g>

    <!-- BOX DESTAQUE OFERTA RMTI -->
    <g transform="translate(80, 1575)">
      <rect width="920" height="110" rx="24" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.35)" stroke-width="1.5"/>
      <text x="40" y="45" fill="#a5b4fc" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="1">
        QUER UMA ESTRUTURA IGUAL PARA O SEU NICHO?
      </text>
      <text x="40" y="78" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800">
        Landing Pages Prontas RMTI com Painel de Edição Incluso
      </text>
      <rect x="735" y="30" width="150" height="50" rx="15" fill="#6366f1"/>
      <text x="810" y="62" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900">
        R$ 97
      </text>
    </g>

    <!-- STICKER DE LINK DO INSTAGRAM -->
    <g transform="translate(80, 1710)">
      <rect width="920" height="110" rx="36" fill="url(#stickerGrad)" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.5))"/>
      <circle cx="70" cy="55" r="28" fill="#0f172a"/>
      <path d="M60 55l6-6a7 7 0 0110 0l2 2a7 7 0 010 10l-4 4M80 55l-6 6a7 7 0 01-10 0l-2-2a7 7 0 010-10l4-4" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
      <text x="120" y="50" fill="#090d16" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" letter-spacing="-0.5">
        TOQUE NO LINK PARA VER O SITE AO VIVO
      </text>
      <text x="120" y="78" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700">
        rmti.vercel.app #cases
      </text>
      <path d="M840 55l-12-12m12 12l-12 12m12-12H800" stroke="#090d16" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <text x="540" y="1865" text-anchor="middle" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600">
      Desenvolvido por RMTI • Soluções Digitais sob Medida
    </text>
  </svg>
  `;

  // Overlay sobre a foto do Renan
  const svgBadgeOnPhoto = Buffer.from(`
    <svg width="860" height="90" viewBox="0 0 860 90" xmlns="http://www.w3.org/2000/svg">
      <rect width="860" height="90" rx="26" fill="rgba(8, 12, 20, 0.94)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1.5"/>
      <circle cx="48" cy="45" r="22" fill="#10b981"/>
      <path d="M38 45l6 6 14-14" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="86" y="40" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="23" font-weight="900">
        Prof. Renan Guilherme
      </text>
      <text x="86" y="66" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">
        @treinador_renan • CREF 185468-G/SP
      </text>
      <rect x="630" y="25" width="200" height="40" rx="20" fill="rgba(16, 185, 129, 0.2)" stroke="rgba(16, 185, 129, 0.5)" stroke-width="1.5"/>
      <text x="730" y="51" text-anchor="middle" fill="#6ee7b7" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800">
        CONSULTORIA VIP
      </text>
    </svg>
  `);

  const storyImageA = await sharp(Buffer.from(svgBackground))
    .composite([
      // Foto Renan (y: 256)
      { input: renanRounded, top: 256, left: 80 },
      // Badge sobre a foto
      { input: svgBadgeOnPhoto, top: 870, left: 110 },
      // Logo RMTI centralizada dentro do pill branco
      { input: logoRMTI, top: logoTop, left: logoLeft }
    ])
    .jpeg({ quality: 96, progressive: true })
    .toBuffer();

  const outPathProject = path.join(OUTPUT_DIR, 'story-treinador-renan-rmti-case.jpg');
  fs.writeFileSync(outPathProject, storyImageA);

  const outPathArtifact = path.join(ARTIFACT_DIR, 'story-case-renan.jpg');
  fs.writeFileSync(outPathArtifact, storyImageA);

  console.log('✓ Variação A gerada com sucesso!');
}

async function generateStoryVariationB() {
  console.log('Gerando Story Variação B: Logo RMTI Centralizada no Topo com Barra de Navegação...');

  const renanPhotoWidth = 920;
  const renanPhotoHeight = 720;

  const renanResized = await sharp(path.join(SOURCE_2010, 'public', 'treinador-renan', 'foto-1.jpg'))
    .resize(renanPhotoWidth, renanPhotoHeight, { fit: 'cover', position: 'top' })
    .toBuffer();

  const roundedCornersMask = Buffer.from(`
    <svg width="${renanPhotoWidth}" height="${renanPhotoHeight}">
      <rect x="0" y="0" width="${renanPhotoWidth}" height="${renanPhotoHeight}" rx="36" ry="36" fill="#fff"/>
    </svg>
  `);

  const renanRounded = await sharp(renanResized)
    .composite([{ input: roundedCornersMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Logo centralizada
  const targetLogoH = 62;
  const targetLogoW = Math.round(targetLogoH * (1114 / 546)); // 126px
  const logoRMTI = await sharp(path.join(SOURCE_2010, 'public', 'rmti', 'IconeNovo-trimmed.png'))
    .resize(targetLogoW, targetLogoH, { fit: 'contain' })
    .toBuffer();

  // Pill Centralizada
  const pillW = 280;
  const pillH = 88;
  const pillX = Math.round((1080 - pillW) / 2); // 400
  const pillY = 110;
  const logoLeft = pillX + Math.round((pillW - targetLogoW) / 2);
  const logoTop = pillY + Math.round((pillH - targetLogoH) / 2);

  const svgBackground = `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05070a"/>
        <stop offset="35%" stop-color="#080c14"/>
        <stop offset="70%" stop-color="#0a0f1d"/>
        <stop offset="100%" stop-color="#040608"/>
      </linearGradient>

      <radialGradient id="emeraldGlow" cx="0.5" cy="0.15" r="0.6">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="indigoGlow" cx="0.15" cy="0.65" r="0.6">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
      </radialGradient>

      <linearGradient id="stickerGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
    </defs>

    <rect width="1080" height="1920" fill="url(#bgGrad)"/>
    <rect width="1080" height="1920" fill="url(#emeraldGlow)"/>
    <rect width="1080" height="1920" fill="url(#indigoGlow)"/>

    <!-- ========================================================================= -->
    <!-- HEADER CENTRALIZADO SIMÉTRICO (Y: 90) -->
    <!-- ========================================================================= -->
    
    <!-- Tag superior pequena centralizada -->
    <g transform="translate(365, 60)">
      <rect width="350" height="36" rx="18" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.45)" stroke-width="1.5"/>
      <circle cx="20" cy="18" r="5" fill="#10b981"/>
      <text x="36" y="23" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" letter-spacing="1.5">
        CASE DE SUCESSO OFICIAL
      </text>
    </g>

    <!-- Card Branco Centralizado com a Logo da RMTI (x: 400, y: 110) -->
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="24" fill="#ffffff" filter="drop-shadow(0 12px 28px rgba(0,0,0,0.6))"/>

    <!-- Moldura Glow atrás da Foto do Renan (Y: 235) -->
    <rect x="74" y="235" width="932" height="732" rx="40" fill="none" stroke="rgba(16, 185, 129, 0.5)" stroke-width="3"/>

    <!-- TEXTOS E HEADLINE -->
    <text x="80" y="1035" font-family="system-ui, -apple-system, sans-serif">
      <tspan x="80" dy="0" fill="#94a3b8" font-size="28" font-weight="800" letter-spacing="3">DE UM LINKTREE AMADOR...</tspan>
      <tspan x="80" dy="58" fill="#ffffff" font-size="52" font-weight="900" letter-spacing="-1">PARA </tspan>
      <tspan fill="#34d399" font-size="52" font-weight="900">11 CONSULTORIAS</tspan>
      <tspan x="80" dy="58" fill="#ffffff" font-size="52" font-weight="900" letter-spacing="-1">NO 1º FINAL DE SEMANA.</tspan>
    </text>

    <!-- DEPOIMENTO REAL COM ASPAS -->
    <g transform="translate(80, 1205)">
      <rect width="920" height="150" rx="26" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5"/>
      <text x="35" y="65" fill="rgba(99, 102, 241, 0.45)" font-family="Georgia, serif" font-size="75" font-weight="bold">“</text>
      <text x="80" y="55" fill="#f1f5f9" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600">
        <tspan x="80" dy="0">"Troquei meu linktree pela Landing Page da RMTI. No primeiro</tspan>
        <tspan x="80" dy="32">final de semana fechei <tspan fill="#34d399" font-weight="900">11 novos alunos trimestrais</tspan> direto no</tspan>
        <tspan x="80" dy="32">WhatsApp! A taxa de resposta simplesmente explodiu."</tspan>
      </text>
    </g>

    <!-- 3 CARDS DE MÉTRICAS -->
    <g transform="translate(80, 1385)">
      <rect width="288" height="150" rx="24" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1.5"/>
      <text x="144" y="65" text-anchor="middle" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">0.4s</text>
      <text x="144" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800">PageSpeed 99</text>
      <text x="144" y="125" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">Abre no 1º clique</text>
    </g>

    <g transform="translate(396, 1385)">
      <rect width="288" height="150" rx="24" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(99, 102, 241, 0.4)" stroke-width="1.5"/>
      <text x="144" y="65" text-anchor="middle" fill="#818cf8" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">+11</text>
      <text x="144" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800">Alunos Fechados</text>
      <text x="144" y="125" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">Em apenas 48h</text>
    </g>

    <g transform="translate(712, 1385)">
      <rect width="288" height="150" rx="24" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5"/>
      <text x="144" y="65" text-anchor="middle" fill="#fbbf24" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">21.2%</text>
      <text x="144" y="100" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800">Conversão Whats</text>
      <text x="144" y="125" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">Tráfego do Instagram</text>
    </g>

    <!-- BOX DESTAQUE OFERTA RMTI -->
    <g transform="translate(80, 1565)">
      <rect width="920" height="110" rx="24" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.35)" stroke-width="1.5"/>
      <text x="40" y="45" fill="#a5b4fc" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="1">
        QUER UMA ESTRUTURA IGUAL PARA O SEU NICHO?
      </text>
      <text x="40" y="78" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800">
        Landing Pages Prontas RMTI com Painel de Edição Incluso
      </text>
      <rect x="735" y="30" width="150" height="50" rx="15" fill="#6366f1"/>
      <text x="810" y="62" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900">
        R$ 97
      </text>
    </g>

    <!-- STICKER DE LINK DO INSTAGRAM -->
    <g transform="translate(80, 1705)">
      <rect width="920" height="110" rx="36" fill="url(#stickerGrad)" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.5))"/>
      <circle cx="70" cy="55" r="28" fill="#0f172a"/>
      <path d="M60 55l6-6a7 7 0 0110 0l2 2a7 7 0 010 10l-4 4M80 55l-6 6a7 7 0 01-10 0l-2-2a7 7 0 010-10l4-4" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
      <text x="120" y="50" fill="#090d16" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" letter-spacing="-0.5">
        TOQUE NO LINK PARA VER O SITE AO VIVO
      </text>
      <text x="120" y="78" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700">
        rmti.vercel.app #cases
      </text>
      <path d="M840 55l-12-12m12 12l-12 12m12-12H800" stroke="#090d16" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <text x="540" y="1860" text-anchor="middle" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600">
      Desenvolvido por RMTI • Soluções Digitais sob Medida
    </text>
  </svg>
  `;

  const svgBadgeOnPhoto = Buffer.from(`
    <svg width="860" height="90" viewBox="0 0 860 90" xmlns="http://www.w3.org/2000/svg">
      <rect width="860" height="90" rx="26" fill="rgba(8, 12, 20, 0.94)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1.5"/>
      <circle cx="48" cy="45" r="22" fill="#10b981"/>
      <path d="M38 45l6 6 14-14" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="86" y="40" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="23" font-weight="900">
        Prof. Renan Guilherme
      </text>
      <text x="86" y="66" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">
        @treinador_renan • CREF 185468-G/SP
      </text>
      <rect x="630" y="25" width="200" height="40" rx="20" fill="rgba(16, 185, 129, 0.2)" stroke="rgba(16, 185, 129, 0.5)" stroke-width="1.5"/>
      <text x="730" y="51" text-anchor="middle" fill="#6ee7b7" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800">
        CONSULTORIA VIP
      </text>
    </svg>
  `);

  const storyImageB = await sharp(Buffer.from(svgBackground))
    .composite([
      { input: renanRounded, top: 241, left: 80 },
      { input: svgBadgeOnPhoto, top: 855, left: 110 },
      { input: logoRMTI, top: logoTop, left: logoLeft }
    ])
    .jpeg({ quality: 96, progressive: true })
    .toBuffer();

  const outPathProjectB = path.join(OUTPUT_DIR, 'story-treinador-renan-rmti-case-b.jpg');
  fs.writeFileSync(outPathProjectB, storyImageB);

  const outPathArtifactB = path.join(ARTIFACT_DIR, 'story-case-renan-b.jpg');
  fs.writeFileSync(outPathArtifactB, storyImageB);

  console.log('✓ Variação B gerada com sucesso!');
}

async function generateStoryVariationC() {
  console.log('Gerando Story Variação C: Variação Circular Black & Gold com Logo Alinhada...');

  const avatarSize = 480;
  const renanResized = await sharp(path.join(SOURCE_2010, 'public', 'treinador-renan', 'foto-1.jpg'))
    .resize(avatarSize, avatarSize, { fit: 'cover', position: 'top' })
    .toBuffer();

  const circleMask = Buffer.from(`
    <svg width="${avatarSize}" height="${avatarSize}">
      <circle cx="${avatarSize/2}" cy="${avatarSize/2}" r="${avatarSize/2}" fill="#fff"/>
    </svg>
  `);

  const renanCircle = await sharp(renanResized)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const targetLogoH = 56;
  const targetLogoW = Math.round(targetLogoH * (1114 / 546)); // 114px
  const logoRMTI = await sharp(path.join(SOURCE_2010, 'public', 'rmti', 'IconeNovo-trimmed.png'))
    .resize(targetLogoW, targetLogoH, { fit: 'contain' })
    .toBuffer();

  const pillX = 80;
  const pillY = 110;
  const pillW = 230;
  const pillH = 84;
  const logoLeft = pillX + Math.round((pillW - targetLogoW) / 2);
  const logoTop = pillY + Math.round((pillH - targetLogoH) / 2);

  const svgOverlay2 = `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#07090e"/>
        <stop offset="50%" stop-color="#0b101d"/>
        <stop offset="100%" stop-color="#040609"/>
      </linearGradient>
      <radialGradient id="emeraldGlow2" cx="0.5" cy="0.28" r="0.6">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.38"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="goldGlow2" cx="0.8" cy="0.75" r="0.5">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="stickerGrad2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
    </defs>

    <rect width="1080" height="1920" fill="url(#bgGrad2)"/>
    <rect width="1080" height="1920" fill="url(#emeraldGlow2)"/>
    <rect width="1080" height="1920" fill="url(#goldGlow2)"/>

    <!-- TOP HEADER -->
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="22" fill="#ffffff" filter="drop-shadow(0 12px 24px rgba(0,0,0,0.5))"/>

    <text x="1000" y="145" text-anchor="end" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" letter-spacing="2">
      PARCERIA EXCLUSIVA
    </text>
    <text x="1000" y="178" text-anchor="end" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900">
      CONSULTORIA FITNESS VIP
    </text>

    <!-- FOTO DO RENAN CENTRALIZADA (Y: 260) -->
    <circle cx="540" cy="500" r="250" fill="none" stroke="rgba(16, 185, 129, 0.55)" stroke-width="4"/>
    <circle cx="540" cy="500" r="266" fill="none" stroke="rgba(99, 102, 241, 0.35)" stroke-width="2" stroke-dasharray="10 10"/>

    <!-- BADGE AUTORIDADE RENAN -->
    <g transform="translate(220, 770)">
      <rect width="640" height="84" rx="42" fill="rgba(8, 12, 20, 0.95)" stroke="rgba(16, 185, 129, 0.45)" stroke-width="2"/>
      <text x="320" y="42" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900">
        Prof. Renan Guilherme ✓
      </text>
      <text x="320" y="68" text-anchor="middle" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700">
        @treinador_renan • CREF 185468-G/SP
      </text>
    </g>

    <!-- HEADLINE -->
    <text x="540" y="920" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">
      <tspan x="540" dy="0" fill="#ffffff" font-size="42" font-weight="900">“COMO UMA LANDING PAGE</tspan>
      <tspan x="540" dy="54" fill="#34d399" font-size="46" font-weight="900">DE R$ 97 DA RMTI</tspan>
      <tspan x="540" dy="54" fill="#ffffff" font-size="42" font-weight="900">LOTOU MINHA CONSULTORIA”</tspan>
    </text>

    <!-- 3 ETAPAS -->
    <g transform="translate(80, 1100)">
      <rect width="920" height="350" rx="32" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.5"/>
      
      <g transform="translate(40, 45)">
        <circle cx="20" cy="20" r="20" fill="rgba(239, 68, 68, 0.2)"/>
        <text x="20" y="26" text-anchor="middle" fill="#f87171" font-size="18" font-weight="900">✕</text>
        <text x="60" y="16" fill="#94a3b8" font-size="13" font-weight="800" letter-spacing="1">PROBLEMA ANTERIOR:</text>
        <text x="60" y="36" fill="#f87171" font-size="18" font-weight="800">Linktree lento, sem fotos profissionais e sem argumentos de venda</text>
      </g>

      <g transform="translate(40, 145)">
        <circle cx="20" cy="20" r="20" fill="rgba(99, 102, 241, 0.25)"/>
        <text x="20" y="26" text-anchor="middle" fill="#818cf8" font-size="18" font-weight="900">⚡</text>
        <text x="60" y="16" fill="#94a3b8" font-size="13" font-weight="800" letter-spacing="1">SOLUÇÃO DA RMTI:</text>
        <text x="60" y="36" fill="#818cf8" font-size="18" font-weight="800">Landing Page em Next.js com carregamento em 0.4s e fotos HD</text>
      </g>

      <g transform="translate(40, 245)">
        <circle cx="20" cy="20" r="20" fill="rgba(16, 185, 129, 0.25)"/>
        <text x="20" y="26" text-anchor="middle" fill="#34d399" font-size="18" font-weight="900">🔥</text>
        <text x="60" y="16" fill="#94a3b8" font-size="13" font-weight="800" letter-spacing="1">RESULTADO REAL:</text>
        <text x="60" y="36" fill="#34d399" font-size="20" font-weight="900">11 consultorias trimestrais fechadas no 1º final de semana</text>
      </g>
    </g>

    <!-- BOX CTA -->
    <g transform="translate(80, 1495)">
      <rect width="920" height="160" rx="28" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1.5"/>
      <text x="50" y="55" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="900" letter-spacing="1">
        🔥 ESTRUTURA PRONTA PARA VOCÊ COPIAR E COLAR
      </text>
      <text x="50" y="95" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="23" font-weight="900">
        Com Painel de Admin Incluso • Edite Sem Mexer em Código
      </text>
      <text x="50" y="130" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600">
        Disponível para Cursos, Personais, Mentores e Prestadores de Serviços.
      </text>
    </g>

    <!-- STICKER DE LINK -->
    <g transform="translate(80, 1695)">
      <rect width="920" height="120" rx="40" fill="url(#stickerGrad2)" filter="drop-shadow(0 15px 30px rgba(0,0,0,0.5))"/>
      <circle cx="75" cy="60" r="30" fill="#10b981"/>
      <path d="M65 60l6-6a7 7 0 0110 0l2 2a7 7 0 010 10l-4 4M85 60l-6 6a7 7 0 01-10 0l-2-2a7 7 0 010-10l4-4" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <text x="130" y="55" fill="#090d16" font-family="system-ui, -apple-system, sans-serif" font-size="23" font-weight="900">
        TOQUE NO LINK E CONHEÇA A RMTI
      </text>
      <text x="130" y="85" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">
        Garanta sua Landing Page com Painel Admin a partir de R$ 97
      </text>
      <path d="M840 60l-12-12m12 12l-12 12m12-12H800" stroke="#090d16" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <text x="540" y="1860" text-anchor="middle" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600">
      RMTI • Soluções Digitais sob Medida | @dev_rmti
    </text>
  </svg>
  `;

  const story2Final = await sharp(Buffer.from(svgOverlay2))
    .composite([
      { input: renanCircle, top: 260, left: 300 },
      { input: logoRMTI, top: logoTop, left: logoLeft }
    ])
    .jpeg({ quality: 96, progressive: true })
    .toBuffer();

  fs.writeFileSync(path.join(OUTPUT_DIR, 'story-treinador-renan-rmti-vip.jpg'), story2Final);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'story-case-vip.jpg'), story2Final);
  console.log('✓ Variação C (Story 2) corrigida com sucesso!');
}

async function run() {
  await generateStoryVariationA();
  await generateStoryVariationB();
  await generateStoryVariationC();
}

run();
