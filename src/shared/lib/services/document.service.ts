/**
 * Document Management Service
 * Handles file uploads, storage, categorization, and version control
 */

import { appwriteApi } from '@/shared/lib/api/appwrite-api';
import { ID } from 'appwrite';

export type DocumentCategory =
  | 'certificate'
  | 'contract'
  | 'receipt'
  | 'identity'
  | 'medical'
  | 'education'
  | 'report'
  | 'other';

export interface DocumentMetadata {
  name: string;
  category: DocumentCategory;
  description?: string;
  tags?: string[];
  relatedEntity?: {
    type: 'beneficiary' | 'donation' | 'task' | 'meeting' | 'user';
    id: string;
  };
  isConfidential?: boolean;
  expiresAt?: string;
}

export interface DocumentVersion {
  version: number;
  fileId: string;
  createdBy: string;
  createdAt: string;
  changeLog?: string;
}

export interface Document {
  id: string;
  fileId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: DocumentCategory;
  description?: string;
  tags: string[];
  relatedEntity?: {
    type: 'beneficiary' | 'donation' | 'task' | 'meeting' | 'user';
    id: string;
  };
  uploadedBy: string;
  uploadedAt: string;
  isConfidential: boolean;
  expiresAt?: string;
  versions: DocumentVersion[];
  downloadCount: number;
  lastAccessed?: string;
}

export interface UploadDocumentOptions {
  file: File;
  metadata: DocumentMetadata;
  bucketId?: string;
}

export interface DocumentFilter {
  category?: DocumentCategory;
  relatedEntityType?: string;
  relatedEntityId?: string;
  tags?: string[];
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  isConfidential?: boolean;
}

/**
 * Upload a document
 */
export async function uploadDocument(
  options: UploadDocumentOptions,
  userId: string
): Promise<Document> {
  const { file, metadata, bucketId = 'documents' } = options;

  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload file to storage
    const uploadResult = await appwriteApi.storage.uploadFile({
      file,
      bucketId,
      permissions: [
        `read("any")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`
      ]
    });

    if (uploadResult.error || !uploadResult.data) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    const uploadedFile = uploadResult.data;

    // Create document metadata in database
    // In production, this would be a 'documents' collection in Appwrite
    const document: Document = {
      id: crypto.randomUUID(),
      fileId: uploadedFile.$id,
      name: metadata.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      category: metadata.category,
      description: metadata.description,
      tags: metadata.tags || [],
      relatedEntity: metadata.relatedEntity,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      isConfidential: metadata.isConfidential || false,
      expiresAt: metadata.expiresAt,
      versions: [
        {
          version: 1,
          fileId: uploadedFile.$id,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          changeLog: 'Initial upload'
        }
      ],
      downloadCount: 0
    };

    return document;
  } catch (error) {
    console.error('Document upload error:', error);
    throw error;
  }
}

/**
 * Get document download URL
 */
export async function getDocumentDownloadUrl(fileId: string, bucketId: string = 'documents'): Promise<string> {
  try {
    const url = await appwriteApi.storage.getFileDownload(bucketId, fileId);
    return url;
  } catch (error) {
    console.error('Get download URL error:', error);
    throw error;
  }
}

/**
 * Get document preview URL (for images, PDFs)
 */
export async function getDocumentPreviewUrl(
  fileId: string,
  width?: number,
  height?: number,
  bucketId: string = 'documents'
): Promise<string | null> {
  try {
    // Only preview supported for images
    const isImage = fileId.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    if (!isImage) {
      return null;
    }

    const url = await appwriteApi.storage.getFilePreview(bucketId, fileId, width, height);
    return url;
  } catch (error) {
    console.error('Get preview URL error:', error);
    return null;
  }
}

/**
 * Get documents with filters
 */
export async function getDocuments(
  filters: DocumentFilter = {},
  page: number = 1,
  limit: number = 20
): Promise<{ documents: Document[]; total: number }> {
  try {
    // In production, fetch from 'documents' collection with filters
    // For now, return empty array
    return {
      documents: [],
      total: 0
    };
  } catch (error) {
    console.error('Get documents error:', error);
    throw error;
  }
}

/**
 * Get document by ID
 */
export async function getDocument(id: string): Promise<Document | null> {
  try {
    // In production, fetch from 'documents' collection
    return null;
  } catch (error) {
    console.error('Get document error:', error);
    throw error;
  }
}

/**
 * Update document metadata
 */
export async function updateDocument(
  id: string,
  updates: Partial<DocumentMetadata>,
  userId: string
): Promise<Document> {
  try {
    // In production, update in 'documents' collection
    const document = await getDocument(id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Update download count on access
    if (document.uploadedBy !== userId) {
      document.downloadCount++;
      document.lastAccessed = new Date().toISOString();
    }

    return document;
  } catch (error) {
    console.error('Update document error:', error);
    throw error;
  }
}

/**
 * Delete document
 */
export async function deleteDocument(id: string, userId: string): Promise<void> {
  try {
    const document = await getDocument(id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete from storage
    await appwriteApi.storage.deleteFile('documents', document.fileId);

    // Delete from database
    // In production, delete from 'documents' collection
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
}

/**
 * Add new version of document
 */
export async function addDocumentVersion(
  documentId: string,
  file: File,
  changeLog: string,
  userId: string
): Promise<Document> {
  try {
    const document = await getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Upload new version
    const uploadResult = await appwriteApi.storage.uploadFile({
      file,
      bucketId: 'documents',
      permissions: [
        `read("any")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`
      ]
    });

    if (uploadResult.error || !uploadResult.data) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Update document with new version
    const newVersion: DocumentVersion = {
      version: document.versions.length + 1,
      fileId: uploadResult.data.$id,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      changeLog
    };

    document.versions.push(newVersion);
    document.fileId = uploadResult.data.$id;
    document.size = file.size;
    document.mimeType = file.type;
    document.originalName = file.name;

    return document;
  } catch (error) {
    console.error('Add document version error:', error);
    throw error;
  }
}

/**
 * Search documents
 */
export async function searchDocuments(
  query: string,
  filters: DocumentFilter = {}
): Promise<Document[]> {
  try {
    // In production, implement full-text search
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Search documents error:', error);
    throw error;
  }
}

/**
 * Get document categories
 */
export function getDocumentCategories(): { value: DocumentCategory; label: string }[] {
  return [
    { value: 'certificate', label: 'Sertifika' },
    { value: 'contract', label: 'Sözleşme' },
    { value: 'receipt', label: 'Fiş/Fatura' },
    { value: 'identity', label: 'Kimlik Belgesi' },
    { value: 'medical', label: 'Tıbbi Rapor' },
    { value: 'education', label: 'Eğitim Belgesi' },
    { value: 'report', label: 'Rapor' },
    { value: 'other', label: 'Diğer' }
  ];
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Dosya boyutu 10MB\'dan büyük olamaz'
    };
  }

  // Check allowed types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Desteklenmeyen dosya türü'
    };
  }

  return { valid: true };
}

/**
 * Get file extension from mime type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt'
  };

  return extensions[mimeType] || 'bin';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file is viewable in browser
 */
export function isViewableFile(mimeType: string): boolean {
  const viewableTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ];

  return viewableTypes.includes(mimeType);
}

/**
 * Get document statistics
 */
export async function getDocumentStats(): Promise<{
  total: number;
  byCategory: Record<DocumentCategory, number>;
  totalSize: number;
}> {
  try {
    // In production, fetch from 'documents' collection
    return {
      total: 0,
      byCategory: {
        certificate: 0,
        contract: 0,
        receipt: 0,
        identity: 0,
        medical: 0,
        education: 0,
        report: 0,
        other: 0
      },
      totalSize: 0
    };
  } catch (error) {
    console.error('Get document stats error:', error);
    throw error;
  }
}
