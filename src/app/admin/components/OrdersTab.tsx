'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrdersSummary, OrderStatus } from '@/types/order';
import {
  DollarSign,
  ShoppingCart,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Copy,
  Trash2,
  Check,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrdersSummary>({
    totalRevenue: 0,
    totalOrders: 0,
    approvedCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
    averageTicket: 0,
    uniqueCustomersCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setOrders(json.orders || []);
          if (json.summary) setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
          );
          if (data.summary) setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar status do pedido:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Deseja excluir permanentemente este pedido?')) return;
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          if (data.summary) setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error('Erro ao remover pedido:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      (order.customerCpf && order.customerCpf.includes(searchTerm)) ||
      order.planName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Vendas &amp; Pedidos Mercado Pago</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Monitore as conversões de vendas, pagamentos Pix aprovados e contate clientes diretamente no WhatsApp.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar Pedidos</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Receita Aprovada</span>
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">
            {summary.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[11px] text-slate-500">{summary.approvedCount} pedidos pagos</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <span>Total de Pedidos</span>
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {summary.totalOrders}
          </span>
          <span className="text-[11px] text-slate-500">{summary.uniqueCustomersCount} clientes únicos</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pendentes (Pix)</span>
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">
            {summary.pendingCount}
          </span>
          <span className="text-[11px] text-slate-500">Aguardando transferência</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span>Ticket Médio</span>
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {summary.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[11px] text-slate-500">Por venda aprovada</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, fone, CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'approved', 'pending', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all'
                ? 'Todos'
                : st === 'approved'
                ? 'Aprovados'
                : st === 'pending'
                ? 'Pendentes'
                : 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <p className="text-slate-400 text-sm">Nenhum pedido encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredOrders.map((order) => {
            const cleanPhone = order.customerPhone.replace(/\D/g, '');
            const wppMessage = encodeURIComponent(
              `Olá ${order.customerName}! Aqui é da RMTI Tecnologia. Vimos seu pedido (${order.planName}) e gostaríamos de confirmar os dados de entrega da sua estrutura digital!`
            );
            const wppUrl = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${wppMessage}` : null;

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        order.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {order.status === 'approved'
                        ? 'Aprovado'
                        : order.status === 'pending'
                        ? 'Pendente'
                        : 'Cancelado'}
                    </span>
                    <span className="text-xs font-bold text-white">{order.planName}</span>
                    <span className="text-xs text-slate-500">• {new Date(order.createdAt).toLocaleString('pt-BR')}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                    <span className="font-semibold text-white">{order.customerName}</span>
                    <span>{order.customerEmail}</span>
                    {order.customerPhone && <span>Tel: {order.customerPhone}</span>}
                    {order.customerCpf && <span>CPF: {order.customerCpf}</span>}
                  </div>

                  {order.notes && (
                    <span className="text-[11px] text-slate-400 italic">{order.notes}</span>
                  )}
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="text-lg font-black text-white block">
                      {order.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {order.paymentMethod === 'pix' ? 'Pix Mercado Pago' : order.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {wppUrl && (
                      <a
                        href={wppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="Falar com o comprador no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="approved">Aprovado</option>
                      <option value="pending">Pendente</option>
                      <option value="cancelled">Cancelado</option>
                    </select>

                    <button
                      onClick={() =>
                        copyToClipboard(
                          `Cliente: ${order.customerName}\nEmail: ${order.customerEmail}\nTel: ${order.customerPhone}\nCPF: ${order.customerCpf}\nPlano: ${order.planName}\nValor: R$ ${order.amount}\nStatus: ${order.status}`,
                          order.id
                        )
                      }
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Copiar dados do pedido"
                    >
                      {copiedId === order.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Excluir pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

