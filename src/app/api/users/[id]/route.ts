import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import { InputSanitizer } from '@/lib/security';

function validateUserUpdate(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.name && data.name.trim().length < 2) errors.push('Ad Soyad en az 2 karakter olmalıdır');
  if (data.email && !InputSanitizer.validateEmail(data.email)) errors.push('Geçersiz e-posta');
  if (data.role && !['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER', 'VOLUNTEER'].includes(data.role)) errors.push('Geçersiz rol');
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/users/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: 'ID parametresi gerekli' }, { status: 400 });

    const response = await api.users.getUser(id);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * PATCH /api/users/[id]
 */
async function updateUserHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateUserUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.users.updateUser(id, body);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Güncelleme başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Kullanıcı güncellendi' });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: 'Güncelleme işlemi başarısız' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]
 */
async function deleteUserHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await api.users.deleteUser(id);
    if (response.error) {
      return NextResponse.json({ success: false, error: response.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}

export const PATCH = withCsrfProtection(updateUserHandler);
export const DELETE = withCsrfProtection(deleteUserHandler);