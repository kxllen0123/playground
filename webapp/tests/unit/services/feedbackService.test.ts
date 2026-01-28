import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeedbackService } from '@/lib/services/feedbackService';

// Mock dependencies
vi.mock('@/lib/validators/feedbackValidator', () => ({
  FeedbackValidator: vi.fn(),
}));

vi.mock('@/lib/clients/difyClient', () => ({
  DifyAgentClient: vi.fn(),
}));

describe('FeedbackService', () => {
  let service: FeedbackService;
  let mockValidator: any;
  let mockDifyClient: any;

  beforeEach(async () => {
    mockValidator = {
      validate: vi.fn(),
      sanitize: vi.fn(),
    };

    mockDifyClient = {
      processFeedback: vi.fn(),
    };

    const { FeedbackValidator } = await import('@/lib/validators/feedbackValidator');
    const { DifyAgentClient } = await import('@/lib/clients/difyClient');

    (FeedbackValidator as any).mockImplementation(() => mockValidator);
    (DifyAgentClient as any).mockImplementation(() => mockDifyClient);

    service = new FeedbackService();
    vi.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should successfully submit valid feedback without image', async () => {
      mockValidator.validate.mockReturnValue({ isValid: true });
      mockValidator.sanitize.mockReturnValue('Sanitized feedback');
      mockDifyClient.processFeedback.mockResolvedValue({
        success: true,
        message: 'Issue #123 已创建',
      });

      const result = await service.submitFeedback('Test feedback');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Issue #123 已创建');
      expect(mockValidator.validate).toHaveBeenCalledWith('Test feedback');
      expect(mockValidator.sanitize).toHaveBeenCalledWith('Test feedback');
      expect(mockDifyClient.processFeedback).toHaveBeenCalledWith(
        'Sanitized feedback',
        undefined
      );
    });

    it('should successfully submit valid feedback with image', async () => {
      mockValidator.validate.mockReturnValue({ isValid: true });
      mockValidator.sanitize.mockReturnValue('Sanitized feedback');
      mockDifyClient.processFeedback.mockResolvedValue({
        success: true,
        message: 'Issue #124 已创建（包含图片）',
      });

      const result = await service.submitFeedback('Test feedback', 'file-123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Issue #124');
      expect(mockDifyClient.processFeedback).toHaveBeenCalledWith(
        'Sanitized feedback',
        'file-123'
      );
    });

    it('should reject invalid feedback', async () => {
      mockValidator.validate.mockReturnValue({
        isValid: false,
        error: '反馈内容不能为空',
      });

      const result = await service.submitFeedback('');

      expect(result.success).toBe(false);
      expect(result.message).toBe('反馈内容不能为空');
      expect(mockValidator.sanitize).not.toHaveBeenCalled();
      expect(mockDifyClient.processFeedback).not.toHaveBeenCalled();
    });

    it('should handle validation error without error message', async () => {
      mockValidator.validate.mockReturnValue({
        isValid: false,
      });

      const result = await service.submitFeedback('Test');

      expect(result.success).toBe(false);
      expect(result.message).toBe('验证失败');
    });

    it('should handle Dify client failure', async () => {
      mockValidator.validate.mockReturnValue({ isValid: true });
      mockValidator.sanitize.mockReturnValue('Sanitized feedback');
      mockDifyClient.processFeedback.mockResolvedValue({
        success: false,
        message: '无法分类此反馈',
      });

      const result = await service.submitFeedback('Test feedback');

      expect(result.success).toBe(false);
      expect(result.message).toBe('无法分类此反馈');
    });

    it('should sanitize content before sending to Dify', async () => {
      const maliciousContent = '<script>alert("xss")</script>Feedback';
      const sanitizedContent = 'Sanitized content';

      mockValidator.validate.mockReturnValue({ isValid: true });
      mockValidator.sanitize.mockReturnValue(sanitizedContent);
      mockDifyClient.processFeedback.mockResolvedValue({
        success: true,
        message: 'Success',
      });

      await service.submitFeedback(maliciousContent);

      expect(mockValidator.sanitize).toHaveBeenCalledWith(maliciousContent);
      expect(mockDifyClient.processFeedback).toHaveBeenCalledWith(
        sanitizedContent,
        undefined
      );
    });

    it('should handle long feedback content', async () => {
      const longContent = 'a'.repeat(4999);
      mockValidator.validate.mockReturnValue({ isValid: true });
      mockValidator.sanitize.mockReturnValue(longContent);
      mockDifyClient.processFeedback.mockResolvedValue({
        success: true,
        message: 'Success',
      });

      const result = await service.submitFeedback(longContent);

      expect(result.success).toBe(true);
      expect(mockValidator.validate).toHaveBeenCalledWith(longContent);
    });

    it('should handle feedback with special characters', async () => {
      const specialContent = '测试反馈 @#$%^&*() 🎉';
      mockValidator.validate.mockReturnValue({ isValid: true });
      mockValidator.sanitize.mockReturnValue(specialContent);
      mockDifyClient.processFeedback.mockResolvedValue({
        success: true,
        message: 'Success',
      });

      const result = await service.submitFeedback(specialContent);

      expect(result.success).toBe(true);
    });
  });
});
