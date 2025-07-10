// Test setup file
import { jest } from '@jest/globals';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock DOM elements for testing
global.document = {
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  createElement: jest.fn(() => ({
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
    },
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
  addEventListener: jest.fn(),
};

// Mock window
global.window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Suppress console.log in tests unless debugging
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
  };
}