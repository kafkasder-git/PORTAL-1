# Dernek Yönetim Sistemi

Modern, güvenli ve ölçeklenebilir dernek yönetim platformu. Türkiye'deki dernekler ve yardım kuruluşları için tasarlanmış kapsamlı bir yönetim sistemidir.

## 🚀 Özellikler

### Temel Modüller

- **Kullanıcı Yönetimi**: 6 farklı rol (Super Admin, Admin, Manager, Member, Viewer, Volunteer) ile detaylı yetki sistemi
- **İhtiyaç Sahipleri Yönetimi**: Kapsamlı kişi bilgisi yönetimi, parametrik kategoriler
- **Bağış Yönetimi**: Bağış kayıtları, makbuz yönetimi, raporlama
- **Yardım Başvuruları**: 5 farklı yardım türü (Tek Seferlik, Düzenli Nakdi, Gıda, Ayni, Hizmet Sevk)
- **Burs Yönetimi**: Öğrenci ve burs başvuruları takibi
- **Görev Yönetimi**: Kanban board ile görev takibi ve atama
- **Toplantı Yönetimi**: Toplantı planlama ve takvim entegrasyonu
- **Mesajlaşma**: SMS, E-posta ve kurum içi mesajlaşma sistemi
- **Finansal Yönetim**: Gelir-gider takibi ve raporlama
- **Partner Yönetimi**: Kurumsal partnerlerin yönetimi

### Teknik Özellikler

- ⚡ **Next.js 16** - App Router ile modern SSR/SSG
- ⚛️ **React 19** - En son React özellikleri
- 🔒 **Appwrite** - Güvenli backend-as-a-service
- 🎨 **Tailwind CSS 4** - Utility-first CSS framework
- 📦 **TypeScript** - Tam tip güvenliği
- 🧪 **Vitest + Playwright** - Kapsamlı test altyapısı
- 🔐 **RBAC** - Role-Based Access Control (30+ permission)
- 🛡️ **Güvenlik**: CSRF koruması, XSS sanitization, rate limiting
- 📊 **Sentry** - Hata takibi ve performans izleme

## 📋 Gereksinimler

- Node.js 20.x veya üzeri
- npm veya yarn
- Appwrite Cloud hesabı veya local Appwrite instance

## 🛠️ Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd PORTAL-1
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables

`.env.local` dosyası oluşturun. `.env.example` dosyasını şablon olarak kullanabilirsiniz:

```bash
cp .env.example .env.local
```

Daha sonra `.env.local` dosyasını düzenleyin ve gerekli değerleri girin:

```env
# Appwrite Configuration (REQUIRED)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Database ID (REQUIRED)
NEXT_PUBLIC_DATABASE_ID=dernek_db

# Security Secrets (REQUIRED) - Generate with: openssl rand -base64 32
CSRF_SECRET=your-csrf-secret-minimum-32-characters
SESSION_SECRET=your-session-secret-minimum-32-characters

# Storage Buckets (Optional - defaults provided)
NEXT_PUBLIC_STORAGE_DOCUMENTS=documents
NEXT_PUBLIC_STORAGE_RECEIPTS=receipts
NEXT_PUBLIC_STORAGE_PHOTOS=photos
NEXT_PUBLIC_STORAGE_REPORTS=reports

# Application Settings (Optional)
NEXT_PUBLIC_APP_NAME=Dernek Yönetim Sistemi
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_REALTIME=true

# Sentry (Optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

**Güvenlik İpuçları:**
- `APPWRITE_API_KEY` ve secret'ları **ASLA** Git'e commit etmeyin
- `.env.local` dosyası zaten `.gitignore` içinde
- Secret'lar için güvenli random string'ler oluşturun:
  ```bash
  openssl rand -base64 32
  ```

### 4. Appwrite Kurulumu

Appwrite veritabanınızı ve koleksiyonlarınızı oluşturun:

```bash
# Appwrite backend setup (collections, buckets)
npm run setup:appwrite
# veya
npx tsx scripts/setup-appwrite.ts
```

Bu komut otomatik olarak şunları oluşturur:
- Veritabanı
- Tüm koleksiyonlar (Users, Beneficiaries, Donations, vb.)
- Storage bucket'ları

### 5. Development Server'ı Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## 🧪 Test Kullanıcıları

Sistem şu an mock authentication kullanıyor. Test için:

| Email | Şifre | Rol |
|-------|-------|-----|
| admin@test.com | admin123 | Admin |
| manager@test.com | manager123 | Manager |
| member@test.com | member123 | Member |
| volunteer@test.com | volunteer123 | Volunteer |
| viewer@test.com | viewer123 | Viewer |

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Dashboard route group
│   ├── api/               # API routes
│   └── login/             # Auth pages
├── entities/              # Domain entities & types
├── features/              # Feature modules
│   ├── beneficiaries/     # İhtiyaç sahipleri modülü
│   ├── donations/         # Bağış modülü
│   ├── users/             # Kullanıcı modülü
│   └── ...
├── shared/                # Shared code
│   ├── components/        # Reusable components
│   ├── lib/               # Utilities & helpers
│   ├── stores/            # State management
│   └── hooks/             # Custom hooks
└── config/                # Configuration files
```

## 🔐 Güvenlik

### Authentication & Authorization

- **HttpOnly Cookies**: JWT token'lar güvenli cookie'lerde saklanır
- **CSRF Protection**: Tüm POST/PUT/DELETE isteklerinde CSRF token kontrolü
- **Rate Limiting**: Brute force saldırılarına karşı koruma
- **RBAC**: Role-Based Access Control ile detaylı yetki yönetimi

### Input Validation & Sanitization

- **Zod**: Runtime validation için Zod şemaları
- **DOMPurify**: XSS saldırılarına karşı HTML sanitization
- **TC Kimlik No Validation**: Türk kimlik numarası validasyonu

## 📚 Dokümantasyon

- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Geliştirme kuralları ve standartları
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Mimari dokümantasyonu
- [API_GUIDE.md](./API_GUIDE.md) - API kullanım rehberi

## 🧪 Test

```bash
# Unit tests
npm test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage

# All tests
npm run test:all
```

## 🚀 Production Build

```bash
# Build
npm run build

# Start production server
npm start

# Analyze bundle
npm run analyze
```

## 🤝 Katkıda Bulunma

1. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
2. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
3. Branch'inizi push edin (`git push origin feature/amazing-feature`)
4. Pull Request oluşturun

## 📝 Lisans

Bu proje özel lisans altındadır.

## 👥 Destek

Sorularınız için issue açabilir veya ekip ile iletişime geçebilirsiniz.

