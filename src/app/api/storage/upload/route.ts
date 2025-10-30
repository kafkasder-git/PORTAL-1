import { NextRequest, NextResponse } from 'next/server';
import api from '@/shared/lib/api';
import { withCsrfProtection } from '@/shared/lib/middleware/csrf-middleware';
import { STORAGE_BUCKETS } from '@/shared/lib/appwrite/config';

/**
 * POST /api/storage/upload
 * Accepts multipart/form-data with fields:
 * - file: File
 * - bucket: optional bucketId (default: receipts)
 */
async function uploadHandler(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, error: 'Geçersiz içerik türü' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucketId = (formData.get('bucket') as string | null) || STORAGE_BUCKETS.REPORTS;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya zorunludur' }, { status: 400 });
    }

    const response = await api.storage.uploadFile({ file, bucketId });
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Yükleme başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Dosya yüklendi' }, { status: 201 });
  } catch (error: any) {
    console.error('Upload file error:', error);
    return NextResponse.json({ success: false, error: 'Yükleme işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(uploadHandler);