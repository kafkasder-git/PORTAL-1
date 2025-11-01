import { NextRequest, NextResponse } from 'next/server';
import api from '@/shared/lib/api';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';
import { auditLogger, AuditAction, AuditSeverity } from '@/shared/lib/services/audit-log.service';

function validateMeeting(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Toplantı başlığı en az 3 karakter olmalıdır');
  }
  if (!data.meeting_date) {
    errors.push('Toplantı tarihi zorunludur');
  }
  if (data.status && !['scheduled', 'ongoing', 'completed', 'cancelled'].includes(data.status)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/meetings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;

    const filters: Record<string, any> = {};
    const status = searchParams.get('status');
    const meeting_type = searchParams.get('meeting_type');
    const organizer = searchParams.get('organizer');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    if (status) filters.status = status;
    if (meeting_type) filters.meeting_type = meeting_type;
    if (organizer) filters.organizer = organizer;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const response = await api.meetings.getMeetings({ page, limit, search, filters });

    // Get user info from session/cookie (placeholder)
    const userId = 'demo-user-id';
    const userEmail = 'demo@example.com';

    // Log the meeting list access
    await auditLogger.loginSuccess(userId, userEmail);

    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.total ?? 0,
    });
  } catch (error: any) {
    console.error('List meetings error:', error);
    await auditLogger.error(AuditAction.MEETING_CREATED, 'demo-user-id', 'demo@example.com', error.message);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/meetings
 */
async function createMeetingHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateMeeting(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    // Get user info from session/cookie (placeholder)
    const userId = 'demo-user-id';
    const userEmail = 'demo@example.com';

    const response = await api.meetings.createMeeting(body);
    if (response.error || !response.data) {
      await auditLogger.error(AuditAction.MEETING_CREATED, userId, userEmail, response.error || 'Oluşturma başarısız');
      return NextResponse.json({ success: false, error: response.error || 'Oluşturma başarısız' }, { status: 400 });
    }

    // Log successful meeting creation
    await auditLogger.create(
      AuditAction.MEETING_CREATED,
      userId,
      userEmail,
      'meeting',
      response.data.$id,
      body
    );

    return NextResponse.json({ success: true, data: response.data, message: 'Toplantı başarıyla oluşturuldu' }, { status: 201 });
  } catch (error: any) {
    console.error('Create meeting error:', error);
    await auditLogger.error(AuditAction.MEETING_CREATED, 'demo-user-id', 'demo@example.com', error.message);
    return NextResponse.json({ success: false, error: 'Oluşturma işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(createMeetingHandler);