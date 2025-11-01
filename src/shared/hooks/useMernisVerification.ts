/**
 * React Hook for Mernis (Turkish Identity) Verification
 */

import { useState } from 'react';
import { verifyWithMernis, type MernisVerificationRequest, type MernisVerificationResult } from '@/shared/lib/services/mernis.service';

export interface UseMernisVerificationReturn {
  isVerifying: boolean;
  verificationResult: MernisVerificationResult | null;
  verifyIdentity: (request: MernisVerificationRequest) => Promise<void>;
  clearVerification: () => void;
}

/**
 * Hook for verifying Turkish identity with Mernis
 */
export function useMernisVerification(): UseMernisVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<MernisVerificationResult | null>(null);

  const verifyIdentity = async (request: MernisVerificationRequest) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyWithMernis(request);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        isValid: false,
        isVerified: false,
        message: 'Doğrulama işlemi başarısız',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const clearVerification = () => {
    setVerificationResult(null);
  };

  return {
    isVerifying,
    verificationResult,
    verifyIdentity,
    clearVerification
  };
}
