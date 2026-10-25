'use client';

import React, { useState } from 'react';
import { IntegrationsConfig } from '@/types';
import {
  CreditCard,
  Lock,
  Check,
  X,
  Save,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  QrCode,
} from 'lucide-react';

interface GatewayTabProps {
  integrations?: IntegrationsConfig;
  onSaveIntegrations: (integrations: IntegrationsConfig) => Promise<boolean>;
  isSaving: boolean;
}

export default function GatewayTab({
  integrations,
  onSaveIntegrations,
  isSaving,
}: GatewayTabProps) {
  const [form, setForm] = useState({
    mercadoPagoAccessToken: integrations?.mercadoPagoAccessToken || '',
    mercadoPagoPublicKey: integrations?.mercadoPagoPublicKey || '',
    pixKey: integrations?.pixKey || '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: IntegrationsConfig = {
      ...(integrations || {}),
      mercadoPagoAccessToken: form.mercadoPagoAccessToken.trim(),
      mercadoPagoPublicKey: form.mercadoPagoPublicKey.trim(),
      pixKey: form.pixKey.trim(),
    };

    const ok = await onSaveIntegrations(updated);
    if (ok) {
      setFeedback({ type: 'success', message: 'Configurações de pagamento salvas com sucesso!' });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: 'Erro ao salvar configurações de pagamento.' });
    }
  };

  const isConfigured = Boolean(form.mercadoPagoAccessToken);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Configuração Mercado Pago &amp; Pix</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Configure as credenciais para processar pagamentos Pix dinâmicos e cartão de crédito no checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              isConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isConfigured ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Gateway Conectado</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Modo Demonstração (Sandbox)</span>
              </>
            )}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Access Token do Mercado Pago
            </label>
            <input
              type="password"
              value={form.mercadoPagoAccessToken}
              onChange={(e) => setForm({ ...form, mercadoPagoAccessToken: e.target.value })}
              placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Gere seu token de produção em: Mercado Pago Developers &gt; Suas Aplicações &gt; Credenciais de Produção.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Public Key (Opcional)
            </label>
            <input
              type="text"
              value={form.mercadoPagoPublicKey}
              onChange={(e) => setForm({ ...form, mercadoPagoPublicKey: e.target.value })}
              placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Chave Pix Alternativa (Opcional / Backup)
            </label>
            <input
              type="text"
              value={form.pixKey}
              onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
              placeholder="Ex: CNPJ, E-mail ou Telefone Pix"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Usada caso você queira exibir uma chave Pix estática em algum ponto do fluxo.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Credenciais</span>
            </button>
          </div>
        </form>

        {/* Informative Side Card */}
        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Como Funciona o Pix Dinâmico</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quando o cliente preenche nome, e-mail e CPF no <code>/checkout</code>, o sistema chama a API oficial do Mercado Pago para gerar um QR Code Pix dinâmico único com código Copia e Cola.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              O webhook da RMTI (<code>/api/mercadopago/webhook</code>) escuta a confirmação em tempo real e atualiza o pedido para <strong>Aprovado</strong> assim que o banco liquida o Pix.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Painel de Desenvolvedores</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Para pegar seu Access Token de Produção oficial:
            </p>
            <a
              href="https://www.mercadopago.com.br/developers/panel"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>Abrir Painel Mercado Pago</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

