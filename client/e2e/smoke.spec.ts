import { expect, test } from '@playwright/test';

test('unauthenticated visitors are sent to login from home', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /welcome back|choose an account/i })).toBeVisible();
});

test('the login form validates a bad phone number before submitting', async ({ page }) => {
  await page.goto('/login');
  // Saved-profile mode: switch to phone entry when present.
  const other = page.getByRole('button', { name: /use another number/i });
  if (await other.isVisible().catch(() => false)) {
    await other.click();
  }
  await page.getByLabel('Phone number').fill('12');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText(/without the country code/i)).toBeVisible();
});

test('create tournament form requires auth', async ({ page }) => {
  await page.goto('/tournaments/create');
  await expect(page).toHaveURL(/\/login$/);
});

test('otp without phone state shows recovery UI', async ({ page }) => {
  await page.goto('/otp');
  await expect(page.getByText(/we lost the number/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /start again/i })).toBeVisible();
});
