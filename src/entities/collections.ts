/**
 * Appwrite Collection Types
 * TypeScript definitions for Appwrite documents
 */

import { UserRole } from '@/types/auth';

// Base Appwrite Document type
export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions?: string[];
  $collectionId: string;
  $databaseId: string;
}

// Users Collection
export interface UserDocument extends AppwriteDocument {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  labels?: string[];
}

// Parameter Categories (Portal Plus)
export type ParameterCategory = 
  | 'gender' // Cinsiyet
  | 'religion' // İnanç
  | 'marital_status' // Evlilik
  | 'employment_status' // Çalışma Durumu
  | 'living_status' // Yaşam
  | 'housing_type' // Yaşadığı Ev
  | 'income_level' // Gelir Durumu
  | 'guardian_relation' // Vasi Yakınlık Derecesi
  | 'education_status' // Eğitim Durumu
  | 'education_level' // Eğitim Düzeyi
  | 'education_success' // Eğitim Başarısı
  | 'death_reason' // Vefat Nedeni
  | 'health_problem' // Sağlık Sorunu
  | 'illness' // Hastalık
  | 'treatment' // Tedavi
  | 'special_condition' // Özel Durum
  | 'occupation' // Meslek
  | 'cancellation_reason' // İptal Nedeni
  | 'document_type' // Belge Türü
  | 'refund_reason' // İade Nedeni
  | 'sponsorship_end_reason' // Sponsorluk Bitirme Nedeni
  | 'sponsorship_continue' // Sponsorluk Devam Etme
  | 'school_type' // Okul Türü
  | 'school_institution_type' // Okul Kurum Türü
  | 'orphan_assignment_correction' // Yetim Atama Düzeltmeleri
  | 'orphan_detail'; // Yetim Detay

// Parameters Collection
export interface ParameterDocument extends AppwriteDocument {
  category: ParameterCategory;
  name_tr: string;
  name_en?: string;
  name_ar?: string;
  name_ru?: string;
  name_fr?: string;
  value: string;
  order: number;
  is_active: boolean;
}

// Beneficiaries Collection (Genişletilmiş)
export interface BeneficiaryDocument extends AppwriteDocument {
  // Temel Kişisel Bilgiler
  name: string;
  tc_no: string;
  phone: string;
  email?: string;
  birth_date?: string;
  gender?: string; // parametre
  nationality?: string;
  religion?: string; // parametre
  marital_status?: string; // parametre
  
  // Adres Bilgileri
  address: string;
  city: string;
  district: string;
  neighborhood: string;
  
  // Aile Bilgileri
  family_size: number;
  children_count?: number;
  orphan_children_count?: number;
  elderly_count?: number;
  disabled_count?: number;
  
  // Ekonomik Durum
  income_level?: string; // parametre
  income_source?: string;
  has_debt?: boolean;
  housing_type?: string; // parametre
  has_vehicle?: boolean;
  
  // Sağlık Bilgileri
  health_status?: string;
  has_chronic_illness?: boolean;
  chronic_illness_detail?: string; // parametre
  has_disability?: boolean;
  disability_detail?: string;
  has_health_insurance?: boolean;
  regular_medication?: string;
  
  // Eğitim ve İstihdam
  education_level?: string; // parametre
  occupation?: string; // parametre
  employment_status?: string; // parametre
  
  // Yardım Talebi
  aid_type?: string;
  totalAidAmount?: number;
  aid_duration?: string;
  priority?: string;
  
  // Referans Bilgileri
  reference_name?: string;
  reference_phone?: string;
  reference_relation?: string;
  application_source?: string;
  
  // Ek Bilgiler
  notes?: string;
  previous_aid?: boolean;
  other_organization_aid?: boolean;
  emergency?: boolean;
  contact_preference?: string;
  
  // Durum ve Onay
  status: 'TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI';
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
}

// Donations Collection
export interface DonationDocument extends AppwriteDocument {
  donor_name: string;
  donor_phone: string;
  donor_email?: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  donation_type: string;
  payment_method: string;
  donation_purpose: string;
  notes?: string;
  receipt_number: string;
  receipt_file_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Aid Requests Collection
export interface AidRequestDocument extends AppwriteDocument {
  beneficiary_id: string;
  request_type: 'financial' | 'food' | 'health' | 'education' | 'housing';
  description: string;
  amount_requested?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: string;
  approved_at?: string;
}

// Aid Applications Collection (Portal Plus Style)
export interface AidApplicationDocument extends AppwriteDocument {
  // Başvuru Bilgileri
  application_date: string;
  applicant_type: 'person' | 'organization' | 'partner'; // Kişi, Kurum, Partner
  applicant_name: string;
  beneficiary_id?: string; // İhtiyaç sahibi ile ilişki
  
  // Yardım Türleri (Portal Plus'taki 5 tür)
  one_time_aid?: number; // Tek Seferlik
  regular_financial_aid?: number; // Düzenli Nakdi
  regular_food_aid?: number; // Düzenli Gıda (paket sayısı)
  in_kind_aid?: number; // Ayni Yardım (adet)
  service_referral?: number; // Hizmet Sevk (sayı)
  
  // Aşama ve Durum
  stage: 'draft' | 'under_review' | 'approved' | 'ongoing' | 'completed'; // Taslak, İnceleme, Onay, Devam Ediyor, Tamamlandı
  status: 'open' | 'closed'; // Açık, Kapalı
  
  // Detaylar
  description?: string;
  notes?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  
  // İşlem Bilgileri
  processed_by?: string;
  processed_at?: string;
  approved_by?: string;
  approved_at?: string;
  completed_at?: string;
}

// Scholarships Collection
export interface ScholarshipDocument extends AppwriteDocument {
  student_name: string;
  tc_no: string;
  school_name: string;
  grade: number;
  scholarship_amount: number;
  scholarship_type: 'monthly' | 'one-time' | 'annual';
  start_date?: string;
  end_date?: string;
  status: 'active' | 'paused' | 'completed';
}

// Tasks Collection (Portal Plus - 188 bekleyen iş)
export interface TaskDocument extends AppwriteDocument {
  title: string;
  description?: string;
  assigned_to?: string; // User ID
  created_by: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  category?: string;
  tags?: string[];
  is_read: boolean;
}

// Meetings Collection (Portal Plus - Toplantılar)
export interface MeetingDocument extends AppwriteDocument {
  title: string;
  description?: string;
  meeting_date: string;
  location?: string;
  organizer: string; // User ID
  participants: string[]; // User IDs
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meeting_type: 'general' | 'committee' | 'board' | 'other';
  agenda?: string;
  notes?: string;
}

// Messages Collection (SMS & E-posta)
export interface MessageDocument extends AppwriteDocument {
  message_type: 'sms' | 'email' | 'internal';
  sender: string;
  recipients: string[];
  subject?: string;
  content: string;
  sent_at?: string;
  status: 'draft' | 'sent' | 'failed';
  is_bulk: boolean;
  template_id?: string;
}

// Finance Records Collection (Gelir-Gider)
export interface FinanceRecordDocument extends AppwriteDocument {
  record_type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  description: string;
  transaction_date: string;
  payment_method?: string;
  receipt_number?: string;
  receipt_file_id?: string;
  related_to?: string; // İlişkili kayıt ID
  created_by: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Orphans Collection (Portal Plus - Yetim/Öğrenci Yönetimi)
export interface OrphanDocument extends AppwriteDocument {
  // Temel Bilgiler
  name: string;
  tc_no: string;
  birth_date: string;
  gender: string;
  nationality?: string;
  religion?: string;
  
  // Kategori (Portal Plus parametreleri)
  category: 'ihh_orphan' | 'orphan' | 'family' | 'education_scholarship'; // İHH Yetim, Yetim, Aile, Eğitim Bursu
  special_condition?: string; // Yetim, Öksüz, Mülteci (parametre)
  
  // Vasi Bilgileri
  guardian_name?: string;
  guardian_relation?: string; // Parametre (Anne, Baba, Büyükanne, vb.)
  guardian_phone?: string;
  guardian_tc_no?: string;
  
  // Vefat Bilgileri (Ebeveyn)
  father_status?: string; // Hayatta, Vefat Etmiş (parametre)
  father_death_date?: string;
  father_death_reason?: string; // Parametre
  mother_status?: string;
  mother_death_date?: string;
  mother_death_reason?: string;
  
  // Adres
  address: string;
  city: string;
  district: string;
  neighborhood: string;
  
  // Eğitim
  education_status?: string; // Parametre
  school_name?: string;
  school_type?: string; // Parametre
  school_institution_type?: string; // Parametre (Devlet, Özel, Vakıf)
  grade?: number;
  education_success?: string; // Parametre
  
  // Sağlık
  health_status?: string;
  illness?: string; // Parametre
  treatment?: string; // Parametre
  has_disability?: boolean;
  disability_detail?: string;
  
  // Sponsorluk
  sponsor_id?: string;
  sponsorship_amount?: number;
  sponsorship_start_date?: string;
  sponsorship_status?: 'active' | 'paused' | 'ended';
  
  // Dökümanlar
  photo_id?: string;
  documents?: string[]; // File IDs
  
  // Notlar
  notes?: string;
  status: 'active' | 'inactive' | 'graduated';
}

// Sponsors Collection (Sponsorluk Yönetimi)
export interface SponsorDocument extends AppwriteDocument {
  sponsor_name: string;
  sponsor_type: 'individual' | 'corporate';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  
  // Sponsorluk Bilgileri
  total_sponsored: number; // Toplam sponsor olunan yetim sayısı
  monthly_amount?: number;
  start_date?: string;
  
  // İletişim Tercihi
  contact_preference?: string;
  notes?: string;
  status: 'active' | 'inactive';
}

// Campaigns Collection (Kampanya Yönetimi)
export interface CampaignDocument extends AppwriteDocument {
  campaign_name: string;
  campaign_type: 'donation' | 'orphan_support' | 'education' | 'health' | 'ramadan' | 'other';
  description: string;
  start_date: string;
  end_date?: string;
  target_amount?: number;
  collected_amount?: number;
  status: 'active' | 'completed' | 'cancelled';
  created_by: string;
}

// API Response Types
export interface AppwriteListResponse<T> {
  total: number;
  documents: T[];
}

export interface AppwriteResponse<T> {
  data: T | null;
  error: string | null;
  total?: number;
}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  orderType?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// File Upload Types
export interface FileUpload {
  file: File;
  bucketId: string;
  permissions?: string[];
}

export interface UploadedFile {
  $id: string;
  name: string;
  mimeType: string;
  sizeOriginal: number;
  $createdAt: string;
  $updatedAt: string;
}

// Error Types
export interface AppwriteError {
  code: number;
  message: string;
  type: string;
}

// Collection Names (for type safety)
export type CollectionName = 
  | 'users'
  | 'beneficiaries' 
  | 'donations'
  | 'aid_requests'
  | 'aid_applications'
  | 'scholarships'
  | 'parameters'
  | 'tasks'
  | 'meetings'
  | 'messages'
  | 'finance_records'
  | 'orphans'
  | 'sponsors'
  | 'campaigns';

// Document Types Map
export type DocumentByCollection = {
  users: UserDocument;
  beneficiaries: BeneficiaryDocument;
  donations: DonationDocument;
  aid_requests: AidRequestDocument;
  aid_applications: AidApplicationDocument;
  scholarships: ScholarshipDocument;
  parameters: ParameterDocument;
  tasks: TaskDocument;
  meetings: MeetingDocument;
  messages: MessageDocument;
  finance_records: FinanceRecordDocument;
  orphans: OrphanDocument;
  sponsors: SponsorDocument;
  campaigns: CampaignDocument;
};

// Utility Types
export type CreateDocumentData<T> = Omit<T, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$collectionId' | '$databaseId'>;
export type UpdateDocumentData<T> = Partial<CreateDocumentData<T>>;
