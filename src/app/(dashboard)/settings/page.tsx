'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Save, User, Mail, Bell, Shield, Database } from 'lucide-react';
import { PageLayout } from '@/shared/components/layout/PageLayout';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organization: {
      name: 'Dernek Yönetim Sistemi',
      address: '',
      phone: '',
      email: ''
    },
    email: {
      enabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false
    },
    system: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      maintenanceMode: false
    },
    security: {
      requireTwoFactor: false,
      passwordMinLength: 8,
      sessionTimeout: 30
    }
  });

  const [activeTab, setActiveTab] = useState('organization');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    toast.success('Ayarlar başarıyla kaydedildi');
    setHasChanges(false);
  };

  const updateSetting = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [field]: value }
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: 'organization', label: 'Organizasyon', icon: User },
    { id: 'email', label: 'E-posta', icon: Mail },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'system', label: 'Sistem', icon: Database }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'organization':
        return (
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Organizasyon Bilgileri</CardTitle>
              <CardDescription>Dernek organizasyon bilgilerini güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organizasyon Adı *</Label>
                <Input
                  id="org-name"
                  value={settings.organization.name}
                  onChange={(e) => updateSetting('organization', 'name', e.target.value)}
                  className="border-slate-200 focus:border-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="org-address">Adres</Label>
                <Input
                  id="org-address"
                  value={settings.organization.address}
                  onChange={(e) => updateSetting('organization', 'address', e.target.value)}
                  className="border-slate-200 focus:border-slate-400"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="org-phone">Telefon</Label>
                  <Input
                    id="org-phone"
                    value={settings.organization.phone}
                    onChange={(e) => updateSetting('organization', 'phone', e.target.value)}
                    className="border-slate-200 focus:border-slate-400"
                  />
                </div>
                <div>
                  <Label htmlFor="org-email">E-posta</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={settings.organization.email}
                    onChange={(e) => updateSetting('organization', 'email', e.target.value)}
                    className="border-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'email':
        return (
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle>E-posta Ayarları</CardTitle>
              <CardDescription>SMTP sunucu ayarlarını yapılandırın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smtp-enabled">SMTP Etkin</Label>
                  <p className="text-sm text-slate-500">SMTP sunucu ayarlarını aktif hale getirir</p>
                </div>
                <Switch
                  checked={settings.email.enabled}
                  onCheckedChange={(checked) => updateSetting('email', 'enabled', checked)}
                />
              </div>
              
              {settings.email.enabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp-host">SMTP Sunucu *</Label>
                      <Input
                        id="smtp-host"
                        value={settings.email.smtpHost}
                        onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp-user">SMTP Kullanıcı</Label>
                      <Input
                        id="smtp-user"
                        value={settings.email.smtpUser}
                        onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-password">SMTP Şifre</Label>
                      <Input
                        id="smtp-password"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="from-email">Gönderen E-posta</Label>
                    <Input
                      id="from-email"
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>Sistem bildirim tercihlerinizi yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">E-posta Bildirimleri</Label>
                    <p className="text-sm text-slate-500">Yeni bağışlar ve güncellemeler için e-posta al</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Bildirimleri</Label>
                    <p className="text-sm text-slate-500">Tarayıcı bildirimlerini aktifleştir</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">SMS Bildirimleri</Label>
                    <p className="text-sm text-slate-500">Önemli durumlar için SMS al</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'security':
        return (
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>Şifre ve güvenlik politikalarını yapılandırın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">İki Faktörlü Kimlik Doğrulama</Label>
                  <p className="text-sm text-slate-500">Ekstra güvenlik katmanı ekle</p>
                </div>
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) => updateSetting('security', 'requireTwoFactor', checked)}
                />
              </div>
              <div>
                <Label htmlFor="password-length">Minimum Şifre Uzunluğu</Label>
                <Input
                  id="password-length"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="border-slate-200 focus:border-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="security-session">Oturum Timeout (dakika)</Label>
                <Input
                  id="security-session"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="border-slate-200 focus:border-slate-400"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 'system':
        return (
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Sistem Ayarları</CardTitle>
              <CardDescription>Genel sistem parametrelerini yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Bakım Modu</Label>
                  <p className="text-sm text-slate-500">Sistemi bakım için geçici olarak kapat</p>
                </div>
                <Switch
                  checked={settings.system.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('system', 'maintenanceMode', checked)}
                />
              </div>
              <div>
                <Label htmlFor="max-attempts">Maksimum Giriş Denemesi</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  value={settings.system.maxLoginAttempts}
                  onChange={(e) => updateSetting('system', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="border-slate-200 focus:border-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="system-session">Oturum Timeout (dakika)</Label>
                <Input
                  id="system-session"
                  type="number"
                  value={settings.system.sessionTimeout}
                  onChange={(e) => updateSetting('system', 'sessionTimeout', parseInt(e.target.value))}
                  className="border-slate-200 focus:border-slate-400"
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout
      title="Sistem Ayarları"
      description="Sistem konfigürasyonunu ve tercihlerinizi yönetin"
      icon="Settings"
      actions={
        <Button 
          onClick={handleSave}
          disabled={!hasChanges}
          className={`gap-2 ${hasChanges ? 'bg-slate-700 hover:bg-slate-600' : 'opacity-50'}`}
        >
          <Save className="h-4 w-4" />
          {hasChanges ? 'Değişiklikleri Kaydet' : 'Kaydedildi'}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardContent className="p-0">
            <div className="flex flex-wrap">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-slate-700 text-slate-900 dark:text-slate-100'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="space-y-4">
          {renderTabContent()}
        </div>

        {/* Status */}
        {hasChanges && (
          <Card className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  Kaydedilmemiş Değişiklikler
                </Badge>
                <p className="text-sm text-amber-600">
                  Yaptığınız değişiklikleri kaydetmek için "Değişiklikleri Kaydet" butonuna tıklayın.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
