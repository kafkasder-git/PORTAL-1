# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Dernek Yönetim Sistemi** (Association Management System) - a comprehensive management system for Turkish non-profit associations, built with Next.js 16, TypeScript, and Appwrite backend.

**Project Status:** MVP complete - migrated from React + Vite to Next.js 16, using Appwrite for backend services.

## Commands

### Development
```bash
npm install        # Install dependencies
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
npm run analyze    # Analyze bundle size
```

### Testing
```bash
# Unit/Integration tests (Vitest)
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage report

# E2E tests (Playwright)
npm run e2e          # Run E2E tests
npm run e2e:ui       # Run E2E tests with UI
```

### Environment Setup
Create a `.env.local` file with the following variables:
```bash
# Appwrite Configuration (Required)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-secret-api-key  # Server-side only, never expose to client

# Database & Storage
NEXT_PUBLIC_DATABASE_ID=dernek_db
NEXT_PUBLIC_STORAGE_DOCUMENTS=documents
NEXT_PUBLIC_STORAGE_RECEIPTS=receipts
NEXT_PUBLIC_STORAGE_PHOTOS=photos
NEXT_PUBLIC_STORAGE_REPORTS=reports
```

### Appwrite Test Users
The system uses Appwrite authentication. Test accounts can be created using:
```bash
npx tsx src/scripts/create-test-users.ts
```

Default test credentials (if created):
- Admin: `admin@test.com` / `admin123`
- Manager: `manager@test.com` / `manager123`
- Member: `member@test.com` / `member123`
- Viewer: `viewer@test.com` / `viewer123`

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Backend:** Appwrite (Cloud BaaS)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui (New York style)
- **State Management:** Zustand with Immer, Persist, and DevTools middlewares
- **Data Fetching:** TanStack Query (React Query v5)
- **Forms:** React Hook Form + Zod v4 validation
- **UI Components:** Radix UI primitives via shadcn/ui
- **Icons:** Lucide React
- **Notifications:** Sonner (toast library)
- **Testing:** Vitest (unit/integration) + Playwright (E2E)

### Project Structure
```
src/
├── app/                       # Next.js App Router
│   ├── (dashboard)/          # Dashboard route group (protected)
│   ├── api/                  # API routes (auth, beneficiaries, etc.)
│   ├── login/                # Login page
│   ├── providers.tsx         # Client-side providers (TanStack Query)
│   └── layout.tsx            # Root layout
├── components/
│   ├── layouts/              # Layout components (Sidebar)
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── appwrite-api.ts  # Appwrite API wrapper
│   │   └── mock-api.ts      # Mock API (fallback for development)
│   ├── appwrite/
│   │   ├── client.ts        # Client SDK (browser, 'use client')
│   │   ├── server.ts        # Server SDK (API routes, Node.js)
│   │   ├── config.ts        # Shared configuration
│   │   └── permissions.ts   # Appwrite permission helpers
│   ├── validations/         # Zod schemas (beneficiary, task, etc.)
│   ├── csrf.ts              # CSRF protection
│   ├── security.ts          # Security utilities
│   ├── performance.ts       # Performance monitoring
│   └── utils.ts             # Utility functions (cn, etc.)
├── stores/
│   └── authStore.ts          # Zustand auth store (Appwrite integration)
├── types/
│   ├── auth.ts               # Auth types, UserRole, Permission, ROLE_PERMISSIONS
│   ├── beneficiary.ts        # Beneficiary types
│   ├── collections.ts        # Appwrite collection types
│   └── appwrite.ts           # Appwrite-specific types
├── scripts/                  # Database setup & migration scripts
├── __tests__/                # Vitest unit tests
└── middleware.ts             # Auth middleware (Appwrite session checking)
```

### Appwrite Backend Integration

**Critical Architecture Principle:** This project uses **two different Appwrite SDKs** for client and server operations.

#### 1. Client SDK (`appwrite` package)
**File:** `src/lib/appwrite/client.ts`
**Directive:** `'use client'` (required for Next.js App Router)
**Environment:** Browser/React Components
**Authentication:** User sessions (no API key)

**Use Cases:**
- ✅ Client Components (`'use client'`)
- ✅ User authentication (login/logout)
- ✅ Session management
- ✅ User-specific data queries
- ✅ File uploads from browser

**Example:**
```typescript
'use client';
import { account, databases } from '@/lib/appwrite/client';

const user = await account.get();
const data = await databases.listDocuments(DB_ID, COLLECTION_ID);
```

#### 2. Server SDK (`node-appwrite` package)
**File:** `src/lib/appwrite/server.ts`
**Environment:** Server Components/API Routes
**Authentication:** API Key (admin permissions)

**Use Cases:**
- ✅ Server Components (no 'use client')
- ✅ API Routes (`/app/api/*`)
- ✅ Server Actions
- ✅ Admin operations (user management)
- ✅ Bulk operations

**Example:**
```typescript
import { serverDatabases, serverUsers } from '@/lib/appwrite/server';

const users = await serverUsers.list();
const data = await serverDatabases.listDocuments(DB_ID, COLLECTION_ID);
```

#### Security Model
| Aspect | Client SDK | Server SDK |
|--------|-----------|------------|
| **Permissions** | User-level | Admin-level |
| **API Key** | ❌ Not used | ✅ Required |
| **Exposed to Browser** | ✅ Yes | ❌ No |

⚠️ **Never import server SDK in client components!** This will expose your API key.

#### Common Mistakes to Avoid
```typescript
// ❌ WRONG: Using server SDK in client component
'use client';
import { serverDatabases } from '@/lib/appwrite/server'; // ERROR!

// ✅ CORRECT: Using client SDK in client component
'use client';
import { databases } from '@/lib/appwrite/client';

// ✅ CORRECT: Using server SDK in server component or API route
import { serverDatabases } from '@/lib/appwrite/server';
```

### Authentication & Authorization

**Implementation:** Appwrite authentication with HttpOnly cookies and CSRF protection

1. **Login Flow:**
   - Client calls `/api/auth/login` API route
   - Server creates Appwrite session using Server SDK
   - Session stored in HttpOnly cookie (secure)
   - CSRF token validation on all mutations
   - Rate limiting: 5 attempts, 15-minute lockout

2. **Auth Store** (`src/stores/authStore.ts`):
   - Zustand store with persist middleware
   - Stores user info (not session token) in localStorage
   - Session token kept in HttpOnly cookie
   - Integrates with Appwrite via API routes

3. **Authorization:**
   - Role-based permissions defined in `src/types/auth.ts`
   - 6 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
   - ~30 granular permissions (donations, beneficiaries, users, etc.)
   - `ROLE_PERMISSIONS` maps each role to specific permissions
   - Helper methods: `hasPermission()`, `hasRole()`, `hasAnyPermission()`, `hasAllPermissions()`

4. **Route Protection:**
   - Dashboard routes in `(dashboard)` route group
   - Middleware checks Appwrite session cookie
   - Redirects unauthenticated users to `/login`
   - Shows loading spinner during auth initialization

### State Management

**Zustand Pattern:**
- Store setup: `create()` + `devtools()` + `subscribeWithSelector()` + `persist()` + `immer()`
- State and actions separated in TypeScript interfaces
- Selectors exported for performance optimization
- Uses Immer for immutable state updates

**Example from authStore:**
```typescript
export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          // state...
          login: async (email, password) => {
            set((state) => { state.isLoading = true; });
            // ...
          }
        }))
      )
    )
  )
);
```

### Data Fetching

**TanStack Query Setup:**
- QueryClient configured in `src/app/providers.tsx`
- Default staleTime: 60 seconds
- `refetchOnWindowFocus: false`
- DevTools enabled in development

**API Layer:**
- Primary: `src/lib/api/appwrite-api.ts` (Appwrite integration)
- Fallback: `src/lib/api/mock-api.ts` (development/testing)
- Returns `ApiResponse<T>` with data/error structure
- Supports pagination, search, filtering via Appwrite queries

### UI Components (shadcn/ui)

**Configuration:**
- Style: "new-york"
- Base color: neutral
- CSS variables enabled
- Path aliases: `@/components`, `@/lib/utils`, etc.

**Important:** When adding new shadcn components, use:
```bash
npx shadcn@latest add <component-name>
```

### Routing

**App Router Structure:**
- Route groups: `(dashboard)` for protected routes
- Turkish route naming (e.g., `/yardim/ihtiyac-sahipleri`)
- Dynamic routes: `[id]` for detail pages
- Middleware-protected routes

**Main Routes:**
- `/login` - Login page
- `/genel` - Dashboard (default after login)
- `/yardim/ihtiyac-sahipleri` - Beneficiaries list
- `/yardim/ihtiyac-sahipleri/[id]` - Beneficiary detail
- `/bagis/liste` - Donations list
- Many placeholder pages for future features

### Path Aliases

Configured in `tsconfig.json`:
```json
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/stores/*": ["./src/stores/*"],
  "@/types/*": ["./src/types/*"],
  "@/data/*": ["./src/data/*"]
}
```

## Appwrite Database Structure

**Database ID:** `dernek_db` (configured in `.env.local`)

**Collections:**
- `users` - User accounts and profiles
- `beneficiaries` - İhtiyaç sahipleri (beneficiaries)
- `donations` - Bağışlar (donations)
- `aid_requests` - Yardım talepleri
- `aid_applications` - Yardım başvuruları
- `scholarships` - Burslar (scholarships)
- `parameters` - System parameters
- `tasks` - Görevler (tasks)
- `meetings` - Toplantılar (meetings)
- `messages` - Mesajlar (messages)
- `finance_records` - Finans kayıtları
- `orphans` - Yetimler
- `sponsors` - Sponsorlar
- `campaigns` - Kampanyalar

**Storage Buckets:**
- `documents` - General documents
- `receipts` - Donation receipts (makbuzlar)
- `photos` - Photos and images
- `reports` - Generated reports

**Setup Scripts:**
```bash
# Test Appwrite connection
npx tsx src/scripts/test-appwrite-connection.ts

# Setup database and collections
npx tsx src/lib/appwrite/setup-database.ts

# Create test users
npx tsx src/scripts/create-test-users.ts

# Migrate data (if needed)
npx tsx src/scripts/migrate-to-appwrite.ts
```

## Module Organization

**Sidebar Navigation** (`src/components/layouts/Sidebar.tsx`):
The application is organized into modules, each with subpages:
- Ana Sayfa (Home) - Dashboard
- Bağışlar (Donations) - List, Reports, Piggy Bank
- Yardımlar (Aid) - Beneficiaries, Applications, Lists, Cash Vault
- Burslar (Scholarships) - Students, Applications, Orphans
- Fonlar (Funds) - Income/Expense, Reports
- Mesajlar (Messages) - Internal, Bulk
- İşler (Tasks) - Tasks, Meetings
- Partnerler (Partners) - List
- Kullanıcılar (Users)
- Ayarlar (Settings)

## Important Development Notes

1. **Language:** Application is in Turkish - maintain Turkish naming for routes, UI text, and user-facing strings
2. **Client Components:** Most components use `'use client'` directive due to Zustand and TanStack Query
3. **TypeScript:** Strict mode enabled - maintain type safety
4. **Styling:** Uses Tailwind CSS v4 with @tailwindcss/postcss
5. **Appwrite SDK Selection:** Always use correct SDK (client.ts vs server.ts) - see Appwrite Backend Integration section
6. **Environment Variables:** Never commit `.env.local` - keep API keys secure
7. **CSRF Protection:** All mutations require CSRF tokens from `/api/csrf`
8. **File Uploads:** Use Appwrite Storage buckets with proper permissions

## Code Verification (Kluster Rules)

This project uses automated code verification via Kluster. Important rules:

### Automatic Code Review
- **Trigger:** Runs automatically after ANY file creation or modification
- **Applies to:** All file types (not just code)
- **Required:** Follow field descriptions strictly in review responses

### Manual Code Review
- **Trigger:** Only when explicitly requested by user
- **Commands:** "verify with kluster", "verify this file", "check for bugs", "check security"

### Dependency Validation
- **Trigger:** Before adding packages or updating package.json
- **Purpose:** Validate security and compatibility

### Chat ID Management
- **First call:** Do not include `chat_id` field
- **Subsequent calls:** Always include `chat_id` from previous response
- **Critical:** Missing `chat_id` breaks verification chain

### Todo List Management
- **Execute:** Always follow `agent_todo_list` from kluster responses
- **Complete:** Do not stop until all items are finished
- **Workflow:** Complete all fixes before running next verification

### End-of-Session Summary
When kluster tools are used, always provide summary before final response:
- **Kluster feedback:** All issues found (grouped by severity)
- **Issues found and fixed:** Changes applied to resolve issues
- **Impact Assessment:** What would have happened without fixes
