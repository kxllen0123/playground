import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to get fresh config
    vi.resetModules();
    // Clone env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should throw error when required env vars are missing in non-test environment', async () => {
    // Remove test environment flag
    delete process.env.NODE_ENV;
    delete process.env.VITEST;
    
    // Remove required env vars
    delete process.env.DIFY_API_KEY;
    delete process.env.DIFY_API_ENDPOINT;

    // Import config dynamically to trigger validation
    await expect(async () => {
      await import('@/lib/config');
    }).rejects.toThrow('缺少必需的环境变量');
  });

  it('should not throw error when required env vars are missing in test environment', async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.VITEST = 'true';
    
    // Remove required env vars
    delete process.env.DIFY_API_KEY;
    delete process.env.DIFY_API_ENDPOINT;

    // Should not throw
    const { config } = await import('@/lib/config');
    expect(config).toBeDefined();
    expect(config.dify.apiKey).toBe('test-api-key');
    expect(config.dify.apiEndpoint).toBe('https://api.dify.ai/v1');
  });

  it('should use environment variables when provided', async () => {
    process.env.DIFY_API_KEY = 'custom-key';
    process.env.DIFY_API_ENDPOINT = 'https://custom.api.com';
    process.env.DIFY_ENV = 'production';
    process.env.FEEDBACK_MAX_LENGTH = '10000';

    const { config } = await import('@/lib/config');
    
    expect(config.dify.apiKey).toBe('custom-key');
    expect(config.dify.apiEndpoint).toBe('https://custom.api.com');
    expect(config.dify.env).toBe('production');
    expect(config.validation.maxLength).toBe(10000);
  });

  it('should use default values when optional env vars are not provided', async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.VITEST = 'true';
    process.env.DIFY_API_KEY = 'test-key';
    process.env.DIFY_API_ENDPOINT = 'https://api.test.com';
    delete process.env.DIFY_ENV;
    delete process.env.FEEDBACK_MAX_LENGTH;

    const { config } = await import('@/lib/config');
    
    // In test environment, env defaults to 'test'
    expect(config.dify.env).toBe('test');
    expect(config.validation.maxLength).toBe(5000);
    expect(config.validation.minLength).toBe(1);
  });

  it('should use dev as default env in non-test environment', async () => {
    // Remove test environment flags
    delete process.env.NODE_ENV;
    delete process.env.VITEST;
    process.env.DIFY_API_KEY = 'test-key';
    process.env.DIFY_API_ENDPOINT = 'https://api.test.com';
    delete process.env.DIFY_ENV;

    const { config } = await import('@/lib/config');
    
    // In non-test environment, env defaults to 'dev'
    expect(config.dify.env).toBe('dev');
  });

  it('should parse FEEDBACK_MAX_LENGTH as integer', async () => {
    process.env.DIFY_API_KEY = 'test-key';
    process.env.DIFY_API_ENDPOINT = 'https://api.test.com';
    process.env.DIFY_ENV = 'test';
    process.env.FEEDBACK_MAX_LENGTH = '3000';

    const { config } = await import('@/lib/config');
    
    expect(config.validation.maxLength).toBe(3000);
    expect(typeof config.validation.maxLength).toBe('number');
  });
});
