/**
 * Two-Factor Authentication Setup Component
 */

'use client';

import { useState } from 'react';
import { Shield, QrCode, Copy, Download, Check, AlertCircle } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Alert, AlertDescription } from './alert';
import { Badge } from './badge';
import { twoFactorAuthService, generateBackupCodes } from '@/shared/lib/services/two-factor-auth.service';
import { toast } from 'sonner';

interface TwoFactorSetupProps {
  userId: string;
  userEmail: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ userId, userEmail, onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'init' | 'qrcode' | 'verify' | 'backup-codes'>('init');
  const [secret, setSecret] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInitSetup = async () => {
    setIsLoading(true);
    try {
      const setup = await twoFactorAuthService.setup(userId, userEmail);
      setSecret(setup.secret);
      setQrCodeUrl(setup.qrCodeUrl);
      setBackupCodes(setup.backupCodes);
      setStep('qrcode');
    } catch (error: any) {
      toast.error(error.message || '2FA kurulumu başlatılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Geçerli bir 6 haneli kod giriniz');
      return;
    }

    setIsLoading(true);
    try {
      const result = await twoFactorAuthService.verifyCode(userId, verificationCode);

      if (result.isValid) {
        await twoFactorAuthService.enable(userId, secret, backupCodes);
        setStep('backup-codes');
        toast.success('İki faktörlü doğrulama etkinleştirildi!');
      } else {
        toast.error('Geçersiz doğrulama kodu');
      }
    } catch (error: any) {
      toast.error(error.message || 'Doğrulama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı');
  };

  const downloadBackupCodes = () => {
    const content = `İki Faktörlü Doğrulama Yedek Kodları\n\nKullanıcı: ${userEmail}\nTarih: ${new Date().toLocaleDateString('tr-TR')}\n\nYedek Kodlar:\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nBu kodları güvenli bir yerde saklayın. Her kod yalnızca bir kez kullanılabilir.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>İki Faktörlü Doğrulama (2FA)</CardTitle>
              <CardDescription>
                Hesabınıza ekstra güvenlik katmanı ekleyin
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'init' && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  İki faktörlü doğrulama, hesabınıza giriş yaparken ek bir güvenlik katmanı ekler.
                  Giriş yaparken normal şifrenize ek olarak telefonunuzdan bir doğrulama kodu girmeniz gerekecektir.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">Nasıl Çalışır?</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Google Authenticator, Authy veya benzeri bir uygulama kullanacaksınız</li>
                  <li>Her 30 saniyede değişen 6 haneli bir kod alacaksınız</li>
                  <li>Bu kodu giriş yaparken şifrenizle birlikte gireceksiniz</li>
                  <li>10 adet yedek kod alacaksınız (telefonunuz kaybolduğunda)</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleInitSetup} disabled={isLoading}>
                  <Shield className="h-4 w-4 mr-2" />
                  {isLoading ? 'Başlatılıyor...' : '2FA Kurulumuna Başla'}
                </Button>
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    İptal
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 'qrcode' && (
            <div className="space-y-4">
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  Authenticator uygulamanızı açın ve bu QR kodu tarayın veya manuel olarak kod girin
                </AlertDescription>
              </Alert>

              <div className="flex flex-col items-center space-y-4">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="2FA QR Code" className="border rounded-lg" />
                )}

                <div className="space-y-2 w-full">
                  <Label>Manuel Kod</Label>
                  <div className="flex items-center gap-2">
                    <Input value={secret} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Doğrulama Kodu</Label>
                <div className="flex gap-2">
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="font-mono text-lg text-center tracking-widest"
                  />
                  <Button onClick={handleVerifyCode} disabled={isLoading || verificationCode.length !== 6}>
                    <Check className="h-4 w-4 mr-2" />
                    Doğrula
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Authenticator uygulamanızdan 6 haneli kodu girin
                </p>
              </div>
            </div>
          )}

          {step === 'backup-codes' && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Önemli:</strong> Bu yedek kodları güvenli bir yerde saklayın.
                  Telefonunuz kaybolduğunda bu kodları kullanarak hesabınıza giriş yapabilirsiniz.
                  Her kod yalnızca bir kez kullanılabilir.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Yedek Kodlar</Label>
                  <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <code className="font-mono text-sm">{code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleComplete}>
                  <Check className="h-4 w-4 mr-2" />
                  2FA Kurulumunu Tamamla
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
