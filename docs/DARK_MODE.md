# Dark Mode Support Guide

## Overview

This document outlines the comprehensive dark mode implementation in the Dernek Yönetim Sistemi, providing a seamless user experience across light and dark themes.

## Table of Contents

1. [Implementation Overview](#implementation-overview)
2. [Theme Provider](#theme-provider)
3. [CSS Variables](#css-variables)
4. [Theme Toggle Component](#theme-toggle-component)
5. [Component Integration](#component-integration)
6. [System Preferences](#system-preferences)
7. [Custom Themes](#custom-themes)
8. [Best Practices](#best-practices)

---

## Implementation Overview

The dark mode system uses a combination of:

1. **CSS Custom Properties**: Define color tokens that change based on theme
2. **React Context**: Theme state management
3. **Local Storage**: Persist user theme preference
4. **System Detection**: Automatically detect user's system preference

### Architecture

```
ThemeProvider (React Context)
    ↓
CSS Variables (CSS Custom Properties)
    ↓
TailwindCSS Utilities
    ↓
Components (Automatic theming)
```

---

## Theme Provider

The `ThemeProvider` is the core of the theme system, wrapping the application and providing theme context.

### Usage

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/shared/lib/theme-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Props

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';  // Default: 'system'
  storageKey?: string;                          // Default: 'theme'
}
```

### Hook Usage

```tsx
import { useTheme } from '@/shared/lib/theme-provider';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // theme: 'light' | 'dark' | 'system'
  // resolvedTheme: 'light' | 'dark' (actual resolved theme)
  // setTheme: (theme: Theme) => void

  return (
    <button onClick={() => setTheme('dark')}>
      Switch to Dark
    </button>
  );
}
```

---

## CSS Variables

The theme system uses CSS custom properties (variables) that change based on the `.dark` class.

### Color Tokens

#### Base Colors

```css
:root {
  --background: 0 0% 100%;        /* White */
  --foreground: 222.2 84% 4.9%;   /* Dark navy */
  --card: 0 0% 100%;               /* White */
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;    /* Dark navy */
  --foreground: 210 40% 98%;       /* Light gray */
  --card: 222.2 84% 4.9%;          /* Dark navy */
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
}
```

#### Semantic Colors

```css
:root {
  --primary: 221.2 83.2% 53.3%;    /* Blue */
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;      /* Light gray */
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 84.2% 60.2%;    /* Red */
  --destructive-foreground: 210 40% 98%;

  --success: 142.1 76.2% 36.3%;    /* Green */
  --warning: 38 92% 50%;           /* Amber */
  --info: 221.2 83.2% 53.3%;       /* Blue */
}

.dark {
  --primary: 217.2 91.2% 59.8%;    /* Brighter blue */
  --primary-foreground: 222.2 47.4% 11.2%;

  --secondary: 217.2 32.6% 17.5%;  /* Dark gray */
  --secondary-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 62.8% 30.6%;    /* Brighter red */
  --destructive-foreground: 210 40% 98%;
}
```

### TailwindCSS Integration

The CSS variables are mapped to TailwindCSS utilities:

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // ... other colors
      },
    },
  },
  plugins: [],
};
```

### Usage in Components

```tsx
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground">
    <h1 className="text-primary">Title</h1>
  </div>
</div>
```

---

## Theme Toggle Component

### Full Theme Toggle

Provides a dropdown menu with light, dark, and system options.

```tsx
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

### Compact Toggle

Simple toggle button for mobile or small spaces.

```tsx
import { ThemeToggleCompact } from '@/shared/components/ui/theme-toggle';

function MobileHeader() {
  return (
    <div className="flex items-center gap-2">
      <h1>My App</h1>
      <ThemeToggleCompact />
    </div>
  );
}
```

### Custom Implementation

```tsx
import { useTheme } from '@/shared/lib/theme-provider';

function CustomThemeButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-primary text-primary-foreground"
    >
      {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

---

## Component Integration

All components should use CSS variables for theming:

### Button

```tsx
<button className="
  bg-primary text-primary-foreground
  hover:bg-primary/90
  transition-theme
">
  Button
</button>
```

### Card

```tsx
<div className="
  bg-card text-card-foreground
  border border-border
  rounded-lg
  p-6
  transition-theme
">
  <h2 className="text-2xl font-bold mb-2">Card Title</h2>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Input

```tsx
<input
  className="
    bg-background text-foreground
    border border-input
    rounded-md
    px-3 py-2
    focus:outline-none focus:ring-2 focus:ring-ring
    transition-theme
  "
  placeholder="Enter text..."
/>
```

### Chart/Graph

```tsx
// Using CSS variables for chart colors
<LineChart data={data}>
  <Line
    type="monotone"
    dataKey="value"
    stroke="hsl(var(--chart-1))"
    strokeWidth={2}
  />
</LineChart>
```

---

## System Preferences

### Auto-Detection

The theme provider automatically detects the user's system preference:

```tsx
// On first visit, theme is set to 'system'
const [theme, setTheme] = useState<Theme>('system');

// Check system preference
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply appropriate theme
const resolvedTheme = theme === 'system' ? systemPrefersDark ? 'dark' : 'light' : theme;
```

### Listen for System Changes

If theme is set to 'system', it automatically updates when system preference changes:

```tsx
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    if (theme === 'system') {
      // Update theme if system preference changes
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    }
  };

  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, [theme]);
```

---

## Custom Themes

### Creating Custom Color Schemes

Add custom CSS variables in `globals.css`:

```css
:root {
  /* Custom theme variables */
  --my-primary: 262 83% 58%;      /* Purple */
  --my-secondary: 210 40% 96.1%;   /* Light */
  --my-accent: 221.2 83.2% 53.3%;  /* Blue */
}

.dark {
  --my-primary: 262 83% 72%;       /* Lighter purple */
  --my-secondary: 217.2 32.6% 17.5%; /* Dark */
  --my-accent: 217.2 91.2% 59.8%;  /* Light blue */
}
```

### Applying Custom Themes

```tsx
// Toggle between themes
function ThemeSelector() {
  const [customTheme, setCustomTheme] = useState('default');

  return (
    <div className={cn('theme-wrapper', customTheme === 'purple' && 'theme-purple')}>
      {/* Content */}
    </div>
  );
}
```

### Multiple Theme Support

```tsx
// Support multiple theme variants
<div className={cn(
  'bg-background text-foreground',
  themeVariant === 'purple' && 'theme-purple',
  themeVariant === 'green' && 'theme-green'
)}>
  Content
</div>
```

---

## Best Practices

### 1. Use CSS Variables

✅ **DO**: Use CSS custom properties
```tsx
<div className="bg-background text-foreground">
```

❌ **DON'T**: Use hardcoded colors
```tsx
<div className="bg-white text-black">
```

### 2. Add Transitions

✅ **DO**: Add smooth transitions
```tsx
<div className="bg-background text-foreground transition-theme">
```

❌ **DON'T**: Abrupt color changes
```tsx
<div className="bg-background text-foreground">
```

### 3. Test Both Themes

Ensure all components look good in both light and dark modes:

```tsx
// Component should have good contrast in both themes
function Badge({ variant, children }) {
  return (
    <span className={cn(
      'px-2 py-1 rounded text-sm font-medium',
      variant === 'success' && 'bg-success text-success-foreground',
      variant === 'warning' && 'bg-warning text-warning-foreground',
      'transition-theme'
    )}>
      {children}
    </span>
  );
}
```

### 4. Respect System Preferences

```tsx
function MyApp() {
  const { theme } = useTheme();

  // Show appropriate icon based on resolved theme
  return (
    <button>
      {theme === 'dark' ? <Moon /> : <Sun />}
    </button>
  );
}
```

### 5. Accessible Contrast

Ensure sufficient contrast ratios:

- **Light mode**: Dark text on light backgrounds
- **Dark mode**: Light text on dark backgrounds
- **Minimum**: 4.5:1 ratio for normal text
- **Large text**: 3:1 ratio minimum

### 6. Print Styles

Handle dark mode in print:

```css
@media print {
  :root, .dark {
    --background: 255 255 255;
    --foreground: 0 0 0;
  }
}
```

### 7. Lazy Load Theme

Optimize initial load:

```tsx
// Only load theme on client side
useEffect(() => {
  setTheme(localStorage.getItem('theme') || 'system');
}, []);
```

---

## Common Issues & Solutions

### Issue: Theme Flickering on Load

**Solution**: Add `suppressHydrationWarning` to html element:

```tsx
<html lang="tr" suppressHydrationWarning>
```

### Issue: Components Not Updating

**Solution**: Add `transition-theme` class:

```tsx
<div className="bg-background text-foreground transition-theme">
```

### Issue: Incorrect Theme Detection

**Solution**: Ensure theme provider wraps app:

```tsx
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

### Issue: Print Shows Dark Colors

**Solution**: Override print styles:

```css
@media print {
  * {
    background: white !important;
    color: black !important;
  }
}
```

---

## Performance Considerations

### Avoid Flash of Wrong Theme (FOIT)

1. Add inline script to set theme before CSS loads:

```html
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('theme') || 'system';
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
      })();
    `,
  }}
/>
```

### Optimize Transitions

Limit transitions for better performance:

```css
/* Only transition color-related properties */
.transition-theme {
  transition-property: background-color, border-color, color;
}
```

---

## Testing

### Manual Testing

Test both themes manually:

1. **Light mode**: Verify readability and contrast
2. **Dark mode**: Check for eye strain, color accuracy
3. **System mode**: Verify automatic switching
4. **Persistence**: Confirm theme persists on reload

### Automated Testing

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/shared/lib/theme-provider';

test('renders in dark mode', () => {
  render(
    <ThemeProvider defaultTheme="dark">
      <MyComponent />
    </ThemeProvider>
  );

  expect(screen.getByTestId('component')).toHaveClass('dark');
});
```

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 76+     | ✅ Full |
| Firefox | 67+     | ✅ Full |
| Safari  | 12.1+   | ✅ Full |
| Edge    | 79+     | ✅ Full |

---

## Resources

### Documentation
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Web.dev: Dark Mode](https://web.dev/articles/dark-mode)

### Tools
- [Stark](https://www.getstark.co/) - Accessibility and contrast checker
- [Dark Mode Test](https://darkmodetest.in/) - Test dark mode implementation

### Articles
- [Dark UI Design](https://www.smashingmagazine.com/2019/09/strategies-dark-mode-web-design/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

*Last Updated: November 2025*
*Version: 1.0*
