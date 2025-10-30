/**
 * Error Handling and Messages Library
 * Standardized error handling with Turkish error messages
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication Errors
export class AuthenticationError extends AppError {
  constructor(message: string = 'Kimlik doğrulama hatası', details?: any) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Bu işlem için yetkiniz yok', details?: any) {
    super(message, 'UNAUTHORIZED', 403, details);
    this.name = 'UnauthorizedError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Email veya şifre hatalı', details?: any) {
    super(message, 'INVALID_CREDENTIALS', 401, details);
    this.name = 'InvalidCredentialsError';
  }
}

export class SessionExpiredError extends AppError {
  constructor(message: string = 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın', details?: any) {
    super(message, 'SESSION_EXPIRED', 401, details);
    this.name = 'SessionExpiredError';
  }
}

// Validation Errors
export class ValidationError extends AppError {
  constructor(message: string = 'Girilen bilgiler geçersiz', details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class InvalidInputError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'INVALID_INPUT', 400, details);
    this.name = 'InvalidInputError';
  }
}

// Resource Errors
export class NotFoundError extends AppError {
  constructor(resource: string = 'Kayıt', details?: any) {
    super(`${resource} bulunamadı`, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends AppError {
  constructor(message: string = 'Bu kayıt zaten mevcut', details?: any) {
    super(message, 'DUPLICATE', 409, details);
    this.name = 'DuplicateError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'İşlem çakışması oluştu', details?: any) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

// Rate Limiting Errors
export class RateLimitError extends AppError {
  constructor(message: string = 'Çok fazla istek gönderdiniz. Lütfen bekleyin', public retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// File Upload Errors
export class FileUploadError extends AppError {
  constructor(message: string = 'Dosya yükleme hatası', details?: any) {
    super(message, 'FILE_UPLOAD_ERROR', 400, details);
    this.name = 'FileUploadError';
  }
}

export class FileSizeError extends AppError {
  constructor(maxSize: number, details?: any) {
    super(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`, 'FILE_SIZE_ERROR', 400, details);
    this.name = 'FileSizeError';
  }
}

export class FileTypeError extends AppError {
  constructor(message: string = 'Desteklenmeyen dosya türü', details?: any) {
    super(message, 'FILE_TYPE_ERROR', 400, details);
    this.name = 'FileTypeError';
  }
}

// Database Errors
export class DatabaseError extends AppError {
  constructor(message: string = 'Veritabanı hatası oluştu', details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

// External Service Errors
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string = 'Harici servis hatası', details?: any) {
    super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, details);
    this.name = 'ExternalServiceError';
  }
}

export class EmailServiceError extends AppError {
  constructor(message: string = 'Email gönderimi başarısız', details?: any) {
    super(message, 'EMAIL_ERROR', 500, details);
    this.name = 'EmailServiceError';
  }
}

export class SmsServiceError extends AppError {
  constructor(message: string = 'SMS gönderimi başarısız', details?: any) {
    super(message, 'SMS_ERROR', 500, details);
    this.name = 'SmsServiceError';
  }
}

// Business Logic Errors
export class InsufficientBalanceError extends AppError {
  constructor(message: string = 'Yetersiz bakiye', details?: any) {
    super(message, 'INSUFFICIENT_BALANCE', 400, details);
    this.name = 'InsufficientBalanceError';
  }
}

export class InvalidStatusError extends AppError {
  constructor(message: string = 'Geçersiz durum', details?: any) {
    super(message, 'INVALID_STATUS', 400, details);
    this.name = 'InvalidStatusError';
  }
}

// Generic Errors
export class BadRequestError extends AppError {
  constructor(message: string = 'Geçersiz istek', details?: any) {
    super(message, 'BAD_REQUEST', 400, details);
    this.name = 'BadRequestError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin', details?: any) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details);
    this.name = 'InternalServerError';
  }
}

/**
 * Error message translations
 * Maps common error codes to Turkish messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Appwrite error codes
  '401': 'Kimlik doğrulama hatası. Lütfen tekrar giriş yapın',
  '403': 'Bu işlem için yetkiniz yok',
  '404': 'İstenilen kayıt bulunamadı',
  '409': 'Bu kayıt zaten mevcut',
  '429': 'Çok fazla istek. Lütfen bekleyin',
  '500': 'Sunucu hatası. Lütfen daha sonra tekrar deneyin',
  '503': 'Servis şu anda kullanılamıyor',

  // Custom error codes
  'user_already_exists': 'Bu email adresi zaten kayıtlı',
  'user_not_found': 'Kullanıcı bulunamadı',
  'user_blocked': 'Hesabınız bloke edilmiştir. Lütfen yöneticinizle iletişime geçin',
  'user_invalid_credentials': 'Email veya şifre hatalı',
  'user_invalid_token': 'Geçersiz veya süresi dolmuş token',
  'user_session_not_found': 'Oturum bulunamadı. Lütfen tekrar giriş yapın',
  'user_session_already_exists': 'Aktif bir oturumunuz zaten var',
  'user_password_mismatch': 'Mevcut şifreniz hatalı',
  'user_password_recently_used': 'Bu şifreyi daha önce kullandınız',
  'user_count_exceeded': 'Maksimum kullanıcı sayısına ulaşıldı',
  'user_unauthorized': 'Bu işlem için yetkiniz yok',

  // Collection errors
  'collection_not_found': 'Koleksiyon bulunamadı',
  'document_not_found': 'Kayıt bulunamadı',
  'document_already_exists': 'Bu kayıt zaten mevcut',
  'document_invalid_structure': 'Geçersiz veri yapısı',
  'document_missing_payload': 'Eksik veri',
  'document_update_conflict': 'Kayıt güncellenirken çakışma oluştu',

  // Storage errors
  'storage_file_not_found': 'Dosya bulunamadı',
  'storage_invalid_file_size': 'Dosya boyutu çok büyük',
  'storage_invalid_file_type': 'Desteklenmeyen dosya türü',
  'storage_device_not_found': 'Depolama alanı bulunamadı',
  'storage_file_already_exists': 'Bu dosya zaten mevcut',

  // Database errors
  'database_not_found': 'Veritabanı bulunamadı',
  'database_already_exists': 'Veritabanı zaten mevcut',
  'database_timeout': 'Veritabanı zaman aşımı',

  // General errors
  'general_unknown': 'Bilinmeyen bir hata oluştu',
  'general_mock': 'Mock servis hatası',
  'general_argument_invalid': 'Geçersiz parametre',
  'general_query_limit_exceeded': 'Sorgu limiti aşıldı',
  'general_query_invalid': 'Geçersiz sorgu',
  'general_cursor_not_found': 'İmleç bulunamadı',
  'general_server_error': 'Sunucu hatası',
  'general_protocol_unsupported': 'Desteklenmeyen protokol',
  'general_rate_limit_exceeded': 'İstek limiti aşıldı',
};

/**
 * Translate error code to Turkish message
 */
export function translateError(code: string | number): string {
  const codeStr = String(code);
  return ERROR_MESSAGES[codeStr] || ERROR_MESSAGES['general_unknown'];
}

/**
 * Parse and format error for user display
 */
export function formatErrorMessage(error: any): string {
  // Handle AppError instances
  if (error instanceof AppError) {
    return error.message;
  }

  // Handle Appwrite errors
  if (error?.code) {
    const translated = translateError(error.code);
    if (translated !== ERROR_MESSAGES['general_unknown']) {
      return translated;
    }
  }

  // Handle HTTP status codes
  if (error?.status || error?.statusCode) {
    const status = error.status || error.statusCode;
    const translated = translateError(status);
    if (translated !== ERROR_MESSAGES['general_unknown']) {
      return translated;
    }
  }

  // Handle error message
  if (error?.message) {
    return error.message;
  }

  // Default
  return ERROR_MESSAGES['general_unknown'];
}

/**
 * Log error for debugging (in development) and monitoring (in production)
 */
export function logError(error: any, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`❌ Error${context ? ` in ${context}` : ''}`);
    console.error('Message:', error?.message || error);
    console.error('Code:', error?.code);
    console.error('Status:', error?.status || error?.statusCode);
    console.error('Details:', error?.details);
    console.error('Stack:', error?.stack);
    console.groupEnd();
  } else {
    // In production, you would send this to a monitoring service like Sentry
    console.error(`Error${context ? ` in ${context}` : ''}:`, {
      message: error?.message,
      code: error?.code,
      status: error?.status || error?.statusCode,
      // Don't log stack traces in production to avoid exposing internals
    });
  }
}

/**
 * Create error response for API routes
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export function createErrorResponse(error: any): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  return {
    success: false,
    error: formatErrorMessage(error),
    code: error?.code || 'UNKNOWN_ERROR',
  };
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling<T>(
  handler: (...args: any[]) => Promise<T>,
  context?: string
) {
  return async (...args: any[]): Promise<T> => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  };
}
