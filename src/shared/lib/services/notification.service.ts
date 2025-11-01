/**
 * Notification Service
 * Handles real-time notifications, in-app alerts, email/SMS notifications
 */

import { appwriteApi } from '@/shared/lib/api/appwrite-api';

export type NotificationType =
  | 'aid_application'
  | 'donation_received'
  | 'task_assigned'
  | 'meeting_scheduled'
  | 'deadline_reminder'
  | 'system_alert'
  | 'message_received';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

/**
 * Create a new notification
 */
export async function createNotification(
  data: CreateNotificationDto
): Promise<Notification> {
  const notification: Notification = {
    id: crypto.randomUUID(),
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    priority: data.priority || 'normal',
    isRead: false,
    actionUrl: data.actionUrl,
    metadata: data.metadata,
    createdAt: new Date().toISOString(),
    expiresAt: data.expiresAt
  };

  // Store in database
  // Note: This would require a 'notifications' collection in Appwrite
  // For now, we'll simulate with localStorage for demo purposes

  return notification;
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; unreadOnly?: boolean }
): Promise<{ notifications: Notification[]; total: number }> {
  // In production, fetch from Appwrite 'notifications' collection
  // For now, return empty array

  const notifications: Notification[] = [];

  return {
    notifications,
    total: 0
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  // Update in database
  console.log('Marking notification as read:', notificationId);
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  // Update in database
  console.log('Marking all notifications as read for user:', userId);
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  // Delete from database
  console.log('Deleting notification:', notificationId);
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  // Query database for unread count
  return 0;
}

/**
 * Send in-app notification (for immediate display)
 */
export function sendInAppNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
  // Dispatch custom event for in-app notifications
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notification', { detail: notification }));
  }
}

/**
 * Send browser notification (requires permission)
 */
export async function sendBrowserNotification(notification: {
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
}): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  let permission = Notification.permission;

  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission === 'granted') {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: notification.icon || '/favicon.ico',
      badge: '/favicon.ico'
    });

    if (notification.actionUrl) {
      browserNotification.onclick = () => {
        window.open(notification.actionUrl, '_blank');
        browserNotification.close();
      };
    }

    // Auto close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  return await Notification.requestPermission();
}

/**
 * Get notification configuration
 */
export async function getNotificationConfig(userId: string): Promise<{
  email: boolean;
  sms: boolean;
  inApp: boolean;
  push: boolean;
  types: Record<NotificationType, boolean>;
}> {
  // In production, fetch from user preferences in database
  return {
    email: true,
    sms: false,
    inApp: true,
    push: true,
    types: {
      aid_application: true,
      donation_received: true,
      task_assigned: true,
      meeting_scheduled: true,
      deadline_reminder: true,
      system_alert: true,
      message_received: true
    }
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationConfig(
  userId: string,
  config: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
    push?: boolean;
    types?: Partial<Record<NotificationType, boolean>>;
  }
): Promise<void> {
  // Save to database
  console.log('Updating notification config for user:', userId, config);
}

/**
 * Template generator for different notification types
 */
export function getNotificationTemplate(
  type: NotificationType,
  data: Record<string, any>
): { title: string; message: string } {
  switch (type) {
    case 'aid_application':
      return {
        title: 'Yeni Yardım Başvurusu',
        message: `${data.applicantName} tarafından yeni yardım başvurusu alındı.`
      };

    case 'donation_received':
      return {
        title: 'Bağış Alındı',
        message: `${data.donorName} tarafından ${data.amount} ₺ bağış alındı.`
      };

    case 'task_assigned':
      return {
        title: 'Görev Atandı',
        message: `Size yeni bir görev atandı: ${data.taskTitle}`
      };

    case 'meeting_scheduled':
      return {
        title: 'Toplantı Planlandı',
        message: `${data.meetingTitle} toplantısı ${data.date} tarihinde planlandı.`
      };

    case 'deadline_reminder':
      return {
        title: 'Son Gün Hatırlatması',
        message: `${data.taskTitle} görevinin son günü ${data.deadline} tarihidir.`
      };

    case 'system_alert':
      return {
        title: 'Sistem Uyarısı',
        message: data.message || 'Sistemden önemli bir uyarı aldınız.'
      };

    case 'message_received':
      return {
        title: 'Yeni Mesaj',
        message: `${data.sender} size yeni bir mesaj gönderdi.`
      };

    default:
      return {
        title: 'Bildirim',
        message: 'Yeni bir bildiriminiz var.'
      };
  }
}

/**
 * Subscribe to real-time notifications using Appwrite Realtime
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  // In production, use Appwrite Realtime
  // Example:
  // const unsubscribe = appwrite.subscribe(
  //   `collections.notifications.documents`,
  //   [Query.equal('userId', userId)],
  //   (response) => {
  //     const notification = response.payload as Notification;
  //     callback(notification);
  //   }
  // );

  // For demo, simulate with interval
  const interval = setInterval(() => {
    // Simulate random notification
    if (Math.random() > 0.95) {
      const mockNotification: Notification = {
        id: crypto.randomUUID(),
        userId,
        type: 'system_alert',
        title: 'Test Notification',
        message: 'This is a test notification',
        priority: 'normal',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      callback(mockNotification);
    }
  }, 10000);

  return () => clearInterval(interval);
}

/**
 * Schedule notification for future delivery
 */
export async function scheduleNotification(
  data: CreateNotificationDto & { scheduledAt: Date }
): Promise<void> {
  // In production, use a job queue (Redis, Bull, etc.)
  // For now, just log
  console.log('Scheduled notification:', data);
}

/**
 * Batch create notifications for multiple users
 */
export async function batchCreateNotifications(
  notifications: CreateNotificationDto[]
): Promise<Notification[]> {
  const results = await Promise.all(
    notifications.map(notification => createNotification(notification))
  );

  return results;
}

/**
 * Clean up expired notifications
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  // In production, delete expired notifications from database
  console.log('Cleaning up expired notifications...');
  return 0;
}
