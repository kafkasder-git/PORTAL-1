// KafkasDer İhtiyaç Sahipleri Form Validation Schemas
// Zod ile form validasyonu

import { z } from 'zod';
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
  Label
} from '@/types/beneficiary';

// === HELPER VALIDATORS ===

// TC Kimlik No validasyonu (11 hane, algoritma kontrolü)
const tcKimlikNoSchema = z.string()
  .length(11, 'TC Kimlik No 11 haneli olmalıdır')
  .regex(/^\d{11}$/, 'TC Kimlik No sadece rakam içermelidir')
  .refine((value) => {
    // TC Kimlik No algoritma kontrolü
    const digits = value.split('').map(Number);
    
    // İlk 10 hanenin toplamı
    const sum1 = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0);
    
    // Çift pozisyonlardaki rakamların toplamı
    const sum2 = digits.filter((_, index) => index % 2 === 0).reduce((sum, digit) => sum + digit, 0);
    
    // Tek pozisyonlardaki rakamların toplamı
    const sum3 = digits.filter((_, index) => index % 2 === 1).reduce((sum, digit) => sum + digit, 0);
    
    // 10. hane kontrolü
    const check10 = (sum2 * 7 - sum3) % 10;
    
    // 11. hane kontrolü
    const check11 = sum1 % 10;
    
    return digits[9] === check10 && digits[10] === check11;
  }, 'Geçersiz TC Kimlik No');

// Telefon numarası validasyonu
const phoneSchema = z.string()
  .regex(/^\d{10}$/, 'Telefon numarası 10 haneli olmalıdır')
  .optional();

// Email validasyonu
const emailSchema = z.string()
  .email('Geçerli bir email adresi giriniz')
  .optional()
  .or(z.literal(''));

// Tarih validasyonu (geçmiş tarih kontrolü)
const pastDateSchema = z.date()
  .refine((date) => date <= new Date(), 'Geçmiş bir tarih seçiniz')
  .optional();

// Gelecek tarih validasyonu
const futureDateSchema = z.date()
  .refine((date) => date >= new Date(), 'Gelecek bir tarih seçiniz')
  .optional();

// Yaş hesaplama (doğum tarihinden)
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// === HIZLI KAYIT SCHEMA ===
export const quickAddBeneficiarySchema = z.object({
category: z.nativeEnum(BeneficiaryCategory, {
message: 'Kategori seçiniz'
}),
firstName: z.string()
.min(2, 'Ad en az 2 karakter olmalıdır')
.max(50, 'Ad en fazla 50 karakter olmalıdır')
.regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Ad sadece harf içerebilir'),
lastName: z.string()
.min(2, 'Soyad en az 2 karakter olmalıdır')
.max(50, 'Soyad en fazla 50 karakter olmalıdır')
.regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Soyad sadece harf içerebilir'),
nationality: z.string()
.min(2, 'Uyruk en az 2 karakter olmalıdır')
.max(50, 'Uyruk en fazla 50 karakter olmalıdır'),
birthDate: pastDateSchema,
identityNumber: tcKimlikNoSchema.optional(),
mernisCheck: z.boolean().optional().default(false),
  fundRegion: z.nativeEnum(FundRegion, {
    message: 'Fon bölgesi seçiniz'
  }),
  fileConnection: z.nativeEnum(FileConnection, {
    message: 'Dosya bağlantısı seçiniz'
  }),
  fileNumber: z.string()
    .min(1, 'Dosya numarası zorunludur')
    .max(20, 'Dosya numarası en fazla 20 karakter olmalıdır')
    .regex(/^[A-Z0-9]+$/, 'Dosya numarası sadece büyük harf ve rakam içerebilir')
});

// === DETAYLI FORM SCHEMA ===
export const beneficiarySchema = z.object({
  // Temel Bilgiler
  id: z.string().optional(),
  photo: z.string().optional(),
  sponsorType: z.nativeEnum(SponsorType).optional(),
  firstName: z.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Ad sadece harf içerebilir'),
  lastName: z.string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Soyad sadece harf içerebilir'),
  nationality: z.string()
    .min(2, 'Uyruk en az 2 karakter olmalıdır')
    .max(50, 'Uyruk en fazla 50 karakter olmalıdır'),
  identityNumber: tcKimlikNoSchema.optional(),
  mernisCheck: z.boolean().default(false),
  category: z.nativeEnum(BeneficiaryCategory, {
    message: 'Kategori seçiniz'
  }),
  fundRegion: z.nativeEnum(FundRegion, {
    message: 'Fon bölgesi seçiniz'
  }),
  fileConnection: z.nativeEnum(FileConnection, {
    message: 'Dosya bağlantısı seçiniz'
  }),
  fileNumber: z.string()
    .min(1, 'Dosya numarası zorunludur')
    .max(20, 'Dosya numarası en fazla 20 karakter olmalıdır')
    .regex(/^[A-Z0-9]+$/, 'Dosya numarası sadece büyük harf ve rakam içerebilir'),
  
  // İletişim Bilgileri
  mobilePhone: phoneSchema,
  mobilePhoneCode: z.string().optional(),
  landlinePhone: phoneSchema,
  internationalPhone: z.string().optional(),
  email: emailSchema,
  
  // Bağlantılar
  linkedOrphan: z.string().optional(),
  linkedCard: z.string().optional(),
  familyMemberCount: z.number()
    .min(1, 'Ailedeki kişi sayısı en az 1 olmalıdır')
    .max(20, 'Ailedeki kişi sayısı en fazla 20 olmalıdır')
    .optional(),
  
  // Adres Bilgileri
  country: z.nativeEnum(Country).optional(),
  city: z.nativeEnum(City).optional(),
  district: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  
  // Durum ve Rıza
  consentStatement: z.string().optional(),
  deleteRecord: z.boolean().default(false),
  status: z.nativeEnum(BeneficiaryStatus).default(BeneficiaryStatus.TASLAK),
  
  // Kimlik Bilgileri
  fatherName: z.string()
    .max(50, 'Baba adı en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]*$/, 'Baba adı sadece harf içerebilir')
    .optional(),
  motherName: z.string()
    .max(50, 'Anne adı en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]*$/, 'Anne adı sadece harf içerebilir')
    .optional(),
  identityDocumentType: z.nativeEnum(IdentityDocumentType).optional(),
  identityIssueDate: pastDateSchema,
  identityExpiryDate: futureDateSchema,
  identitySerialNumber: z.string().max(50).optional(),
  previousNationality: z.string().max(50).optional(),
  previousName: z.string().max(100).optional(),
  
  // Pasaport ve Vize
  passportType: z.nativeEnum(PassportType).optional(),
  passportNumber: z.string().max(50).optional(),
  passportExpiryDate: futureDateSchema,
  visaType: z.nativeEnum(VisaType).optional(),
  visaExpiryDate: futureDateSchema,
  entryType: z.nativeEnum(EntryType).optional(),
  returnInfo: z.nativeEnum(ReturnInfo).optional(),
  
  // Kişisel Veriler
  gender: z.nativeEnum(Gender).optional(),
  birthPlace: z.string().max(100).optional(),
  birthDate: pastDateSchema,
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  educationStatus: z.nativeEnum(EducationStatus).optional(),
  educationLevel: z.string().max(100).optional(),
  religion: z.nativeEnum(Religion).optional(),
  criminalRecord: z.boolean().default(false),
  
  // İş ve Gelir Durumu
  livingPlace: z.nativeEnum(LivingPlace).optional(),
  incomeSources: z.array(z.nativeEnum(IncomeSource)).optional(),
  monthlyIncome: z.number()
    .min(0, 'Aylık gelir negatif olamaz')
    .max(1000000, 'Aylık gelir çok yüksek')
    .optional(),
  monthlyExpense: z.number()
    .min(0, 'Aylık gider negatif olamaz')
    .max(1000000, 'Aylık gider çok yüksek')
    .optional(),
  socialSecurity: z.nativeEnum(SocialSecurityStatus).optional(),
  workStatus: z.nativeEnum(WorkStatus).optional(),
  sector: z.nativeEnum(Sector).optional(),
  jobGroup: z.nativeEnum(JobGroup).optional(),
  jobDescription: z.string().max(200).optional(),
  
  // İlave Açıklamalar
  additionalNotesTurkish: z.string().max(1000).optional(),
  additionalNotesEnglish: z.string().max(1000).optional(),
  additionalNotesArabic: z.string().max(1000).optional(),
  
  // Sağlık Durumu
  bloodType: z.nativeEnum(BloodType).optional(),
  smokingStatus: z.nativeEnum(SmokingStatus).optional(),
  healthProblem: z.string().max(500).optional(),
  disabilityStatus: z.nativeEnum(DisabilityStatus).optional(),
  prosthetics: z.string().max(200).optional(),
  regularMedications: z.string().max(200).optional(),
  surgeries: z.string().max(200).optional(),
  healthNotes: z.string().max(500).optional(),
  diseases: z.array(z.nativeEnum(Disease)).optional(),
  
  // Acil Durum İletişimi
  emergencyContacts: z.array(z.object({
    name: z.string()
      .min(2, 'İsim en az 2 karakter olmalıdır')
      .max(50, 'İsim en fazla 50 karakter olmalıdır'),
    relationship: z.string()
      .min(2, 'Yakınlık en az 2 karakter olmalıdır')
      .max(50, 'Yakınlık en fazla 50 karakter olmalıdır'),
    phone: phoneSchema
  })).max(2, 'En fazla 2 acil durum iletişim kişisi eklenebilir').optional(),
  
  // Kayıt Bilgisi
  registrationTime: z.date().optional(),
  registrationIP: z.string().optional(),
  registeredBy: z.string().optional(),
  totalAidAmount: z.number()
    .min(0, 'Toplam yardım tutarı negatif olamaz')
    .optional(),
  
  // Etiketler ve Özel Durumlar
  labels: z.array(z.nativeEnum(Label)).optional(),
  earthquakeVictim: z.boolean().default(false),
  
  // Metadata
  createdAt: z.string().datetime().optional(),  // Appwrite ISO 8601 string
  updatedAt: z.string().datetime().optional(),  // Appwrite ISO 8601 string
  createdBy: z.string().optional(),
  updatedBy: z.string().optional()
}).refine((data) => {
  // Yaş kontrolü (18 yaşından küçükler için özel kurallar)
  if (data.birthDate) {
    const age = calculateAge(data.birthDate);
    if (age < 18 && data.maritalStatus === MaritalStatus.EVLI) {
      return false; // 18 yaşından küçük evli olamaz
    }
  }
  return true;
}, {
  message: '18 yaşından küçük kişiler evli olamaz',
  path: ['maritalStatus']
}).refine((data) => {
  // Kimlik No ve Mernis kontrolü uyumu
  if (data.identityNumber && !data.mernisCheck) {
    return false; // TC Kimlik No varsa Mernis kontrolü yapılmalı
  }
  return true;
}, {
  message: 'TC Kimlik No girildiğinde Mernis kontrolü yapılmalıdır',
  path: ['mernisCheck']
});

// === FORM SECTION SCHEMAS ===

// Temel Bilgiler sekmesi için schema
export const basicInfoSchema = beneficiarySchema.pick({
  photo: true,
  sponsorType: true,
  firstName: true,
  lastName: true,
  nationality: true,
  identityNumber: true,
  mernisCheck: true,
  category: true,
  fundRegion: true,
  fileConnection: true,
  fileNumber: true,
  mobilePhone: true,
  mobilePhoneCode: true,
  landlinePhone: true,
  internationalPhone: true,
  email: true,
  linkedOrphan: true,
  linkedCard: true,
  familyMemberCount: true,
  country: true,
  city: true,
  district: true,
  neighborhood: true,
  address: true,
  consentStatement: true,
  deleteRecord: true,
  status: true
});

// Kimlik Bilgileri sekmesi için schema
export const identityInfoSchema = beneficiarySchema.pick({
  fatherName: true,
  motherName: true,
  identityDocumentType: true,
  identityIssueDate: true,
  identityExpiryDate: true,
  identitySerialNumber: true,
  previousNationality: true,
  previousName: true,
  passportType: true,
  passportNumber: true,
  passportExpiryDate: true,
  visaType: true,
  visaExpiryDate: true,
  entryType: true,
  returnInfo: true
});

// Kişisel Veriler sekmesi için schema
export const personalDataSchema = beneficiarySchema.pick({
  gender: true,
  birthPlace: true,
  birthDate: true,
  maritalStatus: true,
  educationStatus: true,
  educationLevel: true,
  religion: true,
  criminalRecord: true,
  livingPlace: true,
  incomeSources: true,
  monthlyIncome: true,
  monthlyExpense: true,
  socialSecurity: true,
  workStatus: true,
  sector: true,
  jobGroup: true,
  jobDescription: true,
  additionalNotesTurkish: true,
  additionalNotesEnglish: true,
  additionalNotesArabic: true
});

// Sağlık Durumu sekmesi için schema
export const healthInfoSchema = beneficiarySchema.pick({
  bloodType: true,
  smokingStatus: true,
  healthProblem: true,
  disabilityStatus: true,
  prosthetics: true,
  regularMedications: true,
  surgeries: true,
  healthNotes: true,
  diseases: true,
  emergencyContacts: true,
  registrationTime: true,
  registrationIP: true,
  registeredBy: true,
  totalAidAmount: true,
  labels: true,
  earthquakeVictim: true
});

// === TYPE EXPORTS ===
export type QuickAddBeneficiaryFormData = z.infer<typeof quickAddBeneficiarySchema>;
export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type IdentityInfoFormData = z.infer<typeof identityInfoSchema>;
export type PersonalDataFormData = z.infer<typeof personalDataSchema>;
export type HealthInfoFormData = z.infer<typeof healthInfoSchema>;
