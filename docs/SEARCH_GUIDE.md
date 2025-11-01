# Search & Filtering System Guide

## Overview

The Search & Filtering System provides comprehensive search capabilities across all entities in the application with advanced filtering, saved searches, and real-time suggestions.

## Features

### 🔍 Global Search
- Search across all entities (beneficiaries, donations, tasks, meetings, etc.)
- Instant search suggestions
- Recent searches tracking
- Keyboard shortcut (Cmd/Ctrl + K)

### 🎛️ Advanced Filters
- Multi-criteria filtering
- Date range selection
- Status-based filtering
- Category filtering
- Priority filtering
- Amount range filtering

### 💾 Saved Searches
- Save frequently used searches
- Quick access to favorite filters
- Shareable search queries

### 📊 Search Results
- Paginated results
- Multiple entity support
- Result highlighting
- Export capabilities

## Quick Start

### Adding Global Search to Layout

```tsx
import { GlobalSearch } from '@/shared/components/ui/global-search';

export default function Header() {
  return (
    <header className="flex items-center gap-4 p-4 border-b">
      <GlobalSearch />
      {/* Other header items */}
    </header>
  );
}
```

### Using Search Service

```tsx
import { search } from '@/shared/lib/services/search.service';

async function performSearch() {
  const results = await search({
    entity: 'beneficiaries',
    query: 'Ahmet',
    filters: {
      status: 'active',
      city: 'Istanbul'
    },
    page: 1,
    limit: 20
  });

  console.log(results.results);
  console.log(results.total);
}
```

### Using Global Search

```tsx
import { globalSearch } from '@/shared/lib/services/search.service';

async function performGlobalSearch() {
  const results = await globalSearch('bağış', {
    entities: ['donations', 'beneficiaries'],
    limit: 10
  });

  console.log(results.donations);
  console.log(results.beneficiaries);
}
```

## API Reference

### search(options)

Performs search on a specific entity.

**Parameters:**
```typescript
{
  entity: SearchEntityType;
  query: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Returns:**
```typescript
{
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  took: number;
}
```

### globalSearch(query, options)

Performs search across multiple entities.

**Parameters:**
```typescript
{
  query: string;
  options?: {
    limit?: number;
    entities?: SearchEntityType[];
  };
}
```

**Returns:**
```typescript
{
  [entity: string]: SearchResult[];
}
```

### getFilterOptions(entity)

Gets available filter options for an entity.

**Parameters:**
- `entity` (SearchEntityType): The entity type

**Returns:**
```typescript
{
  [filterKey: string]: string[];
}
```

## Search Filters

### Supported Filters

#### Beneficiaries
- `status`: AKTIF, PASIF, TASLAK, SILINDI
- `category`: Tek Seferlik, Düzenli Nakdi, Gıda, Ayni, Hizmet Sevk
- `dateFrom` / `dateTo`: Date range
- `city`: City name
- `district`: District name

#### Donations
- `status`: pending, completed, cancelled
- `category`: Bağış, Zekat, Fitre, Diğer
- `dateFrom` / `dateTo`: Date range
- `amountMin` / `amountMax`: Amount range
- `currency`: TRY, USD, EUR

#### Tasks
- `status`: pending, in_progress, completed, cancelled
- `priority`: low, normal, high, urgent
- `dateFrom` / `dateTo`: Date range
- `assignedTo`: User ID
- `createdBy`: User ID

#### Meetings
- `status`: scheduled, ongoing, completed, cancelled
- `category`: general, committee, board, other
- `dateFrom` / `dateTo`: Date range
- `organizer`: User ID

#### Aid Applications
- `status`: open, closed
- `stage`: draft, under_review, approved, ongoing, completed
- `dateFrom` / `dateTo`: Date range
- `applicantType`: person, organization, partner

#### Users
- `category`: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VOLUNTEER, VIEWER
- `isActive`: true, false

### Filter Examples

```typescript
// Date range filter
const filters = {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
};

// Amount range filter
const filters = {
  amountMin: 1000,
  amountMax: 10000
};

// Multiple filters
const filters = {
  status: 'completed',
  priority: 'high',
  dateFrom: '2024-01-01'
};
```

## Components

### GlobalSearch

Command palette-style global search component.

**Features:**
- Cmd/Ctrl + K keyboard shortcut
- Recent searches
- Popular searches
- Real-time suggestions
- Entity-based grouping

**Usage:**
```tsx
<GlobalSearch />
```

### Search Page

Full-featured search page at `/search`.

**Features:**
- Entity selection
- Advanced filters
- Paginated results
- Result export
- Clear filters

**Usage:**
Navigate to `/search` or use the link from global search results.

## Services

### SearchService

Core search functionality.

```typescript
import { search, globalSearch, getFilterOptions } from '@/shared/lib/services/search.service';
```

### Key Methods

- `search(options)`: Entity-specific search
- `globalSearch(query, options)`: Multi-entity search
- `getFilterOptions(entity)`: Get available filters
- `buildQueryString(filters)`: Serialize filters to query string
- `parseQueryString(query)`: Parse query string to filters

## API Routes

### GET /api/search

Search with filters.

**Query Parameters:**
- `entity`: Entity type (required)
- `q`: Search query (required)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `sortBy`: Sort field (default: $createdAt)
- `sortOrder`: asc or desc (default: desc)
- `*`: Any additional filter params

**Example:**
```
GET /api/search?entity=beneficiaries&q=Ahmet&status=active&limit=10
```

### POST /api/search/global

Global search across entities.

**Request Body:**
```typescript
{
  query: string;
  entities?: SearchEntityType[];
  limit?: number;
}
```

**Example:**
```json
{
  "query": "bağış",
  "entities": ["donations", "beneficiaries"],
  "limit": 5
}
```

## Search Optimization

### Indexing

For better performance, ensure database indexes on frequently searched fields:

```sql
-- Appwrite will handle indexing automatically
-- But you can create custom indexes via Appwrite dashboard

-- Recommended indexes:
-- - beneficiaries: name, tc_no, status
-- - donations: donor_name, amount, status, $createdAt
-- - tasks: title, status, priority, $createdAt
-- - meetings: title, status, meeting_type, meeting_date
```

### Caching

Implement caching for frequent searches:

```typescript
// Example: Redis caching
const cacheKey = `search:${entity}:${query}:${JSON.stringify(filters)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const results = await search(...);
await redis.setex(cacheKey, 300, JSON.stringify(results)); // 5 min cache
return results;
```

### Debouncing

Always debounce search requests to avoid excessive API calls:

```typescript
// Already implemented in GlobalSearch component
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    if (query.length >= 2) {
      const results = await search(...);
      setResults(results);
    }
  }, 300);

  return () => clearTimeout(timeoutId);
}, [query]);
```

## Customization

### Adding New Entity Support

1. Update `SearchEntityType` type:

```typescript
export type SearchEntityType =
  | 'beneficiaries'
  | 'donations'
  | 'tasks'
  | 'meetings'
  | 'aid_applications'
  | 'users'
  | 'new_entity'; // Add here
```

2. Add to `search()` function:

```typescript
switch (entity) {
  case 'new_entity':
    ({ data: results, total } = await appwriteApi.newEntity.getNewEntities({
      page,
      limit,
      search: query,
      filters
    }));
    break;
}
```

3. Update `transformToSearchResult()`:

```typescript
case 'new_entity':
  return {
    ...base,
    title: item.title,
    description: item.description
  };
```

4. Add to `ENTITY_LABELS`:

```typescript
const ENTITY_LABELS: Record<SearchEntityType, string> = {
  // ... existing
  new_entity: 'Yeni Varlık'
};
```

### Custom Filters

Add entity-specific filters:

```typescript
// In search.service.ts
export interface CustomFilters extends SearchFilters {
  customField?: string;
  anotherField?: string;
}

// In API route
const filters: CustomFilters = {
  // Standard filters
  status: searchParams.get('status') || '',
  // Custom filters
  customField: searchParams.get('customField') || '',
  anotherField: searchParams.get('anotherField') || ''
};

// Apply filters in search logic
```

## Saved Searches

### Save Search

```typescript
import { saveSearch } from '@/shared/lib/services/search.service';

const savedSearch = await saveSearch(userId, 'Aktif Bağışlar', {
  entity: 'donations',
  query: 'bağış',
  filters: { status: 'completed' }
});
```

### Get Saved Searches

```typescript
import { getSavedSearches } from '@/shared/lib/services/search.service';

const savedSearches = await getSavedSearches(userId);
```

### Delete Saved Search

```typescript
import { deleteSavedSearch } from '@/shared/lib/services/search.service';

await deleteSavedSearch(searchId, userId);
```

## Testing

### Unit Tests

```typescript
import { search } from '@/shared/lib/services/search.service';

test('searches beneficiaries by name', async () => {
  const results = await search({
    entity: 'beneficiaries',
    query: 'Ahmet'
  });

  expect(results.results.length).toBeGreaterThan(0);
  expect(results.results[0].entity).toBe('beneficiaries');
});
```

### Integration Tests

```typescript
// Test API route
test('GET /api/search returns results', async () => {
  const response = await fetch('/api/search?entity=beneficiaries&q=Ahmet');
  const data = await response.json();

  expect(data.success).toBe(true);
  expect(data.data.results).toBeDefined();
});
```

## Best Practices

### 1. Search UX

- Show search results as user types (debounced)
- Highlight search terms in results
- Provide "no results" state with suggestions
- Show result count
- Offer to search all entities

### 2. Performance

- Debounce search requests (300ms recommended)
- Limit initial results to 10-20
- Implement pagination
- Cache frequent searches
- Use database indexes

### 3. Accessibility

- Ensure keyboard navigation
- Provide ARIA labels
- Support screen readers
- Provide visual feedback
- Allow keyboard shortcuts

### 4. Error Handling

- Handle network errors gracefully
- Show meaningful error messages
- Retry on failure
- Log errors for debugging

### 5. Security

- Sanitize search queries
- Implement rate limiting
- Validate user permissions
- Escape special characters
- Prevent SQL injection (Appwrite handles this)

## Troubleshooting

### No Results Found

**Check:**
1. Query spelling
2. Filters applied
3. Entity selection
4. Date range
5. Permissions

**Debug:**
```typescript
console.log('Search params:', { entity, query, filters });
```

### Slow Search Performance

**Solutions:**
1. Add database indexes
2. Implement caching
3. Reduce result limit
4. Optimize filters
5. Use pagination

### Search Not Working

**Check:**
1. API endpoint status
2. Network connectivity
3. Query syntax
4. Entity permissions
5. Browser console errors

## Roadmap

### Upcoming Features

- [ ] **Search Analytics**: Track popular searches
- [ ] **Auto-complete**: Suggest completions
- [ ] **Search History**: User-specific history
- [ ] **Advanced Operators**: AND, OR, NOT
- [ ] **Fuzzy Search**: Similarity matching
- [ ] **Search Templates**: Pre-built searches
- [ ] **Bulk Search**: Search multiple queries
- [ ] **Search Scheduling**: Automated searches

## Support

For issues:
1. Check browser console
2. Verify API responses
3. Test with simple queries
4. Check database permissions
5. Review search service logs
