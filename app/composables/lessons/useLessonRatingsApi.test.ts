import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestBffData = vi.fn();

describe('useLessonRatingsApi', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.stubGlobal('requestBffData', requestBffData);
    });

    it('accepts a lesson with no rating yet', async () => {
        requestBffData.mockImplementation(async (_method, _path, options) => {
            const normalized = options.normalize?.({ rating: null });

            if (normalized === null) {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }

            return normalized;
        });

        const { useLessonRatingsApi } = await import('./useLessonRatingsApi');

        await expect(
            useLessonRatingsApi().fetchLessonRating('lesson-1'),
        ).resolves.toBeNull();
    });
});
