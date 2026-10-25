const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createPlaceholders() {
  const dir = path.join(__dirname, '../public/assets/placeholders');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Logo Placeholder (400x120 SVG to PNG)
  const logoSvg = Buffer.from(`
    <svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="400" height="120" rx="20" fill="url(#logoBg)" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 6"/>
      <circle cx="60" cy="60" r="28" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="2"/>
      <text x="60" y="68" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="24" font-weight="900" text-anchor="middle">★</text>
      <text x="110" y="55" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="900" letter-spacing="1">SUA LOGO AQUI</text>
      <text x="110" y="80" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" font-weight="600">400 x 120 px • Transparente ou PNG</text>
    </svg>
  `);
  await sharp(logoSvg).png().toFile(path.join(dir, 'logo-placeholder.png'));

  // 2. Banner Hero Placeholder (1200x630 SVG to JPG)
  const bannerSvg = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b1329"/>
          <stop offset="50%" stop-color="#111e38"/>
          <stop offset="100%" stop-color="#080d1a"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2563eb" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bgGrad)"/>
      <rect width="1200" height="630" fill="url(#glow)"/>
      
      <!-- Grid -->
      <g opacity="0.08" stroke="#38bdf8" stroke-width="1">
        <line x1="0" y1="100" x2="1200" y2="100"/>
        <line x1="0" y1="200" x2="1200" y2="200"/>
        <line x1="0" y1="300" x2="1200" y2="300"/>
        <line x1="0" y1="400" x2="1200" y2="400"/>
        <line x1="0" y1="500" x2="1200" y2="500"/>
        <line x1="200" y1="0" x2="200" y2="630"/>
        <line x1="400" y1="0" x2="400" y2="630"/>
        <line x1="600" y1="0" x2="600" y2="630"/>
        <line x1="800" y1="0" x2="800" y2="630"/>
        <line x1="1000" y1="0" x2="1000" y2="630"/>
      </g>

      <rect x="100" y="80" width="1000" height="470" rx="32" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="12 12" opacity="0.6"/>
      
      <circle cx="600" cy="230" r="56" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <text x="600" y="248" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="44" font-weight="900" text-anchor="middle">🖼</text>

      <text x="600" y="340" fill="#ffffff" font-family="system-ui, sans-serif" font-size="44" font-weight="900" text-anchor="middle" letter-spacing="1">SEU BANNER OU VÍDEO AQUI</text>
      <text x="600" y="390" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="22" font-weight="600" text-anchor="middle">Resolução Recomendada: 1200 x 630 px • Destaque Hero</text>
      
      <rect x="440" y="425" width="320" height="46" rx="23" fill="#2563eb" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="600" y="454" fill="#7dd3fc" font-family="system-ui, sans-serif" font-size="16" font-weight="700" text-anchor="middle">Altere facilmente pelo Painel Admin</text>
    </svg>
  `);
  await sharp(bannerSvg).jpeg({ quality: 90 }).toFile(path.join(dir, 'banner-placeholder.jpg'));

  // 3. Foto Especialista / Pessoa (800x800 SVG to JPG)
  const fotoSvg = Buffer.from(`
    <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fotoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#111827"/>
          <stop offset="100%" stop-color="#030712"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#fotoBg)"/>
      <rect x="50" y="50" width="700" height="700" rx="40" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="10 10" opacity="0.5"/>
      <circle cx="400" cy="340" r="100" fill="#1f2937" stroke="#10b981" stroke-width="3"/>
      <text x="400" y="375" fill="#10b981" font-family="system-ui, sans-serif" font-size="70" font-weight="900" text-anchor="middle">👤</text>
      <text x="400" y="520" fill="#ffffff" font-family="system-ui, sans-serif" font-size="36" font-weight="900" text-anchor="middle">SUA FOTO OU DO ESPECIALISTA</text>
      <text x="400" y="565" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="20" font-weight="600" text-anchor="middle">800 x 800 px • Formato Quadrado ou Retrato</text>
      <text x="400" y="610" fill="#34d399" font-family="system-ui, sans-serif" font-size="16" font-weight="700" text-anchor="middle">Altere com 1 clique no Painel Admin</text>
    </svg>
  `);
  await sharp(fotoSvg).jpeg({ quality: 90 }).toFile(path.join(dir, 'foto-placeholder.jpg'));

  // 4. Mockup do Produto / E-book / Tela (800x600)
  const mockupSvg = Buffer.from(`
    <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mockBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#mockBg)"/>
      <rect x="40" y="40" width="720" height="520" rx="30" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-dasharray="8 8" opacity="0.6"/>
      <circle cx="400" cy="240" r="70" fill="#312e81" stroke="#a5b4fc" stroke-width="2"/>
      <text x="400" y="265" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="50" font-weight="900" text-anchor="middle">📦</text>
      <text x="400" y="380" fill="#ffffff" font-family="system-ui, sans-serif" font-size="36" font-weight="900" text-anchor="middle">SEU PRODUTO OU MOCKUP AQUI</text>
      <text x="400" y="420" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="20" font-weight="600" text-anchor="middle">Capa de E-book, Curso, Aplicativo ou Foto</text>
      <text x="400" y="465" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="16" font-weight="700" text-anchor="middle">Configure no Painel Admin</text>
    </svg>
  `);
  await sharp(mockupSvg).jpeg({ quality: 90 }).toFile(path.join(dir, 'mockup-placeholder.jpg'));

  console.log('Placeholders criados com sucesso em:', dir);
}

createPlaceholders().catch(console.error);
