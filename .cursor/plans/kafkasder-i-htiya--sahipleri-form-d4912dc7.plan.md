<!-- d4912dc7-b1e5-4db3-90d1-9c9ce76b9d31 37e320f3-4457-4baf-9300-4424f2ea60ea -->
# KafkasDer İhtiyaç Sahipleri Form - İmplementasyon Planı

## 1. TypeScript Types ve Enums Oluşturma

**Dosya**: `src/types/beneficiary.ts`

Oluşturulacak tipler:

- `BeneficiaryCategory` enum (Yetim Ailesi, Mülteci Aile, İhtiyaç Sahibi Aile, vb.)
- `FundRegion` enum (Avrupa, Serbest)
- `FileConnection` enum (Partner Kurum, Çalışma Sahası)
- `IdentityDocumentType` enum (Nüfus Cüzdanı, TC Kimlik Belgesi, vb.)
- `PassportType` enum (Diplomatik, Geçici, vb.)
- `Gender` enum (Erkek, Kadın)
- `MaritalStatus` enum (Bekar, Evli)
- `EducationStatus` enum (Öğrenci, Mezun, vb.)
- `Religion` enum (Müslüman, Hristiyan, vb.)
- 200+ ülke için `Country` enum
- Türkiye illeri için `City` enum
- Sektörler ve meslekler için enumlar
- `Beneficiary` interface - Tüm form alanlarını içeren ana tip
- `BeneficiaryQuickAdd` interface - Hızlı kayıt için minimal alanlar

## 2. Validation Schemas Oluşturma

**Dosya**: `src/lib/validations/beneficiary.ts`

Zod ile validation şemaları:

- `quickAddBeneficiarySchema` - Hızlı kayıt için zorunlu alanlar (Ad, Soyad, Kategori, Kimlik No, Dosya Numarası)
- `beneficiarySchema` - Detaylı form için tüm alanların validasyonu
- TC Kimlik No validasyonu (11 hane)
- Telefon numarası validasyonu
- Email validasyonu
- Tarih validasyonları

## 3. Mock API Güncellemeleri

**Dosya**: `src/lib/api/mock-api.ts`

Yeni fonksiyonlar ekle:

- `createBeneficiary(data: BeneficiaryQuickAdd)` - Hızlı kayıt için
- `updateBeneficiary(id: string, data: Partial<Beneficiary>)` - Güncelleme için
- `getBeneficiary(id: string)` - Tek kayıt getirme
- `uploadBeneficiaryPhoto(id: string, file: File)` - Fotoğraf yükleme

**Dosya**: `src/data/mock/beneficiaries-extended.json`

Detaylı beneficiary mock datası ekle (tüm alanlar ile)

## 4. Hızlı Kayıt Modal Komponenti

**Dosya**: `src/components/forms/BeneficiaryQuickAddModal.tsx`

shadcn/ui Dialog içinde:

- React Hook Form + Zod entegrasyonu
- Alanlar (KafkasDer'deki sıra ile):
- Kategori (Select - 9 seçenek)
- Ad (Input, required)
- Soyad (Input, required)
- Uyruk (Input, required)
- Doğum Tarihi (DatePicker)
- Kimlik No (Input)
- Mernis Kontrolü Yap (Checkbox)
- Fon Bölgesi (Select - Avrupa/Serbest)
- Dosya Bağlantısı (Select - Partner Kurum/Çalışma Sahası)
- Dosya Numarası (Input, required, readonly prefix + editable suffix)
- Kaydet butonu (disabled when invalid)
- Kapat butonu
- Kayıt sonrası detay sayfasına yönlendirme

## 5. Detaylı Form Sayfası Komponenti

**Dosya**: `src/app/(dashboard)/yardim/ihtiyac-sahipleri/[id]/page.tsx`

Ana sayfa yapısı:

- Header (ID, Fotoğraf yükleme, Kaydet/Kapat butonları)
- Sol taraf: 4 ana tab

1. Temel Bilgiler (varsayılan açık)
2. Kimlik Bilgileri
3. Kişisel Veriler
4. Sağlık Durumu

- Sağ taraf: Bağlantılı Kayıtlar tab'ları (11 adet)

### 5.1. Temel Bilgiler Sekmesi

**Dosya**: `src/components/forms/beneficiary-detail/BasicInfoTab.tsx`

Bölümler:

- Fotoğraf yükleme (Çek/Kaldır butonları)
- Sponsorluk Tipi
- Ad, Soyad, Uyruk (readonly), Kimlik No
- Mernis Kontrolü checkbox
- Kategori, Fon Bölgesi, Dosya Bağlantısı, Dosya Numarası
- Cep Telefonu (Kod dropdown + numara input)
- Sabit Telefon, Yurtdışı Telefon, E-posta
- Bağlı Yetim/Kart (readonly)
- Ailedeki Kişi Sayısı (1-20)
- Ülke dropdown (200+ ülke)
- Şehir/Bölge dropdown (Türkiye illeri)
- Yerleşim dropdown (ilçeler)
- Mahalle/Köy dropdown
- Adres (Textarea)
- Rıza Beyanı (readonly)
- Kaydı Sil checkbox
- Durum (Radio: Taslak)

### 5.2. Kimlik Bilgileri Sekmesi

**Dosya**: `src/components/forms/beneficiary-detail/IdentityInfoTab.tsx`

Bölümler:

- Baba Adı, Anne Adı
- Kimlik Belgesi Türü
- Geçerlilik/Veriliş Tarihi
- Seri Numarası
- Önceki Uyruğu, Önceki İsmi
- **Pasaport ve Vize**:
- Pasaport Türü, Numarası, Geçerlilik Tarihi
- Vize/Giriş Türü, Bitiş Tarihi
- Geri Dönüş Bilgisi

### 5.3. Kişisel Veriler Sekmesi

**Dosya**: `src/components/forms/beneficiary-detail/PersonalDataTab.tsx`

Bölümler:

- Cinsiyet, Doğum Yeri, Doğum Tarihi (+ yaş hesaplama)
- Medeni Durum, Eğitim Durumu/Düzeyi
- İnanç, Adli Sicil Kaydı
- **İş ve Gelir Durumu**:
- Yaşadığı Yer
- Gelir Kaynakları (6 checkbox)
- Aylık Gelir/Gider (₺)
- Sosyal Güvence
- İş Durumu, Çalıştığı Sektör, Meslek Grubu
- Meslek Tanımı
- **İlave Açıklamalar** (Tabs: Türkçe/İngilizce/Arapça - multiline textarea)

### 5.4. Sağlık Durumu Sekmesi

**Dosya**: `src/components/forms/beneficiary-detail/HealthInfoTab.tsx`

Bölümler:

- Kan Grubu, Sigara Kullanımı
- Sağlık Sorunu, Engel Durumu
- Kullanılan Protezler, Düzenli İlaçlar
- Geçirilen Ameliyatlar, İlgili Açıklamalar
- **Hastalıklar** (60+ checkbox grid layout):
- Akdeniz Anemisi, Alerji, Astım, vb.
- **Acil Durum İletişimi**:
- 2 kişi için: İsim, Yakınlık, Telefon
- **Kayıt Bilgisi** (readonly):
- Kayıt Zamanı, IP, Kayıt Eden
- Toplam Yardım Tutarı
- **Etiketler** (4 checkbox)
- **Özel Durumlar** (checkbox: Depremzede)

## 6. Bağlantılı Kayıtlar Tab Yapısı

**Dosya**: `src/components/forms/beneficiary-detail/RelatedRecordsTabs.tsx`

11 Tab komponenti (placeholder olarak):

- Banka Hesapları
- Dokümanlar
- Fotoğraflar
- Baktığı Yetimler
- Baktığı Kişiler
- Sponsorlar
- Referanslar
- Görüşme Kayıtları
- Görüşme Seans Takibi
- Yardım Talepleri (badge: sayı)
- Yapılan Yardımlar
- Rıza Beyanları
- Sosyal Kartlar
- Kart Özeti

Her tab içinde: "Bu bölüm yakında eklenecek" placeholder

## 7. Liste Sayfası Güncellemeleri

**Dosya**: `src/app/(dashboard)/yardim/ihtiyac-sahipleri/page.tsx`

Mevcut sayfayı güncelle:

- "Ekle" butonu modal açsın
- `BeneficiaryQuickAddModal` componentini import et
- Modal state yönetimi ekle
- Kayıt sonrası detay sayfasına yönlendirme

## 8. Yardımcı Komponentler

**Dosya**: `src/components/forms/beneficiary-detail/PhotoUpload.tsx`

- Fotoğraf gösterimi
- Çek/Kaldır butonları
- Webcam entegrasyonu (placeholder)

**Dosya**: `src/components/forms/beneficiary-detail/PhoneInput.tsx`

- Telefon kodu dropdown + numara input
- Türk operatör kodları (501-561)

**Dosya**: `src/components/forms/beneficiary-detail/AddressForm.tsx`

- Cascading dropdowns (Ülke → Şehir → Yerleşim → Mahalle)
- Adres textarea

## 9. shadcn/ui Komponentleri Ekleme

Gerekli komponentler (henüz yoksa):

- `dialog` - Modal için
- `tabs` - Tab yapısı için
- `radio-group` - Durum seçimi için
- `date-picker` - Tarih seçimi için (date-picker custom component oluştur)

## 10. Styling ve Layout

- Tam ekran layout (KafkasDer gibi)
- Sidebar ile uyumlu responsive tasarım
- Form alanları grid layout
- Scroll behavior
- Loading states
- Error handling

## Implementasyon Sırası

1. Types ve enums (beneficiary.ts)
2. Validation schemas (beneficiary.ts validations)
3. Mock API güncellemeleri
4. Hızlı kayıt modalı
5. Liste sayfası entegrasyonu
6. Detay sayfa layoutu
7. Temel Bilgiler sekmesi
8. Kimlik Bilgileri sekmesi
9. Kişisel Veriler sekmesi
10. Sağlık Durumu sekmesi
11. Bağlantılı Kayıtlar tab yapısı
12. Yardımcı komponentler
13. Test ve düzeltmeler

### To-dos

- [ ] TypeScript types ve enums oluştur (beneficiary.ts)
- [ ] Zod validation schemas oluştur
- [ ] Mock API güncellemeleri ve extended mock data
- [ ] Hızlı kayıt modal komponenti oluştur
- [ ] Liste sayfasına modal entegrasyonu
- [ ] Detay sayfa layoutu ve tab yapısı
- [ ] Temel Bilgiler sekmesi
- [ ] Kimlik Bilgileri sekmesi
- [ ] Kişisel Veriler sekmesi
- [ ] Sağlık Durumu sekmesi
- [ ] Bağlantılı Kayıtlar tab yapısı (placeholders)
- [ ] Yardımcı komponentler (PhotoUpload, PhoneInput, AddressForm)
- [ ] Gerekli shadcn/ui komponentleri ekle
- [ ] Styling, responsive tasarım ve polish