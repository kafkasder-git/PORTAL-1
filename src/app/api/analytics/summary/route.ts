/**
 * Analytics Summary API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSummaryMetrics, type DateRange } from '@/shared/lib/services/reporting.service';

/**
 * GET /api/analytics/summary
 * Get summary metrics for dashboard
 */
export async function GET(request: NextRequest) {
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

    const summary = await getSummaryMetrics(dateRange);

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error: any) {
    console.error('Analytics summary error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Özet metrikler alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}
