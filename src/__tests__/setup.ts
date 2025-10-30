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
    this.root = (options?.root && options.root instanceof Element) ? options.root : null;
    this.rootMargin = options?.rootMargin || '';
    const threshold = options?.threshold;
    this.thresholds = Array.isArray(threshold) ? threshold : typeof threshold === 'number' ? [threshold] : [];
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
