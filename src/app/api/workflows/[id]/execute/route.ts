/**
 * Workflow Execution API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow, executeWorkflow } from '@/shared/lib/services/workflow.service';

/**
 * POST /api/workflows/[id]/execute
 * Execute a workflow (for testing purposes)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the workflow
    const workflow = await getWorkflow(id);

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'İş akışı bulunamadı' },
        { status: 404 }
      );
    }

    // Get optional input data from request body
    const body = await request.json().catch(() => ({}));
    const input = body.input || { test: true };

    // Execute the workflow
    const result = await executeWorkflow(workflow, input);

    return NextResponse.json({
      success: true,
      data: result,
      message: `İş akışı ${result.status === 'success' ? 'başarıyla' : 'başarısız'} çalıştırıldı`
    });

  } catch (error: any) {
    console.error('Execute workflow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İş akışı çalıştırılamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}
