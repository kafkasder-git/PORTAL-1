// KafkasDer İhtiyaç Sahipleri Mock API
// Mock backend servisi - gerçek API entegrasyonu için değiştirilecek

import { 
  Beneficiary, 
  BeneficiaryQuickAdd, 
  BeneficiaryListResponse, 
  BeneficiaryResponse,
  BeneficiarySearchParams,
  PhotoUploadResponse,
  MernisCheckResponse
} from '@/types/beneficiary';
// import { ApiResponse } from '@/types/collections';

// Define ApiResponse type locally
interface ApiResponse<T> {
  success?: boolean;
  data?: T | null;
  error?: string | null;
  message?: string;
}

// Simulated network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock beneficiaries storage (in-memory) - Static data
let mockBeneficiaries: Beneficiary[] = [
  {
    id: "beneficiary-001",
    photo: "https://via.placeholder.com/300x400/cccccc/666666?text=Ahmet+Yılmaz",
    sponsorType: "BIREYSEL" as any,
    firstName: "Ahmet",
    lastName: "Yılmaz",
    nationality: "Türkiye",
    identityNumber: "12345678901",
    mernisCheck: true,
    category: "YETIM_AILESI" as any,
    fundRegion: "AVRUPA" as any,
    fileConnection: "PARTNER_KURUM" as any,
    fileNumber: "AVYET001234",
    mobilePhone: "5551234567",
    mobilePhoneCode: "555",
    landlinePhone: "2121234567",
    internationalPhone: "+905551234567",
    email: "ahmet.yilmaz@example.com",
    linkedOrphan: "ORP-001",
    linkedCard: "CARD-001",
    familyMemberCount: 4,
    country: "TURKIYE" as any,
    city: "ISTANBUL" as any,
    district: "Kadıköy",
    neighborhood: "Moda",
    address: "Moda Mahallesi, Kadıköy/İstanbul",
    consentStatement: "Kişisel verilerimin işlenmesine rıza gösteriyorum.",
    deleteRecord: false,
    status: "AKTIF" as any,
    createdAt: new Date("2024-01-15T10:30:00.000Z"),
    updatedAt: new Date("2024-01-15T10:30:00.000Z"),
    createdBy: "admin@test.com",
    updatedBy: "admin@test.com"
  },
  {
    id: "beneficiary-002",
    photo: "https://via.placeholder.com/300x400/cccccc/666666?text=Fatma+Demir",
    sponsorType: "KURUMSAL" as any,
    firstName: "Fatma",
    lastName: "Demir",
    nationality: "Suriye",
    identityNumber: undefined,
    mernisCheck: false,
    category: "MULTECI_AILE" as any,
    fundRegion: "SERBEST" as any,
    fileConnection: "CALISMA_SAHASI" as any,
    fileNumber: "SRMUL002345",
    mobilePhone: "5552345678",
    mobilePhoneCode: "555",
    landlinePhone: undefined,
    internationalPhone: "+905552345678",
    email: "fatma.demir@example.com",
    linkedOrphan: undefined,
    linkedCard: "CARD-002",
    familyMemberCount: 3,
    country: "TURKIYE" as any,
    city: "GAZIANTEP" as any,
    district: "Şahinbey",
    neighborhood: "Şehitkamil",
    address: "Şehitkamil Mahallesi, Şahinbey/Gaziantep",
    consentStatement: "Kişisel verilerimin işlenmesine rıza gösteriyorum.",
    deleteRecord: false,
    status: "AKTIF" as any,
    createdAt: new Date("2024-02-10T14:20:00.000Z"),
    updatedAt: new Date("2024-02-10T14:20:00.000Z"),
    createdBy: "manager@test.com",
    updatedBy: "manager@test.com"
  },
  {
    id: "beneficiary-003",
    photo: "https://via.placeholder.com/300x400/cccccc/666666?text=Mehmet+Kaya",
    sponsorType: "BIREYSEL" as any,
    firstName: "Mehmet",
    lastName: "Kaya",
    nationality: "Türkiye",
    identityNumber: "98765432109",
    mernisCheck: true,
    category: "IHTIYAC_SAHIBI_COCUK" as any,
    fundRegion: "AVRUPA" as any,
    fileConnection: "PARTNER_KURUM" as any,
    fileNumber: "AVIHT003456",
    mobilePhone: "5553456789",
    mobilePhoneCode: "555",
    landlinePhone: "2169876543",
    internationalPhone: "+905553456789",
    email: "mehmet.kaya@example.com",
    linkedOrphan: "ORP-003",
    linkedCard: undefined,
    familyMemberCount: 2,
    country: "TURKIYE" as any,
    city: "ANKARA" as any,
    district: "Çankaya",
    neighborhood: "Kızılay",
    address: "Kızılay Mahallesi, Çankaya/Ankara",
    consentStatement: "Kişisel verilerimin işlenmesine rıza gösteriyorum.",
    deleteRecord: false,
    status: "TASLAK" as any,
    createdAt: new Date("2024-03-05T09:15:00.000Z"),
    updatedAt: new Date("2024-03-05T09:15:00.000Z"),
    createdBy: "member@test.com",
    updatedBy: "member@test.com"
  }
];

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// === BENEFICIARY API FUNCTIONS ===

/**
 * Hızlı kayıt için beneficiary oluşturma
 */
export const createBeneficiary = async (data: BeneficiaryQuickAdd): Promise<ApiResponse<Beneficiary>> => {
  await delay();
  
  try {
    const newBeneficiary: Beneficiary = {
      id: generateId(),
      ...data,
      status: 'TASLAK' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
      updatedBy: 'current-user'
    };
    
    mockBeneficiaries.push(newBeneficiary);
    
    return {
      success: true,
      data: newBeneficiary,
      error: null,
      message: 'İhtiyaç sahibi başarıyla oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: 'İhtiyaç sahibi oluşturulurken hata oluştu'
    };
  }
};

/**
 * Beneficiary güncelleme
 */
export const updateBeneficiary = async (id: string, data: Partial<Beneficiary>): Promise<ApiResponse<Beneficiary>> => {
  await delay();
  
  try {
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı'
      };
    }
    
    const updatedBeneficiary: Beneficiary = {
      ...mockBeneficiaries[index],
      ...data,
      updatedAt: new Date(),
      updatedBy: 'current-user'
    };
    
    mockBeneficiaries[index] = updatedBeneficiary;
    
    return {
      success: true,
      data: updatedBeneficiary,
      message: 'İhtiyaç sahibi başarıyla güncellendi'
    };
  } catch (error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi güncellenirken hata oluştu'
    };
  }
};

/**
 * Tek beneficiary getirme
 */
export const getBeneficiary = async (id: string): Promise<ApiResponse<Beneficiary>> => {
  await delay();
  
  try {
    const beneficiary = mockBeneficiaries.find(b => b.id === id);
    
    if (!beneficiary) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı'
      };
    }
    
    return {
      success: true,
      data: beneficiary
    };
  } catch (error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi getirilirken hata oluştu'
    };
  }
};

/**
 * Beneficiary listesi getirme (sayfalama ve filtreleme ile)
 */
export const getBeneficiaries = async (params: BeneficiarySearchParams = {}): Promise<ApiResponse<BeneficiaryListResponse>> => {
  await delay();
  
  try {
    const {
      search = '',
      category,
      fundRegion,
      status,
      country,
      city,
      page = 1,
      limit = 20
    } = params;
    
    let filteredBeneficiaries = [...mockBeneficiaries];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBeneficiaries = filteredBeneficiaries.filter(b => 
        b.firstName.toLowerCase().includes(searchLower) ||
        b.lastName.toLowerCase().includes(searchLower) ||
        b.identityNumber?.includes(search) ||
        b.fileNumber.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (category) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.category === category);
    }
    
    // Fund region filter
    if (fundRegion) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.fundRegion === fundRegion);
    }
    
    // Status filter
    if (status) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.status === status);
    }
    
    // Country filter
    if (country) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.country === country);
    }
    
    // City filter
    if (city) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.city === city);
    }
    
    // Pagination
    const total = filteredBeneficiaries.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBeneficiaries = filteredBeneficiaries.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedBeneficiaries,
        total,
        page,
        limit
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'İhtiyaç sahipleri listesi getirilirken hata oluştu'
    };
  }
};

/**
 * Beneficiary silme
 */
export const deleteBeneficiary = async (id: string): Promise<ApiResponse<void>> => {
  await delay();
  
  try {
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı'
      };
    }
    
    mockBeneficiaries.splice(index, 1);
    
    return {
      success: true,
      message: 'İhtiyaç sahibi başarıyla silindi'
    };
  } catch (error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi silinirken hata oluştu'
    };
  }
};

/**
 * Fotoğraf yükleme
 */
export const uploadBeneficiaryPhoto = async (id: string, file: File): Promise<ApiResponse<PhotoUploadResponse>> => {
  await delay(1000); // Fotoğraf yükleme daha uzun sürer
  
  try {
    // Mock fotoğraf URL'i oluştur
    const photoUrl = `https://via.placeholder.com/300x400/cccccc/666666?text=${encodeURIComponent(file.name)}`;
    
    // Beneficiary'yi güncelle
    const updateResult = await updateBeneficiary(id, { photo: photoUrl });
    
    if (!updateResult.success) {
      return {
        success: false,
        error: 'Fotoğraf yüklenirken hata oluştu'
      };
    }
    
    return {
      success: true,
      data: {
        success: true,
        photoUrl,
        message: 'Fotoğraf başarıyla yüklendi'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Fotoğraf yüklenirken hata oluştu'
    };
  }
};

/**
 * Mernis kontrolü
 */
export const checkMernis = async (identityNumber: string): Promise<ApiResponse<MernisCheckResponse>> => {
  await delay(2000); // Mernis kontrolü uzun sürer
  
  try {
    // Mock Mernis kontrolü
    // Gerçek implementasyonda Mernis API'si kullanılacak
    const isValid = identityNumber.length === 11 && /^\d{11}$/.test(identityNumber);
    
    if (!isValid) {
      return {
        success: true,
        data: {
          isValid: false,
          message: 'Geçersiz TC Kimlik No'
        }
      };
    }
    
    // Mock başarılı kontrol
    return {
      success: true,
      data: {
        isValid: true,
        message: 'Mernis kontrolü başarılı',
        data: {
          firstName: 'Mock',
          lastName: 'User',
          birthDate: new Date('1990-01-01'),
          nationality: 'Türkiye'
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Mernis kontrolü yapılırken hata oluştu'
    };
  }
};

/**
 * Dosya numarası oluşturma
 */
export const generateFileNumber = async (category: string, fundRegion: string): Promise<ApiResponse<string>> => {
  await delay();
  
  try {
    // Mock dosya numarası oluşturma
    const prefix = fundRegion === 'AVRUPA' ? 'AV' : 'SR';
    const categoryCode = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    
    const fileNumber = `${prefix}${categoryCode}${timestamp}`;
    
    return {
      success: true,
      data: fileNumber,
      message: 'Dosya numarası oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Dosya numarası oluşturulurken hata oluştu'
    };
  }
};

/**
 * İstatistikler
 */
export const getBeneficiaryStats = async (): Promise<ApiResponse<{
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byFundRegion: Record<string, number>;
}>> => {
  await delay();
  
  try {
    const stats = {
      total: mockBeneficiaries.length,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byFundRegion: {} as Record<string, number>
    };
    
    mockBeneficiaries.forEach(beneficiary => {
      // Category stats
      stats.byCategory[beneficiary.category] = (stats.byCategory[beneficiary.category] || 0) + 1;
      
      // Status stats
      stats.byStatus[beneficiary.status] = (stats.byStatus[beneficiary.status] || 0) + 1;
      
      // Fund region stats
      stats.byFundRegion[beneficiary.fundRegion] = (stats.byFundRegion[beneficiary.fundRegion] || 0) + 1;
    });
    
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      error: 'İstatistikler getirilirken hata oluştu'
    };
  }
};

/**
 * Export beneficiaries to CSV
 */
export const exportBeneficiaries = async (params: BeneficiarySearchParams = {}): Promise<ApiResponse<string>> => {
  await delay(2000); // Export işlemi uzun sürer
  
  try {
    const result = await getBeneficiaries({ ...params, limit: 10000 });
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'Veriler getirilemedi'
      };
    }
    
    // Mock CSV oluşturma
    const headers = [
      'ID', 'Ad', 'Soyad', 'Kategori', 'Fon Bölgesi', 'Dosya Numarası',
      'Kimlik No', 'Telefon', 'Email', 'Ülke', 'Şehir', 'Durum'
    ];
    
    const csvRows = [
      headers.join(','),
      ...result.data.data.map(b => [
        b.id,
        b.firstName,
        b.lastName,
        b.category,
        b.fundRegion,
        b.fileNumber,
        b.identityNumber || '',
        b.mobilePhone || '',
        b.email || '',
        b.country || '',
        b.city || '',
        b.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    return {
      success: true,
      data: csvContent,
      message: 'CSV dosyası oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      error: 'CSV export işlemi sırasında hata oluştu'
    };
  }
};
