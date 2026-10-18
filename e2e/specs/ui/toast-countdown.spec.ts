import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

test('pauses the toast countdown on hover and keyboard focus', async ({
    context,
    page,
    baseURL,
}) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');
    await page.goto('/design-system#feedback');
    await page.locator('html[data-app-ready="true"]').waitFor();

    await page.getByRole('button', { name: 'Pokaż potwierdzenie' }).click();
    const toast = page
        .getByRole('status')
        .filter({ hasText: 'Zapisano zmiany' });
    const progress = toast.locator('.toast-countdown');

    await expect(progress).toBeVisible();
    await toast.hover();
    await expect(progress).toHaveCSS('animation-play-state', 'paused');
    await page.waitForTimeout(3800);
    await expect(toast).toBeVisible();

    await toast.getByRole('button', { name: 'Zamknij powiadomienie' }).focus();
    await page.mouse.move(0, 0);
    await expect(progress).toHaveCSS('animation-play-state', 'paused');
    await expect(toast).toBeVisible();

    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(progress).toHaveCSS('animation-play-state', 'running');
    await expect(toast).toBeHidden({ timeout: 5000 });
});
