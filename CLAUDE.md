# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Dernek Yönetim Sistemi** (Association Management System) - a comprehensive management system for Turkish non-profit associations, built with Next.js 15, TypeScript, and currently using a mock backend for development.

**Project Status:** MVP complete - migrated from React + Vite to Next.js 15, ready for real backend integration.

## Commands

### Development
```bash
npm install        # Install dependencies
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

### Testing Credentials
The application uses mock authentication with these test accounts:
- Admin: `admin@test.com` / `admin123`
- Manager: `manager@test.com` / `manager123`
- Member: `member@test.com` / `member123`
- Viewer: `viewer@test.com` / `viewer123`

## Architecture

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (New York style)
- **State Management:** Zustand with Immer, Persist, and DevTools middlewares
- **Data Fetching:** TanStack Query (React Query v5)
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Radix UI primitives via shadcn/ui
- **Icons:** Lucide React
- **Notifications:** Sonner (toast library)

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard route group (protected)
│   ├── login/             # Login page
│   ├── providers.tsx      # Client-side providers (TanStack Query)
│   └── layout.tsx         # Root layout
├── components/
│   ├── layouts/           # Layout components (Sidebar)
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── api/
│   │   └── mock-api.ts    # Mock API service (replace for real backend)
│   └── utils.ts           # Utility functions (cn, etc.)
├── stores/
│   └── authStore.ts       # Zustand auth store with localStorage persistence
├── types/
│   └── auth.ts            # Auth types, UserRole enum, Permission enum, ROLE_PERMISSIONS
├── data/mock/             # Mock JSON data (users, beneficiaries, donations)
└── middleware.ts          # Auth middleware (session cookie checking)
```

### Authentication & Authorization

**Current Implementation:** Cookie-based mock authentication

1. **Middleware** (`src/middleware.ts`):
   - Checks `auth-session` cookie for authentication
   - Redirects unauthenticated users to `/login`
   - Redirects authenticated users away from auth pages to `/genel`
   - Excludes API routes, static files, and images

2. **Auth Store** (`src/stores/authStore.ts`):
   - Zustand store with persist middleware
   - Stores user, session, and auth state in localStorage
   - Session expires after 24 hours
   - Rate limiting: 5 login attempts, 15-minute lockout
   - Mock API integration via `src/lib/api/mock-api.ts`

3. **Authorization:**
   - Role-based permissions defined in `src/types/auth.ts`
   - 6 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
   - ~30 granular permissions (donations, beneficiaries, users, etc.)
   - `ROLE_PERMISSIONS` maps each role to specific permissions
   - Auth store provides helper methods: `hasPermission()`, `hasRole()`, `hasAnyPermission()`, `hasAllPermissions()`

4. **Route Protection:**
   - Dashboard routes in `(dashboard)` route group
   - Layout checks `isAuthenticated` and redirects to login if needed
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

**Mock API Service:**
- Located at `src/lib/api/mock-api.ts`
- Simulates 300ms network delay
- Returns `ApiResponse<T>` with data/error structure
- Supports pagination, search, and filtering
- Mock data from JSON files in `src/data/mock/`

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

## Backend Integration

**Current:** Mock API with local JSON data
**Migration Path:** Replace `src/lib/api/mock-api.ts` with real API client

When integrating a real backend:
1. Replace mock API functions in `src/lib/api/mock-api.ts`
2. Update `authStore.ts` login/logout to use real endpoints
3. Update middleware to validate real session tokens
4. Remove mock JSON data from `src/data/mock/`
5. Update TanStack Query hooks to use real API

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

## Important Notes

1. **Language:** Application is in Turkish - maintain Turkish naming for routes, UI text, and user-facing strings
2. **Mock Data:** Currently using static JSON files - data mutations don't persist across page refreshes
3. **Session Storage:** Uses localStorage for auth persistence (consider HttpOnly cookies for production)
4. **Client Components:** Most components use 'use client' directive due to Zustand and TanStack Query
5. **TypeScript:** Strict mode enabled - maintain type safety
6. **Styling:** Uses Tailwind CSS v4 with @tailwindcss/postcss
