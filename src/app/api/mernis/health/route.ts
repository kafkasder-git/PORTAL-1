/**
 * Mernis Service Health Check API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkMernisServiceHealth } from '@/shared/lib/services/mernis.service';

/**
 * GET /api/mernis/health
 * Check Mernis service health status
 */
export async function GET(_request: NextRequest) {
  try {
    const health = await checkMernisServiceHealth();

    return NextResponse.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Mernis health check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sağlık kontrolü başarısız',
        details: error.message
      },
      { status: 500 }
    );
  }
}
