import { test, expect } from '@playwright/test';

test('sign-in flow + import page visible', async ({ page }) => {
    await page.goto('/');

    await page.goto('/import');
    await expect(page.getByText('Upload')).toBeVisible();
});
