import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DifyFileUploadClient } from '@/lib/clients/difyFileUpload';

// Mock fetch globally
global.fetch = vi.fn();

describe('DifyFileUploadClient', () => {
  let client: DifyFileUploadClient;
  let mockFile: File;

  beforeEach(() => {
    client = new DifyFileUploadClient();
    mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should successfully upload a file', async () => {
      const mockResponse = {
        id: 'file-123',
        url: 'https://example.com/file-123.png',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.fileId).toBe('file-123');
      expect(result.fileUrl).toBe('https://example.com/file-123.png');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle file_id field in response', async () => {
      const mockResponse = {
        file_id: 'file-456',
        file_url: 'https://example.com/file-456.png',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.fileId).toBe('file-456');
      expect(result.fileUrl).toBe('https://example.com/file-456.png');
    });

    it('should handle download_url field in response', async () => {
      const mockResponse = {
        id: 'file-789',
        download_url: 'https://example.com/download/file-789.png',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.fileUrl).toBe('https://example.com/download/file-789.png');
    });

    it('should handle missing file ID in response', async () => {
      const mockResponse = {
        url: 'https://example.com/file.png',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toContain('未能获取文件 ID');
    });

    it('should handle 401 authentication error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toContain('认证失败');
    });

    it('should handle 400 bad request error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: 'Invalid file type' }),
      });

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件上传失败');
      expect(result.message).toContain('Invalid file type');
    });

    it('should handle 500 server error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件上传失败');
    });

    it('should handle network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toContain('网络错误');
    });

    it('should handle generic error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Unknown error'));

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件上传失败');
    });

    it('should handle error when response.text() fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error('Failed to read response body');
        },
      });

      const result = await client.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.message).toContain('文件上传失败');
    });

    it('should send correct request format', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'file-123' }),
      });

      await client.uploadFile(mockFile);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('/files/upload');
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers.Authorization).toContain('Bearer');
      expect(fetchCall[1].body).toBeInstanceOf(FormData);
    });
  });
});
