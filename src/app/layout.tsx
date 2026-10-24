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

        <ConfigProvider initialConfig={initialConfig}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
