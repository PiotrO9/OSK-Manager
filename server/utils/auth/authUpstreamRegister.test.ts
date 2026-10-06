import type { H3Event } from 'h3';
import { describe, expect, it, vi } from 'vitest';
import { bffUpstreamRegister } from './authUpstreamRegister';

const { upstreamRequest, setResponseStatus } = vi.hoisted(() => ({
    upstreamRequest: vi.fn(),
    setResponseStatus: vi.fn(),
}));

vi.mock('h3', () => ({ setResponseStatus }));
vi.mock('~~/server/utils/upstream/upstreamRequest', () => ({
    upstreamRequest,
}));

describe('instructor registration BFF transport', () => {
    it.each([201, 400, 409])(
        'preserves date-only payload and the upstream response (%s)',
        async (status) => {
            const event = {} as H3Event;
            const body = { role: 'INSTRUCTOR', birthDate: '2000-02-29' };
            const envelope =
                status === 201
                    ? { success: true }
                    : { success: false, error: 'Invalid birthDate' };

            upstreamRequest.mockResolvedValue({
                response: { status },
                envelope,
            });
            expect(
                await bffUpstreamRegister(
                    event,
                    'https://upstream.example',
                    body,
                ),
            ).toBe(envelope);
            expect(upstreamRequest).toHaveBeenLastCalledWith(
                event,
                'https://upstream.example',
                expect.objectContaining({ body }),
            );
            expect(setResponseStatus).toHaveBeenLastCalledWith(event, status);
        },
    );
});
