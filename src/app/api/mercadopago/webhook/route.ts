import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/mercadopago';
import { updateOrderStatus } from '@/lib/ordersStore';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let paymentId = searchParams.get('data.id') || searchParams.get('id');
    let type = searchParams.get('type') || searchParams.get('topic');

    // Also check JSON payload if provided by Mercado Pago
    try {
      const body = await request.json();
      if (body) {
        if (!paymentId && body.data?.id) {
          paymentId = String(body.data.id);
        } else if (!paymentId && body.id) {
          paymentId = String(body.id);
        }
        if (!type && body.type) {
          type = body.type;
        }
      }
    } catch {
      // Payload might be empty or URL-encoded; query params already handled
    }

    if (paymentId && (type === 'payment' || !type)) {
      const result = await checkPaymentStatus(paymentId);

      if (result.success && result.status === 'approved') {
        await updateOrderStatus(
          paymentId,
          'approved',
          'Aprovado automaticamente via Webhook Mercado Pago.'
        );
      } else if (
        result.success &&
        (result.status === 'cancelled' || result.status === 'rejected')
      ) {
        await updateOrderStatus(
          paymentId,
          'cancelled',
          `Cancelado pelo gateway: ${result.statusDetail || result.status}`
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Mercado Pago Webhook Error:', err);
    // Always return 200 so Mercado Pago does not retry indefinitely
    return NextResponse.json({ received: true, error: 'Webhook logged' }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Mercado Pago Webhook Listener - RMTI',
    timestamp: new Date().toISOString(),
  });
}

