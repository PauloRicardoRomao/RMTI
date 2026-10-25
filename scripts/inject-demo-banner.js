const fs = require('fs');
const path = require('path');

const modelosDir = path.join(__dirname, '../public/modelos');

if (fs.existsSync(modelosDir)) {
  const folders = fs.readdirSync(modelosDir);

  folders.forEach((folder) => {
    const indexPath = path.join(modelosDir, folder, 'index.html');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf-8');

      const customBanner = `
    <!-- BARRA OFICIAL DEMONSTRAÇÃO RMTI COM PAINEL ADMIN INCLUSO -->
    <div style="background: #090d16; border-bottom: 1px solid #1e293b; padding: 10px 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #e2e8f0; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; position: sticky; top: 0; z-index: 99999; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="background: #10b981; color: #022c22; font-weight: 900; font-size: 10px; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em;">Modelo Pronto</span>
            <span>🔥 <strong>Painel CMS Dinâmico Incluso</strong>: este modelo já vem com o painel do cliente para trocar textos, valores e WhatsApp sem código.</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <a href="/demo-painel?modelo=${folder}" target="_blank" style="color: #38bdf8; text-decoration: none; font-weight: 700; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.4); padding: 5px 12px; border-radius: 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">⚙️ Ver Painel CMS deste Modelo</a>
            <a href="/checkout?plano=pro" style="color: #022c22; text-decoration: none; font-weight: 800; background: linear-gradient(90deg, #10b981, #14b8a6); padding: 5px 14px; border-radius: 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">Comprar Modelo</a>
            <a href="/" style="color: #94a3b8; text-decoration: none; font-size: 11px; padding: 5px 8px;">✕ Voltar</a>
        </div>
    </div>`;

      // Replace existing banner or insert
      if (content.includes('<!-- BARRA OFICIAL DEMONSTRAÇÃO RMTI COM PAINEL ADMIN INCLUSO -->')) {
        content = content.replace(
          /<!-- BARRA OFICIAL DEMONSTRAÇÃO RMTI COM PAINEL ADMIN INCLUSO -->[\s\S]*?<\/div>\s*<\/div>/,
          customBanner.trim()
        );
      } else {
        content = content.replace(/<body[^>]*>/i, (match) => `${match}\n${customBanner}`);
      }

      fs.writeFileSync(indexPath, content, 'utf-8');
      console.log(`Banner atualizado para o modelo ${folder}`);
    }
  });
}
