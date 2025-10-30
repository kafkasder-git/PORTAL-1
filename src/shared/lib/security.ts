import DOMPurify from 'isomorphic-dompurify';

// Input sanitization utilities
export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: [],
    });
  }

  static sanitizeText(input: string): string {
    // Remove potentially dangerous characters
    return input.replace(/[<>'"&]/g, '');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    // Turkish phone validation
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  static validateTCNo(tcNo: string): boolean {
    // Turkish ID number validation
    if (tcNo.length !== 11 || !/^\d+$/.test(tcNo)) return false;

    const digits = tcNo.split('').map(Number);
    const sum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    const checksum = (sum % 10 + digits[9]) % 10;

    return checksum === digits[10];
  }

  static escapeSql(input: string): string {
    // Basic SQL injection prevention (though we use Appwrite ORM)
    return input.replace(/['"\\]/g, '\\$&');
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();

  static checkLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  static getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 5;

    return Math.max(0, 5 - record.count);
  }

  static reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// File upload security
export class FileSecurity {
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
  ];

  private static readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Desteklenmeyen dosya türü: ${file.type}`,
      };
    }

    // Check file size
    if (file.size > this.MAX_SIZE) {
      return {
        valid: false,
        error: `Dosya boyutu çok büyük. Maksimum: ${this.MAX_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Check file name for path traversal
    const fileName = file.name;
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return {
        valid: false,
        error: 'Geçersiz dosya adı',
      };
    }

    return { valid: true };
  }

  static sanitizeFileName(fileName: string): string {
    // Remove potentially dangerous characters
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  static async scanForMalware(file: File): Promise<{ safe: boolean; error?: string }> {
    // Basic malware scanning (in production, use a proper AV service)
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for common malware signatures
    const malwareSignatures = [
      [0x4D, 0x5A], // MZ header (Windows executable)
      [0x7F, 0x45, 0x4C, 0x46], // ELF header (Linux executable)
    ];

    for (const signature of malwareSignatures) {
      if (signature.every((byte, index) => bytes[index] === byte)) {
        return {
          safe: false,
          error: 'Şüpheli dosya içeriği tespit edildi',
        };
      }
    }

    return { safe: true };
  }
}

// Audit logging
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'success' | 'failure';
  error?: string;
}

export class AuditLogger {
  private static logs: AuditLog[] = [];
  private static maxLogs = 1000; // Keep last 1000 logs in memory

  static log(logData: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const auditLog: AuditLog = {
      ...logData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    this.logs.push(auditLog);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 AUDIT:', JSON.stringify(auditLog));
      // TODO: Send to external logging service
      // auditService.send(auditLog);
    } else {
      console.log('🔍 AUDIT:', auditLog.action, auditLog.resource, auditLog.status);
    }
  }

  static getLogs(userId?: string, limit: number = 100): AuditLog[] {
    let filteredLogs = this.logs;

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    return filteredLogs.slice(-limit).reverse();
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// CSRF protection
export class CSRFProtection {
  static generateToken(): string {
    return crypto.randomUUID();
  }

  static validateToken(sessionToken: string | null, requestToken: string | null): boolean {
    if (!sessionToken || !requestToken) return false;
    return sessionToken === requestToken;
  }
}

// Password security
export class PasswordSecurity {
  static validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Test ortamı için gevşetilmiş kurallar
    if (process.env.NODE_ENV === 'development') {
      if (password.length < 6) {
        errors.push('Şifre en az 6 karakter olmalıdır');
      }
      return {
        valid: errors.length === 0,
        errors,
      };
    }

    // Production ortamı için sıkı kurallar
    if (password.length < 8) {
      errors.push('Şifre en az 8 karakter olmalıdır');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    }

    if (!/\d/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Şifre en az bir özel karakter içermelidir');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static generateSecurePassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }
}
