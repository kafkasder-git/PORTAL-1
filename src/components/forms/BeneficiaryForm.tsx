'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { FormFieldGroup } from '@/components/ui/form-field-group';

// Validation schema
const beneficiarySchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  tc_no: z.string().length(11, 'TC Kimlik numarası 11 haneli olmalıdır'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  city: z.string().min(2, 'Şehir adı girin'),
  district: z.string().min(2, 'İlçe adı girin'),
  neighborhood: z.string().min(2, 'Mahalle adı girin'),
  income_level: z.enum(['0-3000', '3000-5000', '5000-8000', '8000+']),
  family_size: z.number().min(1, 'Aile büyüklüğü en az 1 olmalıdır'),
  health_status: z.string().optional(),
  employment_status: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived'])
});

type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;

interface BeneficiaryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BeneficiaryForm({ onSuccess, onCancel }: BeneficiaryFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      family_size: 1,
      income_level: '0-3000',
      status: 'active',
    },
  });

  const createBeneficiaryMutation = useMutation({
    mutationFn: (data: BeneficiaryFormData) => {
      // Map status values to Turkish
      const statusMap = {
        'active': 'AKTIF',
        'inactive': 'PASIF',
        'archived': 'SILINDI'
      } as const;
      
      return api.beneficiaries.createBeneficiary({
        ...data,
        status: statusMap[data.status] || 'AKTIF'
      }) as Promise<any>;
    },
    onSuccess: () => {
      toast.success('İhtiyaç sahibi başarıyla eklendi');
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error('İhtiyaç sahibi eklenirken hata oluştu: ' + error.message);
    },
  });

  const onSubmit = async (data: BeneficiaryFormData) => {
    setIsSubmitting(true);
    try {
      await createBeneficiaryMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni İhtiyaç Sahibi Ekle</CardTitle>
        <CardDescription>
          İhtiyaç sahibi bilgilerini girerek yeni kayıt oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Kişisel Bilgiler */}
          <FormFieldGroup title="Kişisel Bilgiler" description="Temel kimlik ve iletişim bilgileri">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Ad Soyad <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  {...register('name')}
                  placeholder="Ahmet Yılmaz"
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tc_no">
                  TC Kimlik No <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="tc_no"
                  aria-invalid={!!errors.tc_no}
                  aria-describedby={errors.tc_no ? 'tc-error' : undefined}
                  {...register('tc_no')}
                  placeholder="12345678901"
                  maxLength={11}
                />
                {errors.tc_no && (
                  <p id="tc-error" className="text-sm text-red-600">{errors.tc_no.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefon <span className="text-red-600">*</span>
              </Label>
              <Input
                id="phone"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                {...register('phone')}
                placeholder="0555 123 45 67"
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </FormFieldGroup>

          {/* Adres Bilgileri */}
          <FormFieldGroup title="Adres Bilgileri" description="İkamet adresi detayları">
            <div className="space-y-2">
              <Label htmlFor="address">
                Adres <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="address"
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? 'address-error' : undefined}
                {...register('address')}
                placeholder="Mahalle, Cadde, Sokak, No"
                rows={3}
              />
              {errors.address && (
                <p id="address-error" className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  Şehir <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="city"
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? 'city-error' : undefined}
                  {...register('city')}
                  placeholder="İstanbul"
                />
                {errors.city && (
                  <p id="city-error" className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">
                  İlçe <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="district"
                  aria-invalid={!!errors.district}
                  aria-describedby={errors.district ? 'district-error' : undefined}
                  {...register('district')}
                  placeholder="Kadıköy"
                />
                {errors.district && (
                  <p id="district-error" className="text-sm text-red-600">{errors.district.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">
                  Mahalle <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="neighborhood"
                  aria-invalid={!!errors.neighborhood}
                  aria-describedby={errors.neighborhood ? 'neighborhood-error' : undefined}
                  {...register('neighborhood')}
                  placeholder="Caferağa"
                />
                {errors.neighborhood && (
                  <p id="neighborhood-error" className="text-sm text-red-600">{errors.neighborhood.message}</p>
                )}
              </div>
            </div>
          </FormFieldGroup>

          {/* Ekonomik Bilgiler */}
          <FormFieldGroup title="Ekonomik Bilgiler" description="Gelir ve istihdam durumuna ait bilgiler">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income_level">
                  Gelir Düzeyi <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={watch('income_level')}
                  onValueChange={(value) => setValue('income_level', value as any)}
                >
                  <SelectTrigger aria-invalid={!!errors.income_level}>
                    <SelectValue placeholder="Gelir düzeyi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3000">0-3.000 ₺</SelectItem>
                    <SelectItem value="3000-5000">3.000-5.000 ₺</SelectItem>
                    <SelectItem value="5000-8000">5.000-8.000 ₺</SelectItem>
                    <SelectItem value="8000+">8.000 ₺+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.income_level && (
                  <p className="text-sm text-red-600">{errors.income_level.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_size">
                  Aile Büyüklüğü <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="family_size"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.family_size}
                  aria-describedby={errors.family_size ? 'family-size-error' : undefined}
                  {...register('family_size', { valueAsNumber: true })}
                />
                {errors.family_size && (
                  <p id="family-size-error" className="text-sm text-red-600">{errors.family_size.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_status">İstihdam Durumu</Label>
              <Input
                id="employment_status"
                aria-invalid={!!errors.employment_status}
                aria-describedby={errors.employment_status ? 'employment-error' : undefined}
                {...register('employment_status')}
                placeholder="Öğrenci, İşsiz, Çalışıyor..."
              />
              {errors.employment_status && (
                <p id="employment-error" className="text-sm text-red-600">{errors.employment_status.message}</p>
              )}
            </div>
          </FormFieldGroup>

          {/* Sağlık Bilgileri */}
          <FormFieldGroup title="Sağlık Bilgileri" description="Genel sağlık durumu ve notlar">
            <div className="space-y-2">
              <Label htmlFor="health_status">Genel Sağlık Durumu</Label>
              <Textarea
                id="health_status"
                aria-invalid={!!errors.health_status}
                aria-describedby={errors.health_status ? 'health-error' : undefined}
                {...register('health_status')}
                placeholder="Hastalıklar, engellilik durumu vb."
                rows={3}
              />
              {errors.health_status && (
                <p id="health-error" className="text-sm text-red-600">{errors.health_status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                aria-invalid={!!errors.notes}
                aria-describedby={errors.notes ? 'notes-error' : undefined}
                {...register('notes')}
                placeholder="Ek bilgiler, özel durumlar..."
                rows={3}
              />
              {errors.notes && (
                <p id="notes-error" className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Durum</Label>
              <RadioGroup
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'archived')}
                className="flex flex-row space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Aktif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">Pasif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="archived" id="archived" />
                  <Label htmlFor="archived">Arşivlenmiş</Label>
                </div>
              </RadioGroup>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </FormFieldGroup>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'İhtiyaç Sahibi Ekle'
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                İptal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}