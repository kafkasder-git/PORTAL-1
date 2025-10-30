import { NextRequest, NextResponse } from 'next/server';
import api from '@/shared/lib/api';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

function validateMessage(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.message_type || !['sms', 'email', 'internal'].includes(data.message_type)) {
    errors.push('Geçersiz mesaj türü');
  }
  if (!data.sender || typeof data.sender !== 'string') {
    errors.push('Gönderen zorunludur');
  }
  if (!Array.isArray(data.recipients) || data.recipients.length === 0) {
    errors.push('En az bir alıcı seçilmelidir');
  }
  if (!data.content || data.content.trim().length < 3) {
    errors.push('İçerik en az 3 karakter olmalıdır');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/messages
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;

    const filters: Record<string, any> = {};
    const message_type = searchParams.get('message_type');
    const status = searchParams.get('status');
    const sender = searchParams.get('sender');
    const is_bulk = searchParams.get('is_bulk');

    if (message_type) filters.message_type = message_type;
    if (status) filters.status = status;
    if (sender) filters.sender = sender;
    if (is_bulk !== null) filters.is_bulk = is_bulk === 'true';

    const response = await api.messages.getMessages({ page, limit, search, filters });

    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.total ?? 0,
    });
  } catch (error: any) {
    console.error('List messages error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/messages
 */
async function createMessageHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateMessage(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.messages.createMessage(body);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Oluşturma başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Mesaj taslağı oluşturuldu' }, { status: 201 });
  } catch (error: any) {
    console.error('Create message error:', error);
    return NextResponse.json({ success: false, error: 'Oluşturma işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(createMessageHandler);