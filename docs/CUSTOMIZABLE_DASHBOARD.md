# Customizable Dashboard Widgets Guide

## Overview

This document outlines the comprehensive customizable dashboard widget system in the Dernek Yönetim Sistemi, allowing users to create, arrange, and personalize their dashboard experience.

## Table of Contents

1. [System Overview](#system-overview)
2. [Widget Types](#widget-types)
3. [Widget Service](#widget-service)
4. [Widget Renderer](#widget-renderer)
5. [Dashboard Layout](#dashboard-layout)
6. [Custom Widgets](#custom-widgets)
7. [Best Practices](#best-practices)

---

## System Overview

The dashboard widget system provides a flexible, drag-and-drop interface for creating personalized dashboards.

### Architecture

```
Dashboard Page
    ↓
Widget Renderer
    ↓
Widget Service (Data & Logic)
    ↓
Widget Config (Settings)
    ↓
Component Rendering
```

### Key Features

- **8 Widget Types**: Stat cards, charts, lists, tables, calendars, progress rings, and more
- **4 Size Options**: Small, medium, large, and full-width
- **Responsive Grid**: Automatically adapts to screen size
- **Customizable**: Title, settings, data sources
- **Persistent**: Layout saved to localStorage
- **Import/Export**: Share dashboard layouts
- **Real-time Data**: Configurable refresh intervals

---

## Widget Types

### 1. Stat Card

Display key metrics and statistics with optional trend indicators.

**Settings**:
```typescript
{
  showTrend: boolean;      // Show trend indicator (up/down)
  showChange: boolean;     // Show percentage change
  prefix: string;          // Text before value (e.g., '₺', '$')
  suffix: string;          // Text after value (e.g., '%', 'items')
}
```

**Example**:
- Total Beneficiaries: `245`
- Monthly Donations: `₺125,000`
- Completion Rate: `85%`

### 2. Line Chart

Display trends and time-series data.

**Settings**:
```typescript
{
  showLegend: boolean;     // Show chart legend
  showGrid: boolean;       // Show grid lines
  timeRange: string;       // '7d', '30d', '90d', '1y'
  colorScheme: string;     // 'blue', 'green', 'purple', etc.
}
```

**Use Cases**:
- Donation trends over time
- Beneficiary registration trends
- Monthly statistics

### 3. Bar Chart

Compare categories side-by-side.

**Settings**:
```typescript
{
  orientation: 'vertical' | 'horizontal';
  showLegend: boolean;
  colorScheme: string;
}
```

**Use Cases**:
- Donations by category
- Beneficiaries by city
- Tasks by status

### 4. Pie Chart

Show proportions and percentages.

**Settings**:
```typescript
{
  showLegend: boolean;
  donut: boolean;          // Show as donut chart
  colorScheme: string;
}
```

**Use Cases**:
- Donation sources
- Beneficiary status distribution
- Task priority breakdown

### 5. List Widget

Display recent activities or items.

**Settings**:
```typescript
{
  maxItems: number;        // Maximum items to show
  showTimestamp: boolean;  // Show timestamp
  filter: string;          // Filter criteria
}
```

**Types**:
- **Recent Activities**: Latest system activities
- **Task List**: Pending tasks and todos
- **Notifications**: User notifications

### 6. Data Table

Display tabular data with sorting and filtering.

**Settings**:
```typescript
{
  maxRows: number;         // Maximum rows to display
  sortable: boolean;       // Enable column sorting
  searchable: boolean;     // Enable search
  showFilters: boolean;    // Show filter controls
}
```

**Use Cases**:
- Recent donations
- Beneficiary list
- Task overview

### 7. Calendar

Show upcoming events and appointments.

**Settings**:
```typescript
{
  view: 'month' | 'week' | 'day';
  showWeekends: boolean;
}
```

**Use Cases**:
- Scheduled meetings
- Upcoming deadlines
- Event calendar

### 8. Progress Ring

Display progress metrics with circular visualization.

**Settings**:
```typescript
{
  showLabel: boolean;      // Show progress label
  showPercentage: boolean; // Show percentage
  color: string;           // Ring color
}
```

**Use Cases**:
- Goal completion
- Task progress
- Project status

---

## Widget Service

The `WidgetService` manages all widget operations including CRUD, data fetching, and layout persistence.

### Usage

```typescript
import { widgetService } from '@/shared/lib/services/widget.service';

// Get all widget templates
const templates = widgetService.getTemplates();

// Create a new widget
const template = widgetService.getTemplate('stat-card');
const widget = widgetService.createWidget(template, {
  title: 'Total Donations',
  settings: { prefix: '₺' }
});

// Save layout
widgetService.saveLayout(layout);

// Load layout
const layout = widgetService.getLayout('default-user-id');
```

### Methods

#### Widget Management
- `getTemplates()`: Get all available widget templates
- `getTemplate(id)`: Get specific template
- `createWidget(template, overrides)`: Create widget from template
- `updateWidget(layoutId, widgetId, updates)`: Update widget
- `deleteWidget(layoutId, widgetId)`: Delete widget
- `addWidget(layoutId, widget)`: Add widget to layout

#### Layout Management
- `saveLayout(layout)`: Save layout to localStorage
- `getLayout(id)`: Load layout from localStorage
- `createDefaultLayout(userId)`: Create layout with default widgets
- `reorderWidgets(layoutId, widgetIds)`: Reorder widgets
- `exportLayout(layoutId)`: Export layout as JSON
- `importLayout(layoutJson)`: Import layout from JSON

#### Data Fetching
- `getWidgetData(widget)`: Fetch data for widget
- `generateMockData(widget)`: Generate mock data for testing

---

## Widget Renderer

The `WidgetRenderer` component dynamically renders different widget types based on their configuration.

### Props

```typescript
interface WidgetRendererProps {
  widget: WidgetConfig;
  onEdit?: (widget: WidgetConfig) => void;
  onDelete?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
}
```

### Usage

```tsx
<WidgetRenderer
  widget={widget}
  onDelete={(id) => handleDeleteWidget(id)}
  onRefresh={(id) => handleRefreshWidget(id)}
/>
```

### Size Classes

Widget sizes map to responsive grid classes:

```typescript
// Small widgets: 3 grid units (25% on large screens)
'small' → 'col-span-12 md:col-span-6 lg:col-span-3'

// Medium widgets: 4 grid units (33% on large screens)
'medium' → 'col-span-12 md:col-span-6 lg:col-span-4'

// Large widgets: 8 grid units (66% on large screens)
'large' → 'col-span-12 md:col-span-12 lg:col-span-8'

// Full widgets: 12 grid units (100%)
'full' → 'col-span-12'
```

---

## Dashboard Layout

The `DashboardLayout` interface defines the structure of a dashboard layout.

```typescript
interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  createdAt: string;
  updatedAt: string;
}
```

### Widget Config

```typescript
interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  dataSource?: string;
  refreshInterval?: number;
  settings?: Record<string, any>;
  isVisible: boolean;
}
```

### Position

```typescript
interface WidgetPosition {
  x: number;
  y: number;
  w: number;  // width in grid units
  h: number;  // height in grid units
}
```

### Creating Layout

```typescript
const layout: DashboardLayout = {
  id: 'my-dashboard',
  name: 'My Custom Dashboard',
  widgets: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

---

## Custom Widgets

### Creating Custom Widget Type

1. Add template to `WIDGET_TEMPLATES`:

```typescript
{
  id: 'custom-widget',
  name: 'Custom Widget',
  description: 'My custom widget',
  type: 'custom',
  icon: 'CustomIcon',
  defaultSize: 'medium',
  defaultSettings: {
    customSetting: 'value'
  },
  component: 'CustomWidgetComponent'
}
```

2. Add renderer case in `WidgetRenderer`:

```typescript
case 'custom':
  return <CustomWidget data={data} settings={widget.settings} />;
```

3. Create component:

```tsx
function CustomWidget({ data, settings }) {
  return (
    <div>
      {/* Your custom widget UI */}
    </div>
  );
}
```

### Custom Data Source

```typescript
const widget = widgetService.createWidget(template, {
  dataSource: '/api/custom-endpoint',
  refreshInterval: 60, // Refresh every minute
});

// Fetch data
const data = await fetch(widget.dataSource);
const result = await data.json();
```

---

## Best Practices

### 1. Widget Selection

✅ **DO**: Choose appropriate widget type for data
```typescript
// For time-series data
<LineChart widget={...} />

// For comparisons
<BarChart widget={...} />

// For proportions
<PieChart widget={...} />
```

❌ **DON'T**: Use wrong widget types
```typescript
// Time-series as pie chart (bad)
<PieChart widget={trendData} />
```

### 2. Responsive Design

✅ **DO**: Use responsive sizes
```typescript
<WidgetRenderer widget={{ ...size: 'large' }} />
```

❌ **DON'T**: Ignore screen sizes
```typescript
// All widgets same size (bad)
{widgets.map(w => <WidgetRenderer widget={{ ...size: 'medium' }} />)}
```

### 3. Performance

✅ **DO**: Limit data points and use refresh intervals
```typescript
const widget = {
  ...
  settings: {
    maxItems: 10,        // Limit list items
    timeRange: '30d',    // Reasonable time range
  },
  refreshInterval: 300,  // 5 minutes
};
```

❌ **DON'T**: Fetch excessive data
```typescript
// Fetching 1000 items for display (bad)
widget.settings.maxItems = 1000;
```

### 4. Accessibility

✅ **DO**: Provide meaningful titles and labels
```typescript
<WidgetRenderer
  widget={{
    title: 'Monthly Donations (₺)',
    ...
  }}
/>
```

❌ **DON'T**: Use generic titles
```typescript
// Not informative (bad)
widget.title = 'Chart 1';
```

### 5. Data Visualization

✅ **DO**: Use appropriate chart types
```typescript
// Trends over time → Line Chart
<WidgetRenderer widget={{ type: 'chart', settings: { chartType: 'line' } }} />

// Category comparisons → Bar Chart
<WidgetRenderer widget={{ type: 'chart', settings: { chartType: 'bar' } }} />

// Proportions → Pie Chart
<WidgetRenderer widget={{ type: 'chart', settings: { chartType: 'pie' } }} />
```

### 6. User Experience

✅ **DO**: Provide helpful widget descriptions
```typescript
template.description = 'Display monthly donation trends over time';
```

✅ **DO**: Set reasonable defaults
```typescript
defaultSettings: {
  showLegend: true,
  showGrid: true,
  timeRange: '30d',
}
```

### 7. Testing

```typescript
// Test rendering
test('renders stat card widget', () => {
  const widget = { type: 'stat', data: { value: 100 } };
  render(<WidgetRenderer widget={widget} />);
  expect(screen.getByText('100')).toBeInTheDocument();
});

// Test data fetching
test('fetches widget data', async () => {
  const widget = { dataSource: '/api/data' };
  const data = await widgetService.getWidgetData(widget);
  expect(data).toBeDefined();
});
```

---

## Common Use Cases

### 1. Executive Dashboard

```typescript
// Widgets for executives
const executiveWidgets = [
  { type: 'stat', title: 'Total Revenue', size: 'small' },
  { type: 'stat', title: 'Active Beneficiaries', size: 'small' },
  { type: 'line-chart', title: 'Revenue Trend', size: 'large' },
  { type: 'pie-chart', title: 'Donation Sources', size: 'medium' },
];
```

### 2. Operations Dashboard

```typescript
// Widgets for operations team
const operationWidgets = [
  { type: 'list', title: 'Recent Activities', size: 'large' },
  { type: 'task-list', title: 'Pending Tasks', size: 'large' },
  { type: 'calendar', title: 'Upcoming Meetings', size: 'large' },
  { type: 'progress', title: 'Project Progress', size: 'small' },
];
```

### 3. Analytics Dashboard

```typescript
// Widgets for analysts
const analyticsWidgets = [
  { type: 'bar-chart', title: 'Donations by Category', size: 'large' },
  { type: 'line-chart', title: 'Beneficiary Growth', size: 'large' },
  { type: 'table', title: 'Detailed Records', size: 'full' },
  { type: 'stat', title: 'Conversion Rate', size: 'medium' },
];
```

---

## Implementation Example

### Complete Dashboard Setup

```tsx
import { widgetService } from '@/shared/lib/services/widget.service';
import { WidgetRenderer } from '@/features/dashboard/components/WidgetRenderer';

function MyDashboard() {
  const [layout, setLayout] = useState<DashboardLayout | null>(null);

  useEffect(() => {
    // Load or create layout
    const layoutId = 'user-dashboard';
    let layout = widgetService.getLayout(layoutId);

    if (!layout) {
      layout = widgetService.createDefaultLayout('user-id');
    }

    setLayout(layout);
  }, []);

  const handleAddWidget = (template: WidgetTemplate) => {
    const widget = widgetService.createWidget(template);
    widgetService.addWidget(layout.id, widget);
    const updatedLayout = widgetService.getLayout(layout.id);
    setLayout(updatedLayout);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {layout?.widgets.map(widget => (
        <WidgetRenderer
          key={widget.id}
          widget={widget}
          onDelete={() => handleDeleteWidget(widget.id)}
        />
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Widget Not Rendering

**Check**:
1. Widget type is valid
2. Widget config is complete
3. Component is imported

**Solution**:
```typescript
// Ensure widget type is valid
const validTypes = ['stat', 'chart', 'list', 'table', 'calendar', 'progress'];
if (!validTypes.includes(widget.type)) {
  console.error('Invalid widget type:', widget.type);
}
```

### Issue: Data Not Loading

**Check**:
1. Data source URL is valid
2. API endpoint returns correct format
3. Widget has proper data mapping

**Solution**:
```typescript
// Verify data source
const response = await fetch(widget.dataSource);
const data = await response.json();

// Ensure data matches expected format
console.log('Widget data:', data);
```

### Issue: Layout Not Saving

**Check**:
1. localStorage is enabled
2. Layout ID is unique
3. No JavaScript errors

**Solution**:
```typescript
// Verify localStorage
if (typeof Storage !== 'undefined') {
  localStorage.setItem('test', 'value');
}

// Check for errors
try {
  widgetService.saveLayout(layout);
} catch (error) {
  console.error('Save failed:', error);
}
```

---

## Performance Optimization

### 1. Widget Limits

```typescript
// Limit number of widgets per dashboard
const MAX_WIDGETS = 12;
if (layout.widgets.length >= MAX_WIDGETS) {
  throw new Error('Maximum widgets reached');
}
```

### 2. Data Caching

```typescript
// Cache widget data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cached = sessionStorage.getItem(`widget-${widget.id}`);
if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  return cached.data;
}
```

### 3. Lazy Loading

```typescript
// Load off-screen widgets lazily
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadWidgetData(widget.id);
    }
  });
});
```

---

## Resources

### Documentation
- [Recharts Documentation](https://recharts.org/)
- [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)

### Articles
- [Dashboard Design Best Practices](https://www.tableau.com/learn/articles/dashboard-design-principles)
- [Data Visualization Guide](https://datavizproject.com/)

### Tools
- [Chart.js](https://www.chartjs.org/) - Alternative charting library
- [D3.js](https://d3js.org/) - Advanced data visualization

---

*Last Updated: November 2025*
*Version: 1.0*
