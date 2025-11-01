/**
 * Notification Preferences Page
 */

import { NotificationPreferences } from '@/shared/components/ui/notification-preferences';

export default function NotificationsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Bildirim Tercihleri</h1>
        <p className="text-gray-500 mt-2">
          Hangi bildirimleri almak istediğinizi özelleştirin
        </p>
      </div>

      <NotificationPreferences />
    </div>
  );
}
