import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readonly, ref } from 'vue';

const requestBffData = vi.fn();

describe('useManagerLessonsApi cancellation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('readonly', readonly);
        vi.stubGlobal('requestBffData', requestBffData);
    });

    it('sends one status-only PATCH and resets its loading state', async () => {
        requestBffData.mockResolvedValue({
            id: 'lesson-1',
            status: 'CANCELLED',
        });
        const { useManagerLessonsApi } = await import('./useManagerLessonsApi');
        const api = useManagerLessonsApi();

        await api.cancelLesson(' lesson-1 ');

        expect(requestBffData).toHaveBeenCalledTimes(1);
        expect(requestBffData).toHaveBeenCalledWith(
            'PATCH',
            '/api/lessons/lesson-1',
            expect.objectContaining({ body: { status: 'CANCELLED' } }),
        );
        expect(api.isCancelLoading.value).toBe(false);
    });

    it('does not send a request without a lesson id', async () => {
        const { useManagerLessonsApi } = await import('./useManagerLessonsApi');

        await expect(useManagerLessonsApi().cancelLesson(' ')).rejects.toThrow(
            'Brak identyfikatora lekcji.',
        );
        expect(requestBffData).not.toHaveBeenCalled();
    });
});
