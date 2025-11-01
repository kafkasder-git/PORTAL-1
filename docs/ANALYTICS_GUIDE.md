# Analytics & Reporting System Guide

## Overview

The Analytics & Reporting System provides comprehensive data analysis and visualization capabilities for the Dernek Yönetim Sistemi. It includes real-time metrics, trend analysis, and export functionality.

## Features

### 📊 Dashboard Components
- **Summary Metrics**: Key performance indicators at a glance
- **Interactive Charts**: Bar, Line, and Pie charts using Recharts
- **Date Range Filtering**: Customizable time periods
- **Tabbed Interface**: Organized by analytics category
- **CSV Export**: Download data for external analysis

### 📈 Analytics Capabilities
- **Donation Trends**: Track donation amounts and counts over time
- **Beneficiary Categories**: Analyze distribution by category
- **Aid Distribution**: Breakdown of aid types and quantities
- **Monthly Statistics**: Year-to-date performance metrics
- **Task Management**: Completed vs pending task analytics
- **Meeting Analytics**: Upcoming and past meeting statistics

## Quick Start

### Accessing Analytics

Navigate to `/analytics` in the application or click "Analitik & Raporlar" from the main menu.

### Using Date Ranges

1. Select start and end dates using the date pickers
2. Or use quick filters:
   - Last 7 Days
   - Last 30 Days
   - Last 90 Days
   - Custom Range
3. Click "Uygula" to refresh data

### Exporting Data

1. Click the "CSV İndir" button in the header
2. The CSV file will include all sections:
   - Summary metrics
   - Donation trends
   - Beneficiary categories
   - Aid distribution

## Components

### AnalyticsDashboard

Main dashboard component with tabs for different analytics views.

```tsx
import AnalyticsDashboard from '@/features/analytics/components/AnalyticsDashboard';

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
```

### SummaryCard

Displays a key metric with icon and color coding.

```tsx
<SummaryCard
  title="Toplam İhtiyaç Sahibi"
  value={1234}
  icon={<Users className="h-5 w-5" />}
  color="bg-blue-500"
/>
```

## API Reference

### GET /api/analytics/reports

Get comprehensive analytics report.

**Query Parameters:**
- `from` (optional): Start date (ISO format)
- `to` (optional): End date (ISO format)

**Response:**
```typescript
{
  success: true,
  data: {
    summary: SummaryMetrics,
    donationTrends: DonationTrend[],
    beneficiaryCategories: BeneficiaryCategory[],
    aidDistribution: AidDistribution[],
    monthlyStats: MonthlyStats[]
  }
}
```

### GET /api/analytics/summary

Get only summary metrics.

**Response:**
```typescript
{
  success: true,
  data: SummaryMetrics
}
```

### POST /api/analytics/reports/export

Export report to CSV format.

**Request Body:**
```typescript
{
  reportData: ReportData
}
```

**Response:** CSV file download

## Data Types

### SummaryMetrics

```typescript
{
  totalBeneficiaries: number;
  totalDonations: number;
  totalDonationAmount: number;
  totalAidApplications: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalMeetings: number;
  upcomingMeetings: number;
}
```

### DonationTrend

```typescript
{
  date: string;
  amount: number;
  count: number;
}
```

### BeneficiaryCategory

```typescript
{
  category: string;
  count: number;
  percentage: number;
}
```

### AidDistribution

```typescript
{
  type: string;
  amount: number;
  count: number;
  percentage: number;
}
```

### MonthlyStats

```typescript
{
  month: string; // e.g., "Oca", "Şub"
  beneficiaries: number;
  donations: number;
  aidApplications: number;
  tasks: number;
}
```

## Services

### getComprehensiveReport()

Fetches all analytics data.

```typescript
import { getComprehensiveReport } from '@/shared/lib/services/reporting.service';

const reportData = await getComprehensiveReport({
  from: new Date('2024-01-01'),
  to: new Date('2024-12-31')
});
```

### getSummaryMetrics()

Fetches only summary metrics.

```typescript
import { getSummaryMetrics } from '@/shared/lib/services/reporting.service';

const summary = await getSummaryMetrics();
```

### getDonationTrends()

Fetches donation trends with flexible intervals.

```typescript
import { getDonationTrends } from '@/shared/lib/services/reporting.service';

const trends = await getDonationTrends(
  { from: startDate, to: endDate },
  'day' // 'day', 'week', or 'month'
);
```

### exportToCsv()

Converts report data to CSV format.

```typescript
import { exportToCsv } from '@/shared/lib/services/reporting.service';

const csv = exportToCsv(reportData);
// Download or send to server
```

## Customization

### Adding New Metrics

1. Update `SummaryMetrics` type in `reporting.service.ts`
2. Modify `getSummaryMetrics()` to calculate the new metric
3. Add visual component in `AnalyticsDashboard.tsx`

Example:
```typescript
// In reporting.service.ts
export async function getSummaryMetrics(): Promise<SummaryMetrics> {
  // ... existing code
  return {
    // ... existing metrics
    newMetric: calculateNewMetric()
  };
}

// In AnalyticsDashboard.tsx
<SummaryCard
  title="Yeni Metrik"
  value={reportData.summary.newMetric}
  icon={<NewIcon className="h-5 w-5" />}
  color="bg-orange-500"
/>
```

### Creating Custom Charts

Use Recharts components within the analytics dashboard:

```tsx
<ResponsiveContainer width="100%" height={400}>
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Area
      type="monotone"
      dataKey="value"
      stroke="#8884d8"
      fill="#8884d8"
    />
  </AreaChart>
</ResponsiveContainer>
```

### Adding New Export Formats

The system currently supports CSV. To add other formats:

1. **Excel (.xlsx)**: Use libraries like `xlsx` or `exceljs`
2. **PDF**: Use libraries like `jsPDF` or `Puppeteer` for server-side PDF generation
3. **JSON**: Already supported via API responses

Example for Excel export:
```typescript
import * as XLSX from 'xlsx';

export function exportToExcel(reportData: ReportData): Blob {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(reportData.summary);
  XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
```

## Performance Optimization

### Caching

Analytics data can be cached to improve performance:

```typescript
// Example caching strategy
const cacheKey = `analytics-${dateRange.from}-${dateRange.to}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await getComprehensiveReport(dateRange);
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min cache
return data;
```

### Pagination

For large datasets, implement pagination:

```typescript
export async function getDonationTrendsPaginated(
  dateRange: DateRange,
  page: number = 1,
  limit: number = 100
): Promise<{ data: DonationTrend[]; total: number; }> {
  // Implementation
}
```

### Data Aggregation

Pre-aggregate data for faster queries:

```typescript
// Create materialized views or use database aggregation
// Example with Appwrite:
// Use database.listDocuments with filters and limits
```

## Real-time Updates

To add real-time analytics updates:

1. Use Appwrite Realtime subscriptions
2. Update React Query cache when data changes
3. Implement automatic chart refresh

```typescript
// Example with Appwrite Realtime
useEffect(() => {
  const unsubscribe = appwrite.subscribe('collections.donations', (response) => {
    // Invalidate and refetch analytics data
    queryClient.invalidateQueries({ queryKey: ['analytics-report'] });
  });

  return () => unsubscribe();
}, []);
```

## Security

### Data Access Control

- Ensure users can only access data they have permission to view
- Implement role-based access for sensitive metrics
- Use CSRF protection on export endpoints (already implemented)

### Data Privacy

- Aggregate data before displaying
- Mask sensitive information in exports
- Implement audit logging for report access

## Troubleshooting

### Charts Not Rendering

**Problem**: Charts show empty or error state

**Solutions**:
1. Check data format matches expected types
2. Verify ResponsiveContainer has parent with defined height
3. Ensure Recharts dependencies are installed: `npm install recharts`

### Slow Performance

**Problem**: Reports take too long to load

**Solutions**:
1. Implement caching (Redis recommended)
2. Use database aggregation instead of client-side calculations
3. Limit date ranges or add pagination
4. Consider server-side rendering for large reports

### Export Not Working

**Problem**: CSV export fails or downloads empty file

**Solutions**:
1. Verify `exportToCsv()` receives valid data
2. Check Content-Disposition headers
3. Ensure proper MIME type: `text/csv`
4. Test with browser developer tools

## Browser Support

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Responsive design

## Dependencies

```json
{
  "recharts": "^2.10.0",
  "date-fns": "^3.0.0",
  "@tanstack/react-query": "^5.0.0"
}
```

Install with: `npm install recharts date-fns @tanstack/react-query`

## Roadmap

### Upcoming Features

- [ ] **Real-time Dashboard**: Live updates without page refresh
- [ ] **Advanced Filters**: Multi-dimensional filtering
- [ ] **Custom Reports**: User-defined report builder
- [ ] **Scheduled Reports**: Email reports automatically
- [ ] **Data Comparisons**: Period-over-period analysis
- [ ] **Interactive Drill-down**: Click to explore details
- [ ] **Predictive Analytics**: Trend forecasting
- [ ] **Mobile App Analytics**: Native mobile views
- [ ] **API Rate Limiting**: Prevent abuse
- [ ] **Data Archiving**: Long-term storage management

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in `reporting.service.ts`
3. Test with sample data
4. Check browser console for errors
5. Verify API responses in Network tab
