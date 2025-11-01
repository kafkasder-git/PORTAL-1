/**
 * Document List Component
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  File,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  Plus
} from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  Document,
  type DocumentCategory,
  type Document,
  getDocumentCategories,
  formatFileSize,
  isViewableFile,
  getFileExtension,
  type DocumentFilter
} from '@/shared/lib/services/document.service';
import { cn } from '@/shared/lib/utils';

interface DocumentListProps {
  documents?: Document[];
  onSelect?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onUploadClick?: () => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showActions?: boolean;
}

export function DocumentList({
  documents = [],
  onSelect,
  onDownload,
  onDelete,
  onEdit,
  onUploadClick,
  selectedIds = [],
  onSelectionChange,
  viewMode = 'list',
  onViewModeChange,
  showActions = true
}: DocumentListProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categories = getDocumentCategories();

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch =
        search === '' ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.originalName.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || doc.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'tr');
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSelectDocument = (id: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedIds.length === filteredDocuments.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredDocuments.map(d => d.id));
    }
  };

  const getCategoryLabel = (category: DocumentCategory) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colors: Record<DocumentCategory, string> = {
      certificate: 'bg-blue-100 text-blue-800',
      contract: 'bg-purple-100 text-purple-800',
      receipt: 'bg-green-100 text-green-800',
      identity: 'bg-orange-100 text-orange-800',
      medical: 'bg-red-100 text-red-800',
      education: 'bg-indigo-100 text-indigo-800',
      report: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Belge ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Tarih</SelectItem>
            <SelectItem value="name">İsim</SelectItem>
            <SelectItem value="size">Boyut</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex rounded-md border">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange?.('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange?.('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        {onUploadClick && (
          <Button onClick={onUploadClick}>
            <Plus className="h-4 w-4 mr-2" />
            Belge Ekle
          </Button>
        )}
      </div>

      {/* Select All */}
      {onSelectionChange && filteredDocuments.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedIds.length === filteredDocuments.length && filteredDocuments.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600">
            {selectedIds.length} belge seçili
          </span>
        </div>
      )}

      {/* Documents */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-12 w-12 mb-4 text-gray-400" />
            <p className="text-gray-500">Belge bulunamadı</p>
            {onUploadClick && (
              <Button className="mt-4" onClick={onUploadClick}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Belgeyi Yükle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredDocuments.map(document => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {onSelectionChange && (
                    <Checkbox
                      checked={selectedIds.includes(document.id)}
                      onCheckedChange={() => handleSelectDocument(document.id)}
                    />
                  )}

                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <File className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0" onClick={() => onSelect?.(document)}>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{document.name}</h3>
                      <Badge className={cn('text-xs', getCategoryColor(document.category))}>
                        {getCategoryLabel(document.category)}
                      </Badge>
                      {document.isConfidential && (
                        <Badge variant="destructive" className="text-xs">
                          Gizli
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatFileSize(document.size)}</span>
                      <span>
                        {format(new Date(document.uploadedAt), 'dd MMM yyyy', { locale: tr })}
                      </span>
                      <span className="text-xs uppercase">
                        .{getFileExtension(document.mimeType)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isViewableFile(document.mimeType) && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onSelect?.(document)}
                        title="Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDownload?.(document)}
                      title="İndir"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {showActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(document)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(document)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map(document => (
            <Card key={document.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <File className="h-8 w-8 text-gray-400" />
                    {onSelectionChange && (
                      <Checkbox
                        checked={selectedIds.includes(document.id)}
                        onCheckedChange={() => handleSelectDocument(document.id)}
                      />
                    )}
                  </div>
                  <Badge className={cn('text-xs', getCategoryColor(document.category))}>
                    {getCategoryLabel(document.category)}
                  </Badge>
                </div>

                <h3 className="font-medium truncate mb-2">{document.name}</h3>

                <div className="space-y-1 text-sm text-gray-500">
                  <div>{formatFileSize(document.size)}</div>
                  <div>
                    {format(new Date(document.uploadedAt), 'dd MMM yyyy', { locale: tr })}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {isViewableFile(document.mimeType) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelect?.(document)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Görüntüle
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload?.(document)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
