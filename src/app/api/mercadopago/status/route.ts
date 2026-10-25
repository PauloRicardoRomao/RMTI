import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/mercadopago';
import { updateOrderStatus } from '@/lib/ordersStore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'payment_id é obrigatório' },
        { status: 400 }
      );
    }

    const result = await checkPaymentStatus(paymentId);

    if (result.status === 'approved') {
      try {
        await updateOrderStatus(paymentId, 'approved', 'Pagamento aprovado via Mercado Pago.');
      } catch (storeErr) {
        console.error('Error updating order status in store:', storeErr);
      }
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao consultar status' },
      { status: 500 }
    );
  }
}

