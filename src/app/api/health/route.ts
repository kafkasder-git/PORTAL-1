import { NextResponse } from 'next/server';
import { getValidationReport } from '@/shared/lib/appwrite/validation';
import { connectivityTester } from '@/shared/lib/appwrite/connectivity-test';
import { getConfigStatus } from '@/shared/lib/appwrite/config';

// Cache for detailed health checks (30 seconds)
let healthCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 1000; // 30 seconds

export async function GET(request: Request) {
  const url = new URL(request.url);
  const detailed = url.searchParams.get('detailed') === 'true';

  // Basic checks (always included for backward compatibility)
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
  const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID || '';
  const apiKey = process.env.APPWRITE_API_KEY ? 'SET' : 'NOT_SET';
  const provider = (process.env.NEXT_PUBLIC_BACKEND_PROVIDER || process.env.BACKEND_PROVIDER || 'mock').toLowerCase();

  const configOk = Boolean(endpoint && projectId && (provider === 'mock' || (provider === 'appwrite' && apiKey === 'SET' && databaseId)));

  const baseResponse = {
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
  };

  // Return basic response if not detailed
  if (!detailed) {
    return NextResponse.json(baseResponse);
  }

  // Check cache for detailed checks
  const now = Date.now();
  if (healthCache && (now - healthCache.timestamp) < CACHE_DURATION) {
    return NextResponse.json({
      ...baseResponse,
      ...healthCache.data,
      cached: true,
    });
  }

  // Run comprehensive checks
  const validationReport = getValidationReport();
  const configStatus = getConfigStatus();

  let connectivityReport = null;
  let connectivityError = null;

  if (provider === 'appwrite') {
    try {
      connectivityReport = await connectivityTester.getConnectivityReport();
    } catch (error: any) {
      connectivityError = error.message;
      console.error('Connectivity test failed:', error);
    }
  }

  // Aggregate recommendations
  const recommendations: string[] = [];

  if (validationReport.summary.errors > 0) {
    recommendations.push('Fix environment variable configuration errors');
  }

  if (connectivityReport && connectivityReport.summary.failedTests > 0) {
    recommendations.push(...connectivityReport.recommendations);
  }

  // Determine status code
  let statusCode = 200;
  if (provider === 'appwrite' && connectivityReport && connectivityReport.summary.overallHealth < 50) {
    statusCode = 503; // Service unavailable
  }

  const detailedData = {
    validation: validationReport,
    configStatus,
    connectivity: connectivityReport,
    connectivityError,
    recommendations,
  };

  // Cache the detailed results
  healthCache = {
    data: detailedData,
    timestamp: now,
  };

  return NextResponse.json({
    ...baseResponse,
    ...detailedData,
  }, { status: statusCode });
}
