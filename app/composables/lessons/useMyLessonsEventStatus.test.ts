import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

function eventItem(): ScheduleLessonItem {
    return {
        id: 'event-1',
        kind: 'instructor_event',
        type: 'THEORY',
        status: 'PLANNED',
        startTime: '2026-10-05T08:00:00.000Z',
        endTime: '2026-10-05T09:00:00.000Z',
    };
}

describe('useMyLessonsEventStatus', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it('persists an event status and updates the schedule item', async () => {
        const addToast = vi.fn();
        const requestBffData = vi
            .fn()
            .mockResolvedValue({ updated: 1, skipped: 0 });

        vi.stubGlobal('ref', ref);
        vi.stubGlobal('useAppToast', () => ({ addToast }));
        vi.stubGlobal('requestBffData', requestBffData);

        const items = ref([eventItem()]);
        const { useMyLessonsEventStatus } =
            await import('./useMyLessonsEventStatus');
        const status = useMyLessonsEventStatus(items);

        await status.updateEventStatus('event-1', 'DONE');

        expect(requestBffData).toHaveBeenCalledWith(
            'PATCH',
            '/api/events/bulk-status',
            expect.objectContaining({
                body: { eventIds: ['event-1'], status: 'DONE' },
            }),
        );
        expect(items.value[0]?.status).toBe('DONE');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Status wydarzenia zmieniony',
            variant: 'success',
        });
    });

    it('keeps the previous status when the API rejects the change', async () => {
        const addToast = vi.fn();

        vi.stubGlobal('ref', ref);
        vi.stubGlobal('useAppToast', () => ({ addToast }));
        vi.stubGlobal(
            'requestBffData',
            vi.fn().mockRejectedValue(new Error('offline')),
        );

        const items = ref([eventItem()]);
        const { useMyLessonsEventStatus } =
            await import('./useMyLessonsEventStatus');
        const status = useMyLessonsEventStatus(items);

        await status.updateEventStatus('event-1', 'DONE');

        expect(items.value[0]?.status).toBe('PLANNED');
        expect(status.savingEventId.value).toBeNull();
        expect(addToast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Nie udało się zmienić statusu wydarzenia',
                variant: 'error',
            }),
        );
    });
});
