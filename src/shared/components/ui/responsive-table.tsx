'use client';

import { ReactNode } from 'react';
import { Card } from '@/shared/components/ui/card';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface ResponsiveColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
  hidden?: boolean;
  mobileLabel?: string;
  mobileRender?: (row: Record<string, unknown>) => ReactNode;
}

interface ResponsiveTableProps {
  columns: ResponsiveColumn[];
  data: Record<string, unknown>[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  rowKey: string;
  onRowClick?: (row: Record<string, unknown>) => void;
  actions?: (row: Record<string, unknown>) => ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
}

/**
 * Fully responsive table with mobile card view
 */
export function ResponsiveTable({
  columns,
  data,
  isLoading,
  isEmpty,
  emptyMessage = 'Veri bulunamadı',
  rowKey,
  onRowClick,
  actions,
  searchable = true,
  searchPlaceholder = 'Ara...',
}: ResponsiveTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isEmpty || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Search Bar */}
      {searchable && (
        <div className="md:hidden relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns
                .filter((col) => !col.hidden)
                .map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-sm font-medium text-gray-700 ${col.width || ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              {actions && <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksiyon</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={String(row[rowKey])}
                className={cn(
                  'border-b hover:bg-primary/5 transition-colors',
                  onRowClick && 'cursor-pointer',
                  index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns
                  .filter((col) => !col.hidden)
                  .map((col) => (
                    <td key={`${String(row[rowKey])}-${col.key}`} className="px-4 py-3 text-sm text-gray-900">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] || '-')}
                    </td>
                  ))}
                {actions && <td className="px-4 py-3 text-sm">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => (
          <div
            key={String(row[rowKey])}
            className={cn(
              'bg-white border border-gray-200 rounded-lg p-4 shadow-sm',
              onRowClick && 'cursor-pointer hover:shadow-md active:shadow-sm transition-shadow'
            )}
            onClick={() => onRowClick?.(row)}
          >
            {columns.some((col) => col.mobileRender) ? (
              // Use custom mobile renderer if available
              columns
                .filter((col) => col.mobileRender)
                .map((col) => (
                  <div key={col.key} className="mb-3 last:mb-0">
                    {col.mobileRender!(row)}
                  </div>
                ))
            ) : (
              // Default mobile layout - show first 3 columns with labels
              <div className="space-y-2">
                {columns.slice(0, 3).map((col) => (
                  <div key={col.key} className="flex items-start justify-between">
                    <span className="text-xs font-medium text-gray-500 w-1/3">
                      {col.mobileLabel || col.label}
                    </span>
                    <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] || '-')}
                    </span>
                  </div>
                ))}
                {columns.length > 3 && (
                  <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                    Daha fazla bilgi görmek için dokunun
                  </div>
                )}
              </div>
            )}
            {actions && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {actions(row)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Desktop grid list for larger items
 */
interface ResponsiveGridProps {
  data: Record<string, unknown>[];
  renderCard: (item: Record<string, unknown>) => ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  itemsPerRow?: number;
}

export function ResponsiveGrid({
  data,
  renderCard,
  isLoading,
  isEmpty,
  emptyMessage = 'Veri bulunamadı',
  itemsPerRow = 3,
}: ResponsiveGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isEmpty || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 grid-cols-${itemsPerRow}`}>
      {data.map((item, index) => (
        <div key={`item-${index}`}>{renderCard(item)}</div>
      ))}
    </div>
  );
}
