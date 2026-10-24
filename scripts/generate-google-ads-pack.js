const path = require('path');
const fs = require('fs');
const sharp = require('C:/Users/ADM/Desktop/20102026/node_modules/sharp');

const OUTPUT_DIR = 'C:/Users/ADM/Downloads/Pack-Google-Ads-RMTI';
const ARTIFACT_DIR = 'C:/Users/ADM/.gemini/antigravity/brain/6e3d4e92-e9ae-46af-9323-aefd108d6b65';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generatePack() {
  console.log('=== GERANDO PACK DE IMAGENS GOOGLE ADS (5 IMAGENS) ===');

  const esteticaSrc = 'C:/Users/ADM/Desktop/20102026/public/criativos/populares/04-estetica-beleza-feed.jpg';
  const comboSrc = 'C:/Users/ADM/Desktop/20102026/public/criativos/novos/criativo-05-combo-5em1-feed.jpg';
  const adminSrc = 'C:/Users/ADM/Desktop/20102026/public/criativos/novos/criativo-01-admin-dinamico-feed.jpg';
  const bannerHighRes = 'C:/Users/ADM/Desktop/15102026/RMTI/public/assets/imagens/bannerNovo.png';

  // =========================================================================
  // IMAGEM 1: QUADRADA (1200x1200) - CLÍNICAS DE ESTÉTICA & AGENDAMENTO ONLINE
  // =========================================================================
  console.log('\n[1/5] Gerando Imagem 1: Quadrada (1200x1200) - Clínicas de Estética...');
  
  // Background: 1200x1200 luxury clinic ambiance
  const bgSquare1 = await sharp(esteticaSrc)
    .resize(1200, 1200, { fit: 'cover', position: 'center' })
    .blur(18)
    .modulate({ brightness: 0.78, saturation: 1.1 })
    .toBuffer();

  // Create smooth feathered horizontal mask for foreground
  const maskSvg1 = `
    <svg width="896" height="1200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
          <stop offset="5%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="95%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="896" height="1200" fill="url(#fade)"/>
    </svg>
  `;
  const maskBuf1 = Buffer.from(maskSvg1);

  // Fix English text on phone screen:
  // Coordinates on 896x1200 image: translate(275, 686) rotate(-7.5 deg), width 300, height 56
  const screenFixSvg1 = `
    <svg width="896" height="1200" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(275, 686) rotate(-7.5)">
        <rect x="0" y="0" width="300" height="56" fill="#ffffff"/>
        <text x="150" y="23" text-anchor="middle" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="14.5" letter-spacing="-0.3">
          Agendamento Online 24h
        </text>
        <text x="150" y="44" text-anchor="middle" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="11.5">
          Escolha o procedimento desejado:
        </text>
      </g>
    </svg>
  `;

  const fgRgba1 = await sharp(esteticaSrc)
    .composite([{ input: Buffer.from(screenFixSvg1), left: 0, top: 0 }])
    .ensureAlpha()
    .toBuffer();

  const fgMasked1 = await sharp(fgRgba1)
    .composite([{ input: maskBuf1, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Top header pill for clinics
  const badgeSquare1Svg = `
    <svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow1" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000" flood-opacity="0.6"/>
        </filter>
        <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="100%" stop-color="#fbbf24"/>
        </linearGradient>
      </defs>
      <g filter="url(#shadow1)">
        <rect x="360" y="28" width="480" height="46" rx="23" fill="#09090b" fill-opacity="0.85" stroke="url(#goldGrad1)" stroke-width="1.5"/>
        <circle cx="390" cy="51" r="6" fill="#10b981"/>
        <text x="410" y="57" fill="#fef08a" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="15" letter-spacing="1">CLÍNICAS &amp; SALÕES DE BELEZA</text>
      </g>
    </svg>
  `;

  const img1 = await sharp(bgSquare1)
    .composite([
      { input: fgMasked1, left: Math.round((1200 - 896) / 2), top: 0 },
      { input: Buffer.from(badgeSquare1Svg), left: 0, top: 0 }
    ])
    .jpeg({ quality: 96 })
    .toBuffer();

  const file1Name = '01_Quadrada_1200x1200_Clinicas_Estetica_Agendamento.jpg';
  fs.writeFileSync(path.join(OUTPUT_DIR, file1Name), img1);
  fs.writeFileSync(path.join(ARTIFACT_DIR, file1Name), img1);
  console.log('✓ Imagem 1 salva com sucesso.');

  // =========================================================================
  // IMAGEM 2: QUADRADA (1200x1200) - LANDING PAGES DE ALTA CONVERSÃO
  // =========================================================================
  console.log('\n[2/5] Gerando Imagem 2: Quadrada (1200x1200) - Landing Pages Alta Conversão...');
  
  // Resize combo source to 1200x1200
  const comboBase = await sharp(comboSrc)
    .resize(1200, 1200, { kernel: 'lanczos3' })
    .toBuffer();

  // Overlay to refine bottom badge and add RMTI tech badge
  const overlayComboSvg = `
    <svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.5"/>
        </filter>
        <linearGradient id="neonGreen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#34d399"/>
        </linearGradient>
      </defs>

      <!-- Clean bottom badge overlay covering AI typo -->
      <g filter="url(#shadow2)">
        <rect x="62" y="960" width="345" height="118" rx="22" fill="#0b1120" stroke="#334155" stroke-width="2"/>
        <text x="234" y="1008" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="23">
          COMBO 5 EM 1
        </text>
        <text x="234" y="1042" text-anchor="middle" fill="#10b981" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="16">
          100% Responsivo • Next.js
        </text>
      </g>
    </svg>
  `;

  const img2 = await sharp(comboBase)
    .composite([
      { input: Buffer.from(overlayComboSvg), left: 0, top: 0 }
    ])
    .jpeg({ quality: 96 })
    .toBuffer();

  const file2Name = '02_Quadrada_1200x1200_Landing_Pages_Alta_Conversao.jpg';
  fs.writeFileSync(path.join(OUTPUT_DIR, file2Name), img2);
  fs.writeFileSync(path.join(ARTIFACT_DIR, file2Name), img2);
  console.log('✓ Imagem 2 salva com sucesso.');

  // =========================================================================
  // IMAGEM 3: QUADRADA (1200x1200) - SISTEMAS DE GESTÃO (ERP), CMS & APPS
  // =========================================================================
  console.log('\n[3/5] Gerando Imagem 3: Quadrada (1200x1200) - Sistemas ERP & Apps...');
  
  const bgAdmin = await sharp(adminSrc)
    .resize(1200, 1200, { fit: 'cover' })
    .blur(16)
    .modulate({ brightness: 0.55 })
    .toBuffer();

  const fgAdmin = await sharp(adminSrc)
    .resize(1080, 1080, { fit: 'contain' })
    .toBuffer();

  const overlayAdminSvg = `
    <svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow3" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="16" flood-color="#0284c7" flood-opacity="0.45"/>
        </filter>
        <linearGradient id="brandGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>
      <g filter="url(#glow3)">
        <rect x="340" y="36" width="520" height="48" rx="24" fill="#0f172a" fill-opacity="0.9" stroke="url(#brandGrad3)" stroke-width="1.8"/>
        <circle cx="372" cy="60" r="7" fill="#38bdf8"/>
        <text x="394" y="66" fill="#f8fafc" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="16.5" letter-spacing="1.2">SISTEMAS ERP, CMS &amp; APPS WEB</text>
      </g>
    </svg>
  `;

  const img3 = await sharp(bgAdmin)
    .composite([
      { input: fgAdmin, left: Math.round((1200 - 1080) / 2), top: Math.round((1200 - 1080) / 2) },
      { input: Buffer.from(overlayAdminSvg), left: 0, top: 0 }
    ])
    .jpeg({ quality: 96 })
    .toBuffer();

  const file3Name = '03_Quadrada_1200x1200_Sistemas_Gestao_ERP_e_Apps.jpg';
  fs.writeFileSync(path.join(OUTPUT_DIR, file3Name), img3);
  fs.writeFileSync(path.join(ARTIFACT_DIR, file3Name), img3);
  console.log('✓ Imagem 3 salva com sucesso.');

  // =========================================================================
  // IMAGEM 4: RETANGULAR (1200x628 - 1.91:1) - NICHADA ESTÉTICA & AGENDAMENTO
  // =========================================================================
  console.log('\n[4/5] Gerando Imagem 4: Retangular (1200x628) - Clínicas de Estética...');
  
  // Luxury clinic background landscape 1200x628
  const bgClinicLandscape = await sharp(esteticaSrc)
    .resize(1200, 628, { fit: 'cover', position: 'bottom' })
    .blur(14)
    .modulate({ brightness: 0.45, saturation: 1.15 })
    .toBuffer();

  // Clean smartphone extract: left 235, top 368, width 640, height 685
  // We fix the English text on the phone screen inside this snippet first:
  // In snippet coordinates:
  // Original (left 235, top 368):
  // Screen text was at (left 330, top 680) -> relative to snippet: left = 330 - 235 = 95, top = 680 - 368 = 312
  const screenFixSnippetSvg = `
    <svg width="640" height="685" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(40, 318) rotate(-7.5)">
        <rect x="0" y="0" width="300" height="56" fill="#ffffff"/>
        <text x="150" y="23" text-anchor="middle" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="14.5" letter-spacing="-0.3">
          Agendamento Online 24h
        </text>
        <text x="150" y="44" text-anchor="middle" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="11.5">
          Escolha o procedimento desejado:
        </text>
      </g>
    </svg>
  `;

  const phoneSnippetClean = await sharp(esteticaSrc)
    .extract({ left: 235, top: 368, width: 640, height: 685 })
    .composite([{ input: Buffer.from(screenFixSnippetSvg), left: 0, top: 0 }])
    .ensureAlpha()
    .toBuffer();

  // Create feather mask for phone snippet on right edge
  const phoneSnippetMaskSvg = `
    <svg width="640" height="685" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fadeR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="78%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="640" height="685" fill="url(#fadeR)"/>
    </svg>
  `;
  const phoneSnippetMasked = await sharp(phoneSnippetClean)
    .composite([{ input: Buffer.from(phoneSnippetMaskSvg), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Resize phone snippet to fit height 628 nicely
  const targetH4 = 628;
  const targetW4 = Math.round(640 * (628 / 685)); // ~ 587 px
  const phoneResized = await sharp(phoneSnippetMasked)
    .resize(targetW4, targetH4)
    .png()
    .toBuffer();

  const landscapeOverlaySvg = `
    <svg width="1200" height="628" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadowBox4" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000" flood-opacity="0.7"/>
        </filter>
        <linearGradient id="goldLinear4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#fbbf24"/>
        </linearGradient>
        <linearGradient id="cardBg4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#18181b" stop-opacity="0.94"/>
          <stop offset="100%" stop-color="#09090b" stop-opacity="0.98"/>
        </linearGradient>
      </defs>

      <!-- Right Card: Benefit Pitch for Clinics -->
      <g filter="url(#shadowBox4)">
        <rect x="530" y="44" width="630" height="540" rx="24" fill="url(#cardBg4)" stroke="#3f3f46" stroke-width="1.5"/>
        <rect x="530" y="44" width="630" height="6" rx="3" fill="url(#goldLinear4)"/>
      </g>

      <!-- Pill Badge: Nicho -->
      <g>
        <rect x="570" y="76" width="310" height="36" rx="18" fill="#27272a" stroke="#d4af37" stroke-width="1.2"/>
        <circle cx="590" cy="94" r="5" fill="#eab308"/>
        <text x="605" y="100" fill="#fef08a" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="13" letter-spacing="1">PARA CLÍNICAS &amp; SALÕES</text>
      </g>

      <!-- Main Headline -->
      <text x="570" y="148" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="28" letter-spacing="-0.5">
        App de Agendamento Online
      </text>
      <text x="570" y="186" fill="url(#goldLinear4)" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="26">
        &amp; Site com Agenda 24h
      </text>

      <!-- Subheadline -->
      <text x="570" y="226" fill="#a1a1aa" font-family="Arial, Helvetica, sans-serif" font-weight="400" font-size="15.5">
        Sua cliente escolhe o procedimento e agenda direto pelo celular.
      </text>

      <!-- Bullet points with checkmarks -->
      <g transform="translate(570, 256)">
        <circle cx="14" cy="14" r="14" fill="#10b981" fill-opacity="0.2"/>
        <path d="M9 14 l4 4 l7 -8" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="40" y="20" fill="#f4f4f5" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="16">
          Agenda cheia no meio da semana no piloto automático
        </text>
      </g>

      <g transform="translate(570, 312)">
        <circle cx="14" cy="14" r="14" fill="#10b981" fill-opacity="0.2"/>
        <path d="M9 14 l4 4 l7 -8" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="40" y="20" fill="#f4f4f5" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="16">
          Lembretes automáticos para reduzir faltas (no-show)
        </text>
      </g>

      <g transform="translate(570, 368)">
        <circle cx="14" cy="14" r="14" fill="#10b981" fill-opacity="0.2"/>
        <path d="M9 14 l4 4 l7 -8" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="40" y="20" fill="#f4f4f5" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="16">
          Design de luxo para valorizar seus procedimentos
        </text>
      </g>

      <g transform="translate(570, 424)">
        <circle cx="14" cy="14" r="14" fill="#10b981" fill-opacity="0.2"/>
        <path d="M9 14 l4 4 l7 -8" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="40" y="20" fill="#f4f4f5" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="16">
          Zero mensalidades abusivas e sem comissão por cliente
        </text>
      </g>

      <!-- Bottom CTA Banner in card -->
      <g transform="translate(570, 480)">
        <rect width="250" height="42" rx="10" fill="url(#goldLinear4)"/>
        <text x="125" y="26" text-anchor="middle" fill="#09090b" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="13.5" letter-spacing="0.5">
          TESTAR AO VIVO
        </text>
        <text x="275" y="26" fill="#a1a1aa" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="13.5">
          RMTI • Soluções Digitais
        </text>
      </g>
    </svg>
  `;

  const img4 = await sharp(bgClinicLandscape)
    .composite([
      { input: phoneResized, left: -10, top: 0 },
      { input: Buffer.from(landscapeOverlaySvg), left: 0, top: 0 }
    ])
    .jpeg({ quality: 96 })
    .toBuffer();

  const file4Name = '04_Retangular_1200x628_Clinicas_Estetica_Agendamento.jpg';
  fs.writeFileSync(path.join(OUTPUT_DIR, file4Name), img4);
  fs.writeFileSync(path.join(ARTIFACT_DIR, file4Name), img4);
  console.log('✓ Imagem 4 salva com sucesso.');

  // =========================================================================
  // IMAGEM 5: RETANGULAR (1200x628 - 1.91:1) - RMTI GERAL: SITES, SISTEMAS & APPS
  // =========================================================================
  console.log('\n[5/5] Gerando Imagem 5: Retangular (1200x628) - RMTI Geral...');
  
  // High quality conversion from 1672x940 bannerNovo.png to 1200x628 with sharp Lanczos3
  const img5 = await sharp(bannerHighRes)
    .resize(1200, 628, {
      fit: 'cover',
      position: 'center',
      kernel: 'lanczos3'
    })
    .jpeg({ quality: 96 })
    .toBuffer();

  const file5Name = '05_Retangular_1200x628_RMTI_Sites_Sistemas_Apps.jpg';
  fs.writeFileSync(path.join(OUTPUT_DIR, file5Name), img5);
  fs.writeFileSync(path.join(ARTIFACT_DIR, file5Name), img5);
  console.log('✓ Imagem 5 salva com sucesso.');

  // =========================================================================
  // GUIA / README.md DENTRO DA PASTA DOWNLOADS
  // =========================================================================
  const readmeContent = `# PACK DE IMAGENS GOOGLE ADS - RMTI
Este pacote contém as 5 imagens de alta resolução otimizadas para as campanhas da RMTI no Google Ads (Campanhas de Pesquisa com Extensões de Imagem, Display Responsivo e Demand Gen).

---

## 📁 ARQUIVOS INCLUSOS NESTA PASTA:

### 1. IMAGENS QUADRADAS (Proporção 1:1 • 1200 x 1200 px):
1. **\`01_Quadrada_1200x1200_Clinicas_Estetica_Agendamento.jpg\`**
   - **Nicho:** Clínicas de Estética, Biomédicas, Salões de Beleza, Spa & Harmonização Facial.
   - **Destaque:** Celular com app de agendamento automático 24h, procedimentos (Harmonização, Botox, Limpeza de Pele) e notificação de agenda lotada.
   - **Uso Recomendado:** Grupos de anúncios focados em "sistema para clinica de estetica", "app agendamento salao", "site para esteticista".

2. **\`02_Quadrada_1200x1200_Landing_Pages_Alta_Conversao.jpg\`**
   - **Nicho:** Geral / Infoprodutores, Mentores, Coaches, Prestadores de Serviço e Empresas.
   - **Destaque:** Vitrine com 5 estruturas modernas de alta conversão, design premium iluminado e menção a painel CMS incluso.
   - **Uso Recomendado:** Grupos de anúncios focados em "criar landing page", "site para vendas", "pagina de conversao".

3. **\`03_Quadrada_1200x1200_Sistemas_Gestao_ERP_e_Apps.jpg\`**
   - **Nicho:** Empresas B2B, Gestores, Startups e Negócios em Crescimento.
   - **Destaque:** Mockup 3D isométrico com tablet + smartphone, gráficos de conversão em tempo real, velocidade 0.4s e tecnologia Next.js.
   - **Uso Recomendado:** Grupos de anúncios focados em "desenvolvimento de software sob medida", "sistema de gestao erp", "desenvolvimento de app".

---

### 2. IMAGENS RETANGULARES (Proporção Paisagem 1.91:1 • 1200 x 628 px):
4. **\`04_Retangular_1200x628_Clinicas_Estetica_Agendamento.jpg\`**
   - **Nicho:** Clínicas de Estética, Clínicas Médicas e Serviços com Agendamento.
   - **Destaque:** Mockup lateral do smartphone com app de agendamento + card moderno com benefícios claros (agenda no piloto automático, lembretes no WhatsApp, sem comissões).
   - **Uso Recomendado:** Formato paisagem principal para campanhas segmentadas em estética e serviços com hora marcada.

5. **\`05_Retangular_1200x628_RMTI_Sites_Sistemas_Apps.jpg\`**
   - **Nicho:** RMTI Institucional / Todos os Serviços.
   - **Destaque:** Ilustração de alta conversão explicando os 3 pilares: Alcance Ampliado, Experiência do Cliente e Maior Eficiência.
   - **Uso Recomendado:** Campanhas institucionais e grupos de anúncios gerais de desenvolvimento web e sistemas.

---

## 🚀 DICAS PARA SUBIR NO GOOGLE ADS:
- No editor do anúncio do Google Ads, vá na seção **Imagens** (ou **Recursos > Imagens**).
- Clique em **+ Nova Imagem** ou **Fazer Upload**.
- Selecione os arquivos desta pasta: o Google Ads reconhecerá automaticamente as dimensões **1:1 (Quadrada)** e **1.91:1 (Paisagem)**.
- Todas as imagens já estão comprimidas e balanceadas com qualidade 96% (abaixo do limite de 5MB exigido pelo Google) e seguem a diretriz de contraste e legibilidade.
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readmeContent);
  console.log('✓ README.md gerado na pasta de Downloads.');

  console.log('\n=== PROCESSO CONCLUÍDO COM SUCESSO! ===');
}

generatePack().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
