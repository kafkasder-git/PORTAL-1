import { NextRequest, NextResponse } from 'next/server';
import { aidApplicationsApi as api } from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';

function validateApplicationUpdate(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.stage && !['draft', 'under_review', 'approved', 'ongoing', 'completed'].includes(data.stage)) errors.push('Geçersiz aşama');
  if (data.status && !['open', 'closed'].includes(data.status)) errors.push('Geçersiz durum');
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/aid-applications/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: 'ID parametresi gerekli' }, { status: 400 });

    const response = await api.getAidApplication(id);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Get aid application error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * PATCH /api/aid-applications/[id]
 */
async function updateApplicationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateApplicationUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.updateAidApplication(id, body);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Güncelleme başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Başvuru güncellendi' });
  } catch (error: any) {
    console.error('Update aid application error:', error);
    return NextResponse.json({ success: false, error: 'Güncelleme işlemi başarısız' }, { status: 500 });
  }
}

/**
 * DELETE /api/aid-applications/[id]
 */
async function deleteApplicationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await api.deleteAidApplication(id);
    if (response.error) {
      return NextResponse.json({ success: false, error: response.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Başvuru silindi' });
  } catch (error: any) {
    console.error('Delete aid application error:', error);
    return NextResponse.json({ success: false, error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}

export const PATCH = withCsrfProtection(updateApplicationHandler);
export const DELETE = withCsrfProtection(deleteApplicationHandler);