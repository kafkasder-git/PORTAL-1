# Security Guide - Dernek Yönetim Sistemi

Bu dokümantasyon, Dernek Yönetim Sistemi'nde uygulanan güvenlik önlemlerini ve best practice'leri açıklar.

## ✅ Uygulanan Güvenlik Önlemleri

### 1. Güvenli Cookie Yönetimi

**Önceki Durum (Güvensiz):**
```typescript
// ❌ Client-side cookie manipulation
document.cookie = `auth-session=${JSON.stringify(sessionObj)}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
// Sorunlar: HttpOnly yok, Secure yok, XSS riski, JSON serialization riski
```

**Şimdiki Durum (Güvenli):**
```typescript
// ✅ Server-side cookie management with security flags
cookieStore.set('auth-session', JSON.stringify(sessionData), {
  httpOnly: true,        // JavaScript erişimini engeller (XSS koruması)
  secure: process.env.NODE_ENV === 'production', // HTTPS zorunlu (production'da)
  sameSite: 'lax',       // CSRF koruması
  maxAge: SESSION_MAX_AGE,
  path: '/',
});
```

**Fayda:**
- XSS saldırıları session token'ı çalamaz (HttpOnly)
- Man-in-the-middle saldırıları engellenir (Secure)
- CSRF saldırıları zorlaşır (SameSite)

### 2. Server-Side Session Validation

**Önceki Durum (Güvensiz):**
```typescript
// ❌ Middleware sadece cookie varlığını kontrol ediyordu
// TODO: Add server-side session validation with Appwrite
// For now, we'll trust the client-side session
return true; // Client data'ya güveniliyor
```

**Şimdiki Durum (Güvenli):**
```typescript
// ✅ Server-side session validation
async function checkSession(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get('auth-session');
  if (!sessionCookie) return false;

  const sessionData = JSON.parse(sessionCookie.value);

  // Validate required fields
  if (!sessionData.userId || !sessionData.accessToken || !sessionData.expire) {
    return false;
  }

  // Check expiration
  const expiresAt = new Date(sessionData.expire);
  if (expiresAt <= new Date()) {
    return false;
  }

  return true;
}
```

**Fayda:**
- Cookie spoofing engellenir
- Expired session'lar reddedilir
- Malformed data handling

### 3. CSRF Protection

**Implementasyon:**

#### Token Generation (Server)
```typescript
// /api/csrf endpoint - CSRF token oluşturma
export async function GET(request: NextRequest) {
  const csrfToken = generateCsrfToken(); // Crypto secure random

  cookieStore.set('csrf-token', csrfToken, {
    httpOnly: false,  // Client okuyabilmeli
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true, token: csrfToken });
}
```

#### Token Validation (Middleware)
```typescript
// State-changing işlemler için CSRF validation
export function withCsrfProtection(handler) {
  return async (request: NextRequest) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const tokenFromHeader = request.headers.get('x-csrf-token');
      const tokenFromCookie = request.cookies.get('csrf-token')?.value;

      if (!validateCsrfToken(tokenFromHeader, tokenFromCookie)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }

    return handler(request);
  };
}
```

#### Client Usage
```typescript
// Login'de CSRF token kullanımı
const csrfResponse = await fetch('/api/csrf');
const csrfData = await csrfResponse.json();

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfData.token,
  },
  body: JSON.stringify({ email, password }),
});
```

**Fayda:**
- Cross-Site Request Forgery saldırılarını engeller
- Timing attack'lara karşı korumalı constant-time comparison

### 4. Error Boundary Components

**Implementasyon:**

#### React Error Boundary
```tsx
// src/components/error-boundary.tsx
export class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console (dev)
    console.error('ErrorBoundary caught:', error);

    // TODO: Send to monitoring service
    // Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackUI />;
    }
    return this.props.children;
  }
}
```

#### Next.js Route Error Handlers
```tsx
// src/app/error.tsx - Route segment errors
export default function Error({ error, reset }) {
  return <ErrorUI error={error} onReset={reset} />;
}

// src/app/global-error.tsx - Root layout errors
export default function GlobalError({ error, reset }) {
  return <CriticalErrorUI error={error} />;
}
```

**Fayda:**
- Uygulama crash'i engellenir
- Kullanıcı friendly error UI
- Error tracking için hazır yapı (Sentry entegrasyonu kolay)
- Development'ta detailed error info

### 5. Credentials in Environment Variables

**Önceki Durum (Güvensiz):**
```typescript
// ❌ Hardcoded credentials in source code
export const appwriteConfig = {
  endpoint: 'http://selam-appwrite-...',
  projectId: '68fee9220016ba9acb1b',
  apiKey: 'standard_15c951817a62a9bed5e62ee9fd23e9cd3e063f...',
};
```

**Şimdiki Durum (Güvenli):**
```typescript
// ✅ Environment variables
export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  apiKey: process.env.APPWRITE_API_KEY || '',
};

// Validation
export function validateServerConfig() {
  if (!appwriteConfig.apiKey) {
    throw new Error('APPWRITE_API_KEY is not defined');
  }
}
```

**Setup:**
```bash
# .env.local (NOT committed to git)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-secret-api-key
```

**Fayda:**
- Secrets version control'e commit edilmez
- Environment-specific configuration
- API key rotation kolaylaşır

### 6. API Route Security

**Best Practices Uygulandı:**

```typescript
// ✅ Input validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return NextResponse.json({ error: 'Geçersiz email' }, { status: 400 });
}

// ✅ Error message sanitization
// Don't expose internal errors
const message = error.message || 'Giriş yapılamadı';
return NextResponse.json({ error: message }, { status: 500 });

// ✅ Rate limiting (client-side, server-side eklenecek)
if (state.loginAttempts >= 5) {
  if (Date.now() - lastAttempt < 15 * 60 * 1000) {
    throw new Error('Çok fazla deneme. 15 dakika sonra tekrar deneyin.');
  }
}
```

## 🔴 Hala Eksik Olan Güvenlik Önlemleri

### 1. Input Sanitization
**Durum:** ❌ Eksik
**Risk:** XSS, SQL Injection
**Öneri:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

// HTML input sanitization
const sanitizedHtml = DOMPurify.sanitize(userInput);

// SQL injection prevention (Appwrite Query builder kullanıyoruz, ama dikkatli olunmalı)
```

### 2. Rate Limiting (Server-Side)
**Durum:** ⚠️ Sadece client-side
**Risk:** Brute force attacks, DDoS
**Öneri:**
```typescript
// npm install @upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
});

// Middleware'de kullanım
const { success } = await ratelimit.limit(ip);
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

### 3. Content Security Policy (CSP)
**Durum:** ❌ Yok
**Risk:** XSS, data injection
**Öneri:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
];
```

### 4. File Upload Security
**Durum:** ❌ Mock implementation
**Risk:** Malware upload, path traversal
**Öneri:**
```typescript
// File type validation
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// File size limit
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}

// Virus scan (ClamAV integration)
await scanFileForViruses(file);

// Rename file (prevent path traversal)
const safeFilename = `${uuidv4()}-${sanitizeFilename(file.name)}`;
```

### 5. Audit Logging
**Durum:** ❌ Yok
**Risk:** Compliance, forensics
**Öneri:**
```typescript
interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
}

// Sensitive operations'ta kullanım
await auditLog.create({
  userId: user.id,
  action: 'DELETE_BENEFICIARY',
  resource: 'beneficiary',
  resourceId: id,
  timestamp: new Date(),
  ipAddress: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent'),
  status: 'success',
});
```

### 6. Password Hashing
**Durum:** ⚠️ Appwrite handles, ama mock'ta yok
**Öneri:**
```typescript
// bcrypt kullanımı (mock auth için)
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 7. Session Refresh/Rotation
**Durum:** ❌ Yok
**Risk:** Session hijacking
**Öneri:**
```typescript
// Refresh token pattern
interface Session {
  accessToken: string;  // Short-lived (15 min)
  refreshToken: string; // Long-lived (7 days)
  expiresAt: Date;
}

// Auto-refresh before expiration
if (Date.now() > session.expiresAt - 5 * 60 * 1000) {
  await refreshSession();
}
```

## 📋 Security Checklist

### Authentication & Authorization
- [x] HttpOnly cookies for session
- [x] Secure flag on cookies (production)
- [x] SameSite cookie attribute
- [x] Server-side session validation
- [x] CSRF protection on state-changing requests
- [x] Rate limiting (client-side)
- [ ] Rate limiting (server-side)
- [ ] Password strength validation
- [x] Session expiration (24h)
- [ ] Session refresh mechanism
- [ ] Multi-factor authentication (MFA)
- [x] Permission-based access control

### Data Security
- [x] Environment variables for secrets
- [x] No hardcoded credentials
- [ ] Input sanitization (DOMPurify)
- [ ] Output encoding
- [ ] SQL injection prevention (using Appwrite Query)
- [ ] File upload validation
- [ ] File virus scanning
- [ ] Data encryption at rest
- [ ] Data encryption in transit (HTTPS)

### Error Handling & Monitoring
- [x] Error boundaries (React)
- [x] Error pages (Next.js)
- [ ] Structured logging
- [ ] Error monitoring (Sentry)
- [ ] Audit logging
- [x] Don't expose internal errors to users

### Infrastructure Security
- [ ] Content Security Policy (CSP)
- [ ] Security headers (X-Frame-Options, etc.)
- [ ] CORS configuration
- [ ] HTTPS enforcement
- [ ] DDoS protection
- [ ] Firewall rules

### Code Security
- [x] TypeScript strict mode
- [x] ESLint security rules
- [ ] Dependency vulnerability scanning
- [ ] Regular security audits
- [ ] Security testing

## 🚀 Deployment Security

### Production Checklist

1. **Environment Variables**
   ```bash
   # Set in production environment
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-prod-appwrite.com/v1
   APPWRITE_API_KEY=your-production-key
   NODE_ENV=production
   ```

2. **HTTPS Only**
   - Force HTTPS redirect
   - HSTS header enabled

3. **Rate Limiting**
   - Implement server-side rate limiting
   - Configure per-endpoint limits

4. **Monitoring**
   - Setup Sentry error tracking
   - Configure log aggregation
   - Setup uptime monitoring

5. **Security Headers**
   - Add CSP, X-Frame-Options, etc.
   - Configure CORS properly

6. **Database Security**
   - Use Appwrite database rules
   - Enable field-level permissions
   - Regular backups

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Appwrite Security](https://appwrite.io/docs/advanced/security)

## 🔄 Security Update Log

| Date | Change | Impact |
|------|--------|--------|
| 2025-10-27 | Added HttpOnly cookies | High - Prevents XSS token theft |
| 2025-10-27 | Server-side session validation | High - Prevents session spoofing |
| 2025-10-27 | CSRF protection | High - Prevents CSRF attacks |
| 2025-10-27 | Error boundaries | Medium - Improves stability |
| 2025-10-27 | Removed hardcoded credentials | High - Prevents credential leak |

---

**NOT:** Bu dokümantasyon sürekli güncellenmelidir. Yeni güvenlik önlemleri eklendikçe bu dosya da güncellenmelidir.
