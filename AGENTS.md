# AGENTS.md - Dernek Yönetim Sistemi

## Build/Lint/Test Commands

**Development:** `npm run dev`
**Build:** `npm run build`
**Lint:** `npm run lint`
**Type Check:** `npm run typecheck`
**Unit Tests:** `npm run test` (Vitest)
**Single Test:** `npm run test -- <pattern>` or `vitest run <file>`
**E2E Tests:** `npm run e2e` (Playwright)
**Coverage:** `npm run test:coverage`

## Architecture

**Framework:** Next.js 16 + React 19 + TypeScript
**Backend:** Appwrite BaaS (dual SDK: client for browser, server for Node.js)
**State:** Zustand with immer + persist + devtools
**UI:** shadcn/ui + Radix UI + Tailwind CSS
**Turkish Context:** UI in Turkish, phone +90 5XX XXX XX XX, currency ₺, dates DD.MM.YYYY

## Code Style Guidelines

**Imports:** Path aliases `@/` for src/, never mix Appwrite client/server SDKs
**Types:** Strict TypeScript, Zod schemas for validation
**Forms:** React Hook Form + Zod + sanitization from `src/lib/sanitization.ts`
**State:** Zustand pattern: `create<Store>()(devtools(subscribeWithSelector(persist(immer(set => ({ ... }))))))`
**Security:** CSRF tokens, input sanitization, HttpOnly cookies, Sentry monitoring
**Routes:** Turkish naming `/yardim/ihtiyac-sahipleri`
