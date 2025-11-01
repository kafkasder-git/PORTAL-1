# Architecture Documentation - Mimari Dokümantasyon

Bu doküman, Dernek Yönetim Sistemi'nin teknik mimarisini ve tasarım kararlarını detaylı olarak açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Mimari Katmanlar](#mimari-katmanlar)
3. [Teknoloji Stack](#teknoloji-stack)
4. [Veri Modeli](#veri-modeli)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Architecture](#api-architecture)
7. [State Management](#state-management)
8. [Deployment](#deployment)

## 🏗️ Genel Bakış

### Mimari Stil

Proje **Feature-Sliced Design (FSD)** prensiplerini takip eder ve **Next.js App Router** üzerine kurulmuştur.

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                  │
│  (React Components, Pages, UI Components)       │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│              Application Layer                   │
│  (API Routes, Server Actions, State Management) │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│              Domain Layer                        │
│  (Entities, Types, Business Logic)              │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│              Infrastructure Layer                │
│  (Appwrite Client, Database, Storage)           │
└─────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Her katmanın net sorumlulukları var
2. **Feature-Based Organization**: Modüller özellik bazlı organize
3. **Type Safety**: Tam TypeScript tip güvenliği
4. **Security First**: Her katmanda güvenlik önlemleri
5. **Scalability**: Ölçeklenebilir mimari yapı

## 📦 Mimari Katmanlar

### 1. Presentation Layer

#### Pages (App Router)

Next.js App Router ile route-based sayfa yönetimi:

```
app/
├── (dashboard)/          # Route group (shared layout)
│   ├── yardim/          # Feature routes
│   │   ├── page.tsx     # List page
│   │   └── [id]/        # Detail page
│   └── layout.tsx       # Dashboard layout
├── api/                 # API routes
└── login/               # Public routes
```

#### Components Hierarchy

```
shared/components/
├── ui/                  # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── layout/              # Layout components
│   ├── PageLayout.tsx
│   └── Sidebar.tsx
└── [feature-specific]   # Feature-specific reusable components

features/[feature]/
└── components/          # Feature-specific components
    ├── BeneficiaryForm.tsx
    └── BeneficiaryList.tsx
```

### 2. Application Layer

#### API Routes (Next.js API)

RESTful API endpoints:

```typescript
app/api/
├── beneficiaries/
│   ├── route.ts         # GET (list), POST (create)
│   └── [id]/
│       └── route.ts     # GET (detail), PUT (update), DELETE
└── auth/
    ├── login/route.ts
    └── logout/route.ts
```

**Request Flow:**
```
Client Request
    ↓
Middleware (Auth Check)
    ↓
API Route Handler
    ↓
Permission Validation
    ↓
Business Logic
    ↓
Appwrite Server SDK
    ↓
Response
```

#### Server Actions (Future)

Next.js Server Actions ile form handling:

```typescript
// app/actions/beneficiaries.ts
'use server';

export async function createBeneficiary(formData: FormData) {
  // Server-side validation
  // Appwrite operation
  // Return result
}
```

### 3. Domain Layer

#### Entities

Domain model tanımları:

```typescript
entities/
├── auth.ts              # User, Role, Permission
├── collections.ts       # Appwrite document types
└── index.ts            # Re-exports
```

#### Features

Feature modules (business logic):

```
features/
├── beneficiaries/
│   ├── components/      # Feature UI
│   ├── types/          # Feature types
│   ├── validations/    # Zod schemas
│   └── index.ts        # Public API
```

### 4. Infrastructure Layer

#### Appwrite Integration

**Client SDK** (Browser):
- Authentication
- User sessions
- Client-side queries

**Server SDK** (Node.js):
- Admin operations
- Server-side queries
- File operations

#### Data Access Pattern

```typescript
// Client-side data fetching
import { useQuery } from '@tanstack/react-query';
import { clientDatabases } from '@/shared/lib/appwrite/client';

const { data } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => clientDatabases.listDocuments(/* ... */),
});

// Server-side data fetching
import { serverDatabases } from '@/shared/lib/appwrite/server';

export async function GET() {
  const data = await serverDatabases.listDocuments(/* ... */);
  return NextResponse.json(data);
}
```

## 🛠️ Teknoloji Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.0 | React framework (SSR/SSG) |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Radix UI | Latest | Headless UI components |
| Framer Motion | Latest | Animations |

### Backend & Services

| Service | Purpose |
|---------|---------|
| Appwrite | Backend-as-a-Service (Database, Auth, Storage) |
| Sentry | Error tracking & monitoring |

### State Management

| Library | Purpose |
|---------|---------|
| Zustand | Client state management |
| TanStack Query | Server state & caching |
| React Hook Form | Form state management |

### Development Tools

| Tool | Purpose |
|------|---------|
| Vitest | Unit testing |
| Playwright | E2E testing |
| ESLint | Code linting |
| TypeScript | Type checking |

## 📊 Veri Modeli

### Database Structure (Appwrite)

#### Collections

1. **users** - Kullanıcı bilgileri
2. **beneficiaries** - İhtiyaç sahipleri
3. **donations** - Bağış kayıtları
4. **aid_applications** - Yardım başvuruları
5. **scholarships** - Burs kayıtları
6. **tasks** - Görevler
7. **meetings** - Toplantılar
8. **messages** - Mesajlar
9. **finance_records** - Finansal kayıtlar
10. **orphans** - Yetim öğrenciler
11. **sponsors** - Sponsorlar
12. **campaigns** - Kampanyalar
13. **parameters** - Parametrik kategoriler

#### Document Structure

```typescript
interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}
```

#### Relationships

- **One-to-Many**: Beneficiary → Aid Applications
- **One-to-Many**: User → Tasks (assigned)
- **Many-to-Many**: Meeting → Participants (Users)

### Storage Buckets

1. **documents** - Belge dosyaları
2. **photos** - Fotoğraflar
3. **receipts** - Makbuzlar
4. **reports** - Rapor dosyaları

## 🔐 Authentication & Authorization

### Authentication Flow

```
1. User submits credentials (email, password)
   ↓
2. Client sends POST /api/auth/login
   ↓
3. Server validates credentials (Appwrite Server SDK)
   ↓
4. Server creates session, sets HttpOnly cookie
   ↓
5. Client receives user data, updates Zustand store
   ↓
6. Middleware validates session on each request
```

### Session Management

- **Storage**: HttpOnly cookie (server-side) + localStorage (client-side metadata)
- **Duration**: 24 hours (default)
- **Refresh**: Automatic on activity
- **Security**: CSRF token required for state-changing operations

### Authorization (RBAC)

#### Roles

1. **SUPER_ADMIN**: Tüm yetkiler
2. **ADMIN**: Yönetim yetkileri
3. **MANAGER**: Operasyonel yetkiler
4. **MEMBER**: Standart kullanıcı yetkileri
5. **VIEWER**: Sadece okuma yetkisi
6. **VOLUNTEER**: Gönüllü yetkileri

#### Permissions

30+ granular permission:
- `users:read`, `users:create`, `users:update`, `users:delete`
- `beneficiaries:read`, `beneficiaries:create`, ...
- `donations:read`, `donations:create`, ...
- Ve diğerleri...

#### Permission Check Flow

```typescript
// Client-side
const hasPermission = useAuthStore((state) => 
  state.hasPermission(Permission.BENEFICIARIES_CREATE)
);

// Server-side
if (!user.permissions.includes(Permission.BENEFICIARIES_CREATE)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## 🌐 API Architecture

### API Design Principles

1. **RESTful**: RESTful conventions
2. **Stateless**: Her request bağımsız
3. **Security**: CSRF protection, rate limiting
4. **Validation**: Input validation (Zod)
5. **Error Handling**: Consistent error responses

### API Route Structure

```
/api
├── auth/
│   ├── login          POST   - User login
│   ├── logout         POST   - User logout
│   └── session        GET    - Get current session
├── beneficiaries/
│   ├── [GET]          GET    - List beneficiaries
│   ├── [POST]         POST   - Create beneficiary
│   └── [id]/
│       ├── [GET]      GET    - Get beneficiary
│       ├── [PUT]      PUT    - Update beneficiary
│       └── [DELETE]   DELETE - Delete beneficiary
└── ...
```

### Request/Response Format

#### Request

```typescript
// GET /api/beneficiaries?page=1&limit=10&search=test
Headers:
  Cookie: auth-session=...
  
// POST /api/beneficiaries
Headers:
  Cookie: auth-session=...
  Content-Type: application/json
  x-csrf-token: ...
Body:
  { name: "...", tc_no: "..." }
```

#### Response

```typescript
// Success
{
  success: true,
  data: { /* ... */ },
  total?: number
}

// Error
{
  success: false,
  error: "Error message",
  code?: "ERROR_CODE"
}
```

### Error Handling

Standardized error responses:

```typescript
// 400 Bad Request
{ error: "Validation failed", details: [...] }

// 401 Unauthorized
{ error: "Authentication required" }

// 403 Forbidden
{ error: "Insufficient permissions" }

// 404 Not Found
{ error: "Resource not found" }

// 500 Internal Server Error
{ error: "Internal server error" }
```

## 🔄 State Management

### Client State (Zustand)

**Auth Store**:
- User data
- Authentication state
- Permissions

**Other Stores** (Future):
- UI state (modals, sidebar)
- Form state (multi-step forms)

### Server State (TanStack Query)

**Query Keys Structure**:
```typescript
['beneficiaries']                    // List
['beneficiaries', id]                // Single
['beneficiaries', filters]           // Filtered list
['donations', beneficiaryId]         // Related data
```

**Cache Strategy**:
- Stale time: 1 minute
- Cache time: 5 minutes
- Refetch on window focus: Disabled
- Refetch on reconnect: Enabled

## 🚀 Deployment

### Build Process

```bash
1. npm run build          # Next.js build
2. Type checking          # tsc --noEmit
3. Linting                # eslint
4. Testing                # vitest run
5. Production bundle      # .next/standalone
```

### Environment Variables

**Required**:
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`

**Optional**:
- `SENTRY_DSN`
- `NEXT_PUBLIC_APP_URL`

### Deployment Platforms

- **Vercel**: Recommended (Next.js optimized)
- **Docker**: Container deployment
- **Self-hosted**: Node.js server

### Performance Optimizations

1. **Code Splitting**: Automatic route-based splitting
2. **Image Optimization**: Next.js Image component
3. **Bundle Analysis**: `npm run analyze`
4. **Caching**: Appwrite query caching + React Query
5. **Compression**: Gzip/Brotli compression

## 🔍 Monitoring & Observability

### Error Tracking (Sentry)

- Frontend errors
- API route errors
- Performance monitoring
- User session replay

### Analytics (Future)

- User activity tracking
- Feature usage metrics
- Performance metrics

## 📈 Scalability Considerations

### Current Limits

- **Database**: Appwrite limits
- **Storage**: Appwrite bucket limits
- **API**: Rate limiting per user

### Scaling Strategies

1. **Horizontal Scaling**: Multiple Next.js instances
2. **Database**: Appwrite auto-scaling
3. **Caching**: Redis for frequently accessed data
4. **CDN**: Static assets via CDN

## 🔒 Security Architecture

### Security Layers

1. **Network**: HTTPS only, security headers
2. **Authentication**: HttpOnly cookies, CSRF tokens
3. **Authorization**: RBAC with permission checks
4. **Input**: Validation + sanitization
5. **Output**: XSS protection, CSP headers
6. **Rate Limiting**: DDoS protection

### Security Headers

```typescript
// next.config.ts
headers: {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=63072000',
  'Content-Security-Policy': '...',
}
```

## 📚 References

- [Next.js Architecture](https://nextjs.org/docs)
- [Appwrite Architecture](https://appwrite.io/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)

