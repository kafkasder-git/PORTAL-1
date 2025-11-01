/**
 * Test Setup File
 * Global test configuration and utilities
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid'),
  },
});

// Mock fetch
global.fetch = vi.fn();

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ReactDOM.render') ||
     args[0].includes('useLayoutEffect'))
  ) {
    return;
  }
  originalWarn(...args);
};

// Create mock module factories
export const createMockService = <T extends Record<string, any>>(methods: T) => {
  const mock = {} as T;
  for (const [key, value] of Object.entries(methods)) {
    mock[key as keyof T] = vi.fn().mockImplementation(value as any);
  }
  return mock;
};

// Test helpers
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'ADMIN' as const,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockBeneficiary = {
  id: 'test-beneficiary-id',
  name: 'Test Beneficiary',
  tc_no: '12345678901',
  phone: '0532 123 45 67',
  status: 'active' as const,
  createdAt: new Date().toISOString(),
};

export const mockDonation = {
  id: 'test-donation-id',
  donor_name: 'Test Donor',
  amount: 500,
  currency: 'TRY' as const,
  status: 'completed' as const,
  createdAt: new Date().toISOString(),
};

// Helper to wait for async operations
export const waitFor = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to create mock API response
export const createMockApiResponse = <T>(data: T, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
};

// Helper to simulate user interactions
export const simulateUserEvent = {
  click: (element: Element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true })),
  change: (element: HTMLInputElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },
  submit: (form: HTMLFormElement) => {
    form.dispatchEvent(new Event('submit', { bubbles: true }));
  },
};
