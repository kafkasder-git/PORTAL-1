# 🗺️ Design System Implementasyon Rehberi

Adım adım kurumsal tasarım sistemini uygulamak için detaylı rehber.

---

## 📊 Özet Timeline

| Faz | Zaman | Hedefler | Status |
|-----|-------|----------|--------|
| **1: Foundation** | 1 hafta | Config, CSS, Tokens | 🔵 Başlayacak |
| **2: Base Components** | 1 hafta | Button, Form, Card | ⭕ Bekleniyor |
| **3: Layout** | 1 hafta | Sidebar, Nav, Header | ⭕ Bekleniyor |
| **4: Complex** | 1 hafta | Modal, Table, Dropdown | ⭕ Bekleniyor |
| **5: Pages** | 1 hafta | Dashboard, List, Detail | ⭕ Bekleniyor |
| **6: Polish** | 1 hafta | Testing, A11y, Browser | ⭕ Bekleniyor |

**Total: 6 Hafta → Production Ready** ✅

---

## Faz 1: Foundation (Bu Hafta)

### Görevler

#### ✅ 1.1: Tailwind Config Güncelleme
```bash
# File: tailwind.config.ts
```

**Yapılacaklar:**
- [ ] Primary color palette ekle (50-900 shades)
- [ ] Success, Warning, Error, Info colors ekle
- [ ] Gray (neutral) palette ekle
- [ ] Typography (Inter, Poppins, Fira Code) ekle
- [ ] Spacing scale ekle
- [ ] Shadows ekle
- [ ] Border-radius ekle

**Code:**
```typescript
export default {
  theme: {
    colors: {
      primary: {
        50: '#F5F9FF',
        // ... 50-900
      },
      success: { /* ... */ },
      warning: { /* ... */ },
      error: { /* ... */ },
      gray: { /* ... */ },
    },
    fontFamily: {
      sans: "['Inter', ...]",
      heading: "['Poppins', ...]",
      mono: "['Fira Code', ...]",
    },
    spacing: {
      0: '0px',
      1: '4px',
      // ... scale
    },
    // ... diğer konfigürasyonlar
  },
};
```

#### ✅ 1.2: Global Styles
```bash
# File: src/app/globals.css
```

**Yapılacaklar:**
- [ ] CSS variables tanımla
- [ ] Base element styling
- [ ] Focus states
- [ ] Scrollbar styling

**Code:**
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

:root {
  /* Colors */
  --primary: #1358B8;
  --primary-dark: #0B3D7D;
  /* ... diğer variables */
}

* {
  @apply transition-colors 150ms ease-in-out;
}

body {
  @apply font-sans text-gray-900 bg-white;
}

h1, h2, h3, h4, h5, h6 {
  @apply font-heading font-bold tracking-tight;
}

*:focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2;
}
```

#### ✅ 1.3: Design Tokens Dosyası
```bash
# File: src/config/design-tokens.ts
# ✅ Zaten oluşturuldu!
```

Dosya kontrol listesi:
- [x] Colors object
- [x] Typography object
- [x] Spacing object
- [x] Shadows object
- [x] Transitions object
- [x] Z-index object
- [x] Components object
- [x] Layout object

### Kontrol Listesi - Faz 1

```
Foundation Setup:
☐ Tailwind config colors güncellendi
☐ Tailwind config typography güncellendi
☐ Tailwind config spacing güncellendi
☐ Global styles yazıldı
☐ CSS variables tanımlandı
☐ Design tokens file oluşturuldu
☐ npm run lint - error yok
☐ npm run build - başarılı

Testing:
☐ Renkleri test et (color picker)
☐ Typography test et (heading, body)
☐ Spacing test et (padding, margin)
☐ Focus states test et (keyboard nav)
```

---

## Faz 2: Base Components (Hafta 2)

### Görevler

#### 2.1: Button Component Varyasyonları

**Dosya:** `src/components/ui/button.tsx` (Şu an basit, iyileştir!)

**Varyasyonlar:**
- [ ] **Primary**: Primary-700 bg, white text
- [ ] **Secondary**: Gray-100 bg, Primary-700 text
- [ ] **Outline**: Transparent bg, Primary-700 border
- [ ] **Ghost**: Transparent bg, Primary-700 text (hover: bg-50)
- [ ] **Danger**: Error-700 bg, white text
- [ ] **Success**: Success-700 bg, white text

**Sizes:**
- [ ] **SM**: 12px font, 8px 16px padding
- [ ] **MD**: 14px font, 12px 24px padding (default)
- [ ] **LG**: 16px font, 16px 32px padding

**States:**
- [ ] Default
- [ ] Hover
- [ ] Active/Pressed
- [ ] Disabled
- [ ] Loading

**Code Example:**
```typescript
// src/components/ui/button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const variantStyles = {
    primary: 'bg-primary-700 text-white hover:bg-primary-600 active:bg-primary-800',
    secondary: 'bg-gray-100 text-primary-700 hover:bg-gray-200',
    // ... diğer varyasyonlar
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button className={`${variantStyles[variant]} ${sizeStyles[size]} ...`}>
      {loading ? <Spinner /> : props.children}
    </button>
  );
}
```

#### 2.2: Form Elements

**Input Field:**
```typescript
// src/components/ui/input.tsx
interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Base: h-10, px-3, border-1, rounded-lg, focus:ring-primary
```

**Select Dropdown:**
```typescript
// src/components/ui/select.tsx
// Icon: ChevronDown Gray-600
// Open: ring-primary
```

**Checkbox:**
```typescript
// src/components/ui/checkbox.tsx
// 20x20px, rounded-sm, checked: Primary-700 bg, focus: ring-primary
```

**Radio:**
```typescript
// src/components/ui/radio.tsx
// 20x20px, rounded-full, checked: Primary-700 bg
```

**Textarea:**
```typescript
// src/components/ui/textarea.tsx
// min-h-32, resize-vertical only, same as input
```

#### 2.3: Card Component

**Dosya:** `src/components/ui/card.tsx`

```typescript
interface CardProps {
  variant?: 'default' | 'outlined' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

// Styles:
// default: White bg, Gray-200 border, md shadow
// outlined: White bg, Gray-200 border, no shadow
// flat: Gray-50 bg, no border, no shadow
// hover: Shadow lg on hover, cursor-pointer
```

#### 2.4: Badge/Tag Component

**Dosya:** `src/components/ui/badge.tsx`

```typescript
interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

// Styles:
// variant: Renge göre bg ve text rengi
// size: Padding ve font-size
// Rounded: 20px (pill shaped)
```

#### 2.5: Alert Component

**Dosya:** `src/components/ui/alert.tsx`

```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description: string;
  onClose?: () => void;
}

// Styles:
// - Left border 4px
// - Icon + title + description
// - Close button (X)
// - Padding: 16px
// - Border-radius: 8px
```

### Kontrol Listesi - Faz 2

```
Base Components:
☐ Button (6 varyasyon, 3 size, 4 state)
☐ Input field (label, error, hint, icon, disabled)
☐ Select dropdown
☐ Checkbox
☐ Radio
☐ Textarea
☐ Card (3 varyasyon)
☐ Badge/Tag (5 tür)
☐ Alert (4 tür)

Testing:
☐ Tüm button varyasyonları test
☐ Focus states keyboard ile test
☐ Hover states mouse ile test
☐ Disabled states test
☐ Form validation states test
☐ Accessibility: WCAG AA contrast test
```

---

## Faz 3-6 Rehberi

### Faz 3: Layout Components

```
Yapılacaklar:
☐ Sidebar component (responsive, collapsible)
☐ Navigation menu (horizontal + vertical)
☐ Header component
☐ Footer component
☐ Container component
☐ Grid system
```

### Faz 4: Complex Components

```
Yapılacaklar:
☐ Modal/Dialog
☐ Dropdown menu
☐ Pagination (zaten var, iyileştir)
☐ Table (styled)
☐ Breadcrumb
☐ Tabs
```

### Faz 5: Page Templates

```
Yapılacaklar:
☐ Dashboard layout
☐ List page template (beneficiaries, donations)
☐ Detail page template
☐ Form page template
☐ Empty state template
```

### Faz 6: Polish & Testing

```
Yapılacaklar:
☐ Dark mode support (CSS variables)
☐ Animations (Framer Motion entegrasyonu)
☐ Accessibility testing (Axe DevTools)
☐ Cross-browser testing (Chrome, Firefox, Safari)
☐ Mobile testing (actual devices)
☐ Performance testing (Lighthouse)
```

---

## 🛠️ Teknik Notlar

### Tailwind Config Override

```typescript
// tailwind.config.ts
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: designTokens.colors,
      fontFamily: {
        sans: designTokens.typography.fonts.sans,
        heading: designTokens.typography.fonts.heading,
      },
      spacing: designTokens.spacing,
      // ... diğer extends
    },
  },
  plugins: [],
};
```

### CSS Variables ile Dynamic Styling

```css
/* CSS Variables for runtime changes */
:root {
  --color-primary: #1358B8;
  --color-primary-hover: #0F4A9A;
}

.button-primary {
  background-color: var(--color-primary);
}

.button-primary:hover {
  background-color: var(--color-primary-hover);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #4A8FFF;
    --color-primary-hover: #7CB3FF;
  }
}
```

### Component File Organization

```
src/components/ui/
├── button/
│   ├── button.tsx
│   ├── button.stories.tsx (Storybook)
│   └── button.test.tsx (Jest)
├── input/
│   ├── input.tsx
│   └── input.stories.tsx
├── card/
│   └── card.tsx
└── ... diğer components
```

---

## 📋 Best Practices

### 1. **Consistency**
- Tüm colors `design-tokens.ts`'den al
- Tüm spacing tailwind scale'i kullan
- Tüm shadows `designTokens.shadows` kullan

### 2. **Accessibility**
- Alt text tüm görsellerde
- Semantic HTML kullan (button, input, label)
- Focus states visible olsun
- Kontrast oranı ≥ 4.5:1

### 3. **Performance**
- Lazy load images
- CSS minimize et
- JS bundle optimize et

### 4. **Testing**
- Visual regression testing (Percy, Chromatic)
- Accessibility testing (Axe, Lighthouse)
- Component testing (Jest + React Testing Library)

---

## 📚 Referanslar

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Design System Guidelines](https://design.systems/)

---

**Next: Faz 2 - Base Components başlatılabilir** ✅
