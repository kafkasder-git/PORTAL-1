# Document Management System Guide

## Overview

The Document Management System provides comprehensive file upload, storage, categorization, version control, and search capabilities. It integrates with Appwrite Storage for secure file handling and includes a complete UI for document operations.

## Features

### 📄 Document Operations
- Upload multiple files with drag & drop
- Automatic file validation (size, type)
- Document categorization (certificate, contract, receipt, etc.)
- Tag-based organization
- Version control with change logs
- Document preview (images, PDFs)
- Secure download links

### 🔒 Security Features
- Confidential document marking
- Permission-based access control
- Automatic permission assignment
- Secure file storage in Appwrite
- GDPR/KVKK compliant storage

### 🎨 User Interface
- Modern upload interface with progress tracking
- Grid and list view modes
- Advanced filtering and search
- Document viewer with metadata
- Category badges and status indicators
- Responsive design

### 📊 Management Features
- Document statistics dashboard
- Category distribution analytics
- File type organization
- Related entity linking (beneficiaries, donations, etc.)
- Expiration date tracking

## Quick Start

### Basic Upload

```tsx
import { DocumentUploader } from '@/shared/components/ui/document-uploader';

function MyComponent() {
  const handleUpload = async (file: File, metadata: DocumentMetadata) => {
    await uploadDocument({
      file,
      metadata: {
        name: file.name,
        category: 'certificate',
        description: 'My document',
        tags: ['important', '2024']
      }
    }, userId);
  };

  return (
    <DocumentUploader
      onUpload={handleUpload}
      onClose={() => setShowUploader(false)}
      isOpen={showUploader}
    />
  );
}
```

### Display Documents

```tsx
import { DocumentList } from '@/shared/components/ui/document-list';

<DocumentList
  documents={documents}
  onSelect={(doc) => setSelectedDocument(doc)}
  onDownload={(doc) => downloadDocument(doc)}
  onDelete={(doc) => deleteDocument(doc)}
  viewMode="list"
  onViewModeChange={setViewMode}
/>
```

### View Document

```tsx
import { DocumentViewer } from '@/shared/components/ui/document-viewer';

<DocumentViewer
  document={selectedDocument}
  isOpen={!!selectedDocument}
  onClose={() => setSelectedDocument(null)}
/>
```

## API Reference

### uploadDocument(options, userId)

Uploads a document to storage and creates metadata.

**Parameters:**
```typescript
{
  file: File;
  metadata: DocumentMetadata;
  bucketId?: string;
}
```

**Returns:**
```typescript
Promise<Document>
```

### getDocuments(filters, page, limit)

Retrieves documents with optional filtering.

**Parameters:**
```typescript
{
  category?: DocumentCategory;
  relatedEntityType?: string;
  relatedEntityId?: string;
  tags?: string[];
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  isConfidential?: boolean;
}
```

**Returns:**
```typescript
{
  documents: Document[];
  total: number;
}
```

### getDocument(id)

Gets a single document by ID.

```typescript
const document = await getDocument('doc-123');
```

### updateDocument(id, updates, userId)

Updates document metadata.

```typescript
const document = await updateDocument('doc-123', {
  description: 'Updated description',
  tags: ['new-tag']
}, userId);
```

### deleteDocument(id, userId)

Deletes a document permanently.

```typescript
await deleteDocument('doc-123', userId);
```

### addDocumentVersion(documentId, file, changeLog, userId)

Adds a new version of an existing document.

```typescript
const document = await addDocumentVersion(
  'doc-123',
  newFile,
  'Updated content',
  userId
);
```

### getDocumentDownloadUrl(fileId)

Gets a secure download URL for a file.

```typescript
const url = await getDocumentDownloadUrl('file-123');
window.open(url, '_blank');
```

## Components

### DocumentUploader

Upload dialog with drag & drop support.

**Props:**
```typescript
{
  onUpload?: (file: File, metadata: DocumentMetadata) => Promise<void>;
  onClose?: () => void;
  isOpen?: boolean;
  relatedEntity?: {
    type: 'beneficiary' | 'donation' | 'task' | 'meeting' | 'user';
    id: string;
  };
}
```

**Features:**
- Multi-file upload
- Drag & drop interface
- File validation (size, type)
- Metadata form (category, tags, description)
- Progress tracking
- Error handling

### DocumentList

Displays documents in grid or list view.

**Props:**
```typescript
{
  documents?: Document[];
  onSelect?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onUploadClick?: () => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showActions?: boolean;
}
```

**Features:**
- Multiple selection
- Search and filter
- Sort by name, date, size
- Grid/list toggle
- Category badges
- Action menu

### DocumentViewer

Modal dialog for viewing document details.

**Props:**
```typescript
{
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
}
```

**Features:**
- Image/PDF preview
- Document metadata display
- Version history
- Download button
- Related entity info

## Document Categories

### Available Categories

- `certificate` - Sertifika
- `contract` - Sözleşme
- `receipt` - Fiş/Fatura
- `identity` - Kimlik Belgesi
- `medical` - Tıbbi Rapor
- `education` - Eğitim Belgesi
- `report` - Rapor
- `other` - Diğer

### Custom Categories

Add new categories:

```typescript
// In document.service.ts
export type DocumentCategory =
  | 'certificate'
  | 'contract'
  | 'receipt'
  | 'identity'
  | 'medical'
  | 'education'
  | 'report'
  | 'other'
  | 'new_category'; // Add here

// Update getDocumentCategories()
return [
  { value: 'certificate', label: 'Sertifika' },
  // ... other categories
  { value: 'new_category', label: 'Yeni Kategori' }
];
```

## File Types

### Supported Types

**Images:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Documents:**
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Microsoft Excel (.xls, .xlsx)
- Plain Text (.txt)

### Adding Support for New Types

```typescript
// In document.service.ts
const allowedTypes = [
  // Existing types
  'application/zip',
  'application/x-rar',
];

export function validateFile(file: File) {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Desteklenmeyen dosya türü'
    };
  }
  return { valid: true };
}
```

## Storage Configuration

### Appwrite Setup

1. Create storage bucket in Appwrite console
2. Set bucket ID in environment variables
3. Configure bucket permissions

```typescript
// Environment variables
NEXT_PUBLIC_APPWRITE_BUCKET_DOCUMENTS=documents
```

### Bucket Permissions

Default permissions applied to uploaded files:

```typescript
permissions: [
  `read("any")`, // Anyone can read
  `update("user:${userId}")`, // Owner can update
  `delete("user:${userId}")` // Owner can delete
]
```

Customize permissions:

```typescript
await uploadDocument({
  file,
  metadata,
  bucketId: 'confidential' // Different bucket
}, userId);
```

## Version Control

### Adding Versions

```typescript
const document = await addDocumentVersion(
  documentId,
  newFile,
  'Updated report with Q4 data',
  userId
);
```

### Version History

Each document tracks versions with:
- Version number
- File ID
- Created by
- Created at
- Change log

### Version Comparison

Compare versions:

```typescript
const versions = document.versions.sort((a, b) => b.version - a.version);
const current = versions[0];
const previous = versions[1];

// Display comparison UI
```

## Security Considerations

### Confidential Documents

Mark documents as confidential:

```typescript
await uploadDocument({
  file,
  metadata: {
    name: 'Sensitive Document',
    isConfidential: true
  }
}, userId);
```

Filter confidential documents:

```typescript
const { documents } = await getDocuments({
  isConfidential: true
});
```

### Access Control

Implement role-based access:

```typescript
export async function checkDocumentAccess(
  document: Document,
  userId: string,
  userRole: string
): Promise<boolean> {
  // Confidential docs require admin or owner
  if (document.isConfidential && userRole !== 'ADMIN') {
    return document.uploadedBy === userId;
  }

  // Regular users can view non-confidential docs
  return true;
}
```

### Data Retention

Set expiration dates:

```typescript
await uploadDocument({
  file,
  metadata: {
    name: 'Temporary Document',
    expiresAt: '2024-12-31'
  }
}, userId);
```

## API Routes

### GET /api/documents

Get documents with filters.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category
- `relatedEntityType`: Filter by entity type
- `relatedEntityId`: Filter by entity ID
- `uploadedBy`: Filter by uploader
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `isConfidential`: Filter confidential docs

**Example:**
```
GET /api/documents?category=certificate&limit=10
```

### POST /api/documents

Upload a new document.

**Request:** multipart/form-data
- `file`: File to upload
- `metadata`: JSON string with metadata

**Response:**
```typescript
{
  success: true,
  data: Document,
  message: 'Belge başarıyla yüklendi'
}
```

### GET /api/documents/[id]

Get single document.

### PUT /api/documents/[id]

Update document metadata.

**Request Body:**
```typescript
{
  name?: string;
  category?: DocumentCategory;
  description?: string;
  tags?: string[];
  isConfidential?: boolean;
  expiresAt?: string;
}
```

### DELETE /api/documents/[id]

Delete document.

### GET /api/documents/stats

Get document statistics.

**Response:**
```typescript
{
  success: true,
  data: {
    total: number;
    byCategory: Record<DocumentCategory, number>;
    totalSize: number;
  }
}
```

## Best Practices

### 1. File Organization

- Use consistent naming conventions
- Add descriptive tags
- Link to related entities
- Set expiration dates for temporary docs

### 2. Version Control

- Document all changes with change logs
- Keep version history for important documents
- Delete old versions when no longer needed

### 3. Security

- Mark confidential documents
- Use role-based access control
- Regularly review document permissions
- Audit document access

### 4. Performance

- Use pagination for large document lists
- Implement lazy loading for previews
- Cache frequently accessed documents
- Optimize image sizes before upload

### 5. Storage Management

- Monitor storage usage
- Delete expired documents automatically
- Archive old documents
- Compress files when possible

## Troubleshooting

### Upload Fails

**Check:**
1. File size (max 10MB)
2. File type (must be in allowed list)
3. Network connection
4. Storage bucket permissions

**Debug:**
```typescript
const validation = validateFile(file);
if (!validation.valid) {
  console.error('Validation error:', validation.error);
}
```

### Preview Not Loading

**Check:**
1. File type is viewable (images, PDFs)
2. Preview URL is valid
3. Image file size is reasonable

**Solutions:**
- Generate preview thumbnails
- Use CDN for large images
- Implement progressive loading

### Download Not Working

**Check:**
1. Download URL is generated
2. User has permission
3. File exists in storage

**Fix:**
```typescript
const url = await getDocumentDownloadUrl(fileId);
if (url) {
  window.open(url, '_blank');
}
```

## Integration Examples

### Link to Beneficiary

```typescript
await uploadDocument({
  file,
  metadata: {
    name: 'Beneficiary ID',
    category: 'identity',
    relatedEntity: {
      type: 'beneficiary',
      id: beneficiaryId
    }
  }
}, userId);
```

### Link to Donation

```typescript
await uploadDocument({
  file,
  metadata: {
    name: 'Donation Receipt',
    category: 'receipt',
    relatedEntity: {
      type: 'donation',
      id: donationId
    }
  }
}, userId);
```

## Roadmap

### Upcoming Features

- [ ] **OCR Integration**: Extract text from PDFs and images
- [ ] **Digital Signatures**: Add signature support
- [ ] **Document Templates**: Pre-filled document templates
- [ ] **Bulk Operations**: Upload multiple files simultaneously
- [ ] **Document Sharing**: Share documents via link
- [ ] **Audit Logging**: Track all document access
- [ ] **Auto-categorization**: AI-powered category detection
- [ ] **Advanced Search**: Full-text search in document content
- [ ] **Watermarking**: Add watermarks to documents
- [ ] **Encryption**: Client-side encryption for sensitive docs

## Support

For issues:
1. Check file format and size
2. Verify network connection
3. Check Appwrite storage status
4. Review API responses
5. Check browser console errors
