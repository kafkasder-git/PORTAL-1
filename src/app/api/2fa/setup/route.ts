/**
 * 2FA Setup API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { twoFactorAuthService } from '@/shared/lib/services/two-factor-auth.service';
import { auditLogger, AuditAction, AuditSeverity } from '@/shared/lib/services/audit-log.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * POST /api/2fa/setup
 * Initialize 2FA setup for a user
 */
async function setupHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bilgileri gerekli' },
        { status: 400 }
      );
    }

    const setup = await twoFactorAuthService.setup(userId, userEmail);

    // Log the setup initiation
    await auditLogger.critical(
      AuditAction.TWO_FACTOR_ENABLED,
      userId,
      userEmail,
      '2FA setup initiated'
    );

    return NextResponse.json({
      success: true,
      data: setup
    });

  } catch (error: any) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '2FA kurulumu başlatılamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(setupHandler);
