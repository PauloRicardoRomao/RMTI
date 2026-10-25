import { NextRequest, NextResponse } from 'next/server';
import { 
  getOrders, 
  addOrUpdateOrder, 
  updateOrderStatus, 
  deleteOrder, 
  computeSummary 
} from '@/lib/ordersStore';

export async function GET() {
  try {
    const orders = await getOrders();
    const summary = computeSummary(orders);
    return NextResponse.json({
      success: true,
      orders,
      summary,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar pedidos';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      customerCpf, 
      planId, 
      planName, 
      templateId, 
      templateName, 
      amount, 
      paymentMethod, 
      status, 
      paymentId,
      notes,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    } = body;

    if (!customerName || !customerEmail || typeof amount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Nome, e-mail e valor são obrigatórios.' },
        { status: 400 }
      );
    }

    const created = await addOrUpdateOrder({
      paymentId,
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      planId,
      planName,
      templateId,
      templateName,
      amount,
      paymentMethod,
      status: status || 'pending',
      notes,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    });

    const orders = await getOrders();
    const summary = computeSummary(orders);

    return NextResponse.json({
      success: true,
      order: created,
      summary,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao salvar pedido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = body.orderId || body.id;
    const { status, notes } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'orderId e status são obrigatórios.' },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(orderId, status, notes);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado.' },
        { status: 404 }
      );
    }

    const orders = await getOrders();
    const summary = computeSummary(orders);

    return NextResponse.json({
      success: true,
      order: updated,
      summary,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar pedido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro id é obrigatório.' },
        { status: 400 }
      );
    }

    const deleted = await deleteOrder(orderId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado.' },
        { status: 404 }
      );
    }

    const orders = await getOrders();
    const summary = computeSummary(orders);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao remover pedido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

