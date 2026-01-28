import { config } from '@/lib/config';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class FeedbackValidator {
  /**
   * 验证反馈内容
   */
  validate(content: string): ValidationResult {
    // 检查是否为空
    if (!content || content.trim().length === 0) {
      return {
        isValid: false,
        error: '反馈内容不能为空',
      };
    }

    // 检查最小长度
    if (content.trim().length < config.validation.minLength) {
      return {
        isValid: false,
        error: `反馈内容至少需要 ${config.validation.minLength} 个字符`,
      };
    }

    // 检查最大长度
    if (content.length > config.validation.maxLength) {
      return {
        isValid: false,
        error: `反馈内容不能超过 ${config.validation.maxLength} 个字符`,
      };
    }

    return { isValid: true };
  }

  /**
   * 清理反馈内容中的恶意脚本和不安全字符
   */
  sanitize(content: string): string {
    let sanitized = content;

    // 移除脚本标签
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // 移除事件处理器属性（如 onclick, onerror 等）
    sanitized = sanitized.replace(
      /\s*on\w+\s*=\s*["'][^"']*["']/gi,
      ''
    );

    // 移除 javascript: 协议
    sanitized = sanitized.replace(/javascript:/gi, '');

    // 移除 data: URL（可能包含恶意脚本）
    sanitized = sanitized.replace(/data:text\/html/gi, '');

    // 转义 HTML 特殊字符（保留换行）
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }
}
