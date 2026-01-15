// lib/mocks/config.ts

export type MockMode = 'off' | 'static' | 'random';

// Priority: UI switch (dev only) > env var > config file default
let runtimeMockMode: MockMode | null = null;

export function setRuntimeMockMode(mode: MockMode) {
  if (process.env.NODE_ENV !== 'production') {
    runtimeMockMode = mode;
  }
}

export function getMockMode(): MockMode {
  if (process.env.NODE_ENV !== 'production' && runtimeMockMode) {
    return runtimeMockMode;
  }
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MOCK_MODE) {
    return process.env.NEXT_PUBLIC_MOCK_MODE as MockMode;
  }
  return defaultMockMode;
}

export const defaultMockMode: MockMode = 'static';
