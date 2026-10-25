import { readStorageFile } from '@/lib/storage';

export async function getMercadoPagoAccessToken(): Promise<string> {
  // 1. Check environment variable first
  if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return process.env.MERCADOPAGO_ACCESS_TOKEN.trim();
  }

  // 2. Check saved config in data/config.json
  try {
    const raw = readStorageFile('config.json');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.integrations?.mercadoPagoAccessToken) {
        return parsed.integrations.mercadoPagoAccessToken.trim();
      }
    }
  } catch {
    // ignore
  }

  return '';
}

export interface CreatePixParams {
  amount: number;
  description: string;
  payer: {
    email: string;
    firstName: string;
    lastName: string;
    cpf: string;
    phone?: string;
  };
  notificationUrl?: string;
}

export interface MercadoPagoPixResponse {
  success: boolean;
  paymentId?: string;
  status?: string;
  statusDetail?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  isDemo?: boolean;
  error?: string;
}

export async function createPixPayment(params: CreatePixParams): Promise<MercadoPagoPixResponse> {
  const token = await getMercadoPagoAccessToken();
  const cleanCpf = params.payer.cpf.replace(/\D/g, '');

  // If no token is set, return a fully functional Demo Sandbox QR code
  if (!token) {
    const demoId = `demo-pix-${Date.now()}`;
    return {
      success: true,
      paymentId: demoId,
      status: 'pending',
      statusDetail: 'waiting_transfer',
      isDemo: true,
      qrCode: `00020101021226840014br.gov.bcb.pix2562pix.mercadopago.com/qr/${demoId}520400005303986540${params.amount.toFixed(2)}5802BR5925RMTI TECNOLOGIA DIGITAIS6009SAO PAULO62070503***6304ABCD`,
      qrCodeBase64: '',
      ticketUrl: 'https://www.mercadopago.com.br',
    };
  }

  try {
    const idempotencyKey = `rmti-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const isValidHttpsNotificationUrl = Boolean(
      params.notificationUrl &&
      params.notificationUrl.startsWith('https://') &&
      !params.notificationUrl.includes('localhost') &&
      !params.notificationUrl.includes('127.0.0.1')
    );

    const payload = {
      transaction_amount: params.amount,
      description: params.description,
      payment_method_id: 'pix',
      payer: {
        email: params.payer.email,
        first_name: params.payer.firstName,
        last_name: params.payer.lastName || params.payer.firstName,
        identification: {
          type: 'CPF',
          number: cleanCpf,
        },
      },
      ...(isValidHttpsNotificationUrl ? { notification_url: params.notificationUrl } : {}),
    };

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || data.cause?.[0]?.description || 'Erro ao comunicar com Mercado Pago';
      console.error('Mercado Pago API Error:', data);
      return {
        success: false,
        error: errorMsg,
      };
    }

    const txData = data.point_of_interaction?.transaction_data;

    return {
      success: true,
      paymentId: String(data.id),
      status: data.status,
      statusDetail: data.status_detail,
      qrCode: txData?.qr_code || '',
      qrCodeBase64: txData?.qr_code_base64 || '',
      ticketUrl: txData?.ticket_url || '',
      isDemo: false,
    };
  } catch (err) {
    console.error('Error creating Pix payment:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha na conexão com Mercado Pago',
    };
  }
}

export async function checkPaymentStatus(paymentId: string) {
  if (paymentId.startsWith('demo-pix-')) {
    return {
      success: true,
      status: 'pending',
      statusDetail: 'demo_mode',
      isDemo: true,
    };
  }

  const token = await getMercadoPagoAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Token do Mercado Pago não configurado',
    };
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Erro ao consultar status no Mercado Pago',
      };
    }

    return {
      success: true,
      status: data.status, // 'approved', 'pending', 'rejected', 'in_process'
      statusDetail: data.status_detail,
      isDemo: false,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao consultar status',
    };
  }
}

export async function createPreference(params: {
  title: string;
  price: number;
  planId: string;
  payerEmail: string;
  originUrl: string;
}) {
  const token = await getMercadoPagoAccessToken();

  if (!token) {
    return {
      success: false,
      error: 'Token do Mercado Pago não configurado no painel da RMTI',
    };
  }

  try {
    const payload = {
      items: [
        {
          title: params.title,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: params.price,
        },
      ],
      payer: {
        email: params.payerEmail,
      },
      back_urls: {
        success: `${params.originUrl}/obrigado?plano=${params.planId}&status=success`,
        failure: `${params.originUrl}/checkout?plano=${params.planId}&status=failure`,
        pending: `${params.originUrl}/checkout?plano=${params.planId}&status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'RMTI TECNOLOGIA',
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Erro ao gerar preferência no Mercado Pago',
      };
    }

    return {
      success: true,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Falha ao conectar com Mercado Pago',
    };
  }
}

