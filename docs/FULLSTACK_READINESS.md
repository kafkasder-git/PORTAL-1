# Full-Stack Readiness Checklist

This project is designed to run in two modes:
- mock provider (development without backend)
- appwrite provider (full-stack with Appwrite backend)

Follow these steps to make the application production-ready and fully usable.

## 1) Configure Environment

Create `.env.local` and set:

```
# Backend provider
BACKEND_PROVIDER=appwrite
NEXT_PUBLIC_BACKEND_PROVIDER=appwrite

# Appwrite configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://<your-appwrite-endpoint>
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
APPWRITE_API_KEY=<your-server-api-key>

# Database and buckets
NEXT_PUBLIC_DATABASE_ID=dernek_db
```

Optional buckets and collection IDs are defined in `src/lib/appwrite/config.ts`.

## 2) Setup Appwrite Backend

Run the setup script to create required collections and buckets:

```
npx tsx scripts/setup-appwrite.ts
```

This will create:
- Collections: users, beneficiaries, donations, parameters, tasks, meetings, messages, aid_applications, etc.
- Buckets: documents, receipts, photos, reports

You can re-run safely; it is idempotent.

## 3) Enable Server API Surface

Server-side API routes added:
- /api/donations (GET, POST)
- /api/donations/[id] (GET, PUT, DELETE)
- /api/tasks (GET, POST)
- /api/tasks/[id] (GET, PUT, DELETE)
- /api/meetings (GET, POST)
- /api/meetings/[id] (GET, PUT, DELETE)
- /api/messages (GET, POST)
- /api/messages/[id] (GET, PUT, DELETE, POST->send)
- /api/storage/upload (POST multipart)

These use the server-side Appwrite SDK via `src/lib/api/appwrite-server-api.ts` when `BACKEND_PROVIDER=appwrite`.

## 4) Client-Side Integration

Client components use `api` abstraction:
- In browser, when `NEXT_PUBLIC_BACKEND_PROVIDER=appwrite`, they talk directly to Appwrite via client SDK.
- On the server (API routes), they use the server SDK automatically.

No changes needed in components; ensure envs are set.

## 5) Authentication

Current login route is mock-based for development:
- Email: admin@test.com
- Password: admin123

For production:
- Integrate Appwrite Account login (client SDK) and call a server endpoint to set an HttpOnly session cookie for SSR/route guards.
- Alternatively, rely on Appwrite sessions entirely on the client and tighten API route permissions using CSRF + role checks.

## 6) Security Headers

Production security headers added in `next.config.ts`:
- HSTS (Strict-Transport-Security)
- Content-Security-Policy (baseline)

Adjust CSP according to your external resources.

## 7) CSRF and Rate Limiting

- CSRF protection is applied to state-changing API routes.
- Consider enabling distributed rate limiting (Upstash/Redis) for production traffic.

## 8) Testing

- Unit tests: `npm run test`
- E2E tests: `npm run e2e`

Updated tests expect:
- Sidebar test IDs and state classes
- Login flow compatible with relaxed password check
- Donations/Beneficiaries UI present

## 9) Deployment

- Build: `npm run build`
- Start: `npm start`

Ensure Appwrite endpoint and project are reachable from your deployment environment.

## 10) Next Steps (Recommended)

- Replace mock auth with Appwrite Account login and server session cookie.
- Add role-based middleware guards to sensitive routes.
- Add uploads antivirus and strict file extension checks.
- Implement distributed rate limiting and audit logs persistence.