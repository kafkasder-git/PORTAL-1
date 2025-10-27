# Database Migration Kılavuzu

## Dernek Yönetim Sistemi - Appwrite Database Migration

Bu kılavuz, Dernek Yönetim Sistemi için Appwrite'da kapsamlı database migration işlemlerinin nasıl gerçekleştirileceğini açıklar.

## 📋 İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Environment Variables](#environment-variables)
3. [Migration Script'leri](#migration-scriptleri)
4. [Kullanım Talimatları](#kullanım-talimatları)
5. [Collection Yapısı](#collection-yapısı)
6. [Test Verileri](#test-verileri)
7. [Rollback İşlemi](#rollback-işlemi)
8. [Troubleshooting](#troubleshooting)
9. [Production Hazırlığı](#production-hazırlığı)

## 🔧 Gereksinimler

### Gerekli Yazılımlar
- Node.js (v18 veya üzeri)
- npm veya yarn
- TypeScript compiler (`tsx` paketi)

### Appwrite Konfigürasyonu
- Appwrite Cloud hesabı
- Aktif proje
- Database ID'si
- API Key (admin yetkili)

### Proje Bağımlılıkları
```json
{
  "dependencies": {
    "appwrite": "^21.2.1",
    "node-appwrite": "^20.2.1",
    "dotenv": "^17.2.3"
  },
  "devDependencies": {
    "tsx": "^4.20.6",
    "@types/node": "^20"
  }
}
```

## 🌐 Environment Variables

`.env` dosyanızda aşağıdaki değişkenlerin tanımlı olduğundan emin olun:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-admin-api-key

# Database Configuration
NEXT_PUBLIC_DATABASE_ID=dernek_db
```

### Değişken Açıklamaları

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite endpoint URL'i | `https://demo.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite proje ID'si | `645e6f7278f3b4b5c6d1` |
| `APPWRITE_API_KEY` | Admin API key (sadece server-side) | `e4f9b1c7...` |
| `NEXT_PUBLIC_DATABASE_ID` | Database ID | `dernek_db` |

## 🗄️ Migration Script'leri

### 1. Ana Migration Script
**Dosya:** `scripts/migrate-database.ts`

Appwrite'da tüm collections'ları oluşturur:
- ✅ 13 Collection
- ✅ Temel schema yapısı
- ✅ İndeksler
- ✅ İzinler

### 2. Test Data Seeding
**Dosya:** `scripts/seed-test-data.ts`

Test verilerini collection'lara ekler:
- 👥 Kullanıcılar (admin, user, viewer)
- 🤝 İhtiyaç sahipleri (rural/urban)
- 💰 Bağış kayıtları
- ✅ Görevler
- 📅 Toplantılar

### 3. Rollback Script
**Dosya:** `scripts/rollback-migration.ts`

Tüm migration verilerini temizler:
- 🗑️ Collection'ları siler
- 🧹 Test verilerini temizler
- ⚠️ Güvenlik onayı ister

## 🚀 Kullanım Talimatları

### Adım 1: Environment Hazırlığı
```bash
# .env dosyasını kontrol edin
cat .env

# Gerekli değişkenlerin mevcut olduğunu doğrulayın
```

### Adım 2: Migration Çalıştırma
```bash
# 1. Migration script'ini çalıştır
tsx scripts/migrate-database.ts

# 2. Başarılı olursa test verilerini ekle
tsx scripts/seed-test-data.ts

# 3. Durumu kontrol et
tsx scripts/test-connection.ts
```

### Adım 3: Test ve Doğrulama
```bash
# Appwrite Console'da collections'ları kontrol edin
# Collections ve test verilerini gözden geçirin
```

### Adım 4: Rollback (Gerekirse)
```bash
# ⚠️ UYARI: Bu işlem geri alınamaz!
tsx scripts/rollback-migration.ts
# "ROLLBACK" yazarak onaylayın
```

## 📊 Collection Yapısı

### Kullanıcılar (users)
- `userID`: Benzersiz kullanıcı ID
- `userName`: Kullanıcı adı
- `role`: Kullanıcı rolü (admin, user, viewer)
- `fullName`: Tam ad
- `eMail`: E-posta adresi
- `avatarUrl`: Profil fotoğrafı URL
- `disabled`: Hesap durumu

### İhtiyaç Sahipleri (beneficiaries)
- `userID`: Benzersiz ID
- `mode`: Mod (rural/urban)
- `name`: Ad Soyad
- `mudurluk`: İl/İlçe Dernek
- `phone`: Telefon numarası
- `address`: Adres
- `need`: İhtiyaç türü
- `status`: Durum

### Bağışlar (donations)
- `donationID`: Bağış ID'si
- `userID`: Bağışçı ID
- `amount`: Tutar
- `campaign`: Kampanya adı
- `status`: Durum

### Görevler (tasks)
- `taskID`: Görev ID'si
- `title`: Görev başlığı
- `description`: Açıklama
- `status`: Durum (pending, completed)
- `priority`: Öncelik (low, medium, high)

### Toplantılar (meetings)
- `meetingID`: Toplantı ID'si
- `title`: Toplantı başlığı
- `description`: Açıklama
- `date`: Tarih ve saat
- `location`: Yer
- `mode`: Mod (online, in-person)
- `status`: Durum

## 🧪 Test Verileri

Script aşağıdaki test verilerini otomatik ekler:

### Kullanıcılar
- **Admin:** Yönetici Admin (admin-001)
- **User:** Yardım Ekibi Üyesi (user-001)
- **Viewer:** Gözlemci Kullanıcı (viewer-001)

### İhtiyaç Sahipleri
- **Rural:** Ahmet Yılmaz - Ankara
- **Urban:** Fatma Demir - İstanbul

### Bağışlar
- **Ramazan Kampanyası:** 500 TL
- **Yetim Destek:** 1000 TL

### Görevler
- **Bağışçı Araştırması** (pending)
- **Toplantı Hazırlıkları** (completed)

### Toplantılar
- **Yönetim Kurulu Toplantısı** (yarın)
- **Proje Değerlendirme** (1 hafta sonra)

## 🔄 Rollback İşlemi

Rollback script'i şu işlemleri gerçekleştirir:

1. **Güvenlik Onayı:** Kullanıcıdan "ROLLBACK" yazmasını ister
2. **Test Veri Temizliği:** Tüm test verilerini siler
3. **Collection Silme:** Migration ile oluşturulan collections'ları siler
4. **Rapor:** İşlem sonucunu raporlar

### ⚠️ Önemli Uyarılar
- Bu işlem **GERİ ALINAMAZ**
- Production verileri etkileyebilir
- Sadece test ortamında kullanın

## 🔧 Troubleshooting

### Yaygın Hatalar

#### 1. Environment Variables Hatası
```bash
Error: Appwrite configuration is missing
```
**Çözüm:** `.env` dosyasını kontrol edin

#### 2. API Key Hatası
```bash
Error: 401 - Unauthorized
```
**Çözüm:** 
- API key'in admin yetkili olduğunu kontrol edin
- Project ID'nin doğru olduğunu kontrol edin

#### 3. Database Connection Hatası
```bash
Error: 404 - Database not found
```
**Çözüm:**
- Database ID'nin mevcut olduğunu kontrol edin
- Database'nin aktif olduğunu kontrol edin

#### 4. Collection Already Exists
```bash
Warning: Collection "users" already exists
```
**Çözüm:** Normal bir uyarı. Script mevcut collections'ı atlayacak.

#### 5. TypeScript Hataları
```bash
Error: Type errors found
```
**Çözüm:**
```bash
# tsx paketini güncelle
npm install -D tsx@latest

# TypeScript hatalarını düzelt
```

### Debug İpuçları

#### 1. Appwrite Console Kontrolü
- Collections listesini kontrol edin
- Document sayılarını kontrol edin
- İndeksleri kontrol edin

#### 2. Log Analizi
- Console çıktısındaki hata kodlarını inceleyin
- Network sekmesinde API çağrılarını kontrol edin

#### 3. Test Connection
```bash
# Bağlantıyı test et
tsx scripts/test-connection.ts
```

## 🏗️ Production Hazırlığı

### 1. Güvenlik
- ✅ Production API key kullanın
- ✅ Database izinlerini kontrol edin
- ✅ Test verilerini temizleyin

### 2. Performance
- ✅ İndeksleri optimize edin
- ✅ Collection boyutlarını planlayın
- ✅ Backup stratejisi oluşturun

### 3. Monitoring
- ✅ API kullanımını izleyin
- ✅ Error logging ekleyin
- ✅ Performance monitoring kurun

### 4. Dokümantasyon
- ✅ Schema değişikliklerini dokümante edin
- ✅ API endpoint'lerini güncelleyin
- ✅ Kullanıcı eğitimi planlayın

## 📞 Destek

### Sorun Giderme Adımları

1. **Logları İnceleyin:** Console çıktısındaki hataları okuyun
2. **Appwrite Console:** Veritabanı durumunu kontrol edin
3. **Test Connection:** Bağlantıyı doğrulayın
4. **Rollback:** Gerekirse geri alın

### İletişim
- Issue tracker kullanın
- Logları paylaşın
- Environment detaylarını belirtin

---

## 📝 Özet

Bu migration sistemi şunları sağlar:

✅ **Kolay Kurulum:** Tek komutla tüm database yapısını oluşturur
✅ **Test Verileri:** Anında test için hazır veriler
✅ **Rollback:** Güvenli geri alma mekanizması  
✅ **Production Ready:** Gerçek ortamda kullanıma hazır
✅ **Comprehensive:** 13 collection ile tam fonksiyonel sistem

Migration işleminiz başarılı olsun! 🎉
