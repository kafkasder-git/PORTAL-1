/**
 * Individual Workflow API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow
} from '@/shared/lib/services/workflow.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * GET /api/workflows/[id]
 * Get workflow by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const workflow = await getWorkflow(id);

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'İş akışı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow
    });

  } catch (error: any) {
    console.error('Get workflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İş akışı alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/[id]
 * Update workflow
 */
async function updateWorkflowHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = 'demo-user-id'; // In production, get from session

    const workflow = await updateWorkflow(id, body, userId);

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'İş akışı güncellendi'
    });

  } catch (error: any) {
    console.error('Update workflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İş akışı güncellenemedi',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[id]
 * Delete workflow
 */
async function deleteWorkflowHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteWorkflow(id);

    return NextResponse.json({
      success: true,
      message: 'İş akışı silindi'
    });

  } catch (error: any) {
    console.error('Delete workflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İş akışı silinemedi',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const PUT = withCsrfProtection(updateWorkflowHandler);
export const DELETE = withCsrfProtection(deleteWorkflowHandler);
