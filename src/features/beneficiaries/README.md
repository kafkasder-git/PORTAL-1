# Beneficiaries Feature Module

## Overview
This module encapsulates all beneficiary-related functionality for the charity management system.

## Structure

```
beneficiaries/
├── components/
│   ├── BeneficiaryForm.tsx          # Basic beneficiary form
│   └── AdvancedBeneficiaryForm.tsx  # Advanced form with full fields
│
├── hooks/
│   ├── useBeneficiaries.ts          # Fetch beneficiaries
│   └── useBeneficiaryMutation.ts    # Create/update/delete
│
├── services/
│   └── beneficiaryService.ts        # Business logic & API calls
│
├── stores/
│   └── beneficiaryStore.ts          # Zustand store
│
├── types/
│   └── beneficiary.types.ts         # TypeScript definitions
│
├── validations/
│   └── beneficiary.ts               # Zod validation schemas
│
└── index.ts                         # Module exports
```

## Key Features

- ✅ Beneficiary CRUD operations
- ✅ Advanced form with validation
- ✅ Quick add functionality
- ✅ Mernis validation support
- ✅ Photo upload capability
- ✅ Search and filter
- ✅ Family member management

## Dependencies

- `@/entities` - Domain entities
- `@/shared/lib` - Shared utilities
- `@/shared/components/ui` - UI components
- `react-hook-form` - Form management
- `@tanstack/react-query` - Data fetching

## Usage

```typescript
// Import types
import { Beneficiary, BeneficiaryFormData } from '@/features/beneficiaries';

// Import components
import { BeneficiaryForm } from '@/features/beneficiaries';

// Import hooks
import { useBeneficiaries } from '@/features/beneficiaries';
```
