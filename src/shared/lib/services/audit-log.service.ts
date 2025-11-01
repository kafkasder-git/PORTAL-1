/**
 * Audit Logging Service
 * Tracks and records all important system activities for security and compliance
 */

export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  LOGIN_SUCCESS = 'login_success',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',

  // 2FA
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  TWO_FACTOR_VERIFIED = 'two_factor_verified',
  BACKUP_CODES_REGENERATED = 'backup_codes_regenerated',

  // Users
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_CHANGED = 'user_role_changed',
  USER_PERMISSION_CHANGED = 'user_permission_changed',

  // Beneficiaries
  BENEFICIARY_CREATED = 'beneficiary_created',
  BENEFICIARY_UPDATED = 'beneficiary_updated',
  BENEFICIARY_DELETED = 'beneficiary_deleted',
  BENEFICIARY_VIEWED = 'beneficiary_viewed',

  // Donations
  DONATION_CREATED = 'donation_created',
  DONATION_UPDATED = 'donation_updated',
  DONATION_DELETED = 'donation_deleted',
  DONATION_APPROVED = 'donation_approved',
  DONATION_REJECTED = 'donation_rejected',
  DONATION_VIEWED = 'donation_viewed',

  // Aid Applications
  AID_APPLICATION_CREATED = 'aid_application_created',
  AID_APPLICATION_UPDATED = 'aid_application_updated',
  AID_APPLICATION_DELETED = 'aid_application_deleted',
  AID_APPLICATION_APPROVED = 'aid_application_approved',
  AID_APPLICATION_REJECTED = 'aid_application_rejected',

  // Meetings
  MEETING_CREATED = 'meeting_created',
  MEETING_UPDATED = 'meeting_updated',
  MEETING_DELETED = 'meeting_deleted',
  MEETING_CANCELLED = 'meeting_cancelled',

  // Tasks
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  TASK_COMPLETED = 'task_completed',
  TASK_ASSIGNED = 'task_assigned',

  // Documents
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_DELETED = 'document_deleted',
  DOCUMENT_DOWNLOADED = 'document_downloaded',
  DOCUMENT_SHARED = 'document_shared',

  // Workflows
  WORKFLOW_CREATED = 'workflow_created',
  WORKFLOW_UPDATED = 'workflow_updated',
  WORKFLOW_DELETED = 'workflow_deleted',
  WORKFLOW_EXECUTED = 'workflow_executed',

  // Settings
  SETTINGS_UPDATED = 'settings_updated',
  SECURITY_SETTINGS_CHANGED = 'security_settings_changed',

  // Data Export/Import
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',

  // System
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  severity: AuditSeverity;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: {
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    reason?: string;
    sessionId?: string;
  };
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  byAction: Record<AuditAction, number>;
  bySeverity: Record<AuditSeverity, number>;
  byUser: Record<string, number>;
  recentActivity: AuditLog[];
}

/**
 * Audit Logging Service
 */
export const auditLogService = {
  /**
   * Log an action
   */
  async log(params: {
    action: AuditAction;
    severity?: AuditSeverity;
    userId?: string;
    userEmail?: string;
    resource?: string;
    resourceId?: string;
    details?: Record<string, any>;
    metadata?: AuditLog['metadata'];
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const {
      action,
      severity = AuditSeverity.INFO,
      userId,
      userEmail,
      resource,
      resourceId,
      details,
      metadata,
      ipAddress,
      userAgent,
    } = params;

    const logEntry: AuditLog = {
      id: crypto.randomUUID(),
      userId,
      userEmail,
      action,
      severity,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // In production, save to 'audit_logs' collection in Appwrite
    console.log('Audit Log:', logEntry);

    // Optional: Send critical logs to external monitoring service
    if (severity === AuditSeverity.CRITICAL) {
      console.error('CRITICAL AUDIT LOG:', logEntry);
    }
  },

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    const { userId, action, severity, resource, startDate, endDate, page = 1, limit = 50 } = filters;

    // In production, query from Appwrite 'audit_logs' collection
    // For now, return empty array
    console.log('Getting audit logs with filters:', filters);

    return [];
  },

  /**
   * Get audit statistics
   */
  async getStats(dateRange?: { startDate: Date; endDate: Date }): Promise<AuditLogStats> {
    // In production, aggregate from Appwrite
    console.log('Getting audit stats for date range:', dateRange);

    return {
      totalLogs: 0,
      byAction: {} as Record<AuditAction, number>,
      bySeverity: {} as Record<AuditSeverity, number>,
      byUser: {},
      recentActivity: [],
    };
  },

  /**
   * Export audit logs
   */
  async exportLogs(filters: AuditLogFilters = {}): Promise<Blob> {
    const logs = await this.getLogs({ ...filters, limit: 10000 });

    // Convert to CSV
    const csvHeader = 'Timestamp,User,Action,Resource,Severity,Details\n';
    const csvRows = logs.map(log => {
      const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
      return `"${log.timestamp}","${log.userEmail || ''}","${log.action}","${log.resource || ''}","${log.severity}","${details}"`;
    });

    const csv = csvHeader + csvRows.join('\n');
    return new Blob([csv], { type: 'text/csv' });
  },

  /**
   * Clean up old logs (for retention policy)
   */
  async cleanup(retentionDays: number = 365): Promise<number> {
    // In production, delete old logs from Appwrite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Cleaning up audit logs older than ${retentionDays} days (before ${cutoffDate.toISOString()})`);

    return 0; // Return number of deleted logs
  },

  /**
   * Get logs for a specific resource
   */
  async getResourceLogs(resourceId: string): Promise<AuditLog[]> {
    return this.getLogs({ resourceId });
  },

  /**
   * Get logs for a specific user
   */
  async getUserLogs(userId: string): Promise<AuditLog[]> {
    return this.getLogs({ userId });
  },
};

// Convenience functions for common actions
export const auditLogger = {
  login: (userId: string, userEmail: string, ipAddress?: string, userAgent?: string) =>
    auditLogService.log({
      action: AuditAction.LOGIN,
      userId,
      userEmail,
      ipAddress,
      userAgent,
    }),

  loginSuccess: (userId: string, userEmail: string) =>
    auditLogService.log({
      action: AuditAction.LOGIN_SUCCESS,
      severity: AuditSeverity.INFO,
      userId,
      userEmail,
    }),

  loginFailed: (email: string, reason: string, ipAddress?: string) =>
    auditLogService.log({
      action: AuditAction.LOGIN_FAILED,
      severity: AuditSeverity.WARNING,
      userEmail: email,
      details: { reason },
      ipAddress,
    }),

  logout: (userId: string, userEmail: string) =>
    auditLogService.log({
      action: AuditAction.LOGOUT,
      userId,
      userEmail,
    }),

  create: (action: AuditAction, userId: string, userEmail: string, resource: string, resourceId: string, values: Record<string, any>) =>
    auditLogService.log({
      action,
      userId,
      userEmail,
      resource,
      resourceId,
      severity: AuditSeverity.INFO,
      metadata: { newValues: values },
    }),

  update: (action: AuditAction, userId: string, userEmail: string, resource: string, resourceId: string, oldValues: Record<string, any>, newValues: Record<string, any>) =>
    auditLogService.log({
      action,
      userId,
      userEmail,
      resource,
      resourceId,
      severity: AuditSeverity.INFO,
      metadata: { oldValues, newValues },
    }),

  delete: (action: AuditAction, userId: string, userEmail: string, resource: string, resourceId: string, values: Record<string, any>) =>
    auditLogService.log({
      action,
      userId,
      userEmail,
      resource,
      resourceId,
      severity: AuditSeverity.WARNING,
      metadata: { oldValues: values },
    }),

  error: (action: AuditAction, userId: string, userEmail: string, error: string, details?: Record<string, any>) =>
    auditLogService.log({
      action,
      userId,
      userEmail,
      severity: AuditSeverity.ERROR,
      details: { error, ...details },
    }),

  critical: (action: AuditAction, userId: string, userEmail: string, message: string, details?: Record<string, any>) =>
    auditLogService.log({
      action,
      userId,
      userEmail,
      severity: AuditSeverity.CRITICAL,
      details: { message, ...details },
    }),
};
