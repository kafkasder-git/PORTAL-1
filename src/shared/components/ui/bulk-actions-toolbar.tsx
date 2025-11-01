/**
 * Bulk Actions Toolbar Component
 * Displays selected items and available actions
 */

'use client';

import { useState } from 'react';
import { Trash2, Download, Archive, UserCheck, UserX, UserPlus, Tag, MoreHorizontal } from 'lucide-react';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { BulkAction, EntityType, bulkOperationsService } from '@/shared/lib/services/bulk-operations.service';
import { toast } from 'sonner';

interface BulkActionsToolbarProps {
  entityType: EntityType;
  selectedIds: string[];
  totalCount: number;
  onOperationComplete?: () => void;
  onCancel?: () => void;
}

const ACTION_CONFIG = {
  delete: {
    label: 'Sil',
    icon: Trash2,
    variant: 'destructive' as const,
    color: 'text-red-600',
  },
  export: {
    label: 'Dışa Aktar',
    icon: Download,
    variant: 'default' as const,
    color: 'text-blue-600',
  },
  archive: {
    label: 'Arşivle',
    icon: Archive,
    variant: 'default' as const,
    color: 'text-gray-600',
  },
  activate: {
    label: 'Aktifleştir',
    icon: UserCheck,
    variant: 'default' as const,
    color: 'text-green-600',
  },
  deactivate: {
    label: 'Devre Dışı Bırak',
    icon: UserX,
    variant: 'default' as const,
    color: 'text-yellow-600',
  },
  assign: {
    label: 'Ata',
    icon: UserPlus,
    variant: 'default' as const,
    color: 'text-purple-600',
  },
  tag: {
    label: 'Etiketle',
    icon: Tag,
    variant: 'default' as const,
    color: 'text-indigo-600',
  },
};

export function BulkActionsToolbar({
  entityType,
  selectedIds,
  totalCount,
  onOperationComplete,
  onCancel,
}: BulkActionsToolbarProps) {
  const [isOperating, setIsOperating] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  const handleBulkAction = async (action: BulkAction) => {
    setIsOperating(true);

    try {
      const operation = await bulkOperationsService.createOperation(
        entityType,
        action,
        selectedIds
      );

      toast.success(`Toplu işlem başlatıldı: ${selectedIds.length} öğe işlenecek`);

      // Listen for operation completion
      const unsubscribe = bulkOperationsService.subscribe((op) => {
        if (op.id === operation.id && (op.status === 'completed' || op.status === 'failed')) {
          unsubscribe();

          if (op.status === 'completed') {
            const successMsg = op.failed > 0
              ? `${op.succeeded} başarılı, ${op.failed} başarısız`
              : `${op.succeeded} öğe başarıyla işlendi`;

            toast.success(successMsg);
          } else {
            toast.error('Toplu işlem başarısız oldu');
          }

          setIsOperating(false);
          onOperationComplete?.();
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Toplu işlem başlatılamadı');
      setIsOperating(false);
    }
  };

  const handleSelectAll = () => {
    // This would be handled by the parent component
    // Emitting a custom event or calling a prop function
    const event = new CustomEvent('select-all', { detail: { select: true } });
    window.dispatchEvent(event);
  };

  const handleClearSelection = () => {
    const event = new CustomEvent('select-all', { detail: { select: false } });
    window.dispatchEvent(event);
    onCancel?.();
  };

  const availableActions: BulkAction[] = [];

  // Determine available actions based on entity type
  switch (entityType) {
    case 'beneficiary':
      availableActions.push('delete', 'update', 'export', 'archive', 'assign', 'tag');
      break;
    case 'donation':
      availableActions.push('delete', 'update', 'export', 'archive');
      break;
    case 'aid-application':
      availableActions.push('delete', 'update', 'export', 'archive', 'activate', 'deactivate');
      break;
    case 'task':
      availableActions.push('delete', 'update', 'export', 'archive', 'assign');
      break;
    case 'user':
      availableActions.push('delete', 'update', 'export', 'activate', 'deactivate');
      break;
    default:
      availableActions.push('delete', 'update', 'export');
  }

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Selection Info */}
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedIds.length === totalCount}
            onCheckedChange={(checked) => {
              if (checked) {
                handleSelectAll();
              } else {
                handleClearSelection();
              }
            }}
          />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedIds.length} / {totalCount} seçili
            </span>

            <Badge variant="secondary">
              {selectedIds.length === totalCount ? 'Tümü seçili' : `${selectedIds.length} öğe`}
            </Badge>
          </div>

          {isOperating && (
            <Badge variant="default" className="animate-pulse">
              İşleniyor...
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          {availableActions.slice(0, 3).map((action) => {
            const config = ACTION_CONFIG[action];
            const Icon = config.icon;

            return (
              <Button
                key={action}
                variant={config.variant}
                size="sm"
                onClick={() => handleBulkAction(action)}
                disabled={isOperating}
                className={config.color}
              >
                <Icon className="h-4 w-4 mr-2" />
                {config.label}
              </Button>
            );
          })}

          {/* More Actions */}
          {availableActions.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isOperating}>
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Daha fazla
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableActions.slice(3).map((action) => {
                  const config = ACTION_CONFIG[action];
                  const Icon = config.icon;

                  return (
                    <DropdownMenuItem
                      key={action}
                      onClick={() => handleBulkAction(action)}
                      className={config.color}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {config.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClearSelection}>
                  Seçimi Temizle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Cancel Button */}
          <Button variant="ghost" size="sm" onClick={handleClearSelection} disabled={isOperating}>
            İptal
          </Button>
        </div>
      </div>

      {/* Progress Info */}
      {isOperating && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Toplu işlem devam ediyor. Lütfen bekleyin...
        </div>
      )}
    </div>
  );
}

/**
 * Bulk Select All Checkbox Component
 */
interface BulkSelectAllProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  totalCount: number;
  selectedCount: number;
}

export function BulkSelectAll({
  checked,
  indeterminate,
  onChange,
  totalCount,
  selectedCount,
}: BulkSelectAllProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate || false;
        }}
        onCheckedChange={onChange}
      />
      <span className="text-sm">
        {checked ? 'Tümünü seç' : 'Hiçbirini seçme'}
      </span>
      <span className="text-xs text-gray-500">
        ({selectedCount} / {totalCount})
      </span>
    </div>
  );
}
