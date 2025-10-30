import { NextRequest, NextResponse } from 'next/server';
import { aidApplicationsApi as api } from '@/shared/lib/api';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

function validateApplication(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.applicant_name || data.applicant_name.trim().length < 2) errors.push('Başvuru sahibi adı zorunludur');
  if (!data.application_date) errors.push('Başvuru tarihi zorunludur');
  if (!data.stage || !['draft', 'under_review', 'approved', 'ongoing', 'completed'].includes(data.stage)) errors.push('Geçersiz aşama');
  if (!data.status || !['open', 'closed'].includes(data.status)) errors.push('Geçersiz durum');
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/aid-applications
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const filters: Record<string, any> = {};
    const stage = searchParams.get('stage');
    const status = searchParams.get('status');

    if (stage) filters.stage = stage;
    if (status) filters.status = status;

    const response = await api.getAidApplications({ page, limit, search, filters });
    return NextResponse.json({ success: true, data: response.data, total: response.total ?? 0 });
  } catch (error: any) {
    console.error('List aid applications error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/aid-applications
 */
async function createApplicationHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateApplication(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.createAidApplication(body);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Oluşturma başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Başvuru oluşturuldu' }, { status: 201 });
  } catch (error: any) {
    console.error('Create aid application error:', error);
    return NextResponse.json({ success: false, error: 'Oluşturma işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(createApplicationHandler);