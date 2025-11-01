/**
 * Document Statistics API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDocumentStats } from '@/shared/lib/services/document.service';

/**
 * GET /api/documents/stats
 * Get document statistics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await getDocumentStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Get document stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İstatistikler alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}
