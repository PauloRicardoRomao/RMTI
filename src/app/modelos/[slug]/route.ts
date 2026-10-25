import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    // Sanitize slug to avoid path traversal
    const cleanSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '');

    const filePath = path.join(process.cwd(), 'public', 'modelos', cleanSlug, 'index.html');

    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, 'utf-8');
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return new NextResponse('Modelo não encontrado.', { status: 404 });
  } catch (error) {
    console.error('Erro ao servir modelo:', error);
    return new NextResponse('Erro interno ao carregar modelo.', { status: 500 });
  }
}

