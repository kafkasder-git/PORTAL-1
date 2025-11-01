/**
 * Dashboard Widget Service
 * Manages customizable dashboard widgets
 */

export type WidgetType =
  | 'stat'
  | 'chart'
  | 'table'
  | 'list'
  | 'calendar'
  | 'progress'
  | 'activity'
  | 'custom';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number; // width in grid units
  h: number; // height in grid units
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  dataSource?: string;
  refreshInterval?: number; // in seconds
  settings?: Record<string, any>;
  isVisible: boolean;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  type: WidgetType;
  icon: string;
  defaultSize: WidgetSize;
  defaultSettings: Record<string, any>;
  component: string; // Component name
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  createdAt: string;
  updatedAt: string;
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'stat-card',
    name: 'Stat Card',
    description: 'Display key metrics and statistics',
    type: 'stat',
    icon: 'BarChart3',
    defaultSize: 'medium',
    defaultSettings: {
      showTrend: true,
      showChange: true,
      prefix: '',
      suffix: '',
    },
    component: 'StatCard',
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    description: 'Display trends over time',
    type: 'chart',
    icon: 'TrendingUp',
    defaultSize: 'large',
    defaultSettings: {
      showLegend: true,
      showGrid: true,
      timeRange: '7d',
      colorScheme: 'blue',
    },
    component: 'LineChart',
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Compare categories',
    type: 'chart',
    icon: 'BarChart',
    defaultSize: 'large',
    defaultSettings: {
      orientation: 'vertical',
      showLegend: true,
      colorScheme: 'blue',
    },
    component: 'BarChart',
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    description: 'Show proportions',
    type: 'chart',
    icon: 'PieChart',
    defaultSize: 'medium',
    defaultSettings: {
      showLegend: true,
      donut: false,
      colorScheme: 'blue',
    },
    component: 'PieChart',
  },
  {
    id: 'recent-activities',
    name: 'Recent Activities',
    description: 'Show recent activities and updates',
    type: 'list',
    icon: 'Activity',
    defaultSize: 'large',
    defaultSettings: {
      maxItems: 10,
      showTimestamp: true,
      filter: 'all',
    },
    component: 'ActivityList',
  },
  {
    id: 'task-list',
    name: 'Task List',
    description: 'Display tasks and to-dos',
    type: 'list',
    icon: 'CheckSquare',
    defaultSize: 'large',
    defaultSettings: {
      maxItems: 10,
      showStatus: true,
      showAssignee: false,
    },
    component: 'TaskList',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Show upcoming events',
    type: 'calendar',
    icon: 'Calendar',
    defaultSize: 'large',
    defaultSettings: {
      view: 'month',
      showWeekends: true,
    },
    component: 'CalendarWidget',
  },
  {
    id: 'progress-ring',
    name: 'Progress Ring',
    description: 'Display progress metrics',
    type: 'progress',
    icon: 'Circle',
    defaultSize: 'small',
    defaultSettings: {
      showLabel: true,
      showPercentage: true,
      color: 'blue',
    },
    component: 'ProgressRing',
  },
  {
    id: 'data-table',
    name: 'Data Table',
    description: 'Display tabular data',
    type: 'table',
    icon: 'Table',
    defaultSize: 'large',
    defaultSettings: {
      maxRows: 10,
      sortable: true,
      searchable: true,
      showFilters: false,
    },
    component: 'DataTable',
  },
];

export class WidgetService {
  private layouts: Map<string, DashboardLayout> = new Map();

  /**
   * Get all widget templates
   */
  getTemplates(): WidgetTemplate[] {
    return WIDGET_TEMPLATES;
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): WidgetTemplate | undefined {
    return WIDGET_TEMPLATES.find(template => template.id === id);
  }

  /**
   * Create a new widget from template
   */
  createWidget(template: WidgetTemplate, overrides: Partial<WidgetConfig> = {}): WidgetConfig {
    return {
      id: crypto.randomUUID(),
      type: template.type,
      title: overrides.title || template.name,
      size: overrides.size || template.defaultSize,
      position: overrides.position || this.getDefaultPosition(template.defaultSize),
      dataSource: overrides.dataSource,
      refreshInterval: overrides.refreshInterval || 300, // 5 minutes default
      settings: { ...template.defaultSettings, ...overrides.settings },
      isVisible: overrides.isVisible !== false,
    };
  }

  /**
   * Get default position for widget size
   */
  private getDefaultPosition(size: WidgetSize): WidgetPosition {
    const gridWidth = 12;
    const positions: Record<WidgetSize, { w: number; h: number }> = {
      small: { w: 3, h: 2 },
      medium: { w: 4, h: 3 },
      large: { w: 6, h: 4 },
      full: { w: 12, h: 6 },
    };

    const { w, h } = positions[size];

    // Find next available position
    const usedPositions = new Set<string>();
    // This would need to be calculated based on current layout
    // For now, return a simple grid position

    return {
      x: 0,
      y: 0,
      w,
      h,
    };
  }

  /**
   * Save dashboard layout
   */
  saveLayout(layout: DashboardLayout): void {
    this.layouts.set(layout.id, layout);
    localStorage.setItem(`dashboard-layout-${layout.id}`, JSON.stringify(layout));
  }

  /**
   * Get dashboard layout
   */
  getLayout(id: string): DashboardLayout | undefined {
    if (this.layouts.has(id)) {
      return this.layouts.get(id);
    }

    // Try to load from localStorage
    const stored = localStorage.getItem(`dashboard-layout-${id}`);
    if (stored) {
      const layout = JSON.parse(stored) as DashboardLayout;
      this.layouts.set(id, layout);
      return layout;
    }

    return undefined;
  }

  /**
   * Create default layout
   */
  createDefaultLayout(userId: string): DashboardLayout {
    const layout: DashboardLayout = {
      id: `default-${userId}`,
      name: 'Default Dashboard',
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add some default widgets
    const templates = this.getTemplates();
    const statTemplate = templates.find(t => t.id === 'stat-card');
    const chartTemplate = templates.find(t => t.id === 'line-chart');
    const listTemplate = templates.find(t => t.id === 'recent-activities');

    if (statTemplate) {
      layout.widgets.push(this.createWidget(statTemplate, {
        title: 'Toplam İhtiyaç Sahibi',
        settings: { ...statTemplate.defaultSettings, value: 245 },
      }));
    }

    if (statTemplate) {
      layout.widgets.push(this.createWidget(statTemplate, {
        title: 'Aylık Bağış',
        settings: { ...statTemplate.defaultSettings, value: 125000, suffix: '₺' },
      }));
    }

    if (chartTemplate) {
      layout.widgets.push(this.createWidget(chartTemplate, {
        title: 'Bağış Trendi',
      }));
    }

    if (listTemplate) {
      layout.widgets.push(this.createWidget(listTemplate, {
        title: 'Son Aktiviteler',
      }));
    }

    this.saveLayout(layout);
    return layout;
  }

  /**
   * Update widget
   */
  updateWidget(layoutId: string, widgetId: string, updates: Partial<WidgetConfig>): void {
    const layout = this.getLayout(layoutId);
    if (!layout) return;

    const widgetIndex = layout.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return;

    layout.widgets[widgetIndex] = {
      ...layout.widgets[widgetIndex],
      ...updates,
    };

    layout.updatedAt = new Date().toISOString();
    this.saveLayout(layout);
  }

  /**
   * Delete widget
   */
  deleteWidget(layoutId: string, widgetId: string): void {
    const layout = this.getLayout(layoutId);
    if (!layout) return;

    layout.widgets = layout.widgets.filter(w => w.id !== widgetId);
    layout.updatedAt = new Date().toISOString();
    this.saveLayout(layout);
  }

  /**
   * Add widget
   */
  addWidget(layoutId: string, widget: WidgetConfig): void {
    const layout = this.getLayout(layoutId);
    if (!layout) return;

    layout.widgets.push(widget);
    layout.updatedAt = new Date().toISOString();
    this.saveLayout(layout);
  }

  /**
   * Reorder widgets
   */
  reorderWidgets(layoutId: string, widgetIds: string[]): void {
    const layout = this.getLayout(layoutId);
    if (!layout) return;

    layout.widgets.sort((a, b) => widgetIds.indexOf(a.id) - widgetIds.indexOf(b.id));
    layout.updatedAt = new Date().toISOString();
    this.saveLayout(layout);
  }

  /**
   * Get widget data
   */
  async getWidgetData(widget: WidgetConfig): Promise<any> {
    // In production, fetch data from API based on dataSource
    // For now, return mock data
    return this.generateMockData(widget);
  }

  /**
   * Generate mock data for demonstration
   */
  private generateMockData(widget: WidgetConfig): any {
    switch (widget.type) {
      case 'stat':
        return {
          value: Math.floor(Math.random() * 1000),
          change: Math.floor(Math.random() * 100) - 50,
          trend: Math.random() > 0.5 ? 'up' : 'down',
        };

      case 'chart':
        return {
          labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
          datasets: [{
            label: 'Value',
            data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
          }],
        };

      case 'list':
        return Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          title: `Item ${i + 1}`,
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        }));

      case 'table':
        return {
          columns: ['Name', 'Status', 'Date'],
          rows: Array.from({ length: 10 }, (_, i) => [
            `Row ${i + 1}`,
            i % 2 === 0 ? 'Active' : 'Inactive',
            new Date(Date.now() - i * 86400000).toLocaleDateString('tr-TR'),
          ]),
        };

      case 'calendar':
        return Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          title: `Event ${i + 1}`,
          date: new Date(Date.now() + i * 86400000).toISOString(),
        }));

      case 'progress':
        return {
          current: Math.floor(Math.random() * 100),
          total: 100,
        };

      default:
        return {};
    }
  }

  /**
   * Export layout
   */
  exportLayout(layoutId: string): string | null {
    const layout = this.getLayout(layoutId);
    if (!layout) return null;

    return JSON.stringify(layout, null, 2);
  }

  /**
   * Import layout
   */
  importLayout(layoutJson: string): DashboardLayout | null {
    try {
      const layout = JSON.parse(layoutJson) as DashboardLayout;
      layout.id = `imported-${Date.now()}`;
      layout.name = `${layout.name} (Imported)`;
      layout.createdAt = new Date().toISOString();
      layout.updatedAt = new Date().toISOString();

      // Generate new IDs for widgets
      layout.widgets = layout.widgets.map(widget => ({
        ...widget,
        id: crypto.randomUUID(),
      }));

      this.saveLayout(layout);
      return layout;
    } catch (error) {
      console.error('Failed to import layout:', error);
      return null;
    }
  }
}

export const widgetService = new WidgetService();
