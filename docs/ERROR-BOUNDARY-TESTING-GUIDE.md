# Error Boundary Testing Guide

## Introduction

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed. This guide provides comprehensive information about testing and debugging error boundaries in the Portal application.

### Purpose of Error Boundaries

Error boundaries serve several critical purposes:
- **Prevent white screens**: Catch runtime errors and display user-friendly error messages
- **Improve user experience**: Allow users to recover from errors without losing their work
- **Aid debugging**: Provide detailed error information in development mode
- **Monitor production issues**: Send error reports to monitoring services like Sentry

### When to Use Each Error Boundary Type

- **error.tsx (Route-level)**: Use for errors in specific route segments. Provides page-level error handling with recovery options.
- **global-error.tsx (Global)**: Use for critical errors that affect the entire application. Last line of defense for unhandled errors.
- **ErrorBoundary component**: Use for granular error handling around specific components. Allows partial page recovery.

### Error Boundary Hierarchy

The application implements a three-tier error boundary hierarchy:

1. **Component-level ErrorBoundary**: Wraps individual components for granular error isolation
2. **Route-level error.tsx**: Catches errors within route segments and provides page-level recovery
3. **Global global-error.tsx**: Catches errors in the root layout as the final safety net

### Best Practices for Error Handling

- Always wrap async operations in try-catch blocks
- Use error boundaries around components that fetch data or perform complex logic
- Provide meaningful fallback UI that matches the application's design
- Include recovery mechanisms like retry buttons and navigation options
- Log errors with sufficient context for debugging
- Test error scenarios thoroughly before deployment

## Manual Testing

### Accessing the Test Page

Navigate to `/test-error-boundary` in development mode to access the manual testing interface. This page is only available when `NODE_ENV !== 'production'`.

### Triggering Error Types

The test page provides buttons to trigger different types of errors:

- **Throw Render Error**: Triggers an error during component rendering
- **Throw Async Error**: Triggers an error in a useEffect hook
- **Throw Event Handler Error**: Triggers an error in a button click handler
- **Simulate Hydration Error**: Creates server/client mismatch by setting localStorage
- **Throw Network Error**: Attempts to fetch a non-existent API endpoint
- **Throw Zustand Error**: Triggers an error in the authentication store
- **Throw Error with Digest**: Triggers an error with a custom digest property

### What to Look For

For each error type, observe:

- Whether the appropriate error boundary catches the error
- The error message displayed to the user
- Available recovery options
- Development error details (stack trace, component stack)
- Console logging and Sentry integration

### Expected Behavior for Each Error Type

- **Render Error**: Caught by route error boundary, displays "Bir Hata Oluştu" with retry option
- **Async Error**: Caught by route error boundary after a delay, same UI as render error
- **Event Handler Error**: NOT caught by error boundaries (React limitation), may cause unhandled exception
- **Hydration Error**: Caught by route boundary, displays "Hydration Hatası" with clear storage option
- **Network Error**: Caught by route boundary, displays generic error with retry option
- **Zustand Error**: Caught by route boundary, displays generic error with retry option
- **Error with Digest**: Caught by route boundary, displays error code in the UI

### Verifying Sentry Integration

1. Trigger an error using the test page
2. Check browser console for Sentry logging
3. Verify `window.__LAST_ERROR__` or `window.__GLOBAL_ERROR__` contains error details
4. Check Sentry dashboard for captured events (if configured)

### Testing Recovery Mechanisms

1. Trigger an error to display the error boundary
2. Click "Tekrar Dene" to test the reset() function
3. Verify the page recovers and the test page reloads
4. For hydration errors, test "Clear Storage & Reload" functionality
5. Verify localStorage/sessionStorage is cleared after recovery

## Automated Testing

### Running Automated Tests

Execute automated error boundary tests using:

```bash
npm run test:error-boundaries
```

This runs Playwright-based tests that simulate various error scenarios and verify error boundary behavior.

### Interpreting Test Results

Test results are saved to `test-results/error-boundary-report.json` with the following structure:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "browser": "chromium",
  "headless": true,
  "results": [
    {
      "name": "Render Error",
      "passed": true,
      "message": "Error caught by boundary and recovery successful",
      "duration": 1500,
      "screenshot": "render-error-recovery-123456789.png",
      "consoleLogs": ["[error] Error caught by boundary"]
    }
  ],
  "summary": {
    "total": 8,
    "passed": 7,
    "failed": 1
  }
}
```

### Adding New Test Scenarios

To add new test scenarios:

1. Edit `scripts/test-error-boundaries.ts`
2. Add a new async function following the pattern of existing tests
3. Include error triggering, boundary verification, and recovery testing
4. Add the new test to the main test execution flow
5. Update the test page if manual testing is needed

### Debugging Failing Tests

When tests fail:

1. Check the screenshot in `test-results/` for visual verification
2. Review console logs in the test report
3. Run tests in non-headless mode: `npm run test:error-boundaries -- --no-headless`
4. Use browser developer tools to inspect the test page during execution
5. Verify error boundary components are properly implemented

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
- name: Run Error Boundary Tests
  run: npm run test:error-boundaries -- --headless --browser chromium
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: error-boundary-results
    path: test-results/
```

## Error Types Reference

### Render Errors

Thrown during component render phase.

**Example:**
```typescript
throw new Error('Render error');
```

**Caught by:** Nearest error boundary in the component tree.

**Recovery:** Use the reset() function to re-render the component.

### Async Errors

Thrown in useEffect, event handlers, or async functions.

**Example:**
```typescript
useEffect(() => {
  throw new Error('Async error');
}, []);
```

**Caught by:** Error boundary if thrown during render cycle. Not caught if thrown asynchronously.

**Recovery:** reset() function or full page reload.

### Event Handler Errors

Thrown in event handlers like onClick, onChange, etc.

**Example:**
```typescript
onClick={() => {
  throw new Error('Event error');
}}
```

**NOT caught by error boundaries** (React limitation).

**Must use try-catch in handler:**
```typescript
onClick={() => {
  try {
    // risky code
  } catch (error) {
    // handle error
  }
}}
```

### Hydration Errors

Server/client rendering mismatches.

**Example:**
```typescript
// Using Date.now() during render
return <div>{Date.now()}</div>;
```

**Caught by:** Error boundary detects hydration mismatch.

**Recovery:** Clear localStorage and reload page.

### Network Errors

Failed fetch requests or API calls.

**Example:**
```typescript
await fetch('/api/invalid');
```

**Caught by:** Error boundary if thrown during render.

**Recovery:** Retry the request or reload page.

## Error Boundary Hierarchy

### Level 1: Component-level ErrorBoundary

Wraps specific components for granular error handling.

**Usage:**
```typescript
<ErrorBoundary name="ChartComponent">
  <ChartComponent />
</ErrorBoundary>
```

**Benefits:**
- Isolates errors to specific components
- Allows partial page recovery
- Provides detailed error context

### Level 2: Route-level error.tsx

Catches errors in route segments.

**Location:** `src/app/error.tsx`

**Benefits:**
- Handles errors for entire page routes
- Provides consistent error UI across pages
- Includes recovery mechanisms like retry and navigation

### Level 3: Global global-error.tsx

Catches errors in root layout.

**Location:** `src/app/global-error.tsx`

**Benefits:**
- Last line of defense for critical errors
- Handles errors that bypass route boundaries
- Provides system-level recovery options

## Sentry Integration

### Configuration

Sentry is configured in the error boundary components to capture and report errors.

**Integration points:**
- `src/app/error.tsx`: Captures route-level errors
- `src/app/global-error.tsx`: Captures global errors
- `src/components/error-boundary.tsx`: Captures component-level errors

### Data Sent to Sentry

Each error includes:
- Error message and stack trace
- Component stack (for component errors)
- User agent and browser information
- URL and navigation context
- Error digest (unique identifier)
- Custom tags (error type, boundary name)

### Verifying in Sentry Dashboard

1. Trigger an error in the application
2. Check Sentry dashboard for new events
3. Verify error details match the triggered error
4. Check tags and context information

### Testing in Development

Use the test page to trigger errors and verify:
- Errors appear in Sentry dashboard
- Correct tags and context are included
- User feedback mechanisms work (if enabled)

### Privacy Considerations

- PII filtering is applied to prevent sensitive data leakage
- User IP addresses are masked
- Local storage content is not sent (except in development)
- Error messages are sanitized

## Recovery Mechanisms

### reset() Function

Resets the error boundary state and re-renders the failed component.

**When to use:** For recoverable errors that may succeed on retry.

**Implementation:**
```typescript
const reset = () => {
  // Reset boundary state
  setHasError(false);
  setError(null);
};
```

### Reload Page

Performs a full page reload to reset application state.

**When to use:** When component state is corrupted or errors persist.

**Implementation:**
```typescript
window.location.reload();
```

### Clear Storage

Clears localStorage and sessionStorage before reload.

**When to use:** For hydration errors or corrupted stored state.

**Implementation:**
```typescript
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### Navigate Home

Redirects user to the home page.

**When to use:** When current page is unusable but rest of app may work.

**Implementation:**
```typescript
window.location.href = '/genel';
```

## Common Issues & Solutions

### Error Boundary Not Catching Error

**Symptoms:** Error causes white screen instead of error UI.

**Solutions:**
- Ensure error boundary wraps the failing component
- Check component hierarchy - errors only bubble up, not down
- Verify error is thrown during render phase
- Use development tools to inspect component tree

### Sentry Not Receiving Errors

**Symptoms:** Errors logged locally but not in Sentry dashboard.

**Solutions:**
- Verify Sentry DSN is configured correctly
- Check network connectivity to Sentry
- Ensure errors are thrown in browser context (not server)
- Verify Sentry initialization in providers

### Recovery Not Working

**Symptoms:** Clicking retry/reload doesn't recover from error.

**Solutions:**
- Check if error is persistent (may need different recovery method)
- Verify reset() function implementation
- Test with cleared storage for hydration issues
- Check for infinite error loops

### Hydration Errors Persisting

**Symptoms:** Hydration errors recur after clearing storage.

**Solutions:**
- Identify source of server/client mismatch
- Remove Date.now(), Math.random() from render
- Use useEffect for dynamic values
- Implement proper hydration guards

### Browser Extensions Interfering

**Symptoms:** Errors only occur with certain browser extensions.

**Solutions:**
- Detect extensions in error logging
- Advise users to disable extensions for testing
- Implement extension-safe error handling
- Use extension detection in error boundaries

## Development Tools

### window.__LAST_ERROR__

Contains the last error caught by the route error boundary.

**Usage:**
```javascript
console.log(window.__LAST_ERROR__);
// { error: Error, digest: "abc123", timestamp: Date }
```

### window.__GLOBAL_ERROR__

Contains the last error caught by the global error boundary.

**Usage:**
```javascript
console.log(window.__GLOBAL_ERROR__);
// { error: Error, digest: "abc123", timestamp: Date }
```

### window.__ERROR_SIMULATOR__

Programmatic error simulation utility.

**Usage:**
```javascript
window.__ERROR_SIMULATOR__.throwRenderError('Test error');
```

### ErrorBoundary.getErrors()

Returns all errors caught by ErrorBoundary components.

**Usage:**
```javascript
const errors = ErrorBoundary.getErrors();
console.log('All caught errors:', errors);
```

## Testing Checklist

- [ ] All error types tested (render, async, event handler, hydration, network, store)
- [ ] Error boundaries catch errors correctly at each level
- [ ] Recovery mechanisms work (reset, reload, clear storage, navigate home)
- [ ] Sentry integration verified (errors sent and tagged correctly)
- [ ] User-friendly error messages shown in production
- [ ] Development error details shown (stack traces, component stacks)
- [ ] Browser extension detection works
- [ ] Hydration error recovery works (clear storage functionality)
- [ ] Error boundary hierarchy correct (component → route → global)
- [ ] Automated tests passing in CI/CD pipeline
- [ ] Manual testing scenarios documented and reproducible
- [ ] Error recovery preserves user data when possible
- [ ] Accessibility features work (screen reader announcements, keyboard navigation)
- [ ] Performance impact of error boundaries is minimal
- [ ] Error logging includes sufficient context for debugging
- [ ] Privacy considerations addressed (PII filtering, data sanitization)