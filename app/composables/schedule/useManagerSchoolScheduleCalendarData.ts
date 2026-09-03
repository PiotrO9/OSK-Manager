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

    async function loadWeek(): Promise<void> {
        if (options.disabled()) {
            return;
        }

        const sid = options.schoolId().trim();

        if (!sid) {
            internalItems.value = [];
            errorMessage.value = null;

            return;
        }

        const seq = ++fetchSeq;

        errorMessage.value = null;

        const { dateFrom, dateTo } = weekRangeFromMonday(
            options.weekStart.value,
        );

        try {
            const data = await fetchSchoolSchedule(sid, dateFrom, dateTo);

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

    return {
        errorMessage,
        internalItems,
        isLoading,
        loadWeek,
    };
}
