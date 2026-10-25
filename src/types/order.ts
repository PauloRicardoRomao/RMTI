export type OrderStatus = 'approved' | 'pending' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  paymentId?: string;
  createdAt: string; // ISO 8601
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  planId: 'starter' | 'pro' | 'vip' | string;
  planName: string;
  templateId?: string;
  templateName?: string;
  amount: number;
  paymentMethod: 'pix' | 'credit_card' | 'manual' | string;
  status: OrderStatus;
  notes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface OrdersSummary {
  totalRevenue: number;
  totalOrders: number;
  approvedCount: number;
  pendingCount: number;
  cancelledCount: number;
  averageTicket: number;
  uniqueCustomersCount: number;
}

