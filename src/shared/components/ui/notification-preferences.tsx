/**
 * Notification Preferences Component
 */

'use client';

import { useState, useEffect } from 'react';
import { Save, Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Switch } from './switch';
import { Label } from './label';
import {
  getNotificationConfig,
  updateNotificationConfig,
  requestNotificationPermission,
  type NotificationType
} from '@/shared/lib/services/notification.service';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from 'sonner';

const notificationTypeLabels: Record<NotificationType, string> = {
  aid_application: 'Yardım Başvuruları',
  donation_received: 'Bağış Bildirimleri',
  task_assigned: 'Görev Atamaları',
  meeting_scheduled: 'Toplantı Bildirimleri',
  deadline_reminder: 'Son Gün Hatırlatmaları',
  system_alert: 'Sistem Uyarıları',
  message_received: 'Mesaj Bildirimleri'
};

export function NotificationPreferences() {
  const { user } = useAuthStore();
  const [config, setConfig] = useState({
    email: true,
    sms: false,
    inApp: true,
    push: false,
    types: {
      aid_application: true,
      donation_received: true,
      task_assigned: true,
      meeting_scheduled: true,
      deadline_reminder: true,
      system_alert: true,
      message_received: true
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, [user?.id]);

  const loadConfig = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const userConfig = await getNotificationConfig(user.id);
      setConfig(userConfig);
    } catch (error) {
      console.error('Error loading notification config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      await updateNotificationConfig(user.id, config);
      toast.success('Bildirim tercihleri kaydedildi');
    } catch (error) {
      console.error('Error saving notification config:', error);
      toast.error('Bildirim tercihleri kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToggle = async (checked: boolean) => {
    if (checked) {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        toast.error('Push bildirimler için izin verilmedi');
        return;
      }
    }
    setConfig(prev => ({ ...prev, push: checked }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-gray-500">Bildirim tercihleri yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Kanalları</CardTitle>
          <CardDescription>
            Bildirimleri hangi yollarla almak istiyorsunuz?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <div>
                <Label htmlFor="in-app" className="font-medium">
                  Uygulama İçi Bildirimler
                </Label>
                <p className="text-sm text-gray-500">
                  Bildirim merkezinde görüntüle
                </p>
              </div>
            </div>
            <Switch
              id="in-app"
              checked={config.inApp}
              onCheckedChange={(checked) =>
                setConfig(prev => ({ ...prev, inApp: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <Label htmlFor="email" className="font-medium">
                  E-posta Bildirimleri
                </Label>
                <p className="text-sm text-gray-500">
                  E-posta adresinize bildirim gönder
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={config.email}
              onCheckedChange={(checked) =>
                setConfig(prev => ({ ...prev, email: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <div>
                <Label htmlFor="sms" className="font-medium">
                  SMS Bildirimleri
                </Label>
                <p className="text-sm text-gray-500">
                  Telefonunuza SMS gönder
                </p>
              </div>
            </div>
            <Switch
              id="sms"
              checked={config.sms}
              onCheckedChange={(checked) =>
                setConfig(prev => ({ ...prev, sms: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-gray-600" />
              <div>
                <Label htmlFor="push" className="font-medium">
                  Push Bildirimleri
                </Label>
                <p className="text-sm text-gray-500">
                  Tarayıcınızdan push bildirimleri
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={config.push}
              onCheckedChange={handlePushToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bildirim Türleri</CardTitle>
          <CardDescription>
            Hangi tür bildirimleri almak istiyorsunuz?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(notificationTypeLabels) as NotificationType[]).map((type) => (
            <div key={type} className="flex items-center justify-between">
              <Label htmlFor={type} className="flex-1 cursor-pointer">
                {notificationTypeLabels[type]}
              </Label>
              <Switch
                id={type}
                checked={config.types[type]}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({
                    ...prev,
                    types: { ...prev.types, [type]: checked }
                  }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
