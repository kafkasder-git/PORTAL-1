/**
 * Documents API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  getDocumentStats,
  type DocumentFilter
} from '@/shared/lib/services/document.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * GET /api/documents
 * Get documents with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');

    const filters: DocumentFilter = {
      category: searchParams.get('category') as any,
      relatedEntityType: searchParams.get('relatedEntityType') || undefined,
      relatedEntityId: searchParams.get('relatedEntityId') || undefined,
      uploadedBy: searchParams.get('uploadedBy') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      isConfidential: searchParams.get('isConfidential') === 'true' ? true : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof DocumentFilter] === undefined) {
        delete filters[key as keyof DocumentFilter];
      }
    });

    const { documents, total } = await getDocuments(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: {
        documents,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Belgeler alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Upload a new document
 */
async function uploadDocumentHandler(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataStr = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya gerekli' },
        { status: 400 }
      );
    }

    if (!metadataStr) {
      return NextResponse.json(
        { success: false, error: 'Metadata gerekli' },
        { status: 400 }
      );
    }

    const metadata = JSON.parse(metadataStr);
    const userId = 'demo-user-id'; // In production, get from session

    const document = await uploadDocument(
      {
        file,
        metadata
      },
      userId
    );

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Belge başarıyla yüklendi'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Upload document error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Belge yüklenemedi',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(uploadDocumentHandler);
