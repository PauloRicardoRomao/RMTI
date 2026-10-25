import { NextRequest, NextResponse } from 'next/server';
import { createPreference } from '@/lib/mercadopago';
import { readStorageFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, payerEmail } = body;

    const defaultPlans: Record<string, { title: string; price: number }> = {
      starter: { title: 'Pack Nicho Único - RMTI', price: 97.0 },
      pro: { title: 'Combo Completo Multi-Nichos + Admin - RMTI', price: 197.0 },
      vip: { title: 'Implementação VIP Done-For-You - RMTI', price: 697.0 },
      'combo-5em1': { title: 'Combo Completo 5 em 1 + Painel Admin - RMTI', price: 197.0 },
      'nicho-unico': { title: 'Pack Nicho Único à Escolha - RMTI', price: 97.0 },
      'implementacao-vip': { title: 'Implementação VIP Completa - RMTI', price: 697.0 },
    };

    let selectedPlan = defaultPlans[planId] || defaultPlans.pro;

    try {
      const rawConfig = readStorageFile('config.json');
      if (rawConfig) {
        const parsed = JSON.parse(rawConfig);
        if (Array.isArray(parsed?.products)) {
          const match = parsed.products.find((p: { id: string }) => p.id === planId);
          if (match && typeof match.price === 'number') {
            selectedPlan = {
              title: `${match.name} - RMTI`,
              price: match.price,
            };
          }
        }
      }
    } catch {
      // ignore
    }

    const origin = request.nextUrl.origin;

    const result = await createPreference({
      title: selectedPlan.title,
      price: selectedPlan.price,
      planId,
      payerEmail: payerEmail || 'cliente@rmti.com.br',
      originUrl: origin,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar preferência' },
      { status: 500 }
    );
  }
}

