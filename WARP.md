# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Dernek Yönetim Sistemi** is a comprehensive management system for Turkish non-profit associations. Built with Next.js 16, TypeScript, and currently using mock backend for development, with ready integration for Appwrite as the real backend.

**Status:** MVP complete, migrated from React + Vite to Next.js 16, ready for production backend integration.

## Commands

### Development
```bash
npm install                # Install dependencies
npm run dev               # Start dev server (http://localhost:3000)
npm run build             # Production build
npm start                 # Start production server
npm run lint              # Run ESLint (uses eslint 9 with next/typescript config)
```

### Testing Credentials (Mock Auth)
- Admin: `admin@test.com` / `admin123`
- Manager: `manager@test.com` / `manager123`
- Member: `member@test.com` / `member123`
- Viewer: `viewer@test.com` / `viewer123`

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router, React 19.2)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4 with @tailwindcss/postcss
- **UI Components:** shadcn/ui (New York style) built on Radix UI
- **State Management:** Zustand with immer, persist, subscribeWithSelector, devtools
- **Data Fetching:** TanStack Query v5 (React Query)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React (optimized in next.config.ts)
- **Notifications:** Sonner
- **Backend Integration:** Appwrite (both client `v21.2.1` and server `v20.2.1` SDKs)

### Project Structure
```
src/
├── app/                       # Next.js App Router
│   ├── (dashboard)/          # Protected route group
│   ├── login/                # Login page
│   ├── api/                  # API routes (CSRF, auth endpoints)
│   ├── providers.tsx         # TanStack Query + client context
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind + custom CSS variables
│   └── middleware.ts         # Auth middleware
├── components/
│   ├── layouts/              # Sidebar, main layout
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── appwrite/            # Client & server SDK wrappers
│   │   ├── client.ts        # Client SDK instance
│   │   ├── server.ts        # Server SDK instance
│   │   ├── config.ts        # Shared config
│   │   └── permissions.ts   # User label helpers
│   ├── api/
│   │   ├── mock-api.ts      # Mock backend (replace for real API)
│   │   ├── mock-auth-api.ts # Mock auth endpoints
│   │   └── appwrite-api.ts  # Appwrite integration layer
│   └── utils.ts             # cn(), utility functions
├── stores/                   # Zustand stores with persist
│   └── authStore.ts         # Auth state + permission helpers
├── types/
│   ├── auth.ts              # User, UserRole, Permission, ROLE_PERMISSIONS
│   └── beneficiary.ts       # Beneficiary models
├── data/mock/               # Mock JSON data (static)
├── hooks/                   # Custom React hooks
└── scripts/                 # Utility scripts
```

### Authentication & Authorization

**Current:** Cookie-based mock auth with localStorage fallback  
**Production:** Appwrite OAuth + API key auth

**Flow:**
1. **Middleware** (`src/middleware.ts`): Validates `auth-session` cookie, redirects to login if missing
2. **Auth Store** (`src/stores/authStore.ts`):
   - Zustand with persist middleware (localStorage)
   - Session expires after 24 hours
   - Rate limiting: 5 attempts → 15-min lockout
   - Mock API via `src/lib/api/mock-auth-api.ts`
3. **Authorization:**
   - 6 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
   - ~30 granular permissions (donations, beneficiaries, users, etc.)
   - `ROLE_PERMISSIONS` map in `src/types/auth.ts`
   - Helper methods: `hasPermission()`, `hasRole()`, `hasAnyPermission()`, `hasAllPermissions()`

### State Management Pattern

Uses Zustand with middleware composition:
```typescript
create<T>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({ /* state & actions */ }))
      )
    )
  )
)
```

- **Immer**: Immutable updates via draft mutations
- **Persist**: localStorage sync with custom storage
- **Subscriptions**: Efficient selector-based updates
- **DevTools**: Redux dev tools integration

### Data Fetching

**TanStack Query Setup** (`src/app/providers.tsx`):
- Default staleTime: 60 seconds
- `refetchOnWindowFocus: false`
- DevTools enabled in development

**Mock API** (`src/lib/api/mock-api.ts`):
- 300ms simulated network delay
- In-memory storage (no persistence across refreshes)
- Returns `ApiResponse<T>` with success/error structure
- Mock data from `src/data/mock/` (static JSON)

### UI Components

**shadcn/ui Configuration:**
- Style: "new-york", Base color: "neutral"
- CSS variables enabled
- Components added with: `npx shadcn@latest add <component>`

### Routing

**App Router Structure:**
- Route groups: `(dashboard)` for protected routes
- Turkish naming: `/yardim/ihtiyac-sahipleri`, `/bagis/liste`
- Dynamic routes: `[id]` for detail pages
- Protected by middleware

**Main Routes:**
- `/login` - Authentication
- `/genel` - Dashboard (default after login)
- `/yardim/ihtiyac-sahipleri` - Beneficiaries list/form
- `/yardim/ihtiyac-sahipleri/[id]` - Beneficiary detail
- `/bagis/liste` - Donations
- Many placeholder pages organized by module

### Important Implementation Details

1. **Language:** Turkish UI, route names, and user-facing strings
2. **Mock Data:** Static data in `src/data/mock/` - mutations don't persist
3. **Path Aliases:** Configured in `tsconfig.json` (@/, @/components, @/lib, etc.)
4. **Module Organization:** Sidebar navigation groups by business modules (Donations, Aid, Scholarships, etc.)
5. **TypeScript:** Strict mode enabled
6. **Styling:** Tailwind CSS v4 with custom CSS variables and animations

## Backend Integration (Appwrite)

**Currently:** Mock API with local JSON  
**Migration:** Replace `src/lib/api/mock-api.ts` and `src/lib/api/mock-auth-api.ts`

**Appwrite Setup:**
- Client SDK: `src/lib/appwrite/client.ts` (browser, user session auth)
- Server SDK: `src/lib/appwrite/server.ts` (API routes, admin operations)
- Config: `src/lib/appwrite/config.ts` (endpoint, project ID)
- Use server SDK in API routes with APPWRITE_API_KEY (never expose to client)

**Environment Variables:**
```
# Public (exposed to browser)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<project-id>

# Private (never exposed)
APPWRITE_API_KEY=<secret-api-key>
```

## Notes

- ESLint config uses Next.js core-web-vitals + TypeScript rules
- Next.js optimizations: lucide-react package imports, console removal in production
- No tests configured - add Jest or Vitest as needed
- CLAUDE.md contains similar guidance for Claude Code editor integration
