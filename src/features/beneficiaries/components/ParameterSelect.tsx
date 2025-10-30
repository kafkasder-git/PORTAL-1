'use client';

import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { parametersApi } from '@/shared/lib/api';
import type { ParameterCategory } from '@/entities/collections';

interface ParameterSelectProps<T = string> {
  category: ParameterCategory;
  value?: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ParameterSelect<T = string>({
  category,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Seçiniz...'
}: ParameterSelectProps<T>) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['parameters', category],
    queryFn: async () => {
      return await parametersApi.getParametersByCategory(category);
    },
    enabled: !!category,
  });

  const parameters = response?.data || [];

  return (
    <div className="space-y-2">
      <Label htmlFor={`parameter-${category}`}>
        {/* TODO: Add proper label based on category */}
        {category.replace('_', ' ').toUpperCase()}
      </Label>
      <Select 
        value={String(value || '')} 
        onValueChange={(val) => onChange(val as T)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id={`parameter-${category}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Yükleniyor...</span>
            </div>
          ) : (
            parameters?.map((param: any) => (
              <SelectItem key={param.$id} value={param.value}>
                {param.name_tr || param.value}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
