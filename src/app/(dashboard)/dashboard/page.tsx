/**
 * Customizable Dashboard Page
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Layout, Download, Upload, Settings } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ThemeToggleCompact } from '@/shared/components/ui/theme-toggle';
import { WidgetRenderer } from '@/features/dashboard/components/WidgetRenderer';
import { widgetService, type WidgetConfig, type DashboardLayout } from '@/shared/lib/services/widget.service';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  useEffect(() => {
    loadLayout();
  }, []);

  const loadLayout = () => {
    setLoading(true);
    const userId = 'current-user'; // In production, get from auth
    const existingLayout = widgetService.getLayout(userId);

    if (existingLayout) {
      setLayout(existingLayout);
    } else {
      const newLayout = widgetService.createDefaultLayout(userId);
      setLayout(newLayout);
    }

    setLoading(false);
  };

  const handleAddWidget = (widget: WidgetConfig) => {
    if (!layout) return;

    widgetService.addWidget(layout.id, widget);
    const updatedLayout = widgetService.getLayout(layout.id);
    setLayout(updatedLayout);
    setShowWidgetPicker(false);
    toast.success('Widget eklendi');
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!layout) return;

    widgetService.deleteWidget(layout.id, widgetId);
    const updatedLayout = widgetService.getLayout(layout.id);
    setLayout(updatedLayout);
    toast.success('Widget silindi');
  };

  const handleRefreshWidget = async (widgetId: string) => {
    // Widget will auto-refresh when data is requested
    toast.success('Widget yenilendi');
  };

  const handleExportLayout = () => {
    if (!layout) return;

    const exported = widgetService.exportLayout(layout.id);
    if (exported) {
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${layout.name.replace(/\s+/g, '-').toLowerCase()}-dashboard.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Dashboard düzeni dışa aktarıldı');
    }
  };

  const handleImportLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const importedLayout = widgetService.importLayout(content);

      if (importedLayout) {
        setLayout(importedLayout);
        toast.success('Dashboard düzeni içe aktarıldı');
      } else {
        toast.error('Dashboard düzeni içe aktarılamadı');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  const getSizeClasses = (size: WidgetConfig['size']) => {
    switch (size) {
      case 'small':
        return 'col-span-12 md:col-span-6 lg:col-span-3';
      case 'medium':
        return 'col-span-12 md:col-span-6 lg:col-span-4';
      case 'large':
        return 'col-span-12 md:col-span-12 lg:col-span-8';
      case 'full':
        return 'col-span-12';
      default:
        return 'col-span-12 md:col-span-6 lg:col-span-4';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Dashboard Yüklenemedi</h2>
          <Button onClick={loadLayout}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Özelleştirilebilir widget'lar ile istediğiniz verileri görüntüleyin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowWidgetPicker(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Widget Ekle
          </Button>
          <Button variant="outline" onClick={handleExportLayout}>
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImportLayout}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                İçe Aktar
              </span>
            </Button>
          </label>
          <Button variant="outline">
            <Layout className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <ThemeToggleCompact />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Toplam Widget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{layout.widgets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Görünür Widget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {layout.widgets.filter(w => w.isVisible).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Chart Widget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {layout.widgets.filter(w => w.type === 'chart').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">
              Liste Widget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {layout.widgets.filter(w => w.type === 'list' || w.type === 'table').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Grid */}
      {layout.widgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layout className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dashboard boş</h3>
            <p className="text-gray-500 mb-4 text-center max-w-md">
              Dashboard'unuza widget ekleyerek verilerinizi görüntülemeye başlayın
            </p>
            <Button onClick={() => setShowWidgetPicker(true)}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Widget'inizi Ekleyin
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {layout.widgets
            .filter(widget => widget.isVisible)
            .map(widget => (
              <WidgetRenderer
                key={widget.id}
                widget={widget}
                onDelete={() => handleDeleteWidget(widget.id)}
                onRefresh={() => handleRefreshWidget(widget.id)}
              />
            ))}
        </div>
      )}

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <WidgetPickerModal
          onClose={() => setShowWidgetPicker(false)}
          onSelect={handleAddWidget}
        />
      )}
    </div>
  );
}

/**
 * Widget Picker Modal Component
 */
interface WidgetPickerModalProps {
  onClose: () => void;
  onSelect: (widget: WidgetConfig) => void;
}

function WidgetPickerModal({ onClose, onSelect }: WidgetPickerModalProps) {
  const templates = widgetService.getTemplates();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Widget Seçin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  const widget = widgetService.createWidget(template);
                  onSelect(widget);
                }}
              >
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      {template.type}
                    </span>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
