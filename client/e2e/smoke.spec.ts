import { expect, test } from '@playwright/test';

test('first install sends unauthenticated visitors from home to register', async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.goto('/');
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
});

test('returning devices send unauthenticated visitors from home to login', async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('tapeya_returning_user', '1');
    } catch {
      /* ignore */
    }
  });
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
  await page.addInitScript(() => {
    try {
      localStorage.setItem('tapeya_returning_user', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/tournaments/create');
  await expect(page).toHaveURL(/\/login$/);
});

test('otp without phone state shows recovery UI', async ({ page }) => {
  await page.goto('/otp');
  await expect(page.getByText(/we lost the number/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /start again/i })).toBeVisible();
});
