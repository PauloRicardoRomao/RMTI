import { Order, OrdersSummary } from '@/types/order';
import { readStorageFile, writeStorageFile } from '@/lib/storage';

const ORDERS_FILE = 'orders.json';
const INITIAL_ORDERS: Order[] = [];

export async function getOrders(): Promise<Order[]> {
  try {
    const raw = readStorageFile(ORDERS_FILE);
    if (!raw) {
      writeStorageFile(ORDERS_FILE, JSON.stringify(INITIAL_ORDERS, null, 2));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export async function saveOrders(orders: Order[]): Promise<boolean> {
  try {
    return writeStorageFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Error saving orders:', err);
    return false;
  }
}

export async function addOrUpdateOrder(newOrder: Partial<Order> & { customerEmail: string; customerName: string; amount: number }): Promise<Order> {
  const current = await getOrders();
  
  // Find by paymentId or ID
  const existingIdx = current.findIndex(
    (o) => (newOrder.id && o.id === newOrder.id) || (newOrder.paymentId && o.paymentId === newOrder.paymentId)
  );

  if (existingIdx >= 0) {
    const updated: Order = {
      ...current[existingIdx],
      ...newOrder,
    };
    current[existingIdx] = updated;
    await saveOrders(current);
    return updated;
  }

  const created: Order = {
    id: newOrder.id || `ord-${Date.now()}`,
    paymentId: newOrder.paymentId,
    createdAt: newOrder.createdAt || new Date().toISOString(),
    customerName: newOrder.customerName,
    customerEmail: newOrder.customerEmail,
    customerPhone: newOrder.customerPhone || '',
    customerCpf: newOrder.customerCpf || '',
    planId: newOrder.planId || 'pro',
    planName: newOrder.planName || 'Combo Completo Multi-Nichos',
    templateId: newOrder.templateId,
    templateName: newOrder.templateName,
    amount: newOrder.amount,
    paymentMethod: newOrder.paymentMethod || 'pix',
    status: newOrder.status || 'pending',
    notes: newOrder.notes || '',
    utmSource: newOrder.utmSource,
    utmMedium: newOrder.utmMedium,
    utmCampaign: newOrder.utmCampaign,
    utmContent: newOrder.utmContent,
    utmTerm: newOrder.utmTerm,
  };

  current.unshift(created);
  await saveOrders(current);
  return created;
}

export async function updateOrderStatus(orderIdOrPaymentId: string, status: Order['status'], notes?: string): Promise<Order | null> {
  const current = await getOrders();
  const idx = current.findIndex((o) => o.id === orderIdOrPaymentId || o.paymentId === orderIdOrPaymentId);
  if (idx < 0) return null;

  current[idx].status = status;
  if (notes !== undefined) {
    current[idx].notes = notes;
  }
  await saveOrders(current);
  return current[idx];
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const current = await getOrders();
  const filtered = current.filter((o) => o.id !== orderId);
  if (filtered.length === current.length) return false;
  await saveOrders(filtered);
  return true;
}

export function computeSummary(orders: Order[]): OrdersSummary {
  const approvedOrders = orders.filter((o) => o.status === 'approved');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const totalRevenue = approvedOrders.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const averageTicket = approvedOrders.length > 0 ? totalRevenue / approvedOrders.length : 0;

  const emails = new Set(orders.map((o) => o.customerEmail.toLowerCase().trim()));

  return {
    totalRevenue,
    totalOrders: orders.length,
    approvedCount: approvedOrders.length,
    pendingCount: pendingOrders.length,
    cancelledCount: cancelledOrders.length,
    averageTicket,
    uniqueCustomersCount: emails.size,
  };
}

