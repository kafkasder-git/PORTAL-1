'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Users, Wallet, Heart, GraduationCap, HandHeart, UserCheck } from 'lucide-react';
import { ParameterSelect } from './ParameterSelect';

// Comprehensive validation schema (Portal Plus style)
const advancedBeneficiarySchema = z.object({
  // Kişisel Bilgiler
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  tc_no: z.string().length(11, 'TC Kimlik numarası 11 haneli olmalıdır'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  email: z.string().email('Geçerli bir e-posta adresi girin').optional().or(z.literal('')),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  marital_status: z.string().optional(),

  // Adres Bilgileri
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  city: z.string().min(2, 'Şehir adı girin'),
  district: z.string().min(2, 'İlçe adı girin'),
  neighborhood: z.string().min(2, 'Mahalle adı girin'),

  // Aile Bilgileri
  family_size: z.number().min(1, 'Aile büyüklüğü en az 1 olmalıdır'),
  children_count: z.number().min(0).optional(),
  orphan_children_count: z.number().min(0).optional(),
  elderly_count: z.number().min(0).optional(),
  disabled_count: z.number().min(0).optional(),

  // Ekonomik Durum
  income_level: z.string().optional(),
  income_source: z.string().optional(),
  has_debt: z.boolean().optional(),
  housing_type: z.string().optional(),
  has_vehicle: z.boolean().optional(),

  // Sağlık Bilgileri
  health_status: z.string().optional(),
  has_chronic_illness: z.boolean().optional(),
  chronic_illness_detail: z.string().optional(),
  has_disability: z.boolean().optional(),
  disability_detail: z.string().optional(),
  has_health_insurance: z.boolean().optional(),
  regular_medication: z.string().optional(),

  // Eğitim ve İstihdam
  education_level: z.string().optional(),
  occupation: z.string().optional(),
  employment_status: z.string().optional(),

  // Yardım Talebi
  aid_type: z.string().optional(),
  aid_amount: z.number().min(0).optional(),
  aid_duration: z.string().optional(),
  priority: z.string().optional(),

  // Referans Bilgileri
  reference_name: z.string().optional(),
  reference_phone: z.string().optional(),
  reference_relation: z.string().optional(),
  application_source: z.string().optional(),

  // Ek Bilgiler
  notes: z.string().optional(),
  previous_aid: z.boolean().optional(),
  other_organization_aid: z.boolean().optional(),
  emergency: z.boolean().optional(),
  contact_preference: z.string().optional(),
});

type AdvancedBeneficiaryFormData = z.infer<typeof advancedBeneficiarySchema>;

interface AdvancedBeneficiaryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<AdvancedBeneficiaryFormData>;
}

export function AdvancedBeneficiaryForm({ onSuccess, onCancel, initialData }: AdvancedBeneficiaryFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdvancedBeneficiaryFormData>({
    resolver: zodResolver(advancedBeneficiarySchema),
    defaultValues: {
      family_size: 1,
      children_count: 0,
      orphan_children_count: 0,
      elderly_count: 0,
      disabled_count: 0,
      has_debt: false,
      has_vehicle: false,
      has_chronic_illness: false,
      has_disability: false,
      has_health_insurance: false,
      previous_aid: false,
      other_organization_aid: false,
      emergency: false,
      ...initialData,
    },
  });

  const createBeneficiaryMutation = useMutation({
    mutationFn: (data: any) =>
      api.beneficiaries.createBeneficiary({
        ...data,
        status: 'active',
        approval_status: 'pending',
      }),
    onSuccess: () => {
      toast.success('İhtiyaç sahibi başarıyla eklendi');
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error('İhtiyaç sahibi eklenirken hata oluştu: ' + error.message);
    },
  });

  const onSubmit = async (data: AdvancedBeneficiaryFormData) => {
    setIsSubmitting(true);
    try {
      await createBeneficiaryMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni İhtiyaç Sahibi Ekle</CardTitle>
        <CardDescription>
          Portal Plus tarzı kapsamlı kayıt formu - Tüm bilgileri girerek yeni kayıt oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="personal" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Kişisel</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Adres</span>
              </TabsTrigger>
              <TabsTrigger value="family" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Aile</span>
              </TabsTrigger>
              <TabsTrigger value="economic" className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Ekonomik</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Sağlık</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Eğitim</span>
              </TabsTrigger>
              <TabsTrigger value="aid" className="flex items-center gap-1">
                <HandHeart className="h-4 w-4" />
                <span className="hidden sm:inline">Yardım</span>
              </TabsTrigger>
              <TabsTrigger value="reference" className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Referans</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Kişisel Bilgiler */}
            <TabsContent value="personal" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ahmet Yılmaz"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tc_no">TC Kimlik No *</Label>
                  <Input
                    id="tc_no"
                    {...register('tc_no')}
                    placeholder="12345678901"
                    maxLength={11}
                  />
                  {errors.tc_no && (
                    <p className="text-sm text-red-600">{errors.tc_no.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="0555 123 45 67"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="ornek@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Doğum Tarihi</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    {...register('birth_date')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Uyruk</Label>
                  <Input
                    id="nationality"
                    {...register('nationality')}
                    placeholder="Türkiye"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ParameterSelect
                  category="gender"
                  value={watch('gender')}
                  onChange={(value) => setValue('gender', value)}
                  label="Cinsiyet"
                  error={errors.gender?.message}
                />

                <ParameterSelect
                  category="religion"
                  value={watch('religion')}
                  onChange={(value) => setValue('religion', value)}
                  label="İnanç"
                  error={errors.religion?.message}
                />

                <ParameterSelect
                  category="marital_status"
                  value={watch('marital_status')}
                  onChange={(value) => setValue('marital_status', value)}
                  label="Medeni Durum"
                  error={errors.marital_status?.message}
                />
              </div>
            </TabsContent>

            {/* TAB 2: Adres Bilgileri */}
            <TabsContent value="address" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Adres Bilgileri</h3>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address">Adres *</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Mahalle, Cadde, Sokak, Bina No, Daire"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir *</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="İstanbul"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">İlçe *</Label>
                  <Input
                    id="district"
                    {...register('district')}
                    placeholder="Başakşehir"
                  />
                  {errors.district && (
                    <p className="text-sm text-red-600">{errors.district.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Mahalle *</Label>
                  <Input
                    id="neighborhood"
                    {...register('neighborhood')}
                    placeholder="Kayaşehir"
                  />
                  {errors.neighborhood && (
                    <p className="text-sm text-red-600">{errors.neighborhood.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Aile Bilgileri */}
            <TabsContent value="family" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Aile Bilgileri</h3>
              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="family_size">Toplam Aile Büyüklüğü *</Label>
                  <Input
                    id="family_size"
                    type="number"
                    min={1}
                    {...register('family_size', { valueAsNumber: true })}
                  />
                  {errors.family_size && (
                    <p className="text-sm text-red-600">{errors.family_size.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children_count">Çocuk Sayısı</Label>
                  <Input
                    id="children_count"
                    type="number"
                    min={0}
                    {...register('children_count', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orphan_children_count">Yetim Çocuk Sayısı</Label>
                  <Input
                    id="orphan_children_count"
                    type="number"
                    min={0}
                    {...register('orphan_children_count', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elderly_count">Yaşlı Sayısı (65+)</Label>
                  <Input
                    id="elderly_count"
                    type="number"
                    min={0}
                    {...register('elderly_count', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disabled_count">Engelli Sayısı</Label>
                  <Input
                    id="disabled_count"
                    type="number"
                    min={0}
                    {...register('disabled_count', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: Ekonomik Durum */}
            <TabsContent value="economic" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Ekonomik Durum</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ParameterSelect
                  category="income_level"
                  value={watch('income_level')}
                  onChange={(value) => setValue('income_level', value)}
                  label="Gelir Düzeyi"
                  error={errors.income_level?.message}
                />

                <div className="space-y-2">
                  <Label htmlFor="income_source">Gelir Kaynağı</Label>
                  <Input
                    id="income_source"
                    {...register('income_source')}
                    placeholder="Maaş, Emekli Maaşı, Yardım..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ParameterSelect
                  category="housing_type"
                  value={watch('housing_type')}
                  onChange={(value) => setValue('housing_type', value)}
                  label="Konut Durumu"
                  error={errors.housing_type?.message}
                />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_debt"
                      checked={watch('has_debt')}
                      onCheckedChange={(checked) => setValue('has_debt', checked as boolean)}
                    />
                    <Label htmlFor="has_debt" className="cursor-pointer">Borcu var</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_vehicle"
                      checked={watch('has_vehicle')}
                      onCheckedChange={(checked) => setValue('has_vehicle', checked as boolean)}
                    />
                    <Label htmlFor="has_vehicle" className="cursor-pointer">Aracı var</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: Sağlık Bilgileri */}
            <TabsContent value="health" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Sağlık Bilgileri</h3>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="health_status">Genel Sağlık Durumu</Label>
                <Textarea
                  id="health_status"
                  {...register('health_status')}
                  placeholder="Sağlık durumu hakkında genel bilgi..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_chronic_illness"
                      checked={watch('has_chronic_illness')}
                      onCheckedChange={(checked) => setValue('has_chronic_illness', checked as boolean)}
                    />
                    <Label htmlFor="has_chronic_illness" className="cursor-pointer">
                      Kronik hastalığı var
                    </Label>
                  </div>

                  {watch('has_chronic_illness') && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="chronic_illness_detail">Hastalık Detayı</Label>
                      <Textarea
                        id="chronic_illness_detail"
                        {...register('chronic_illness_detail')}
                        placeholder="Hastalık detayları..."
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_disability"
                      checked={watch('has_disability')}
                      onCheckedChange={(checked) => setValue('has_disability', checked as boolean)}
                    />
                    <Label htmlFor="has_disability" className="cursor-pointer">
                      Engellilik durumu var
                    </Label>
                  </div>

                  {watch('has_disability') && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="disability_detail">Engellilik Detayı</Label>
                      <Textarea
                        id="disability_detail"
                        {...register('disability_detail')}
                        placeholder="Engellilik detayları..."
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_health_insurance"
                    checked={watch('has_health_insurance')}
                    onCheckedChange={(checked) => setValue('has_health_insurance', checked as boolean)}
                  />
                  <Label htmlFor="has_health_insurance" className="cursor-pointer">
                    Sağlık sigortası var
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regular_medication">Düzenli İlaç Kullanımı</Label>
                  <Input
                    id="regular_medication"
                    {...register('regular_medication')}
                    placeholder="Kullandığı ilaçlar..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 6: Eğitim ve İstihdam */}
            <TabsContent value="education" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Eğitim ve İstihdam</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ParameterSelect
                  category="education_level"
                  value={watch('education_level')}
                  onChange={(value) => setValue('education_level', value)}
                  label="Eğitim Düzeyi"
                  error={errors.education_level?.message}
                />

                <ParameterSelect
                  category="occupation"
                  value={watch('occupation')}
                  onChange={(value) => setValue('occupation', value)}
                  label="Meslek"
                  error={errors.occupation?.message}
                />

                <ParameterSelect
                  category="employment_status"
                  value={watch('employment_status')}
                  onChange={(value) => setValue('employment_status', value)}
                  label="İstihdam Durumu"
                  error={errors.employment_status?.message}
                />
              </div>
            </TabsContent>

            {/* TAB 7: Yardım Talebi */}
            <TabsContent value="aid" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Yardım Talebi</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aid_type">Yardım Türü</Label>
                  <Input
                    id="aid_type"
                    {...register('aid_type')}
                    placeholder="Nakdi, Gıda, Eğitim..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aid_amount">Talep Edilen Miktar (₺)</Label>
                  <Input
                    id="aid_amount"
                    type="number"
                    min={0}
                    step={0.01}
                    {...register('aid_amount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aid_duration">Yardım Süresi</Label>
                  <Input
                    id="aid_duration"
                    {...register('aid_duration')}
                    placeholder="Geçici, Sürekli..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Öncelik Durumu</Label>
                  <Input
                    id="priority"
                    {...register('priority')}
                    placeholder="Acil, Normal, Düşük"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={watch('emergency')}
                    onCheckedChange={(checked) => setValue('emergency', checked as boolean)}
                  />
                  <Label htmlFor="emergency" className="cursor-pointer text-red-600 font-medium">
                    Acil durum - Öncelikli yardım gerekiyor
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="previous_aid"
                    checked={watch('previous_aid')}
                    onCheckedChange={(checked) => setValue('previous_aid', checked as boolean)}
                  />
                  <Label htmlFor="previous_aid" className="cursor-pointer">
                    Daha önce yardım aldı
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="other_organization_aid"
                    checked={watch('other_organization_aid')}
                    onCheckedChange={(checked) => setValue('other_organization_aid', checked as boolean)}
                  />
                  <Label htmlFor="other_organization_aid" className="cursor-pointer">
                    Başka kuruluştan yardım alıyor
                  </Label>
                </div>
              </div>
            </TabsContent>

            {/* TAB 8: Referans Bilgileri */}
            <TabsContent value="reference" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Referans ve Ek Bilgiler</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference_name">Referans Kişi</Label>
                  <Input
                    id="reference_name"
                    {...register('reference_name')}
                    placeholder="Referans adı soyadı"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_phone">Referans Telefon</Label>
                  <Input
                    id="reference_phone"
                    {...register('reference_phone')}
                    placeholder="0555 123 45 67"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference_relation">Referans İlişkisi</Label>
                  <Input
                    id="reference_relation"
                    {...register('reference_relation')}
                    placeholder="Akraba, Komşu, Dost..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application_source">Başvuru Kaynağı</Label>
                  <Input
                    id="application_source"
                    {...register('application_source')}
                    placeholder="Nasıl duydu?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_preference">İletişim Tercihi</Label>
                <Input
                  id="contact_preference"
                  {...register('contact_preference')}
                  placeholder="SMS, E-posta, Telefon..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar ve Özel Durumlar</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Ek bilgiler, özel durumlar, önemli notlar..."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Separator />
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'İhtiyaç Sahibi Kaydet'
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
                size="lg"
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

