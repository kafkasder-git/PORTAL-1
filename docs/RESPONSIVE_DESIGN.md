# Responsive Design Guidelines

Bu belge, uygulamadaki responsive design standartlarını belirtir.

## Tailwind Breakpoints

Kullanılan breakpoint'ler (Next.js 16 / Tailwind CSS v4):

| Breakpoint | Ekran Genişliği | Kullanım |
|-----------|-----------------|---------|
| **sm** | 640px | Küçük telefonlar |
| **md** | 768px | Tabletler |
| **lg** | 1024px | Büyük ekranlar |
| **xl** | 1280px | Masaüstü |
| **2xl** | 1536px | Geniş masaüstü |

## Layout Patterns

### 1. Mobile First Approach

Tüm bileşenler mobile-first ile geliştirilmelidir:

```tsx
// ❌ Bad
<div className="sm:grid sm:grid-cols-2">...</div>

// ✅ Good
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">...</div>
```

### 2. Spacing Yönetimi

```tsx
// Padding/Margin scales
const spacing = {
  mobile: 'p-2 md:p-4 lg:p-6',    // Küçük ekranlarda kompakt
  medium: 'p-4 md:p-6 lg:p-8',    // Orta alan
  large: 'p-6 md:p-8 lg:p-12',    // Geniş alan
};
```

### 3. Typography Ölçeği

```tsx
// Font sizes responsive
const typography = {
  heading1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  heading2: 'text-xl md:text-2xl lg:text-3xl font-bold',
  body: 'text-sm md:text-base lg:text-lg',
  caption: 'text-xs md:text-sm',
};
```

## Component Breakdowns

### Desktop (lg+)
- Sidebar navigation
- Multi-column layouts
- Hover states active
- Full table views

**Example:**
```tsx
<div className="hidden lg:flex lg:gap-6">
  <aside className="w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

### Tablet (md to lg)
- Single column + sidebar (collapsible)
- 2-column grids
- Card-based layouts
- Touch-friendly buttons (min 44px)

**Example:**
```tsx
<div className="md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

### Mobile (< md)
- Full-width single column
- Bottom navigation
- Hamburger menus
- Larger touch targets (min 48px)
- Simplified tables → Cards

**Example:**
```tsx
<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id} className="p-4">
      {item}
    </Card>
  ))}
</div>
```

## Responsive Components Reference

### Pagination Component
```tsx
import { Pagination } from '@/components/ui/pagination';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  total={total}
  limit={20}
  onPageChange={setPage}
/>
```

**Behavior:**
- Desktop: Full pagination controls
- Mobile: Simplified pagination (← / →)

### Filter Panel
```tsx
import { FilterPanel } from '@/components/ui/filter-panel';

<FilterPanel
  fields={filterFields}
  onFiltersChange={handleFilters}
  onReset={handleReset}
/>
```

**Behavior:**
- Desktop: Always visible sidebar
- Tablet/Mobile: Collapsible panel (drawer)

### Responsive Table
```tsx
import { ResponsiveTable } from '@/components/ui/responsive-table';

<ResponsiveTable
  columns={columns}
  data={data}
  rowKey="$id"
  onRowClick={handleSelect}
  actions={renderActions}
/>
```

**Behavior:**
- Desktop (lg+): Traditional table
- Tablet (md-lg): Card-based with key columns
- Mobile: Stacked card layout

### Export Buttons
```tsx
import { ExportButtons } from '@/components/ui/export-buttons';

<ExportButtons
  data={beneficiaries}
  filename="ihtiyac-sahipleri"
  columns={EXPORT_COLUMNS.BENEFICIARIES}
  compact={true}  // Mobile: dropdown menu
/>
```

**Behavior:**
- Desktop: Multiple buttons
- Mobile: Dropdown menu (compact)

## Common Patterns

### Navigation Menu

```tsx
// Desktop: Horizontal
<nav className="hidden md:flex gap-4">
  {navItems.map(item => <Link key={item.id}>{item.label}</Link>)}
</nav>

// Mobile: Hamburger (collapsible)
<div className="md:hidden">
  <MobileMenu items={navItems} />
</div>
```

### Search Bar

```tsx
// Desktop: Full width input
<Input className="hidden md:block w-full" />

// Mobile: Icon button + modal
<Button className="md:hidden" onClick={openSearch}>
  <Search />
</Button>
```

### Action Buttons

```tsx
<div className="flex gap-2 flex-col md:flex-row">
  <Button className="w-full md:w-auto">Birincil</Button>
  <Button className="w-full md:w-auto">İkincil</Button>
</div>
```

## Image Optimization

```tsx
import Image from 'next/image';

<Image
  src={src}
  alt={alt}
  width={400}
  height={300}
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  className="w-full h-auto"
/>
```

## Testing Responsive Design

### Breakpoint Testing Checklist

**Mobile (320px - 640px)**
- [ ] All content readable without horizontal scroll
- [ ] Touch targets ≥ 48px minimum
- [ ] Images scale properly
- [ ] Forms are accessible
- [ ] Navigation is usable

**Tablet (641px - 1024px)**
- [ ] Two-column layouts work
- [ ] Sidebar collapsible
- [ ] Tables convert to cards
- [ ] Spacing is balanced

**Desktop (1025px+)**
- [ ] Multi-column layouts display
- [ ] Sidebar always visible
- [ ] Hover effects work
- [ ] Full table views display

### Browser DevTools

Use Chrome DevTools responsive mode:
- `F12` → Toggle device toolbar
- Test all major breakpoints
- Test rotation changes
- Test touch interactions

### Testing Devices

Recommended devices for testing:
- **Mobile**: iPhone 12/13 (390px), Pixel 5 (393px)
- **Tablet**: iPad (768px), iPad Pro (1024px)
- **Desktop**: 1366px, 1920px

## Best Practices

1. **Mobile First**: Always start with mobile layout
2. **Touch Targets**: Minimum 44px (mobile) / 48px (tablet)
3. **Typography**: Readable at all sizes (min 16px body)
4. **Spacing**: Use proportional spacing scales
5. **Images**: Use responsive sizes & formats
6. **Performance**: Lazy load images, optimize bundle
7. **Accessibility**: WCAG 2.1 AA compliant
8. **Testing**: Test on real devices, not just DevTools

## Debugging Tips

```tsx
// Show breakpoint name for debugging
<div className="fixed bottom-4 right-4 text-sm font-mono p-2 bg-black text-white rounded">
  <span className="sm:hidden">Mobile</span>
  <span className="hidden sm:inline md:hidden">Tablet</span>
  <span className="hidden md:inline lg:hidden">Laptop</span>
  <span className="hidden lg:inline">Desktop</span>
</div>
```

## References

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev - Mobile Viewport](https://web.dev/viewport/)
