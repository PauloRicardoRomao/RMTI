import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { defaultAppConfig } from '@/data/defaultConfig';
import { AppConfig } from '@/types';
import { readStorageFile, writeStorageFile } from '@/lib/storage';

const LEGACY_INSECURE_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
const OFFICIAL_ADMIN_HASH = '01e8c64743646e4bc41658c692333d44f9124f498b94ccd7083dcc1a8fee496a';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getStoredConfig(): AppConfig {
  try {
    const raw = readStorageFile('config.json');
    if (raw) {
      return JSON.parse(raw) as AppConfig;
    }
  } catch (err) {
    console.error('Error reading stored config:', err);
  }
  return defaultAppConfig;
}

function getStoredHash(): string {
  if (process.env.ADMIN_PASSWORD) {
    return hashPassword(process.env.ADMIN_PASSWORD);
  }
  const config = getStoredConfig();
  if (!config.adminPasswordHash || config.adminPasswordHash === LEGACY_INSECURE_HASH) {
    return OFFICIAL_ADMIN_HASH;
  }
  return config.adminPasswordHash;
}

function verifyPassword(password: string): boolean {
  try {
    const inputHash = hashPassword(password);
    const storedHash = getStoredHash();
    const inputBuffer = Buffer.from(inputHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (inputBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(inputBuffer, storedBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || 'login';

    if (action === 'login') {
      const { password } = body;
      if (!password || typeof password !== 'string') {
        return NextResponse.json(
          { success: false, error: 'A senha é obrigatória.' },
          { status: 400 }
        );
      }

      const isValid = verifyPassword(password);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Senha incorreta. Verifique os caracteres e tente novamente.' },
          { status: 401 }
        );
      }

      const config = getStoredConfig();
      const isFirstAccess = Boolean(config.mustChangePassword === true && config.adminPasswordHash !== OFFICIAL_ADMIN_HASH);

      // Generate a session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      return NextResponse.json({
        success: true,
        token: sessionToken,
        mustChangePassword: isFirstAccess,
        message: 'Autenticado com sucesso.',
      });
    }

    if (action === 'first-access-change' || action === 'change-password') {
      const { currentPassword, newPassword } = body;

      if (!newPassword || typeof newPassword !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Informe a nova senha.' },
          { status: 400 }
        );
      }

      if (newPassword === '123456') {
        return NextResponse.json(
          { success: false, error: 'A nova senha não pode ser a senha padrão de 1 a 6. Escolha uma senha segura.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' },
          { status: 400 }
        );
      }

      if (!currentPassword || !verifyPassword(currentPassword)) {
        return NextResponse.json(
          { success: false, error: 'A senha atual informada está incorreta.' },
          { status: 401 }
        );
      }

      // Hash and update config
      const newHash = hashPassword(newPassword);
      const currentConfig = getStoredConfig();

      currentConfig.adminPasswordHash = newHash;
      currentConfig.mustChangePassword = false;
      delete (currentConfig as any).adminPin;

      writeStorageFile('config.json', JSON.stringify(currentConfig, null, 2));

      return NextResponse.json({
        success: true,
        mustChangePassword: false,
        message: 'Senha alterada e protegida com sucesso! Você já pode utilizar o painel.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Ação não reconhecida.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API /api/admin/auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro no servidor de autenticação.' },
      { status: 500 }
    );
  }
}
