import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug || slug.length === 0) {
      return new NextResponse('Pacote não especificado.', { status: 400 });
    }

    // Sanitize each segment to avoid path traversal
    const safeSegments = slug.map((seg) => seg.replace(/[^a-zA-Z0-9_.-]/g, ''));
    const packageId = safeSegments[0];
    const subPath = safeSegments.slice(1).join('/');

    let targetFile = '';

    if (!subPath || subPath === '') {
      targetFile = path.join(process.cwd(), 'public', 'pacotes', packageId, 'index.html');
    } else if (subPath === 'admin') {
      targetFile = path.join(process.cwd(), 'public', 'pacotes', packageId, 'admin', 'index.html');
    } else if (subPath === 'checkout') {
      targetFile = path.join(process.cwd(), 'public', 'pacotes', packageId, 'checkout.html');
    } else if (subPath === 'obrigado') {
      targetFile = path.join(process.cwd(), 'public', 'pacotes', packageId, 'obrigado.html');
    } else {
      targetFile = path.join(process.cwd(), 'public', 'pacotes', packageId, subPath);
    }

    if (fs.existsSync(targetFile)) {
      const ext = path.extname(targetFile).toLowerCase();
      let contentType = 'text/html; charset=utf-8';

      if (ext === '.css') contentType = 'text/css';
      else if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.pdf') contentType = 'application/pdf';

      const fileBuffer = fs.readFileSync(targetFile);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return new NextResponse('Arquivo do pacote não encontrado.', { status: 404 });
  } catch (error) {
    console.error('Erro ao servir pacote:', error);
    return new NextResponse('Erro interno ao carregar pacote.', { status: 500 });
  }
}

