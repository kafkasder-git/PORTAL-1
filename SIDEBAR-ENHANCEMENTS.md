# Modern Collapsible Sidebar Implementation

This document details the implementation of an enhanced, modern collapsible sidebar with user profile, quick actions, and smooth animations.

## Overview

The sidebar has been completely redesigned to provide a modern, feature-rich navigation experience with three width states:
- **Expanded**: 256px (w-64) - Full sidebar with text and icons
- **Collapsed**: 80px (w-20) - Icon-only sidebar with tooltips
- **Mobile**: Full-screen overlay that always shows expanded view

## New UI Components

### 1. Avatar Component (`src/components/ui/avatar.tsx`)

A fully-featured avatar component using Radix UI primitives.

**Exported Components:**
- `Avatar` - Root container with size variants
- `AvatarImage` - Image display with proper aspect ratio
- `AvatarFallback` - Fallback display with centered text

**Size Variants:**
- `sm` - 32px (h-8 w-8)
- `md` - 40px (h-10 w-10) - default
- `lg` - 48px (h-12 w-12)
- `xl` - 64px (h-16 w-16)

**Usage:**
```tsx
<Avatar size="lg">
  <AvatarImage src={user?.avatar} alt={user?.name} />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

**Features:**
- Rounded-full styling
- Object-cover for proper image scaling
- Muted background for fallback
- TypeScript types with CVA variants
- Follows shadcn/ui patterns

### 2. Tooltip Component (`src/components/ui/tooltip.tsx`)

Rich tooltip component with smooth animations using Radix UI.

**Exported Components:**
- `TooltipProvider` - Context provider (wrap application or section)
- `Tooltip` - Root component
- `TooltipTrigger` - Trigger element
- `TooltipContent` - Tooltip content with animations

**Features:**
- Fade and zoom animations on open/close
- Slide animations based on side (top/bottom/left/right)
- Default sideOffset of 4px
- Popover styling (border, shadow, rounded)
- High z-index (z-50) for proper layering

**Usage:**
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent side="right">
      Tooltip content
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Sidebar Features

### 1. Collapsible Sidebar with State Persistence

**Implementation:**
- State managed with `useState` and persisted to localStorage
- Key: `sidebar-collapsed` (boolean as string)
- Cross-tab synchronization via storage events
- Toggle button at bottom of sidebar

**Collapsed State Behavior:**
- Icons only, no text
- All items wrapped in tooltips
- Scale and hover effects on icons
- User profile shows avatar only
- Quick actions stacked vertically

**Expanded State Behavior:**
- Full text and icons
- Expandable module navigation
- User profile with name and role badge
- Quick actions side-by-side
- Collapse toggle button with text

### 2. User Profile Section

Located at the top of sidebar with border-bottom separator.

**Expanded View:**
- Large avatar (size="lg") on left
- User name with font-heading, font-semibold, text-sm
- Role badge below name using Badge component
- Hover effect (hover:bg-accent)

**Collapsed View:**
- Medium avatar (size="md") centered
- Tooltip on hover showing name and role
- Maintains hover effect

**Role Badge Variants:**
- SUPER_ADMIN/ADMIN: `destructive` (red)
- MANAGER: `default` (primary blue)
- MEMBER/VOLUNTEER: `secondary` (gray)
- VIEWER: `outline` (bordered)

**Avatar Fallback:**
- Generates initials from user name
- First letter of first name + first letter of last name
- Uppercase
- Falls back to "U" if no name

### 3. Quick Actions Bar

Located below user profile, above navigation modules.

**Actions:**
1. **Search** - Search icon with "Ara" text
2. **Notifications** - Bell icon with badge count (hardcoded "3")

**Expanded View:**
- Two buttons side-by-side (flex gap-2)
- Search button stretches (flex-1)
- Notification badge positioned absolutely (-top-1 -right-1)

**Collapsed View:**
- Buttons stacked vertically (flex-col gap-2)
- Icon-only buttons (w-10 h-10)
- Wrapped in tooltips
- Notification badge maintained

**Interaction:**
- Currently placeholder (console.log)
- Ready for search modal integration
- Ready for notifications panel integration

### 4. Enhanced Navigation Modules

**Expanded View:**
- Module headers clickable to expand/collapse
- Active module: bg-primary/10, text-primary, border-l-4
- Hover: translate-x-1, bg-accent/50
- Chevron icon rotates on expand (ChevronDown/ChevronRight)
- Subpages with stagger animation delays (delay-75, delay-100, delay-150)

**Collapsed View:**
- Icon-only buttons (w-full, p-3)
- Tooltip shows module name and all subpages
- Hover: scale-110, bg-accent
- Active: bg-primary/10, text-primary
- Single-subpage modules navigate directly on click
- Multi-subpage modules still expandable (shows subpages in tooltip)

**Typography:**
- Module names: font-heading, font-semibold, text-sm, letter-spacing-tight
- Subpage names: font-body, font-medium, text-sm
- Active subpage: font-semibold

**Animations:**
- Transition-all duration-200 on all elements
- Transform on hover (translate-x-1 for modules)
- Scale on hover (scale-110 for collapsed icons)
- Chevron rotation with transition-transform

### 5. Bottom Section

**Collapse Toggle Button:**
- Sticky position (sticky bottom-0)
- Border-top separator
- Background: bg-white (maintains visibility)
- Expanded: PanelLeftClose icon + "Daralt" text
- Collapsed: PanelLeftOpen icon with tooltip "Genişlet"

**Settings Link:**
- Below collapse toggle
- Same styling pattern as modules
- Icon: Settings (Cog)
- Expanded: icon + "Ayarlar" text
- Collapsed: icon only with tooltip
- Active state: bg-primary/10, text-primary
- Safe area padding for iOS (pb-safe)

### 6. Mobile Responsive Behavior

**Mobile (<lg breakpoint):**
- Sidebar always shows expanded view (ignores collapsed state)
- Full-screen overlay with semi-transparent backdrop
- Overlay z-index: z-40
- Close on backdrop click
- Close on navigation link click
- Touch-friendly button heights (h-11 on mobile)

**Desktop (≥lg breakpoint):**
- Fixed positioning
- Respects collapsed state
- No overlay
- Smooth width transitions

### 7. Accessibility Features

**ARIA Attributes:**
- `aria-label="Sidebar"` on aside element
- `aria-expanded={!isCollapsed}` on sidebar
- `aria-label="Toggle sidebar"` on collapse button
- `aria-label="User profile"` on profile section
- `aria-label="Quick actions"` on quick actions section
- All icon-only buttons have aria-label

**Keyboard Navigation:**
- All buttons focusable
- Proper tab order
- Focus indicators maintained
- Tooltips shown on focus (Radix default)

**Screen Readers:**
- Semantic HTML structure
- Descriptive labels
- Tooltip content accessible

## Dashboard Layout Updates

### Dynamic Sidebar Spacing

The layout now responds to sidebar collapsed state:

```tsx
<div
  className={cn(
    'hidden lg:block transition-all duration-300',
    isSidebarCollapsed ? 'w-20' : 'w-64'
  )}
/>
```

**Features:**
- Reads collapsed state from localStorage on mount
- Listens to storage events for cross-tab sync
- Smooth transition (duration-300)
- Hidden on mobile (<lg)

### Header Enhancements

**Styling Updates:**
- Background: bg-background/80 with backdrop-blur-xl
- Border: border-b with glassmorphism
- Shadow: shadow-glass (from visual enhancements)
- Title: font-heading, font-bold, text-lg
- User info: font-body, text-sm
- Mobile menu button: rounded-md, p-2 with hover effects

**Logout Button:**
- Variant: ghost (cleaner look)
- Hover: bg-destructive/10, text-destructive
- Font: font-body for text

### Main Content Area

**Optimizations:**
- Max width: max-w-[1600px] for ultra-wide screens
- Padding: p-6 lg:p-8 (consistent spacing)
- Background: bg-background (uses CSS variables)
- Relative positioning for stacking context
- Smooth transitions on sidebar toggle

## State Management

### LocalStorage Schema

```typescript
{
  "sidebar-collapsed": "true" | "false"  // Sidebar collapsed state
}
```

### Cross-Tab Synchronization

The sidebar state syncs across browser tabs using the Storage API:

1. Sidebar toggle dispatches storage event
2. All tabs listen to storage events
3. State updates automatically across tabs
4. Layout spacer updates accordingly

### State Flow

```
User clicks toggle
  ↓
Update local state
  ↓
Save to localStorage
  ↓
Dispatch storage event
  ↓
Other tabs receive event
  ↓
Update their state
  ↓
Re-render with new width
```

## Animations & Transitions

### Sidebar Width Transition

```css
transition-all duration-300 ease-in-out
```

Applied to:
- Sidebar width (w-20 ↔ w-64)
- Layout spacer width
- All content repositions smoothly

### Module Hover Effects

```css
transition-all duration-200 ease-in-out hover:translate-x-1
```

Creates subtle slide effect on hover.

### Icon Scale on Collapsed State

```css
transition-all duration-200 ease-in-out hover:scale-110
```

Icons grow slightly on hover when sidebar is collapsed.

### Chevron Rotation

```css
transition-transform duration-200
```

Smooth rotation between ChevronRight and ChevronDown.

### Subpage Stagger Animation

```css
delay-75   /* First subpage */
delay-100  /* Second subpage */
delay-150  /* Third subpage */
```

Creates cascading effect when expanding modules.

## Color & Typography System

### Color Tokens Used

**From globals.css:**
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `bg-background` - Base background
- `bg-accent` - Hover backgrounds
- `bg-primary/10` - Active state background
- `text-primary` - Active state text
- `border-primary` - Active state border
- `bg-muted` - Avatar fallback background

**Semantic Colors:**
- Active state: Primary blue with 10% opacity
- Hover state: Accent color
- Destructive actions: Red variants

### Typography Classes

**From globals.css:**
- `font-heading` - Poppins for headings
- `font-body` - Inter for body text
- `letter-spacing-tight` - Tighter spacing for headings
- Font weights: `font-semibold`, `font-medium`
- Font sizes: `text-sm`, `text-xs`

## Component Dependencies

### NPM Packages
- `@radix-ui/react-avatar` - Avatar primitives
- `@radix-ui/react-tooltip` - Tooltip primitives
- `lucide-react` - Icon library
- `class-variance-authority` - CVA for variants
- `framer-motion` - Already used in layout

### Internal Components
- `Button` from `@/components/ui/button`
- `Badge` from `@/components/ui/badge`
- `cn` utility from `@/lib/utils`

### Store
- `useAuthStore` from `@/stores/authStore`
  - Provides: user (name, role, avatar)
  - Used for profile section

## Browser Compatibility

All features use well-supported APIs:
- LocalStorage (all modern browsers)
- Storage Events (all modern browsers)
- CSS Transitions (all modern browsers)
- Flexbox (all modern browsers)
- CSS Custom Properties (all modern browsers)

## Performance Considerations

### Optimizations
1. **Local State**: Sidebar state in component (not global)
2. **Event Listeners**: Properly cleaned up in useEffect
3. **CSS Transitions**: Hardware-accelerated (GPU)
4. **Conditional Rendering**: Only render what's needed
5. **Tooltip Delay**: 300ms to avoid tooltip spam

### Render Optimization
- Sidebar only re-renders on:
  - Collapsed state change
  - Mobile open state change
  - Pathname change (navigation)
  - User data change

## Testing Checklist

- [ ] Sidebar toggles between expanded/collapsed
- [ ] State persists across page refreshes
- [ ] State syncs across browser tabs
- [ ] User profile displays correctly (expanded & collapsed)
- [ ] Quick actions work (expanded & collapsed)
- [ ] All modules are navigable
- [ ] Active states show correctly
- [ ] Hover effects work smoothly
- [ ] Mobile overlay works correctly
- [ ] Settings link navigates properly
- [ ] Tooltips appear on hover/focus
- [ ] Keyboard navigation works
- [ ] Screen reader labels are present
- [ ] Dark mode compatibility (if applicable)
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts during transitions
- [ ] Avatar fallback shows initials correctly
- [ ] Role badges display with correct variants

## Usage Examples

### Basic Sidebar Usage

```tsx
import { Sidebar } from '@/components/layouts/Sidebar';

function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  return (
    <>
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileToggle={() => setIsMobileOpen(false)}
      />
    </>
  );
}
```

### Accessing Collapsed State in Layout

```tsx
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

useEffect(() => {
  const stored = localStorage.getItem('sidebar-collapsed');
  if (stored !== null) {
    setIsSidebarCollapsed(stored === 'true');
  }

  const handleStorageChange = () => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) {
      setIsSidebarCollapsed(stored === 'true');
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### Using Avatar Component Separately

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

function UserProfile({ user }) {
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Avatar size="lg">
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
}
```

### Using Tooltip Component Separately

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function IconButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button>
            <Icon />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Action description</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

## Future Enhancements

Potential improvements for future iterations:

1. **Search Functionality**
   - Implement global search modal
   - Search across all modules and content
   - Keyboard shortcut (Cmd/Ctrl + K)

2. **Notifications**
   - Real-time notification system
   - Notification panel/dropdown
   - Mark as read functionality
   - Notification preferences

3. **Customization**
   - User-configurable sidebar position (left/right)
   - Pinned favorites
   - Custom module order
   - Theme switching in sidebar

4. **Advanced Features**
   - Recent items section
   - Breadcrumb navigation integration
   - Module search/filter
   - Keyboard shortcuts panel

5. **Performance**
   - Virtual scrolling for large module lists
   - Lazy loading of module content
   - Animation optimization based on device performance

## Migration Guide

### From Old Sidebar

If migrating from a simpler sidebar:

1. **Install Dependencies**
   ```bash
   npm install @radix-ui/react-avatar @radix-ui/react-tooltip class-variance-authority
   ```

2. **Add New Components**
   - Copy `avatar.tsx` to `src/components/ui/`
   - Copy `tooltip.tsx` to `src/components/ui/`

3. **Update Sidebar Component**
   - Replace old Sidebar.tsx with new implementation
   - Ensure `useAuthStore` provides user data

4. **Update Layout**
   - Add localStorage sync for sidebar state
   - Update spacer div to use dynamic width
   - Test mobile behavior

5. **Test Thoroughly**
   - Run through testing checklist
   - Test on multiple browsers
   - Test on mobile devices

## Files Modified

1. **Created:**
   - `src/components/ui/avatar.tsx`
   - `src/components/ui/tooltip.tsx`

2. **Modified:**
   - `src/components/layouts/Sidebar.tsx` (complete rewrite)
   - `src/app/(dashboard)/layout.tsx` (dynamic spacing, header updates)

## Resources

- [Radix UI Avatar](https://www.radix-ui.com/primitives/docs/components/avatar)
- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)
- [CVA (Class Variance Authority)](https://cva.style/docs)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)
- [shadcn/ui Patterns](https://ui.shadcn.com/)

