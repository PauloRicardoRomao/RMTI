import { NextRequest, NextResponse } from 'next/server';
import { createPixPayment } from '@/lib/mercadopago';
import { addOrUpdateOrder } from '@/lib/ordersStore';
import { readStorageFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planId,
      templateName,
      name,
      email,
      cpf,
      phone,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    } = body;

    if (!name || !email || !cpf) {
      return NextResponse.json(
        { success: false, error: 'Nome, e-mail e CPF são obrigatórios para emissão do Pix' },
        { status: 400 }
      );
    }

    // Default fallback plans
    const defaultPlans: Record<string, { title: string; price: number }> = {
      starter: { title: 'Pack Nicho Único - RMTI', price: 97.0 },
      pro: { title: 'Combo Completo Multi-Nichos + Admin - RMTI', price: 197.0 },
      vip: { title: 'Implementação VIP Done-For-You - RMTI', price: 697.0 },
      'combo-5em1': { title: 'Combo Completo 5 em 1 + Painel Admin - RMTI', price: 197.0 },
      'nicho-unico': { title: 'Pack Nicho Único à Escolha - RMTI', price: 97.0 },
      'implementacao-vip': { title: 'Implementação VIP Completa - RMTI', price: 697.0 },
    };

    let selectedPlan = defaultPlans[planId] || defaultPlans.pro;

    // Check if dynamic products are configured in config.json
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

    const finalDescription = templateName 
      ? `${selectedPlan.title} • ${templateName}` 
      : selectedPlan.title;

    const names = name.trim().split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || firstName;

    const origin = request.nextUrl.origin;

    const result = await createPixPayment({
      amount: selectedPlan.price,
      description: finalDescription,
      payer: {
        email: email.trim(),
        firstName,
        lastName,
        cpf,
        phone,
      },
      notificationUrl: `${origin}/api/mercadopago/webhook`,
    });

    if (result.success && result.paymentId) {
      try {
        await addOrUpdateOrder({
          id: `ord-${Date.now()}`,
          paymentId: result.paymentId,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone || '',
          customerCpf: cpf || '',
          planId,
          planName: selectedPlan.title,
          templateName: templateName || '',
          amount: selectedPlan.price,
          paymentMethod: 'pix',
          status: 'pending',
          notes: result.isDemo ? 'Pedido em modo demonstração.' : 'Pix gerado no checkout Mercado Pago.',
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
        });
      } catch (storeErr) {
        console.error('Error saving order to store:', storeErr);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Pix generation error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar Pix' },
      { status: 500 }
    );
  }
}

