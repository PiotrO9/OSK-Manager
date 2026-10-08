import type { Ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

interface ManagerInstructorScheduleRange {
    dateFrom: string;
    dateTo: string;
}

interface UseManagerInstructorScheduleDataOptions {
    instructorId: Ref<string>;
    range: Ref<ManagerInstructorScheduleRange>;
}

export function useManagerInstructorScheduleData({
    instructorId,
    range,
}: UseManagerInstructorScheduleDataOptions) {
    const { fetchScheduleForInstructor } = useScheduleApi();

    const items = ref<ScheduleLessonItem[]>([]);
    const isScheduleLoading = ref(false);
    const scheduleError = ref<string | null>(null);

    let scheduleSequence = 0;

    async function loadSchedule(): Promise<void> {
        const id = instructorId.value;

        if (!id) {
            items.value = [];

            return;
        }

        const requestSequence = ++scheduleSequence;

        scheduleError.value = null;
        isScheduleLoading.value = true;

        const { dateFrom, dateTo } = range.value;

        try {
            const data = await fetchScheduleForInstructor(id, dateFrom, dateTo);

            if (requestSequence !== scheduleSequence) {
                return;
            }

            items.value = data;
        } catch (err: unknown) {
            if (requestSequence !== scheduleSequence) {
                return;
            }

            items.value = [];
            scheduleError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać terminarza lekcji.',
            );
        } finally {
            if (requestSequence === scheduleSequence) {
                isScheduleLoading.value = false;
            }
        }
    }

    return {
        items,
        isScheduleLoading,
        scheduleError,
        loadSchedule,
    };
}
