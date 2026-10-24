import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { defaultAppConfig } from '@/data/defaultConfig';
import { AppConfig } from '@/types';
import { readStorageFile, writeStorageFile } from '@/lib/storage';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getStoredHash(): string {
  try {
    const raw = readStorageFile('config.json');
    if (raw) {
      const parsed = JSON.parse(raw) as AppConfig;
      if (parsed.adminPasswordHash) {
        return parsed.adminPasswordHash;
      }
    }
  } catch (err) {
    console.error('Error reading stored hash:', err);
  }
  return defaultAppConfig.adminPasswordHash || hashPassword('182210RmtI');
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

      // Generate a session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      return NextResponse.json({
        success: true,
        token: sessionToken,
        message: 'Autenticado com sucesso.',
      });
    }

    if (action === 'change-password') {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Preencha a senha atual e a nova senha.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' },
          { status: 400 }
        );
      }

      const isValid = verifyPassword(currentPassword);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'A senha atual informada está incorreta.' },
          { status: 401 }
        );
      }

      // Hash and update config
      const newHash = hashPassword(newPassword);
      let currentConfig: AppConfig = defaultAppConfig;

      try {
        const raw = readStorageFile('config.json');
        if (raw) {
          currentConfig = JSON.parse(raw);
        }
      } catch {
        currentConfig = defaultAppConfig;
      }

      currentConfig.adminPasswordHash = newHash;
      delete (currentConfig as any).adminPin;

      writeStorageFile('config.json', JSON.stringify(currentConfig, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Senha alterada e criptografada com sucesso!',
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
