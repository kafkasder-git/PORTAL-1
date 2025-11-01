'use client';

import { ReactNode } from 'react';
import { Card } from '@/shared/components/ui/card';

export interface ResponsiveColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
  hidden?: boolean;
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
}

/**
 * Desktop table component - Traditional table layout only
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
      {/* Desktop Table */}
      <div className="block overflow-x-auto">
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
                className={`border-b hover:bg-primary/5 transition-colors cursor-pointer ${
                  index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                }`}
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
