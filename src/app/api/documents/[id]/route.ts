/**
 * Individual Document API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDocument,
  updateDocument,
  deleteDocument,
  getDocumentDownloadUrl
} from '@/shared/lib/services/document.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * GET /api/documents/[id]
 * Get document by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const document = await getDocument(id);

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Belge bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: document
    });

  } catch (error: any) {
    console.error('Get document error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Belge alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/documents/[id]
 * Update document metadata
 */
async function updateDocumentHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = 'demo-user-id'; // In production, get from session

    const document = await updateDocument(id, body, userId);

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Belge güncellendi'
    });

  } catch (error: any) {
    console.error('Update document error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Belge güncellenemedi',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete document
 */
async function deleteDocumentHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = 'demo-user-id'; // In production, get from session

    await deleteDocument(id, userId);

    return NextResponse.json({
      success: true,
      message: 'Belge silindi'
    });

  } catch (error: any) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Belge silinemedi',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const PUT = withCsrfProtection(updateDocumentHandler);
export const DELETE = withCsrfProtection(deleteDocumentHandler);
