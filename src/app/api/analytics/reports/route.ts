/**
 * Analytics Reports API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getComprehensiveReport,
  exportToCsv,
  type DateRange,
  type ReportData
} from '@/shared/lib/services/reporting.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * GET /api/analytics/reports
 * Get comprehensive analytics report
 */
async function getReportHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    let dateRange: DateRange | undefined = undefined;

    if (fromParam && toParam) {
      dateRange = {
        from: new Date(fromParam),
        to: new Date(toParam)
      };
    }

    const reportData = await getComprehensiveReport(dateRange);

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error: any) {
    console.error('Analytics report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Rapor alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/reports/export
 * Export report to CSV
 */
async function exportReportHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportData } = body;

    if (!reportData) {
      return NextResponse.json(
        { success: false, error: 'Rapor verisi gerekli' },
        { status: 400 }
      );
    }

    const csv = exportToCsv(reportData as ReportData);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rapor-${new Date().toISOString()}.csv"`
      }
    });

  } catch (error: any) {
    console.error('Export report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Rapor dışa aktarılamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const GET = getReportHandler;
export const POST = withCsrfProtection(exportReportHandler);
