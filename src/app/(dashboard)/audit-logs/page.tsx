/**
 * Audit Logs Page
 * Displays and manages audit logs
 */

'use client';

import { AuditLogViewer } from '@/features/audit/components/AuditLogViewer';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 p-6">
      <AuditLogViewer />
    </div>
  );
}
