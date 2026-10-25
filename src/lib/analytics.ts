// Client-side analytics event dispatcher for Meta Pixel & Google Analytics

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    __rmti_google_ads?: {
      adsId?: string;
      conversionLabel?: string;
    };
  }
}

export function trackViewContent(templateName: string, category?: string) {
  if (typeof window === 'undefined') return;
  try {
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: templateName,
        content_category: category || 'Landing Page Template',
      });
    }
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        item_name: templateName,
        item_category: category || 'Template',
      });
    }
  } catch {
    // ignore
  }
}

export function trackInitiateCheckout(planName: string, amount: number) {
  if (typeof window === 'undefined') return;
  try {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: planName,
        value: amount,
        currency: 'BRL',
      });
    }
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        value: amount,
        currency: 'BRL',
        items: [{ item_name: planName, price: amount }],
      });
    }
  } catch {
    // ignore
  }
}

export function trackPurchase(planName: string, amount: number, paymentId?: string) {
  if (typeof window === 'undefined') return;
  try {
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        content_name: planName,
        value: amount,
        currency: 'BRL',
        transaction_id: paymentId,
      });
    }
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: paymentId,
        value: amount,
        currency: 'BRL',
        items: [{ item_name: planName, price: amount }],
      });

      // Google Ads Conversion Tag
      const gAds = window.__rmti_google_ads;
      const sendTo = (gAds?.adsId && gAds?.conversionLabel)
        ? `${gAds.adsId}/${gAds.conversionLabel}`
        : 'AW-18531803428/1pCwCJjGoqcdEKTC04RF';

      window.gtag('event', 'conversion', {
        send_to: sendTo,
        value: amount,
        currency: 'BRL',
        transaction_id: paymentId || '',
      });
    }
  } catch {
    // ignore
  }
}

export function getStoredUTMs() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('rmti_utm_params');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

