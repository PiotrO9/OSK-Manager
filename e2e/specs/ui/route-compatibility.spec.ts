import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const english = process.env.E2E_ROUTE_VARIANT === 'en';
const login = english ? '/login' : '/logowanie';
const alias = english ? '/logowanie' : '/login';
const account = english ? '/account' : '/konto';
const recovery = english ? '/reset-password' : '/ustaw-haslo';

test('build variant agrees across Nitro redirects, SSR and client navigation', async ({
    page,
    request,
    context,
    baseURL,
}) => {
    const response = await request.get(alias, { maxRedirects: 0 });

    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe(login);
    await page.goto(alias);
    await expect(page).toHaveURL(new URL(login, baseURL).toString());
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(page.getByRole('link', { name: /hasła/ })).toHaveAttribute(
        'href',
        english ? '/forgot-password' : '/przypomnij-haslo',
    );
    await authenticateMockUser(context, baseURL!, 'MANAGER');
    await page.goto(english ? '/konto' : '/account');
    await expect(page).toHaveURL(new URL(account, baseURL).toString());
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(page.locator(`a[href="${account}"]`).first()).toBeVisible();
});

test('both recovery aliases use the selected build variant', async ({
    page,
    baseURL,
}) => {
    await page.goto(english ? '/ustaw-haslo' : '/reset-password');
    await expect(page).toHaveURL(new URL(recovery, baseURL).toString());
    await expect(page.getByRole('alert')).toContainText(
        'Link jest nieprawidłowy',
    );
});
