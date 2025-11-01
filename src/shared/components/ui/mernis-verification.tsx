/**
 * Mernis (Turkish Identity) Verification Button Component
 */

'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Shield, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { useMernisVerification } from '@/shared/hooks/useMernisVerification';
import { formatTcKimlikNo, maskTcKimlikNo } from '@/shared/lib/services/mernis.service';
import { cn } from '@/shared/lib/utils';

interface MernisVerificationProps {
  tcKimlikNo: string;
  name?: string;
  surname?: string;
  birthYear?: number;
  onVerified?: (result: any) => void;
  className?: string;
  disabled?: boolean;
  showDetails?: boolean;
}

export function MernisVerificationButton({
  tcKimlikNo,
  name,
  surname,
  birthYear,
  onVerified,
  className,
  disabled = false,
  showDetails = true
}: MernisVerificationProps) {
  const { isVerifying, verificationResult, verifyIdentity } = useMernisVerification();
  const [showAllDetails, setShowAllDetails] = useState(false);

  const handleVerify = async () => {
    await verifyIdentity({
      tcKimlikNo,
      name,
      surname,
      birthYear
    });

    if (verificationResult?.isVerified) {
      onVerified?.(verificationResult);
    }
  };

  const isValid = verificationResult?.isValid ?? false;
  const isVerified = verificationResult?.isVerified ?? false;

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        type="button"
        variant={isVerified ? 'default' : 'outline'}
        size="sm"
        onClick={handleVerify}
        disabled={disabled || isVerifying || !tcKimlikNo}
        className={cn(
          isVerified && 'bg-green-600 hover:bg-green-700',
          isVerifying && 'cursor-wait'
        )}
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Doğrulanıyor...
          </>
        ) : isVerified ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Kimlik Doğrulandı
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-2" />
            Mernis ile Doğrula
          </>
        )}
      </Button>

      {showDetails && verificationResult && (
        <div
          className={cn(
            'p-3 rounded-md border text-sm',
            isVerified
              ? 'bg-green-50 border-green-200 text-green-800'
              : isValid
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-red-50 border-red-200 text-red-800'
          )}
        >
          <div className="flex items-start gap-2">
            {isVerified ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : isValid ? (
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 space-y-1">
              <p className="font-medium">{verificationResult.message}</p>

              {isVerified && verificationResult.citizenName && (
                <div className="text-xs space-y-0.5">
                  <p>
                    <span className="font-medium">TC Kimlik:</span>{' '}
                    {showAllDetails
                      ? formatTcKimlikNo(tcKimlikNo)
                      : maskTcKimlikNo(tcKimlikNo)}
                  </p>
                  <p>
                    <span className="font-medium">Ad Soyad:</span>{' '}
                    {verificationResult.citizenName} {verificationResult.citizenSurname}
                  </p>
                  {verificationResult.citizenBirthYear && (
                    <p>
                      <span className="font-medium">Doğum Yılı:</span>{' '}
                      {verificationResult.citizenBirthYear}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAllDetails(!showAllDetails)}
                    className="text-xs underline hover:no-underline mt-1"
                  >
                    {showAllDetails ? 'Gizle' : 'Detayları Göster'}
                  </button>
                </div>
              )}

              {verificationResult.error && (
                <p className="text-xs mt-1 whitespace-pre-line">
                  {verificationResult.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
