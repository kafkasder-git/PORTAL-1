/**
 * Advanced Search & Filtering Service
 * Provides comprehensive search across all entities with advanced filtering
 */

import { appwriteApi } from '@/shared/lib/api/appwrite-api';

export type SearchEntityType = 'beneficiaries' | 'donations' | 'tasks' | 'meetings' | 'aid_applications' | 'users';

export interface SearchFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  createdBy?: string;
  amountMin?: number;
  amountMax?: number;
  [key: string]: any;
}

export interface SearchOptions {
  entity: SearchEntityType;
  query: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  entity: SearchEntityType;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  highlight?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  took: number; // Search time in ms
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  entity: SearchEntityType;
  userId: string;
  createdAt: string;
  isPublic: boolean;
}

/**
 * Perform a search across entities
 */
export async function search({
  entity,
  query,
  filters = {},
  page = 1,
  limit = 20,
  sortBy = '$createdAt',
  sortOrder = 'desc'
}: SearchOptions): Promise<SearchResponse> {
  const startTime = Date.now();

  try {
    let results: any[] = [];
    let total = 0;

    switch (entity) {
      case 'beneficiaries':
        ({ data: results, total } = await appwriteApi.beneficiaries.getBeneficiaries({
          page,
          limit,
          search: query,
          filters: {
            status: filters.status,
            aid_type: filters.category
          }
        }));
        break;

      case 'donations':
        ({ data: results, total } = await appwriteApi.donations.getDonations({
          page,
          limit,
          search: query,
          filters: {
            status: filters.status,
            donation_type: filters.category
          }
        }));
        break;

      case 'tasks':
        ({ data: results, total } = await appwriteApi.tasks.getTasks({
          page,
          limit,
          search: query,
          filters: {
            status: filters.status,
            priority: filters.priority,
            assigned_to: filters.assignedTo
          }
        }));
        break;

      case 'meetings':
        ({ data: results, total } = await appwriteApi.meetings.getMeetings({
          page,
          limit,
          search: query,
          filters: {
            status: filters.status,
            meeting_type: filters.category
          }
        }));
        break;

      case 'aid_applications':
        ({ data: results, total } = await appwriteApi.aidApplications.getAidApplications({
          page,
          limit,
          search: query,
          filters: {
            stage: filters.status,
            status: filters.category
          }
        }));
        break;

      case 'users':
        ({ data: results, total } = await appwriteApi.users.getUsers({
          page,
          limit,
          search: query,
          filters: {
            role: filters.category
          }
        }));
        break;
    }

    // Transform results to standardized format
    const searchResults: SearchResult[] = results.map((item: any) =>
      transformToSearchResult(item, entity)
    );

    // Apply date filters if specified
    const filteredResults = applyDateFilters(searchResults, filters);

    // Apply amount filters if specified
    const finalResults = applyAmountFilters(filteredResults, filters);

    const took = Date.now() - startTime;
    const totalPages = Math.ceil(total / limit);

    return {
      results: finalResults,
      total,
      page,
      totalPages,
      took
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

/**
 * Global search across all entities
 */
export async function globalSearch(
  query: string,
  options?: { limit?: number; entities?: SearchEntityType[] }
): Promise<Record<SearchEntityType, SearchResult[]>> {
  const entities = options?.entities || [
    'beneficiaries',
    'donations',
    'tasks',
    'meetings',
    'aid_applications'
  ];

  const results = await Promise.all(
    entities.map(async (entity) => {
      try {
        const response = await search({
          entity,
          query,
          page: 1,
          limit: options?.limit || 10
        });
        return [entity, response.results] as [SearchEntityType, SearchResult[]];
      } catch (error) {
        console.error(`Error searching ${entity}:`, error);
        return [entity, []] as [SearchEntityType, SearchResult[]];
      }
    })
  );

  return Object.fromEntries(results);
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(
  query: string,
  entity?: SearchEntityType
): Promise<string[]> {
  // In production, this could query a suggestions index
  // For now, return empty array or mock suggestions
  return [];
}

/**
 * Save a search query for quick access
 */
export async function saveSearch(
  userId: string,
  name: string,
  options: Omit<SearchOptions, 'page' | 'limit'>
): Promise<SavedSearch> {
  const savedSearch: SavedSearch = {
    id: crypto.randomUUID(),
    name,
    query: options.query,
    filters: options.filters || {},
    entity: options.entity,
    userId,
    createdAt: new Date().toISOString(),
    isPublic: false
  };

  // In production, save to database
  console.log('Saving search:', savedSearch);

  return savedSearch;
}

/**
 * Get saved searches for a user
 */
export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  // In production, fetch from database
  return [];
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(searchId: string, userId: string): Promise<void> {
  // In production, delete from database
  console.log('Deleting saved search:', searchId, 'for user:', userId);
}

/**
 * Transform database result to standardized search result
 */
function transformToSearchResult(item: any, entity: SearchEntityType): SearchResult {
  const base = {
    id: item.$id,
    entity,
    createdAt: item.$createdAt,
    updatedAt: item.$updatedAt,
    metadata: item
  };

  switch (entity) {
    case 'beneficiaries':
      return {
        ...base,
        title: item.name || 'İsimsiz İhtiyaç Sahibi',
        description: `${item.tc_no} - ${item.city || ''} ${item.district || ''}`.trim()
      };

    case 'donations':
      return {
        ...base,
        title: `${item.donor_name} - Bağış`,
        description: `${item.amount} ${item.currency} - ${item.donation_type || ''}`.trim()
      };

    case 'tasks':
      return {
        ...base,
        title: item.title,
        description: item.description || ''
      };

    case 'meetings':
      return {
        ...base,
        title: item.title,
        description: `${item.meeting_type} - ${item.location || ''}`.trim()
      };

    case 'aid_applications':
      return {
        ...base,
        title: `${item.applicant_name} - Yardım Başvurusu`,
        description: `${item.stage} - ${item.status}`.trim()
      };

    case 'users':
      return {
        ...base,
        title: item.name,
        description: item.email
      };

    default:
      return {
        ...base,
        title: 'Unknown',
        description: ''
      };
  }
}

/**
 * Apply date range filters to search results
 */
function applyDateFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
  if (!filters.dateFrom && !filters.dateTo) {
    return results;
  }

  return results.filter(result => {
    const createdAt = new Date(result.createdAt).getTime();
    const from = filters.dateFrom ? new Date(filters.dateFrom).getTime() : -Infinity;
    const to = filters.dateTo ? new Date(filters.dateTo).getTime() : Infinity;

    return createdAt >= from && createdAt <= to;
  });
}

/**
 * Apply amount range filters to search results
 */
function applyAmountFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
  if (filters.amountMin === undefined && filters.amountMax === undefined) {
    return results;
  }

  return results.filter(result => {
    // Look for amount in metadata
    const amount = result.metadata?.amount || result.metadata?.totalAidAmount;
    if (typeof amount !== 'number') {
      return false;
    }

    if (filters.amountMin !== undefined && amount < filters.amountMin) {
      return false;
    }

    if (filters.amountMax !== undefined && amount > filters.amountMax) {
      return false;
    }

    return true;
  });
}

/**
 * Get available filter options for an entity
 */
export async function getFilterOptions(entity: SearchEntityType): Promise<Record<string, string[]>> {
  // In production, fetch unique values from database
  const options: Record<string, string[]> = {
    beneficiaries: {
      status: ['AKTIF', 'PASIF', 'TASLAK', 'SILINDI'],
      category: ['Tek Seferlik', 'Düzenli Nakdi', 'Gıda', 'Ayni', 'Hizmet Sevk']
    },
    donations: {
      status: ['pending', 'completed', 'cancelled'],
      category: ['Bağış', 'Zekat', 'Fitre', 'Diğer']
    },
    tasks: {
      status: ['pending', 'in_progress', 'completed', 'cancelled'],
      priority: ['low', 'normal', 'high', 'urgent']
    },
    meetings: {
      status: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      category: ['general', 'committee', 'board', 'other']
    },
    aid_applications: {
      status: ['open', 'closed'],
      category: ['draft', 'under_review', 'approved', 'ongoing', 'completed']
    },
    users: {
      category: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER', 'VOLUNTEER', 'VIEWER']
    }
  };

  return options[entity] || {};
}

/**
 * Build search query string from filters
 */
export function buildQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

/**
 * Parse query string to filters
 */
export function parseQueryString(query: string): SearchFilters {
  const params = new URLSearchParams(query);
  const filters: SearchFilters = {};

  params.forEach((value, key) => {
    filters[key] = value;
  });

  return filters;
}
