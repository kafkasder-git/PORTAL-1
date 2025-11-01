# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Dernek Yönetim Sistemi** (Association Management System) - a production-ready Turkish NGO management platform built with:
- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Appwrite** (Backend-as-a-Service)
- **TailwindCSS** + Radix UI
- **Zustand** (client state) + **TanStack Query v5** (server state)

---

## Common Commands

### Development
```bash
npm run dev              # Start dev server with Turbo
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
npm run analyze          # Analyze bundle size
```

### Testing
```bash
npm run test             # Run unit tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm run test:ui          # Run tests with Vitest UI
npm run e2e              # Run Playwright E2E tests
npm run e2e:ui           # Run E2E tests with UI
npm run test:all         # Full test suite (unit + E2E + boundaries + integration)
```

### Debugging & Diagnostics
```bash
npm run debug:hydration  # Debug hydration issues
npm run diagnose         # Diagnose Appwrite connection
npm run health:check     # Health check endpoint
npm run clean            # Clean .next cache
npm run clean:all        # Full clean + reinstall
```

### Appwrite
```bash
npm run setup:appwrite   # Setup Appwrite configuration
npm run validate:config  # Validate environment config
npm run test:connectivity # Test Appwrite connectivity
```

---

## Architecture Overview

### High-Level Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Route groups (12+ feature pages)
│   │   ├── analytics/      # Analytics dashboard
│   │   ├── audit-logs/     # Security audit logs
│   │   ├── calendar/       # Event calendar
│   │   ├── dashboard/      # Customizable dashboard
│   │   ├── documents/      # Document management
│   │   ├── performance/    # Performance monitoring
│   │   ├── search/         # Global search
│   │   └── workflows/      # Workflow automation
│   └── api/                # API routes
│       ├── 2fa/            # Two-factor authentication
│       ├── analytics/      # Analytics API
│       ├── audit-logs/     # Audit logging
│       ├── bulk-operations/# Batch operations
│       ├── documents/      # Document CRUD
│       ├── meetings/       # Meeting management
│       ├── mernis/         # Turkish identity verification
│       ├── notifications/  # Notification system
│       ├── search/         # Search API
│       └── workflows/      # Workflow API
├── features/               # Feature-based modules
│   ├── analytics/          # Analytics feature
│   ├── audit/              # Audit logging
│   ├── beneficiaries/      # Beneficiary management
│   ├── dashboard/          # Dashboard widgets
│   ├── donations/          # Donation tracking
│   ├── meetings/           # Meeting management
│   └── messaging/          # Communication
├── shared/                 # Shared code
│   ├── components/ui/      # 57 shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/
│   │   ├── appwrite/      # SDK configuration (separate client/server)
│   │   ├── services/      # Business logic (12+ services)
│   │   ├── optimization/  # Performance utilities
│   │   ├── utils/         # Helper functions
│   │   └── validations/   # Zod schemas
│   └── stores/            # Zustand state stores
├── entities/              # TypeScript interfaces/types
└── __tests__/            # Test suites
    ├── services/          # Service tests
    ├── hooks/             # Hook tests
    ├── integration/       # Integration tests
    └── mocks/             # Test mocks
```

### Design Patterns

**1. Feature-Based Organization**
- Each domain feature has its own module in `/features/`
- Shared components in `/shared/components/ui/`
- Business logic in `/shared/lib/services/`

**2. State Management**
- **Zustand**: Client-side state (auth, UI state) - use selectors for performance
- **TanStack Query v5**: Server-side state (API data) - always define proper query keys

**3. Type-First Development**
- All TypeScript interfaces in `/entities/`
- Strict TypeScript mode - NO `any` types
- Use Zod for runtime validation

---

## Critical Development Rules

### ⚠️ Appwrite SDK Separation (NEVER MIX!)

**Client SDK** (`appwrite` package - browser-side):
- ✅ Use in: Client Components, Browser-side code
- ✅ File: `src/shared/lib/appwrite/client.ts`
- ✅ Import: `import { clientDatabases } from '@/shared/lib/appwrite/client'`
- ❌ NEVER use in: API routes, Server Components, Server Actions

**Server SDK** (`node-appwrite` package - server-side):
- ✅ Use in: API Routes, Server Components, Server Actions
- ✅ File: `src/shared/lib/appwrite/server.ts`
- ✅ Import: `import { serverDatabases } from '@/shared/lib/appwrite/server'`
- ❌ NEVER use in: Client Components, Browser-side code

### Security Requirements (ALWAYS)
- ✅ Validate ALL input with Zod schemas
- ✅ Sanitize ALL HTML output with DOMPurify
- ✅ Check permissions BEFORE operations (6 roles, 30+ permissions)
- ✅ Include CSRF token in state-changing requests
- ✅ Use HttpOnly cookies for session management

### API Route Pattern
```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateSession(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Permission check
    if (!hasPermission(user, Permission.RESOURCE_READ)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Validation (if POST/PUT)
    // 4. Business logic
    // 5. Return response
    return NextResponse.json({ success: true, data: ... });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Component Structure
```typescript
'use client'; // Only if needed

// 1. Imports
// 2. Types/Interfaces
// 3. Component
export function Component({ prop }: ComponentProps) {
  // 4. Hooks
  // 5. State
  // 6. Handlers
  // 7. Render
  return (...)
}
```

### Permission System
- **6 Roles**: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
- **30+ Permissions**: Format `resource:action` (e.g., `beneficiaries:create`)
- Always check permissions BOTH client-side AND server-side

### Error Handling
- Always use try-catch in async operations
- Always handle loading, error, and empty states in UI
- Always return consistent error format: `{ success: false, error: "message" }`

---

## Testing Standards

**Framework**: Vitest + React Testing Library + Playwright

**Coverage Requirements** (enforced):
- Overall: 90%
- Services: 95%
- UI Components: 85%
- Current: 88.9% (209/235 tests passing)

**Test Structure**:
- Unit tests in `*.test.ts` files alongside source
- Integration tests in `src/__tests__/integration/`
- E2E tests with Playwright in `e2e/` directory

**Running Tests**:
```bash
npm run test              # Watch mode
npm run test:coverage     # Coverage report
npm run e2e               # E2E tests
npm run test:all          # Complete test suite
```

---

## Key Features Implemented

1. **Automated Workflow Engine** - 7 triggers, 9 actions, visual builder
2. **Security (2FA + Audit Logs)** - TOTP authentication, comprehensive logging
3. **Performance Optimization** - Multi-layer caching, Web Vitals monitoring
4. **Mobile Responsiveness** - Mobile-first design, touch-friendly
5. **Dark Mode** - System preference detection, smooth transitions
6. **Customizable Dashboard** - Drag-drop widgets, 8 widget types
7. **Bulk Operations** - 7 bulk actions, progress tracking
8. **Test Coverage** - 88.9% coverage, 235 tests

---

## Common Patterns

### Data Fetching (Client)
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['beneficiaries', filters],
  queryFn: () => fetchBeneficiaries(filters),
});
```

### Data Fetching (Server)
```typescript
import { serverDatabases } from '@/shared/lib/appwrite/server';

const data = await serverDatabases.listDocuments(/* ... */);
```

### Form Handling
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(beneficiarySchema),
});
```

### Permission Check
```typescript
// Client
const hasPermission = useAuthStore((state) =>
  state.hasPermission(Permission.BENEFICIARIES_CREATE)
);

// Server
if (!user.permissions.includes(Permission.BENEFICIARIES_CREATE)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## File Naming Conventions

- **Components**: PascalCase.tsx (e.g., `BeneficiaryForm.tsx`)
- **Utils**: camelCase.ts (e.g., `sanitization.ts`)
- **Types**: camelCase.types.ts (e.g., `beneficiary.types.ts`)
- **Services**: camelCase.service.ts (e.g., `user.service.ts`)

---

## Turkish Language Context

- **UI Text**: Turkish language (user-facing text)
- **Code**: English (variable names, functions, comments)
- **Error Messages**: Turkish (shown to users)
- **Documentation**: Can be in English or Turkish

---

## Performance Targets

- **Initial Bundle**: < 250KB
- **Total Bundle**: < 1MB
- **Core Web Vitals**:
  - FCP: < 1s
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1

---

## Important Files & Documentation

- **`.cursorrules`** - Critical development rules (Appwrite SDK separation, TypeScript, Security)
- **`docs/PROJECT_SUMMARY.md`** - Complete feature documentation
- **`vitest.config.ts`** - Test configuration with coverage thresholds
- **`next.config.ts`** - Build configuration with optimizations
- **`src/shared/lib/appwrite/`** - Separate client/server SDK configurations

Additional documentation in `docs/`:
- `WORKFLOW_ENGINE.md` - Workflow automation
- `SECURITY_GUIDE.md` - 2FA and audit logging
- `PERFORMANCE_OPTIMIZATION.md` - Caching and monitoring
- `MOBILE_RESPONSIVENESS.md` - Mobile design patterns
- `DARK_MODE.md` - Theme system
- `CUSTOMIZABLE_DASHBOARD.md` - Widget system
- `BULK_OPERATIONS.md` - Batch operations
- `TEST_COVERAGE_REPORT.md` - Testing strategy

---

## Development Tips

1. **Start with existing patterns** - Check similar features for established patterns
2. **Validate early** - Use Zod schemas for all inputs
3. **Test coverage matters** - Maintain 90%+ coverage (95% for services)
4. **Mobile-first** - All UI components must be responsive
5. **Type safety** - Define explicit types, never use `any`
6. **Permission checks** - Implement at both client and server levels

---

## Environment Variables

Required:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_DATABASE_ID=
```

Optional:
```env
NEXT_PUBLIC_CDN_URL=
```

---

## When in Doubt

1. Check existing similar code in the project
2. Follow patterns already established in `.cursorrules`
3. Read relevant documentation in `docs/` folder
4. Reference `PROJECT_SUMMARY.md` for feature implementation details
