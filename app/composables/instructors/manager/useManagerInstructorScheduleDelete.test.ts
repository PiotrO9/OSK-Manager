import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

const addToast = vi.fn();
const deleteInstructorEvent = vi.fn();

function installNuxtScheduleDeleteGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('useInstructorEventsApi', () => ({
        deleteInstructorEvent,
        isDeleteLoading: ref(false),
    }));
}

function createScheduleItem(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'event-1',
        kind: 'instructor_event',
        type: 'THEORY',
        status: 'PLANNED',
        startTime: '2026-09-03T09:00:00.000Z',
        endTime: '2026-09-03T10:00:00.000Z',
        ...overrides,
    };
}

describe('useManagerInstructorScheduleDelete', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtScheduleDeleteGlobals();
    });

    it('opens delete dialog and exposes selected event time label', async () => {
        const { useManagerInstructorScheduleDelete } =
            await import('./useManagerInstructorScheduleDelete');
        const data = useManagerInstructorScheduleDelete({
            items: ref([createScheduleItem()]),
        });

        data.handleRequestDelete(createScheduleItem());

        expect(data.deleteDialogOpen.value).toBe(true);
        expect(data.pendingDeleteTimeLabel.value).toContain('3.09.2026');
        expect(data.pendingDeleteTimeLabel.value).toContain(' - ');
    });

    it('cancels delete dialog and clears pending item', async () => {
        const { useManagerInstructorScheduleDelete } =
            await import('./useManagerInstructorScheduleDelete');
        const data = useManagerInstructorScheduleDelete({
            items: ref([createScheduleItem()]),
        });

        data.handleRequestDelete(createScheduleItem());
        data.handleDeleteDialogCancel();

        expect(data.deleteDialogOpen.value).toBe(false);
        expect(data.pendingDeleteTimeLabel.value).toBe('');
    });

    it('does nothing when confirm is called without pending item', async () => {
        const { useManagerInstructorScheduleDelete } =
            await import('./useManagerInstructorScheduleDelete');
        const data = useManagerInstructorScheduleDelete({
            items: ref([createScheduleItem()]),
        });

        await data.handleDeleteDialogConfirm();

        expect(deleteInstructorEvent).not.toHaveBeenCalled();
    });

    it('deletes pending event, removes it from items and closes dialog', async () => {
        deleteInstructorEvent.mockResolvedValue(undefined);

        const { useManagerInstructorScheduleDelete } =
            await import('./useManagerInstructorScheduleDelete');
        const items = ref([
            createScheduleItem(),
            createScheduleItem({ id: 'lesson-1', kind: 'lesson' }),
        ]);
        const data = useManagerInstructorScheduleDelete({ items });

        data.handleRequestDelete(createScheduleItem());
        await data.handleDeleteDialogConfirm();

        expect(deleteInstructorEvent).toHaveBeenCalledWith('event-1');
        expect(items.value.map((item) => item.id)).toEqual(['lesson-1']);
        expect(data.deleteDialogOpen.value).toBe(false);
        expect(data.pendingDeleteTimeLabel.value).toBe('');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Usunieto blok czasu',
            description: 'Blok zostal usuniety z harmonogramu.',
            variant: 'success',
        });
    });

    it('shows error toast and keeps pending item on delete failure', async () => {
        deleteInstructorEvent.mockRejectedValue(new Error('API down'));

        const { useManagerInstructorScheduleDelete } =
            await import('./useManagerInstructorScheduleDelete');
        const items = ref([createScheduleItem()]);
        const data = useManagerInstructorScheduleDelete({ items });

        data.handleRequestDelete(createScheduleItem());
        await data.handleDeleteDialogConfirm();

        expect(items.value.map((item) => item.id)).toEqual(['event-1']);
        expect(data.deleteDialogOpen.value).toBe(true);
        expect(data.pendingDeleteTimeLabel.value).not.toBe('');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się usunąć bloku',
            description: 'API down',
            variant: 'error',
        });
    });
});
