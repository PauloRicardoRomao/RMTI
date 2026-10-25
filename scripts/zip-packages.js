const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const base = path.join(__dirname, '../public/pacotes');
const zipDir = path.join(__dirname, '../public/downloads');
if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });

const list = [
  'pacote-01-vendas-diretas',
  'pacote-02-leads-whatsapp',
  'pacote-03-institucional-negocios'
];

list.forEach(pkg => {
  const source = path.join(base, pkg);
  const target = path.join(zipDir, pkg + '.zip');
  if (fs.existsSync(target)) fs.unlinkSync(target);
  console.log('Compactando:', pkg, '...');
  execSync(`powershell -Command "Compress-Archive -Path '${source}\\*' -DestinationPath '${target}' -Force"`);
  console.log('Gerado:', target, '(', fs.statSync(target).size, 'bytes )');
});

console.log('Todos os pacotes compactados com sucesso em public/downloads/');

