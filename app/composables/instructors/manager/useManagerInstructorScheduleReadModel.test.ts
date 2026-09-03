import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

function installNuxtReadModelGlobals(): void {
    vi.stubGlobal('computed', computed);
}

function createScheduleItem(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'PLANNED',
        startTime: '2026-09-03T09:00:00.000Z',
        endTime: '2026-09-03T10:00:00.000Z',
        ...overrides,
    };
}

describe('useManagerInstructorScheduleReadModel', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        installNuxtReadModelGlobals();
    });

    it('counts schedule items, lessons, and instructor events', async () => {
        const { useManagerInstructorScheduleReadModel } =
            await import('./useManagerInstructorScheduleReadModel');
        const readModel = useManagerInstructorScheduleReadModel({
            items: ref([
                createScheduleItem({ id: 'lesson-1', kind: 'lesson' }),
                createScheduleItem({
                    id: 'event-1',
                    kind: 'instructor_event',
                }),
                createScheduleItem({ id: 'lesson-2', kind: undefined }),
            ]),
            isScheduleLoading: ref(false),
            weekStart: ref(new Date('2026-08-31T00:00:00.000Z')),
        });

        expect(readModel.scheduleItemsCount.value).toBe(3);
        expect(readModel.lessonItemsCount.value).toBe(2);
        expect(readModel.blockItemsCount.value).toBe(1);
    });

    it('formats loading and loaded result labels', async () => {
        const { useManagerInstructorScheduleReadModel } =
            await import('./useManagerInstructorScheduleReadModel');
        const isScheduleLoading = ref(true);
        const readModel = useManagerInstructorScheduleReadModel({
            items: ref([createScheduleItem(), createScheduleItem()]),
            isScheduleLoading,
            weekStart: ref(new Date('2026-08-31T00:00:00.000Z')),
        });

        expect(readModel.scheduleResultLabel.value).toBe('Wczytywanie');

        isScheduleLoading.value = false;

        expect(readModel.scheduleResultLabel.value).toBe('2 wpisow');
    });

    it('formats week and next scheduled item labels', async () => {
        const { useManagerInstructorScheduleReadModel } =
            await import('./useManagerInstructorScheduleReadModel');
        const readModel = useManagerInstructorScheduleReadModel({
            items: ref([
                createScheduleItem({
                    id: 'later',
                    startTime: '2026-09-04T09:00:00.000Z',
                }),
                createScheduleItem({
                    id: 'earlier',
                    startTime: '2026-09-03T07:00:00.000Z',
                }),
            ]),
            isScheduleLoading: ref(false),
            weekStart: ref(new Date('2026-08-31T00:00:00.000Z')),
        });

        expect(readModel.scheduleWeekLabel.value).toBe('31-6 września');
        expect(readModel.nextScheduledItemLabel.value).toContain('3.09.2026');
    });

    it('returns empty next scheduled item label without schedule items', async () => {
        const { useManagerInstructorScheduleReadModel } =
            await import('./useManagerInstructorScheduleReadModel');
        const readModel = useManagerInstructorScheduleReadModel({
            items: ref([]),
            isScheduleLoading: ref(false),
            weekStart: ref(new Date('2026-08-31T00:00:00.000Z')),
        });

        expect(readModel.nextScheduledItemLabel.value).toBe('Brak');
    });

    it('updates matching item status immutably', async () => {
        const { useManagerInstructorScheduleReadModel } =
            await import('./useManagerInstructorScheduleReadModel');
        const firstItem = createScheduleItem({ id: 'lesson-1' });
        const secondItem = createScheduleItem({ id: 'event-1' });
        const items = ref([firstItem, secondItem]);
        const previousItems = items.value;
        const readModel = useManagerInstructorScheduleReadModel({
            items,
            isScheduleLoading: ref(false),
            weekStart: ref(new Date('2026-08-31T00:00:00.000Z')),
        });

        readModel.handleInstructorEventStatusChanged({
            id: 'event-1',
            status: 'CANCELLED',
        });

        expect(items.value).not.toBe(previousItems);
        expect(items.value[0]).toEqual(firstItem);
        expect(items.value[1]).toEqual({
            ...secondItem,
            status: 'CANCELLED',
        });
    });

    it('ignores status update for missing item', async () => {
        const { useManagerInstructorScheduleReadModel } =
            await import('./useManagerInstructorScheduleReadModel');
        const items = ref([createScheduleItem({ id: 'lesson-1' })]);
        const previousItems = items.value;
        const readModel = useManagerInstructorScheduleReadModel({
            items,
            isScheduleLoading: ref(false),
            weekStart: ref(new Date('2026-08-31T00:00:00.000Z')),
        });

        readModel.handleInstructorEventStatusChanged({
            id: 'missing',
            status: 'CANCELLED',
        });

        expect(items.value).toBe(previousItems);
    });
});
