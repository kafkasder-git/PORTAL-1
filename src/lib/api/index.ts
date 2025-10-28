// Unified API resolver (mock | appwrite)
// Import concrete implementations
import * as mock from './mock-api';
import { appwriteApi } from './appwrite-api';

// Infer provider from environment (client-safe first)
const clientProvider = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BACKEND_PROVIDER : undefined;
const serverProvider = process.env.BACKEND_PROVIDER;

// Decide provider with sensible defaults
const provider = (clientProvider || serverProvider || 'mock').toLowerCase();

// Build a light wrapper to align mock functions to appwriteApi shape
const mockApi = {
  // Auth (limited in mock for now)
  auth: {
    // no-op placeholders to keep call sites stable if used
    async login(email: string, password: string) {
      return { session: null, user: { email } as any };
    },
    async getCurrentUser() {
      return { email: 'mock@test.com' } as any;
    },
    async logout() {
      return true;
    },
    async createAccount(email: string, password: string, name: string) {
      return { email, name } as any;
    },
    async updateProfile(_userId: string, _updates: any) {
      return { ok: true } as any;
    },
  },

  // Beneficiaries
  async getBeneficiaries(params?: any) {
    return mock.getBeneficiaries(params);
  },
  async getBeneficiary(id: string) {
    return mock.getBeneficiary(id);
  },
  async createBeneficiary(data: any) {
    return mock.createBeneficiary(data as any);
  },
  async updateBeneficiary(id: string, data: any) {
    return mock.updateBeneficiary(id, data as any);
  },
  async deleteBeneficiary(id: string) {
    return mock.deleteBeneficiary(id);
  },
  async uploadBeneficiaryPhoto(id: string, file: File) {
    return mock.uploadBeneficiaryPhoto(id, file);
  },
  async generateFileNumber(category: string, fundRegion: string) {
    return mock.generateFileNumber(category, fundRegion);
  },
  async getBeneficiaryStats() {
    return mock.getBeneficiaryStats();
  },
  async exportBeneficiaries(params?: any) {
    return mock.exportBeneficiaries(params);
  },
} as const;

// Selected API surface
export const api = provider === 'appwrite' ? appwriteApi : mockApi;

// Also export named for compatibility if needed
export type SelectedApi = typeof api;

// Default export for convenience
export default api;