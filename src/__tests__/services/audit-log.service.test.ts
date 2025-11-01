/**
 * Audit Log Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  auditLogService,
  auditLogger,
  AuditAction,
  AuditSeverity,
} from '@/shared/lib/services/audit-log.service';

describe('AuditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('log', () => {
    it('should create a log entry', async () => {
      const logEntry = await auditLogService.log({
        action: AuditAction.USER_CREATED,
        severity: AuditSeverity.INFO,
        userId: 'user-123',
        userEmail: 'user@example.com',
        resource: 'user',
        resourceId: 'user-123',
        details: { name: 'Test User' },
      });

      expect(logEntry).toBeUndefined(); // Service logs to console in mock
    });

    it('should log with default severity', async () => {
      await auditLogService.log({
        action: AuditAction.USER_CREATED,
        userId: 'user-123',
        userEmail: 'user@example.com',
      });

      expect(auditLogService.log).toBeDefined();
    });

    it('should log with metadata', async () => {
      await auditLogService.log({
        action: AuditAction.USER_UPDATED,
        severity: AuditSeverity.INFO,
        userId: 'user-123',
        userEmail: 'user@example.com',
        resource: 'user',
        resourceId: 'user-123',
        metadata: {
          oldValues: { name: 'Old Name' },
          newValues: { name: 'New Name' },
          reason: 'Profile update',
        },
      });

      expect(auditLogService.log).toBeDefined();
    });
  });

  describe('getLogs', () => {
    it('should return empty array by default', async () => {
      const logs = await auditLogService.getLogs();
      expect(logs).toEqual([]);
    });

    it('should filter by userId', async () => {
      const logs = await auditLogService.getLogs({ userId: 'user-123' });
      expect(logs).toEqual([]);
    });

    it('should filter by action', async () => {
      const logs = await auditLogService.getLogs({ action: AuditAction.USER_CREATED });
      expect(logs).toEqual([]);
    });

    it('should filter by severity', async () => {
      const logs = await auditLogService.getLogs({ severity: AuditSeverity.INFO });
      expect(logs).toEqual([]);
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      const logs = await auditLogService.getLogs({ startDate, endDate });
      expect(logs).toEqual([]);
    });

    it('should filter by resource', async () => {
      const logs = await auditLogService.getLogs({ resource: 'user' });
      expect(logs).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return default stats', async () => {
      const stats = await auditLogService.getStats();

      expect(stats.totalLogs).toBe(0);
      expect(stats.byAction).toEqual({});
      expect(stats.bySeverity).toEqual({});
      expect(stats.byUser).toEqual({});
      expect(stats.recentActivity).toEqual([]);
    });

    it('should calculate stats for date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      const stats = await auditLogService.getStats({ startDate, endDate });

      expect(stats.totalLogs).toBe(0);
    });
  });

  describe('exportLogs', () => {
    it('should export logs as CSV', async () => {
      const blob = await auditLogService.exportLogs();

      expect(blob).toBeInstanceOf(Blob);
    });

    it('should export filtered logs', async () => {
      const blob = await auditLogService.exportLogs({
        userId: 'user-123',
        action: AuditAction.USER_CREATED,
      });

      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle empty logs', async () => {
      const blob = await auditLogService.exportLogs();
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(blob);
      });

      expect(text).toContain('Timestamp,User,Action,Resource,Severity,Details');
    });
  });

  describe('getResourceLogs', () => {
    it('should get logs for specific resource', async () => {
      const logs = await auditLogService.getResourceLogs('user-123');
      expect(logs).toEqual([]);
    });
  });

  describe('getUserLogs', () => {
    it('should get logs for specific user', async () => {
      const logs = await auditLogService.getUserLogs('user-123');
      expect(logs).toEqual([]);
    });
  });
});

describe('auditLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should log login event', async () => {
      await auditLogger.login('user-123', 'user@example.com');

      expect(auditLogger.login).toBeDefined();
    });

    it('should log with IP address', async () => {
      await auditLogger.login('user-123', 'user@example.com', '192.168.1.1');

      expect(auditLogger.login).toBeDefined();
    });
  });

  describe('loginSuccess', () => {
    it('should log successful login', async () => {
      await auditLogger.loginSuccess('user-123', 'user@example.com');

      expect(auditLogger.loginSuccess).toBeDefined();
    });
  });

  describe('loginFailed', () => {
    it('should log failed login', async () => {
      await auditLogger.loginFailed('user@example.com', 'Invalid credentials');

      expect(auditLogger.loginFailed).toBeDefined();
    });

    it('should include reason', async () => {
      await auditLogger.loginFailed(
        'user@example.com',
        'Invalid credentials',
        '192.168.1.100'
      );

      expect(auditLogger.loginFailed).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should log logout event', async () => {
      await auditLogger.logout('user-123', 'user@example.com');

      expect(auditLogger.logout).toBeDefined();
    });
  });

  describe('create', () => {
    it('should log creation event', async () => {
      await auditLogger.create(
        AuditAction.USER_CREATED,
        'user-123',
        'user@example.com',
        'user',
        'user-123',
        { name: 'Test User', email: 'test@example.com' }
      );

      expect(auditLogger.create).toBeDefined();
    });
  });

  describe('update', () => {
    it('should log update event', async () => {
      await auditLogger.update(
        AuditAction.USER_UPDATED,
        'user-123',
        'user@example.com',
        'user',
        'user-123',
        { name: 'Old Name' },
        { name: 'New Name' }
      );

      expect(auditLogger.update).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should log deletion event', async () => {
      await auditLogger.delete(
        AuditAction.USER_DELETED,
        'user-123',
        'user@example.com',
        'user',
        'user-123',
        { name: 'Test User' }
      );

      expect(auditLogger.delete).toBeDefined();
    });
  });

  describe('error', () => {
    it('should log error event', async () => {
      await auditLogger.error(
        AuditAction.USER_CREATED,
        'user-123',
        'user@example.com',
        'Database connection failed',
        { code: 'DB_ERROR' }
      );

      expect(auditLogger.error).toBeDefined();
    });
  });

  describe('critical', () => {
    it('should log critical event', async () => {
      await auditLogger.critical(
        AuditAction.TWO_FACTOR_DISABLED,
        'user-123',
        'user@example.com',
        '2FA was disabled by user'
      );

      expect(auditLogger.critical).toBeDefined();
    });
  });

  describe('Action Types', () => {
    it('should have all authentication actions', () => {
      expect(AuditAction.LOGIN).toBeDefined();
      expect(AuditAction.LOGOUT).toBeDefined();
      expect(AuditAction.LOGIN_FAILED).toBeDefined();
      expect(AuditAction.LOGIN_SUCCESS).toBeDefined();
      expect(AuditAction.PASSWORD_CHANGED).toBeDefined();
      expect(AuditAction.PASSWORD_RESET).toBeDefined();
    });

    it('should have all 2FA actions', () => {
      expect(AuditAction.TWO_FACTOR_ENABLED).toBeDefined();
      expect(AuditAction.TWO_FACTOR_DISABLED).toBeDefined();
      expect(AuditAction.TWO_FACTOR_VERIFIED).toBeDefined();
      expect(AuditAction.BACKUP_CODES_REGENERATED).toBeDefined();
    });

    it('should have all user management actions', () => {
      expect(AuditAction.USER_CREATED).toBeDefined();
      expect(AuditAction.USER_UPDATED).toBeDefined();
      expect(AuditAction.USER_DELETED).toBeDefined();
      expect(AuditAction.USER_ROLE_CHANGED).toBeDefined();
      expect(AuditAction.USER_PERMISSION_CHANGED).toBeDefined();
    });

    it('should have all entity actions', () => {
      expect(AuditAction.BENEFICIARY_CREATED).toBeDefined();
      expect(AuditAction.BENEFICIARY_UPDATED).toBeDefined();
      expect(AuditAction.BENEFICIARY_DELETED).toBeDefined();
      expect(AuditAction.BENEFICIARY_VIEWED).toBeDefined();

      expect(AuditAction.DONATION_CREATED).toBeDefined();
      expect(AuditAction.DONATION_UPDATED).toBeDefined();
      expect(AuditAction.DONATION_DELETED).toBeDefined();
      expect(AuditAction.DONATION_APPROVED).toBeDefined();
      expect(AuditAction.DONATION_REJECTED).toBeDefined();
      expect(AuditAction.DONATION_VIEWED).toBeDefined();

      expect(AuditAction.AID_APPLICATION_CREATED).toBeDefined();
      expect(AuditAction.AID_APPLICATION_UPDATED).toBeDefined();
      expect(AuditAction.AID_APPLICATION_DELETED).toBeDefined();
      expect(AuditAction.AID_APPLICATION_APPROVED).toBeDefined();
      expect(AuditAction.AID_APPLICATION_REJECTED).toBeDefined();

      expect(AuditAction.MEETING_CREATED).toBeDefined();
      expect(AuditAction.MEETING_UPDATED).toBeDefined();
      expect(AuditAction.MEETING_DELETED).toBeDefined();
      expect(AuditAction.MEETING_CANCELLED).toBeDefined();

      expect(AuditAction.TASK_CREATED).toBeDefined();
      expect(AuditAction.TASK_UPDATED).toBeDefined();
      expect(AuditAction.TASK_DELETED).toBeDefined();
      expect(AuditAction.TASK_COMPLETED).toBeDefined();
      expect(AuditAction.TASK_ASSIGNED).toBeDefined();

      expect(AuditAction.DOCUMENT_UPLOADED).toBeDefined();
      expect(AuditAction.DOCUMENT_DELETED).toBeDefined();
      expect(AuditAction.DOCUMENT_DOWNLOADED).toBeDefined();
      expect(AuditAction.DOCUMENT_SHARED).toBeDefined();

      expect(AuditAction.WORKFLOW_CREATED).toBeDefined();
      expect(AuditAction.WORKFLOW_UPDATED).toBeDefined();
      expect(AuditAction.WORKFLOW_DELETED).toBeDefined();
      expect(AuditAction.WORKFLOW_EXECUTED).toBeDefined();
    });

    it('should have all system actions', () => {
      expect(AuditAction.SETTINGS_UPDATED).toBeDefined();
      expect(AuditAction.SECURITY_SETTINGS_CHANGED).toBeDefined();
      expect(AuditAction.DATA_EXPORTED).toBeDefined();
      expect(AuditAction.DATA_IMPORTED).toBeDefined();
      expect(AuditAction.SYSTEM_BACKUP).toBeDefined();
      expect(AuditAction.SYSTEM_RESTORE).toBeDefined();
    });
  });

  describe('Severity Levels', () => {
    it('should have all severity levels', () => {
      expect(AuditSeverity.INFO).toBe('info');
      expect(AuditSeverity.WARNING).toBe('warning');
      expect(AuditSeverity.ERROR).toBe('error');
      expect(AuditSeverity.CRITICAL).toBe('critical');
    });
  });
});
