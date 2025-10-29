# Kurumsal Tasarım Standardları

## Renk Paleti

### Ana Renkler
- **Background**: `bg-slate-50` (light) / `bg-slate-900` (dark)
- **Card Background**: `bg-white` / `bg-slate-900`
- **Text Primary**: `text-slate-900` / `text-slate-100`
- **Text Secondary**: `text-slate-600` / `text-slate-400`
- **Text Muted**: `text-slate-500` / `text-slate-500`

### Accent Renkler
- **Primary**: `bg-slate-700` / `hover:bg-slate-600`
- **Secondary**: `bg-slate-500` / `hover:bg-slate-400`
- **Border**: `border-slate-200` / `border-slate-700`
- **Hover**: `hover:border-slate-400` / `hover:border-slate-600`

### Status Renkleri (Minimal Kullanım)
- **Success**: `text-green-600` (accent only)
- **Warning**: `text-amber-600` (accent only) 
- **Error**: `text-red-600` (accent only)

## Typography

### Font Sizes
- **Page Title**: `text-3xl font-bold`
- **Section Title**: `text-xl font-semibold`
- **Card Title**: `text-lg font-medium`
- **Body**: `text-sm`
- **Caption**: `text-xs`

### Spacing
- **Container**: `max-w-[1600px] mx-auto w-full`
- **Section**: `gap-6`
- **Cards**: `gap-4`
- **Elements**: `gap-4`

## Component Standards

### Cards
```tsx
<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Buttons
```tsx
<Button className="bg-slate-700 hover:bg-slate-600">
  Button Text
</Button>
```

### Inputs
```tsx
<Input className="border-slate-200 focus:border-slate-400" />
```

### Tables
- Clean, minimal design
- Alternating row colors: `hover:bg-slate-50`
- Proper padding and spacing

## Layout Principles

### Page Structure
1. **PageLayout** wrapper ile tutarlı başlık yapısı
2. **StatCard** grid: 4 kolon desktop, 2 tablet, 1 mobile
3. **Card-based** content organization
4. **Proper spacing**: `gap-6` section'lar arası

### Navigation
- Sidebar: `bg-slate-900` dark theme
- Clean icons ve text hierarchy
- Active state: `bg-slate-800`

### Responsive Design
- Mobile-first approach
- Breakpoint system: `md:`, `lg:`, `xl:`
- Flexible grid systems

## Do's and Don'ts

### Do's ✅
- Slade/gray color palette use
- Consistent Card layouts
- Proper Typography hierarchy
- Clean spacing ve alignment
- Dark mode compatibility

### Don'ts ❌
- Colorful gradients (except minimal accents)
- Mixed typography styles
- Inconsistent spacing
- Flashy animations
- Mixed design systems

## Implementation Order

1. ✅ Login Page - Done
2. ✅ Dashboard - Done  
3. ✅ İhtiyaç Sahipleri - Done
4. ✅ Bağış Modülü - Done
5. ✅ Kullanıcı Yönetimi - Done
6. ✅ Ayarlar - Done
7. ✅ Navigation/Sidebar - Done
8. ✅ Forms - Done (UI Components ile otomatik)
9. ✅ Project Complete - All pages modernized
