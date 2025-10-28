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

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Tarayıcıda aç
# http://localhost:3000
```

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
- ✅ Görevler (Kanban Board)
- ✅ Toplantılar (Calendar View)
- ✅ Mesajlar (Toplu + Kurum İçi)
- ✅ Parametreler (Sistem Parametreleri)
- ✅ Sidebar Navigation
- ✅ Database Collections & Storage
- ✅ File Upload (Makbuz/Resimler)
- ✅ Form Validations (Zod)
- ✅ CRUD Operations
- ✅ Global Search (Cmd+K)
- ✅ Notifications System
- ✅ Real-time Currency Rates
- ✅ Message Statistics
- ✅ Error Monitoring (Sentry)
- ✅ Settings Management (System-wide configuration)
- ✅ User Management (CRUD with role-based permissions)

---

## 📁 Proje Yapısı

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/api/            # Mock API
├── stores/             # Zustand stores
├── data/mock/          # Mock JSON data
└── types/              # TypeScript types
```

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

## 👥 User Management

### Features

**User CRUD Operations:**
- Create new users with role assignment
- Edit user details (name, role, avatar, status)
- Delete users (with confirmation)
- Toggle user status (active/inactive)

**Role-Based Access Control:**
- 6 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
- Permission display (read-only, based on ROLE_PERMISSIONS)
- Current user can't create users with higher role
- Can't delete or deactivate self

**Search & Filters:**
- Search by name or email
- Filter by role (All, SUPER_ADMIN, ADMIN, etc.)
- Filter by status (All, Active, Inactive)
- Pagination (20 users per page)

**Permissions Required:**
- `USERS_READ` - View user list
- `USERS_CREATE` - Create new users
- `USERS_UPDATE` - Edit users and toggle status
- `USERS_DELETE` - Delete users

**Usage:**
```typescript
import { appwriteApi } from '@/lib/api/appwrite-api';

// Get users with filters
const { data } = await appwriteApi.users.getUsers({
  page: 1,
  limit: 20,
  search: 'john',
  filters: {
    role: 'ADMIN',
    isActive: true
  }
});

// Create user
await appwriteApi.users.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'MEMBER',
  isActive: true
});

// Update user
await appwriteApi.users.updateUser(userId, {
  role: 'MANAGER',
  isActive: false
});

// Delete user
await appwriteApi.users.deleteUser(userId);
```

**Role Permissions:**

| Role | Description | Key Permissions |
|------|-------------|----------------|
| SUPER_ADMIN | Full system access | All permissions |
| ADMIN | Administrative access | Most permissions (can't manage super admins) |
| MANAGER | Business operations | CRUD on beneficiaries, donations, tasks, meetings |
| MEMBER | Standard user | Read most, create/update own items |
| VIEWER | Read-only access | Read-only permissions |
| VOLUNTEER | Limited access | Limited create/read permissions |

**Validation:**
- Name: 2-100 characters, required
- Email: Valid email format, required, unique
- Role: One of 6 valid roles, required
- Avatar: Valid URL, optional
- Status: Boolean, default true

**Security:**
- Email field disabled in edit mode (can't change email)
- Role-based UI (buttons hidden if no permission)
- Self-protection (can't delete/deactivate self)
- Permission checks on both client and server

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open global search |
| `Esc` | Close dialogs/modals |
| `Arrow Up/Down` | Navigate search results |
| `Enter` | Select search result |
| `Tab` | Navigate form fields |
| `Shift+Tab` | Navigate backwards |

---

## 🔄 Mock Backend

Mock data kullanılıyor. Gerçek backend için `src/lib/api/mock-api.ts` dosyasını düzenleyin.

---

## 📊 Production Readiness

### Quality Metrics

- **TypeScript Errors:** 0 ✅
- **Linter Errors:** 0 ✅
- **Unit Tests:** 79 tests passing ✅
- **E2E Tests:** 25+ tests passing ✅
- **Code Coverage:** Good ✅
- **Bundle Size:** Optimized ✅

### Performance

- **Lighthouse Performance:** > 90 (Target)
- **Lighthouse Accessibility:** > 95 (Target)
- **First Contentful Paint:** < 1.8s (Target)
- **Time to Interactive:** < 3.8s (Target)

### Security

- ✅ HTTPS (production)
- ✅ CSRF Protection
- ✅ Input Sanitization (XSS prevention)
- ✅ Rate Limiting
- ✅ File Upload Security
- ✅ Environment Validation
- ✅ Error Monitoring (Sentry)
- ✅ Audit Logging

### Documentation

- ✅ README.md
- ✅ CHANGELOG.md
- ✅ SECURITY.md
- ✅ TESTING-CHECKLIST.md
- ✅ IMPLEMENTATION-STATUS.md
- ✅ SENTRY-SETUP.md
- ✅ Production Build Guide
- ✅ Lighthouse Audit Guide

### Deployment

See `docs/PRODUCTION-BUILD-GUIDE.md` for detailed deployment instructions.

**Quick Deploy:**
```bash
# Build
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel --prod
```

---

**⚡ Version:** 1.0.0
**📅 Last Updated:** 28 Ekim 2025
**🚀 Status:** Production Ready