import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend({
  toHaveBeenCalledAfter(received, expected) {
    const pass = received.mock.invocationCallOrder[0] > expected.mock.invocationCallOrder[0];
    return {
      pass,
      message: () => pass
        ? `expected ${received.getMockName()} not to be called after ${expected.getMockName()}`
        : `expected ${received.getMockName()} to be called after ${expected.getMockName()}`,
    };
  },
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Mock ResizeObserver
class ResizeObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
});

// Mock timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Suppress specific console errors
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Not implemented: window.scrollTo') ||
     args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('The current testing environment is not configured to support act'))
  ) {
    return;
  }
  originalError.call(console, ...args);
}; 