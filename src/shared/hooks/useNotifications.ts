/**
 * React Hook for Notifications
 */

import { useState, useEffect } from 'react';
import {
  subscribeToNotifications,
  requestNotificationPermission,
  sendBrowserNotification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification
} from '@/shared/lib/services/notification.service';
import { useAuthStore } from '@/shared/stores/authStore';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications(user.id, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permission granted
      sendBrowserNotification({
        title: notification.title,
        message: notification.message
      });
    });

    // Load initial notifications
    loadNotifications();

    // Load unread count
    loadUnreadCount();

    // Listen for custom events
    const handleNotification = (event: CustomEvent) => {
      setNotifications(prev => [event.detail, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('notification', handleNotification as EventListener);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('notification', handleNotification as EventListener);
      }
    };
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      // Load notifications from API
      // const { notifications: data } = await getNotifications(user.id);
      // setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      // const count = await getUnreadCount(user.id);
      // setUnreadCount(count);
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (user?.id) {
        await markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    return await requestNotificationPermission();
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    requestPermission
  };
}
