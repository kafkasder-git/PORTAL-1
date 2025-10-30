import { NextRequest, NextResponse } from 'next/server';
import api from '@/shared/lib/api';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * Validate donation payload
 */
function validateDonation(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.donor_name || data.donor_name.trim().length < 2) {
    errors.push('Bağışçı adı en az 2 karakter olmalıdır');
  }
  if (data.amount === undefined || data.amount === null || Number(data.amount) <= 0) {
    errors.push('Bağış tutarı pozitif olmalıdır');
  }
  if (!data.currency || !['TRY', 'USD', 'EUR'].includes(data.currency)) {
    errors.push('Geçersiz para birimi');
  }
  if (data.donor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.donor_email)) {
    errors.push('Geçersiz e-posta');
  }
  if (data.donor_phone && !/^[0-9\s\-\+\(\)]{10,15}$/.test(data.donor_phone)) {
    errors.push('Geçersiz telefon numarası');
  }
  if (!data.status) {
    data.status = 'pending';
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/donations
 * List donations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;

    const response = await api.donations.getDonations({ page, limit, search });

    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.total ?? 0,
    });
  } catch (error: any) {
    console.error('List donations error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/donations
 * Create donation
 */
async function createDonationHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateDonation(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.donations.createDonation(body);
    if (response.error) {
      return NextResponse.json({ success: false, error: response.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Bağış başarıyla oluşturuldu' }, { status: 201 });
  } catch (error: any) {
    console.error('Create donation error:', error);
    return NextResponse.json({ success: false, error: 'Oluşturma işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(createDonationHandler);