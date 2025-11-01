/**
 * 2FA Verification API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { twoFactorAuthService } from '@/shared/lib/services/two-factor-auth.service';
import { auditLogger, AuditAction } from '@/shared/lib/services/audit-log.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * POST /api/2fa/verify
 * Verify 2FA code during login
 */
async function verifyHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID ve kod gerekli' },
        { status: 400 }
      );
    }

    const result = await twoFactorAuthService.verifyCode(userId, code);

    if (result.isValid) {
      // Log successful verification
      await auditLogger.loginSuccess(userId, 'user@example.com');

      return NextResponse.json({
        success: true,
        data: { verified: true, backupCode: result.backupCode }
      });
    } else {
      // Log failed verification
      await auditLogger.loginFailed('user@example.com', 'Invalid 2FA code');

      return NextResponse.json(
        { success: false, error: 'Geçersiz doğrulama kodu' },
        { status: 401 }
      );
    }

  } catch (error: any) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Doğrulama başarısız',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(verifyHandler);
