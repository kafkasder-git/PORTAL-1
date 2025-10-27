import { NextRequest, NextResponse } from 'next/server';
import { appwriteApi } from '@/lib/api/appwrite-api';
import { mockAuthApi } from '@/lib/api/mock-auth-api';
import { cookies } from 'next/headers';

// Configuration: Set to true to use mock authentication
const USE_MOCK_AUTH = false;

/**
 * POST /api/auth/logout
 * Secure server-side logout endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Call backend logout
    if (USE_MOCK_AUTH) {
      await mockAuthApi.logout();
    } else {
      await appwriteApi.auth.logout();
    }

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
