// Basic usage
<LoadingOverlay />

// With custom text
<LoadingOverlay text="Yükleniyor..." />

// Fullscreen loading
<LoadingOverlay fullscreen={true} />

// Custom variant and size
<LoadingOverlay variant="pulse" size="lg" />

// Inline loading with blur disabled
<LoadingOverlay fullscreen={false} blur={false} text="İşleniyor..." />
```

## Loading State Patterns

### Auth Initialization Loading

- **Location:** `src/app/(dashboard)/layout.tsx` line 106
- **Trigger:** Until `isInitialized && isAuthenticated` is true
- **Variant:** `pulse`, `fullscreen`
- **Purpose:** Prevent dashboard access until authentication is verified

```tsx
if (!isInitialized || !isAuthenticated) {
  return <LoadingOverlay variant="pulse" fullscreen={true} text="Yükleniyor..." />;
}
```

### Hydration Loading

- **Location:** `src/app/providers.tsx` lines 73-75
- **Trigger:** Until `_hasHydrated` is true
- **Variant:** Returns `null` (no UI)
- **Purpose:** Prevent hydration mismatches during Zustand store initialization

```tsx
// Show nothing until hydration complete (prevents hydration mismatch)
if (!hasHydrated) {
  return null;
}
```

### Page Navigation Loading

- **Location:** Dashboard layout with Suspense (after implementation)
- **Trigger:** During lazy-loaded page transitions
- **Variant:** `pulse`, inline
- **Purpose:** Smooth page transitions with loading feedback

```tsx
<SuspenseBoundary loadingVariant="pulse" loadingText="Sayfa yükleniyor...">
  {children}
</SuspenseBoundary>
```

### Data Fetching Loading

- **Location:** Individual components with React Query
- **Trigger:** During API requests
- **Variant:** `spinner`, inline
- **Purpose:** Show loading state during data fetching operations

```tsx
const { data, isLoading } = useQuery(['data'], fetchData);

if (isLoading) {
  return <LoadingOverlay variant="spinner" fullscreen={false} />;
}
```

## Accessibility Features

The LoadingOverlay component is designed with accessibility in mind:

- **`role="status"`:** Indicates the loading state to screen readers
- **`aria-live="polite"`:** Announces loading state changes without interrupting user
- **Screen reader text:** Hidden "Yükleniyor..." text for assistive technologies
- **Motion-reduce support:** Respects `prefers-reduced-motion` user preference
- **Keyboard navigation:** No focus trapping, allows normal navigation

```tsx
<motion.div
  role="status"
  aria-live="polite"
  className="flex flex-col items-center justify-center"
>
  <span className="sr-only">Yükleniyor...</span>
  {/* Animation content */}
</motion.div>
```

## Animation Variants

### Spinner

Classic rotating spinner animation.

- **Use case:** General loading, form submissions
- **Performance:** Lightweight, CSS-only animation
- **Implementation:** Single rotating border

### Dots

Three bouncing dots in sequence.

- **Use case:** Short waits, inline loading, progress indication
- **Performance:** Lightweight, minimal DOM elements
- **Implementation:** Three dots with staggered bounce animation

### Pulse

Expanding ripple effect with center dot.

- **Use case:** Auth loading, important operations, full attention required
- **Performance:** Medium, multiple animated elements
- **Implementation:** Concentric circles with pulse and ripple effects

### Bars

Bouncing bars of varying heights.

- **Use case:** Data processing, file operations, progress indication
- **Performance:** Lightweight, CSS transforms
- **Implementation:** Four bars with sequential bounce animation

### Ripple

Dual expanding ripple rings.

- **Use case:** Background operations, long-running tasks
- **Performance:** Medium, layered animations
- **Implementation:** Two concentric rings with alternating ripple effects

## Performance Considerations

### CSS Animations

All animations use CSS transforms and opacity for GPU acceleration:

```css
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Avoid JavaScript Animations

- No `setInterval` or `requestAnimationFrame` loops
- Pure CSS animations for better performance
- Reduced battery usage on mobile devices

### will-change Property

Use `will-change` for smooth animations:

```css
.loading-overlay {
  will-change: transform, opacity;
}
```

### prefers-reduced-motion

Respect user accessibility preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .loading-overlay {
    animation: none;
  }
}
```

### Lazy Loading

Import LoadingOverlay only when needed:

```tsx
const LoadingOverlay = lazy(() => import('@/components/ui/loading-overlay'));
```

## Testing Loading States

### Manual Testing

1. **Navigate to test page:** Visit `/test-loading-states` in development
2. **Visual testing:** Verify each variant renders correctly
3. **Size testing:** Check sm/md/lg scaling
4. **Accessibility testing:** Use screen reader to verify announcements
5. **Motion testing:** Enable/disable `prefers-reduced-motion`

### Automated Testing

Run automated tests with:

```bash
npm run test:loading-states
```

Tests verify:
- All variants render without errors
- Accessibility attributes are present
- Performance metrics meet thresholds
- Screenshots for visual regression

## Common Issues & Solutions

### Loading State Not Showing

**Problem:** LoadingOverlay doesn't appear when expected.

**Solutions:**
- Check component props (fullscreen, variant)
- Verify conditional rendering logic
- Ensure component is not unmounted prematurely
- Check for CSS conflicts (z-index, positioning)

### Animation Not Smooth

**Problem:** Loading animation stutters or is choppy.

**Solutions:**
- Use CSS transforms instead of position changes
- Add `will-change` property
- Avoid animating large DOM trees
- Check for layout thrashing

### Accessibility Issues

**Problem:** Screen readers don't announce loading state.

**Solutions:**
- Ensure `role="status"` and `aria-live="polite"`
- Include `.sr-only` text
- Test with actual screen readers
- Verify focus management

### Hydration Mismatch

**Problem:** Loading state causes server/client differences.

**Solutions:**
- Use `suppressHydrationWarning` if necessary
- Ensure consistent initial state
- Test with hydration debugging tools

### Loading State Persisting

**Problem:** Loading overlay stays visible indefinitely.

**Solutions:**
- Add timeout fallbacks
- Check async operation completion
- Verify state updates are triggering
- Add error boundaries for failed operations

## Development Tools

### window.__LOADING_STATE_TESTER__

Development utility for testing loading states:

```javascript
// Access in browser console (development only)
window.__LOADING_STATE_TESTER__.testAllVariants();
window.__LOADING_STATE_TESTER__.measurePerformance();
```

### Chrome DevTools

- **Performance tab:** Profile animation frame rates
- **Layers panel:** Check GPU acceleration
- **Accessibility tab:** Verify ARIA attributes

### React DevTools

- **Profiler:** Measure component render times
- **Components tab:** Inspect loading component state
- **Settings:** Enable "Highlight updates" to see re-renders

## Best Practices

### Timing Guidelines

- **< 100ms:** No loading state needed
- **100-500ms:** Inline loading indicator
- **500ms+:** Full loading overlay with text
- **2000ms+:** Progress indication or skeleton screens

### Skeleton Screens

For content loading, prefer skeleton screens:

```tsx
// Instead of full overlay
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
</div>
```

### Progress Indication

For long operations, show progress:

```tsx
<LoadingOverlay 
  text={`Yükleniyor... ${progress}%`}
  variant="bars"
/>
```

### Context-Aware Variants

Choose variants based on context:

- **Auth:** `pulse` (important, fullscreen)
- **Navigation:** `dots` (quick, inline)
- **Data:** `spinner` (general, versatile)
- **Upload:** `bars` (progress-like)

### Screen Reader Support

Always provide descriptive text:

```tsx
<LoadingOverlay text="Kullanıcı profili yükleniyor..." />
```

### Network Testing

Test with throttling to simulate slow connections:

```javascript
// Chrome DevTools Network tab
// Set to "Slow 3G" or "Fast 3G"
```

### Motion Preferences

Test with reduced motion enabled:

```css
/* Simulate prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Error Handling

Combine loading states with error boundaries:

```tsx
<ErrorBoundary>
  <Suspense fallback={<LoadingOverlay />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

### Performance Monitoring

Monitor loading state performance:

```tsx
useEffect(() => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    console.log(`Loading state duration: ${duration}ms`);
  };
}, []);