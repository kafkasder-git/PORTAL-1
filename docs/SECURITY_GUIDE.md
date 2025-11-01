# Security Enhancement Guide

## Overview

This document covers the security enhancements implemented in the Dernek Yönetim Sistemi, including Two-Factor Authentication (2FA) and comprehensive Audit Logging.

## Table of Contents

1. [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
2. [Audit Logging System](#audit-logging-system)
3. [Security Best Practices](#security-best-practices)
4. [Implementation Details](#implementation-details)
5. [API Documentation](#api-documentation)

---

## Two-Factor Authentication (2FA)

### Overview

Two-Factor Authentication adds an extra layer of security to user accounts by requiring a second form of verification beyond the password. This system uses TOTP (Time-based One-Time Password) algorithm, compatible with popular authenticator apps.

### Features

- **TOTP Support**: Works with Google Authenticator, Authy, Microsoft Authenticator, and other TOTP-compatible apps
- **QR Code Setup**: Easy QR code scanning for quick app configuration
- **Manual Entry**: Manual secret key entry as fallback
- **Backup Codes**: 10 unique backup codes for account recovery
- **Secure Storage**: Encrypted storage of secrets and backup codes

### How It Works

1. **Setup Process**:
   - User initiates 2FA setup in their profile/settings
   - System generates a unique secret key
   - QR code is displayed for easy authenticator app setup
   - User verifies setup by entering a code from their app
   - Backup codes are generated and provided

2. **Login Process**:
   - User enters email and password
   - System prompts for 2FA code
   - User enters the 6-digit code from their authenticator app
   - System validates the code against the stored secret
   - Alternative: User can use one of their backup codes

3. **Backup Codes**:
   - 10 unique 8-character codes provided
   - Each code can be used only once
   - Codes format: XXXX-XXXX
   - Should be stored securely offline

### Supported Authenticator Apps

- Google Authenticator (iOS/Android)
- Authy (iOS/Android/Web)
- Microsoft Authenticator (iOS/Android)
- 1Password (iOS/Android/Web)
- LastPass Authenticator (iOS/Android)
- Any TOTP-compatible application

### Security Considerations

#### What 2FA Protects Against

✅ **Password Breaches**: Even if password is compromised, attacker needs the second factor
✅ **Phishing Attacks**: Temporary codes can't be reused
✅ **Credential Stuffing**: Automated attacks require both factors
✅ **Unauthorized Access**: Extra verification layer for sensitive operations

❌ What 2FA Doesn't Protect Against

- **Phishing with Real-time Code Interception**: If user enters code on fake site
- **SIM Swapping**: If attacker controls your phone number
- **Malware on Device**: If authenticator app is compromised
- **Social Engineering**: If user is tricked into revealing codes

### Best Practices

1. **For Users**:
   - Enable 2FA on all important accounts
   - Store backup codes in a secure, offline location
   - Never share 2FA codes with anyone
   - Use official authenticator apps only
   - Update recovery email/phone before enabling 2FA

2. **For Administrators**:
   - Enable 2FA for all admin accounts
   - Enforce 2FA for high-privilege users
   - Monitor failed 2FA attempts
   - Provide backup code recovery process
   - Regular security audits

---

## Audit Logging System

### Overview

The Audit Logging System tracks and records all important system activities for security monitoring, compliance, and forensic analysis.

### Features

- **Comprehensive Tracking**: Logs all CRUD operations, authentication events, and system changes
- **Multiple Severity Levels**: Info, Warning, Error, and Critical classifications
- **Rich Metadata**: Includes user info, IP address, user agent, and timestamps
- **Filtering & Search**: Advanced filtering by user, action, resource, date range
- **Export Capabilities**: CSV export for external analysis
- **Retention Policies**: Automatic cleanup of old logs
- **Real-time Monitoring**: Critical events trigger immediate alerts

### Log Categories

#### Authentication Events
- Successful/failed logins
- Logouts
- Password changes
- Password resets
- 2FA enable/disable
- 2FA verification attempts
- Backup code usage

#### User Management
- User creation/updates/deletion
- Role changes
- Permission modifications
- Profile updates

#### Data Operations
- Beneficiary records (create/update/delete/view)
- Donations (create/approve/reject)
- Aid applications (submit/approve/reject)
- Tasks (create/assign/complete)
- Meetings (create/update/cancel)

#### Document Management
- File uploads/downloads
- File sharing
- File deletions

#### Workflow Operations
- Workflow creation/updates/deletion
- Workflow executions
- Workflow triggers

#### System Events
- Settings changes
- Security configuration updates
- Data exports/imports
- System backups/restores

### Severity Levels

#### 🔵 INFO (Blue)
- Routine operations
- Successful logins
- Data views
- Normal CRUD operations

**Example**:
```
[INFO] User john@example.com created a new meeting
Timestamp: 2025-11-01 14:30:00
IP: 192.168.1.100
```

#### 🟡 WARNING (Yellow)
- Suspicious activities
- Failed operations (non-critical)
- Bulk operations
- Delete operations

**Example**:
```
[WARNING] User admin@example.com deleted 50 beneficiary records
Timestamp: 2025-11-01 15:45:00
IP: 192.168.1.100
Details: {reason: 'data cleanup'}
```

#### 🔴 ERROR (Red)
- Failed login attempts
- Permission denials
- Validation failures
- System errors

**Example**:
```
[ERROR] Failed login attempt for invalid@example.com
Timestamp: 2025-11-01 16:00:00
IP: 203.0.113.42
Details: {reason: 'invalid_credentials'}
```

#### ⚫ CRITICAL (Black)
- Security breaches
- Unauthorized access attempts
- 2FA bypass attempts
- System configuration changes
- Data breaches

**Example**:
```
[CRITICAL] 2FA disabled for admin@example.com
Timestamp: 2025-11-01 17:15:00
IP: 192.168.1.100
Details: {action: 'security_disabled', user: 'admin@example.com'}
```

### Log Structure

Each audit log entry contains:

```typescript
{
  id: string;                    // Unique log ID
  userId?: string;               // User ID (if applicable)
  userEmail?: string;            // User email
  action: AuditAction;           // Type of action
  severity: AuditSeverity;       // Severity level
  resource?: string;             // Resource type (e.g., 'user', 'meeting')
  resourceId?: string;           // Resource ID
  details?: Record<string, any>; // Additional details
  ipAddress?: string;            // Client IP address
  userAgent?: string;            // Client user agent
  timestamp: string;             // ISO 8601 timestamp
  metadata?: {
    oldValues?: Record<string, any>;  // Previous values (for updates)
    newValues?: Record<string, any>;  // New values (for updates)
    reason?: string;                  // Reason for action
    sessionId?: string;              // Session identifier
  };
}
```

### Filtering & Search

#### Available Filters
- User ID or email
- Action type (login, create, update, delete, etc.)
- Severity level (info, warning, error, critical)
- Resource type (user, meeting, task, etc.)
- Date range (start and end dates)
- IP address

#### Search Capabilities
- Text search across all fields
- Case-insensitive matching
- Partial match support
- Multiple criteria combination

### Export & Analysis

#### Export Formats
- **CSV**: Comma-separated values for spreadsheet analysis
- **JSON**: Machine-readable format
- **PDF**: Human-readable reports

#### Export Features
- Filtered exports (based on current filter selection)
- Full database export
- Scheduled exports
- Automated delivery to external systems

### Retention Policy

#### Default Retention
- **Active logs**: 1 year
- **Critical logs**: 5 years
- **Archived logs**: Moved to cold storage

#### Cleanup Process
- Automatic daily cleanup job
- Configurable retention periods
- Secure deletion of expired logs
- Compliance with data protection regulations

### Monitoring & Alerts

#### Real-time Alerts
Critical events trigger immediate notifications:

1. **Failed Login Attempts**: 5+ failures in 10 minutes from same IP
2. **Privilege Escalation**: Role/permission changes
3. **Bulk Operations**: Large-scale data modifications
4. **2FA Events**: Enable/disable, backup code usage
5. **System Changes**: Security settings modifications

#### Alert Channels
- In-app notifications
- Email alerts (for critical events)
- Webhook integration (for SIEM systems)
- SMS alerts (optional, for highest priority)

### Privacy & Compliance

#### Data Protection
- Logs are encrypted at rest
- Personal data is minimized
- Access control for log viewing
- Audit trail for log access

#### Compliance Standards
- **GDPR**: Right to erasure applies (with exceptions for legal requirements)
- **SOX**: Financial data access tracking
- **ISO 27001**: Information security management
- **HIPAA**: Healthcare data protection (if applicable)

### Use Cases

#### Security Incident Investigation
Track the sequence of events leading to a security incident:

```
Example Investigation Flow:
1. [CRITICAL] Unauthorized access attempt detected
2. [ERROR] Failed login from suspicious IP
3. [WARNING] Multiple resource access attempts
4. [ERROR] Permission denied for restricted resource
5. [INFO] Session terminated
```

#### Compliance Reporting
Generate reports for auditors and regulators:

- User access logs
- Data modification history
- System configuration changes
- Security policy enforcement

#### Performance Analysis
Understand system usage patterns:

- Most active users
- Frequently accessed resources
- Peak usage times
- Feature adoption rates

---

## Security Best Practices

### For Developers

1. **Always Log Security Events**:
   - Authentication attempts
   - Authorization failures
   - Data modifications
   - Configuration changes

2. **Use the Audit Logger**:
   ```typescript
   // Good: Use the audit logger
   await auditLogger.create(
     AuditAction.USER_CREATED,
     userId,
     userEmail,
     'user',
     userId,
     userData
   );

   // Bad: Don't forget to log
   await createUser(userData);
   ```

3. **Sanitize Log Data**:
   - Never log sensitive information (passwords, tokens)
   - Mask PII where possible
   - Validate input before logging

4. **Handle Errors Gracefully**:
   ```typescript
   try {
     await riskyOperation();
   } catch (error) {
     await auditLogger.error(
       AuditAction.OPERATION_FAILED,
       userId,
       userEmail,
       error.message
     );
     throw error;
   }
   ```

### For Administrators

1. **Enable 2FA**:
   - All admin accounts must have 2FA enabled
   - Enforce 2FA for users with sensitive data access
   - Regular 2FA compliance audits

2. **Monitor Logs Daily**:
   - Review critical logs
   - Check for suspicious patterns
   - Investigate anomalies promptly

3. **Implement Alerting**:
   - Configure real-time alerts for critical events
   - Set up escalation procedures
   - Test alert systems regularly

4. **Regular Security Reviews**:
   - Monthly log analysis
   - Quarterly permission audits
   - Annual security assessments

### For End Users

1. **Enable 2FA**:
   - Use on all important accounts
   - Keep backup codes safe
   - Update recovery options

2. **Strong Passwords**:
   - At least 12 characters
   - Mix of letters, numbers, symbols
   - Unique for each account
   - Use a password manager

3. **Secure Practices**:
   - Lock workstation when away
   - Don't share credentials
   - Report suspicious activity
   - Log out from shared devices

---

## Implementation Details

### File Structure

```
src/
├── shared/
│   ├── lib/
│   │   └── services/
│   │       ├── two-factor-auth.service.ts
│   │       └── audit-log.service.ts
│   └── components/
│       └── ui/
│           └── two-factor-setup.tsx
├── features/
│   └── audit/
│       └── components/
│           └── AuditLogViewer.tsx
└── app/
    ├── api/
    │   ├── 2fa/
    │   │   ├── setup/
    │   │   │   └── route.ts
    │   │   ├── verify/
    │   │   │   └── route.ts
    │   │   └── enable/
    │   │       └── route.ts
    │   └── audit-logs/
    │       └── route.ts
    └── (dashboard)/
        └── audit-logs/
            └── page.tsx
```

### Database Schema (Production)

#### 2FA Collection (Appwrite)
```json
{
  "id": "string (primary key)",
  "userId": "string (foreign key)",
  "secret": "string (encrypted)",
  "backupCodes": "array<string> (encrypted)",
  "isEnabled": "boolean",
  "enabledAt": "datetime",
  "lastUsed": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Audit Logs Collection (Appwrite)
```json
{
  "id": "string (primary key)",
  "userId": "string (optional)",
  "userEmail": "string (optional)",
  "action": "string",
  "severity": "string",
  "resource": "string (optional)",
  "resourceId": "string (optional)",
  "details": "object (optional)",
  "ipAddress": "string (optional)",
  "userAgent": "string (optional)",
  "metadata": "object (optional)",
  "timestamp": "datetime",
  "indexes": [
    "userId",
    "action",
    "severity",
    "timestamp",
    "resource"
  ]
}
```

### Configuration

#### Environment Variables
```bash
# 2FA Configuration
TOTP_ISSUER="Dernek Yönetim Sistemi"
TOTP_WINDOW=1  # Allow 1 time step drift

# Audit Logging
AUDIT_RETENTION_DAYS=365
AUDIT_CRITICAL_RETENTION_DAYS=1825
AUDIT_CLEANUP_ENABLED=true

# Security
FAILED_LOGIN_THRESHOLD=5
FAILED_LOGIN_WINDOW=600  # 10 minutes in seconds
SESSION_TIMEOUT=3600  # 1 hour in seconds
```

### Integration Points

#### Authentication Flow
1. User enters credentials
2. Server validates credentials
3. If 2FA enabled, server prompts for code
4. User enters 2FA code
5. Server validates 2FA code
6. Both validations passed → create session
7. Log successful login

#### Audit Logging Integration
```typescript
// Middleware pattern (conceptual)
async function withAuditLogging(handler, action) {
  return async (request) => {
    const userId = await getCurrentUserId(request);
    const result = await handler(request);

    if (result.ok) {
      await auditLogger.create(action, userId, ...result.data);
    }

    return result;
  };
}
```

---

## API Documentation

### 2FA Endpoints

#### Setup 2FA
```
POST /api/2fa/setup
Content-Type: application/json

Request Body:
{
  "userId": "string",
  "userEmail": "string"
}

Response:
{
  "success": true,
  "data": {
    "secret": "string",
    "qrCodeUrl": "data:image/png;base64,...",
    "backupCodes": ["XXXX-XXXX", ...]
  }
}
```

#### Verify 2FA Code
```
POST /api/2fa/verify
Content-Type: application/json

Request Body:
{
  "userId": "string",
  "code": "string"
}

Response:
{
  "success": true,
  "data": {
    "verified": true,
    "backupCode": false
  }
}
```

#### Enable 2FA
```
POST /api/2fa/enable
Content-Type: application/json

Request Body:
{
  "userId": "string",
  "secret": "string",
  "backupCodes": ["string"]
}

Response:
{
  "success": true,
  "message": "2FA başarıyla etkinleştirildi"
}
```

### Audit Log Endpoints

#### Get Audit Logs
```
GET /api/audit-logs?userId=...&action=...&severity=...&startDate=...&endDate=...

Query Parameters:
- userId: Filter by user ID
- action: Filter by action type
- severity: Filter by severity (info, warning, error, critical)
- resource: Filter by resource type
- startDate: Filter by start date (ISO 8601)
- endDate: Filter by end date (ISO 8601)
- page: Page number (default: 1)
- limit: Items per page (default: 50)

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "action": "string",
      "severity": "string",
      "userEmail": "string",
      "timestamp": "string",
      ...
    }
  ]
}
```

#### Create Audit Log (System Use)
```
POST /api/audit-logs
Content-Type: application/json

Request Body:
{
  "action": "string",
  "severity": "string",
  "userId": "string",
  "userEmail": "string",
  "resource": "string",
  "resourceId": "string",
  "details": "object",
  "metadata": "object"
}

Response:
{
  "success": true,
  "message": "Denetim kaydı oluşturuldu"
}
```

---

## Future Enhancements

### Planned Features

1. **Biometric Authentication**:
   - Fingerprint support
   - Face recognition
   - WebAuthn integration

2. **Advanced Audit Analytics**:
   - Machine learning anomaly detection
   - Behavioral analysis
   - Predictive security alerts

3. **Enhanced 2FA Options**:
   - SMS-based 2FA
   - Email-based 2FA
   - Hardware token support (YubiKey)

4. **Compliance Reporting**:
   - Automated compliance reports
   - Custom report builder
   - Scheduled report delivery

5. **Security Dashboard**:
   - Real-time security metrics
   - Threat intelligence integration
   - Security score calculation

### Integration Roadmap

- **SIEM Integration**: Splunk, IBM QRadar, ArcSight
- **Identity Providers**: Okta, Azure AD, Auth0
- **Communication**: Slack, Microsoft Teams notifications
- **Ticketing**: Jira, ServiceNow integration

---

## Support & Resources

### Documentation
- [Security Best Practices](./SECURITY_BEST_PRACTICES.md)
- [Compliance Guide](./COMPLIANCE_GUIDE.md)
- [Incident Response Plan](./INCIDENT_RESPONSE.md)

### External Resources
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP Security Guidelines](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [TOTP Algorithm RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)

---

*Last Updated: November 2025*
*Version: 1.0*
