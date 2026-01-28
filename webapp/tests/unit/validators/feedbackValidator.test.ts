import { describe, it, expect, beforeEach } from 'vitest';
import { FeedbackValidator } from '@/lib/validators/feedbackValidator';

describe('FeedbackValidator', () => {
  let validator: FeedbackValidator;

  beforeEach(() => {
    validator = new FeedbackValidator();
  });

  describe('validate', () => {
    it('should accept valid feedback content', () => {
      const result = validator.validate('This is a valid feedback');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty content', () => {
      const result = validator.validate('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('反馈内容不能为空');
    });

    it('should reject whitespace-only content', () => {
      const result = validator.validate('   \n\t  ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('反馈内容不能为空');
    });

    it('should reject content exceeding max length', () => {
      const longContent = 'a'.repeat(5001);
      const result = validator.validate(longContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('不能超过');
    });

    it('should accept content at max length boundary', () => {
      const maxContent = 'a'.repeat(5000);
      const result = validator.validate(maxContent);
      expect(result.isValid).toBe(true);
    });

    it('should accept content with special characters', () => {
      const result = validator.validate('Bug: 系统崩溃了！@#$%^&*()');
      expect(result.isValid).toBe(true);
    });

    it('should accept content with newlines', () => {
      const result = validator.validate('Line 1\nLine 2\nLine 3');
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitize', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = validator.sanitize(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = validator.sanitize(input);
      expect(result).not.toContain('onclick');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = validator.sanitize(input);
      expect(result).not.toContain('javascript:');
    });

    it('should remove data:text/html URLs', () => {
      const input = '<img src="data:text/html,<script>alert(1)</script>">';
      const result = validator.sanitize(input);
      expect(result).not.toContain('data:text/html');
    });

    it('should escape HTML special characters', () => {
      const input = '<div>Test & "quotes" \'apostrophes\'</div>';
      const result = validator.sanitize(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#x27;');
    });

    it('should handle multiple script tags', () => {
      const input = '<script>bad1()</script>Text<script>bad2()</script>';
      const result = validator.sanitize(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('bad1');
      expect(result).not.toContain('bad2');
    });

    it('should handle nested script tags', () => {
      const input = '<script><script>alert(1)</script></script>';
      const result = validator.sanitize(input);
      expect(result).not.toContain('<script>');
    });

    it('should preserve safe content', () => {
      const input = 'This is a normal feedback message';
      const result = validator.sanitize(input);
      expect(result).toContain('This is a normal feedback message');
    });

    it('should handle empty string', () => {
      const result = validator.sanitize('');
      expect(result).toBe('');
    });

    it('should handle complex XSS attempts', () => {
      const input = '<img src=x onerror="alert(1)">';
      const result = validator.sanitize(input);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });
  });
});
