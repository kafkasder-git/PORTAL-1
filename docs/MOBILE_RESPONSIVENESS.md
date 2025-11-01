# Mobile Responsiveness Guide

## Overview

This document outlines the comprehensive mobile responsiveness strategies and implementation in the Dernek Yönetim Sistemi, ensuring optimal user experience across all devices.

## Table of Contents

1. [Responsive Design Strategy](#responsive-design-strategy)
2. [Component Patterns](#component-patterns)
3. [Mobile Navigation](#mobile-navigation)
4. [Responsive Tables](#responsive-tables)
5. [Touch Interactions](#touch-interactions)
6. [Viewport Configuration](#viewport-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Best Practices](#best-practices)

---

## Responsive Design Strategy

### Breakpoints

The application uses the following breakpoints (aligned with Tailwind CSS):

| Breakpoint | Min Width | Description |
|------------|-----------|-------------|
| `sm` | 640px | Small devices (landscape phones) |
| `md` | 768px | Medium devices (tablets) |
| `lg` | 1024px | Large devices (desktops) |
| `xl` | 1280px | Extra large screens |
| `2xl` | 1536px | 2K+ screens |

### Device Detection

Use the responsive utilities to detect device types:

```typescript
import { useIsMobile, responsive } from '@/shared/lib/utils/responsive';

function MyComponent() {
  const isMobile = useIsMobile();

  // Or use responsive helper
  const deviceType = getDeviceType(); // 'mobile' | 'tablet' | 'desktop'
}
```

### Layout Patterns

#### 1. Mobile-First Approach
All components are designed with mobile as the base, then enhanced for larger screens:

```tsx
<div className="
  px-4 py-2           /* Mobile: small padding */
  md:px-6 md:py-4     /* Tablet+: larger padding */
  lg:px-8 lg:py-6     /* Desktop+: even larger */
">
  Content
</div>
```

#### 2. Flexible Grid System
Use CSS Grid and Flexbox for flexible layouts:

```tsx
<div className="
  grid grid-cols-1      /* Mobile: single column */
  md:grid-cols-2        /* Tablet: two columns */
  lg:grid-cols-3        /* Desktop: three columns */
  xl:grid-cols-4        /* Large: four columns */
  gap-4
">
  {/* Grid items */}
</div>
```

---

## Component Patterns

### Responsive Card Grid

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

function ResponsiveCardGrid({ items }: { items: any[] }) {
  return (
    <div className="
      grid grid-cols-1      /* Mobile: 1 column */
      sm:grid-cols-2        /* Small: 2 columns */
      lg:grid-cols-3        /* Desktop: 3 columns */
      xl:grid-cols-4        /* Large: 4 columns */
      gap-4
    >
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Responsive Form Layout

```tsx
function ResponsiveForm() {
  return (
    <form className="space-y-4">
      {/* Stack vertically on mobile, side-by-side on desktop */}
      <div className="
        grid grid-cols-1      /* Mobile: single column */
        md:grid-cols-2        /* Tablet+: two columns */
        gap-4
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            First Name
          </label>
          <input
            type="text"
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              min-h-[44px]           /* Touch-friendly minimum */
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Last Name
          </label>
          <input
            type="text"
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              min-h-[44px]
            "
          />
        </div>
      </div>

      {/* Full width on mobile, 2/3 on desktop */}
      <div className="
        grid grid-cols-1
        md:grid-cols-3
        gap-4
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              min-h-[44px]
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            type="tel"
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              min-h-[44px]
            "
          />
        </div>
      </div>
    </form>
  );
}
```

---

## Mobile Navigation

### Mobile Navigation Component

The application includes a comprehensive mobile navigation system:

```tsx
import { MobileNavigation } from '@/shared/components/ui/mobile-navigation';

function Layout({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r">
        {/* Desktop navigation items */}
      </nav>

      {/* Mobile Navigation */}
      <MobileNavigation user={user} onLogout={onLogout} />

      {/* Main Content */}
      <main className="lg:ml-64 pb-16 lg:pb-0">  {/* Bottom padding for mobile tab bar */}
        {/* Content */}
      </main>

      {/* Bottom Tab Bar (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        {/* Bottom navigation items */}
      </div>
    </>
  );
}
```

### Mobile Modal

For full-screen mobile modals:

```tsx
import { MobileModal } from '@/shared/components/ui/mobile-navigation';

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <MobileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Settings"
        fullScreen={true}
      >
        <div className="space-y-4">
          {/* Modal content */}
        </div>
      </MobileModal>
    </>
  );
}
```

---

## Responsive Tables

### Using the ResponsiveTable Component

```tsx
import { ResponsiveTable, type ResponsiveColumn } from '@/shared/components/ui/responsive-table';

const columns: ResponsiveColumn[] = [
  {
    key: 'name',
    label: 'Name',
    mobileLabel: 'İsim',
  },
  {
    key: 'email',
    label: 'Email',
    mobileRender: (row) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-gray-400" />
        <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline">
          {row.email}
        </a>
      </div>
    ),
  },
  {
    key: 'role',
    label: 'Role',
    mobileLabel: 'Rol',
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    ),
  },
];

function UsersTable({ users }: { users: any[] }) {
  const handleRowClick = (user: any) => {
    // Handle row click
  };

  const handleExport = () => {
    // Handle export
  };

  return (
    <ResponsiveTable
      columns={columns}
      data={users}
      rowKey="id"
      onRowClick={handleRowClick}
      onExport={handleExport}
      searchable={true}
      emptyMessage="Kullanıcı bulunamadı"
    />
  );
}
```

### Mobile Card Layout Features

The responsive table automatically switches to card layout on mobile devices:

- **Desktop**: Traditional table with all columns
- **Mobile**: Card-based layout showing key information
- **Custom Mobile Rendering**: Define `mobileRender` for custom layouts
- **Touch-Friendly**: All interactive elements meet 44px minimum touch target size

---

## Touch Interactions

### Touch Target Sizes

All interactive elements maintain minimum touch target sizes:

```tsx
// Small button
<button className="min-h-[44px] min-w-[44px] p-2">
  <Icon className="h-5 w-5" />
</button>

// Medium button
<button className="min-h-[48px] px-4 py-2">
  Click Me
</button>

// Large button (primary actions)
<button className="min-h-[56px] px-6 py-3 text-lg font-medium">
  Primary Action
</button>
```

### Gesture Support

```tsx
import { useSwipeable } from 'react-swipeable';

function SwipeableCard({ onSwipeLeft, onSwipeRight }: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}) {
  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  return (
    <div {...handlers} className="touch-pan-y">
      Card content
    </div>
  );
}
```

---

## Viewport Configuration

### Next.js Configuration

Ensure proper viewport configuration in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable automatic viewport detection
  experimental: {
    scrollRestoration: true,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for mobile optimization
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge',
          },
          {
            key: 'viewport',
            value: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### HTML Viewport Meta Tag

In `pages/_document.tsx`:

```tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta
          name="viewport"
          content="
            width=device-width,
            initial-scale=1,
            maximum-scale=1,
            user-scalable=no,
            viewport-fit=cover
          "
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### CSS for Safe Areas

Add to global styles for devices with notches:

```css
/* In globals.css */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

.mobile-container {
  padding-top: var(--safe-area-inset-top);
  padding-left: var(--safe-area-inset-left);
  padding-right: var(--safe-area-inset-right);
  padding-bottom: var(--safe-area-inset-bottom);
}
```

---

## Performance Optimization

### Image Optimization

```tsx
import Image from 'next/image';

function ResponsiveImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-0 pb-[56.25%]">  /* 16:9 aspect ratio */
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        priority={false}  // Only use priority for above-the-fold images
      />
    </div>
  );
}
```

### Code Splitting for Mobile

```tsx
// Lazy load heavy components on mobile
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

function Dashboard() {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <SimpleChart />
      ) : (
        <HeavyChart />
      )}
    </div>
  );
}
```

### Touch Event Optimization

```tsx
import { useCallback } from 'react';
import { debounce } from '@/shared/lib/utils/responsive';

function SearchInput() {
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      // Perform search
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  return (
    <input
      type="search"
      onChange={handleChange}
      className="w-full min-h-[44px] px-4 py-2"
    />
  );
}
```

---

## Best Practices

### 1. Mobile-First Development

✅ **DO**:
- Start with mobile design, then enhance for larger screens
- Use relative units (rem, em, %) over fixed pixels
- Test on real devices, not just browser resize
- Consider touch interactions from the start

❌ **DON'T**:
- Design desktop-first and squeeze for mobile
- Use fixed pixel widths
- Ignore mobile users in your testing
- Forget about touch interactions

### 2. Typography

```tsx
// Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Title
</h1>

<p className="text-sm md:text-base text-gray-600">
  Body text that scales with screen size
</p>

// Line height for readability
<p className="text-sm md:text-base leading-relaxed">
  Comfortable line height for mobile reading
</p>
```

### 3. Spacing

```tsx
// Use consistent spacing scale
<div className="space-y-2 md:space-y-4 lg:space-y-6">
  {/* Items with adaptive spacing */}
</div>

// Padding and margins
<div className="p-4 md:p-6 lg:p-8">
  {/* Content with adaptive padding */}
</div>
```

### 4. Interaction Patterns

```tsx
// Mobile-friendly buttons
<button className="
  w-full                    /* Full width on mobile */
  min-h-[44px]              /* Minimum touch target */
  px-4 py-2                 /* Comfortable padding */
  bg-blue-600 text-white    /* High contrast */
  rounded-lg                /* Modern rounded corners */
  font-medium               /* Readable font weight */
  active:scale-95           /* Touch feedback */
  transition-transform      /* Smooth animation */
">
  Primary Action
</button>

// Interactive elements
<button className="
  min-h-[44px] min-w-[44px]  /* Square touch targets */
  p-2                        /* Internal padding */
  rounded-lg                 /* Modern shape */
  hover:bg-gray-100          /* Hover state */
  active:bg-gray-200         /* Active state */
  transition-colors          /* Smooth transition */
">
  <Icon className="h-5 w-5" />
</button>
```

### 5. Form Design

```tsx
// Mobile-friendly form inputs
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-1">
      Email
    </label>
    <input
      type="email"
      autoComplete="email"        // Enable browser auto-fill
      inputMode="email"           // Mobile keyboard type
      className="
        w-full px-3 py-2
        min-h-[44px]              // Touch-friendly
        border border-gray-300
        rounded-lg
        focus:ring-2 focus:ring-blue-500
        focus:border-transparent
      "
    />
  </div>

  {/* Validation messages */}
  <p className="text-sm text-red-600">
    Error message
  </p>
</form>
```

### 6. Accessibility

```tsx
// Touch-friendly targets
<button
  aria-label="Delete item"
  className="min-h-[44px] min-w-[44px]"
>
  <TrashIcon className="h-5 w-5" />
</button>

// Readable text
<p className="text-sm md:text-base text-gray-700">
  Readable text with good contrast
</p>

// Focus indicators
<button className="
  min-h-[44px] px-4 py-2
  focus:outline-none focus:ring-2 focus:ring-blue-500
  focus:ring-offset-2
">
  Accessible button
</button>
```

---

## Testing

### Mobile Testing Checklist

- [ ] iPhone SE (375×667) - Small mobile
- [ ] iPhone 12 (390×844) - Standard mobile
- [ ] iPad (768×1024) - Tablet portrait
- [ ] iPad Pro (1024×1366) - Tablet landscape
- [ ] Android small (360×640) - Small Android
- [ ] Android large (412×915) - Large Android

### Testing Tools

1. **Browser DevTools**: Chrome/Firefox responsive mode
2. **Physical Devices**: Test on real devices
3. **BrowserStack**: Test on multiple devices
4. **Lighthouse**: Mobile performance audit

### Lighthouse Mobile Audit

Run Lighthouse in Chrome DevTools:

1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Mobile"
4. Select categories: Performance, Accessibility, Best Practices, SEO
5. Click "Generate report"

### Target Scores

- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 90

---

## Common Issues & Solutions

### Issue: Horizontal Scrolling on Mobile

**Solution**:
```tsx
// Avoid fixed widths
<div className="w-full">      // ✅ Good

<div className="w-[1200px]">  // ❌ Bad

// Handle long content
<p className="truncate">Long text that gets truncated</p>

<p className="break-words">Long unbreakable text that wraps</p>
```

### Issue: Text Too Small on Mobile

**Solution**:
```tsx
// Use responsive text sizes
<p className="text-sm md:text-base">  // ✅ Good

<p className="text-xs">              // ❌ Too small
```

### Issue: Buttons Too Small for Touch

**Solution**:
```tsx
// Ensure minimum touch target
<button className="min-h-[44px] min-w-[44px]">  // ✅ Good

<button className="h-6 w-6">                   // ❌ Too small
```

### Issue: Forms Hard to Use on Mobile

**Solution**:
```tsx
// Use appropriate input types
<input type="email" inputMode="email" />     // Email keyboard
<input type="tel" inputMode="tel" />         // Phone keyboard
<input type="number" inputMode="numeric" />  // Numeric keyboard

// Add autocomplete
<input autoComplete="email" />
<input autoComplete="name" />
<input autoComplete="tel" />
```

---

## Resources

### Documentation
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN: Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google: Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Tools
- [Browser DevTools](https://developer.chrome.com/docs/devtools/device-mode/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [BrowserStack](https://www.browserstack.com/)

### Articles
- [Mobile-First Design](https://web.dev/responsive-web-design-basics/)
- [Touch Targets](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile Page Speed](https://web.dev/mobile-performance/)

---

*Last Updated: November 2025*
*Version: 1.0*
