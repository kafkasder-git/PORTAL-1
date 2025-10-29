# Full System Testing Guide

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Running Tests](#3-running-tests)
4. [Test Phases Explained](#4-test-phases-explained)
5. [Interpreting Results](#5-interpreting-results)
6. [Common Failures and Solutions](#6-common-failures-and-solutions)
7. [CI/CD Integration](#7-cicd-integration)
8. [Best Practices](#8-best-practices)

## 1. Overview

Full system testing validates that all components implemented in previous phases work together correctly:
- Hydration fixes (Zustand persist + skipHydration)
- Error boundaries (route, global, component-level)
- Loading states (LoadingOverlay + auth guards)
- Suspense boundaries (lazy loading + code splitting)
- Appwrite configuration (validation + connectivity)
- Debug utilities (HydrationLogger, StoreDebugger, NetworkMonitor)

## 2. Prerequisites

### Required
- Node.js 22+
- npm 10+
- `.env.local` file configured
- Development server NOT running (tests will start it)

### Optional
- Appwrite instance (if testing with real backend)
- Playwright installed (for browser tests)

### Setup
```bash
# Install dependencies
npm install

# Verify configuration
npm run validate:config

# Run full system test
npm run test:full-system
```

## 3. Running Tests

### Basic Usage
```bash
# Run all phases
npm run test:full-system

# Run specific phase
npx tsx scripts/full-system-test.ts --phase hydration

# Verbose output
npx tsx scripts/full-system-test.ts --verbose

# JSON output only
npx tsx scripts/full-system-test.ts --json > report.json

# Skip connectivity tests (faster)
npx tsx scripts/full-system-test.ts --skip-connectivity
```

## 4. Test Phases Explained

### Phase 1: Environment & Configuration Validation
- **What it tests:** Environment variables, configuration files, required dependencies
- **Duration:** ~5 seconds
- **Pass criteria:** All required variables set, valid formats, no missing files
- **Common failures:** Missing `.env.local`, invalid endpoint URL, wrong project ID
- **Fix:** Run `npm run validate:config` for detailed errors

### Phase 2: Hydration & Store Validation
- **What it tests:** Zustand store configuration, persist middleware, hydration logic
- **Duration:** ~10 seconds
- **Pass criteria:** `skipHydration: true` configured, `_hasHydrated` field exists, rehydration works
- **Common failures:** Missing hydration fixes, incorrect persist configuration
- **Fix:** Check `src/stores/authStore.ts` lines 300-315 for persist config

### Phase 3: Error Boundary Validation
- **What it tests:** Error boundary files exist, hydration error detection, recovery mechanisms
- **Duration:** ~5 seconds
- **Pass criteria:** All error boundary files exist, Sentry integration present, recovery buttons exist
- **Common failures:** Missing error boundary files, no hydration error detection
- **Fix:** Verify `src/app/error.tsx`, `src/app/global-error.tsx`, `src/components/error-boundary.tsx`

### Phase 4: Loading State Validation
- **What it tests:** LoadingOverlay component, variants, accessibility, usage in layouts
- **Duration:** ~5 seconds
- **Pass criteria:** All 5 variants exist, accessibility attributes present, used in auth flow
- **Common failures:** Missing variants, no accessibility attributes, not used in layouts
- **Fix:** Check `src/components/ui/loading-overlay.tsx` and usage in layouts

### Phase 5: Suspense Boundary Validation
- **What it tests:** SuspenseBoundary component, React.Suspense wrapper, ErrorBoundary integration
- **Duration:** ~5 seconds
- **Pass criteria:** Component exists, wraps children in Suspense, integrates ErrorBoundary
- **Common failures:** Component missing, no Suspense wrapper, no error handling
- **Fix:** Verify `src/components/ui/suspense-boundary.tsx` exists and is properly implemented

### Phase 6: Appwrite Configuration Validation
- **What it tests:** Appwrite connectivity, SDK initialization, mock API (if configured)
- **Duration:** ~15 seconds (with connectivity tests)
- **Pass criteria:** Can connect to Appwrite (if configured), SDKs initialize correctly
- **Common failures:** Cannot connect to Appwrite, invalid credentials, CORS errors
- **Fix:** Run `npm run test:connectivity` for detailed diagnostics

### Phase 7: Debug Utilities Validation
- **What it tests:** Debug utility files exist, proper exports, integration in providers
- **Duration:** ~5 seconds
- **Pass criteria:** All debug files exist, exported correctly, initialized in development
- **Common failures:** Missing debug files, not integrated in providers
- **Fix:** Check `src/lib/debug/` directory and `src/app/providers.tsx` integration

### Phase 8: Test Scripts Validation
- **What it tests:** All test scripts exist and are executable
- **Duration:** ~5 seconds
- **Pass criteria:** All test scripts exist, have proper imports, no syntax errors
- **Common failures:** Missing test scripts, import errors
- **Fix:** Verify `scripts/` directory has all required test files

## 5. Interpreting Results

### Success Output
```
✅ Phase 1: Environment & Configuration - PASSED (5.2s)
✅ Phase 2: Hydration & Store - PASSED (9.8s)
✅ Phase 3: Error Boundaries - PASSED (4.1s)
✅ Phase 4: Loading States - PASSED (3.9s)
✅ Phase 5: Suspense Boundaries - PASSED (4.5s)
✅ Phase 6: Appwrite Configuration - PASSED (14.2s)
✅ Phase 7: Debug Utilities - PASSED (3.1s)
✅ Phase 8: Test Scripts - PASSED (2.8s)

🎉 All tests passed! (47.6s)
```

### Failure Output
```
✅ Phase 1: Environment & Configuration - PASSED (5.2s)
❌ Phase 2: Hydration & Store - FAILED (9.8s)
   Error: skipHydration not configured in persist middleware
   File: src/stores/authStore.ts
   Line: 300
   Fix: Add skipHydration: true to persist config

⚠️ Phase 3: Error Boundaries - WARNING (4.1s)
   Warning: Sentry integration not found
   File: src/app/error.tsx
   Line: 39
   Recommendation: Add Sentry.captureException() call

❌ 1 failed, ⚠️ 1 warning, ✅ 6 passed
```

### JSON Report Structure
```json
{
  "timestamp": "2025-10-29T12:00:00Z",
  "duration": 47.6,
  "phases": [
    {
      "name": "Environment & Configuration",
      "status": "passed",
      "duration": 5.2,
      "tests": [
        {"name": ".env.local exists", "status": "passed"},
        {"name": "Required variables set", "status": "passed"}
      ]
    }
  ],
  "summary": {
    "total": 8,
    "passed": 6,
    "failed": 1,
    "warnings": 1
  },
  "recommendations": [
    "Add skipHydration: true to persist config",
    "Add Sentry integration to error boundaries"
  ]
}
```

## 6. Common Failures and Solutions

### Failure: "skipHydration not configured"
- **Cause:** Hydration fix not applied to authStore
- **Solution:** Add `skipHydration: true` to persist config in `src/stores/authStore.ts`
- **Code reference:** Line 300 in authStore.ts

### Failure: "_hasHydrated field not found"
- **Cause:** AuthState interface missing hydration flag
- **Solution:** Add `_hasHydrated: boolean` to AuthState interface
- **Code reference:** Lines 19-31 in authStore.ts

### Failure: "Error boundary file not found"
- **Cause:** Error boundary files missing or in wrong location
- **Solution:** Verify `src/app/error.tsx` and `src/app/global-error.tsx` exist
- **Code reference:** Next.js App Router error boundary convention

### Failure: "LoadingOverlay variant missing"
- **Cause:** Not all 5 variants implemented
- **Solution:** Implement all variants (spinner, dots, pulse, bars, ripple)
- **Code reference:** `src/components/ui/loading-overlay.tsx`

### Failure: "SuspenseBoundary component not found"
- **Cause:** Suspense boundary not implemented
- **Solution:** Create `src/components/ui/suspense-boundary.tsx`
- **Code reference:** See SUSPENSE-BOUNDARIES-GUIDE.md

### Failure: "Cannot connect to Appwrite"
- **Cause:** Appwrite not configured or unreachable
- **Solution:** Run `npm run test:connectivity` for detailed diagnostics
- **Alternative:** Use mock backend: `NEXT_PUBLIC_BACKEND_PROVIDER=mock`

## 7. CI/CD Integration

### GitHub Actions Example
```yaml
name: Full System Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - run: npm run test:full-system
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

### GitLab CI Example
```yaml
test:full-system:
  stage: test
  script:
    - npm install
    - npm run test:full-system
  artifacts:
    when: always
    paths:
      - test-results/
    reports:
      junit: test-results/full-system-test-report.xml
```

## 8. Best Practices

### Before Committing
```bash
# Run full system test
npm run test:full-system

# If all pass, commit
git commit -m "Your changes"
```

### Before Deploying
```bash
# Run full test suite
npm run test:all

# Run production build test
npm run test:prod-enhanced

# If all pass, deploy
```

### After Updating Dependencies
```bash
# Clean install
npm run clean:all

# Run full system test
npm run test:full-system

# Run browser compatibility test
npm run test:browsers
```

### Debugging Failed Tests
```bash
# Run with verbose output
npx tsx scripts/full-system-test.ts --verbose

# Run specific phase
npx tsx scripts/full-system-test.ts --phase hydration

# Check detailed logs
cat test-results/full-system-test-report.json
```

### Performance Optimization
- Skip connectivity tests in local development: `--skip-connectivity`
- Run specific phases only: `--phase <name>`
- Use JSON output for CI/CD: `--json`

### Related Documentation
- [Browser Compatibility Testing](BROWSER-COMPATIBILITY-GUIDE.md)
- [Production Build Testing](PRODUCTION-BUILD-GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Error Boundary Testing](ERROR-BOUNDARY-TESTING-GUIDE.md)
- [Loading States Guide](LOADING-STATES-GUIDE.md)
- [Suspense Boundaries Guide](SUSPENSE-BOUNDARIES-GUIDE.md)