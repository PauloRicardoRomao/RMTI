import { NextResponse } from 'next/server';
import { ContactMessage } from '@/types';
import { readStorageFile, writeStorageFile } from '@/lib/storage';

function getMessages(): ContactMessage[] {
  try {
    const raw = readStorageFile('messages.json');
    if (raw) {
      return JSON.parse(raw) as ContactMessage[];
    }
    writeStorageFile('messages.json', '[]');
    return [];
  } catch (error) {
    console.error('Error reading messages:', error);
    return [];
  }
}

function saveMessages(messages: ContactMessage[]) {
  writeStorageFile('messages.json', JSON.stringify(messages, null, 2));
}

export async function GET() {
  const messages = getMessages();
  messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot check
    if (body.website_hp && body.website_hp.length > 0) {
      return NextResponse.json({ success: true, message: 'Message received' });
    }

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando (nome, email ou mensagem).' },
        { status: 400 }
      );
    }

    const messages = getMessages();
    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone ? body.phone.trim() : undefined,
      service: body.service ? body.service.trim() : undefined,
      message: body.message.trim(),
      createdAt: new Date().toISOString(),
      status: 'unread',
    };

    messages.unshift(newMessage);
    saveMessages(messages);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('API /api/messages POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar mensagem.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID e status são obrigatórios.' }, { status: 400 });
    }

    const messages = getMessages();
    const index = messages.findIndex((m) => m.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Mensagem não encontrada.' }, { status: 404 });
    }

    messages[index].status = status;
    saveMessages(messages);

    return NextResponse.json({ success: true, message: messages[index] });
  } catch (error) {
    console.error('API /api/messages PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar mensagem.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID é obrigatório.' }, { status: 400 });
    }

    let messages = getMessages();
    messages = messages.filter((m) => m.id !== id);
    saveMessages(messages);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/messages DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao deletar mensagem.' }, { status: 500 });
  }
}
