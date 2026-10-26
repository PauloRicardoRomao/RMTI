"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/analytics";
import {
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Download,
  FolderGit2,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  Copy,
  Check,
} from "lucide-react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const planoParam = searchParams.get("plano") || "pro";
  const templateParam = searchParams.get("template") || "";
  const langParam = searchParams.get("lang");

  const [lang, setLang] = React.useState<'pt' | 'en'>(langParam === 'en' ? 'en' : 'pt');

  React.useEffect(() => {
    try {
      const savedLang = localStorage.getItem('rmti_lang');
      if (langParam === 'en' || langParam === 'pt') {
        setLang(langParam);
      } else if (savedLang === 'en') {
        setLang('en');
      }
    } catch {
      // ignore
    }
  }, [langParam]);

  const isEn = lang === 'en';

  const templateNamesPt: Record<string, string> = {
    "starter-allinone": "Pacote All-in-One (3 Modelos em 1)",
    "starter-1": "Layout 01: Vendas Diretas & VSL",
    "starter-2": "Layout 02: Captura & WhatsApp VIP",
    "starter-3": "Layout 03: Institucional & B2B",
    "vip-1": "Implementação VIP Completa (3 Layouts)",
  };

  const templateNamesEn: Record<string, string> = {
    "starter-allinone": "All-in-One Pack (3-in-1 Structure)",
    "starter-1": "Layout 01: Direct Sales & VSL",
    "starter-2": "Layout 02: Lead Capture & VIP WhatsApp",
    "starter-3": "Layout 03: Corporate & B2B Showcase",
    "vip-1": "VIP Turnkey Implementation (3 Layouts)",
  };

  const templateNames = isEn ? templateNamesEn : templateNamesPt;

  const selectedTemplateName =
    templateNames[templateParam] ||
    (templateParam ? `Modelo: ${templateParam}` : "Pacote Completo All-in-One (3 Layouts + 3 Checkouts)");

  // Arquivo .ZIP oficial do Pacote All-in-One para download imediato
  const currentDownload = {
    file: "/downloads/pacote-landing-page-rmti.zip",
    label: isEn
      ? "Download All-in-One Landing Page Pack (.ZIP)"
      : "Baixar Pacote de Landing Page All-in-One Completo (.ZIP)",
  };

  const planDetailsPt: Record<
    string,
    { name: string; price: string; hasAdmin: boolean; description: string }
  > = {
    starter: {
      name: "Pacote All-in-One de Landing Page",
      price: "R$ 197",
      hasAdmin: true,
      description:
        "Acesso liberado à estrutura universal com 3 Layouts selecionáveis + 3 Modelos de Checkout + Painel Admin Próprio + Manual Ilustrado em PDF.",
    },
    pro: {
      name: "Pacote All-in-One de Landing Page",
      price: "R$ 197",
      hasAdmin: true,
      description:
        "Acesso liberado à estrutura universal com 3 Layouts selecionáveis + 3 Modelos de Checkout + Painel Admin Próprio + Manual Ilustrado em PDF.",
    },
    vip: {
      name: "Implementação VIP Done-For-You",
      price: "R$ 697",
      hasAdmin: true,
      description:
        "Nossa equipe de engenharia iniciará a instalação e personalização completa da sua Landing Page no seu domínio.",
    },
  };

  const planDetailsEn: Record<
    string,
    { name: string; price: string; hasAdmin: boolean; description: string }
  > = {
    starter: {
      name: "All-in-One Landing Page Pack",
      price: "$39 USD",
      hasAdmin: true,
      description:
        "Full access to the universal structure with 3 Switchable Layouts + 3 Checkout Models + Custom CMS Admin Panel + Illustrated PDF Manual.",
    },
    pro: {
      name: "All-in-One Landing Page Pack",
      price: "$39 USD",
      hasAdmin: true,
      description:
        "Full access to the universal structure with 3 Switchable Layouts + 3 Checkout Models + Custom CMS Admin Panel + Illustrated PDF Manual.",
    },
    vip: {
      name: "Done-For-You VIP Implementation",
      price: "$139 USD",
      hasAdmin: true,
      description:
        "Our engineering team will execute the complete setup and custom launch on your domain in 72h.",
    },
  };

  const planDetails = isEn ? planDetailsEn : planDetailsPt;
  const currentPlan = planDetails[planoParam] || planDetails.starter;

  const paymentIdParam = searchParams.get("payment_id");
  const [copiedKey, setCopiedKey] = React.useState(false);
  const licenseKey = paymentIdParam || `RMTI-${planoParam.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Estado do Formulário de Briefing de Instalação VIP (Done-For-You)
  const isVipPlan = planoParam === "vip";
  const [showBriefingForm, setShowBriefingForm] = React.useState<boolean>(isVipPlan);
  const [briefingName, setBriefingName] = React.useState("");
  const [briefingEmail, setBriefingEmail] = React.useState("");
  const [briefingPhone, setBriefingPhone] = React.useState("");
  const [briefingBusiness, setBriefingBusiness] = React.useState("");
  const [briefingLayout, setBriefingLayout] = React.useState("Modelo 01: Vendas Diretas & VSL");
  const [briefingCheckout, setBriefingCheckout] = React.useState("Checkout 02: Alta Conversão (2 Colunas + Order Bump)");
  const [briefingGateway, setBriefingGateway] = React.useState("Mercado Pago (Link ou API)");
  const [briefingDomain, setBriefingDomain] = React.useState("");
  const [briefingPixels, setBriefingPixels] = React.useState("");
  const [briefingNotes, setBriefingNotes] = React.useState("");
  const [briefingSubmitting, setBriefingSubmitting] = React.useState(false);
  const [briefingSubmitted, setBriefingSubmitted] = React.useState(false);

  // Carrega dados preenchidos no checkout para facilitar o preenchimento do cliente VIP
  useEffect(() => {
    setShowBriefingForm(planoParam === "vip");
    try {
      const rawBuyer = sessionStorage.getItem("rmti_buyer_info");
      if (rawBuyer) {
        const parsed = JSON.parse(rawBuyer);
        if (parsed.name) setBriefingName(parsed.name);
        if (parsed.email) setBriefingEmail(parsed.email);
        if (parsed.phone) setBriefingPhone(parsed.phone);
      }
    } catch {
      // ignore
    }
  }, [planoParam]);

  // Automatically verify & approve order in database upon reaching thank you page
  useEffect(() => {
    if (paymentIdParam && !paymentIdParam.startsWith("demo-")) {
      fetch(`/api/mercadopago/status?payment_id=${paymentIdParam}`)
        .then((res) => res.json())
        .catch((err) => console.error("Error auto-verifying payment on thank you page:", err));
    }
  }, [paymentIdParam]);

  // Track Purchase conversion event
  useEffect(() => {
    const paymentId = searchParams.get("payment_id") || undefined;
    const numericPrice = isEn
      ? (planoParam === "vip" ? 139.0 : 39.0)
      : (planoParam === "vip" ? 697.0 : 197.0);
    trackPurchase(currentPlan.name, numericPrice, paymentId);

    // Direct Google Ads conversion trigger for instant verification
    if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "conversion", {
        send_to: "AW-18531803428/1pCwCJjGoqcdEKTC04RF",
        value: numericPrice,
        currency: isEn ? "USD" : "BRL",
        transaction_id: paymentId || "",
      });
    }
  }, [currentPlan.name, planoParam, searchParams, isEn]);

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const whatsappNumber = "5514998627852";
  const whatsappMsg = encodeURIComponent(
    isEn
      ? `Hello RMTI! I reached out through the official page and just completed my payment for the "${currentPlan.name}" package${
          selectedTemplateName ? ` (selected architecture: ${selectedTemplateName})` : ""
        } and would like to activate my onboarding and VIP support!`
      : `Olá RMTI! Vim através da página oficial e acabei de realizar o pagamento do plano "${currentPlan.name}"${
          selectedTemplateName
            ? ` (escolhi o template: ${selectedTemplateName})`
            : ""
        } via Mercado Pago e gostaria de ativar meu acesso e começar!`
  );

  const handleBriefingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefingName.trim() || !briefingPhone.trim()) return;

    setBriefingSubmitting(true);

    const structuredMessage = [
      `🚀 BRIEFING DE INSTALAÇÃO VIP (DONE-FOR-YOU)`,
      `• Licença / Pedido: ${licenseKey}`,
      `• Plano: ${currentPlan.name} (${currentPlan.price})`,
      `• Cliente: ${briefingName.trim()}`,
      `• WhatsApp: ${briefingPhone.trim()}`,
      `• E-mail: ${briefingEmail.trim() || "Não informado"}`,
      `• Nome do Negócio / Produto: ${briefingBusiness.trim() || "A definir"}`,
      `• Layout Escolhido: ${briefingLayout}`,
      `• Modelo de Checkout: ${briefingCheckout}`,
      `• Forma de Recebimento: ${briefingGateway}`,
      `• Domínio / Hospedagem: ${briefingDomain.trim() || "Preciso de auxílio da RMTI"}`,
      `• Pixels (Meta / Google): ${briefingPixels.trim() || "Enviar depois"}`,
      `• Observações & Cores: ${briefingNotes.trim() || "Nenhuma observação adicional"}`,
    ].join("\n");

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: briefingName.trim(),
          email: briefingEmail.trim() || "vip@cliente-rmti.com.br",
          phone: briefingPhone.trim(),
          service: `Briefing Instalação VIP (${licenseKey})`,
          message: structuredMessage,
        }),
      });
    } catch (err) {
      console.error("Erro ao salvar briefing VIP no painel:", err);
    }

    setBriefingSubmitting(false);
    setBriefingSubmitted(true);

    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(structuredMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-gray-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-[#090b10]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-md border border-white/90 transition-transform group-hover:scale-105 flex items-center justify-center">
              <img
                src="/assets/imagens/IconeNovo-trimmed.webp"
                alt="RMTI - Soluções Inteligentes"
                className="h-8 sm:h-9 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/rmti/IconeNovo-trimmed.png';
                }}
              />
            </div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-300 hidden sm:inline">
              Pedido Confirmado
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isEn ? 'Secure & Confirmed Purchase' : 'Compra Segura e Confirmada'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full flex-1">
        {/* Success Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-emerald-500/30 text-center relative shadow-2xl shadow-emerald-950/40">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/20 animate-pulse">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {isEn ? 'Payment Successfully Approved!' : 'Pagamento Aprovado com Sucesso!'}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {isEn ? 'Congratulations! Your Access Is Unlocked' : 'Parabéns! Seu Acesso Foi Liberado'}
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed mb-6">
            {isEn ? (
              <>Thank you for trusting RMTI. You have acquired the <strong className="text-white font-bold">{currentPlan.name}</strong> package.</>
            ) : (
              <>Obrigado por confiar na RMTI. Você adquiriu o pacote <strong className="text-white font-bold">{currentPlan.name}</strong>.</>
            )}
          </p>

          {/* Plan Summary Badge */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto mb-8 text-left">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>{isEn ? 'Selected Package:' : 'Plano Selecionado:'}</span>
              <span className="text-emerald-400 font-semibold">
                {isEn ? 'Payment Confirmed' : 'Mercado Pago Confirmado'}
              </span>
            </div>
            <div className="flex items-center justify-between font-bold text-white text-base">
              <span>{currentPlan.name}</span>
              <span className="text-emerald-300">{currentPlan.price}</span>
            </div>
            {selectedTemplateName && (
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-400">{isEn ? 'Selected Architecture:' : 'Template Escolhido:'}</span>
                <span className="text-indigo-300 font-bold">
                  {selectedTemplateName}
                </span>
              </div>
            )}
            {currentPlan.hasAdmin && (
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {isEn ? 'Dynamic CMS Admin Panel Included' : 'Painel de Admin Dinâmico Incluso'}
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-400">{isEn ? 'License / Order Ref:' : 'Chave da Licença / Pedido:'}</span>
              <button
                type="button"
                onClick={handleCopyLicense}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-300 hover:text-emerald-200 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
                title={isEn ? 'Click to copy license reference' : 'Clique para copiar identificador'}
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                <span>{copiedKey ? (isEn ? 'Copied!' : 'Copiado!') : licenseKey}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Direct Download + WhatsApp Support */}
          <div className="space-y-3">
            <a
              href={currentDownload.file}
              download
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 transition-transform hover:scale-[1.02]"
            >
              <Download className="w-5 h-5 text-indigo-200" />
              <span>{currentDownload.label}</span>
            </a>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-bold text-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-400" />
              <span>
                {isEn ? 'Activate VIP Deployment & Support on WhatsApp' : 'Ativar Instalação & Suporte Oficial no WhatsApp'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              {isEn ? 'Instant download — no extra registration required' : 'Download instantâneo sem necessidade de cadastro adicional'}
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* FORMULÁRIO DE BRIEFING DE INSTALAÇÃO VIP (DONE-FOR-YOU - R$ 697) */}
        {/* ===================================================================== */}
        <div className="mt-8 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-950/25 via-[#0c101a] to-[#090c14] p-6 sm:p-8 shadow-2xl shadow-amber-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isVipPlan
                    ? isEn
                      ? "VIP Onboarding • Priority Engineering Queue"
                      : "Etapa Exclusiva VIP • Fila Prioritária de Engenharia (72h)"
                    : isEn
                    ? "Need Done-For-You Setup?"
                    : "Precisa de Ajuda com a Instalação?"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {isEn
                  ? "VIP Installation & Customization Briefing"
                  : "Briefing de Instalação & Personalização VIP"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                {isEn
                  ? "Fill in your preferences below. Your data is saved directly in our system and sent to your dedicated engineer on WhatsApp."
                  : "Preencha abaixo como deseja sua página. Os dados ficam salvos no sistema da RMTI e já abrem o atendimento técnico com nosso engenheiro no WhatsApp."}
              </p>
            </div>
            {!isVipPlan && (
              <button
                type="button"
                onClick={() => setShowBriefingForm(!showBriefingForm)}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs transition-all cursor-pointer"
              >
                {showBriefingForm
                  ? isEn
                    ? "Hide Briefing Form"
                    : "Ocultar Formulário"
                  : isEn
                  ? "Open VIP Briefing Form"
                  : "Preencher Briefing de Suporte"}
              </button>
            )}
          </div>

          {showBriefingForm && (
            <form onSubmit={handleBriefingSubmit} className="mt-6 space-y-5 text-left">
              {briefingSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    {isEn
                      ? "Briefing registered in RMTI's system! We also opened WhatsApp with your summary."
                      : "Briefing registrado com sucesso no painel da RMTI! Também abrimos seu WhatsApp com o resumo completo para nossa equipe."}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {isEn ? "Your Full Name *" : "Seu Nome Completo *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={briefingName}
                    onChange={(e) => setBriefingName(e.target.value)}
                    placeholder={isEn ? "Ex: John Smith" : "Ex: Dr. Rafael Mendes"}
                    className="w-full py-3 px-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {isEn ? "WhatsApp (with area code) *" : "Seu WhatsApp (com DDD) *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={briefingPhone}
                    onChange={(e) => setBriefingPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full py-3 px-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {isEn ? "Best Email *" : "Seu Melhor E-mail *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={briefingEmail}
                    onChange={(e) => setBriefingEmail(e.target.value)}
                    placeholder="contato@suaempresa.com.br"
                    className="w-full py-3 px-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {isEn ? "Business / Product / Specialist Name" : "Nome do Seu Negócio / Produto / Especialista"}
                  </label>
                  <input
                    type="text"
                    value={briefingBusiness}
                    onChange={(e) => setBriefingBusiness(e.target.value)}
                    placeholder={isEn ? "Ex: Apex Digital / Mentorship X" : "Ex: Clínica Vida / Método Alta Performance"}
                    className="w-full py-3 px-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {isEn ? "Domain Name (if you already have one)" : "Domínio Desejado (Registro.br, GoDaddy, Hostinger, etc.)"}
                  </label>
                  <input
                    type="text"
                    value={briefingDomain}
                    onChange={(e) => setBriefingDomain(e.target.value)}
                    placeholder={isEn ? "Ex: www.mybrand.com (or 'Need help registering')" : "Ex: www.seusite.com.br (ou 'Ainda vou registrar')"}
                    className="w-full py-3 px-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">
                    {isEn ? "1. Primary Page Layout" : "1. Modelo Principal da Página"}
                  </label>
                  <select
                    value={briefingLayout}
                    onChange={(e) => setBriefingLayout(e.target.value)}
                    className="w-full py-3 px-3.5 rounded-xl bg-[#0e1320] border border-white/15 focus:border-amber-400 text-xs sm:text-sm text-white outline-none"
                  >
                    <option value="Modelo 01: Vendas Diretas & VSL">01. Vendas Diretas &amp; VSL (Infoproduto/Oferta)</option>
                    <option value="Modelo 02: Captura & WhatsApp VIP">02. Captura &amp; WhatsApp VIP (Especialista/Serviços)</option>
                    <option value="Modelo 03: Institucional & B2B">03. Institucional &amp; Comercial (Empresas/B2B)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">
                    {isEn ? "2. Checkout Model" : "2. Modelo de Checkout"}
                  </label>
                  <select
                    value={briefingCheckout}
                    onChange={(e) => setBriefingCheckout(e.target.value)}
                    className="w-full py-3 px-3.5 rounded-xl bg-[#0e1320] border border-white/15 focus:border-amber-400 text-xs sm:text-sm text-white outline-none"
                  >
                    <option value="Checkout 01: Conversão Rápida (1 Coluna)">01. Conversão Rápida (1 Coluna Mobile)</option>
                    <option value="Checkout 02: Alta Conversão (2 Colunas + Order Bump)">02. Alta Conversão (2 Colunas + Order Bump)</option>
                    <option value="Checkout 03: Minimalista Clean B2B (CPF/CNPJ)">03. Minimalista Clean B2B (CPF/CNPJ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">
                    {isEn ? "3. Payment Receiving Method" : "3. Como Vai Receber Pagamentos"}
                  </label>
                  <select
                    value={briefingGateway}
                    onChange={(e) => setBriefingGateway(e.target.value)}
                    className="w-full py-3 px-3.5 rounded-xl bg-[#0e1320] border border-white/15 focus:border-amber-400 text-xs sm:text-sm text-white outline-none"
                  >
                    <option value="Mercado Pago (Link ou API)">🔵 Mercado Pago (Link ou API)</option>
                    <option value="Pix Direto na Conta + Comprovante WhatsApp">⚡ Pix Direto na Conta (Zero Taxas)</option>
                    <option value="Gateway Externo (Kiwify, Hotmart, Eduzz, Stripe)">🚀 Outro Gateway (Kiwify, Hotmart, Eduzz, Asaas)</option>
                    <option value="Fechamento Direto no WhatsApp">💬 Vendas Direto no WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {isEn ? "Meta Pixel / Google Ads ID (Optional)" : "ID do Meta Pixel / Google Ads (Opcional)"}
                  </label>
                  <input
                    type="text"
                    value={briefingPixels}
                    onChange={(e) => setBriefingPixels(e.target.value)}
                    placeholder={isEn ? "Ex: Pixel 123456789 / AW-987654" : "Ex: Pixel 123456789 ou 'Vou criar ainda'"}
                    className="w-full py-3 px-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {isEn ? "Colors, Copy Details or Reference Links" : "Observações, Cores da Marca ou Links de Referência"}
                  </label>
                  <input
                    type="text"
                    value={briefingNotes}
                    onChange={(e) => setBriefingNotes(e.target.value)}
                    placeholder={isEn ? "Instagram @handle, brand colors, offer price..." : "Ex: Meu Instagram é @..., quero cor azul e dourado, preço R$ 297..."}
                    className="w-full py-3 px-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={briefingSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-60"
              >
                <FileText className="w-5 h-5" />
                <span>
                  {briefingSubmitting
                    ? isEn
                      ? "Saving Briefing..."
                      : "Salvando Briefing no Sistema..."
                    : isEn
                    ? "Submit VIP Briefing & Start Engineering Setup →"
                    : "Enviar Briefing de Instalação VIP & Iniciar no WhatsApp →"}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Next Steps Guide */}
        <div className="mt-10 space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>{isEn ? 'Next Steps To Launch Your Landing Page:' : 'Próximos Passos Para Usar Sua LP:'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-white text-sm">
                {isEn ? 'Download Codebase' : 'Download dos Modelos'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {isEn
                  ? 'You receive full asset folders with clean, responsive HTML5 & Tailwind CSS code.'
                  : 'Você recebe as pastas completas com o código HTML5 e Tailwind limpo, sem necessidade de build.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-white text-sm">
                {isEn ? 'Dynamic CMS Editor' : 'Painel do Editor'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {isEn
                  ? 'Customize copy, statistics, testimonials, and checkout links straight from your browser.'
                  : 'Edite os textos, números, depoimentos e links de pagamento através do editor dinâmico.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-white text-sm">
                {isEn ? '1-Click Launch' : 'Publicação em 1 Clique'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {isEn
                  ? 'Deploy for free on Vercel or Netlify, or have our engineering team launch on your domain.'
                  : 'Hospede gratuitamente na Netlify ou Vercel ou deixe que o nosso time cuide do seu domínio.'}
              </p>
            </div>
          </div>

          {/* Quick Hosting Deployment Tip */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{isEn ? 'Instant Free Deployment Tip:' : 'Dica Rápida de Publicação Gratuita:'}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {isEn
                  ? 'Drag and drop your extracted folder into Netlify Drop (app.netlify.com/drop) to get your SSL website live in under 60 seconds.'
                  : 'Basta descompactar o arquivo .ZIP e arrastar a pasta para o Netlify Drop (app.netlify.com/drop) para sua página ficar online com SSL grátis em menos de 1 minuto.'}
              </p>
            </div>
            <a
              href="https://app.netlify.com/drop"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-indigo-200 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all flex items-center gap-1.5"
            >
              <span>{isEn ? 'Open Netlify Drop ↗' : 'Abrir Netlify Drop ↗'}</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              {isEn ? '← Return to Homepage' : '← Voltar para a Página Inicial'}
            </Link>

            <a
              href="https://github.com/PauloRicardoRomao/rmti-landing-pages"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'View GitHub Repository' : 'Ver repositório no GitHub'}</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-500">
        <p>
          {isEn
            ? '© 2026 RMTI • High-Converting Digital Solutions. Guaranteed post-purchase support.'
            : '© 2026 RMTI • Soluções Digitais sob Medida. Suporte pós-venda garantido.'}
        </p>
      </footer>

      {/* Google Ads Conversion Event Snippet */}
      <Script
        id="google-ads-purchase-conversion"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof gtag === 'function') {
              gtag('event', 'conversion', {
                'send_to': 'AW-18531803428/1pCwCJjGoqcdEKTC04RF',
                'transaction_id': '${paymentIdParam || ''}'
              });
            }
          `,
        }}
      />
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-white text-sm">
          Carregando informações do pedido...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
