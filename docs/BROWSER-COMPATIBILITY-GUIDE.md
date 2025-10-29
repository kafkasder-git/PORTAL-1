# Test all browsers
npm run test:browsers

# Test specific browser
npx tsx scripts/test-browser-compatibility.ts --browser chromium
npx tsx scripts/test-browser-compatibility.ts --browser firefox
npx tsx scripts/test-browser-compatibility.ts --browser webkit

# Run in headed mode (visible browser)
npx tsx scripts/test-browser-compatibility.ts --headed

# Capture screenshots
npx tsx scripts/test-browser-compatibility.ts --screenshot

# Run performance tests
npx tsx scripts/test-browser-compatibility.ts --performance
```

**Manual Testing:**
```bash
# Start development server
npm run dev

# Open in different browsers:
# Chrome: http://localhost:3000
# Firefox: http://localhost:3000
# Safari: http://localhost:3000
```

## 4. Browser-Specific Issues

**Chrome-Specific:**

**Issue 1: React DevTools Interference**
- **Symptom:** Hydration warnings in console
- **Cause:** DevTools injects attributes into DOM
- **Solution:** Disable DevTools during hydration testing
- **Workaround:** Test in Incognito mode
- **Code:** No code changes needed

**Issue 2: Service Worker Caching**
- **Symptom:** Stale data after updates
- **Cause:** Aggressive service worker caching
- **Solution:** Clear service worker cache
- **Steps:** DevTools → Application → Service Workers → Unregister
- **Prevention:** Implement proper cache invalidation

**Issue 3: Extension Conflicts**
- **Symptom:** Unexpected DOM modifications
- **Cause:** Extensions like Grammarly, ColorZilla modify DOM
- **Solution:** Test in Incognito mode
- **Detection:** Check for `data-*` attributes in Elements tab

**Firefox-Specific:**

**Issue 1: Stricter CSP**
- **Symptom:** "Content Security Policy" errors in console
- **Cause:** Firefox enforces CSP more strictly than Chrome
- **Solution:** CSP already configured in `next.config.ts` for Firefox
- **Verification:** Check console for CSP violations
- **Code reference:** `next.config.ts` lines 58-76

**Issue 2: localStorage Timing**
- **Symptom:** Data not immediately available after write
- **Cause:** Firefox may delay localStorage writes
- **Solution:** Add small delay after writes or use async storage
- **Workaround:** `await new Promise(resolve => setTimeout(resolve, 10))`
- **Code reference:** Consider in `src/stores/authStore.ts` if issues occur

**Issue 3: CSS Animation Performance**
- **Symptom:** Janky animations, low frame rate
- **Cause:** Firefox handles CSS animations differently
- **Solution:** Use `will-change` CSS property
- **Code reference:** `src/components/ui/loading-overlay.tsx`
- **Example:** `will-change: transform, opacity;`

**Safari-Specific:**

**Issue 1: Hydration Timing on iOS**
- **Symptom:** Hydration errors on iOS Safari
- **Cause:** Different JavaScript execution timing
- **Solution:** Increase hydration timeout
- **Code reference:** `src/app/providers.tsx` hydration guard
- **Workaround:** Add longer delay before hydration check

**Issue 2: localStorage Quota on iOS**
- **Symptom:** "QuotaExceededError" on iOS
- **Cause:** iOS Safari has 5MB localStorage limit (stricter than other browsers)
- **Solution:** Implement storage quota check and cleanup
- **Code reference:** Add quota check in `src/stores/authStore.ts`
- **Example:**
  ```typescript
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Clear old data and retry
    }
  }
  ```

**Issue 3: Viewport Height on iOS**
- **Symptom:** Layout issues with 100vh (address bar causes height changes)
- **Cause:** iOS Safari's dynamic viewport height
- **Solution:** Use `dvh` (dynamic viewport height) units instead of `vh`
- **Code reference:** `src/app/globals.css`
- **Example:** `height: 100dvh;` instead of `height: 100vh;`

**Issue 4: Touch Event Handling**
- **Symptom:** Touch interactions not working on iOS
- **Cause:** Safari requires explicit touch event listeners
- **Solution:** Add touch event handlers alongside mouse events
- **Code reference:** Interactive components in `src/components/`
- **Example:**
  ```typescript
  <div
    onClick={handleClick}
    onTouchStart={handleClick}
  >
  ```

## 5. Manual Testing Procedures

**Test Checklist for Each Browser:**

**Initial Load:**
- [ ] Navigate to `http://localhost:3000`
- [ ] Verify page loads without errors
- [ ] Check browser console for warnings/errors
- [ ] Verify no hydration mismatch errors
- [ ] Check that page renders correctly
- [ ] Verify loading overlay appears and disappears

**Auth Flow:**
- [ ] Navigate to `/login`
- [ ] Enter test credentials (admin@test.com / admin123)
- [ ] Submit form
- [ ] Verify loading state appears
- [ ] Verify redirect to dashboard
- [ ] Check localStorage for auth-session
- [ ] Verify auth state persists after reload

**Navigation:**
- [ ] Navigate between dashboard pages
- [ ] Verify smooth transitions
- [ ] Check for layout shift
- [ ] Verify Suspense boundaries work
- [ ] Check browser back/forward buttons

**Error Handling:**
- [ ] Navigate to `/test-error-boundary` (dev only)
- [ ] Trigger render error
- [ ] Verify error boundary displays
- [ ] Click "Tekrar Dene" button
- [ ] Verify recovery works
- [ ] Check console for error logs

**Loading States:**
- [ ] Navigate to `/test-loading-states` (dev only)
- [ ] Verify all 5 variants render
- [ ] Test fullscreen mode
- [ ] Verify animations are smooth
- [ ] Test with motion-reduce enabled
- [ ] Check accessibility (screen reader)

**Performance:**
- [ ] Open DevTools Performance tab
- [ ] Record page load
- [ ] Check for long tasks (> 50ms)
- [ ] Verify 60fps animations
- [ ] Check memory usage
- [ ] Verify no memory leaks

## 6. Automated Testing

**Playwright Configuration:**

The project uses Playwright for automated browser testing. Configuration in `playwright.config.cts`:

```typescript
// Browsers to test
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

**Test Scenarios:**

Each browser runs the same test scenarios:
1. Initial load test
2. Auth flow test
3. Error boundary test
4. Loading state test
5. Hydration test
6. Navigation test
7. Performance test

**Running Automated Tests:**
```bash
# All browsers
npm run test:browsers

# Specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# With UI
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

## 7. Performance Comparison

**Metrics to Compare:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Total Blocking Time (TBT)

**Expected Performance:**

| Metric | Chrome | Firefox | Safari | Target |
|--------|--------|---------|--------|--------|
| FCP | ~1.2s | ~1.4s | ~1.5s | < 1.8s |
| LCP | ~2.0s | ~2.2s | ~2.3s | < 2.5s |
| TTI | ~3.0s | ~3.2s | ~3.5s | < 3.8s |
| CLS | ~0.05 | ~0.05 | ~0.08 | < 0.1 |
| FID | ~50ms | ~60ms | ~70ms | < 100ms |

**Performance Testing:**
```bash
# Run with performance metrics
npx tsx scripts/test-browser-compatibility.ts --performance

# View report
open test-results/browser-compatibility-report.html