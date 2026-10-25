import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { defaultAppConfig } from '@/data/defaultConfig';
import { AppConfig } from '@/types';
import { readStorageFile, writeStorageFile } from '@/lib/storage';

const DEFAULT_INITIAL_PASS = '123456';
const DEFAULT_INITIAL_HASH = crypto.createHash('sha256').update(DEFAULT_INITIAL_PASS).digest('hex');

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
  const config = getStoredConfig();
  return config.adminPasswordHash || DEFAULT_INITIAL_HASH;
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
      // Check if this is the first access (initial password 123456 or mustChangePassword flag)
      const isFirstAccess = Boolean(
        password === DEFAULT_INITIAL_PASS ||
        config.mustChangePassword === true ||
        config.adminPasswordHash === DEFAULT_INITIAL_HASH
      );

      // Generate a session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      return NextResponse.json({
        success: true,
        token: sessionToken,
        mustChangePassword: isFirstAccess,
        message: isFirstAccess
          ? 'Primeiro acesso detectado. Por favor, cadastre sua nova senha pessoal.'
          : 'Autenticado com sucesso.',
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

      if (newPassword === DEFAULT_INITIAL_PASS) {
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

      // If change-password from inside the panel or first access with currentPassword check
      if (currentPassword) {
        const isValid = verifyPassword(currentPassword);
        if (!isValid && currentPassword !== DEFAULT_INITIAL_PASS) {
          return NextResponse.json(
            { success: false, error: 'A senha atual informada está incorreta.' },
            { status: 401 }
          );
        }
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
