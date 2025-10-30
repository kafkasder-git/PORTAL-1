// Unified API resolver (mock | appwrite)
// Import concrete implementations
import * as mock from './mock-api';
import { appwriteApi, parametersApi as realParametersApi, aidApplicationsApi as realAidApplicationsApi } from './appwrite-api';
import { appwriteServerApi } from './appwrite-server-api';

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

  // Users API
  users: {
    getUsers: async (params?: any) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      // Return mock users list
      const mockUsers = [
        { $id: 'user-1', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN' },
        { $id: 'user-2', name: 'Manager User', email: 'manager@test.com', role: 'MANAGER' },
        { $id: 'user-3', name: 'Member User', email: 'member@test.com', role: 'MEMBER' },
      ];
      return { data: mockUsers, error: null, total: mockUsers.length };
    },
    getUser: async (id: string) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      const mockUsers: any = {
        'user-1': { $id: 'user-1', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN' },
        'user-2': { $id: 'user-2', name: 'Manager User', email: 'manager@test.com', role: 'MANAGER' },
        'user-3': { $id: 'user-3', name: 'Member User', email: 'member@test.com', role: 'MEMBER' },
      };
      return { data: mockUsers[id] || null, error: null };
    },
    createUser: async (data: any) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      const newUser = {
        $id: `user-${Date.now()}`,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...data,
      };
      return { data: newUser, error: null };
    },
    updateUser: async (id: string, data: any) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      const updatedUser = {
        $id: id,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...data,
      };
      return { data: updatedUser, error: null };
    },
    deleteUser: async (_id: string) => ({ data: null, error: null }),
  },

  // Beneficiaries (Appwrite-aligned mock surface)
  beneficiaries: {
    getBeneficiaries: (params?: any) => mock.appwriteGetBeneficiaries(params),
    getBeneficiary: (id: string) => mock.appwriteGetBeneficiary(id),
    createBeneficiary: (data: any) => mock.appwriteCreateBeneficiary(data as any),
    updateBeneficiary: (id: string, data: any) => mock.appwriteUpdateBeneficiary(id, data as any),
    deleteBeneficiary: (id: string) => mock.appwriteDeleteBeneficiary(id),
  },

  donations: {
    getDonations: async (params?: any) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      return { data: [], error: null, total: 0 };
    },
    getDonation: async (id: string) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      return { data: null, error: 'Donation not found' };
    },
    createDonation: async (data: any) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      const newDonation = {
        $id: `donation-${Date.now()}`,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...data,
      };
      return { data: newDonation, error: null };
    },
    updateDonation: async (id: string, data: any) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      const updatedDonation = {
        $id: id,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...data,
      };
      return { data: updatedDonation, error: null };
    },
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
    createMeeting: async (_data: any) => ({ data: null, error: 'Not implemented in mock' }),
    updateMeeting: async (_id: string, _data: any) => ({ data: null, error: 'Not implemented in mock' }),
    updateMeetingStatus: async (_id: string, _status: string) => ({ data: null, error: 'Not implemented in mock' }),
    deleteMeeting: async (_id: string) => ({ data: null, error: null }),
  },

  messages: {
    getMessages: async (_params?: any) => ({ data: [], error: null, total: 0 }),
    getMessage: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
    createMessage: async (_data: any) => ({ data: null, error: 'Not implemented in mock' }),
    updateMessage: async (_id: string, _data: any) => ({ data: null, error: 'Not implemented in mock' }),
    sendMessage: async (_id: string) => ({ data: null, error: 'Not implemented in mock' }),
    deleteMessage: async (_id: string) => ({ data: null, error: null }),
    markAsRead: async (_id: string, _userId: string) => ({ data: null, error: 'Not implemented in mock' }),
  },

  storage: {
    uploadFile: async (args: any) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      const uploadedFile = {
        $id: `file-${Date.now()}`,
        bucketId: args.bucketId || 'documents',
        name: args.file?.name || 'uploaded-file',
        size: args.file?.size || 0,
        mimeType: args.file?.type || 'application/octet-stream',
        $createdAt: new Date().toISOString(),
      };
      return { data: uploadedFile, error: null };
    },
    getFile: async (_bucketId: string, _fileId: string) => {
      const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));
      await delay();
      return { data: null, error: 'File not found in mock' };
    },
    deleteFile: async (_bucketId: string, _fileId: string) => ({ data: null, error: null }),
    getFileDownload: async (_bucketId: string, _fileId: string) => '',
    getFilePreview: async (_bucketId: string, _fileId: string) => '',
  },

  dashboard: {
    getMetrics: async () => ({ data: { totalBeneficiaries: 0, totalDonations: 0, totalDonationAmount: 0, activeUsers: 0 }, error: null }),
  },
} as const;

// Selected API surface
const selectedApi = (() => {
  if (provider !== 'appwrite') return mockApi;
  // Use server API on the server, client API in the browser
  return typeof window === 'undefined' ? appwriteServerApi : appwriteApi;
})();

export const api = selectedApi;

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