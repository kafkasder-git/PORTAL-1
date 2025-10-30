import { NextRequest, NextResponse } from 'next/server';
import api from '@/shared/lib/api';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';
import { InputSanitizer } from '@/shared/lib/security';

function validateUser(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length < 2) errors.push('Ad Soyad en az 2 karakter olmalıdır');
  if (!data.email || !InputSanitizer.validateEmail(data.email)) errors.push('Geçerli bir e-posta zorunludur');
  if (!data.role || !['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER', 'VOLUNTEER'].includes(data.role)) errors.push('Geçersiz rol');
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const response = await api.users.getUsers({ page, limit, search, orderBy: '$createdAt' });
    return NextResponse.json({ success: true, data: response.data, total: response.total ?? 0 });
  } catch (error: any) {
    console.error('List users error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/users
 */
async function createUserHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateUser(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }
    const response = await api.users.createUser({ ...body, isActive: true });
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Oluşturma başarısız' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: response.data, message: 'Kullanıcı oluşturuldu' }, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, error: 'Oluşturma işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(createUserHandler);