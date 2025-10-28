# Lighthouse Audit Guide

Bu guide, Lighthouse audit'in nasıl yapılacağını ve sonuçların nasıl yorumlanacağını açıklar.

## Lighthouse Audit Nasıl Yapılır?

### 1. Chrome DevTools ile Audit

**Adımlar:**
1. Chrome browser'da projeyi açın (`http://localhost:3000`)
2. F12 veya Cmd+Option+I (Mac) ile DevTools'u açın
3. "Lighthouse" tab'ına gidin
4. Audit ayarlarını yapın:
   - Mode: Navigation (default)
   - Device: Desktop ve Mobile (ayrı ayrı test edin)
   - Categories: Tümünü seçin (Performance, Accessibility, Best Practices, SEO, PWA)
5. "Analyze page load" butonuna tıklayın
6. Sonuçları bekleyin (30-60 saniye)

### 2. Lighthouse CLI ile Audit

**Kurulum:**
```bash
npm install -g lighthouse
```

**Kullanım:**
```bash
# Desktop audit
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-desktop.html --preset=desktop

# Mobile audit
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-mobile.html --preset=mobile

# JSON output (CI/CD için)
lighthouse http://localhost:3000 --output json --output-path ./lighthouse-results.json
```

### 3. Lighthouse CI (Automated)

**package.json'a script ekle:**
```json
{
  "scripts": {
    "lighthouse": "lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html",
    "lighthouse:ci": "lhci autorun"
  }
}
```

## Target Scores (Hedef Skorlar)

Proje için minimum hedef skorlar:

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| **Performance** | > 90 | ? | ⏳ Test edilmeli |
| **Accessibility** | > 95 | ? | ⏳ Test edilmeli |
| **Best Practices** | > 90 | ? | ⏳ Test edilmeli |
| **SEO** | > 90 | ? | ⏳ Test edilmeli |
| **PWA** | N/A | N/A | ℹ️ PWA değil |

## Audit Checklist

### Performance Metrics

**Core Web Vitals:**
- [ ] **First Contentful Paint (FCP)**: < 1.8s
- [ ] **Largest Contentful Paint (LCP)**: < 2.5s
- [ ] **Total Blocking Time (TBT)**: < 300ms
- [ ] **Cumulative Layout Shift (CLS)**: < 0.1
- [ ] **Speed Index**: < 3.4s

**Other Metrics:**
- [ ] **Time to Interactive (TTI)**: < 3.8s
- [ ] **First Meaningful Paint**: < 2.0s

### Accessibility Checks

**WCAG AA Compliance:**
- [ ] Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- [ ] ARIA attributes present and valid
- [ ] Form labels associated with inputs
- [ ] Alt text for images
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] No automatic audio/video playback

**Tools:**
- Chrome DevTools Lighthouse
- axe DevTools extension
- WAVE browser extension
- WebAIM Contrast Checker

### Best Practices

- [ ] HTTPS kullanılıyor (production'da)
- [ ] Console errors yok
- [ ] Deprecated APIs kullanılmıyor
- [ ] Images aspect ratio doğru
- [ ] No vulnerable libraries (npm audit)
- [ ] CSP headers set (Content Security Policy)
- [ ] Geolocation on secure origin

### SEO

- [ ] `<title>` tag mevcut ve descriptive
- [ ] `<meta name="description">` mevcut
- [ ] `<meta name="viewport">` mevcut
- [ ] Document has valid `lang` attribute
- [ ] Links have descriptive text
- [ ] Images have alt attributes
- [ ] robots.txt valid
- [ ] Structured data (JSON-LD) - optional

## Common Issues & Solutions

### Performance Issues

**Issue: Large JavaScript bundles**
- Solution: Code splitting, lazy loading
- Check: `npm run analyze` (bundle analyzer)

**Issue: Render-blocking resources**
- Solution: Defer non-critical CSS/JS
- Check: `next.config.ts` optimizations

**Issue: Large images**
- Solution: Use Next.js Image component, WebP format
- Check: Currently using SVG (good)

**Issue: Unused JavaScript**
- Solution: Tree shaking, remove unused dependencies
- Check: `npm run build` output

### Accessibility Issues

**Issue: Low contrast ratios**
- Solution: Adjust colors in `tailwind.config.ts`
- Check: WebAIM Contrast Checker

**Issue: Missing ARIA labels**
- Solution: Add `aria-label` to icon buttons
- Check: LoadingOverlay already has ARIA ✅

**Issue: Form inputs without labels**
- Solution: Use `<Label>` component from shadcn/ui
- Check: All forms use react-hook-form + Label ✅

**Issue: Keyboard navigation broken**
- Solution: Ensure focusable elements have proper tabindex
- Check: Test with Tab key

### Best Practices Issues

**Issue: Console errors in production**
- Solution: `next.config.ts` already has `removeConsole: true` ✅

**Issue: Vulnerable dependencies**
- Solution: Run `npm audit fix`
- Check: `npm audit`

**Issue: Missing CSP headers**
- Solution: Add to `next.config.ts` headers
- Check: Already configured ✅

## Testing Different Pages

Audit yapılması gereken sayfalar:

1. **Homepage/Dashboard** (`/genel`)
   - Most important page
   - Heavy with widgets and data

2. **Login Page** (`/login`)
   - First user interaction
   - Should be fast

3. **Beneficiaries List** (`/yardim/ihtiyac-sahipleri`)
   - Data-heavy page
   - Table performance

4. **Beneficiary Detail** (`/yardim/ihtiyac-sahipleri/[id]`)
   - Form performance
   - Image loading

5. **Settings Page** (`/settings`)
   - Tab switching performance
   - Form validation

6. **User Management** (`/kullanici`)
   - CRUD operations
   - Modal performance

## Audit Report Template

```markdown
# Lighthouse Audit Report

**Date**: [YYYY-MM-DD]
**Auditor**: [Name]
**Environment**: [Local/Staging/Production]
**Device**: [Desktop/Mobile]

## Scores

| Category | Score | Status |
|----------|-------|--------|
| Performance | XX/100 | ✅/⚠️/❌ |
| Accessibility | XX/100 | ✅/⚠️/❌ |
| Best Practices | XX/100 | ✅/⚠️/❌ |
| SEO | XX/100 | ✅/⚠️/❌ |

## Core Web Vitals

- **FCP**: X.Xs (Target: < 1.8s)
- **LCP**: X.Xs (Target: < 2.5s)
- **TBT**: XXXms (Target: < 300ms)
- **CLS**: X.XX (Target: < 0.1)
- **Speed Index**: X.Xs (Target: < 3.4s)

## Issues Found

### Critical (Must Fix)
1. [Issue description]
   - Impact: [Performance/Accessibility/etc.]
   - Solution: [How to fix]

### High Priority
1. [Issue description]

### Medium Priority
1. [Issue description]

### Low Priority
1. [Issue description]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Fix critical issues
- [ ] Re-run audit
- [ ] Document improvements
```

## Automation (CI/CD)

**GitHub Actions Example:**
```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: npx wait-on http://localhost:3000
      - run: npm run lighthouse:ci
      - uses: actions/upload-artifact@v3
        with:
          name: lighthouse-report
          path: lighthouse-report.html
```

## Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web.dev Metrics](https://web.dev/metrics/)
- [Core Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated**: 2025-10-28
**Status**: Ready for Testing