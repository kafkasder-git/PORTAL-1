import { NextResponse } from 'next/server';

export async function GET() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
  const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID || '';
  const apiKey = process.env.APPWRITE_API_KEY ? 'SET' : 'NOT_SET';
  const provider = (process.env.NEXT_PUBLIC_BACKEND_PROVIDER || process.env.BACKEND_PROVIDER || 'mock').toLowerCase();

  const configOk = Boolean(endpoint && projectId && (provider === 'mock' || (provider === 'appwrite' && apiKey === 'SET' && databaseId)));

  return NextResponse.json({
    ok: true,
    provider,
    appwrite: {
      endpoint: Boolean(endpoint),
      projectId: Boolean(projectId),
      databaseId: Boolean(databaseId),
      apiKeyConfigured: apiKey === 'SET',
    },
    timestamp: new Date().toISOString(),
    readyForProduction: configOk,
  });
}