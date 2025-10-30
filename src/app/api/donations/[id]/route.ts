import { NextRequest, NextResponse } from 'next/server';
import api from '@/shared/lib/api';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

function validateDonationUpdate(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.amount !== undefined && Number(data.amount) <= 0) {
    errors.push('Bağış tutarı pozitif olmalıdır');
  }
  if (data.currency && !['TRY', 'USD', 'EUR'].includes(data.currency)) {
    errors.push('Geçersiz para birimi');
  }
  if (data.donor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.donor_email)) {
    errors.push('Geçersiz e-posta');
  }
  if (data.donor_phone && !/^[0-9\s\-\+\(\)]{10,15}$/.test(data.donor_phone)) {
    errors.push('Geçersiz telefon numarası');
  }
  if (data.status && !['pending', 'completed', 'cancelled'].includes(data.status)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/donations/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID parametresi gerekli' }, { status: 400 });
    }

    const response = await api.donations.getDonation(id);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Get donation error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * PUT /api/donations/[id]
 */
async function updateDonationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateDonationUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.donations.updateDonation(id, body);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Güncelleme başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Bağış başarıyla güncellendi' });
  } catch (error: any) {
    console.error('Update donation error:', error);
    return NextResponse.json({ success: false, error: 'Güncelleme işlemi başarısız' }, { status: 500 });
  }
}

/**
 * DELETE /api/donations/[id]
 */
async function deleteDonationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await api.donations.deleteDonation(id);
    if (response.error) {
      return NextResponse.json({ success: false, error: response.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Bağış başarıyla silindi' });
  } catch (error: any) {
    console.error('Delete donation error:', error);
    return NextResponse.json({ success: false, error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}

export const PUT = withCsrfProtection(updateDonationHandler);
export const DELETE = withCsrfProtection(deleteDonationHandler);