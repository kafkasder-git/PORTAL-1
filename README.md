# 🏛️ Dernek Yönetim Sistemi - Next.js

Modern, kapsamlı kar amacı gütmeyen dernekler için yönetim sistemi. **Next.js 15 + TypeScript + Tailwind CSS + Mock Backend** ile geliştirilmiştir.

## 🎯 Proje Durumu

**✅ MVP TAMAMLANDI** - Temel özellikler çalışır durumda!

Bu proje, orijinal React + Vite projesinden Next.js 15'e taşınmıştır. Şu anda **mock backend** ile çalışmaktadır ve gerçek backend entegrasyonu için hazırdır.

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 22+
- npm 10+

### Kurulum

\`\`\`bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Tarayıcıda aç
# http://localhost:3000
\`\`\`

### Test Hesapları

| Rol     | Email               | Şifre      |
|---------|---------------------|------------|
| Admin   | admin@test.com      | admin123   |
| Manager | manager@test.com    | manager123 |
| Member  | member@test.com     | member123  |
| Viewer  | viewer@test.com     | viewer123  |

---

## ✨ Tamamlanan Özellikler

- ✅ Authentication (Appwrite)
- ✅ Dashboard with Real Metrics
- ✅ İhtiyaç Sahipleri (Liste + Detay + Ekle/Düzenle)
- ✅ Bağışlar (Liste + Ekle/Düzenle + Dosya Yükleme)
- ✅ Sidebar Navigation
- ✅ Database Collections & Storage
- ✅ File Upload (Makbuz/Resimler)
- ✅ Form Validations (Zod)
- ✅ CRUD Operations
- ✅ 15+ Placeholder Sayfalar

---

## 📁 Proje Yapısı

\`\`\`
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/api/            # Mock API
├── stores/             # Zustand stores
├── data/mock/          # Mock JSON data
└── types/              # TypeScript types
\`\`\`

---

## 🛠️ Teknoloji Stack

- Next.js 15, TypeScript, Tailwind CSS
- shadcn/ui, Radix UI
- Zustand, TanStack Query
- Mock Backend (JSON)

---

## 📦 Dependencies & SDK Usage

### Appwrite SDK Architecture

Bu proje **iki farklı Appwrite SDK** kullanır:

| SDK | Version | Environment | File | Purpose |
|-----|---------|-------------|------|----------|
| `appwrite` | v21.2.1 | Browser | `client.ts` | Client-side operations |
| `node-appwrite` | v20.2.1 | Node.js | `server.ts` | Server-side operations |

---

### 1️⃣ Client SDK (`appwrite`)

**📁 File:** `src/lib/appwrite/client.ts`  
**🌐 Environment:** Browser/React Components  
**🔑 Auth:** User sessions (no API key)

**Use Cases:**
- ✅ Client Components (`'use client'`)
- ✅ User authentication (login/logout)
- ✅ Session management
- ✅ User-specific data queries
- ✅ File uploads from browser

**Example:**
```typescript
'use client';
import { account, databases } from '@/lib/appwrite/client';

const user = await account.get();
const data = await databases.listDocuments(DB_ID, COLLECTION_ID);
```

---

### 2️⃣ Server SDK (`node-appwrite`)

**📁 File:** `src/lib/appwrite/server.ts`  
**🖥️ Environment:** Server Components/API Routes  
**🔑 Auth:** API Key (admin permissions)

**Use Cases:**
- ✅ Server Components
- ✅ API Routes (`/app/api/*`)
- ✅ Server Actions
- ✅ Admin operations (user management)
- ✅ Bulk operations

**Example:**
```typescript
import { serverDatabases, serverUsers } from '@/lib/appwrite/server';

const users = await serverUsers.list();
const data = await serverDatabases.listDocuments(DB_ID, COLLECTION_ID);
```

---

### 🔒 Security Model

| Aspect | Client SDK | Server SDK |
|--------|-----------|------------|
| **Permissions** | User-level | Admin-level |
| **API Key** | ❌ Not used | ✅ Required |
| **Exposed to Browser** | ✅ Yes | ❌ No |
| **Bundle Size** | Included | Server-only |

⚠️ **Never expose `APPWRITE_API_KEY` to the client!**

---

### 🚫 Common Mistakes

❌ **Wrong:**
```typescript
// Using server SDK in client component
'use client';
import { serverDatabases } from '@/lib/appwrite/server'; // ERROR!
```

✅ **Correct:**
```typescript
// Client component
'use client';
import { databases } from '@/lib/appwrite/client';

// Server component
import { serverDatabases } from '@/lib/appwrite/server';
```

---

### 🔧 Environment Variables

**Client (public - exposed to browser):**
```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
```

**Server (private - never exposed):**
```bash
APPWRITE_API_KEY=your-secret-api-key
```

See `.env.example` for complete configuration.

---

### 📚 Related Documentation

- [Appwrite Client SDK Docs](https://appwrite.io/docs/sdks#client)
- [Appwrite Server SDK Docs](https://appwrite.io/docs/sdks#server)
- [Next.js 13+ App Router](https://nextjs.org/docs/app)
- Project Files:
  - `src/lib/appwrite/client.ts` - Client SDK wrapper
  - `src/lib/appwrite/server.ts` - Server SDK wrapper
  - `src/lib/appwrite/config.ts` - Shared configuration
  - `src/lib/api/appwrite-api.ts` - API layer

---

## 🔄 Mock Backend

Mock data kullanılıyor. Gerçek backend için \`src/lib/api/mock-api.ts\` dosyasını düzenleyin.

---

## 🚀 Build & Deploy

\`\`\`bash
npm run build
npm start
\`\`\`

Self-hosted veya Vercel'e deploy edebilirsiniz.

---

**⚡ Hazırlayan:** Claude Code
**📅 Tarih:** 27 Ekim 2025
