# Troubleshooting Guide - Dernek Yönetim Sistemi

Bu dokümantasyon, Next.js 16 + React 19 + Appwrite tabanlı Dernek Yönetim Sistemi'nde karşılaşılabilecek yaygın sorunları ve çözümlerini içerir.

## İçindekiler

- [Beyaz Ekran / Hydration Mismatch Sorunu](#beyaz-ekran--hydration-mismatch-sorunu)
- [Peer Dependency Uyarıları](#peer-dependency-uyarıları)
- [Hydration Mismatch Debug](#hydration-mismatch-debug)
- [Environment Variables Sorunları](#environment-variables-sorunları)
- [Browser Extension Sorunları](#browser-extension-sorunları)
- [Cache Temizleme](#cache-temizleme)
- [Appwrite Bağlantı Sorunları](#appwrite-bağlantı-sorunları)
- [Integration Issues](#integration-issues)
- [Browser-Specific Issues](#browser-specific-issues)
- [Production Build Issues](#production-build-issues)
- [Testing Issues](#testing-issues)
- [Performance Issues](#performance-issues)

---

## Beyaz Ekran / Hydration Mismatch Sorunu

### Sorun
Sayfa yüklenmiyor, beyaz ekran görünüyor veya sayfa kısmen render oluyor.

### Neden
React 19'un strict hydration kuralları nedeniyle, Zustand persist middleware'inin localStorage kullanımı server-side render ile uyumsuzluk yaratıyor.

**Teknik Detay:**
- Server-side render sırasında localStorage okunamaz (Node.js ortamı)
- Client-side hydration sırasında localStorage'dan farklı state gelirse React hydration error verir
- React 19, hydration mismatch'lerde daha katı davranıyor

### Çözüm
Proje, aşağıdaki çözümü uygulamaktadır:

1. **`src/stores/authStore.ts`**: `skipHydration: true` kullanılıyor
   - Server-side render sırasında localStorage okunmuyor
   - Client-side'da manuel rehydration yapılıyor
   - `_hasHydrated` flag'i ile hydration durumu takip ediliyor

2. **`src/app/providers.tsx`**: Manuel rehydration yapılıyor
   - `useAuthStore.persist.rehydrate()` manuel olarak çağrılıyor
   - Hydration tamamlanana kadar `return null` ile UI render edilmiyor

3. **`src/app/page.tsx`**: Hydration guard kullanılıyor
   - Redirect logic, hydration tamamlanana kadar çalışmıyor

### Debug Adımları

1. **Browser Console Kontrolü:**
   ```
   Aç: Chrome DevTools (F12) → Console sekmesi
   Ara: "Hydration failed" veya "Text content does not match"
   ```

2. **React DevTools ile İnceleme:**
   ```bash
   # React DevTools extension yükleyin (Chrome/Firefox)
   # Components tab'inde hydration error'ları kontrol edin
   ```

3. **Zustand Store Kontrolü:**
   ```javascript
   // Browser console'da çalıştırın:
   JSON.parse(localStorage.getItem('auth-store'))
   ```

4. **Network Tab Kontrolü:**
   - XHR/Fetch requests'leri kontrol edin
   - 401/403 error'ları auth sorununa işaret edebilir

### Geçici Workaround
Eğer sorun devam ederse, geçici olarak şu kontrolü ekleyebilirsiniz:

```typescript
// Component'inizde:
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null; // Server render'da hiçbir şey gösterme
```

---

## Peer Dependency Uyarıları

### Sorun
`npm install` sırasında aşağıdaki gibi uyarılar:
```
npm WARN ERESOLVE overriding peer dependency
npm WARN peer dep @radix-ui/react-* requires react@^18.0.0
```

### Neden
Bazı third-party paketler (özellikle Radix UI, TanStack Query) henüz `peerDependencies`'lerinde React 19'u belirtmemiş. Ancak bu paketler React 19 ile uyumlu.

### Çözüm
Proje, aşağıdaki iki yöntemle bu sorunu çözüyor:

1. **`package.json` - `overrides` field'ı:**
   ```json
   "overrides": {
     "react": "19.2.0",
     "react-dom": "19.2.0",
     "@types/react": "^19",
     "@types/react-dom": "^19"
   }
   ```
   Bu, tüm dependency tree'de React 19 kullanılmasını zorlar.

2. **`.npmrc` dosyası:**
   ```
   legacy-peer-deps=false
   strict-peer-deps=false
   auto-install-peers=true
   ```
   Bu, npm'in peer dependency uyarılarında install'u bloke etmemesini sağlar.

### Alternatif Çözüm
Eğer hala sorun yaşıyorsanız:
```bash
npm install --legacy-peer-deps
```

### Peer Dependency Version Kontrolü
```bash
# Tüm React versiyonlarını kontrol edin:
npm ls react react-dom

# Beklenen çıktı:
# react@19.2.0
# react-dom@19.2.0
```

---

## Hydration Mismatch Debug

### Yaygın Hydration Mismatch Nedenleri

1. **localStorage/sessionStorage Kullanımı:**
   - ❌ Doğrudan component render'da localStorage okuma
   - ✅ `useEffect` içinde okuma veya `skipHydration` kullanma

2. **Date/Time Kullanımı:**
   - ❌ `Date.now()`, `new Date()` direkt render'da
   - ✅ `useEffect` içinde state'e atama

3. **Random Değerler:**
   - ❌ `Math.random()` direkt render'da
   - ✅ `useState` ile initialization

4. **Browser API'leri:**
   - ❌ `window`, `document`, `navigator` direkt kullanım
   - ✅ `typeof window !== 'undefined'` kontrolü veya `useEffect`

### Debug Teknikleri

**1. Hydration Warning'i Geçici Susturma (Debug için):**
```typescript
<div suppressHydrationWarning>
  {/* Sorunlu component */}
</div>
```
⚠️ Bu sadece debug için! Production'da kullanmayın.

**2. Server/Client Render Farkını Gösterme:**
```typescript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

return (
  <div>
    {isClient ? 'Client' : 'Server'}
    {/* Şimdi aynı mı kontrol edin */}
  </div>
);
```

**3. React DevTools Profiler:**
- Profiler tab'inde hydration süresini ölçün
- Yavaş component'leri tespit edin

---

## Environment Variables Sorunları

### Sorun
Appwrite bağlantısı çalışmıyor, "MISSING_ENV_VARIABLES" hatası.

### Çözüm

1. **`.env.local` Dosyası Oluşturun:**
   ```bash
   cp .env.example .env.local  # Eğer .env.example varsa
   ```

2. **Gerekli Değişkenleri Ekleyin:**
   ```bash
   # Appwrite Configuration
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-secret-api-key

   # Database & Storage
   NEXT_PUBLIC_DATABASE_ID=dernek_db
   NEXT_PUBLIC_STORAGE_DOCUMENTS=documents
   NEXT_PUBLIC_STORAGE_RECEIPTS=receipts
   NEXT_PUBLIC_STORAGE_PHOTOS=photos
   NEXT_PUBLIC_STORAGE_REPORTS=reports

   # Security
   CSRF_SECRET=your-csrf-secret-32-chars-min
   SESSION_SECRET=your-session-secret-32-chars-min
   ```

3. **Dev Server'ı Yeniden Başlatın:**
   ```bash
   npm run dev
   ```

⚠️ **Güvenlik Uyarısı:**
- `.env.local` dosyasını **asla** commit etmeyin!
- `.gitignore` dosyasında `.env.local` olduğundan emin olun

### Environment Variable Kontrolü
```bash
# Browser console'da (NEXT_PUBLIC_ olanlar):
console.log(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);

# Node.js ortamında (API routes):
console.log(process.env.APPWRITE_API_KEY);
```

---

## Browser Extension Sorunları

### Sorun
Bazı browser extension'ları DOM'a attribute ekleyerek hydration mismatch'e neden olabilir.

### Yaygın Sorunlu Extension'lar
- **Grammarly:** `data-grammarly` attribute'ları ekler
- **ColorZilla:** DOM'u modify eder
- **React DevTools:** Bazen interference yaratabilir (nadiren)
- **LastPass/1Password:** Form field'larına script inject eder

### Çözüm

1. **Incognito Mode'da Test:**
   ```
   Chrome: Ctrl+Shift+N
   Firefox: Ctrl+Shift+P
   ```

2. **Extension'ları Geçici Devre Dışı Bırakma:**
   ```
   Chrome: chrome://extensions
   Firefox: about:addons
   ```

3. **Specific Extension'ı Kontrol Etme:**
   - Browser DevTools → Elements tab
   - `data-*` attribute'larına bakın
   - Extension'ın adını tespit edin

---

## Cache Temizleme

### Sorun
Build cache'i veya node_modules eski kaldığında beklenmeyen hatalar.

### Tam Cache Temizleme
```bash
# 1. Next.js build cache'i sil
rm -rf .next

# 2. node_modules ve package-lock.json sil
rm -rf node_modules package-lock.json

# 3. npm cache temizle
npm cache clean --force

# 4. Yeniden yükle
npm install

# 5. Dev server başlat
npm run dev
```

### Sadece Build Cache Temizleme
```bash
rm -rf .next
npm run dev
```

### Browser Cache Temizleme
```
Chrome: Ctrl+Shift+Delete → "Cached images and files" seçin
Firefox: Ctrl+Shift+Delete → "Cache" seçin
```

---

## Appwrite Bağlantı Sorunları

### Test Bağlantısı
```bash
npx tsx src/scripts/test-appwrite-connection.ts
```

### Test Kullanıcıları Oluşturma
```bash
npx tsx src/scripts/create-test-users.ts
```

### Yaygın Hatalar

**1. "Invalid API Key":**
- `.env.local` dosyasında `APPWRITE_API_KEY` doğru mu?
- Appwrite Console → Settings → API Keys kontrol edin
- API key'in **server-side** olduğundan emin olun

**2. "Project not found":**
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` doğru mu?
- Appwrite Console → Settings → Project ID kontrol edin

**3. "Database not found":**
- `NEXT_PUBLIC_DATABASE_ID` doğru mu?
- Appwrite Console → Databases'de database oluşturulmuş mu?

**4. CORS Error:**
- Appwrite Console → Settings → Platforms
- Web platform ekleyin: `http://localhost:3000`

---

## Integration Issues

### Hydration + Error Boundary Interaction
- **Issue:** Error boundary catches hydration error but recovery doesn't work
- **Cause:** Error boundary reset() called before hydration completes
- **Solution:** Wait for `_hasHydrated` before allowing reset
- **Code reference:** `src/app/error.tsx` and `src/stores/authStore.ts`

### Loading State + Suspense Conflict
- **Issue:** Both LoadingOverlay and Suspense fallback show simultaneously
- **Cause:** Nested loading states without proper guards
- **Solution:** Use conditional rendering based on loading priority
- **Code reference:** `src/app/(dashboard)/layout.tsx`

### Auth Initialization + Redirect Loop
- **Issue:** Infinite redirect between login and dashboard
- **Cause:** Auth state not fully initialized before redirect logic runs
- **Solution:** Check both `isInitialized` and `_hasHydrated` before redirect
- **Code reference:** `src/app/page.tsx` and `src/app/(dashboard)/layout.tsx`

### Mock API + Appwrite SDK Conflict
- **Issue:** App tries to connect to Appwrite even when BACKEND_PROVIDER=mock
- **Cause:** SDK initialization happens before provider check
- **Solution:** Wrap SDK initialization in provider check
- **Code reference:** `src/lib/api/index.ts`

---

## Browser-Specific Issues

### Chrome-Specific
- **Issue:** React DevTools causes hydration warnings
  - **Cause:** DevTools injects attributes into DOM
  - **Solution:** Disable DevTools during hydration testing or use `suppressHydrationWarning`
  - **Workaround:** Test in Incognito mode

- **Issue:** Service Worker caching causes stale data
  - **Cause:** Aggressive caching strategy
  - **Solution:** Clear service worker cache or disable in development
  - **Command:** Chrome DevTools → Application → Service Workers → Unregister

### Firefox-Specific
- **Issue:** Stricter CSP blocks inline scripts
  - **Cause:** Firefox enforces CSP more strictly than Chrome
  - **Solution:** Update CSP in `next.config.ts` to allow necessary inline scripts
  - **Code reference:** `next.config.ts` lines 58-76

- **Issue:** localStorage timing differences
  - **Cause:** Firefox may delay localStorage writes
  - **Solution:** Add small delay after localStorage.setItem() or use async storage
  - **Workaround:** Use `await new Promise(resolve => setTimeout(resolve, 10))`

- **Issue:** CSS animation performance
  - **Cause:** Firefox handles CSS animations differently
  - **Solution:** Use `will-change` CSS property for animated elements
  - **Code reference:** `src/components/ui/loading-overlay.tsx`

### Safari-Specific
- **Issue:** Hydration timing issues on iOS
  - **Cause:** Safari on iOS has different JavaScript execution timing
  - **Solution:** Add longer delay before hydration check
  - **Workaround:** Increase timeout in hydration guard

- **Issue:** localStorage quota exceeded on iOS
  - **Cause:** iOS Safari has 5MB localStorage limit (stricter than other browsers)
  - **Solution:** Implement storage quota check and cleanup old data
  - **Code reference:** Add quota check in `src/stores/authStore.ts`

- **Issue:** Viewport height issues on iOS
  - **Cause:** iOS Safari's dynamic viewport height (address bar)
  - **Solution:** Use `dvh` units instead of `vh` or JavaScript-based height calculation
  - **Code reference:** Update CSS in `src/app/globals.css`

- **Issue:** Touch event handling
  - **Cause:** Safari requires explicit touch event listeners
  - **Solution:** Add touch event handlers alongside mouse events
  - **Code reference:** Interactive components in `src/components/`

---

## Production Build Issues

- **Issue:** Build succeeds but runtime errors in production
  - **Cause:** Environment variables not set in production
  - **Solution:** Verify all `NEXT_PUBLIC_*` variables are set in production environment
  - **Check:** Run `npm run test:prod-enhanced` to validate

- **Issue:** Large bundle size (> 1MB)
  - **Cause:** Unused dependencies or improper code splitting
  - **Solution:** Run `ANALYZE=true npm run build` and review bundle analyzer
  - **Optimize:** Remove unused imports, use dynamic imports for large components
  - **Code reference:** `next.config.ts` webpack configuration

- **Issue:** Slow Time to Interactive (TTI > 5s)
  - **Cause:** Too much JavaScript on initial load
  - **Solution:** Implement code splitting with React.lazy and Suspense
  - **Code reference:** `src/components/ui/suspense-boundary.tsx`

- **Issue:** Memory leaks in production
  - **Cause:** Event listeners not cleaned up or circular references
  - **Solution:** Audit useEffect cleanup functions, use WeakMap for caching
  - **Debug:** Use Chrome DevTools Memory Profiler

---

## Testing Issues

- **Issue:** E2E tests fail in CI but pass locally
  - **Cause:** Timing differences or missing environment variables
  - **Solution:** Add explicit waits, verify CI environment variables
  - **Code reference:** `playwright.config.cts` and `e2e/*.spec.ts`

- **Issue:** Unit tests fail after hydration fixes
  - **Cause:** Tests don't mock localStorage or Zustand persist
  - **Solution:** Mock localStorage in test setup
  - **Code reference:** `src/__tests__/setup.ts`

- **Issue:** Test coverage drops after adding error boundaries
  - **Cause:** Error boundary code paths not tested
  - **Solution:** Add tests that intentionally throw errors
  - **Code reference:** `src/lib/testing/error-simulator.ts`

---

## Performance Issues

- **Issue:** Slow initial page load (> 3s)
  - **Causes:** Large bundle, no code splitting, blocking resources
  - **Solutions:**
    - Enable code splitting with dynamic imports
    - Optimize images (use next/image)
    - Defer non-critical JavaScript
    - Use font-display: swap for web fonts
  - **Measure:** Run Lighthouse audit

- **Issue:** High Cumulative Layout Shift (CLS > 0.1)
  - **Causes:** Images without dimensions, dynamic content injection
  - **Solutions:**
    - Add width/height to all images
    - Reserve space for dynamic content
    - Use skeleton screens
  - **Code reference:** `src/components/ui/skeleton.tsx`

- **Issue:** Janky animations (< 60fps)
  - **Causes:** JavaScript animations, layout thrashing
  - **Solutions:**
    - Use CSS animations instead of JavaScript
    - Use transform and opacity for animations (GPU accelerated)
    - Add `will-change` CSS property
  - **Code reference:** `src/components/ui/loading-overlay.tsx`

---

## Ek Kaynaklar

### Dökümantasyon
- [Zustand Persist SSR](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Appwrite Docs](https://appwrite.io/docs)
- [Full System Test Guide](../scripts/full-system-test.ts)
- [Browser Compatibility Testing](../scripts/test-browser-compatibility.ts)
- [Production Build Testing](../scripts/test-production-build-enhanced.ts)
- [Error Boundary Testing Guide](ERROR-BOUNDARY-TESTING-GUIDE.md)
- [Loading States Guide](LOADING-STATES-GUIDE.md)
- [Suspense Boundaries Guide](SUSPENSE-BOUNDARIES-GUIDE.md)
- [Configuration Troubleshooting](CONFIGURATION-TROUBLESHOOTING.md)

### Komutlar Özeti
```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript check

# Testing
npm test             # Run Vitest tests
npm run e2e          # Run Playwright E2E tests

# Full System Testing
npm run test:full-system      # Complete integration test
npm run test:browsers         # Multi-browser compatibility
npm run test:prod-enhanced    # Production build validation

# Diagnostic Tools
npm run validate:config       # Validate environment
npm run test:connectivity     # Test Appwrite connection
npm run diagnose              # Comprehensive diagnostics

# Boundary Testing
npm run test:error-boundaries # Test error handling
npm run test:loading-states   # Test loading UI
npm run test:suspense         # Test Suspense boundaries
npm run test:all-boundaries   # Run all boundary tests

# Cache temizleme
rm -rf .next node_modules package-lock.json && npm install

# Appwrite scripts
npx tsx src/scripts/test-appwrite-connection.ts
npx tsx src/scripts/create-test-users.ts
```

---

| Issue | Quick Fix | Detailed Section |
|-------|-----------|------------------|
| Beyaz Ekran | `localStorage.clear()` + reload | Beyaz Ekran / Hydration Mismatch |
| Peer Dependency Warnings | `npm install --legacy-peer-deps` | Peer Dependency Uyarıları |
| Hydration Error | Check console, disable extensions | Hydration Mismatch Debug |
| Environment Variables | Copy `.env.example` to `.env.local` | Environment Variables Sorunları |
| Browser Extension Issues | Test in Incognito mode | Browser Extension Sorunları |
| Cache Issues | `rm -rf .next && npm run dev` | Cache Temizleme |
| Appwrite Connection | `npm run test:connectivity` | Appwrite Bağlantı Sorunları |
| Auth Redirect Loop | Check `_hasHydrated` + `isInitialized` | Integration Issues |
| Firefox CSP Error | Update CSP in `next.config.ts` | Browser-Specific Issues |
| Safari iOS Viewport | Use `dvh` units instead of `vh` | Browser-Specific Issues |
| Large Bundle Size | Run `ANALYZE=true npm run build` | Production Build Issues |
| Slow TTI | Implement code splitting | Production Build Issues |
| E2E Tests Fail | Add explicit waits | Testing Issues |
| Slow Page Load | Run Lighthouse audit | Performance Issues |

---

**Last Updated:** 29 Ekim 2025
**Proje:** Dernek Yönetim Sistemi
**Stack:** Next.js 16 + React 19 + Appwrite + Zustand