// Unified API resolver (mock | appwrite)
// Import concrete implementations
import * as mock from './mock-api';
import { appwriteApi, parametersApi as realParametersApi, aidApplicationsApi as realAidApplicationsApi } from './appwrite-api';

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

  // Beneficiaries (match appwriteApi surface where possible)
  beneficiaries: {
    getBeneficiaries: (params?: any) => mock.getBeneficiaries(params),
    getBeneficiary: (id: string) => mock.getBeneficiary(id),
    createBeneficiary: (data: any) => mock.createBeneficiary(data as any),
    updateBeneficiary: (id: string, data: any) => mock.updateBeneficiary(id, data as any),
    deleteBeneficiary: (id: string) => mock.deleteBeneficiary(id),
  },

  donations: {
    getDonations: (params?: any) => ({ data: [], error: null, total: 0 }),
    getDonation: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
    createDonation: async (_data: any) => ({ data: null, error: 'Not implemented in mock' }),
    updateDonation: async (_id: string, _data: any) => ({ data: null, error: 'Not implemented in mock' }),
    deleteDonation: async (_id: string) => ({ data: null, error: null }),
  },

  tasks: {
    getTasks: async (_params?: any) => ({ data: [], error: null, total: 0 }),
    getTask: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
    createTask: async (_data: any) => ({ data: null, error: 'Not implemented in mock' }),
    updateTask: async (_id: string, _data: any) => ({ data: null, error: 'Not implemented in mock' }),
    deleteTask: async (_id: string) => ({ data: null, error: null }),
  },

  meetings: {
    getMeetings: async (_params?: any) => ({ data: [], error: null, total: 0 }),
  },

  messages: {
    getMessages: async (_params?: any) => ({ data: [], error: null, total: 0 }),
  },

  storage: {
    uploadFile: async (_args: any) => ({ data: null, error: 'Not implemented in mock' }),
    getFile: async (_bucketId: string, _fileId: string) => ({ data: null, error: 'Not implemented in mock' }),
    deleteFile: async (_bucketId: string, _fileId: string) => ({ data: null, error: null }),
    getFileDownload: async (_bucketId: string, _fileId: string) => '',
    getFilePreview: async (_bucketId: string, _fileId: string) => '',
  },

  dashboard: {
    getMetrics: async () => ({ data: { totalBeneficiaries: 0, totalDonations: 0, totalDonationAmount: 0, activeUsers: 0 }, error: null }),
  },
} as const;

// Selected API surface
export const api = provider === 'appwrite' ? appwriteApi : mockApi;

// Expose parameters and aid applications APIs
export const parametersApi = provider === 'appwrite'
  ? realParametersApi
  : {
      getParametersByCategory: async (_category: string) => ({ data: [], error: null, total: 0 }),
      getAllParameters: async (_params?: any) => ({ data: [], error: null, total: 0 }),
      getParameter: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
      createParameter: async (_data: any) => ({ data: null, error: 'Not implemented in mock' }),
      updateParameter: async (_id: string, _data: any) => ({ data: null, error: 'Not implemented in mock' }),
      deleteParameter: async (_id: string) => ({ data: null, error: null }),
    };

export const aidApplicationsApi = provider === 'appwrite'
  ? realAidApplicationsApi
  : {
      getAidApplications: async (_params?: any) => ({ data: [], error: null, total: 0 }),
      getAidApplication: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
      createAidApplication: async (_data: any) => ({ data: null, error: 'Not implemented in mock' }),
      updateAidApplication: async (_id: string, _data: any) => ({ data: null, error: 'Not implemented in mock' }),
      deleteAidApplication: async (_id: string) => ({ data: null, error: null }),
      updateStage: async (_id: string, _stage: string) => ({ data: null, error: 'Not implemented in mock' }),
    };

// Also export named for compatibility if needed
export type SelectedApi = typeof api;

// Default export for convenience
export default api;