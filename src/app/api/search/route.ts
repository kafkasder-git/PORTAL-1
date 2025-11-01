/**
 * Search API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  search,
  globalSearch,
  getFilterOptions,
  type SearchOptions
} from '@/shared/lib/services/search.service';

/**
 * GET /api/search
 * Perform advanced search with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity') as any;
    const query = searchParams.get('q') || '';
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || '$createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    if (!entity || !query) {
      return NextResponse.json(
        { success: false, error: 'Entity ve query parametreleri gerekli' },
        { status: 400 }
      );
    }

    // Extract filters from query params
    const filters: any = {};
    searchParams.forEach((value, key) => {
      if (!['entity', 'q', 'page', 'limit', 'sortBy', 'sortOrder'].includes(key)) {
        filters[key] = value;
      }
    });

    const response = await search({
      entity,
      query,
      filters,
      page,
      limit,
      sortBy,
      sortOrder
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Arama yapılamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search/global
 * Perform global search across all entities
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, entities, limit } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parametresi gerekli' },
        { status: 400 }
      );
    }

    const results = await globalSearch(query, { entities, limit });

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error: any) {
    console.error('Global search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Genel arama yapılamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}
