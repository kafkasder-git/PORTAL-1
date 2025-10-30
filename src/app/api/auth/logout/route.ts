import { NextRequest, NextResponse } from 'next/server';
import api from '@/shared/lib/api';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 * Secure server-side logout endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Call backend logout
    await api.auth.logout();

    // Get cookies instance
    const cookieStore = await cookies();

    // Clear auth cookie
    cookieStore.delete('auth-session');

    return NextResponse.json({
      success: true,
      message: 'Çıkış başarılı',
    });
  } catch (error: any) {
    console.error('Logout error:', error);

    // Still clear cookie even if backend logout fails
    const cookieStore = await cookies();
    cookieStore.delete('auth-session');

    return NextResponse.json({
      success: true,
      message: 'Çıkış yapıldı',
    });
  }
}
