/**
 * Donation Domain Types
 * TypeScript definitions for donation management
 */

import { AppwriteDocument } from '@/entities';

export interface DonationDocument extends AppwriteDocument {
  donor_name: string;
  donor_phone: string;
  donor_email?: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  donation_type: string;
  payment_method: string;
  donation_purpose: string;
  notes?: string;
  receipt_number: string;
  receipt_file_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Donation status enum
export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Currency enum
export enum DonationCurrency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR'
}

// Donation form data
export interface DonationFormData {
  donor_name: string;
  donor_phone: string;
  donor_email?: string;
  amount: number;
  currency: DonationCurrency;
  donation_type: string;
  payment_method: string;
  donation_purpose: string;
  notes?: string;
  receipt_number: string;
  receipt_file_id?: string;
  status: DonationStatus;
}

// Donation stats
export interface DonationStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;
  monthlyData: {
    month: string;
    amount: number;
    count: number;
  }[];
}
