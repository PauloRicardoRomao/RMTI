'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';
import {
  Menu,
  X,
  Phone,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Check,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { config } = useConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCaseImage, setActiveCaseImage] = useState('/assets/cases/slide-01-capa.jpg');

  // Contact form state
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Desenvolvimento de Sites & LPs',
    message: '',
    lgpd: true,
    website_hp: '', // Honeypot
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  const getWhatsAppUrl = (customMessage?: string) => {
    const phone = config.contact.whatsappNumber.replace(/\D/g, '');
    const text = encodeURIComponent(
      customMessage || config.contact.whatsappDefaultMessage
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const trackWhatsAppClick = () => {
    // Google Ads
    if (typeof window !== 'undefined' && (window as any).gtag && config.integrations?.googleAdsId) {
      const adsId = config.integrations.googleAdsId;
      const label = config.integrations.googleAdsConversionLabel;
      (window as any).gtag('event', 'conversion', {
        send_to: label ? `${adsId}/${label}` : adsId,
        event_category: 'engagement',
        event_label: 'whatsapp_click',
      });
    }

    // Meta Pixel (Facebook & Instagram Ads - Contact)
    if (typeof window !== 'undefined' && (window as any).fbq && config.integrations?.metaPixelId) {
      try {
        (window as any).fbq('track', 'Contact', { content_name: 'whatsapp_click' });
      } catch (fbErr) {
        console.warn('Falha ao registrar Meta Pixel:', fbErr);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      setModalFeedback({
        show: true,
        type: 'error',
        title: 'Campos Obrigatórios',
        message: 'Por favor, preencha nome, e-mail e sua mensagem antes de enviar.',
      });
      return;
    }

    if (!formState.lgpd) {
      setModalFeedback({
        show: true,
        type: 'error',
        title: 'Consentimento Necessário',
        message: 'Você precisa concordar com o envio dos dados para contato.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Enviar para a API interna /api/messages (salva na lista de leads do admin)
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      // 2. Disparo opcional EmailJS caso configurado
      if (
        config.contact.emailjsPublicKey &&
        config.contact.emailjsServiceId &&
        config.contact.emailjsTemplateId
      ) {
        try {
          await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: config.contact.emailjsServiceId,
              template_id: config.contact.emailjsTemplateId,
              user_id: config.contact.emailjsPublicKey,
              template_params: {
                from_name: formState.name,
                from_email: formState.email,
                phone: formState.phone,
                service: formState.service,
                message: formState.message,
              },
            }),
          });
        } catch (emailErr) {
          console.warn('Falha secundária EmailJS:', emailErr);
        }
      }

      if (res.ok) {
        // Disparo de Conversão Google Ads
        if (typeof window !== 'undefined' && (window as any).gtag && config.integrations?.googleAdsId) {
          try {
            const adsId = config.integrations.googleAdsId;
            const label = config.integrations.googleAdsConversionLabel;
            (window as any).gtag('event', 'conversion', {
              send_to: label ? `${adsId}/${label}` : adsId,
              event_category: 'lead',
              event_label: 'contact_form_submission',
            });
          } catch (adsErr) {
            console.warn('Falha ao registrar conversão Google Ads:', adsErr);
          }
        }

        // Disparo de Conversão Meta Pixel (Lead)
        if (typeof window !== 'undefined' && (window as any).fbq && config.integrations?.metaPixelId) {
          try {
            (window as any).fbq('track', 'Lead', {
              content_name: 'contact_form_submission',
              content_category: formState.service,
            });
          } catch (fbErr) {
            console.warn('Falha Meta Pixel:', fbErr);
          }
        }

        setModalFeedback({
          show: true,
          type: 'success',
          title: 'Mensagem Enviada!',
          message:
            'Obrigado pelo contato! Recebi sua mensagem com sucesso e retornarei o mais breve possível.',
        });
        setFormState({
          name: '',
          email: '',
          phone: '',
          service: 'Desenvolvimento de Sites & LPs',
          message: '',
          lgpd: true,
          website_hp: '',
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao enviar');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setModalFeedback({
        show: true,
        type: 'error',
        title: 'Falha no Envio',
        message:
          'Não foi possível enviar sua mensagem pelo formulário agora. Você também pode clicar no botão de WhatsApp para falar diretamente conosco!',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. CABEÇALHO */}
      <header className="sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-black/8 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="#inicio" className="flex items-center gap-3 group">
            {config.identity.logoUrl ? (
              <img
                src={config.identity.logoUrl}
                alt={config.identity.companyName}
                className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {config.identity.brandName}
              </span>
            )}
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#inicio"
              className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
            >
              Início
            </a>
            <a
              href="#servicos"
              className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
            >
              Serviços
            </a>
            <a
              href="#cases"
              className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors flex items-center gap-1"
            >
              <span>Cases</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950">Novo</span>
            </a>
            <a
              href="#processo"
              className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#diferenciais"
              className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
            >
              Diferenciais
            </a>
            <a
              href="#faq"
              className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contato"
              className="text-slate-700 hover:text-orange-500 font-semibold text-sm transition-colors"
            >
              Contato
            </a>
          </nav>

          {/* Botões Ação Topo */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsAppClick}
              className="theme-btn-primary px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Toggle Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-800 hover:text-orange-500 transition-colors focus:outline-none"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Gaveta Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-lg border-b border-slate-200 px-6 py-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <a
              href="#inicio"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 font-bold text-base hover:text-orange-500"
            >
              Início
            </a>
            <a
              href="#servicos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 font-bold text-base hover:text-orange-500"
            >
              Serviços
            </a>
            <a
              href="#cases"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 font-bold text-base hover:text-orange-500 flex items-center justify-between"
            >
              <span>Cases &amp; Clientes</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">Novo</span>
            </a>
            <a
              href="#processo"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 font-bold text-base hover:text-orange-500"
            >
              Como Funciona
            </a>
            <a
              href="#diferenciais"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 font-bold text-base hover:text-orange-500"
            >
              Diferenciais
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 font-bold text-base hover:text-orange-500"
            >
              FAQ
            </a>
            <a
              href="#contato"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 font-bold text-base hover:text-orange-500"
            >
              Contato
            </a>
            <div className="pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackWhatsAppClick();
                  setMobileMenuOpen(false);
                }}
                className="theme-btn-primary w-full py-3 rounded-full text-center font-bold flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-24">
        {/* 2. HERO / APRESENTAÇÃO */}
        <section
          id="inicio"
          className="min-h-[70vh] flex flex-col items-center justify-center text-center py-12 gap-8"
        >
          <div className="max-w-4xl flex flex-col items-center gap-6">
            {config.hero.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                <span>✨</span>
                <span>{config.hero.badge}</span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight theme-gradient-text">
              {config.hero.title}
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl leading-relaxed">
              {config.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4">
              {config.hero.primaryButtonAction === 'whatsapp' ? (
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackWhatsAppClick}
                  className="theme-btn-primary w-full sm:w-auto px-8 py-4 rounded-full text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  <span>{config.hero.primaryButtonText}</span>
                </a>
              ) : (
                <a
                  href="#contato"
                  className="theme-btn-primary w-full sm:w-auto px-8 py-4 rounded-full text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>{config.hero.primaryButtonText}</span>
                </a>
              )}

              {config.hero.secondaryButtonText && (
                <a
                  href={config.hero.secondaryButtonLink || '#servicos'}
                  className="theme-btn-secondary w-full sm:w-auto px-8 py-4 rounded-full text-base sm:text-lg flex items-center justify-center gap-2"
                >
                  <span>{config.hero.secondaryButtonText}</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* 3. SERVIÇOS */}
        <section id="servicos" className="flex flex-col gap-12 scroll-mt-24">
          <div className="text-center flex flex-col items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Nossos Serviços Especializados
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl">
              Soluções sob medida desenvolvidas com as mais modernas tecnologias do mercado
              para garantir estabilidade, segurança e alto retorno sobre investimento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.services
              .filter((s) => s.active)
              .sort((a, b) => a.order - b.order)
              .map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 group"
                >
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center relative p-3">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col gap-3 flex-grow">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {service.summary}
                    </p>
                  </div>

                  {service.benefits && service.benefits.length > 0 && (
                    <ul className="flex flex-col gap-2.5 border-t border-slate-100 pt-4">
                      {service.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <a
                    href={getWhatsAppUrl(service.whatsappMessage || `Olá! Gostaria de um orçamento para ${service.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackWhatsAppClick}
                    className="mt-auto w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-50 hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 hover:text-slate-950 text-slate-800 border border-slate-200 hover:border-transparent flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span>{service.ctaText || 'Solicitar Orçamento →'}</span>
                  </a>
                </div>
              ))}
          </div>
        </section>

        {/* 3.1 CASES DE SUCESSO & CLIENTES */}
        {config.cases && config.cases.filter((c) => c.active).length > 0 && (
          <section id="cases" className="flex flex-col gap-10 scroll-mt-24">
            <div className="text-center flex flex-col items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cases de Sucesso &amp; Clientes RMTI</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Projetos Reais Entregues com Alta Performance
              </h2>
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl">
                Veja na prática como transformamos a presença digital de nossos clientes em máquinas de autoridade e conversão.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {config.cases
                .filter((c) => c.active)
                .sort((a, b) => a.order - b.order)
                .map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  >
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/0 rounded-full blur-3xl pointer-events-none" />

                    {/* Coluna Esquerda: Preview Visual & Galeria */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-square sm:aspect-[4/3] group shadow-inner">
                        <img
                          src={activeCaseImage || caseItem.imageUrl}
                          alt={caseItem.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>Projeto 100% no Ar</span>
                        </div>
                        {caseItem.liveUrl && (
                          <a
                            href={caseItem.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
                          >
                            <span>Ver Projeto ao Vivo</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Miniaturas da Galeria do Case */}
                      {caseItem.gallery && caseItem.gallery.length > 1 && (
                        <div className="flex items-center gap-2">
                          {caseItem.gallery.map((thumb, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => setActiveCaseImage(thumb)}
                              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                (activeCaseImage || caseItem.imageUrl) === thumb
                                  ? 'border-amber-400 scale-105 shadow-md'
                                  : 'border-slate-800 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={thumb}
                                alt={`Miniatura ${tIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Coluna Direita: Informações, Métricas & Depoimento */}
                    <div className="lg:col-span-7 flex flex-col gap-5 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          {caseItem.segment}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {caseItem.resultBadge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {caseItem.title}
                        </h3>
                        <p className="text-amber-400 font-bold text-sm mt-1">
                          Cliente: {caseItem.clientName} ({caseItem.clientRole})
                        </p>
                      </div>

                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {caseItem.description}
                      </p>

                      {/* Entregáveis & Benefícios Conquistados */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                        {caseItem.results.map((res, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{res}</span>
                          </div>
                        ))}
                      </div>

                      {/* Depoimento do Cliente */}
                      {caseItem.quote && (
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-300 italic text-xs sm:text-sm relative">
                          <p>&ldquo;{caseItem.quote}&rdquo;</p>
                          <span className="not-italic font-bold text-[11px] text-amber-400 block mt-2">
                            — {caseItem.clientName}
                          </span>
                        </div>
                      )}

                      {/* Ações e Links */}
                      <div className="flex flex-wrap items-center gap-3 pt-3">
                        {caseItem.liveUrl && (
                          <a
                            href={caseItem.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn-primary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/30"
                          >
                            <span>Visitar Site do Treinador Renan</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <a
                          href={getWhatsAppUrl(`Olá! Vi o case de sucesso do ${caseItem.clientName} no site da RMTI e gostaria de um projeto semelhante para o meu negócio.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={trackWhatsAppClick}
                          className="px-6 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Quero um Projeto como Este</span>
                        </a>

                        {caseItem.githubUrl && (
                          <a
                            href={caseItem.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-1.5 transition-colors"
                            title="Ver repositório no GitHub"
                          >
                            <span>Código no GitHub</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* 4. COMO FUNCIONA (PROCESSO) */}
        <section id="processo" className="flex flex-col gap-12 scroll-mt-24">
          <div className="text-center flex flex-col items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Como Funciona Nosso Processo
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl">
              Do primeiro contato à publicação e suporte: um passo a passo estruturado e sem surpresas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.process
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <div
                  key={step.id}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-3 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.07] transition-all duration-300"
                >
                  <span className="text-4xl font-black theme-accent-gradient-text">
                    {step.stepNumber}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* 5. DIFERENCIAIS */}
        <section id="diferenciais" className="flex flex-col gap-12 scroll-mt-24">
          <div className="text-center flex flex-col items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Por Que Escolher a RMTI?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl">
              Compromisso genuíno com o sucesso do seu negócio e entrega de soluções que trazem resultado real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.differentials
              .sort((a, b) => a.order - b.order)
              .map((diff) => (
                <div
                  key={diff.id}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-4 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.07] transition-all duration-300"
                >
                  <span className="text-4xl sm:text-5xl">{diff.icon}</span>
                  <h3 className="text-xl font-bold text-white">{diff.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {diff.description}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* 6. BANNER PROMOCIONAL / INFORMATIVO */}
        {config.banner.active && (
          <section className="w-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-white/10">
            <picture className="w-full block">
              {config.banner.mobileImageUrl && (
                <source
                  media="(max-width: 768px)"
                  srcSet={config.banner.mobileImageUrl}
                />
              )}
              <img
                src={config.banner.desktopImageUrl}
                alt={config.banner.altText || 'Banner RMTI'}
                className="w-full h-auto object-contain block"
              />
            </picture>
          </section>
        )}

        {/* 7. PERGUNTAS FREQUENTES (FAQ) */}
        <section id="faq" className="flex flex-col gap-12 scroll-mt-24">
          <div className="text-center flex flex-col items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Perguntas Frequentes
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl">
              Tire todas as suas dúvidas sobre prazos, suporte, formas de pagamento e garantias.
            </p>
          </div>

          <div className="max-w-3xl w-full mx-auto flex flex-col gap-4">
            {config.faqs
              .filter((f) => f.active)
              .sort((a, b) => a.order - b.order)
              .map((faq) => (
                <details
                  key={faq.id}
                  className="group bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all duration-200 open:border-orange-500 open:shadow-lg"
                >
                  <summary className="px-6 py-5 cursor-pointer font-bold text-slate-900 text-base sm:text-lg flex items-center justify-between gap-4 list-none select-none hover:text-orange-600 transition-colors">
                    <span>{faq.question}</span>
                    <span className="text-orange-500 font-bold text-2xl transition-transform duration-200 group-open:rotate-45 flex-shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                </details>
              ))}
          </div>
        </section>

        {/* 8. CONTATO */}
        <section id="contato" className="flex justify-center w-full scroll-mt-24">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-8 sm:p-12 shadow-2xl text-slate-900 flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
                {config.contact.sectionTitle}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
                {config.contact.sectionSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Anti-spam honeypot */}
              <input
                type="text"
                name="website_hp"
                value={formState.website_hp}
                onChange={(e) => setFormState({ ...formState, website_hp: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Seu Nome *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-slate-900 text-sm transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Seu E-mail *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Ex: carlos@empresa.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-slate-900 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    WhatsApp / Telefone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Ex: (81) 99862-7852"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-slate-900 text-sm transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="service" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Interesse Principal
                  </label>
                  <select
                    id="service"
                    value={formState.service}
                    onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-slate-900 text-sm transition-all bg-white"
                  >
                    <option value="Desenvolvimento de Sites & LPs">Desenvolvimento de Sites & LPs</option>
                    <option value="Sistemas de Gestão sob Medida">Sistemas de Gestão sob Medida</option>
                    <option value="Aplicativos Móveis">Aplicativos Móveis</option>
                    <option value="Consultoria ou Outro">Consultoria ou Outro</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detalhes do Projeto *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="Conte um pouco sobre o que precisa, prazo estimado e principais metas..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-slate-900 text-sm transition-all resize-y"
                ></textarea>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formState.lgpd}
                  onChange={(e) => setFormState({ ...formState, lgpd: e.target.checked })}
                  className="w-4 h-4 mt-1 text-orange-500 accent-orange-500 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-500 leading-tight">
                  Concordo em fornecer meus dados para que a RMTI entre em contato sobre este orçamento, de acordo com a LGPD.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="theme-btn-primary w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando Mensagem...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Mensagem Agora</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* 9. RODAPÉ */}
      <footer className="w-full bg-[#0c1822] border-t border-white/10 py-12 mt-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
          <div className="bg-white px-6 py-2.5 rounded-2xl shadow-lg inline-flex items-center justify-center">
            {config.identity.logoUrl ? (
              <img
                src={config.identity.logoUrl}
                alt={config.identity.companyName}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-slate-900">{config.identity.brandName}</span>
            )}
          </div>

          <p className="text-slate-400 text-sm max-w-md">
            {config.identity.tagline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <a href="#inicio" className="hover:text-white transition-colors">Início</a>
            <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
            <a href="#cases" className="hover:text-white transition-colors">Cases &amp; Clientes</a>
            <a href="#processo" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#diferenciais" className="hover:text-white transition-colors">Diferenciais</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#contato" className="hover:text-white transition-colors">Contato</a>
          </div>

          <p className="text-slate-500 text-xs pt-4 border-t border-white/5 w-full">
            {config.identity.footerText}
          </p>
        </div>
      </footer>

      {/* 10. BOTÃO FLUTUANTE DE WHATSAPP */}
      {config.contact.floatingWhatsappActive && (
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackWhatsAppClick}
          title={config.contact.floatingWhatsappTooltip}
          className="fixed bottom-6 right-6 z-50 bg-[#25d366] hover:bg-[#20bd5a] text-white flex items-center gap-2.5 px-5 py-3 rounded-full shadow-2xl animate-pulse-wpp transition-all duration-300 hover:scale-105"
        >
          <Phone className="w-6 h-6 fill-white" />
          <span className="hidden sm:inline font-bold text-sm tracking-wide">
            {config.contact.floatingWhatsappTooltip || 'Falar no WhatsApp'}
          </span>
        </a>
      )}

      {/* 11. MODAL FEEDBACK SUBMISSÃO */}
      {modalFeedback.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 flex flex-col items-center text-center gap-4 shadow-2xl relative">
            <button
              onClick={() => setModalFeedback({ ...modalFeedback, show: false })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                modalFeedback.type === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-rose-100 text-rose-600'
              }`}
            >
              {modalFeedback.type === 'success' ? (
                <CheckCircle className="w-9 h-9" />
              ) : (
                <AlertCircle className="w-9 h-9" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              {modalFeedback.title}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              {modalFeedback.message}
            </p>

            <button
              type="button"
              onClick={() => setModalFeedback({ ...modalFeedback, show: false })}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors mt-2"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

