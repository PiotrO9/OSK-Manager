import { expect, test } from '@playwright/test';
import { routeDefinitions } from '../../../shared/routing/routeDefinitions';
import { buildRoutePath } from '../../../shared/routing/routePaths';
import { authenticateMockUser } from '../../support/mockAuth';

test.use({ trace: 'off', video: 'off', screenshot: 'off' });

test.describe('Polish URL migration', () => {
    test('the generated Nuxt router resolves every alias to the same page and metadata', async ({
        page,
    }) => {
        await page.goto('/logowanie');
        await page.locator('html[data-app-ready="true"]').waitFor();
        const pairs = routeDefinitions.map((route) => ({
            key: route.key,
            en: buildRoutePath(
                route.key,
                { id: 'test-record', userId: 'test-user' },
                'en',
            ),
            pl: buildRoutePath(
                route.key,
                { id: 'test-record', userId: 'test-user' },
                'pl',
            ),
        }));
        const result = await page.evaluate((urls) => {
            const root = document.querySelector('#__nuxt') as Element & {
                __vue_app__: {
                    config: {
                        globalProperties: {
                            $router: import('vue-router').Router;
                        };
                    };
                };
            };
            const router = root.__vue_app__.config.globalProperties.$router;

            return urls.map(({ key, en, pl }) => {
                const oldRoute = router.resolve(en);
                const newRoute = router.resolve(pl);

                return {
                    key,
                    matched:
                        oldRoute.matched.length > 0 &&
                        newRoute.matched.length > 0,
                    sameName: oldRoute.name === newRoute.name,
                    sameParams:
                        JSON.stringify(oldRoute.params) ===
                        JSON.stringify(newRoute.params),
                    sameMeta:
                        JSON.stringify(oldRoute.meta) ===
                        JSON.stringify(newRoute.meta),
                    samePage:
                        oldRoute.matched.at(-1)?.components?.default ===
                        newRoute.matched.at(-1)?.components?.default,
                };
            });
        }, pairs);

        for (const route of result) {
            expect(route, route.key).toEqual({
                key: route.key,
                matched: true,
                sameName: true,
                sameParams: true,
                sameMeta: true,
                samePage: true,
            });
        }
    });

    test('every legacy page redirects once on SSR with no-store, except recovery', async ({
        request,
    }) => {
        for (const definition of routeDefinitions.filter(
            (route) => route.en !== route.pl,
        )) {
            const params = { id: 'test-record', userId: 'test-user' };
            const en = buildRoutePath(definition.key, params, 'en');
            const pl = buildRoutePath(definition.key, params, 'pl');
            const response = await request.get(`${en}?tag=a&tag=b`, {
                maxRedirects: 0,
            });

            if (definition.key === 'resetPassword') {
                expect(response.status()).toBe(200);
                expect(response.headers().location).toBeUndefined();
            } else {
                expect(response.status(), en).toBe(302);
                expect(response.headers().location, en).toBe(
                    `${pl}?tag=a&tag=b`,
                );
                expect(response.headers()['cache-control'], en).toContain(
                    'no-store',
                );
            }
        }
    });

    test('a legacy protected link survives login through the return cookie', async ({
        page,
        context,
        baseURL,
    }) => {
        await page.goto('/manager/students?status=ACTIVE');
        await expect(page).toHaveURL(/\/logowanie$/);
        const cookie = (await context.cookies()).find(
            (entry) => entry.name === 'auth_return_to',
        );

        expect(decodeURIComponent(cookie?.value ?? '')).toContain(
            '/menedzer/kursanci?status=ACTIVE',
        );
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        await page.goto('/login');
        await expect(page).toHaveURL(/\/menedzer\/kursanci\?status=ACTIVE$/);
    });

    test('client navigation preserves query and anchors and remains canonical after refresh', async ({
        page,
        context,
        baseURL,
    }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        await page.goto('/account?tag=one&tag=two#details');
        await expect(page).toHaveURL(/\/konto\?tag=one&tag=two#details$/);
        await page.reload();
        await expect(page).toHaveURL(/\/konto\?tag=one&tag=two#details$/);
        await page.locator('html[data-app-ready="true"]').waitFor();
        await page.evaluate(async () => {
            const root = document.querySelector('#__nuxt') as Element & {
                __vue_app__: {
                    config: {
                        globalProperties: {
                            $router: import('vue-router').Router;
                        };
                    };
                };
            };

            await root.__vue_app__.config.globalProperties.$router.push(
                '/account?tag=three#settings',
            );
        });
        await expect(page).toHaveURL(/\/konto\?tag=three#settings$/);
    });

    test('legacy aliases retain role guards', async ({
        page,
        context,
        baseURL,
    }) => {
        await authenticateMockUser(context, baseURL!, 'STUDENT');
        await page.goto('/manager/students');
        await expect(page).toHaveURL(new URL('/', baseURL).toString());
        await page.goto('/my-reviews');
        await expect(page).toHaveURL(new URL('/', baseURL).toString());
    });
});

test.describe('recovery URL migration', () => {
    for (const path of ['/reset-password', '/ustaw-haslo']) {
        test(`keeps recovery state while cleaning ${path}`, async ({
            page,
        }) => {
            let submitted: unknown;

            await page.route(
                '**/api/auth/password-recovery/complete',
                async (route) => {
                    submitted = route.request().postDataJSON();
                    await route.fulfill({
                        json: { success: true, data: { changed: true } },
                    });
                },
            );
            await page.goto(
                `${path}#type=recovery&access_token=synthetic-access&refresh_token=synthetic-refresh`,
            );
            await expect(page).toHaveURL(/\/ustaw-haslo$/);
            await page
                .getByLabel('Nowe hasło', { exact: true })
                .fill('test-password-123');
            await page.getByLabel('Powtórz hasło').fill('test-password-123');
            await page.getByRole('button', { name: 'Zmień hasło' }).click();
            await expect(page.locator('p[role="status"]')).toContainText(
                'Hasło zostało zmienione',
            );
            expect(submitted).toEqual({
                accessToken: 'synthetic-access',
                refreshToken: 'synthetic-refresh',
                password: 'test-password-123',
            });
            await page
                .getByRole('link', { name: 'Przejdź do logowania' })
                .click();
            await expect(page).toHaveURL(/\/logowanie$/);
        });
    }
});
