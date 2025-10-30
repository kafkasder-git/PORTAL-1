/**
 * Appwrite Type Definitions
 * TypeScript types for Appwrite documents and responses
 */

import { Models } from 'appwrite';
import type { BeneficiaryDocument, DonationDocument, ScholarshipDocument, UserDocument } from './collections';

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
 * User Profile Document
 * Note: The full UserDocument interface is defined in collections.ts
 * This re-export avoids circular dependencies
 */
export type { UserDocument } from './collections';

/**
 * Beneficiary Document
 * Note: The full BeneficiaryDocument interface is defined in collections.ts
 * This re-export avoids circular dependencies
 */
export type { BeneficiaryDocument } from './collections';

/**
 * Donation Document
 * Note: The full DonationDocument interface is defined in collections.ts
 * This re-export avoids circular dependencies
 */
export type { DonationDocument } from './collections';

/**
 * Aid Request Document (placeholder for future)
 * Yardım talebi bilgileri
 */
export interface AidRequestDoc extends AppwriteDocument {
  beneficiaryId: string;
  request_type: string;
  description: string;
  amount_requested?: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  approved_by?: string;
  approved_at?: string;
}

/**
 * Scholarship Document
 * Note: The full ScholarshipDocument interface is defined in collections.ts
 * This re-export avoids circular dependencies
 */
export type { ScholarshipDocument } from './collections';

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
export type NewAidRequest = Omit<AidRequestDoc, keyof AppwriteDocument>;
export type NewScholarship = Omit<ScholarshipDocument, keyof AppwriteDocument>;

/**
 * Helper type for updating documents (partial + id)
 */
export type UpdateBeneficiary = Partial<NewBeneficiary> & { $id: string };
export type UpdateDonation = Partial<NewDonation> & { $id: string };
export type UpdateAidRequest = Partial<NewAidRequest> & { $id: string };
export type UpdateScholarship = Partial<NewScholarship> & { $id: string };
