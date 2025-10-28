import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simulate some processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      message: 'Sentry example API endpoint working',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in sentry-example-api:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate processing that might fail
    if (body.triggerError) {
      throw new Error('Test error from Sentry example API');
    }
    
    return NextResponse.json({
      message: 'Data processed successfully',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in sentry-example-api POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
