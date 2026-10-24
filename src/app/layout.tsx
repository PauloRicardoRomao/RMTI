import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ConfigProvider } from '@/context/ConfigContext';
import { defaultAppConfig } from '@/data/defaultConfig';
import { AppConfig } from '@/types';
import { readStorageFile } from '@/lib/storage';

export const metadata: Metadata = {
  title: 'RMTI - Soluções Inteligentes em TI | Sites, Apps & Sistemas',
  description: 'Desenvolvimento de Sites, Landing Pages de alta conversão, Apps Mobile e Sistemas de Gestão sob medida para alavancar seu negócio.',
  icons: {
    icon: '/assets/imagens/icone-32.png',
    apple: '/assets/imagens/icone-192.png',
  },
};

function getInitialConfig(): AppConfig {
  try {
    const raw = readStorageFile('config.json');
    if (raw) {
      return { ...defaultAppConfig, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading initial config in RootLayout:', e);
  }
  return defaultAppConfig;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialConfig = getInitialConfig();
  const clarityId = initialConfig.integrations?.clarityProjectId;
  const googleAdsId = initialConfig.integrations?.googleAdsId;
  const googleAnalyticsId = initialConfig.integrations?.googleAnalyticsId;
  const metaPixelId = initialConfig.integrations?.metaPixelId;
  const mainGoogleTag = googleAdsId || googleAnalyticsId;

  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href={initialConfig.identity.faviconUrl || '/assets/imagens/icone-32.png'} sizes="32x32" />
        <link rel="apple-touch-icon" href="/assets/imagens/icone-192.png" />
      </head>
      <body className="antialiased selection:bg-orange-500/30">
        {/* Microsoft Clarity Tracking */}
        {clarityId && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");`,
            }}
          />
        )}

        {/* Google Tag (Google Ads & Google Analytics) */}
        {mainGoogleTag && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${mainGoogleTag}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-gtag"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
                  ${googleAnalyticsId ? `gtag('config', '${googleAnalyticsId}');` : ''}
                `,
              }}
            />
          </>
        )}

        {/* Meta Pixel (Facebook & Instagram Ads) */}
        {metaPixelId && (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${metaPixelId}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}

        <ConfigProvider initialConfig={initialConfig}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
