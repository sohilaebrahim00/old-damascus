import { test, expect } from '@playwright/test';

test.describe('Auth Routes Regression', () => {
  test('Sign-up page renders without crashing', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.locator('h2', { hasText: 'Create an account' })).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Sign-in page renders without crashing', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.locator('h2', { hasText: 'Welcome back' })).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Forgot-password page renders without crashing', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('h2', { hasText: 'Forgot your password?' })).toBeVisible();
  });

  test('Missing Supabase values do not crash public pages', async ({ page }) => {
    // We navigate to home, and expect no 500 error even if env vars are missing
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Protected account routes redirect logged-out users to sign-in', async ({ page }) => {
    await page.goto('/account');
    // Expect redirect
    await expect(page).toHaveURL(/.*\/sign-in.*/);
  });

  test('Callback route handles missing or invalid code gracefully', async ({ page }) => {
    await page.goto('/auth/callback?code=invalid-code');
    // Next.js logic will either redirect to sign-in with an error or show an error
    await expect(page).toHaveURL(/.*\/sign-in\?error=.*/);
  });
});
