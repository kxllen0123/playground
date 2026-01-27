import { test, expect } from '@playwright/test';

test.describe('Echo Page', () => {
  test('should display title and input field', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Echo' })).toBeVisible();
    await expect(page.getByPlaceholder('Type something...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('should echo input after clicking submit', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Type something...');
    await input.fill('Hello World');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('text=Echo: Hello World')).toBeVisible();
  });

  test('should not display echo before clicking submit', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Type something...');
    await input.fill('Test Input');

    await expect(page.locator('text=Echo: Test Input')).not.toBeVisible();
  });

  test('should update echo on multiple submits', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Type something...');
    const submitButton = page.getByRole('button', { name: 'Submit' });

    await input.fill('First message');
    await submitButton.click();
    await expect(page.locator('text=Echo: First message')).toBeVisible();

    await input.fill('Second message');
    await submitButton.click();
    await expect(page.locator('text=Echo: Second message')).toBeVisible();
    await expect(page.locator('text=Echo: First message')).not.toBeVisible();
  });

  test('should handle empty input', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Type something...');
    await input.fill('');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('.bg-zinc-100, .dark\\:bg-zinc-800')).not.toBeVisible();
  });
});
