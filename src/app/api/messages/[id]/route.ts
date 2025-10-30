import { NextRequest, NextResponse } from 'next/server';
import api from '@/shared/lib/api';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

function validateMessageUpdate(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.message_type && !['sms', 'email', 'internal'].includes(data.message_type)) {
    errors.push('Geçersiz mesaj türü');
  }
  if (data.content && data.content.trim().length < 3) {
    errors.push('İçerik en az 3 karakter olmalıdır');
  }
  if (data.status && !['draft', 'sent', 'failed'].includes(data.status)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/messages/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID parametresi gerekli' }, { status: 400 });
    }

    const response = await api.messages.getMessage(id);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Get message error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * PUT /api/messages/[id]
 */
async function updateMessageHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateMessageUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.messages.updateMessage(id, body);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Güncelleme başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Mesaj başarıyla güncellendi' });
  } catch (error: any) {
    console.error('Update message error:', error);
    return NextResponse.json({ success: false, error: 'Güncelleme işlemi başarısız' }, { status: 500 });
  }
}

/**
 * DELETE /api/messages/[id]
 */
async function deleteMessageHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await api.messages.deleteMessage(id);
    if (response.error) {
      return NextResponse.json({ success: false, error: response.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Mesaj başarıyla silindi' });
  } catch (error: any) {
    console.error('Delete message error:', error);
    return NextResponse.json({ success: false, error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}

/**
 * POST /api/messages/[id]/send
 * Note: Implemented via PUT with status change to keep routes simple
 */
async function sendMessageHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await api.messages.sendMessage(id);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Gönderim başarısız' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: response.data, message: 'Mesaj gönderildi' });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ success: false, error: 'Gönderim işlemi başarısız' }, { status: 500 });
  }
}

export const PUT = withCsrfProtection(updateMessageHandler);
export const DELETE = withCsrfProtection(deleteMessageHandler);
export const POST = withCsrfProtection(sendMessageHandler);