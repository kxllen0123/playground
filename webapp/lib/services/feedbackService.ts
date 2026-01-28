import { FeedbackValidator } from '@/lib/validators/feedbackValidator';
import { DifyAgentClient } from '@/lib/clients/difyClient';

export interface SubmissionResult {
  success: boolean;
  message: string; // 用户提示信息
}

export class FeedbackService {
  private validator: FeedbackValidator;
  private difyClient: DifyAgentClient;

  constructor() {
    this.validator = new FeedbackValidator();
    this.difyClient = new DifyAgentClient();
  }

  /**
   * 提交反馈
   */
  async submitFeedback(content: string, imageFileId?: string): Promise<SubmissionResult> {
    // 1. 基本验证
    const validationResult = this.validator.validate(content);
    if (!validationResult.isValid) {
      return {
        success: false,
        message: validationResult.error || '验证失败',
      };
    }

    // 2. 清理内容
    const sanitizedContent = this.validator.sanitize(content);

    // 3. 调用 Dify Agent 完成分类、相关性检查和 Issue 创建
    const agentResult = await this.difyClient.processFeedback(sanitizedContent, imageFileId);

    // Dify Agent 返回的结果已经包含了所有信息（成功或失败）
    return {
      success: agentResult.success,
      message: agentResult.message,
    };
  }
}
