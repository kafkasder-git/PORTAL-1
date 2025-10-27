# 🎨 Design System - Hızlı Referans

Dernek Yönetim Sistemi için kurumsal tasarım sisteminin özeti.

---

## 📊 Renk Paleti Hızlı Referans

### Brand Color: Kurumsal Mavi #1358B8

```
PRIMARY:
├── 50:   #F5F9FF   (lightest backgrounds)
├── 100:  #E6F0FF   (light backgrounds)
├── 200:  #B8D8FF   (medium light)
├── 300:  #7CB3FF   
├── 400:  #4A8FFF   
├── 500:  #2875E8   
├── 600:  #1A6DD0   (hover state)
├── 700:  #1358B8   ⭐ PRIMARY BRAND COLOR
├── 800:  #0F4A9A   (active state)
└── 900:  #0B3D7D   (darkest, headers)
```

### Status Colors

| Renk | Hex | Kullanım |
|------|-----|----------|
| 🟢 Success | #10B981 | Başarılı işlemler, onay |
| 🟠 Warning | #F59E0B | Uyarılar, dikkat |
| 🔴 Error | #DC2626 | Hatalar, silme |
| 🟣 Info | #A855F7 | Bilgi, özel |

---

## ✍️ Typography

### Font Stack

```
Headings:  Poppins (Modern, Professional)
Body:      Inter   (Readable, Clean)
Monospace: Fira Code (Technical)
```

### Size Scale (Desktop)

```
H1: 48px  → H2: 36px  → H3: 28px  → H4: 24px
Body: 14px → Small: 12px → Caption: 12px
```

### Weights

- **Headings:** Bold (700), Extra Bold (800)
- **Body:** Normal (400), Medium (500), Semi-bold (600)

---

## 📐 Spacing (8px Grid)

```
0   → 1   → 2   → 3   → 4   → 6   → 8   → 12  → 16  → 24
0px   4px   8px  12px  16px  24px  32px  48px  64px  96px
```

**Common Usage:**
- Component padding: 16px (4)
- Section margin: 48px (12)
- Element gap: 8px (2) or 16px (4)

---

## 🎯 Component Sizes

### Buttons

| Size | Padding | Font |
|------|---------|------|
| SM   | 8-16px  | 12px |
| MD   | 12-24px | 14px ⭐ default |
| LG   | 16-32px | 16px |

### Input Height

| Size | Height |
|------|--------|
| SM   | 32px   |
| MD   | 40px   ⭐ default |
| LG   | 48px   |

### Card Padding

| Size | Padding |
|------|---------|
| SM   | 12px    |
| MD   | 16px    |
| LG   | 24px    ⭐ default |

---

## 🎨 Component Colors

### Button Varyasyonları

```
Primary   → BG: Primary-700    Text: White
Secondary → BG: Gray-100       Text: Primary-700
Outline   → BG: Transparent    Border: Primary-700
Ghost     → BG: Transparent    Text: Primary-700
Danger    → BG: Error-700      Text: White
Success   → BG: Success-700    Text: White
```

### Form States

```
Default  → Border: Gray-300
Focus    → Ring: Primary-500 (3px)
Error    → Border: Error-600
Disabled → BG: Gray-100, Text: Gray-400
```

---

## 🎬 Animations

```
Fast:  150ms ease-in-out  (button hover)
Base:  200ms ease-in-out  (modal, card)
Slow:  300ms ease-in-out  (page transitions)
```

---

## 📱 Breakpoints

| Device | Width | Usage |
|--------|-------|-------|
| Mobile | <640px | `block` or `md:hidden` |
| Tablet | 640-1024px | `md:` prefix |
| Desktop | >1024px | `lg:` prefix |

---

## 🔍 Shadows

```
none  → No shadow
sm    → 0 1px 2px rgba(0,0,0,0.05)    (subtle)
md    → 0 4px 6px rgba(0,0,0,0.1)     (default)
lg    → 0 10px 15px rgba(0,0,0,0.1)   (prominent)
xl    → 0 20px 25px rgba(0,0,0,0.1)   (modal)
```

---

## 📏 Border Radius

```
none → 0px
sm   → 4px    (subtle)
base → 8px    ⭐ default (buttons, inputs)
md   → 12px   (cards)
lg   → 16px   (modals)
full → 9999px (pills, badges)
```

---

## ♿ Accessibility (A11y)

### Contrast Requirements

- **Normal text:** 4.5:1 (WCAG AA minimum)
- **Large text (18px+):** 3:1

### Focus States

- **Color:** Primary-600 ring
- **Visible:** Yes, always
- **Offset:** 2px

### Keyboard Navigation

- Tab key: Move forward
- Shift+Tab: Move backward
- Enter: Activate
- Space: Activate
- Arrow keys: Navigate lists/menus

---

## 📂 File Locations

| Resource | Path |
|----------|------|
| Design Tokens | `src/config/design-tokens.ts` |
| Global Styles | `src/app/globals.css` |
| Components | `src/components/ui/` |
| Design System Docs | `docs/DESIGN_SYSTEM.md` |
| Implementation Guide | `docs/DESIGN_IMPLEMENTATION_ROADMAP.md` |

---

## 🚀 Quick Start

### 1. Import Design Tokens

```typescript
import designTokens from '@/config/design-tokens';

// Use colors
const bgColor = designTokens.colors.primary[700];
const padding = designTokens.spacing[4]; // 16px
```

### 2. Use Tailwind Classes

```jsx
// Colors
<button className="bg-primary-700 text-white hover:bg-primary-600">
  Action
</button>

// Spacing
<div className="p-4 mb-8">Content</div>

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
```

### 3. CSS Variables (Runtime)

```css
/* In globals.css */
:root {
  --primary: #1358B8;
}

/* Use in components */
.button {
  background-color: var(--primary);
}
```

---

## ✅ Implementation Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation (Config, CSS, Tokens) | ✅ Done |
| 2 | Base Components (Button, Form) | 🔄 Current |
| 3 | Layout (Sidebar, Nav, Header) | ⏳ Next |
| 4 | Complex (Modal, Table, Tabs) | ⏳ Later |
| 5 | Pages (Dashboards, Templates) | ⏳ Later |
| 6 | Polish (A11y, Animations, Tests) | ⏳ Final |

---

## 🔗 Important Links

- **Design System:** `docs/DESIGN_SYSTEM.md`
- **Implementation:** `docs/DESIGN_IMPLEMENTATION_ROADMAP.md`
- **Responsive Guide:** `docs/RESPONSIVE_DESIGN.md`
- **Design Tokens:** `src/config/design-tokens.ts`

---

## 💡 Tips

1. **Always use design-tokens.ts** for consistency
2. **Test on real devices**, not just DevTools
3. **Check contrast** with accessibility tools
4. **Use focus-visible** for keyboard navigation
5. **Responsive first** - build mobile first, enhance desktop

---

*Last updated: 27 October 2025*
*Version: 1.0 - Foundation Phase Complete*
