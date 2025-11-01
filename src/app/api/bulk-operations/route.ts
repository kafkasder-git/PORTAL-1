/**
 * Bulk Operations API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  BulkAction,
  EntityType,
  BulkOperationsService,
} from '@/shared/lib/services/bulk-operations.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * POST /api/bulk-operations
 * Create a new bulk operation
 */
async function createOperationHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, action, entityIds, data } = body;

    // Validate input
    if (!entityType || !action || !entityIds || !Array.isArray(entityIds)) {
      return NextResponse.json(
        { success: false, error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    if (entityIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'En az bir öğe seçilmelidir' },
        { status: 400 }
      );
    }

    if (entityIds.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Maksimum 1000 öğe işlenebilir' },
        { status: 400 }
      );
    }

    // Validate operation
    const service = new BulkOperationsService();
    const validation = service.validateOperation(entityType as EntityType, action as BulkAction, entityIds);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz işlem', details: validation.errors },
        { status: 400 }
      );
    }

    // Create operation
    const operation = await service.createOperation(
      entityType as EntityType,
      action as BulkAction,
      entityIds,
      data
    );

    return NextResponse.json({
      success: true,
      data: operation,
      message: 'Toplu işlem başlatıldı',
    });

  } catch (error: any) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Toplu işlem başlatılamadı',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(createOperationHandler);
