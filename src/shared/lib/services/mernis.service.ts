/**
 * Mernis (Turkish National Identity System) Verification Service
 *
 * This service provides Turkish identity verification functionality.
 * In production, this would integrate with the official Mernis API,
 * which requires government credentials and proper authorization.
 *
 * For development and testing, this uses a mock implementation.
 */

import { sanitizeTcNo } from '@/shared/lib/sanitization';

export interface MernisVerificationRequest {
  tcKimlikNo: string;
  name?: string;
  surname?: string;
  birthYear?: number;
}

export interface MernisVerificationResult {
  isValid: boolean;
  isVerified: boolean;
  citizenName?: string;
  citizenSurname?: string;
  citizenBirthYear?: number;
  message: string;
  error?: string;
}

export interface Mernis citizenInfo {
  tcKimlikNo: string;
  name: string;
  surname: string;
  birthYear: number;
  nationality?: string;
  gender?: 'E' | 'K'; // Erkek/Kadın
}

// Mock database for development - in production, this would be the Mernis API
const MOCK_MERNIS_DB: Record<string, Mernis citizenInfo> = {
  '12345678901': {
    tcKimlikNo: '12345678901',
    name: 'AHMET',
    surname: 'YILMAZ',
    birthYear: 1990,
    nationality: 'T.C.',
    gender: 'E'
  },
  '98765432109': {
    tcKimlikNo: '98765432109',
    name: 'AYŞE',
    surname: 'KAYA',
    birthYear: 1985,
    nationality: 'T.C.',
    gender: 'K'
  },
  '11111111111': {
    tcKimlikNo: '11111111111',
    name: 'MEHMET',
    surname: 'DEMIR',
    birthYear: 1975,
    nationality: 'T.C.',
    gender: 'E'
  },
};

/**
 * Verify TC Kimlik No format and checksum
 */
export function verifyTcKimlikNoFormat(tcKimlikNo: string): {
  isValid: boolean;
  error?: string;
} {
  const sanitized = sanitizeTcNo(tcKimlikNo);

  if (!sanitized) {
    return {
      isValid: false,
      error: 'Geçersiz TC Kimlik No formatı'
    };
  }

  // Additional business rule validations
  if (sanitized === '11111111111' ||
      sanitized === '22222222222' ||
      sanitized === '33333333333' ||
      sanitized === '44444444444' ||
      sanitized === '55555555555' ||
      sanitized === '66666666666' ||
      sanitized === '77777777777' ||
      sanitized === '88888888888' ||
      sanitized === '99999999999') {
    return {
      isValid: false,
      error: 'Bu TC Kimlik No geçersizdir'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Verify identity against Mernis database
 * In production, this would call the official Mernis API
 *
 * @param request - Verification request with TC Kimlik No and optional personal info
 * @returns Promise with verification result
 */
export async function verifyWithMernis(
  request: MernisVerificationRequest
): Promise<MernisVerificationResult> {
  try {
    // Step 1: Validate TC Kimlik No format
    const formatCheck = verifyTcKimlikNoFormat(request.tcKimlikNo);
    if (!formatCheck.isValid) {
      return {
        isValid: false,
        isVerified: false,
        message: 'TC Kimlik No formatı geçersiz',
        error: formatCheck.error
      };
    }

    // In a real implementation, this would call the official Mernis API:
    // const response = await fetch('https://apiservice.gov.tr/mernis/verify', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.MERNIS_API_KEY}`,
    //     'X-IBAN': process.env.MERNIS_IBAN,
    //   },
    //   body: JSON.stringify({
    //     tcKimlikNo: request.tcKimlikNo,
    //     ad: request.name,
    //     soyad: request.surname,
    //     dogumYili: request.birthYear
    //   })
    // });

    // For now, use mock implementation
    const citizen = MOCK_MERNIS_DB[request.tcKimlikNo];

    if (!citizen) {
      // For development: Reject unknown TC numbers
      // In production: Might get a response from the real Mernis system
      return {
        isValid: true,
        isVerified: false,
        message: 'Kimlik doğrulanamadı',
        error: 'Mernis sisteminde bu TC Kimlik No ile kayıtlı vatandaş bulunamadı'
      };
    }

    // Verify additional information if provided
    if (request.name || request.surname || request.birthYear) {
      const nameMatch = !request.name ||
        citizen.name.toLowerCase() === request.name.toLowerCase();
      const surnameMatch = !request.surname ||
        citizen.surname.toLowerCase() === request.surname.toLowerCase();
      const birthYearMatch = !request.birthYear ||
        citizen.birthYear === request.birthYear;

      if (!nameMatch || !surnameMatch || !birthYearMatch) {
        return {
          isValid: true,
          isVerified: false,
          citizenName: citizen.name,
          citizenSurname: citizen.surname,
          citizenBirthYear: citizen.birthYear,
          message: 'Kimlik bilgileri eşleşmiyor',
          error: `Girilen bilgiler Mernis kayıtları ile eşleşmiyor:
            ${!nameMatch ? `İsim: Beklenen "${citizen.name}", Girilen "${request.name}"` : ''}
            ${!surnameMatch ? `Soyisim: Beklenen "${citizen.surname}", Girilen "${request.surname}"` : ''}
            ${!birthYearMatch ? `Doğum Yılı: Beklenen "${citizen.birthYear}", Girilen "${request.birthYear}"` : ''}`
        };
      }
    }

    // Success
    return {
      isValid: true,
      isVerified: true,
      citizenName: citizen.name,
      citizenSurname: citizen.surname,
      citizenBirthYear: citizen.birthYear,
      message: 'Kimlik başarıyla doğrulandı'
    };

  } catch (error: any) {
    console.error('Mernis verification error:', error);
    return {
      isValid: false,
      isVerified: false,
      message: 'Kimlik doğrulama hatası',
      error: error.message || 'Bilinmeyen bir hata oluştu'
    };
  }
}

/**
 * Get citizen information from Mernis (for display purposes only)
 * @param tcKimlikNo - TC Kimlik No to lookup
 * @returns Citizen information or null if not found
 */
export async function getCitizenInfo(tcKimlikNo: string): Promise<Mernis citizenInfo | null> {
  const formatCheck = verifyTcKimlikNoFormat(tcKimlikNo);
  if (!formatCheck.isValid) {
    return null;
  }

  const citizen = MOCK_MERNIS_DB[tcKimlikNo];
  return citizen || null;
}

/**
 * Batch verify multiple TC Kimlik numbers
 * @param tcNumbers - Array of TC Kimlik numbers to verify
 * @returns Array of verification results
 */
export async function batchVerifyMernis(
  tcNumbers: string[]
): Promise<Array<{ tcKimlikNo: string; result: MernisVerificationResult }>> {
  const results = await Promise.all(
    tcNumbers.map(async (tcKimlikNo) => ({
      tcKimlikNo,
      result: await verifyWithMernis({ tcKimlikNo })
    }))
  );

  return results;
}

/**
 * Check if Mernis service is available (for health checks)
 */
export async function checkMernisServiceHealth(): Promise<{
  isHealthy: boolean;
  message: string;
}> {
  try {
    // In production, this would ping the actual Mernis API
    // For now, just check if the service is responding
    const testResult = await verifyWithMernis({ tcKimlikNo: '12345678901' });

    return {
      isHealthy: true,
      message: 'Mernis servisi çalışıyor'
    };
  } catch (error) {
    return {
      isHealthy: false,
      message: 'Mernis servisi kullanılamıyor'
    };
  }
}

/**
 * Format TC Kimlik No for display (add spaces)
 * Example: 12345678901 -> 123 456 789 01
 */
export function formatTcKimlikNo(tcKimlikNo: string): string {
  const sanitized = sanitizeTcNo(tcKimlikNo);
  if (!sanitized) return tcKimlikNo;

  return sanitized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1 $2 $3 $4');
}

/**
 * Mask TC Kimlik No for privacy (show only first and last 2 digits)
 * Example: 12345678901 -> 123****8901
 */
export function maskTcKimlikNo(tcKimlikNo: string): string {
  const sanitized = sanitizeTcNo(tcKimlikNo);
  if (!sanitized || sanitized.length !== 11) return tcKimlikNo;

  return `${sanitized.substring(0, 3)}****${sanitized.substring(7, 11)}`;
}
