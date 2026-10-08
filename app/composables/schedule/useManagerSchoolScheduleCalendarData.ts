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
    const hasMounted = ref(false);
    let fetchSequence = 0;
    let fetchAbortController: AbortController | null = null;

    async function loadWeek(): Promise<void> {
        const requestSequence = ++fetchSequence;

        fetchAbortController?.abort();
        fetchAbortController = null;

        if (options.disabled()) {
            return;
        }

        const schoolId = options.schoolId().trim();

        if (!schoolId) {
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
            const data = await fetchSchoolSchedule(schoolId, dateFrom, dateTo, {
                signal: controller.signal,
            });

            if (requestSequence !== fetchSequence) {
                return;
            }

            internalItems.value = data;
        } catch (err: unknown) {
            if (requestSequence !== fetchSequence) {
                return;
            }

            internalItems.value = [];
            errorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać harmonogramu lekcji.',
            );
        }
    }

    watch([options.weekStart, options.schoolId], () => {
        if (hasMounted.value && !options.disabled()) {
            void loadWeek();
        }
    });

    onMounted(() => {
        hasMounted.value = true;

        if (!options.disabled()) {
            void loadWeek();
        }
    });

    onBeforeUnmount(() => {
        fetchSequence += 1;
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
