# Development Guide - Geliştirme Rehberi

Bu doküman, Dernek Yönetim Sistemi'nde geliştirme yaparken uyulması gereken kuralları, standartları ve en iyi uygulamaları içerir.

## 📋 İçindekiler

1. [Proje Yapısı](#proje-yapısı)
2. [Kod Standartları](#kod-standartları)
3. [Component Geliştirme](#component-geliştirme)
4. [State Management](#state-management)
5. [API & Data Fetching](#api--data-fetching)
6. [Güvenlik Kuralları](#güvenlik-kuralları)
7. [Testing](#testing)
8. [Git Workflow](#git-workflow)

## 📁 Proje Yapısı

### Dizin Organizasyonu

```
src/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Route groups (layout sharing)
│   │   ├── yardim/         # Feature routes
│   │   └── layout.tsx      # Shared layout
│   ├── api/                # API routes (server-side)
│   └── login/              # Public routes
│
├── entities/                # Domain entities & TypeScript types
│   ├── auth.ts             # Auth types (User, Role, Permission)
│   ├── collections.ts      # Appwrite collection types
│   └── index.ts            # Re-exports
│
├── features/                # Feature modules (Feature-Sliced Design)
│   ├── beneficiaries/      # Feature modülü
│   │   ├── components/     # Feature-specific components
│   │   ├── types/          # Feature types
│   │   ├── validations/    # Zod schemas
│   │   └── index.ts        # Public API
│   └── ...
│
└── shared/                  # Shared code (cross-feature)
    ├── components/          # Reusable UI components
    │   ├── ui/             # Base UI components (shadcn/ui)
    │   └── layout/         # Layout components
    ├── lib/                # Utilities & helpers
    │   ├── appwrite/       # Appwrite clients & config
    │   ├── api/            # API wrappers
    │   ├── sanitization.ts # XSS protection
    │   └── utils.ts        # General utilities
    ├── stores/             # Zustand stores
    └── hooks/              # Custom React hooks
```

### Naming Conventions

- **Files**: `kebab-case.tsx` (örn: `beneficiary-form.tsx`)
- **Components**: `PascalCase.tsx` (örn: `BeneficiaryForm.tsx`)
- **Hooks**: `camelCase.ts` (örn: `useInfiniteScroll.ts`)
- **Utils**: `camelCase.ts` (örn: `sanitization.ts`)
- **Types**: `camelCase.ts` (örn: `beneficiary.types.ts`)
- **Constants**: `UPPER_SNAKE_CASE` (örn: `MAX_FILE_SIZE`)

## 💻 Kod Standartları

### TypeScript

#### Type Safety

- **Strict Mode**: Her zaman strict mode kullanın
- **No `any`**: `any` kullanımından kaçının, gerekirse `unknown` kullanın
- **Explicit Types**: Function return types'ları belirtin

```typescript
// ✅ Good
function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Bad
function getUser(id: any) {
  // ...
}
```

#### Type Definitions

- **Entity Types**: `src/entities/` klasöründe tanımlayın
- **Feature Types**: İlgili feature klasöründe `types/` altında
- **Shared Types**: `src/shared/lib/types/` altında

```typescript
// ✅ entities/collections.ts
export interface BeneficiaryDocument extends AppwriteDocument {
  name: string;
  tc_no: string;
  // ...
}

// ✅ features/beneficiaries/types/beneficiary.types.ts
export interface BeneficiaryFormData {
  name: string;
  tc_no: string;
  // ...
}
```

### ESLint Rules

Proje ESLint ile yapılandırılmıştır. Önemli kurallar:

- **Next.js Core Web Vitals**: Performans kuralları
- **TypeScript Strict**: Tip güvenliği
- **React Hooks**: Hook kurallarına uyum

```bash
# Lint kontrolü
npm run lint

# Otomatik düzeltme
npm run lint -- --fix
```

### Code Formatting

- **Prettier**: Otomatik formatlama (VS Code extension önerilir)
- **Line Length**: Maksimum 100 karakter
- **Indentation**: 2 space

## 🧩 Component Geliştirme

### Component Structure

```typescript
'use client'; // Client component gerekirse

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { BeneficiaryDocument } from '@/entities/collections';
import { useAuthStore } from '@/shared/stores/authStore';

interface BeneficiaryFormProps {
  initialData?: BeneficiaryDocument;
  onSubmit: (data: BeneficiaryFormData) => Promise<void>;
  onCancel?: () => void;
}

export function BeneficiaryForm({
  initialData,
  onSubmit,
  onCancel,
}: BeneficiaryFormProps) {
  // 1. Hooks
  const user = useAuthStore((state) => state.user);
  
  // 2. State
  const [isLoading, setIsLoading] = useState(false);
  
  // 3. Handlers
  const handleSubmit = async (data: BeneficiaryFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 4. Render
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### Component Best Practices

1. **Prop Types**: Interface ile tip tanımlayın
2. **Default Props**: Default parametreler kullanın
3. **Conditional Rendering**: `&&` veya ternary operatör
4. **Error Boundaries**: Hata yönetimi için Error Boundary kullanın
5. **Loading States**: Loading durumlarını gösterin

```typescript
// ✅ Good - Loading state
if (isLoading) {
  return <LoadingSpinner />;
}

// ✅ Good - Error handling
if (error) {
  return <ErrorMessage error={error} />;
}

// ✅ Good - Empty state
if (items.length === 0) {
  return <EmptyState message="Henüz kayıt yok" />;
}
```

### Page Components

Next.js App Router'da sayfa bileşenleri:

```typescript
// app/(dashboard)/yardim/page.tsx
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { DataTable } from '@/shared/components/ui/data-table';

export default function YardimPage() {
  return (
    <PageLayout
      title="Yardım Yönetimi"
      description="İhtiyaç sahipleri ve yardım başvuruları"
      icon="Heart"
    >
      <DataTable
        // ...
      />
    </PageLayout>
  );
}
```

## 🔄 State Management

### Zustand Stores

Proje state yönetimi için Zustand kullanır:

```typescript
// shared/stores/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        login: async (email, password) => {
          // ...
        },
        logout: () => {
          set({ user: null, isAuthenticated: false });
        },
      }),
      { name: 'auth-store' }
    ),
    { name: 'AuthStore' }
  )
);
```

### Store Best Practices

1. **Selectors**: Performans için selector kullanın
2. **Actions**: State değişiklikleri action'lar içinde
3. **Persistence**: Gerekli state'i persist edin
4. **DevTools**: Development'ta devtools kullanın

```typescript
// ✅ Good - Selector kullanımı
const user = useAuthStore((state) => state.user);
const login = useAuthStore((state) => state.login);

// ❌ Bad - Tüm store'u subscribe
const authStore = useAuthStore();
```

### React Query (TanStack Query)

Server state için React Query kullanılır:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBeneficiaries, createBeneficiary } from '@/shared/lib/api';

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['beneficiaries', filters],
  queryFn: () => getBeneficiaries(filters),
});

// Mutation
const mutation = useMutation({
  mutationFn: createBeneficiary,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
  },
});
```

## 🌐 API & Data Fetching

### Appwrite Client vs Server SDK

**⚠️ KRİTİK**: Appwrite SDK'larını karıştırmayın!

#### Client SDK (`appwrite` package)
- **Kullanım**: React component'lerde (client-side)
- **Dosya**: `src/shared/lib/appwrite/client.ts`
- **Özellikler**: User session, authentication, client-side queries

```typescript
// ✅ Client component'te
'use client';
import { clientDatabases } from '@/shared/lib/appwrite/client';

const beneficiaries = await clientDatabases.listDocuments(/* ... */);
```

#### Server SDK (`node-appwrite` package)
- **Kullanım**: API routes, Server Components, Server Actions
- **Dosya**: `src/shared/lib/appwrite/server.ts`
- **Özellikler**: Admin operations, API key ile yüksek yetki

```typescript
// ✅ API route'da
import { serverDatabases } from '@/shared/lib/appwrite/server';

export async function GET() {
  const beneficiaries = await serverDatabases.listDocuments(/* ... */);
  return NextResponse.json(beneficiaries);
}
```

### API Routes Pattern

```typescript
// app/api/beneficiaries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@/shared/lib/appwrite/server';
import { validateSession } from '@/shared/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Permission check
    if (!hasPermission(user, Permission.BENEFICIARIES_READ)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Get data
    const beneficiaries = await serverDatabases.listDocuments(/* ... */);

    // 4. Return response
    return NextResponse.json({ data: beneficiaries });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Error Handling

```typescript
// ✅ Good - Error handling
try {
  const result = await apiCall();
  return NextResponse.json({ data: result });
} catch (error) {
  console.error('API Error:', error);
  
  if (error instanceof AppwriteException) {
    return NextResponse.json(
      { error: error.message },
      { status: error.code || 500 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## 🔒 Güvenlik Kuralları

### 1. Input Validation

Her zaman Zod schema ile validate edin:

```typescript
import { z } from 'zod';

const beneficiarySchema = z.object({
  name: z.string().min(2).max(100),
  tc_no: z.string().regex(/^\d{11}$/),
  email: z.string().email().optional(),
});

// API route'da
const body = await request.json();
const validatedData = beneficiarySchema.parse(body);
```

### 2. XSS Protection

DOMPurify ile HTML sanitization:

```typescript
import DOMPurify from 'isomorphic-dompurify';

const cleanHtml = DOMPurify.sanitize(userInput);
```

### 3. CSRF Protection

Tüm state-changing operations için CSRF token:

```typescript
// Client-side
const csrfResponse = await fetch('/api/csrf');
const { token } = await csrfResponse.json();

await fetch('/api/beneficiaries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': token,
  },
  body: JSON.stringify(data),
});
```

### 4. Permission Checks

Her zaman permission kontrolü yapın:

```typescript
// Component'te
const hasPermission = useAuthStore((state) => 
  state.hasPermission(Permission.BENEFICIARIES_CREATE)
);

if (!hasPermission) {
  return null; // veya <AccessDenied />
}

// API route'da
if (!user.permissions.includes(Permission.BENEFICIARIES_CREATE)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 5. Rate Limiting

Sensitive endpoints'lerde rate limiting:

```typescript
import { rateLimit } from '@/shared/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  try {
    await limiter.check(10, request.ip); // 10 requests per minute
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  // ...
}
```

## 🧪 Testing

### Unit Tests (Vitest)

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatTCNo } from '@/shared/lib/utils';

describe('formatTCNo', () => {
  it('should format TC number correctly', () => {
    expect(formatTCNo('12345678901')).toBe('123 456 78 901');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/beneficiary.test.ts
import { describe, it, expect } from 'vitest';
import { createBeneficiary } from '@/shared/lib/api';

describe('Beneficiary API', () => {
  it('should create beneficiary', async () => {
    const result = await createBeneficiary({
      name: 'Test User',
      tc_no: '12345678901',
    });
    expect(result.success).toBe(true);
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/beneficiaries.spec.ts
import { test, expect } from '@playwright/test';

test('should create beneficiary', async ({ page }) => {
  await page.goto('/yardim/ihtiyac-sahipleri');
  await page.click('text=Yeni Kayıt');
  await page.fill('input[name="name"]', 'Test User');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Kayıt başarıyla oluşturuldu')).toBeVisible();
});
```

### Test Coverage

Hedef: %80+ coverage

```bash
npm run test:coverage
```

## 📝 Git Workflow

### Branch Naming

- `feature/beneficiary-form` - Yeni feature
- `fix/login-error` - Bug fix
- `refactor/api-structure` - Refactoring
- `docs/api-guide` - Dokümantasyon

### Commit Messages

Conventional Commits formatı:

```
feat: add beneficiary form validation
fix: resolve login CSRF token issue
refactor: simplify API error handling
docs: update development guide
test: add unit tests for beneficiary utils
```

### Pull Request

PR oluştururken:

1. **Title**: Açıklayıcı başlık
2. **Description**: Değişikliklerin özeti
3. **Testing**: Test edilen senaryolar
4. **Screenshots**: UI değişiklikleri için
5. **Breaking Changes**: Varsa belirtin

## 📚 Kaynaklar

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Appwrite Documentation](https://appwrite.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

