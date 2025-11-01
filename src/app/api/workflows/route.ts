/**
 * Workflows API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkflows,
  createWorkflow,
  type CreateWorkflowDto
} from '@/shared/lib/services/workflow.service';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';

/**
 * GET /api/workflows
 * Get all workflows
 */
export async function GET(request: NextRequest) {
  try {
    const workflows = await getWorkflows();

    return NextResponse.json({
      success: true,
      data: workflows
    });

  } catch (error: any) {
    console.error('Get workflows error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İş akışları alınamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows
 * Create a new workflow
 */
async function createWorkflowHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = 'demo-user-id'; // In production, get from session

    const workflow = await createWorkflow(body as CreateWorkflowDto, userId);

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'İş akışı oluşturuldu'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create workflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İş akışı oluşturulamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(createWorkflowHandler);
