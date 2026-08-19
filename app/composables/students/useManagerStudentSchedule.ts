import type { Ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { StudentDetail } from '~/types/students/student';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import { getStudentCountOverviewLabel } from '~/utils/students/studentDetailsPage';

export function useManagerStudentSchedule(input: {
    student: Ref<StudentDetail | null>;
    schoolId: Ref<string>;
}) {
    const { fetchScheduleForStudent } = useScheduleApi();
    const scheduleWeekStart = ref<Date>(getMonday(new Date()));
    const scheduleItems = ref<ScheduleLessonItem[]>([]);
    const scheduleLoading = ref(false);
    const scheduleError = ref<string | null>(null);
    let scheduleFetchSeq = 0;

    const studentScheduleRange = computed(() =>
        weekRangeFromMonday(scheduleWeekStart.value),
    );

    const scheduleOverviewLabel = computed(() => {
        return getStudentCountOverviewLabel({
            isLoading: scheduleLoading.value,
            hasError: Boolean(scheduleError.value),
            count: scheduleItems.value.length,
        });
    });

    async function loadStudentSchedule(): Promise<void> {
        const s = input.student.value;

        if (!s?.id || !input.schoolId.value) {
            scheduleItems.value = [];

            return;
        }

        const seq = ++scheduleFetchSeq;

        scheduleError.value = null;
        scheduleLoading.value = true;

        const { dateFrom, dateTo } = studentScheduleRange.value;

        try {
            const data = await fetchScheduleForStudent(
                s.id,
                dateFrom,
                dateTo,
                input.schoolId.value,
            );

            if (seq !== scheduleFetchSeq) {
                return;
            }

            scheduleItems.value = data;
        } catch (err: unknown) {
            if (seq !== scheduleFetchSeq) {
                return;
            }

            scheduleItems.value = [];
            scheduleError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać terminarza lekcji.',
            );
        } finally {
            if (seq === scheduleFetchSeq) {
                scheduleLoading.value = false;
            }
        }
    }

    function handlePrevScheduleWeek(): void {
        const d = new Date(scheduleWeekStart.value);

        d.setDate(d.getDate() - 7);
        scheduleWeekStart.value = getMonday(d);
    }

    function handleNextScheduleWeek(): void {
        const d = new Date(scheduleWeekStart.value);

        d.setDate(d.getDate() + 7);
        scheduleWeekStart.value = getMonday(d);
    }

    return {
        scheduleWeekStart,
        scheduleItems,
        scheduleLoading,
        scheduleError,
        studentScheduleRange,
        scheduleOverviewLabel,
        loadStudentSchedule,
        handlePrevScheduleWeek,
        handleNextScheduleWeek,
    };
}
