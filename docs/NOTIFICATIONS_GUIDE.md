# Notification System Guide

## Overview

The Notification System provides real-time alerts and notifications for users across multiple channels including in-app notifications, email, SMS, and browser push notifications.

## Features

### 🔔 Real-time Notifications
- Live notifications using WebSocket/SSE
- Instant in-app notification center
- Browser push notifications
- Priority-based notification levels

### 📱 Multi-Channel Delivery
- In-app notifications (notification center)
- Email notifications
- SMS notifications (configurable)
- Browser push notifications

### ⚙️ User Preferences
- Granular notification type control
- Channel preference settings
- Per-notification-type customization
- Easy-to-use settings interface

### 📊 Notification Management
- Mark as read/unread
- Mark all as read
- Delete notifications
- Notification history
- Unread count badge

## Quick Start

### Adding Notification Center to Layout

```tsx
import { NotificationCenter } from '@/shared/components/ui/notification-center';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <header className="flex items-center justify-between p-4 border-b">
        {/* Other header content */}
        <NotificationCenter />
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### Using the useNotifications Hook

```tsx
import { useNotifications } from '@/shared/hooks/useNotifications';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          {!notification.isRead && (
            <button onClick={() => markAsRead(notification.id)}>
              Mark as Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Creating Notifications

```tsx
import { createNotification, sendInAppNotification } from '@/shared/lib/services/notification.service';

async function notifyUser() {
  // Create notification in database
  await createNotification({
    userId: 'user-123',
    type: 'task_assigned',
    title: 'New Task',
    message: 'You have been assigned a new task',
    priority: 'normal'
  });

  // Or send immediate in-app notification
  sendInAppNotification({
    userId: 'user-123',
    type: 'task_assigned',
    title: 'New Task',
    message: 'You have been assigned a new task',
    priority: 'normal',
    isRead: false
  });
}
```

### Browser Notifications

```tsx
import { requestNotificationPermission, sendBrowserNotification } from '@/shared/lib/services/notification.service';

async function enableNotifications() {
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    await sendBrowserNotification({
      title: 'New Message',
      message: 'You have a new message',
      icon: '/icon.png'
    });
  }
}
```

## API Reference

### createNotification(data)

Creates a new notification.

**Parameters:**
```typescript
{
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}
```

**Returns:**
```typescript
Promise<Notification>
```

### getNotifications(userId, options)

Retrieves notifications for a user.

**Parameters:**
```typescript
{
  userId: string;
  options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }
}
```

**Returns:**
```typescript
{
  notifications: Notification[];
  total: number;
}
```

### markAsRead(notificationId)

Marks a notification as read.

```typescript
await markAsRead('notification-123');
```

### markAllAsRead(userId)

Marks all notifications as read for a user.

```typescript
await markAllAsRead('user-123');
```

### getUnreadCount(userId)

Gets the count of unread notifications.

```typescript
const count = await getUnreadCount('user-123');
```

### sendBrowserNotification(notification)

Sends a browser push notification.

```typescript
await sendBrowserNotification({
  title: 'Alert',
  message: 'You have a new alert',
  icon: '/icon.png',
  actionUrl: '/alerts'
});
```

## Notification Types

### Available Types

- `aid_application` - New aid application received
- `donation_received` - New donation received
- `task_assigned` - Task assigned to user
- `meeting_scheduled` - Meeting scheduled
- `deadline_reminder` - Task deadline approaching
- `system_alert` - System alert or warning
- `message_received` - New message received

### Priority Levels

- `low` - Low priority, informational
- `normal` - Standard notifications
- `high` - Important notifications
- `urgent` - Critical notifications requiring immediate attention

## Components

### NotificationCenter

Bell icon with dropdown notification center.

**Props:**
None - uses `useNotifications` hook internally

**Features:**
- Unread count badge
- Dropdown list of notifications
- Mark as read functionality
- Mark all as read
- Priority-based styling

### NotificationPreferences

Settings page for notification preferences.

**Features:**
- Enable/disable notification channels
- Per-type notification control
- Save settings
- Real-time permission requests

## Hooks

### useNotifications()

React hook for managing notifications.

**Returns:**
```typescript
{
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}
```

## Real-time Setup

### Appwrite Realtime

To enable real-time notifications:

1. Create `notifications` collection in Appwrite
2. Configure realtime subscriptions
3. Set up webhook triggers

Example:
```typescript
// In notification.service.ts
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  const unsubscribe = appwrite.subscribe(
    'collections.notifications.documents',
    [Query.equal('userId', userId)],
    (response) => {
      const notification = response.payload as Notification;
      callback(notification);
    }
  );

  return unsubscribe;
}
```

### Event-Driven Architecture

Trigger notifications on specific events:

```typescript
// In API route
export async function POST(request: NextRequest) {
  const data = await request.json();

  // Create task
  await createTask(data);

  // Send notification
  await createNotification({
    userId: data.assignedTo,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: `You have been assigned: ${data.title}`,
    priority: 'normal'
  });

  return NextResponse.json({ success: true });
}
```

## Email Integration

### SMTP Configuration

Set up email in `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Email Template

```typescript
import { sendEmail } from '@/shared/lib/email.service';

await sendEmail({
  to: user.email,
  subject: 'New Task Assigned',
  template: 'notification',
  data: {
    title: 'New Task',
    message: 'You have been assigned a new task',
    actionUrl: '/tasks/123'
  }
});
```

## SMS Integration

### Twilio Configuration

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### SMS Sending

```typescript
import { sendSms } from '@/shared/lib/sms.service';

await sendSms({
  to: user.phone,
  message: 'You have been assigned a new task. Check your dashboard.'
});
```

## Best Practices

### 1. Notification Fatigue

Avoid overwhelming users:
- Use appropriate priorities
- Batch similar notifications
- Allow users to opt-out of non-critical notifications
- Provide digest options for frequent notifications

### 2. Performance

Optimize notification delivery:
- Use queues for batch delivery
- Implement rate limiting
- Cache notification preferences
- Use CDN for static notification assets

### 3. Accessibility

Make notifications accessible:
- Include ARIA labels
- Support keyboard navigation
- Provide visual and auditory feedback
- Respect `prefers-reduced-motion`

### 4. Privacy

Protect user privacy:
- Don't include sensitive data in notifications
- Allow users to opt-out
- Implement data retention policies
- Log notification access

### 5. Security

Ensure secure delivery:
- Use HTTPS for all notification endpoints
- Implement CSRF protection (already done)
- Sanitize notification content
- Validate user permissions

## Customization

### Custom Notification Types

Add new types:

```typescript
// In notification.service.ts
export type NotificationType =
  | 'aid_application'
  | 'donation_received'
  | 'task_assigned'
  | 'meeting_scheduled'
  | 'deadline_reminder'
  | 'system_alert'
  | 'message_received'
  | 'custom_type'; // New type

export function getNotificationTemplate(
  type: NotificationType,
  data: Record<string, any>
) {
  switch (type) {
    case 'custom_type':
      return {
        title: 'Custom Notification',
        message: data.message
      };
    // ... other cases
  }
}
```

### Custom Priority Colors

Update `notification-center.tsx`:

```typescript
const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-red-600 bg-red-50';
    case 'high':
      return 'border-l-orange-500 bg-orange-50';
    case 'normal':
      return 'border-l-blue-500 bg-blue-50';
    case 'low':
      return 'border-l-green-500 bg-green-50';
  }
};
```

## Testing

### Unit Tests

```typescript
import { createNotification } from '@/shared/lib/services/notification.service';

test('creates notification with correct data', async () => {
  const notification = await createNotification({
    userId: 'user-123',
    type: 'task_assigned',
    title: 'New Task',
    message: 'Task description'
  });

  expect(notification.userId).toBe('user-123');
  expect(notification.type).toBe('task_assigned');
  expect(notification.isRead).toBe(false);
});
```

### E2E Tests

Test notification flow:
1. Create task
2. Check notification appears
3. Mark as read
4. Verify unread count decreases

## Troubleshooting

### Notifications Not Showing

**Check:**
1. User permissions
2. Notification preferences
3. Real-time connection status
4. Database connectivity

**Debug:**
```typescript
// Add to notification service
console.log('Creating notification:', data);
console.log('Current user:', userId);
```

### Push Notifications Not Working

**Check:**
1. Browser permission granted
2. HTTPS enabled (required for push)
3. Service worker registered
4. Valid VAPID keys

**Browser Permissions:**
```typescript
// Check current permission
console.log(Notification.permission);

// Request permission
const permission = await Notification.requestPermission();
console.log(permission);
```

### Slow Delivery

**Check:**
1. Email/SMS service status
2. Rate limiting settings
3. Queue processing
4. Network latency

## Performance Monitoring

Track notification metrics:

```typescript
// Log metrics
const start = Date.now();
await createNotification(data);
const duration = Date.now() - start;

console.log(`Notification created in ${duration}ms`);
```

## Roadmap

### Upcoming Features

- [ ] **Notification Templates**: Rich HTML templates
- [ ] **Scheduled Notifications**: Future delivery
- [ ] **Notification Groups**: Batch related notifications
- [ ] **Digest Mode**: Daily/weekly summary
- [ ] **In-App Toasts**: Quick toast notifications
- [ ] **Notification Analytics**: Track open rates
- [ ] **Smart Notifications**: AI-based timing
- [ ] **Multi-Language**: Translated notifications

## Support

For issues:
1. Check browser console for errors
2. Verify API responses
3. Test notification preferences
4. Check real-time connection
5. Review permission settings
