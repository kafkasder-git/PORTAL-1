/**
 * Appwrite Type Definitions
 * TypeScript types for Appwrite documents and responses
 */

import { Models } from 'appwrite';

/**
 * Base Appwrite document with timestamps
 */
export interface AppwriteDocument extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

/**
 * User Profile Document (extends Appwrite Auth User)
 * Stores additional user information beyond auth
 */
export interface UserDocument extends AppwriteDocument {
  userId: string; // Reference to Appwrite Auth User ID
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER' | 'VOLUNTEER';
  avatar?: string | null;
  isActive: boolean;
}

/**
 * Beneficiary Document
 * İhtiyaç sahibi bilgileri
 */
export interface BeneficiaryDocument extends AppwriteDocument {
  name: string;
  tc_no: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  neighborhood: string;
  income_level: string;
  family_size: number;
  health_status: string;
  employment_status: string;
  notes: string;
  status: 'active' | 'inactive';
}

/**
 * Donation Document
 * Bağış bilgileri
 */
export interface DonationDocument extends AppwriteDocument {
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  amount: number;
  currency: string;
  donation_type: string;
  payment_method: string;
  donation_purpose: string;
  notes: string;
  receipt_number: string;
  status: 'completed' | 'pending' | 'cancelled';
}

/**
 * Aid Request Document (placeholder for future)
 * Yardım talebi bilgileri
 */
export interface AidRequestDocument extends AppwriteDocument {
  beneficiaryId: string;
  request_type: string;
  description: string;
  amount_requested?: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  approved_by?: string;
  approved_at?: string;
}

/**
 * Scholarship Document (placeholder for future)
 * Burs bilgileri
 */
export interface ScholarshipDocument extends AppwriteDocument {
  student_name: string;
  tc_no: string;
  school: string;
  grade: string;
  amount: number;
  semester: string;
  status: 'active' | 'completed' | 'cancelled';
}

/**
 * Generic API Response wrapper
 */
export interface AppwriteApiResponse<T> {
  data: T | null;
  error: string | null;
  total?: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Search and filter parameters
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Appwrite Document List Response
 */
export interface AppwriteDocumentList<T> {
  total: number;
  documents: T[];
}

/**
 * Helper type for creating new documents (without Appwrite metadata)
 */
export type NewBeneficiary = Omit<BeneficiaryDocument, keyof AppwriteDocument>;
export type NewDonation = Omit<DonationDocument, keyof AppwriteDocument>;
export type NewAidRequest = Omit<AidRequestDocument, keyof AppwriteDocument>;
export type NewScholarship = Omit<ScholarshipDocument, keyof AppwriteDocument>;

/**
 * Helper type for updating documents (partial + id)
 */
export type UpdateBeneficiary = Partial<NewBeneficiary> & { $id: string };
export type UpdateDonation = Partial<NewDonation> & { $id: string };
export type UpdateAidRequest = Partial<NewAidRequest> & { $id: string };
export type UpdateScholarship = Partial<NewScholarship> & { $id: string };
