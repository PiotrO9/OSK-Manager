import type { Ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { weekRangeFromMonday } from '~/utils/date/weeklyCalendarDates';

interface ManagerSchoolScheduleCalendarDataOptions {
    schoolId: () => string;
    weekStart: Ref<Date>;
    disabled: () => boolean;
}

export function useManagerSchoolScheduleCalendarData(
    options: ManagerSchoolScheduleCalendarDataOptions,
) {
    const internalItems = ref<ScheduleLessonItem[]>([]);
    const errorMessage = ref<string | null>(null);
    const { fetchSchoolSchedule, isLoading } = useSchoolScheduleApi();
    let fetchSeq = 0;
    let fetchAbortController: AbortController | null = null;

    async function loadWeek(): Promise<void> {
        const seq = ++fetchSeq;

        fetchAbortController?.abort();
        fetchAbortController = null;

        if (options.disabled()) {
            return;
        }

        const sid = options.schoolId().trim();

        if (!sid) {
            internalItems.value = [];
            errorMessage.value = null;

            return;
        }

        const controller = new AbortController();

        fetchAbortController = controller;

        errorMessage.value = null;

        const { dateFrom, dateTo } = weekRangeFromMonday(
            options.weekStart.value,
        );

        try {
            const data = await fetchSchoolSchedule(sid, dateFrom, dateTo, {
                signal: controller.signal,
            });

            if (seq !== fetchSeq) {
                return;
            }

            internalItems.value = data;
        } catch (err: unknown) {
            if (seq !== fetchSeq) {
                return;
            }

            internalItems.value = [];
            errorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać harmonogramu lekcji.',
            );
        }
    }

    watch(
        [options.weekStart, options.schoolId],
        () => {
            if (!options.disabled()) {
                void loadWeek();
            }
        },
        { immediate: true },
    );

    onBeforeUnmount(() => {
        fetchSeq += 1;
        fetchAbortController?.abort();
        fetchAbortController = null;
    });

    return {
        errorMessage,
        internalItems,
        isLoading,
        loadWeek,
    };
}
