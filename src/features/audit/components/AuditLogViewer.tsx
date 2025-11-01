/**
 * Audit Log Viewer Component
 * Displays and manages audit logs
 */

'use client';

import { useState, useEffect } from 'react';
import { Shield, Download, Filter, Search, AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { auditLogService, type AuditLog, type AuditAction, type AuditSeverity, AuditAction as AuditActionEnum, AuditSeverity as AuditSeverityEnum } from '@/shared/lib/services/audit-log.service';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const filterParams = {
        action: filters.action as AuditAction || undefined,
        severity: filters.severity as AuditSeverity || undefined,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      };

      const result = await auditLogService.getLogs(filterParams);
      setLogs(result);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await auditLogService.exportLogs(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const getSeverityIcon = (severity: AuditSeverity) => {
    switch (severity) {
      case AuditSeverityEnum.CRITICAL:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case AuditSeverityEnum.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case AuditSeverityEnum.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case AuditSeverityEnum.INFO:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadgeColor = (severity: AuditSeverity) => {
    switch (severity) {
      case AuditSeverityEnum.CRITICAL:
        return 'bg-red-100 text-red-800';
      case AuditSeverityEnum.ERROR:
        return 'bg-red-50 text-red-700';
      case AuditSeverityEnum.WARNING:
        return 'bg-yellow-100 text-yellow-800';
      case AuditSeverityEnum.INFO:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getActionLabel = (action: AuditAction) => {
    const labels: Record<AuditAction, string> = {
      [AuditActionEnum.LOGIN]: 'Giriş',
      [AuditActionEnum.LOGOUT]: 'Çıkış',
      [AuditActionEnum.LOGIN_FAILED]: 'Giriş Başarısız',
      [AuditActionEnum.LOGIN_SUCCESS]: 'Giriş Başarılı',
      [AuditActionEnum.PASSWORD_CHANGED]: 'Şifre Değiştirildi',
      [AuditActionEnum.PASSWORD_RESET]: 'Şifre Sıfırlandı',
      [AuditActionEnum.TWO_FACTOR_ENABLED]: '2FA Etkinleştirildi',
      [AuditActionEnum.TWO_FACTOR_DISABLED]: '2FA Devre Dışı',
      [AuditActionEnum.TWO_FACTOR_VERIFIED]: '2FA Doğrulandı',
      [AuditActionEnum.BACKUP_CODES_REGENERATED]: 'Yedek Kodlar Yenilendi',
      [AuditActionEnum.USER_CREATED]: 'Kullanıcı Oluşturuldu',
      [AuditActionEnum.USER_UPDATED]: 'Kullanıcı Güncellendi',
      [AuditActionEnum.USER_DELETED]: 'Kullanıcı Silindi',
      [AuditActionEnum.USER_ROLE_CHANGED]: 'Kullanıcı Rolü Değiştirildi',
      [AuditActionEnum.USER_PERMISSION_CHANGED]: 'Kullanıcı İzni Değiştirildi',
      [AuditActionEnum.BENEFICIARY_CREATED]: 'İhtiyaç Sahibi Oluşturuldu',
      [AuditActionEnum.BENEFICIARY_UPDATED]: 'İhtiyaç Sahibi Güncellendi',
      [AuditActionEnum.BENEFICIARY_DELETED]: 'İhtiyaç Sahibi Silindi',
      [AuditActionEnum.BENEFICIARY_VIEWED]: 'İhtiyaç Sahibi Görüntülendi',
      [AuditActionEnum.DONATION_CREATED]: 'Bağış Oluşturuldu',
      [AuditActionEnum.DONATION_UPDATED]: 'Bağış Güncellendi',
      [AuditActionEnum.DONATION_DELETED]: 'Bağış Silindi',
      [AuditActionEnum.DONATION_APPROVED]: 'Bağış Onaylandı',
      [AuditActionEnum.DONATION_REJECTED]: 'Bağış Reddedildi',
      [AuditActionEnum.DONATION_VIEWED]: 'Bağış Görüntülendi',
      [AuditActionEnum.AID_APPLICATION_CREATED]: 'Yardım Başvurusu Oluşturuldu',
      [AuditActionEnum.AID_APPLICATION_UPDATED]: 'Yardım Başvurusu Güncellendi',
      [AuditActionEnum.AID_APPLICATION_DELETED]: 'Yardım Başvurusu Silindi',
      [AuditActionEnum.AID_APPLICATION_APPROVED]: 'Yardım Başvurusu Onaylandı',
      [AuditActionEnum.AID_APPLICATION_REJECTED]: 'Yardım Başvurusu Reddedildi',
      [AuditActionEnum.MEETING_CREATED]: 'Toplantı Oluşturuldu',
      [AuditActionEnum.MEETING_UPDATED]: 'Toplantı Güncellendi',
      [AuditActionEnum.MEETING_DELETED]: 'Toplantı Silindi',
      [AuditActionEnum.MEETING_CANCELLED]: 'Toplantı İptal Edildi',
      [AuditActionEnum.TASK_CREATED]: 'Görev Oluşturuldu',
      [AuditActionEnum.TASK_UPDATED]: 'Görev Güncellendi',
      [AuditActionEnum.TASK_DELETED]: 'Görev Silindi',
      [AuditActionEnum.TASK_COMPLETED]: 'Görev Tamamlandı',
      [AuditActionEnum.TASK_ASSIGNED]: 'Görev Atandı',
      [AuditActionEnum.DOCUMENT_UPLOADED]: 'Doküman Yüklendi',
      [AuditActionEnum.DOCUMENT_DELETED]: 'Doküman Silindi',
      [AuditActionEnum.DOCUMENT_DOWNLOADED]: 'Doküman İndirildi',
      [AuditActionEnum.DOCUMENT_SHARED]: 'Doküman Paylaşıldı',
      [AuditActionEnum.WORKFLOW_CREATED]: 'İş Akışı Oluşturuldu',
      [AuditActionEnum.WORKFLOW_UPDATED]: 'İş Akışı Güncellendi',
      [AuditActionEnum.WORKFLOW_DELETED]: 'İş Akışı Silindi',
      [AuditActionEnum.WORKFLOW_EXECUTED]: 'İş Akışı Çalıştırıldı',
      [AuditActionEnum.SETTINGS_UPDATED]: 'Ayarlar Güncellendi',
      [AuditActionEnum.SECURITY_SETTINGS_CHANGED]: 'Güvenlik Ayarları Değiştirildi',
      [AuditActionEnum.DATA_EXPORTED]: 'Veri Dışa Aktarıldı',
      [AuditActionEnum.DATA_IMPORTED]: 'Veri İçe Aktarıldı',
      [AuditActionEnum.SYSTEM_BACKUP]: 'Sistem Yedeği Alındı',
      [AuditActionEnum.SYSTEM_RESTORE]: 'Sistem Geri Yüklendi',
    };
    return labels[action] || action;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle>Denetim Kayıtları</CardTitle>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
          <CardDescription>
            Sistemde gerçekleştirilen tüm önemli işlemler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">İşlem</label>
              <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  {Object.values(AuditActionEnum).map((action) => (
                    <SelectItem key={action} value={action}>
                      {getActionLabel(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Önem Derecesi</label>
              <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  {Object.values(AuditSeverityEnum).map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity === 'info' ? 'Bilgi' :
                       severity === 'warning' ? 'Uyarı' :
                       severity === 'error' ? 'Hata' : 'Kritik'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Başlangıç Tarihi</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bitiş Tarihi</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kullanıcı, işlem veya kaynak ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kayıtlar</CardTitle>
          <CardDescription>
            {filteredLogs.length} kayıt bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Denetim kaydı bulunamadı
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getSeverityIcon(log.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getActionLabel(log.action)}</span>
                        <Badge className={getSeverityBadgeColor(log.severity)}>
                          {log.severity === 'info' ? 'Bilgi' :
                           log.severity === 'warning' ? 'Uyarı' :
                           log.severity === 'error' ? 'Hata' : 'Kritik'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span>{log.userEmail || 'Sistem'}</span>
                        {log.resource && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{log.resource}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
