import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import {
    createApp,
    createRouter,
    toNodeListener,
    defineEventHandler,
    getQuery,
    getRouterParam,
    readBody,
    createError,
} from 'h3';
import {
    beforeAll,
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

const upstream = vi.hoisted(() => vi.fn());

vi.mock('~~/server/utils/upstream/upstreamRequest', () => ({
    upstreamRequest: upstream,
}));

const userId = '11111111-1111-4111-8111-111111111111';
const paymentId = '22222222-2222-4222-8222-222222222222';
const schoolId = '33333333-3333-4333-8333-333333333333';

describe('school context at the BFF HTTP boundary', () => {
    let server: Server;
    let base: string;

    beforeAll(async () => {
        for (const [key, value] of Object.entries({
            defineEventHandler,
            getQuery,
            getRouterParam,
            readBody,
            createError,
        }))
            vi.stubGlobal(key, value);

        vi.stubGlobal('useRuntimeConfig', () => ({
            bffAdapter: 'upstream',
            apiUpstream: 'http://backend.invalid',
            public: {},
        }));
        const router = createRouter();

        router.get(
            '/students/:userId/payments',
            (await import('./students/[userId]/payments.get')).default,
        );
        router.get(
            '/students/:userId/process-status',
            (await import('./students/[userId]/process-status.get')).default,
        );
        router.post(
            '/students/:userId/payments',
            (await import('./students/[userId]/payments.post')).default,
        );
        router.patch(
            '/students/:userId/payments/:paymentId/mark-paid',
            (
                await import('./students/[userId]/payments/[paymentId]/mark-paid.patch')
            ).default,
        );
        router.get(
            '/manager/accounts/:userId',
            (await import('./manager/accounts/[userId].get')).default,
        );
        router.get(
            '/manager/accounts',
            (await import('./manager/accounts.get')).default,
        );
        const app = createApp();

        app.use(router);
        server = createServer(toNodeListener(app));
        await new Promise<void>((resolve) =>
            server.listen(0, '127.0.0.1', resolve),
        );
        base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    beforeEach(() => {
        upstream.mockReset();
        upstream.mockResolvedValue({ data: { payments: [], steps: [] } });
    });
    afterAll(async () => {
        if (server)
            await new Promise<void>((resolve) => server.close(() => resolve()));

        vi.unstubAllGlobals();
    });

    it.each(['payments', 'process-status'])(
        'forwards %s without a redundant scope and preserves explicit history',
        async (suffix) => {
            expect(
                (await fetch(`${base}/students/${userId}/${suffix}`)).status,
            ).toBe(200);
            expect(upstream.mock.lastCall?.[2]).toMatchObject({
                query: undefined,
            });
            expect(
                (
                    await fetch(
                        `${base}/students/${userId}/${suffix}?schoolId=${schoolId}`,
                    )
                ).status,
            ).toBe(200);
            expect(upstream.mock.lastCall?.[2]).toMatchObject({
                query: { schoolId },
            });
        },
    );

    it('forwards a resource account read without a school', async () => {
        expect((await fetch(`${base}/manager/accounts/${userId}`)).status).toBe(
            200,
        );
        expect(upstream.mock.lastCall?.[2]).toMatchObject({ query: undefined });
    });

    it('forwards validated search, role, pagination and exact profile lookup', async () => {
        const query = new URLSearchParams({
            schoolId,
            search: ' Jan Kowalski ',
            role: 'INSTRUCTOR',
            page: '2',
            limit: '20',
            profileId: userId,
            ignored: 'value',
        });
        const page = { items: [], total: 0, page: 2, limit: 20 };

        upstream.mockResolvedValue({ data: page });
        const response = await fetch(`${base}/manager/accounts?${query}`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true, data: page });
        expect(upstream.mock.lastCall?.[2].query).toEqual({
            schoolId,
            search: 'Jan Kowalski',
            role: 'INSTRUCTOR',
            page: 2,
            limit: 20,
            profileId: userId,
        });
    });

    it.each([
        'page=0',
        'page=1.5',
        'page=1000001',
        'limit=101',
        'limit=0',
        'role=ADMIN',
        'profileId=invalid',
        'search=Jan&search=Anna',
        `search=${'x'.repeat(121)}`,
    ])('rejects invalid account query before upstream: %s', async (query) => {
        expect(
            (
                await fetch(
                    `${base}/manager/accounts?schoolId=${schoolId}&${query}`,
                )
            ).status,
        ).toBe(400);
        expect(upstream).not.toHaveBeenCalled();
    });

    it('forwards payment creation and paidAt without adding a school', async () => {
        const body = { paymentPlanId: paymentId, amount: '12.00' };

        expect(
            (
                await fetch(`${base}/students/${userId}/payments`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body),
                })
            ).status,
        ).toBe(200);
        expect(upstream.mock.lastCall?.[2].body).toMatchObject(body);
        expect(upstream.mock.lastCall?.[2].body.schoolId).toBeUndefined();
        expect(
            (
                await fetch(
                    `${base}/students/${userId}/payments/${paymentId}/mark-paid`,
                    {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ paidAt: '2026-10-18' }),
                    },
                )
            ).status,
        ).toBe(200);
        expect(upstream.mock.lastCall?.[2].body).toEqual({
            paidAt: '2026-10-18',
        });
    });

    it('rejects malformed explicit scope before forwarding', async () => {
        expect(
            (
                await fetch(
                    `${base}/students/${userId}/payments?schoolId=invalid`,
                )
            ).status,
        ).toBe(400);
        expect(
            (
                await fetch(
                    `${base}/students/${userId}/payments/${paymentId}/mark-paid`,
                    {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ schoolId: 'invalid' }),
                    },
                )
            ).status,
        ).toBe(400);
        expect(upstream).not.toHaveBeenCalled();
    });
});
