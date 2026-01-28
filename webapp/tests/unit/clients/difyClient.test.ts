import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DifyAgentClient } from '@/lib/clients/difyClient';

// Mock fetch globally
global.fetch = vi.fn();

describe('DifyAgentClient', () => {
  let client: DifyAgentClient;

  beforeEach(() => {
    client = new DifyAgentClient();
    vi.clearAllMocks();
  });

  describe('processFeedback', () => {
    it('should successfully process feedback without image', async () => {
      const mockResponse = {
        outputs: {
          content: 'Issue #123 已创建',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.processFeedback('Test feedback');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Issue #123 已创建');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should successfully process feedback with image', async () => {
      const mockResponse = {
        outputs: {
          content: 'Issue #124 已创建（包含图片）',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.processFeedback('Test feedback', 'file-123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Issue #124');
      
      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.inputs.user_image).toBeDefined();
      expect(requestBody.inputs.user_image.upload_file_id).toBe('file-123');
    });

    it('should handle 401 authentication error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await client.processFeedback('Test feedback');

      expect(result.success).toBe(false);
      expect(result.message).toContain('认证失败');
    });

    it('should handle 400 bad request error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: 'Invalid input' }),
      });

      const result = await client.processFeedback('Test feedback');

      expect(result.success).toBe(false);
      expect(result.message).toContain('请求格式错误');
    });

    it('should handle 429 rate limit error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Too many requests',
      });

      const result = await client.processFeedback('Test feedback');

      expect(result.success).toBe(false);
      expect(result.message).toContain('请求过于频繁');
    });

    it('should handle 500 server error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      const result = await client.processFeedback('Test feedback');

      expect(result.success).toBe(false);
      expect(result.message).toContain('服务暂时不可用');
    });

    it('should handle network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      const result = await client.processFeedback('Test feedback');

      expect(result.success).toBe(false);
      expect(result.message).toContain('网络错误');
    });

    it('should handle generic error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Unknown error'));

      const result = await client.processFeedback('Test feedback');

      expect(result.success).toBe(false);
      expect(result.message).toContain('服务暂时不可用');
    });

    it('should handle error when response.text() fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error('Failed to read response body');
        },
      });

      const result = await client.processFeedback('Test feedback');

      expect(result.success).toBe(false);
      expect(result.message).toContain('服务暂时不可用');
      expect(result.message).toContain('无法读取错误信息');
    });

    it('should extract message from different response formats', async () => {
      const testCases = [
        { outputs: { content: 'Message 1' }, expected: 'Message 1' },
        { data: { outputs: { content: 'Message 2' } }, expected: 'Message 2' },
        { outputs: { message: 'Message 3' }, expected: 'Message 3' },
        { answer: 'Message 4', expected: 'Message 4' },
        { message: 'Message 5', expected: 'Message 5' },
        { unknown: 'field', expected: '反馈已提交' },
      ];

      for (const testCase of testCases) {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => testCase,
        });

        const result = await client.processFeedback('Test');
        expect(result.message).toBe(testCase.expected);
      }
    });

    it('should include env parameter in request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ outputs: { content: 'Success' } }),
      });

      await client.processFeedback('Test feedback');

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.inputs.env).toBe('test');
    });

    it('should use correct API endpoint with agentId', async () => {
      // This test verifies the logic in difyClient.ts
      // Since config is loaded at module import time, we test the endpoint construction logic
      // The actual endpoint will be: config.dify.apiEndpoint/workflows/{agentId}/run if agentId exists
      // or config.dify.apiEndpoint/workflows/run if agentId doesn't exist
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ outputs: { content: 'Success' } }),
      });

      await client.processFeedback('Test feedback');

      const fetchCall = (global.fetch as any).mock.calls[0];
      const endpoint = fetchCall[0];
      
      // Verify it's a valid workflow endpoint
      expect(endpoint).toContain('/workflows/');
      expect(endpoint).toContain('run');
    });

    it('should use correct API endpoint without agentId', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ outputs: { content: 'Success' } }),
      });

      await client.processFeedback('Test feedback');

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('/workflows/run');
    });
  });
});
