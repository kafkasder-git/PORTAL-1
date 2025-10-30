'use client';

import { useState } from 'react';

import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  emptyDescription?: string;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T, index: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyMessage = 'Kayıt bulunamadı',
  emptyDescription = 'Henüz kayıt eklenmemiş',
  pagination,
  searchable = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Ara...',
  className,
  striped = true,
  hoverable = true,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const effectiveSearchValue = searchValue ?? internalSearch;
  const handleSearchChange = onSearchChange ?? setInternalSearch;

  // Filter data if internal search is used
  const filteredData = searchable && !onSearchChange
    ? data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(effectiveSearchValue.toLowerCase())
        )
      )
    : data;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search & Info Bar */}
      {(searchable || pagination) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {searchable && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={effectiveSearchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {pagination && (
            <Badge variant="secondary" className="font-semibold">
              {pagination.total} Kayıt
            </Badge>
          )}
        </div>
      )}

      {/* Table Card */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Veriler yükleniyor...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <Search className="h-8 w-8 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Veri Yükleme Hatası</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error.message || 'Veriler yüklenirken bir hata oluştu'}
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-3 rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{emptyMessage}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {effectiveSearchValue ? 'Arama kriterlerinize uygun kayıt yok' : emptyDescription}
                </p>
              </div>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && !error && filteredData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    {columns.map((column) => (
                      <th
                      key={column.key}
                      className={cn(
                      'p-2 sm:p-3 lg:p-4 text-left text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider',
                      column.className
                      )}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                {filteredData.map((item, index) => (
                <tr
                key={item.id || item.$id || index}
                onClick={() => onRowClick?.(item, index)}
                className={cn(
                'border-b border-border/50 transition-all duration-200',
                striped && index % 2 === 0 && 'bg-muted/30',
                hoverable && 'hover:bg-accent/40 hover:shadow-sm cursor-pointer',
                onRowClick && 'cursor-pointer',
                rowClassName?.(item, index)
                )}
                >
                {columns.map((column) => (
                <td
                key={column.key}
                  className={cn(
                      'p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-foreground',
                    column.className
                )}
                >
                {column.render
                ? column.render(item, index)
                : String(item[column.key] ?? '-')}
                </td>
                ))}
                </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && !isLoading && !error && filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Sayfa {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              aria-label="İlk sayfa"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Önceki sayfa"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3">
              <Input
                type="number"
                min={1}
                max={pagination.totalPages}
                value={pagination.page}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= pagination.totalPages) {
                    pagination.onPageChange(page);
                  }
                }}
                className="w-16 text-center h-8"
              />
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Sonraki sayfa"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Son sayfa"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
