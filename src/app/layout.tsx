import type { Metadata } from 'next';
import './globals.css';
import { ConfigProvider } from '@/context/ConfigContext';
import fs from 'fs';
import path from 'path';
import { defaultAppConfig } from '@/data/defaultConfig';
import { AppConfig } from '@/types';

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
    const configPath = path.join(process.cwd(), 'data', 'config.json');
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return { ...defaultAppConfig, ...JSON.parse(data) };
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

  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href={initialConfig.identity.faviconUrl || '/assets/imagens/icone-32.png'} sizes="32x32" />
        <link rel="apple-touch-icon" href="/assets/imagens/icone-192.png" />
      </head>
      <body className="antialiased selection:bg-orange-500/30">
        <ConfigProvider initialConfig={initialConfig}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}

