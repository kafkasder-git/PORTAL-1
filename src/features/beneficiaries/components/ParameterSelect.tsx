'use client';

import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { parametersApi } from '@/shared/lib/api';
import type { ParameterCategory } from '@/entities/collections';

// Category labels mapping - only include categories that exist in ParameterCategory type
const CATEGORY_LABELS: Record<ParameterCategory, string> = {
  gender: 'Cinsiyet',
  religion: 'İnanç',
  marital_status: 'Medeni Durum',
  employment_status: 'Çalışma Durumu',
  living_status: 'Yaşam Durumu',
  housing_type: 'Konut Türü',
  income_level: 'Gelir Düzeyi',
  guardian_relation: 'Vasi Yakınlık Derecesi',
  education_status: 'Eğitim Durumu',
  education_level: 'Eğitim Düzeyi',
  education_success: 'Eğitim Başarısı',
  death_reason: 'Vefat Nedeni',
  health_problem: 'Sağlık Sorunu',
  illness: 'Hastalık',
  treatment: 'Tedavi',
  special_condition: 'Özel Durum',
  occupation: 'Meslek',
  cancellation_reason: 'İptal Nedeni',
  document_type: 'Belge Türü',
  refund_reason: 'İade Nedeni',
  sponsorship_end_reason: 'Sponsorluk Bitirme Nedeni',
  sponsorship_continue: 'Sponsorluk Devam Etme',
  school_type: 'Okul Türü',
  school_institution_type: 'Okul Kurum Türü',
  orphan_assignment_correction: 'Yetim Atama Düzeltmeleri',
  orphan_detail: 'Yetim Detay',
};

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
        {CATEGORY_LABELS[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
