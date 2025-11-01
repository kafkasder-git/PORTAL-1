/**
 * 2FA Enable API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { twoFactorAuthService } from '@/shared/lib/services/two-factor-auth.service';
import { auditLogger, AuditAction } from '@/shared/lib/services/audit-log.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * POST /api/2fa/enable
 * Enable 2FA after successful setup
 */
async function enableHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, secret, backupCodes } = body;

    if (!userId || !secret || !backupCodes) {
      return NextResponse.json(
        { success: false, error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    await twoFactorAuthService.enable(userId, secret, backupCodes);

    // Log 2FA enable
    await auditLogger.critical(
      AuditAction.TWO_FACTOR_ENABLED,
      userId,
      'user@example.com',
      '2FA successfully enabled'
    );

    return NextResponse.json({
      success: true,
      message: '2FA başarıyla etkinleştirildi'
    });

  } catch (error: any) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '2FA etkinleştirilemedi',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(enableHandler);
