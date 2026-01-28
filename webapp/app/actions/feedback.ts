'use server';

import { FeedbackService } from '@/lib/services/feedbackService';

export interface FeedbackResponse {
  success: boolean;
  message: string; // Dify Agent 返回的完整用户提示信息
}

/**
 * Server Action: 提交用户反馈
 */
export async function submitFeedback(
  content: string,
  imageFileId?: string
): Promise<FeedbackResponse> {
  try {
    const service = new FeedbackService();
    const result = await service.submitFeedback(content, imageFileId);
    
    console.log('=== Server Action 返回结果 ===');
    console.log('成功状态:', result.success);
    console.log('消息内容:', result.message);
    console.log('=== Server Action 返回结束 ===');
    
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error('提交反馈失败:', error);
    
    return {
      success: false,
      message: error instanceof Error 
        ? error.message 
        : '提交失败，请稍后再试',
    };
  }
}
