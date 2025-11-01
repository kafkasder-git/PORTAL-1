/**
 * Notification Center Component
 */

'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { Button } from './button';
import { Badge } from './badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { ScrollArea } from './scroll-area';
import { cn } from '@/shared/lib/utils';
import type { NotificationPriority } from '@/shared/lib/services/notification.service';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'normal':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'normal':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-green-500';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Bildirimler</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Tümünü Okundu İşaretle
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Henüz bildirim yok</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  getPriorityIcon={getPriorityIcon}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
  getPriorityIcon,
  getPriorityColor
}: {
  notification: any;
  onMarkAsRead: (id: string) => void;
  getPriorityIcon: (priority: NotificationPriority) => JSX.Element;
  getPriorityColor: (priority: NotificationPriority) => string;
}) {
  const [showFull, setShowFull] = useState(false);

  return (
    <div
      className={cn(
        'p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4',
        getPriorityColor(notification.priority),
        !notification.isRead && 'bg-blue-50'
      )}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getPriorityIcon(notification.priority)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-sm font-medium',
              !notification.isRead && 'font-semibold'
            )}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
            )}
          </div>

          <p className={cn(
            'text-sm text-gray-600 mt-1',
            !notification.isRead && 'text-gray-800'
          )}>
            {showFull || notification.message.length <= 100
              ? notification.message
              : `${notification.message.substring(0, 100)}...`}
            {notification.message.length > 100 && (
              <button
                className="ml-2 text-xs text-blue-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFull(!showFull);
                }}
              >
                {showFull ? 'Daha az' : 'Devamını oku'}
              </button>
            )}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleString('tr-TR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>

            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="text-xs h-auto py-0 px-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Okundu
                </Button>
              )}

              {notification.actionUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(notification.actionUrl, '_blank');
                  }}
                  className="text-xs h-auto py-0 px-1"
                >
                  Görüntüle
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
