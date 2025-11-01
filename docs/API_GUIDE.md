# API Guide - API Kullanım Rehberi

Bu doküman, Dernek Yönetim Sistemi API'lerinin kullanımını ve best practice'leri açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Client-Side Usage](#client-side-usage)
6. [Server-Side Usage](#server-side-usage)
7. [Best Practices](#best-practices)

## 🌐 Genel Bakış

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### API Versioning

Şu an v1 API kullanılıyor. Endpoint'ler `/api/` prefix'i ile başlar.

### Request/Response Format

- **Content-Type**: `application/json`
- **Response Format**: JSON

## 🔐 Authentication

### Login

```typescript
// POST /api/auth/login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    rememberMe: false,
  }),
});

const result = await response.json();
// { success: true, data: { user: {...} } }
```

### Session Check

```typescript
// GET /api/auth/session
const response = await fetch('/api/auth/session');
const result = await response.json();
// { success: true, data: { user: {...} } }
```

### Logout

```typescript
// POST /api/auth/logout
await fetch('/api/auth/logout', {
  method: 'POST',
});
```

### CSRF Token

State-changing operations için CSRF token gerekli:

```typescript
// 1. Get CSRF token
const csrfResponse = await fetch('/api/csrf');
const { token } = await csrfResponse.json();

// 2. Use in request
await fetch('/api/beneficiaries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': token,
  },
  body: JSON.stringify(data),
});
```

## 📡 API Endpoints

### Beneficiaries (İhtiyaç Sahipleri)

#### List Beneficiaries

```typescript
// GET /api/beneficiaries
const response = await fetch('/api/beneficiaries?page=1&limit=10&search=test');
const result = await response.json();
// { success: true, data: { documents: [...], total: 100 } }
```

**Query Parameters:**
- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına kayıt
- `search` (string): Arama metni
- `orderBy` (string): Sıralama alanı
- `orderType` ('asc' | 'desc'): Sıralama tipi

#### Get Beneficiary

```typescript
// GET /api/beneficiaries/[id]
const response = await fetch('/api/beneficiaries/beneficiary-id');
const result = await response.json();
// { success: true, data: { /* beneficiary document */ } }
```

#### Create Beneficiary

```typescript
// POST /api/beneficiaries
const csrfToken = await getCSRFToken();

const response = await fetch('/api/beneficiaries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify({
    name: 'Ahmet Yılmaz',
    tc_no: '12345678901',
    phone: '05551234567',
    address: 'İstanbul',
    city: 'İstanbul',
    district: 'Kadıköy',
    neighborhood: 'Acıbadem',
    family_size: 4,
    status: 'AKTIF',
  }),
});

const result = await response.json();
// { success: true, data: { $id: '...', ... } }
```

#### Update Beneficiary

```typescript
// PUT /api/beneficiaries/[id]
const csrfToken = await getCSRFToken();

const response = await fetch('/api/beneficiaries/beneficiary-id', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify({
    name: 'Ahmet Yılmaz Updated',
    family_size: 5,
  }),
});

const result = await response.json();
// { success: true, data: { /* updated document */ } }
```

#### Delete Beneficiary

```typescript
// DELETE /api/beneficiaries/[id]
const csrfToken = await getCSRFToken();

const response = await fetch('/api/beneficiaries/beneficiary-id', {
  method: 'DELETE',
  headers: {
    'x-csrf-token': csrfToken,
  },
});

const result = await response.json();
// { success: true }
```

### Donations (Bağışlar)

#### List Donations

```typescript
// GET /api/donations
const response = await fetch('/api/donations?page=1&limit=10');
const result = await response.json();
```

#### Create Donation

```typescript
// POST /api/donations
const csrfToken = await getCSRFToken();

const response = await fetch('/api/donations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify({
    donor_name: 'Mehmet Demir',
    donor_phone: '05559876543',
    amount: 1000,
    currency: 'TRY',
    donation_type: 'Nakdi',
    payment_method: 'Banka',
    donation_purpose: 'Genel Bağış',
    receipt_number: 'RCP-001',
    status: 'completed',
  }),
});
```

### Users (Kullanıcılar)

#### List Users

```typescript
// GET /api/users
// Requires: USERS_READ permission
const response = await fetch('/api/users');
```

#### Create User

```typescript
// POST /api/users
// Requires: USERS_CREATE permission
const csrfToken = await getCSRFToken();

const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify({
    name: 'Yeni Kullanıcı',
    email: 'user@example.com',
    password: 'secure-password',
    role: 'MEMBER',
  }),
});
```

### Health Check

```typescript
// GET /api/health
const response = await fetch('/api/health');
const result = await response.json();
// { success: true, data: { status: 'ok', timestamp: '...' } }
```

## ⚠️ Error Handling

### Error Response Format

```typescript
{
  success: false,
  error: "Error message",
  code?: "ERROR_CODE",
  details?: any
}
```

### HTTP Status Codes

- `200 OK`: Başarılı request
- `400 Bad Request`: Geçersiz request (validation error)
- `401 Unauthorized`: Authentication gerekli
- `403 Forbidden`: Permission yetersiz
- `404 Not Found`: Kaynak bulunamadı
- `429 Too Many Requests`: Rate limit aşıldı
- `500 Internal Server Error`: Sunucu hatası

### Error Handling Example

```typescript
async function apiCall() {
  try {
    const response = await fetch('/api/beneficiaries');
    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      throw new Error(result.error || 'Request failed');
    }

    return result.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## 💻 Client-Side Usage

### React Query ile Kullanım

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query
function useBeneficiaries(filters: BeneficiaryFilters) {
  return useQuery({
    queryKey: ['beneficiaries', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/beneficiaries?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      return result.data;
    },
  });
}

// Mutation
function useCreateBeneficiary() {
  const queryClient = useQueryClient();
  const csrfToken = useCSRFToken();

  return useMutation({
    mutationFn: async (data: CreateBeneficiaryData) => {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
}

// Component'te kullanım
function BeneficiaryList() {
  const { data, isLoading, error } = useBeneficiaries({ page: 1, limit: 10 });
  const createMutation = useCreateBeneficiary();

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <div>
      {data.documents.map(beneficiary => (
        <BeneficiaryCard key={beneficiary.$id} data={beneficiary} />
      ))}
      <button onClick={() => createMutation.mutate({ name: '...' })}>
        Create
      </button>
    </div>
  );
}
```

### Custom Hook

```typescript
// hooks/useBeneficiaries.ts
import { useQuery } from '@tanstack/react-query';

export function useBeneficiaries(filters?: BeneficiaryFilters) {
  return useQuery({
    queryKey: ['beneficiaries', filters],
    queryFn: async () => {
      const params = filters ? new URLSearchParams(filters) : '';
      const response = await fetch(`/api/beneficiaries?${params}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}
```

## 🔧 Server-Side Usage

### API Route Handler

```typescript
// app/api/beneficiaries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@/shared/lib/appwrite/server';
import { validateSession } from '@/shared/lib/auth';
import { Permission } from '@/entities/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Permission check
    if (!user.permissions.includes(Permission.BENEFICIARIES_READ)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 3. Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // 4. Build queries
    const queries = [
      Query.limit(limit),
      Query.offset((page - 1) * limit),
    ];

    if (search) {
      queries.push(Query.search('name', search));
    }

    // 5. Fetch data
    const response = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_BENEFICIARIES_COLLECTION_ID!,
      queries
    );

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: {
        documents: response.documents,
        total: response.total,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Server Component'te Kullanım

```typescript
// app/(dashboard)/yardim/page.tsx (Server Component)
import { serverDatabases } from '@/shared/lib/appwrite/server';
import { BeneficiariesList } from '@/features/beneficiaries/components/BeneficiariesList';

export default async function YardimPage() {
  const beneficiaries = await serverDatabases.listDocuments(/* ... */);

  return <BeneficiariesList initialData={beneficiaries} />;
}
```

## ✅ Best Practices

### 1. Error Handling

Her zaman error handling yapın:

```typescript
try {
  const response = await fetch('/api/beneficiaries');
  if (!response.ok) {
    const error = await response.json();
    // Handle error
  }
  const data = await response.json();
} catch (error) {
  // Handle network error
}
```

### 2. Loading States

Loading state'lerini gösterin:

```typescript
const { data, isLoading } = useQuery(/* ... */);

if (isLoading) return <LoadingSpinner />;
```

### 3. Optimistic Updates

Mutation'larda optimistic update kullanın:

```typescript
const mutation = useMutation({
  mutationFn: updateBeneficiary,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['beneficiaries'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['beneficiaries']);

    // Optimistically update
    queryClient.setQueryData(['beneficiaries'], (old) => {
      return old.map(item => 
        item.$id === newData.id ? { ...item, ...newData } : item
      );
    });

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['beneficiaries'], context.previous);
  },
});
```

### 4. Debouncing

Search input'larında debounce kullanın:

```typescript
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data } = useQuery({
    queryKey: ['beneficiaries', { search: debouncedSearch }],
    queryFn: () => fetchBeneficiaries({ search: debouncedSearch }),
  });

  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

### 5. Pagination

Büyük listelerde pagination kullanın:

```typescript
function usePaginatedBeneficiaries() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaries', page],
    queryFn: () => fetchBeneficiaries({ page, limit }),
  });

  return {
    data,
    isLoading,
    page,
    setPage,
    totalPages: Math.ceil((data?.total || 0) / limit),
  };
}
```

### 6. Retry Logic

Network hatalarında retry:

```typescript
const { data } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: fetchBeneficiaries,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

## 📚 API Reference

Tüm endpoint'ler için detaylı referans:

- **Beneficiaries**: `/api/beneficiaries`
- **Donations**: `/api/donations`
- **Users**: `/api/users`
- **Aid Applications**: `/api/aid-applications`
- **Scholarships**: `/api/scholarships`
- **Tasks**: `/api/tasks`
- **Meetings**: `/api/meetings`
- **Messages**: `/api/messages`
- **Financial**: `/api/finance-records`

Her endpoint için:
- HTTP method
- Required permissions
- Request body schema
- Response schema
- Example usage

