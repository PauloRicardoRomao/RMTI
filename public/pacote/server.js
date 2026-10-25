const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
};

const server = http.createServer((req, res) => {
  try {
    // Extrai o caminho limpo sem query string
    const urlPath = decodeURI(req.url.split('?')[0]);
    let filePath = path.join(PUBLIC_DIR, urlPath);

    // Mapeamento de rotas amigáveis
    if (urlPath === '/' || urlPath === '') {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    } else if (urlPath === '/admin' || urlPath === '/admin/') {
      filePath = path.join(PUBLIC_DIR, 'admin', 'index.html');
    } else if (urlPath === '/checkout' || urlPath === '/checkout/') {
      filePath = path.join(PUBLIC_DIR, 'checkout.html');
    } else if (urlPath === '/obrigado' || urlPath === '/obrigado/') {
      filePath = path.join(PUBLIC_DIR, 'obrigado.html');
    } else if (urlPath === '/manual' || urlPath === '/manual/') {
      filePath = path.join(PUBLIC_DIR, 'MANUAL-ILUSTRADO.html');
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>404 - Página Não Encontrada</title>
          <style>
            body { font-family: sans-serif; background: #0b1120; color: #fff; text-align: center; padding: 50px 20px; }
            a { color: #10b981; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>404 - Página Não Encontrada</h1>
          <p>O arquivo solicitado não foi encontrado no projeto.</p>
          <p><a href="/">← Voltar para a Página Principal</a> | <a href="/admin">Acessar Painel Admin</a></p>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const fileStream = fs.createReadStream(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erro interno do servidor: ' + error.message);
  }
});

server.listen(PORT, () => {
  console.log('================================================================');
  console.log('  🚀 SERVIDOR DO PACOTE ALL-IN-ONE INICIADO COM SUCESSO!');
  console.log('================================================================');
  console.log(`  🌐 Landing Page:    http://localhost:${PORT}`);
  console.log(`  ⚙️  Painel Admin:    http://localhost:${PORT}/admin`);
  console.log(`  💳 Checkout:        http://localhost:${PORT}/checkout`);
  console.log(`  📖 Manual:          http://localhost:${PORT}/manual`);
  console.log('================================================================');
  console.log('  Pressione Ctrl + C para encerrar o servidor.');
});

