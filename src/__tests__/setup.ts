import '@testing-library/jest-dom'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: readonly number[] = [];
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '';
    this.thresholds = options?.threshold || [];
  }
  
  observe(element: Element) {
    // Mock implementation
  }
  
  unobserve(element: Element) {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};
