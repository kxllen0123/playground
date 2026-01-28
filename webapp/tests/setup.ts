import { beforeAll, afterEach, vi } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
  process.env.DIFY_API_ENDPOINT = 'https://api.dify.ai/v1';
  process.env.DIFY_API_KEY = 'test-api-key';
  process.env.DIFY_ENV = 'test';
  process.env.FEEDBACK_MAX_LENGTH = '5000';
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
