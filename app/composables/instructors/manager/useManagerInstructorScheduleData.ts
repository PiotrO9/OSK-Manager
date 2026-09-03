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

    let scheduleSeq = 0;

    async function loadSchedule(): Promise<void> {
        const id = instructorId.value;

        if (!id) {
            items.value = [];

            return;
        }

        const seq = ++scheduleSeq;

        scheduleError.value = null;
        isScheduleLoading.value = true;

        const { dateFrom, dateTo } = range.value;

        try {
            const data = await fetchScheduleForInstructor(id, dateFrom, dateTo);

            if (seq !== scheduleSeq) {
                return;
            }

            items.value = data;
        } catch (err: unknown) {
            if (seq !== scheduleSeq) {
                return;
            }

            items.value = [];
            scheduleError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać terminarza lekcji.',
            );
        } finally {
            if (seq === scheduleSeq) {
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
