/**
 * Bulk Operation Status API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { BulkOperationsService } from '@/shared/lib/services/bulk-operations.service';

/**
 * GET /api/bulk-operations/[id]
 * Get bulk operation status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = new BulkOperationsService();
    const operation = service.getOperation(id);

    if (!operation) {
      return NextResponse.json(
        { success: false, error: 'İşlem bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: operation,
    });

  } catch (error: any) {
    console.error('Get bulk operation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İşlem alınamadı',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bulk-operations/[id]
 * Cancel bulk operation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = new BulkOperationsService();
    service.cancelOperation(id);

    return NextResponse.json({
      success: true,
      message: 'İşlem iptal edildi',
    });

  } catch (error: any) {
    console.error('Cancel bulk operation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İşlem iptal edilemedi',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
