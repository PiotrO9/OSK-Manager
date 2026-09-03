import type { Ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    formatManagerInstructorScheduleRangeLabel,
    formatManagerInstructorScheduleWeekCompact,
} from '~/utils/instructors/managerInstructorSchedulePage';

interface UseManagerInstructorScheduleReadModelOptions {
    items: Ref<ScheduleLessonItem[]>;
    isScheduleLoading: Ref<boolean>;
    weekStart: Ref<Date>;
}

export function useManagerInstructorScheduleReadModel({
    items,
    isScheduleLoading,
    weekStart,
}: UseManagerInstructorScheduleReadModelOptions) {
    const scheduleItemsCount = computed(() => items.value.length);
    const lessonItemsCount = computed(
        () =>
            items.value.filter((item) => item.kind !== 'instructor_event')
                .length,
    );
    const blockItemsCount = computed(
        () =>
            items.value.filter((item) => item.kind === 'instructor_event')
                .length,
    );
    const scheduleWeekLabel = computed(() =>
        formatManagerInstructorScheduleWeekCompact(weekStart.value),
    );
    const scheduleResultLabel = computed(() => {
        if (isScheduleLoading.value) {
            return 'Wczytywanie';
        }

        return `${scheduleItemsCount.value} wpisow`;
    });
    const nextScheduledItemLabel = computed(() => {
        const item = items.value
            .slice()
            .sort(
                (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime(),
            )[0];

        if (!item) {
            return 'Brak';
        }

        return formatManagerInstructorScheduleRangeLabel(item.startTime);
    });

    function handleInstructorEventStatusChanged(payload: {
        id: string;
        status: string;
    }): void {
        const idx = items.value.findIndex((x) => x.id === payload.id);

        if (idx < 0) {
            return;
        }

        const row = items.value[idx];

        if (!row) {
            return;
        }

        const copy = items.value.slice();

        copy[idx] = { ...row, status: payload.status };
        items.value = copy;
    }

    return {
        scheduleItemsCount,
        lessonItemsCount,
        blockItemsCount,
        scheduleWeekLabel,
        scheduleResultLabel,
        nextScheduledItemLabel,
        handleInstructorEventStatusChanged,
    };
}
