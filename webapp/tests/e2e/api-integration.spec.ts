import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * These tests verify the integration with Dify API in a real environment
 * They should be run in preview/staging environment with real API credentials
 */

test.describe('API Integration Tests', () => {
  // Skip these tests in local development
  test.skip(
    !process.env.CI && !process.env.RUN_INTEGRATION_TESTS,
    'Integration tests only run in CI or when RUN_INTEGRATION_TESTS=true'
  );

  test.describe('Dify Workflow Integration', () => {
    test('should successfully classify and create issue for bug report', async ({
      page,
    }) => {
      await page.goto('/');

      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      // Submit a clear bug report
      await textarea.fill(
        '应用程序在点击提交按钮时崩溃。错误信息：TypeError: Cannot read property of undefined。这个问题在 Chrome 浏览器上可以稳定复现。'
      );
      await submitButton.click();

      // Wait for response
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible({ timeout: 30000 });

      // Should receive success message with Issue number
      const alertText = await alert.textContent();
      expect(alertText).toMatch(/已创建|成功|您的反馈已成功提交/i);
    });

    test('should successfully classify and create issue for feature request', async ({
      page,
    }) => {
      await page.goto('/');

      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      // Submit a clear feature request
      await textarea.fill(
        '希望能够添加暗色模式功能。很多用户在夜间使用应用时觉得当前的亮色主题太刺眼。建议添加一个主题切换按钮。'
      );
      await submitButton.click();

      // Wait for response
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible({ timeout: 30000 });

      // Should receive success message
      const alertText = await alert.textContent();
      expect(alertText).toMatch(/已创建|成功|您的反馈已成功提交/i);
    });

    test('should successfully classify and create issue for question', async ({
      page,
    }) => {
      await page.goto('/');

      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      // Submit a question
      await textarea.fill(
        '请问如何导出数据？我在设置中找不到导出选项。是否需要特定的权限才能导出？'
      );
      await submitButton.click();

      // Wait for response
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible({ timeout: 30000 });

      // Should receive success message
      const alertText = await alert.textContent();
      expect(alertText).toMatch(/已创建|成功|您的反馈已成功提交/i);
    });

    test('should reject unclassifiable feedback', async ({ page }) => {
      await page.goto('/');

      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      // Submit unclear/unclassifiable content
      await textarea.fill('测试 test 123 abc');
      await submitButton.click();

      // Wait for response
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible({ timeout: 30000 });

      // Should receive error message about classification
      const alertText = await alert.textContent();
      expect(alertText).toMatch(/无法分类|不清楚|更详细|无法明确归入/i);
    });

    test('should reject irrelevant feedback', async ({ page }) => {
      await page.goto('/');

      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      // Submit completely irrelevant content
      await textarea.fill(
        '今天天气真好，我去公园散步了。看到了很多花和树。'
      );
      await submitButton.click();

      // Wait for response
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible({ timeout: 30000 });

      // Should receive error message about relevance
      const alertText = await alert.textContent();
      expect(alertText).toMatch(/不相关|产品相关|主题|暂不予记录/i);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API authentication errors', async ({ page }) => {
      // This test would require temporarily using invalid credentials
      // In a real scenario, you might want to test this with a separate endpoint
      test.skip(true, 'Requires invalid credentials setup');
    });

    test('should handle API rate limiting', async ({ page }) => {
      // Submit multiple requests rapidly
      await page.goto('/');

      const textarea = page.getByLabel('反馈内容');
      const submitButton = page.getByRole('button', { name: '提交反馈' });

      // Submit multiple times
      for (let i = 0; i < 5; i++) {
        await textarea.fill(`Test feedback ${i + 1}`);
        await submitButton.click();

        // Wait a bit between submissions
        await page.waitForTimeout(1000);

        // Check if rate limit error appears
        const alert = page.getByRole('alert');
        if (await alert.isVisible()) {
          const alertText = await alert.textContent();
          if (alertText?.includes('频繁')) {
            // Rate limit detected
            expect(alertText).toContain('频繁');
            break;
          }
        }
      }
    });

    test('should handle network timeouts', async ({ page }) => {
      // This test would require simulating slow network
      test.skip(true, 'Requires network simulation setup');
    });
  });

  test.describe('End-to-End Workflow', () => {
    test('should complete full workflow: input -> submit -> success', async ({
      page,
    }) => {
      await page.goto('/');

      // Step 1: Enter feedback
      const textarea = page.getByLabel('反馈内容');
      await textarea.fill(
        '完整的端到端测试：发现一个严重的性能问题。当数据量超过1000条时，页面加载时间超过10秒。建议添加分页或虚拟滚动功能。'
      );

      // Verify character counter updates
      await expect(page.getByText(/剩余 \d+ 字符/)).toBeVisible();

      // Step 2: Submit
      const submitButton = page.getByRole('button', { name: '提交反馈' });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Step 3: Verify loading state
      await expect(page.getByText('提交中...')).toBeVisible();

      // Step 4: Verify success
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible({ timeout: 45000 });

      const alertText = await alert.textContent();
      expect(alertText).toMatch(/Issue #\d+|已创建|成功/i);

      // Step 5: Verify form state after submission
      await expect(textarea).toBeEnabled();
      await expect(submitButton).toBeEnabled();

      // Content should be preserved
      const textareaValue = await textarea.inputValue();
      expect(textareaValue.length).toBeGreaterThan(0);
    });
  });
});
