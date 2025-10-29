# Console Monitoring Checklist

Quick reference checklist for monitoring browser console during development and testing.

## Opening the Console

| Browser | Shortcut (Windows/Linux) | Shortcut (macOS) |
|---------|-------------------------|------------------|
| Chrome/Edge | `F12` or `Ctrl+Shift+I` | `Cmd+Option+I` |
| Firefox | `F12` or `Ctrl+Shift+K` | `Cmd+Option+K` |
| Safari | N/A (enable Developer menu first) | `Cmd+Option+C` |

## Error Categories

| Symbol | Type | Severity | Action |
|--------|------|----------|--------|
| 🔴 | Error | Critical | Must fix immediately |
| 🟡 | Warning | Medium | Should investigate |
| 🔵 | Info | Low | Informational only |
| ⚪ | Log | Debug | Development only |

---

## 1. Hydration Error Checklist

### Error Messages to Look For

- [ ] "Hydration failed"
- [ ] "Text content does not match server-rendered HTML"
- [ ] "There was an error while hydrating"
- [ ] "Expected server HTML to contain a matching..."

### Investigation Steps

1. [ ] Note which component is mentioned in the error
2. [ ] Check if error message shows server vs client diff
3. [ ] Look at error stack trace for file/line number
4. [ ] Use React DevTools to inspect the component
5. [ ] Check component for:
   - [ ] `Date.now()` calls
   - [ ] `Math.random()` calls
   - [ ] `localStorage` access
   - [ ] `window`/`document` usage
   - [ ] Conditional rendering based on client-only values

### Quick Fix

```javascript
// In console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 2. Network Error Checklist

### Error Messages to Look For

- [ ] "Failed to fetch"
- [ ] "NetworkError"
- [ ] "CORS"
- [ ] "401 Unauthorized"
- [ ] "403 Forbidden"
- [ ] "500 Internal Server Error"

### Investigation Steps

1. [ ] Open Network tab
2. [ ] Find the failed request (red text)
3. [ ] Click on the request to see details
4. [ ] Check:
   - [ ] Request URL is correct
   - [ ] Request method (GET/POST/PUT/DELETE)
   - [ ] Request headers (especially Cookie, CSRF token)
   - [ ] Request payload
   - [ ] Response status code
   - [ ] Response body (error message)

### Common Issues

| Status | Issue | Solution |
|--------|-------|----------|
| 0 | Network failure or CORS | Check CORS headers, verify API is running |
| 401 | Not authenticated | Check cookies, verify session valid |
| 403 | Permission denied | Check CSRF token, verify user permissions |
| 404 | Endpoint not found | Verify URL, check API routes |
| 500 | Server error | Check server logs, verify database connection |

---

## 3. Auth Error Checklist

### Error Messages to Look For

- [ ] "CSRF token alınamadı" / "Failed to get CSRF token"
- [ ] "Giriş yapılamadı" / "Login failed"
- [ ] "Session expired"
- [ ] "Unauthorized"

### Investigation Steps

1. [ ] Check if CSRF token request succeeded:
   ```javascript
   // Look for in console
   ✅ CSRF token obtained
   // or
   ❌ Failed to obtain CSRF token
   ```

2. [ ] Check if login request succeeded:
   ```javascript
   // Look for in console
   ✅ Login successful
   ✅ Session cookie set
   ```

3. [ ] Verify cookies in Application tab:
   - [ ] Session cookie exists
   - [ ] Cookie is HttpOnly
   - [ ] Cookie expiration is valid
   - [ ] Cookie domain matches

4. [ ] Check localStorage:
   ```javascript
   console.log(localStorage.getItem('auth-session'));
   ```

5. [ ] Check auth store state:
   ```javascript
   console.log(window.__AUTH_STORE__?.getState());
   ```

---

## 4. Store Error Checklist

### Error Messages to Look For

- [ ] "Store hydration failed"
- [ ] "persist.rehydrate() failed"
- [ ] "Store state is undefined"

### Investigation Steps

1. [ ] Check hydration status:
   ```javascript
   window.__AUTH_STORE__.persist.hasHydrated()
   // Should return true
   ```

2. [ ] Check store state:
   ```javascript
   window.__STORE_DEBUGGER__?.logStoreState()
   ```

3. [ ] Check localStorage:
   ```javascript
   console.log(localStorage.getItem('authStore'));
   ```

4. [ ] Detect mismatches:
   ```javascript
   window.__STORE_DEBUGGER__?.detectStoreMismatch()
   ```

5. [ ] Manual rehydration test:
   ```javascript
   window.__STORE_DEBUGGER__?.testHydration()
   ```

---

## 5. React Error Checklist

### Error Messages to Look For

- [ ] "Uncaught Error"
- [ ] "Unhandled Promise Rejection"
- [ ] "Component render error"
- [ ] "Hooks can only be called inside..."
- [ ] "Missing key prop"

### Investigation Steps

1. [ ] Read the full error message
2. [ ] Check the stack trace for file/line
3. [ ] Use React DevTools to find the component
4. [ ] Check component code for issues
5. [ ] Verify proper Hook usage (inside component, not in loops/conditions)
6. [ ] Check for missing `key` props in lists

### Common React Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Hooks can only be called inside..." | Hook used outside component or in condition | Move Hook to component top level |
| "Missing key prop" | List items without unique keys | Add `key={item.id}` to list items |
| "Cannot read property of undefined" | Accessing property on undefined/null | Add optional chaining: `obj?.prop` |
| "Maximum update depth exceeded" | setState in render causing infinite loop | Move setState to useEffect or event handler |

---

## 6. Browser Extension Detection

### Attributes to Check

```javascript
// In console
const htmlEl = document.documentElement;
console.log('Attributes:', htmlEl.attributes);

// Check for these specific attributes:
console.log('ColorZilla:', htmlEl.getAttribute('cz-shortcut-listen'));
console.log('Grammarly:', htmlEl.getAttribute('data-gr-ext'));
console.log('Loom:', htmlEl.getAttribute('data-loom-ext'));
```

### Extension Checklist

- [ ] `cz-shortcut-listen` attribute (ColorZilla)
- [ ] `data-gr-ext` attribute (Grammarly)
- [ ] `data-loom-ext` attribute (Loom)
- [ ] Modified input elements (LastPass, Honey)
- [ ] Extra script tags in head (ad blockers)

### Solution

If any extensions detected:
1. [ ] Test in incognito mode
2. [ ] If works in incognito → disable extensions
3. [ ] Disable extensions one by one to find culprit
4. [ ] Configure extension to not run on localhost

---

## 7. Performance Warning Checklist

### Warnings to Look For

- [ ] "Long task" warning (>50ms)
- [ ] "Memory leak" detected
- [ ] "Re-render" cascade
- [ ] "Slow component" warning
- [ ] Large bundle size warning

### Investigation Steps

1. [ ] Open React DevTools Profiler
2. [ ] Record a session
3. [ ] Look for:
   - [ ] Components taking >16ms to render
   - [ ] Unnecessary re-renders
   - [ ] Update cascades

4. [ ] Check bundle size:
   ```bash
   npm run analyze
   ```

5. [ ] Use Chrome Performance tab:
   - Record page load
   - Identify bottlenecks
   - Optimize as needed

---

## 8. Debug Log Checklist

### Expected Debug Logs (Development Only)

On app initialization:
- [ ] `🔍 Debug mode enabled`
- [ ] `🔍 HydrationLogger initialized`
- [ ] `🔍 StoreDebugger initialized for authStore`
- [ ] `🔍 NetworkMonitor initialized`

On auth initialization:
- [ ] `🔐 Auth Store State: { ... }`
- [ ] `💾 LocalStorage auth-session: { ... }`
- [ ] `🔄 Store hydrated: true`

On dashboard load:
- [ ] `🔐 [Dashboard] Initializing auth...`
- [ ] `💾 [Dashboard] LocalStorage: { ... }`
- [ ] `🔄 [Dashboard] Hydration status: true`
- [ ] `🔐 [Dashboard] Auth initialized: { ... }`

On network requests:
- [ ] `📤 [req_X] METHOD /endpoint`
- [ ] `✅ [req_X] METHOD /endpoint - STATUS (Xms)`

If debug logs are missing:
1. [ ] Verify NODE_ENV is "development"
2. [ ] Check if debug utilities initialized
3. [ ] Look for initialization errors

---

## 9. Quick Diagnostic Commands

### In Browser Console

```javascript
// 1. Check debug utilities
console.log('Hydration Logger:', window.__HYDRATION_LOGGER__);
console.log('Store Debugger:', window.__STORE_DEBUGGER__);
console.log('Network Monitor:', window.__NETWORK_MONITOR__);
console.log('Auth Store:', window.__AUTH_STORE__);

// 2. Get comprehensive reports
window.__HYDRATION_LOGGER__?.getHydrationReport();
window.__STORE_DEBUGGER__?.getStoreReport();
window.__NETWORK_MONITOR__?.printReport();

// 3. Check auth state
window.__AUTH_STORE__?.getState();

// 4. Check hydration status
window.__AUTH_STORE__?.persist?.hasHydrated();

// 5. Check localStorage
console.log('Auth Store:', localStorage.getItem('authStore'));
console.log('Auth Session:', localStorage.getItem('auth-session'));

// 6. Clear everything and reload
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 10. Testing Checklist

### Before Testing

- [ ] Clear browser cache (Cmd+Shift+R / Ctrl+Shift+F5)
- [ ] Clear localStorage (`localStorage.clear()`)
- [ ] Clear sessionStorage (`sessionStorage.clear()`)
- [ ] Clear cookies (Application tab → Cookies → Clear)
- [ ] Close and reopen DevTools
- [ ] Reload page

### During Testing

- [ ] Keep Console tab open
- [ ] Keep Network tab open with "Preserve log" enabled
- [ ] Monitor for errors in real-time
- [ ] Check each page navigation
- [ ] Test all user flows
- [ ] Verify no failed network requests

### After Testing

- [ ] Copy error logs if any
- [ ] Export network report if issues found
- [ ] Take screenshots of errors
- [ ] Document reproduction steps
- [ ] File bug report with details

---

## Emergency Quick Fixes

### Issue: App Not Loading

```javascript
// 1. Clear everything
localStorage.clear();
sessionStorage.clear();
location.reload();

// 2. Check auth state
window.__AUTH_STORE__?.getState();

// 3. Manual logout
window.__AUTH_STORE__?.getState()?.logout();
```

### Issue: Hydration Errors

```javascript
// 1. Check for browser extensions
document.documentElement.attributes

// 2. Test manual rehydration
window.__STORE_DEBUGGER__?.testHydration()

// 3. Clear storage and reload
window.__STORE_DEBUGGER__?.clearStorageAndReload()
```

### Issue: Network Failures

```javascript
// 1. Check failed requests
window.__NETWORK_MONITOR__?.getFailedRequests()

// 2. Test CSRF endpoint
fetch('/api/csrf').then(r => r.json()).then(console.log)

// 3. Check cookies
console.log(document.cookie)
```

---

## Related Documentation

- [DEBUGGING-GUIDE.md](./DEBUGGING-GUIDE.md) - Comprehensive debugging guide
- [TESTING-PROCEDURES.md](./TESTING-PROCEDURES.md) - Systematic testing procedures

---

## Print This Checklist

Keep this checklist handy during development:

1. Print this document
2. Check items as you test
3. Note any failures
4. Follow investigation steps
5. Document solutions

**Remember:** Console is your best debugging friend! 🔍
