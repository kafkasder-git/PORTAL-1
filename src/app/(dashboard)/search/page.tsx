/**
 * Advanced Search Page
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Download, Loader2 } from 'lucide-react';
import { search, type SearchOptions, type SearchResult, type SearchEntityType } from '@/shared/lib/services/search.service';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

const ENTITY_LABELS: Record<SearchEntityType, string> = {
  beneficiaries: 'İhtiyaç Sahipleri',
  donations: 'Bağışlar',
  tasks: 'Görevler',
  meetings: 'Toplantılar',
  aid_applications: 'Yardım Başvuruları',
  users: 'Kullanıcılar'
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [entity, setEntity] = useState<SearchEntityType>('beneficiaries');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    priority: ''
  });

  // Perform search when query or filters change
  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setTotal(0);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await search({
          entity,
          query,
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          ),
          page: 1,
          limit: 50
        });
        setResults(response.results);
        setTotal(response.total);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, entity, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      category: '',
      priority: ''
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gelişmiş Arama</h1>
        <p className="text-gray-500 mt-2">
          İhtiyaç sahipleri, bağışlar, görevler ve daha fazlasında arama yapın
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Arama Kriterleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Entity Selection */}
          <div className="space-y-2">
            <Label>Arama Yapılacak Alan</Label>
            <Select value={entity} onValueChange={(value) => setEntity(value as SearchEntityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ENTITY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Query */}
          <div className="space-y-2">
            <Label>Arama Terimi</Label>
            <Input
              placeholder="Arama teriminizi girin..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="general">Genel</SelectItem>
                  <SelectItem value="committee">Komite</SelectItem>
                  <SelectItem value="board">Yönetim Kurulu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Arama Sonuçları</CardTitle>
              <CardDescription>
                {isLoading ? 'Aranıyor...' : `${total} sonuç bulundu`}
              </CardDescription>
            </div>
            {results.length > 0 && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Sonuçları İndir
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {query.length === 0 ? (
                <p>Arama yapmak için yukarıdaki alanları doldurun</p>
              ) : (
                <p>Arama kriterlerinize uygun sonuç bulunamadı</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{result.title}</h3>
                        <Badge variant="outline">
                          {ENTITY_LABELS[result.entity]}
                        </Badge>
                      </div>
                      {result.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Oluşturulma: {new Date(result.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                        <span>
                          ID: {result.id.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to detail page
                        window.location.href = `/${result.entity}/${result.id}`;
                      }}
                    >
                      Görüntüle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
