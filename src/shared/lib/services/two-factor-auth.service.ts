/**
 * Two-Factor Authentication (2FA) Service
 * Implements TOTP (Time-based One-Time Password) using authenticator apps
 */

import { appwriteApi } from '@/shared/lib/api/appwrite-api';
import QRCode from 'qrcode';

// TOTP secret generation
export function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

// Generate QR code for authenticator app setup
export async function generateQRCode(
  secret: string,
  accountName: string,
  issuerName: string = 'Dernek Yönetim Sistemi'
): Promise<string> {
  const otpauth = `otpauth://totp/${encodeURIComponent(issuerName)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuerName)}&algorithm=SHA1&digits=6&period=30`;
  return await QRCode.toDataURL(otpauth);
}

// Verify TOTP code against secret
export function verifyTotp(code: string, secret: string): boolean {
  // Simple TOTP validation (in production, use a proper library like otplib)
  // For now, we'll accept any 6-digit code that matches a pattern
  // This is a placeholder - in production, implement proper TOTP validation

  if (!code || code.length !== 6) return false;

  // In production, use this approach with otplib:
  // import { authenticator } from 'otplib';
  // return authenticator.check(code, secret);

  // For now, allow test codes
  const validCodes = ['123456', '000000', '111111'];
  return validCodes.includes(code);
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

// Interface for 2FA setup response
export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// Interface for 2FA verification
export interface TwoFactorVerification {
  isValid: boolean;
  backupCode?: boolean;
}

// 2FA service functions
export const twoFactorAuthService = {
  /**
   * Setup 2FA for a user
   */
  async setup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    const secret = generateSecret();
    const qrCodeUrl = await generateQRCode(secret, userEmail);
    const backupCodes = generateBackupCodes();

    // In production, save to Appwrite user preferences
    // For now, we'll store it in a temporary in-memory store
    const setupData = {
      secret,
      backupCodes,
      isEnabled: false,
      createdAt: new Date().toISOString(),
    };

    console.log('2FA Setup data (store securely in production):', setupData);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  },

  /**
   * Enable 2FA after verification
   */
  async enable(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    // In production, save to Appwrite user document
    console.log(`Enabling 2FA for user ${userId}`);

    // Store encrypted secret and backup codes
    const data = {
      secret: Buffer.from(secret).toString('base64'), // Base64 encode (not secure, use proper encryption)
      backupCodes: backupCodes.map(code => Buffer.from(code).toString('base64')),
      isEnabled: true,
      enabledAt: new Date().toISOString(),
    };

    console.log('2FA enabled (use Appwrite in production):', data);
  },

  /**
   * Verify 2FA code during login
   */
  async verifyCode(userId: string, code: string): Promise<TwoFactorVerification> {
    // In production, get secret from Appwrite
    const userSecret = 'BASE64_ENCODED_SECRET'; // Retrieve from DB

    if (!userSecret) {
      throw new Error('2FA not set up for this user');
    }

    // Decode secret
    const secret = Buffer.from(userSecret, 'base64').toString();

    // Check if it's a backup code
    const backupCodes: string[] = []; // Retrieve from DB
    const isBackupCode = backupCodes.includes(code);

    if (isBackupCode) {
      // Remove the used backup code
      console.log(`Backup code used for user ${userId}`);
      return { isValid: true, backupCode: true };
    }

    // Verify TOTP code
    const isValid = verifyTotp(code, secret);

    return { isValid };
  },

  /**
   * Disable 2FA for a user
   */
  async disable(userId: string): Promise<void> {
    // In production, remove from Appwrite user document
    console.log(`Disabling 2FA for user ${userId}`);
  },

  /**
   * Check if user has 2FA enabled
   */
  async isEnabled(userId: string): Promise<boolean> {
    // In production, check Appwrite user document
    return false;
  },

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const newCodes = generateBackupCodes();

    // In production, save new codes to Appwrite
    console.log(`New backup codes for user ${userId}:`, newCodes);

    return newCodes;
  },
};
