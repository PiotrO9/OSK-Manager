import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { H3Event } from 'h3';

import { forwardSecurityLogs } from './securityLogsBff';

const mocks = vi.hoisted(() => ({
    me: vi.fn(),
    upstream: vi.fn(),
    report: vi.fn(),
}));

vi.mock('~~/server/utils/bff/bffAdapterExecutor', () => ({
    executeBffAdapter: (
        _event: H3Event,
        options: { upstream: (context: { upstreamBase: string }) => unknown },
    ) => options.upstream({ upstreamBase: 'https://api.test' }),
}));
vi.mock('~~/server/utils/auth/authUpstreamSession', () => ({
    bffUpstreamMe: mocks.me,
}));
vi.mock('~~/server/utils/upstream/upstreamRequest', () => ({
    upstreamRequest: mocks.upstream,
}));
vi.mock('./bffDenialTelemetry', () => ({
    reportBffMissingSession: mocks.report,
}));

describe('security logs BFF', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('getQuery', () => ({
            schoolId: '123e4567-e89b-42d3-a456-426614174000',
        }));
        vi.stubGlobal('getCookie', () => undefined);
        vi.stubGlobal('setHeader', () => undefined);
        vi.stubGlobal(
            'createError',
            (input: { statusCode: number; message: string }) =>
                Object.assign(new Error(input.message), {
                    statusCode: input.statusCode,
                }),
        );
        mocks.upstream.mockResolvedValue({
            data: { items: [], collectionStatus: 'UNKNOWN' },
        });
    });

    it('forwards a non-manager token to BE and propagates its 403 without data', async () => {
        const forbidden = Object.assign(new Error('Forbidden'), {
            statusCode: 403,
        });

        mocks.me.mockResolvedValue({ data: { user: { role: 'ADMIN' } } });
        mocks.upstream.mockRejectedValue(forbidden);

        await expect(forwardSecurityLogs({} as H3Event, 'list')).rejects.toBe(
            forbidden,
        );
        expect(mocks.upstream).toHaveBeenCalledTimes(1);
    });

    it('forwards the validated school and disables caching', async () => {
        const headers: Record<string, string> = {};

        vi.stubGlobal(
            'setHeader',
            (_event: H3Event, name: string, value: string) => {
                headers[name] = value;
            },
        );
        mocks.me.mockResolvedValue({ data: { user: { role: 'MANAGER' } } });

        await forwardSecurityLogs({} as H3Event, 'list');

        expect(mocks.upstream).toHaveBeenCalledWith(
            {},
            'https://api.test',
            expect.objectContaining({
                path: '/manager/security-logs',
                query: { schoolId: '123e4567-e89b-42d3-a456-426614174000' },
                method: 'GET',
            }),
        );
        expect(headers['Cache-Control']).toContain('no-store');
    });

    it('records a missing-session denial once and keeps the original 401', async () => {
        const unauthorized = Object.assign(new Error('Brak sesji'), {
            statusCode: 401,
        });

        mocks.me.mockRejectedValue(unauthorized);

        await expect(forwardSecurityLogs({} as H3Event, 'list')).rejects.toBe(
            unauthorized,
        );
        expect(mocks.report).toHaveBeenCalledTimes(1);
        expect(mocks.upstream).not.toHaveBeenCalled();
    });

    it('rejects duplicated query values before contacting BE', async () => {
        vi.stubGlobal('getQuery', () => ({
            schoolId: [
                '123e4567-e89b-42d3-a456-426614174000',
                '123e4567-e89b-42d3-a456-426614174000',
            ],
        }));

        await expect(
            forwardSecurityLogs({} as H3Event, 'list'),
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(mocks.me).not.toHaveBeenCalled();
        expect(mocks.upstream).not.toHaveBeenCalled();
    });
});
