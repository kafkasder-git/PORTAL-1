# 🎨 Dernek Yönetim Sistemi - Kurumsal Design System

Dernekler ve yardım kuruluşlarına uygun, profesyonel ve güvenilir bir tasarım sistemi.

---

## 📋 İçindekiler

1. [Renk Paleti](#1-renk-paleti)
2. [Tipografi](#2-tipografi)
3. [Bileşen Kütüphanesi](#3-bileşen-kütüphanesi)
4. [Layout & Spacing](#4-layout--spacing)
5. [İkonografi](#5-ikonografi)
6. [Erişilebilirlik](#6-erişilebilirlik)
7. [Implementasyon Sırası](#7-implementasyon-sırası)

---

## 1. Renk Paleti

### 1.1 Temel Renkler (Primary)

**Kurumsal Mavi** - Güven, Stabilite, Profesyonellik
```
Primary-900:  #0B3D7D  (En koyu - Headers, prominent text)
Primary-800:  #0F4A9A
Primary-700:  #1358B8  (Ana brand rengi - Buttons, CTAs)
Primary-600:  #1A6DD0
Primary-500:  #2875E8  (Hover states)
Primary-400:  #4A8FFF
Primary-300:  #7CB3FF
Primary-200:  #B8D8FF
Primary-100:  #E6F0FF
Primary-50:   #F5F9FF
```

**Kullanım:**
- Primary-700: Brand rengi, main CTA buttons, links
- Primary-600: Hover states, secondary actions
- Primary-100/50: Light backgrounds, alerts
- Primary-900: Dark text, headers

### 1.2 İkincil Renkler (Secondary - Accent)

**Yeşil** - Başarı, Onay, Pozitif İşlemler
```
Success-700:  #059669
Success-600:  #10B981
Success-500:  #34D399
Success-100:  #D1FAE5
```

**Turuncu** - Uyarı, Dikkat Çekmek, İşlemler
```
Warning-700:  #D97706
Warning-600:  #F59E0B
Warning-500:  #FBBF24
Warning-100:  #FEF3C7
```

**Kırmızı** - Hata, Silme, Tehlike
```
Error-700:   #DC2626
Error-600:   #EF4444
Error-500:   #F87171
Error-100:   #FEE2E2
```

**Mor** - Bilgi, Özel İşlemler
```
Info-700:    #7C3AED
Info-600:    #A855F7
Info-500:    #D8B4FE
Info-100:    #F3E8FF
```

### 1.3 Nötr Renkler (Neutrals)

```
Gray-900:    #111827  (Metni, headlines)
Gray-800:    #1F2937  (Secondary text)
Gray-700:    #374151  (Labels, captions)
Gray-600:    #4B5563  (Placeholder text)
Gray-500:    #6B7280  (Disabled text)
Gray-400:    #9CA3AF  (Borders, dividers)
Gray-300:    #D1D5DB  (Light borders)
Gray-200:    #E5E7EB  (Background subtle)
Gray-100:    #F3F4F6  (Background light)
Gray-50:     #F9FAFB  (Background lightest)
White:       #FFFFFF (Pure white)
Black:       #000000 (Pure black - use Gray-900 instead)
```

### 1.4 Sosyal & Kategori Renkler

```
Bağış (Donations):     #EC4899  (Pink)
Yardım (Aid):          #8B5CF6  (Purple)
Bursa (Scholarship):   #06B6D4  (Cyan)
Toplantı (Meeting):    #F59E0B  (Amber)
Görev (Task):          #10B981  (Green)
Mesaj (Message):       #6366F1  (Indigo)
```

### 1.5 Darktab (Opsiyonel)

```
Dark-bg:     #0F172A
Dark-card:   #1E293B
Dark-text:   #F1F5F9
Dark-border: #334155
```

### 1.6 Renk Kullanım Kuralları

✅ **Yapılacak:**
- Primary renk %70 oranında kullan
- Accent renkler dikkat çekmek için %20
- Neutral renkler temel layout için %10
- Text contrast ratio ≥ 4.5:1 (WCAG AA)

❌ **Yapılmayacak:**
- Ardarda 3'ten fazla renkli element
- Sadece renk farkı ile enformasyon iletme
- Çok açık/koyu kombinasyonlar
- Brand rengi overuse (> %20)

---

## 2. Tipografi

### 2.1 Font Seçimi

**Başlıklar (Headings) - Poppins**
- Modern, okunaklı, profesyonel
- Font weights: 600, 700, 800
- Kurumsal görünüm sağlar

**Gövde (Body) - Inter**
- Ekran okumaya optimize
- Excellent legibility
- Font weights: 400, 500, 600

**Monospace (Kod, Numaralar) - Fira Code**
- Teknik görünüm
- Numbers alignment

### 2.2 Font Kurulumu

```tsx
// next.config.ts
import { Inter, Poppins, Fira_Code } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fira-code',
  display: 'swap',
});
```

### 2.3 Tipografi Ölçeği (Type Scale)

**Desktop:**
```
H1: 48px / 56px line-height / 700 weight   (Poppins)
H2: 36px / 44px line-height / 700 weight   (Poppins)
H3: 28px / 36px line-height / 600 weight   (Poppins)
H4: 24px / 32px line-height / 600 weight   (Poppins)
H5: 20px / 28px line-height / 600 weight   (Poppins)
H6: 16px / 24px line-height / 600 weight   (Poppins)

Body-Large:    16px / 24px / 400 weight    (Inter)
Body:          14px / 21px / 400 weight    (Inter)
Body-Small:    12px / 18px / 400 weight    (Inter)

Label-Large:   14px / 20px / 600 weight    (Inter)
Label:         12px / 16px / 600 weight    (Inter)
Label-Small:   11px / 16px / 600 weight    (Inter)

Caption:       12px / 18px / 500 weight    (Inter)
Helper:        11px / 16px / 400 weight    (Inter)
```

**Tablet:**
```
H1: 40px
H2: 32px
H3: 24px
H4: 20px
Body: 15px
```

**Mobile:**
```
H1: 32px
H2: 24px
H3: 20px
H4: 18px
Body: 14px
```

### 2.4 Satır Yüksekliği (Line Height)

```
1.25x  (28.8) - Headings (compact)
1.5x   (36)   - Body large (readable)
1.6x   (38.4) - Body (optimal readability)
1.75x (42)   - Lists (comfortable)
```

### 2.5 Letter Spacing

```
Headings:  -0.02em  (tight)
Body:       0       (normal)
Labels:    +0.01em  (loose)
All-Caps:  +0.05em  (spacing)
```

### 2.6 Tailwind CSS Konfigürasyonu

```js
// tailwind.config.ts
export default {
  theme: {
    fontFamily: {
      'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      'heading': ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      'mono': ['var(--font-fira-code)', 'monospace'],
    },
    fontSize: {
      'xs': ['11px', { lineHeight: '16px' }],
      'sm': ['12px', { lineHeight: '18px' }],
      'base': ['14px', { lineHeight: '21px' }],
      'lg': ['16px', { lineHeight: '24px' }],
      'xl': ['20px', { lineHeight: '28px' }],
      '2xl': ['24px', { lineHeight: '32px' }],
      '3xl': ['28px', { lineHeight: '36px' }],
      '4xl': ['36px', { lineHeight: '44px' }],
      '5xl': ['48px', { lineHeight: '56px' }],
    },
  },
};
```

---

## 3. Bileşen Kütüphanesi

### 3.1 Buton Varyasyonları

**Primary Button**
```
Background: Primary-700
Text: White
Hover: Primary-600
Active: Primary-800
Disabled: Gray-300 bg, Gray-500 text
Border-radius: 8px
Padding: 12px 24px (md size)
Font: Inter 14px 600
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Transition: 150ms ease-in-out
```

**Secondary Button**
```
Background: Gray-100
Text: Primary-700
Hover: Gray-200
Active: Gray-300
Border: 1px Gray-300
```

**Outline Button**
```
Background: Transparent
Text: Primary-700
Border: 2px Primary-700
Hover: Primary-50 bg
```

**Ghost Button**
```
Background: Transparent
Text: Primary-700
Hover: Primary-50 bg
No border
```

**Button Sizes**
- LG: 16px font, 16px 32px padding
- MD: 14px font, 12px 24px padding (default)
- SM: 12px font, 8px 16px padding

### 3.2 Form Elements

**Input Field**
```
Height: 40px (md)
Padding: 0 12px
Border: 1px Gray-300
Border-radius: 8px
Font: Inter 14px 400
Placeholder: Gray-400
Focus: Border Primary-500, Shadow 0 0 0 3px rgba(24,119,232,0.1)
Disabled: Gray-100 bg, Gray-400 text
Error: Border Error-600
```

**Select Dropdown**
```
Same as input
Icon: Chevron-Down (Gray-600)
```

**Checkbox/Radio**
```
Size: 20x20px
Border-radius: 4px (checkbox) / 50% (radio)
Checked: Primary-700 bg
Focus: Primary-300 ring
```

**Textarea**
```
Min-height: 120px
Resize: vertical only
Other properties: Same as input
```

### 3.3 Card Component

```
Background: White / Gray-50
Border: 1px Gray-200
Border-radius: 12px
Padding: 24px (lg), 16px (md), 12px (sm)
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Hover: Shadow 0 4px 12px rgba(0,0,0,0.08)
Transition: 200ms
```

### 3.4 Alert/Toast Components

**Success Alert**
```
Background: Success-50
Border-left: 4px Success-600
Icon: CheckCircle (Success-600)
Text: Gray-900
Close: Success-700 text
```

**Error Alert**
```
Background: Error-50
Border-left: 4px Error-600
Icon: XCircle (Error-600)
Text: Gray-900
```

**Warning Alert**
```
Background: Warning-50
Border-left: 4px Warning-600
Icon: AlertTriangle (Warning-600)
Text: Gray-900
```

**Info Alert**
```
Background: Info-50
Border-left: 4px Info-600
Icon: Info (Info-600)
Text: Gray-900
```

### 3.5 Modal/Dialog

```
Backdrop: rgba(0,0,0,0.5)
Content: White, border-radius 16px
Padding: 32px
Shadow: 0 20px 25px rgba(0,0,0,0.15)
Max-width: 500px (sm), 700px (md), 1000px (lg)
Animation: Scale + fade-in (200ms)
Close button: Top-right corner
```

### 3.6 Table Styling

```
Header: Primary-50 bg, Primary-700 text
Rows: Alternate White/Gray-50
Borders: Gray-200 (1px)
Padding: 16px
Hover: Gray-100 bg
Striped: Yes
```

### 3.7 Badge/Tag

```
Background: Primary-100
Text: Primary-700
Padding: 6px 12px
Border-radius: 20px
Font: 12px 600
Sizes: sm (4px 8px), md (6px 12px), lg (8px 16px)
```

---

## 4. Layout & Spacing

### 4.1 Spacing Scale (8px Grid System)

```
0:   0px
1:   4px   (Small)
2:   8px   (Base unit)
3:   12px
4:   16px  (Most common)
5:   20px
6:   24px
7:   28px
8:   32px  (Large spacing)
9:   36px
10:  40px
12:  48px  (XL spacing)
14:  56px
16:  64px  (2XL spacing)
20:  80px
24:  96px
```

### 4.2 Layout Patterns

**Container**
```
Max-width: 1280px (lg)
Padding: 16px (mobile), 24px (tablet), 32px (desktop)
Horizontal margins: auto (centered)
```

**Sidebar Layout**
```
Sidebar width: 280px (desktop), 240px (tablet), 0 (mobile - drawer)
Main content: flex-1
Gap: 24px (desktop), 16px (tablet)
```

**Grid System**
```
Desktop:  12 columns, 24px gap
Tablet:   8 columns, 16px gap
Mobile:   4 columns, 12px gap
```

### 4.3 Whitespace Guidelines

- Between sections: 48-64px (desktop), 32-40px (tablet), 24-32px (mobile)
- Within section: 24-32px
- Between components: 16-24px
- Between inline elements: 8-12px

---

## 5. İkonografi

### 5.1 İkon Seçimi

**Provider:** Lucide React (çok geniş, kurumsal, tutarlı)

**İkon Boyutları:**
```
sm:  16px
md:  20px (default)
lg:  24px
xl:  32px
2xl: 48px
```

### 5.2 İkon Kullanım

**Yaygın İkonlar:**
- Settings: Settings, Sliders
- Kullanıcı: User, Users, UserPlus
- Dosya: FileText, Download, Upload
- Sil: Trash2, X
- Düzenle: Edit, Pencil
- Ekle: Plus, PlusCircle
- Ara: Search, Filter
- Menü: Menu, ChevronDown
- Uyarı: AlertTriangle, AlertCircle
- Başarı: CheckCircle, Check
- Hata: XCircle, X
- Bilgi: Info, HelpCircle
- Yöket: Home, BarChart, TrendingUp
- Bağış: Heart, Gift
- Yardım: HandHelping, Users

### 5.3 İkon Renklendirmesi

```
Primary actions:     Primary-700
Secondary:          Gray-600
Success:            Success-600
Error:              Error-600
Warning:            Warning-600
Info:               Info-600
Disabled:           Gray-400
Hover:              Darker shade
```

---

## 6. Erişilebilirlik

### 6.1 Kontrast Oranları

✅ **WCAG AA (Minimum)**
- Normal text: 4.5:1
- Large text (18px+): 3:1

✅ **WCAG AAA (Enhanced)**
- Normal text: 7:1
- Large text: 4.5:1

### 6.2 Focus States

```
All interactive elements:
- Outline: 2px Primary-600 (or focus ring)
- Offset: 2px
- Visible for keyboard navigation
```

### 6.3 Semantic HTML

```tsx
// ✅ Good
<button type="button">Tıkla</button>
<label htmlFor="input">Etiketi</label>
<input id="input" aria-label="Açıklama" />

// ❌ Bad
<div onClick={...}>Tıkla</div>
<div>Etiketi</div>
<div>Açıklama</div>
```

### 6.4 Renk Kütüphanesi

```css
/* CSS Variables for accessibility */
:root {
  --color-primary-dark: #0B3D7D;
  --color-primary: #1358B8;
  --color-primary-light: #4A8FFF;
  
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;
  
  --color-text: #111827;
  --color-text-secondary: #4B5563;
  --color-text-disabled: #6B7280;
  
  --color-bg: #F9FAFB;
  --color-bg-white: #FFFFFF;
  --color-border: #E5E7EB;
}
```

---

## 7. Implementasyon Sırası

### Faz 1: Foundation (Hafta 1)
- [ ] Tailwind config güncellemesi (renkler, typography, spacing)
- [ ] CSS variables oluşturma
- [ ] Global styles (globals.css)
- [ ] Brand colors file

**Yapılacak:**
```
src/
├── styles/
│   ├── variables.css
│   └── colors.css
├── config/
│   └── design-tokens.ts
└── tailwind.config.ts
```

### Faz 2: Base Components (Hafta 2)
- [ ] Button variants
- [ ] Form elements (Input, Select, Checkbox, Radio)
- [ ] Card component
- [ ] Badge/Tag
- [ ] Alert/Toast

### Faz 3: Layout Components (Hafta 3)
- [ ] Sidebar
- [ ] Navigation
- [ ] Header
- [ ] Footer
- [ ] Container/Grid

### Faz 4: Complex Components (Hafta 4)
- [ ] Modal/Dialog
- [ ] Table (styled)
- [ ] Pagination
- [ ] Dropdown menu
- [ ] Breadcrumb

### Faz 5: Page Templates (Hafta 5)
- [ ] Dashboard layout
- [ ] List page template
- [ ] Detail page template
- [ ] Form page template

### Faz 6: Polish & Testing (Hafta 6)
- [ ] Dark mode support (optional)
- [ ] Animation/Transitions
- [ ] Accessibility testing
- [ ] Cross-browser testing
- [ ] Mobile testing

---

## 8. CSS Variables Implementation

### 8.1 Tailwind Config Update

```js
// tailwind.config.ts
export default {
  theme: {
    colors: {
      // Primary
      primary: {
        50: '#F5F9FF',
        100: '#E6F0FF',
        200: '#B8D8FF',
        300: '#7CB3FF',
        400: '#4A8FFF',
        500: '#2875E8',
        600: '#1A6DD0',
        700: '#1358B8', // Brand color
        800: '#0F4A9A',
        900: '#0B3D7D',
      },
      
      // Success
      success: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        600: '#10B981',
        700: '#059669',
      },
      
      // Warning
      warning: {
        50: '#FEF3C7',
        100: '#FEF3C7',
        600: '#F59E0B',
        700: '#D97706',
      },
      
      // Error
      error: {
        50: '#FEE2E2',
        100: '#FEE2E2',
        600: '#EF4444',
        700: '#DC2626',
      },
      
      // Gray
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
  },
};
```

### 8.2 Global Styles

```css
/* src/app/globals.css */

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

:root {
  /* Colors */
  --primary: #1358B8;
  --primary-dark: #0B3D7D;
  --primary-light: #4A8FFF;
  
  --success: #059669;
  --warning: #D97706;
  --error: #DC2626;
  
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-tertiary: #9CA3AF;
  
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  
  --border: #E5E7EB;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Poppins', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Spacing */
  --space-unit: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
  
  /* Z-index */
  --z-dropdown: 1000;
  --z-modal: 1050;
  --z-popover: 1100;
}

/* Base elements */
* {
  @apply transition-colors var(--transition-fast);
}

body {
  @apply font-sans text-gray-900 bg-white;
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  @apply font-heading font-bold tracking-tight;
}

h1 { @apply text-5xl; }
h2 { @apply text-4xl; }
h3 { @apply text-3xl; }
h4 { @apply text-2xl; }
h5 { @apply text-xl; }
h6 { @apply text-lg; }

/* Links */
a {
  @apply text-primary hover:text-primary-dark underline underline-offset-2;
}

/* Focus visible */
*:focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}
```

---

## 9. Kurumsal Bileşen Örnekleri

### 9.1 Hero Section

```tsx
<section className="bg-gradient-to-r from-primary to-primary-dark py-16 lg:py-24">
  <div className="container max-w-6xl">
    <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold mb-6">
      Dernek Yönetim Sistemi
    </h1>
    <p className="text-primary-100 text-lg mb-8 max-w-2xl">
      Dernekleriniz için modern, güvenilir ve kapsamlı yönetim çözümü
    </p>
    <button className="bg-white text-primary px-8 py-3 rounded-lg font-600 hover:bg-primary-50">
      Başla
    </button>
  </div>
</section>
```

### 9.2 Stats Section

```tsx
<section className="py-16 bg-gray-50">
  <div className="container grid md:grid-cols-4 gap-8">
    {[
      { label: 'Kullanıcı', value: '1,234' },
      { label: 'Bağış', value: '₺500K' },
      { label: 'İhtiyaç Sahibi', value: '456' },
      { label: 'Görev', value: '89' },
    ].map((stat) => (
      <div key={stat.label} className="text-center">
        <p className="text-primary-700 text-3xl font-bold">{stat.value}</p>
        <p className="text-gray-600 mt-2">{stat.label}</p>
      </div>
    ))}
  </div>
</section>
```

### 9.3 Call-to-Action

```tsx
<section className="py-16 bg-primary text-white">
  <div className="container text-center">
    <h2 className="text-3xl font-bold mb-4">Yardım Etmek İçin Hazır mısınız?</h2>
    <p className="text-primary-100 mb-8">
      Sistemi hemen başlatın ve dernekçinizi dijitalleştirin
    </p>
    <div className="flex gap-4 justify-center">
      <button className="bg-white text-primary px-8 py-3 rounded-lg font-600">
        Başla
      </button>
      <button className="border-2 border-white text-white px-8 py-3 rounded-lg">
        Daha Fazla Bilgi
      </button>
    </div>
  </div>
</section>
```

---

## 10. Kurumsal Kimlik Rehberi

### 10.1 Logo & Branding

- Primary color: #1358B8 (Kurumsal Mavi)
- Secondary color: #10B981 (Yeşil - Uyum, büyüme)
- Typography: Poppins (Bold headings), Inter (Regular text)
- Tone: Professional, trustworthy, accessible

### 10.2 Resimler & Fotoğraflar

- Photography style: Modern, people-focused, diverse
- Colors: Complement primary brand color
- Aspect ratios: 16:9 (wide), 4:3 (medium), 1:1 (square)

### 10.3 Tonality (İçerik Tonu)

- Formal ama erişilebilir
- Empathetic (duyarlı)
- Action-oriented (harekete geçirici)
- Transparent (açık, net)

---

## 11. Takvim & Milestones

```
📅 Hafta 1  → Foundation setup
📅 Hafta 2  → Base components
📅 Hafta 3  → Layout components
📅 Hafta 4  → Complex components
📅 Hafta 5  → Page templates
📅 Hafta 6  → Polish & testing

Total: 6 hafta → Production ready design system
```

---

## Sonraki Adımlar

1. **Design Tokens File** oluştur (`src/config/design-tokens.ts`)
2. **Tailwind config** güncelle
3. **Global styles** yazıyı
4. **Component library** başla
5. **Storybook** setup (optional - component showcase için)

---

*Son güncelleme: 27 Ekim 2025*
*Versiyon: 1.0*
