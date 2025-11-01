/**
 * Notifications API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getNotifications,
  createNotification,
  markAllAsRead,
  getUnreadCount
} from '@/shared/lib/services/notification.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * GET /api/notifications
 * Get notifications for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // In production, get userId from session/JWT
    const userId = 'demo-user-id';

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '20');
    const offset = Number(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const { notifications, total } = await getNotifications(userId, {
      limit,
      offset,
      unreadOnly
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        total,
        unreadCount: await getUnreadCount(userId)
      }
    });

  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Bildirimler alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
async function createNotificationHandler(request: NextRequest) {
  try {
    const body = await request.json();

    const notification = await createNotification(body);

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Bildirim oluşturuldu'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Bildirim oluşturulamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications
 * Mark all notifications as read
 */
async function markAllReadHandler(request: NextRequest) {
  try {
    // In production, get userId from session/JWT
    const userId = 'demo-user-id';

    await markAllAsRead(userId);

    return NextResponse.json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi'
    });

  } catch (error: any) {
    console.error('Mark all read error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Bildirimler güncellenemedi',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(createNotificationHandler);
export const PUT = withCsrfProtection(markAllReadHandler);
