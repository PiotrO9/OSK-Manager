import type { H3Event } from 'h3';
import { afterEach, describe, expect, it, vi } from 'vitest';

const bffMocks = vi.hoisted(() => ({
    upstreamRatingsList: vi.fn(),
    mockRatingsList: vi.fn(),
}));

vi.mock('~~/server/utils/ratings/lessonRatingsBff', () => ({
    bffUpstreamOwnLessonRatingsList: bffMocks.upstreamRatingsList,
}));

vi.mock('~~/server/utils/ratings/ratingsMockBff', () => ({
    bffMockOwnLessonRatingsList: bffMocks.mockRatingsList,
}));

async function loadHandler(): Promise<(event: H3Event) => Promise<unknown>> {
    vi.resetModules();
    vi.stubGlobal('defineEventHandler', (handler: unknown) => handler);

    const module = await import('./me.get');

    return module.default as (event: H3Event) => Promise<unknown>;
}

describe('GET /api/ratings/me', () => {
    const event = {} as H3Event;

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('forwards upstream requests without requiring mock auth', async () => {
        const upstreamResult = {
            success: true,
            data: { ratings: [{ id: 'rating-1' }] },
        };
        const resolveUpstreamBase = vi.fn(() => 'http://localhost:4000');
        const requireInstructorFromCookie = vi.fn();

        bffMocks.upstreamRatingsList.mockResolvedValue(upstreamResult);
        vi.stubGlobal('resolveUpstreamBase', resolveUpstreamBase);
        vi.stubGlobal(
            'requireInstructorFromCookie',
            requireInstructorFromCookie,
        );

        const handler = await loadHandler();

        await expect(handler(event)).resolves.toBe(upstreamResult);
        expect(resolveUpstreamBase).toHaveBeenCalledWith(event);
        expect(bffMocks.upstreamRatingsList).toHaveBeenCalledWith(
            event,
            'http://localhost:4000',
        );
        expect(requireInstructorFromCookie).not.toHaveBeenCalled();
        expect(bffMocks.mockRatingsList).not.toHaveBeenCalled();
    });

    it('requires instructor auth before returning mock data', async () => {
        const mockResult = {
            success: true,
            data: { ratings: [{ id: 'mock-rating-1' }] },
        };
        const resolveUpstreamBase = vi.fn(() => '');
        const requireInstructorFromCookie = vi.fn();

        bffMocks.mockRatingsList.mockReturnValue(mockResult);
        vi.stubGlobal('resolveUpstreamBase', resolveUpstreamBase);
        vi.stubGlobal(
            'requireInstructorFromCookie',
            requireInstructorFromCookie,
        );

        const handler = await loadHandler();

        await expect(handler(event)).resolves.toBe(mockResult);
        expect(resolveUpstreamBase).toHaveBeenCalledWith(event);
        expect(requireInstructorFromCookie).toHaveBeenCalledWith(event);
        expect(bffMocks.mockRatingsList).toHaveBeenCalledOnce();
        expect(bffMocks.upstreamRatingsList).not.toHaveBeenCalled();
    });
});
