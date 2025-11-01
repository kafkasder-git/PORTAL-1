/**
 * Mernis Verification API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWithMernis } from '@/shared/lib/services/mernis.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * POST /api/mernis/verify
 * Verify Turkish identity with Mernis system
 */
async function mernisVerifyHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { tcKimlikNo, name, surname, birthYear } = body;

    // Validate input
    if (!tcKimlikNo) {
      return NextResponse.json(
        { success: false, error: 'TC Kimlik No zorunludur' },
        { status: 400 }
      );
    }

    // Call Mernis verification service
    const result = await verifyWithMernis({
      tcKimlikNo,
      name,
      surname,
      birthYear: birthYear ? parseInt(birthYear) : undefined
    });

    // Return result
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Mernis verification API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kimlik doğrulama işlemi başarısız',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(mernisVerifyHandler);
