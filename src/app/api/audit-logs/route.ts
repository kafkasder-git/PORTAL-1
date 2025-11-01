/**
 * Audit Logs API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditLogService, type AuditLogFilters } from '@/shared/lib/services/audit-log.service';

/**
 * GET /api/audit-logs
 * Get audit logs with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: AuditLogFilters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') as any || undefined,
      severity: searchParams.get('severity') as any || undefined,
      resource: searchParams.get('resource') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    };

    const logs = await auditLogService.getLogs(filters);

    return NextResponse.json({
      success: true,
      data: logs
    });

  } catch (error: any) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Denetim kayıtları alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit-logs
 * Create a new audit log entry (for system use)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await auditLogService.log(body);

    return NextResponse.json({
      success: true,
      message: 'Denetim kaydı oluşturuldu'
    });

  } catch (error: any) {
    console.error('Create audit log error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Denetim kaydı oluşturulamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}
