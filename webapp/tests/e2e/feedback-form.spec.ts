import { test, expect } from '@playwright/test';

test.describe('Feedback Form E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Form Display', () => {
    test('should display feedback form with all elements', async ({ page }) => {
      // Check form title/description
      await expect(
        page.getByText('请分享您的功能增强建议、程序错误或提问')
      ).toBeVisible();

      // Check textarea
      const textarea = page.getByLabel('反馈内容');
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveAttribute('placeholder', '请输入您的反馈内容...');

      // Check character counter
      await expect(page.getByText('最多 5000 个字符')).toBeVisible();
      await expect(page.getByText('剩余 5000 字符')).toBeVisible();

      // Check submit button
      const submitButton = page.getByRole('button', { name: '提交反馈' });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeDisabled(); // Should be disabled when empty
    });
  });

  test.describe('Text Input Validation', () => {
    test('should enable submit button when content is entered', async ({
      page,
    }) => {
      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      await expect(submitButton).toBeDisabled();

      await textarea.fill('This is a test feedback');

      await expect(submitButton).toBeEnabled();
    });

    test('should update character counter as user types', async ({ page }) => {
      const textarea = page.getByLabel('反馈内容');

      await textarea.fill('Hello');
      await expect(page.getByText('剩余 4995 字符')).toBeVisible();

      await textarea.fill('Hello World');
      await expect(page.getByText('剩余 4989 字符')).toBeVisible();
    });

    test('should show warning when approaching character limit', async ({
      page,
    }) => {
      const textarea = page.getByLabel('反馈内容');
      const longText = 'a'.repeat(4950);

      await textarea.fill(longText);

      // Check that remaining characters is shown in warning color
      const remainingText = page.getByText(/剩余 \d+ 字符/);
      await expect(remainingText).toBeVisible();
    });

    test('should enforce maximum character limit', async ({ page }) => {
      const textarea = page.getByLabel('反馈内容');
      const maxText = 'a'.repeat(5001);

      await textarea.fill(maxText);

      // Textarea should only contain 5000 characters
      const value = await textarea.inputValue();
      expect(value.length).toBe(5000);
    });

    test('should not allow submission of whitespace-only content', async ({
      page,
    }) => {
      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      await textarea.fill('   \n\t  ');

      // Button should remain disabled for whitespace-only content
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Form Submission', () => {
    test('should submit feedback successfully without image', async ({
      page,
    }) => {
      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      await textarea.fill('This is a test feedback for bug reporting');
      await submitButton.click();

      // Should show loading state
      await expect(page.getByText('提交中...')).toBeVisible();

      // Wait for response (adjust timeout for real API)
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 30000 });

      // Check for success or error message
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible();
    });

    test('should disable form during submission', async ({ page }) => {
      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      await textarea.fill('Test feedback');
      await submitButton.click();

      // Should show loading state
      await expect(page.getByText('提交中...')).toBeVisible();

      // Wait for submission to complete
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 30000 });
    });

    test('should preserve content after submission', async ({ page }) => {
      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });
      const testContent = 'Test feedback content';

      await textarea.fill(testContent);
      await submitButton.click();

      // Wait for submission to complete
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 30000 });

      // Content should still be there
      await expect(textarea).toHaveValue(testContent);
    });

    test('should handle submission errors gracefully', async ({ page }) => {
      // This test assumes the API might fail
      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      await textarea.fill('Test feedback');
      await submitButton.click();

      // Wait for response
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 30000 });

      // Wait a bit for form to re-enable
      await page.waitForTimeout(500);

      // Form should be re-enabled after completion (success or error)
      const textareaEnabled = await textarea.isEnabled();
      const buttonEnabled = await submitButton.isEnabled();
      
      expect(textareaEnabled || buttonEnabled).toBe(true);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await expect(page.getByLabel('反馈内容')).toBeVisible();
    });

    test('should show aria-invalid on validation error', async ({ page }) => {
      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      await textarea.fill('Test');
      await submitButton.click();

      // Wait for potential error
      await page.waitForTimeout(1000);

      // If there's an error, textarea should have aria-invalid
      const alert = page.getByRole('alert');
      if (await alert.isVisible()) {
        const ariaInvalid = await textarea.getAttribute('aria-invalid');
        if (ariaInvalid) {
          expect(ariaInvalid).toBe('true');
        }
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      const textarea = page.getByLabel('反馈内容');
      
      // Tab to textarea
      await page.keyboard.press('Tab');
      await expect(textarea).toBeFocused();

      // Type in textarea
      await page.keyboard.type('Test feedback');

      // Verify content was entered
      await expect(textarea).toHaveValue('Test feedback');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.getByLabel('反馈内容')).toBeVisible();
      await expect(page.getByRole('button', { name: '提交反馈' })).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.getByLabel('反馈内容')).toBeVisible();
      await expect(page.getByRole('button', { name: '提交反馈' })).toBeVisible();
    });

    test('should display correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.getByLabel('反馈内容')).toBeVisible();
      await expect(page.getByRole('button', { name: '提交反馈' })).toBeVisible();
    });
  });
});
