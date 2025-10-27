# Appwrite Backend Setup Guide

Bu belge, Appwrite backend'ini kurmak ve test etmek için gerekli adımları açıklar.

## 1. Environment Variables

`.env.local` dosyasında Appwrite konfigürasyonu zaten yapılmıştır:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://selam-appwrite-8154f2-38-242-208-4.traefik.me/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68fee9220016ba9acb1b
APPWRITE_API_KEY=standard_15c951817a62a9bed5e62ee9fd23e9cd3e063f2a62638aa07f9ca7df31172742bf56949444d6ce1b1fb7ce73d2db7e3227e65ba0141faed6534f8329aec21e776e2eceb40dc6f1aeeb44a4e8244d3faf9c59149e756ad55f76775fb735210c8eaca92916103a741e6f161a87efc8857b06c8fe29ae40dd401e09781913d298c1
```

## 2. Collections Setup

Database ve collections zaten oluşturulmuştur:

```bash
npx tsx scripts/setup-appwrite.ts
```

## 3. Test Users Creation

### Appwrite Console'dan Manuel Olarak:

1. Appwrite Console'u açın: http://selam-appwrite-8154f2-38-242-208-4.traefik.me/
2. **Auth** → **Users** seçin
3. **New User** butonuna tıklayın
4. Her user için şu bilgileri girin:

#### Admin User
- **Email:** admin@test.com
- **Password:** admin123
- **Name:** Admin User
- **Labels:** admin

#### Manager User
- **Email:** manager@test.com
- **Password:** manager123
- **Name:** Manager User
- **Labels:** manager

#### Member User
- **Email:** member@test.com
- **Password:** member123
- **Name:** Member User
- **Labels:** member

#### Viewer User
- **Email:** viewer@test.com
- **Password:** viewer123
- **Name:** Viewer User
- **Labels:** viewer

## 4. Application Config

### Development Mode (Mock Backend)

Mock backend'i kullanmak için `src/app/api/auth/login/route.ts` dosyasında:

```typescript
const USE_MOCK_AUTH = true; // Mock authentication'ı etkinleştir
```

### Production Mode (Appwrite Backend)

Gerçek Appwrite backend'ini kullanmak için:

```typescript
const USE_MOCK_AUTH = false; // Mock authentication'ı devre dışı bırak
```

## 5. Login Testing

Login sayfasına gidin: http://localhost:3000/login

Aşağıdaki kimlik bilgileriyle test edin:
- admin@test.com / admin123
- manager@test.com / manager123
- member@test.com / member123
- viewer@test.com / viewer123

## 6. Troubleshooting

### SDK Version Uyarısı

```
Warning: The current SDK is built for Appwrite 1.8.0. However, the current Appwrite server version is 1.6.1.
```

Bu uyarı görmezden gelebilirsiniz. SDK compatibility issues yoktur.

### Session Ayarları

Session timeout: **24 hours** (src/app/api/auth/login/route.ts)

```typescript
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours
```

### CORS Configuration

Eğer CORS hatası alırsanız, Appwrite Settings'de "Web API" domainini kontrol edin.

## 7. Collections Referans

| Collection | Açıklama | Ana Alanlar |
|-----------|----------|-----------|
| **users** | Sistem kullanıcıları | name, email, role, isActive, labels |
| **beneficiaries** | İhtiyaç sahipleri | firstName, lastName, category, status |
| **donations** | Bağışlar | donor_name, amount, status |
| **tasks** | İşler/Görevler | title, status, assigned_to |
| **meetings** | Toplantılar | title, meeting_date, organizer |
| **messages** | Mesajlar | subject, message_type, sender |
| **aid_applications** | Yardım başvuruları | applicant_name, stage, status |
| **parameters** | Sistem parametreleri | category, name_tr, value |

## 8. Storage Buckets

| Bucket | Açıklama | Max Size |
|--------|----------|----------|
| **documents** | Belgeler | 100 MB |
| **receipts** | Makbuzlar | 100 MB |
| **photos** | Fotoğraflar | 100 MB |
| **reports** | Raporlar | 100 MB |

Allowed file types: jpg, jpeg, png, pdf, doc, docx, xls, xlsx, txt

## 9. API Routes

### Auth Endpoints

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Kullanıcı çıkışı (TBD)
- `GET /api/csrf` - CSRF token alma

### CSRF Protection

Tüm POST istekleri CSRF token gerektirir:

```typescript
// Client side
const csrfResponse = await fetch('/api/csrf');
const csrfData = await csrfResponse.json();

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'x-csrf-token': csrfData.token,
  },
  body: JSON.stringify({ email, password }),
});
```

## 10. Next Steps

1. ✅ Backend setup (Appwrite collections & storage)
2. ✅ Test users creation
3. 🔄 Mock API → Real API migration
4. 🔄 Middleware updates
5. 🔄 Full E2E testing

## 11. Useful Commands

```bash
# Setup Appwrite backend
npx tsx scripts/setup-appwrite.ts

# Create test users (if script works)
npx tsx scripts/create-test-users.ts

# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

## 12. Documentation Links

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite SDK Reference](https://appwrite.io/docs/sdks)
- [Next.js 16 Guide](https://nextjs.org/docs)
