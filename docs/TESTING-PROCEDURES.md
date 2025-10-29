# Testing Procedures

Systematic testing procedures for the Dernek Yönetim Sistemi application.

## Pre-Testing Checklist

Before starting any testing session, verify:

- [ ] `.env.local` file exists and contains all required variables
- [ ] `node_modules` is up to date (`npm install` run recently)
- [ ] `.next` build cache cleared if needed (`npm run clean`)
- [ ] Browser cache cleared (Cmd+Shift+R / Ctrl+Shift+F5)
- [ ] localStorage cleared (`localStorage.clear()` in console)
- [ ] Browser extensions disabled or testing in incognito mode

## 1. Development Mode Testing

### Steps

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Open application**
   - Navigate to http://localhost:3000
   - Wait for page to load completely

3. **Open DevTools**
   - Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
   - Switch to Console tab

4. **Check for errors**
   - Look for red error messages
   - Check for hydration warnings
   - Verify debug logs appear:
     ```
     🔍 Debug mode enabled
     🔐 Auth Store State: ...
     💾 LocalStorage auth-session: ...
     🔄 Store hydrated: true
     ```

5. **Check Network tab**
   - Switch to Network tab
   - Enable "Preserve log"
   - Look for failed requests (red)
   - Verify CSRF token request succeeds
   - Check cookies are set

6. **Test Login Flow**
   - Navigate to /login
   - Enter test credentials
   - Click login button
   - Check console for:
     ```
     📤 [req_1] POST /api/csrf
     ✅ [req_1] POST /api/csrf - 200 (XXms)
     📤 [req_2] POST /api/auth/login
     ✅ [req_2] POST /api/auth/login - 200 (XXms)
     ✅ Login successful
     ✅ Session cookie set
     ```
   - Verify redirect to dashboard

7. **Test Dashboard Access**
   - Should redirect to /genel after login
   - Check console for:
     ```
     🔐 [Dashboard] Initializing auth...
     🔐 [Dashboard] Auth initialized: { isAuthenticated: true, ... }
     ```
   - Verify user info displays correctly
   - Test navigation between pages

8. **Test Logout Flow**
   - Click logout button
   - Check console for logout request
   - Verify redirect to /login
   - Verify cookies cleared
   - Verify localStorage cleared (or session marked as logged out)

### Expected Results

✅ No console errors
✅ All debug logs appear
✅ Network requests succeed (200 status)
✅ Cookies set correctly
✅ Auth flow works end-to-end
✅ No hydration errors

## 2. Incognito Mode Testing

### Purpose

Test without browser extensions that might interfere with hydration.

### Steps

1. **Open incognito/private window**
   - Chrome: Cmd+Shift+N (Mac) / Ctrl+Shift+N (Windows)
   - Firefox: Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows)
   - Safari: Cmd+Shift+N (Mac)

2. **Navigate to application**
   - Go to http://localhost:3000

3. **Repeat all tests from Development Mode Testing**

4. **Compare results**
   - If works in incognito but not normal mode → extension issue
   - If fails in both → app issue

### Common Extension Issues

| Extension | Symptom | Solution |
|-----------|---------|----------|
| Grammarly | Hydration mismatch | Disable for localhost |
| ColorZilla | Hydration mismatch | Disable for localhost |
| Loom | Hydration mismatch | Disable for localhost |
| LastPass | Form issues | Disable for localhost |

## 3. Production Build Testing

### Why Test Production Build?

- Production builds are optimized (minified, tree-shaken)
- Some issues only appear in production
- Different error reporting
- Performance differs from development

### Steps

1. **Clean previous build**
   ```bash
   npm run clean
   ```

2. **Create production build**
   ```bash
   npm run build
   ```

3. **Check build output**
   - Look for warnings:
     ```
     ⚠ Compiled with warnings
     ```
   - Check bundle sizes:
     ```
     Route (app)                Size     First Load JS
     ┌ ○ /                      5.2 kB         92.3 kB
     ├ ○ /login                 3.8 kB         90.9 kB
     └ ○ /genel                 8.1 kB         95.2 kB
     ```
   - Verify no errors:
     ```
     ✓ Compiled successfully
     ```

4. **Start production server**
   ```bash
   npm run start
   ```

5. **Test in browser**
   - Open http://localhost:3000
   - Open DevTools (F12)
   - Check Console tab

6. **Expected differences from development**
   - No debug logs (debug utilities disabled in production)
   - Errors are minified (less verbose)
   - Faster page loads
   - Smaller bundle sizes

7. **Verify critical paths**
   - [ ] Homepage loads
   - [ ] Login works
   - [ ] Dashboard accessible
   - [ ] Logout works
   - [ ] API requests succeed

### Using Automated Test Script

```bash
npm run test:prod
```

This script automatically:
- Cleans previous builds
- Runs production build
- Starts server
- Performs health checks
- Keeps server running for manual testing

## 4. Hydration Error Testing

### Purpose

Specifically test for hydration issues between server and client rendering.

### Steps

1. **Enable verbose hydration errors**
   - React 19 automatically shows detailed hydration errors in development

2. **Look for specific error patterns in console**
   ```
   Warning: Text content did not match.
   Server: "foo"
   Client: "bar"

   Warning: Prop `className` did not match.
   Server: "class-a"
   Client: "class-a class-b"

   Hydration failed because the initial UI does not match
   ```

3. **Identify the component**
   - Error message includes component name
   - Use React DevTools to locate component
   - Check component source code

4. **Common hydration causes to check**
   - [ ] `Date.now()` called in render
   - [ ] `Math.random()` called in render
   - [ ] `localStorage` accessed in render
   - [ ] `window` or `document` used without guards
   - [ ] Conditional rendering based on client-only values
   - [ ] Browser extensions modifying DOM

5. **Use HydrationLogger**
   ```javascript
   // In browser console
   window.__HYDRATION_LOGGER__.getHydrationReport()
   ```

6. **Fix the issue**
   - Use `useEffect` for client-only code
   - Add `suppressHydrationWarning` if appropriate
   - Guard browser APIs: `typeof window !== 'undefined'`
   - Use dynamic imports with `ssr: false` if needed

## 5. Network Request Testing

### Purpose

Verify all API requests work correctly and handle errors properly.

### Steps

1. **Open Network tab**
   - DevTools → Network tab
   - Enable "Preserve log"
   - Clear existing requests

2. **Perform user actions**
   - Login
   - Navigate pages
   - Submit forms
   - Upload files
   - Logout

3. **Monitor each request**
   - Click on request to see details
   - Check Status (should be 200, 201, 302)
   - Check Response time
   - Check Response body

4. **Use NetworkMonitor**
   ```javascript
   // In browser console
   window.__NETWORK_MONITOR__.printReport()
   ```

5. **Check for failed requests**
   ```javascript
   window.__NETWORK_MONITOR__.getFailedRequests()
   ```

6. **Verify cookies**
   - DevTools → Application tab → Cookies
   - Check session cookie exists
   - Verify HttpOnly flag is set
   - Check expiration date

### Key Endpoints to Test

| Endpoint | Method | Expected Status | Purpose |
|----------|--------|----------------|---------|
| `/api/csrf` | GET | 200 | Get CSRF token |
| `/api/auth/login` | POST | 200 | Login user |
| `/api/auth/session` | GET | 200 | Check session |
| `/api/auth/logout` | POST | 200 | Logout user |
| `/api/auth/refresh` | POST | 200 | Refresh token |

## 6. Browser Compatibility Testing

### Browsers to Test

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest) - macOS/iOS
- ✅ Edge (latest)
- ⚠️ Chrome Mobile (Android)
- ⚠️ Safari Mobile (iOS)

### Testing Each Browser

1. **Open application**
2. **Check console for errors**
3. **Test login flow**
4. **Test main features**
5. **Check responsive design**

### Known Browser Differences

- Safari: Stricter cookie policies
- Firefox: Different extension ecosystem
- Mobile: Touch events, viewport issues

## 7. Cache & Storage Testing

### Purpose

Verify application handles cache and storage correctly.

### Test 1: Clear localStorage

```javascript
// In console
localStorage.clear();
location.reload();
```

**Expected:** App should handle missing data gracefully

### Test 2: Clear sessionStorage

```javascript
sessionStorage.clear();
location.reload();
```

**Expected:** Session-specific data cleared

### Test 3: Hard Reload (Clear Cache)

- Chrome: Cmd+Shift+R (Mac) / Ctrl+Shift+F5 (Windows)
- Firefox: Cmd+Shift+R (Mac) / Ctrl+Shift+F5 (Windows)

**Expected:** Fresh assets loaded

### Test 4: Clear All Cookies

```javascript
document.cookie.split(";").forEach(c => {
  document.cookie = c.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
});
location.reload();
```

**Expected:** User logged out, redirected to login

### Test 5: Service Worker

Check if service worker is registered:

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
  // Unregister if needed
  registrations.forEach(r => r.unregister());
});
```

## 8. Error Recovery Testing

### Purpose

Verify error boundaries and recovery mechanisms work.

### Test 1: Intentional Error

Trigger an error in a component:

```javascript
// In a component
throw new Error('Test error');
```

**Expected:**
- Error boundary catches error
- Fallback UI displays
- "Tekrar Dene" button works
- Error logged to Sentry (if configured)

### Test 2: Network Failure

Simulate network failure:
1. DevTools → Network tab
2. Change throttling to "Offline"
3. Try to login

**Expected:**
- Request fails with network error
- Error message displayed to user
- Retry button appears

### Test 3: API Error

Simulate 500 error:
- Use browser extension or modify server to return 500
- Try to perform an action

**Expected:**
- Error message displayed
- User can retry
- No white screen

## 9. Performance Testing

### Using Lighthouse

1. **Open DevTools**
2. **Go to Lighthouse tab**
3. **Select categories:**
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. **Click "Analyze page load"**

### Target Metrics

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Key Performance Metrics

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

### Using React Profiler

1. Open React DevTools
2. Click Profiler tab
3. Click record button
4. Perform actions
5. Stop recording
6. Analyze results

**Look for:**
- Components taking > 16ms to render
- Unnecessary re-renders
- Update cascades

## 10. Accessibility Testing

### Keyboard Navigation

Test all features using only keyboard:

- [ ] Tab through all interactive elements
- [ ] Enter to activate buttons
- [ ] Escape to close modals
- [ ] Arrow keys for navigation (where applicable)

### Screen Reader Testing

- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA or JAWS
- Test all critical paths

### Color Contrast

Use browser extension to check contrast ratios:
- Text contrast ratio: ≥ 4.5:1
- Large text: ≥ 3:1

---

## Test Execution Template

Use this template for each testing session:

```markdown
## Test Session: [Date]

**Environment:**
- [ ] Development mode
- [ ] Production mode
- [ ] Browser: ____________
- [ ] Incognito mode: Yes/No

**Pre-test Checklist:**
- [ ] Environment variables set
- [ ] Dependencies updated
- [ ] Cache cleared
- [ ] Storage cleared

**Test Results:**

### Login Flow
- Status: ✅ Pass / ❌ Fail
- Notes: _________________

### Dashboard Access
- Status: ✅ Pass / ❌ Fail
- Notes: _________________

### Network Requests
- Status: ✅ Pass / ❌ Fail
- Failed requests: _______
- Notes: _________________

### Console Errors
- Count: ___
- Critical: ___
- Details: _________________

### Hydration Errors
- Status: ✅ None / ❌ Found
- Details: _________________

**Issues Found:**
1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...

**Next Steps:**
- [ ] Fix issues
- [ ] Re-test
- [ ] Document solutions
```

---

## Continuous Testing

### When to Test

- ✅ Before committing code
- ✅ After adding new features
- ✅ After dependency updates
- ✅ Before deployment
- ✅ After production deployment (smoke test)

### Automated Testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run e2e

# Run production build test
npm run test:prod
```

---

## Related Documentation

- [DEBUGGING-GUIDE.md](./DEBUGGING-GUIDE.md) - Comprehensive debugging guide
- [CONSOLE-MONITORING-CHECKLIST.md](./CONSOLE-MONITORING-CHECKLIST.md) - Quick console check reference
- [README.md](../README.md) - Project overview and setup
