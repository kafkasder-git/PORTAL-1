/**
 * Global Search Component
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { globalSearch, type SearchEntityType, type SearchResult } from '@/shared/lib/services/search.service';
import { Input } from './input';
import { Button } from './button';
import { Card, CardContent } from './card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from './badge';
import { cn } from '@/shared/lib/utils';

const ENTITY_LABELS: Record<SearchEntityType, string> = {
  beneficiaries: 'İhtiyaç Sahipleri',
  donations: 'Bağışlar',
  tasks: 'Görevler',
  meetings: 'Toplantılar',
  aid_applications: 'Yardım Başvuruları',
  users: 'Kullanıcılar'
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Record<SearchEntityType, SearchResult[]>>({} as any);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search when query changes
  useEffect(() => {
    if (query.length < 2) {
      setResults({} as any);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await globalSearch(query, { limit: 5 });
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    addToRecentSearches(query);
    setOpen(false);

    // Navigate to entity detail page
    router.push(`/${result.entity}/${result.id}`);
  };

  const addToRecentSearches = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="text-muted-foreground">Ara...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="İhtiyaç sahibi, bağış, görev ara..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleKeyDown}
          />

          <CommandList>
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aranıyor...
              </div>
            )}

            {!isLoading && query.length < 2 && (
              <>
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Son Aramalar">
                    {recentSearches.map((search, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => {
                          setQuery(search);
                          addToRecentSearches(search);
                        }}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {search}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-4 w-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecentSearches(prev => prev.filter(s => s !== search));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </CommandItem>
                    ))}
                    <CommandItem onSelect={clearRecentSearches}>
                      <X className="mr-2 h-4 w-4" />
                      Son aramaları temizle
                    </CommandItem>
                  </CommandGroup>
                )}

                <CommandGroup heading="Popüler Aramalar">
                  <CommandItem onSelect={() => setQuery('aktif ihtiyaç sahipleri')}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Aktif ihtiyaç sahipleri
                  </CommandItem>
                  <CommandItem onSelect={() => setQuery('tamamlanan görevler')}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Tamamlanan görevler
                  </CommandItem>
                  <CommandItem onSelect={() => setQuery('yaklaşan toplantılar')}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Yaklaşan toplantılar
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {!isLoading && query.length >= 2 && Object.keys(results).length === 0 && (
              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
            )}

            {Object.entries(results).map(([entity, entityResults]) => (
              entityResults.length > 0 && (
                <CommandGroup key={entity} heading={ENTITY_LABELS[entity as SearchEntityType]}>
                  {entityResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {ENTITY_LABELS[result.entity]}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            ))}

            {Object.values(results).some(results => results.length > 0) && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    const params = new URLSearchParams({ q: query });
                    router.push(`/search?${params.toString()}`);
                    setOpen(false);
                  }}
                  className="text-primary"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Tüm sonuçları görüntüle
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
