'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/api';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Users, Wallet, Heart, GraduationCap, HandHeart, UserCheck } from 'lucide-react';
import { ParameterSelect } from './ParameterSelect';

// Central validation schema
import { z as zod } from 'zod';
import {
  BeneficiaryCategory,
  FundRegion,
  FileConnection,
  IdentityDocumentType,
  PassportType,
  Gender,
  MaritalStatus,
  EducationStatus,
  Religion,
  BloodType,
  SmokingStatus,
  DisabilityStatus,
  SocialSecurityStatus,
  WorkStatus,
  LivingPlace,
  IncomeSource,
  Sector,
  JobGroup,
  VisaType,
  EntryType,
  ReturnInfo,
  BeneficiaryStatus,
  SponsorType,
  Country,
  City,
  Disease,
  Label as BeneficiaryLabel
} from '@/entities/beneficiary';

// Sanitization functions
import {
  sanitizeTcNo,
  sanitizePhone,
  sanitizeEmail,
  sanitizeObject,
  sanitizeNumber,
  sanitizeDate
} from '@/shared/lib/sanitization'

// Error handling
import { formatErrorMessage } from '@/shared/lib/errors'

// Create a completely fresh schema to avoid type conflicts
const advancedBeneficiarySchema = zod.object({
  // Temel Bilgiler
  id: zod.string().optional(),
  photo: zod.string().optional(),
  sponsorType: zod.nativeEnum(SponsorType).optional(),
  firstName: zod.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Ad sadece harf içerebilir'),
  lastName: zod.string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Soyad sadece harf içerebilir'),
  nationality: zod.string()
    .min(2, 'Uyruk en az 2 karakter olmalıdır')
    .max(50, 'Uyruk en fazla 50 karakter olmalıdır'),
  identityNumber: zod.string().length(11, 'TC Kimlik No 11 haneli olmalıdır').optional(),
  mernisCheck: zod.boolean().default(false),
  category: zod.nativeEnum(BeneficiaryCategory, {
    message: 'Kategori seçiniz'
  }),
  fundRegion: zod.nativeEnum(FundRegion, {
    message: 'Fon bölgesi seçiniz'
  }),
  fileConnection: zod.nativeEnum(FileConnection, {
    message: 'Dosya bağlantısı seçiniz'
  }),
  fileNumber: zod.string()
    .min(1, 'Dosya numarası zorunludur')
    .max(20, 'Dosya numarası en fazla 20 karakter olmalıdır')
    .regex(/^[A-Z0-9]+$/, 'Dosya numarası sadece büyük harf ve rakam içerebilir'),
  
  // İletişim Bilgileri
  mobilePhone: zod.string().regex(/^(\+905\d{8}|5\d{9})$/, 'Geçerli bir telefon numarası giriniz').optional(),
  mobilePhoneCode: zod.string().optional(),
  landlinePhone: zod.string().regex(/^(\+905\d{8}|5\d{9})$/, 'Geçerli bir telefon numarası giriniz').optional(),
  internationalPhone: zod.string().optional(),
  email: zod.string().email('Geçerli bir email adresi giriniz').optional().or(zod.literal('')),
  
  // Bağlantılar
  linkedOrphan: zod.string().optional(),
  linkedCard: zod.string().optional(),
  familyMemberCount: zod.number().min(1).max(20).default(1),
  
  // Adres Bilgileri
  country: zod.nativeEnum(Country).optional(),
  city: zod.nativeEnum(City).optional(),
  district: zod.string().max(100).optional(),
  neighborhood: zod.string().max(100).optional(),
  address: zod.string().max(500).optional(),
  
  // Durum ve Rıza
  consentStatement: zod.string().optional(),
  deleteRecord: zod.boolean().default(false),
  status: zod.nativeEnum(BeneficiaryStatus).default(BeneficiaryStatus.TASLAK),
  
  // Kimlik Bilgileri
  fatherName: zod.string().max(50).regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]*$/, 'Baba adı sadece harf içerebilir').optional(),
  motherName: zod.string().max(50).regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]*$/, 'Anne adı sadece harf içerebilir').optional(),
  identityDocumentType: zod.nativeEnum(IdentityDocumentType).optional(),
  identityIssueDate: zod.date().optional(),
  identityExpiryDate: zod.date().optional(),
  identitySerialNumber: zod.string().max(50).optional(),
  previousNationality: zod.string().max(50).optional(),
  previousName: zod.string().max(100).optional(),
  
  // Pasaport ve Vize
  passportType: zod.nativeEnum(PassportType).optional(),
  passportNumber: zod.string().max(50).optional(),
  passportExpiryDate: zod.date().optional(),
  visaType: zod.nativeEnum(VisaType).optional(),
  visaExpiryDate: zod.date().optional(),
  entryType: zod.nativeEnum(EntryType).optional(),
  returnInfo: zod.nativeEnum(ReturnInfo).optional(),
  
  // Kişisel Veriler
  gender: zod.nativeEnum(Gender).optional(),
  birthPlace: zod.string().max(100).optional(),
  birthDate: zod.date().optional(),
  maritalStatus: zod.nativeEnum(MaritalStatus).optional(),
  educationStatus: zod.nativeEnum(EducationStatus).optional(),
  educationLevel: zod.string().max(100).optional(),
  religion: zod.nativeEnum(Religion).optional(),
  criminalRecord: zod.boolean().default(false),
  
  // İş ve Gelir Durumu
  livingPlace: zod.nativeEnum(LivingPlace).optional(),
  incomeSources: zod.array(zod.nativeEnum(IncomeSource)).optional(),
  monthlyIncome: zod.number().min(0).max(1000000).optional(),
  monthlyExpense: zod.number().min(0).max(1000000).optional(),
  socialSecurity: zod.nativeEnum(SocialSecurityStatus).optional(),
  workStatus: zod.nativeEnum(WorkStatus).optional(),
  employment_status: zod.nativeEnum(WorkStatus).optional(),
  sector: zod.nativeEnum(Sector).optional(),
  jobGroup: zod.nativeEnum(JobGroup).optional(),
  jobDescription: zod.string().max(200).optional(),
  
  // İlave Açıklamalar
  additionalNotesTurkish: zod.string().max(1000).optional(),
  additionalNotesEnglish: zod.string().max(1000).optional(),
  additionalNotesArabic: zod.string().max(1000).optional(),
  
  // Sağlık Durumu
  bloodType: zod.nativeEnum(BloodType).optional(),
  smokingStatus: zod.nativeEnum(SmokingStatus).optional(),
  healthProblem: zod.string().max(500).optional(),
  disabilityStatus: zod.nativeEnum(DisabilityStatus).optional(),
  prosthetics: zod.string().max(200).optional(),
  regularMedications: zod.string().max(200).optional(),
  surgeries: zod.string().max(200).optional(),
  healthNotes: zod.string().max(500).optional(),
  diseases: zod.array(zod.nativeEnum(Disease)).optional(),
  
  // Conditional health fields
  hasChronicIllness: zod.boolean().default(false),
  chronicIllnessDetail: zod.string().min(3).optional(),
  hasDisability: zod.boolean().default(false),
  disabilityDetail: zod.string().min(3).optional(),
  has_health_insurance: zod.boolean().default(false),
  previous_aid: zod.boolean().default(false),
  other_organization_aid: zod.boolean().default(false),
  emergency: zod.boolean().default(false),
  
  // Acil Durum İletişimi
  emergencyContacts: zod.array(zod.object({
    name: zod.string().min(2).max(50),
    relationship: zod.string().min(2).max(50),
    phone: zod.string().regex(/^(\+905\d{8}|5\d{9})$/)
  })).max(2).optional(),
  
  // Kayıt Bilgisi
  registrationTime: zod.date().optional(),
  registrationIP: zod.string().optional(),
  registeredBy: zod.string().optional(),
  totalAidAmount: zod.number().min(0).optional(),
  
  // Etiketler ve Özel Durumlar
  labels: zod.array(zod.nativeEnum(BeneficiaryLabel)).optional(),
  earthquakeVictim: zod.boolean().default(false),
  
  // Household Composition
  children_count: zod.number().min(0).max(20).default(0),
  orphan_children_count: zod.number().min(0).max(20).default(0),
  elderly_count: zod.number().min(0).max(20).default(0),
  disabled_count: zod.number().min(0).max(20).default(0),
  
  // Financial Status
  income_level: zod.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH']).optional(),
  occupation: zod.string().max(200).optional(),
  has_debt: zod.boolean().default(false),
  has_vehicle: zod.boolean().default(false),
  
  // Additional Notes
  notes: zod.string().max(1000).optional(),
  aidType: zod.string().optional(),
  aid_duration: zod.string().optional(),
  priority: zod.string().optional(),
  reference_name: zod.string().optional(),
  referenceName: zod.string().optional(),
  reference_phone: zod.string().optional(),
  referencePhone: zod.string().optional(),
  reference_relation: zod.string().optional(),
  referenceRelation: zod.string().optional(),
  application_source: zod.string().optional(),
  applicationSource: zod.string().optional(),
  contact_preference: zod.string().optional(),
  contactPreference: zod.string().optional(),
  
  // Metadata
  createdAt: zod.string().datetime().optional(),
  updatedAt: zod.string().datetime().optional(),
  createdBy: zod.string().optional(),
  updatedBy: zod.string().optional()
});

// Infer form data type from schema
import type { z } from 'zod';
type AdvancedBeneficiaryFormData = z.infer<typeof advancedBeneficiarySchema>;


interface AdvancedBeneficiaryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<AdvancedBeneficiaryFormData>;
  isUpdateMode?: boolean;
  updateMutation?: { mutateAsync: Function };
  beneficiaryId?: string;
}

export function AdvancedBeneficiaryForm({ onSuccess, onCancel, initialData, isUpdateMode = false, updateMutation, beneficiaryId }: AdvancedBeneficiaryFormProps) {
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
    // resolver: zodResolver(advancedBeneficiarySchema), // Temporarily disabled
    defaultValues: {
      mernisCheck: false,
      familyMemberCount: 1,
      children_count: 0,
      orphan_children_count: 0,
      elderly_count: 0,
      disabled_count: 0,
      has_debt: false,
      has_vehicle: false,
      hasChronicIllness: false,
      hasDisability: false,
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
      }) as Promise<any>,
    onSuccess: () => {
      toast.success('İhtiyaç sahibi başarıyla eklendi');
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      // ✅ Enhanced error handling
      const userMessage = formatErrorMessage(error);
      toast.error(`İhtiyaç sahibi eklenirken hata oluştu: ${userMessage}`);
      console.error('Create beneficiary error:', error);
    },
  });

  // UPDATE MUTATION (yeni - internal)
  const internalUpdateMutation = useMutation({
    mutationFn: (data: any) => {
      if (!beneficiaryId) throw new Error('Beneficiary ID bulunamadı');
      return api.beneficiaries.updateBeneficiary(beneficiaryId, data) as Promise<any>;
    },
    onSuccess: () => {
      toast.success('İhtiyaç sahibi başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['beneficiary', beneficiaryId] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      // ✅ Enhanced error handling
      const userMessage = formatErrorMessage(error);
      toast.error(`İhtiyaç sahibi güncellenirken hata oluştu: ${userMessage}`);
      console.error('Update beneficiary error:', error);
    },
  });

  // Hangi mutation kullanılacak?
  const activeMutation = isUpdateMode 
    ? (updateMutation || internalUpdateMutation) 
    : createBeneficiaryMutation;

  // Sanitization helper function
  const sanitizeFormData = (data: AdvancedBeneficiaryFormData): AdvancedBeneficiaryFormData => {
    const sanitized = { ...data };

    // TC Kimlik No
    if (sanitized.identityNumber) {
      const cleanTc = sanitizeTcNo(sanitized.identityNumber);
      if (cleanTc) {
        sanitized.identityNumber = cleanTc;
      } else {
        // Invalid TC - validation should catch this, but double-check
        delete sanitized.identityNumber;
      }
    }

    // Phone numbers
    if (sanitized.mobilePhone) {
      const cleanPhone = sanitizePhone(sanitized.mobilePhone);
      sanitized.mobilePhone = cleanPhone || undefined;
    }

    if (sanitized.landlinePhone) {
      const cleanLandline = sanitizePhone(sanitized.landlinePhone);
      sanitized.landlinePhone = cleanLandline || undefined;
    }

    // Email
    if (sanitized.email) {
      const cleanEmail = sanitizeEmail(sanitized.email);
      sanitized.email = cleanEmail || undefined;
    }

    // Numbers (income, expense, amounts)
    if (sanitized.monthlyIncome !== undefined) {
      const cleanIncome = sanitizeNumber(sanitized.monthlyIncome);
      sanitized.monthlyIncome = cleanIncome !== null ? cleanIncome : undefined;
    }

    if (sanitized.monthlyExpense !== undefined) {
      const cleanExpense = sanitizeNumber(sanitized.monthlyExpense);
      sanitized.monthlyExpense = cleanExpense !== null ? cleanExpense : undefined;
    }

    if (sanitized.totalAidAmount !== undefined) {
      const cleanAmount = sanitizeNumber(sanitized.totalAidAmount);
      sanitized.totalAidAmount = cleanAmount !== null ? cleanAmount : undefined;
    }

    // Dates (convert to ISO strings if Date objects)
    const dateFields = [
      'birthDate',
      'identityIssueDate',
      'identityExpiryDate',
      'passportExpiryDate',
      'visaExpiryDate'
    ] as const;

    dateFields.forEach(field => {
      if (sanitized[field]) {
        const dateValue = sanitized[field];
        if (dateValue instanceof Date) {
          (sanitized as any)[field] = dateValue.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (typeof dateValue === 'string') {
          const cleanDate = sanitizeDate(dateValue);
          (sanitized as any)[field] = cleanDate ? cleanDate.toISOString().split('T')[0] : undefined;
        }
      }
    });

    // Emergency contacts - sanitize phone numbers
    if (sanitized.emergencyContacts && Array.isArray(sanitized.emergencyContacts)) {
      sanitized.emergencyContacts = sanitized.emergencyContacts.map(contact => ({
        ...contact,
        phone: sanitizePhone(contact.phone) || contact.phone
      }));
    }

    // Text fields - sanitize object (recursive)
    const textFields = [
      'notes',
      'additionalNotesTurkish',
      'additionalNotesEnglish',
      'additionalNotesArabic',
      'consentStatement',
      'healthProblem',
      'chronicIllnessDetail',
      'disabilityDetail',
      'jobDescription',
      'prosthetics',
      'surgeries',
      'healthNotes'
    ] as const;

    textFields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = sanitizeObject({ [field]: sanitized[field] }, { allowHtml: false })[field];
      }
    });

    return sanitized;
  };

  const onSubmit = async (data: AdvancedBeneficiaryFormData) => {
    setIsSubmitting(true);

    try {
      // 1. Sanitize form data
      const sanitizedData = sanitizeFormData(data);

      // 2. Call mutation directly with sanitized data (no mapping needed since we use camelCase)
      if (isUpdateMode && updateMutation) {
        await updateMutation.mutateAsync(sanitizedData);
      } else if (isUpdateMode && beneficiaryId) {
        await internalUpdateMutation.mutateAsync(sanitizedData);
      } else {
        await createBeneficiaryMutation.mutateAsync(sanitizedData);
      }

      // Success handled by mutation onSuccess callback
    } catch (error: any) {
      // Enhanced error handling
      const userMessage = formatErrorMessage(error);
      toast.error(userMessage);
      console.error('Form submission error:', error);
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
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input
                    id="firstName"
                    data-testid="firstName"
                    {...register('firstName')}
                    placeholder="Ahmet"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input
                    id="lastName"
                    data-testid="lastName"
                    {...register('lastName')}
                    placeholder="Yılmaz"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="identityNumber">TC Kimlik No *</Label>
                  <Input
                    id="identityNumber"
                    data-testid="identityNumber"
                    {...register('identityNumber')}
                    placeholder="12345678901"
                    maxLength={11}
                  />
                  {errors.identityNumber && (
                    <p className="text-sm text-red-600">{errors.identityNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Telefon *</Label>
                  <Input
                    id="mobilePhone"
                    data-testid="mobilePhone"
                    {...register('mobilePhone')}
                    placeholder="0555 123 45 67"
                  />
                  {errors.mobilePhone && (
                    <p className="text-sm text-red-600">{errors.mobilePhone.message}</p>
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
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    data-testid="birthDate"
                    type="date"
                    {...register('birthDate')}
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
                <ParameterSelect<Gender>
                  category="gender"
                  value={watch('gender')}
                  onChange={(value) => setValue('gender', value)}
                  error={errors.gender?.message}
                />

                <ParameterSelect<Religion>
                  category="religion"
                  value={watch('religion')}
                  onChange={(value) => setValue('religion', value)}
                  error={errors.religion?.message}
                />

                <ParameterSelect<MaritalStatus>
                  category="marital_status"
                  value={watch('maritalStatus')}
                  onChange={(value) => setValue('maritalStatus', value)}
                  error={errors.maritalStatus?.message}
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
                  <Label htmlFor="familyMemberCount">Toplam Aile Büyüklüğü *</Label>
                  <Input
                    id="familyMemberCount"
                    data-testid="familyMemberCount"
                    type="number"
                    min={1}
                    {...register('familyMemberCount', { valueAsNumber: true })}
                  />
                  {errors.familyMemberCount && (
                    <p className="text-sm text-red-600">{errors.familyMemberCount.message}</p>
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
                  error={errors.income_level?.message}
                />

                <div className="space-y-2">
                  <Label htmlFor="incomeSources">Gelir Kaynağı</Label>
                  <Input
                    id="incomeSources"
                    {...register('incomeSources')}
                    placeholder="Maaş, Emekli Maaşı, Yardım..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ParameterSelect
                  category="housing_type"
                  value={watch('livingPlace')}
                  onChange={(value) => setValue('livingPlace', value)}
                  error={errors.livingPlace?.message}
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
                <Label htmlFor="healthProblem">Genel Sağlık Durumu</Label>
                <Textarea
                  id="healthProblem"
                  {...register('healthProblem')}
                  placeholder="Sağlık durumu hakkında genel bilgi..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasChronicIllness"
                  checked={watch('hasChronicIllness')}
                  onCheckedChange={(checked) => setValue('hasChronicIllness', checked as boolean)}
                />
                <Label htmlFor="hasChronicIllness" className="cursor-pointer">Kronik hastalığı var</Label>
              </div>
              {/* Kronik Hastalık Detayı - Conditional */}
              {watch('hasChronicIllness') && (
                <>
                  <div className="col-span-full">
                    <Label>
                      Kronik Hastalık Detayı <span className="text-red-600">*</span>
                    </Label>
                    <Textarea
                      {...register('chronicIllnessDetail')}
                      placeholder="Kronik hastalık detaylarını girin"
                      rows={3}
                    />
                    {errors.chronicIllnessDetail && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.chronicIllnessDetail.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            {/* TAB 6: Eğitim ve İstihdam */}
            <TabsContent value="education" className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Eğitim ve İstihdam</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ParameterSelect
                  category="education_level"
                  value={watch('educationLevel')}
                  onChange={(value) => setValue('educationLevel', value)}
                  error={errors.educationLevel?.message}
                />

                <ParameterSelect
                  category="occupation"
                  value={watch('occupation')}
                  onChange={(value) => setValue('occupation', value)}
                  error={errors.occupation?.message}
                />

                <ParameterSelect
                  category="employment_status"
                  value={watch('employment_status')}
                  onChange={(value) => setValue('employment_status', value)}
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
                  <Label htmlFor="aidType">Yardım Türü</Label>
                  <Input
                    id="aidType"
                    {...register('aidType')}
                    placeholder="Nakdi, Gıda, Eğitim..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAidAmount">Talep Edilen Miktar (₺)</Label>
                  <Input
                    id="totalAidAmount"
                    type="number"
                    min={0}
                    step={0.01}
                    {...register('totalAidAmount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.totalAidAmount && (
                    <p className="text-sm text-red-600">{errors.totalAidAmount.message}</p>
                  )}
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
                  <Label htmlFor="referenceName">Referans Kişi</Label>
                  <Input
                    id="referenceName"
                    {...register('referenceName')}
                    placeholder="Referans adı soyadı"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referencePhone">Referans Telefon</Label>
                  <Input
                    id="referencePhone"
                    {...register('referencePhone')}
                    placeholder="0555 123 45 67"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referenceRelation">Referans İlişkisi</Label>
                  <Input
                    id="referenceRelation"
                    {...register('referenceRelation')}
                    placeholder="Akraba, Komşu, Dost..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationSource">Başvuru Kaynağı</Label>
                  <Input
                    id="applicationSource"
                    {...register('applicationSource')}
                    placeholder="Nasıl duydu?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPreference">İletişim Tercihi</Label>
                <Input
                  id="contactPreference"
                  {...register('contactPreference')}
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
              data-testid="saveButton"
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
