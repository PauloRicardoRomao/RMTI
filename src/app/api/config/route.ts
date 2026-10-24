import { NextResponse } from 'next/server';
import { defaultAppConfig } from '@/data/defaultConfig';
import { AppConfig } from '@/types';
import { readStorageFile, writeStorageFile } from '@/lib/storage';

function ensureConfigFile(): AppConfig {
  try {
    const raw = readStorageFile('config.json');
    if (raw) {
      const parsed = JSON.parse(raw) as AppConfig;
      return { ...defaultAppConfig, ...parsed };
    }
    // If not found, write default
    writeStorageFile('config.json', JSON.stringify(defaultAppConfig, null, 2));
    return defaultAppConfig;
  } catch (error) {
    console.error('Error reading config file, falling back to default:', error);
    return defaultAppConfig;
  }
}

function sanitizeConfig(config: AppConfig): Partial<AppConfig> {
  const sanitized = { ...config };
  delete (sanitized as any).adminPasswordHash;
  delete (sanitized as any).adminPin;
  return sanitized;
}

export async function GET() {
  try {
    const config = ensureConfigFile();
    return NextResponse.json(sanitizeConfig(config));
  } catch (error) {
    console.error('API /api/config GET error:', error);
    return NextResponse.json(sanitizeConfig(defaultAppConfig), { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'reset') {
      writeStorageFile('config.json', JSON.stringify(defaultAppConfig, null, 2));
      return NextResponse.json({ success: true, config: sanitizeConfig(defaultAppConfig) });
    }

    const currentConfig = ensureConfigFile();

    // Prevent direct unauthenticated hash override through general config endpoint
    const safeBody = { ...body };
    delete safeBody.adminPasswordHash;
    delete safeBody.adminPin;

    const updatedConfig: AppConfig = {
      ...currentConfig,
      ...safeBody,
      adminPasswordHash: currentConfig.adminPasswordHash || defaultAppConfig.adminPasswordHash,
    };

    writeStorageFile('config.json', JSON.stringify(updatedConfig, null, 2));

    return NextResponse.json({ success: true, config: sanitizeConfig(updatedConfig) });
  } catch (error) {
    console.error('API /api/config POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao atualizar as configurações' },
      { status: 500 }
    );
  }
}
