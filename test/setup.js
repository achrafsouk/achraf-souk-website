// Test setup configuration
import { beforeEach, afterEach } from 'vitest';

// Mock DOM elements that might not be available in test environment
beforeEach(() => {
  // Reset DOM to a clean state before each test
  document.body.innerHTML = '';
  
  // Mock console methods to avoid noise in test output
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
  };

  // Mock window.open for external link testing
  global.window.open = vi.fn();

  // Mock IntersectionObserver for lazy loading tests
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock scrollIntoView for smooth scrolling tests
  Element.prototype.scrollIntoView = vi.fn();

  // Mock matches method for element matching tests
  Element.prototype.matches = vi.fn().mockImplementation(function(selector) {
    // Handle different selector types
    if (selector.startsWith('.')) {
      // Class selector
      const className = selector.substring(1);
      return this.classList && this.classList.contains(className);
    } else if (selector.startsWith('#')) {
      // ID selector
      const id = selector.substring(1);
      return this.id === id;
    } else {
      // Tag selector
      return this.tagName && this.tagName.toLowerCase() === selector.toLowerCase();
    }
  });
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks();
});

// Global test utilities
global.createMockElement = (tag, attributes = {}) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

global.createMockHTML = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};