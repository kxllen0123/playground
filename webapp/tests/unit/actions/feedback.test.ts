import { describe, it, expect, beforeEach, vi } from 'vitest';
import { submitFeedback } from '@/app/actions/feedback';

// Mock FeedbackService
vi.mock('@/lib/services/feedbackService', () => ({
  FeedbackService: vi.fn(),
}));

describe('submitFeedback Server Action', () => {
  let mockService: {
    submitFeedback: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockService = {
      submitFeedback: vi.fn(),
    };

    const { FeedbackService } = await import('@/lib/services/feedbackService');
    (FeedbackService as any).mockImplementation(() => mockService);
    vi.clearAllMocks();
  });

  it('should successfully submit feedback without image', async () => {
    mockService.submitFeedback.mockResolvedValue({
      success: true,
      message: 'Issue #123 已创建',
    });

    const result = await submitFeedback('Test feedback');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Issue #123 已创建');
    expect(mockService.submitFeedback).toHaveBeenCalledWith(
      'Test feedback',
      undefined
    );
  });

  it('should successfully submit feedback with image', async () => {
    mockService.submitFeedback.mockResolvedValue({
      success: true,
      message: 'Issue #124 已创建（包含图片）',
    });

    const result = await submitFeedback('Test feedback', 'file-123');

    expect(result.success).toBe(true);
    expect(result.message).toContain('Issue #124');
    expect(mockService.submitFeedback).toHaveBeenCalledWith(
      'Test feedback',
      'file-123'
    );
  });

  it('should handle service failure', async () => {
    mockService.submitFeedback.mockResolvedValue({
      success: false,
      message: '反馈内容不能为空',
    });

    const result = await submitFeedback('');

    expect(result.success).toBe(false);
    expect(result.message).toBe('反馈内容不能为空');
  });

  it('should handle service error', async () => {
    mockService.submitFeedback.mockRejectedValue(
      new Error('Service unavailable')
    );

    const result = await submitFeedback('Test feedback');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Service unavailable');
  });

  it('should handle unknown error', async () => {
    mockService.submitFeedback.mockRejectedValue('Unknown error');

    const result = await submitFeedback('Test feedback');

    expect(result.success).toBe(false);
    expect(result.message).toBe('提交失败，请稍后再试');
  });
});
