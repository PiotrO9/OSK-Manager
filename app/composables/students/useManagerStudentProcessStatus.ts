import type { Ref } from 'vue';
import type { StudentProcessStatus } from '~/types/students/student';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getStudentDetailsRouteUserIdString,
    getStudentProcessOverviewLabel,
} from '~/utils/students/studentDetailsPage';

export function useManagerStudentProcessStatus(input: {
    schoolId: Ref<string>;
}) {
    const { fetchProcessStatus } = useStudentsApi();
    const processStatus = ref<StudentProcessStatus | null>(null);
    const processStatusLoading = ref(false);
    const processStatusError = ref<string | null>(null);
    let processStatusFetchSeq = 0;

    const processStatusSteps = computed(() => processStatus.value?.steps ?? []);

    const processCompletedCount = computed(
        () => processStatusSteps.value.filter((step) => step.completed).length,
    );

    const processOverviewLabel = computed(() => {
        return getStudentProcessOverviewLabel({
            isLoading: processStatusLoading.value,
            hasError: Boolean(processStatusError.value),
            total: processStatusSteps.value.length,
            completed: processCompletedCount.value,
        });
    });

    async function loadStudentProcessStatus(rawUserId: unknown): Promise<void> {
        const userId = getStudentDetailsRouteUserIdString(rawUserId);

        processStatus.value = null;
        processStatusError.value = null;

        if (!userId || !input.schoolId.value) {
            processStatusLoading.value = false;

            return;
        }

        const seq = ++processStatusFetchSeq;

        processStatusLoading.value = true;

        try {
            const status = await fetchProcessStatus({
                userId,
                schoolId: input.schoolId.value,
            });

            if (seq !== processStatusFetchSeq) {
                return;
            }

            processStatus.value = status;
        } catch (err: unknown) {
            if (seq !== processStatusFetchSeq) {
                return;
            }

            processStatus.value = null;
            processStatusError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać statusu procesu kursanta.',
            );
        } finally {
            if (seq === processStatusFetchSeq) {
                processStatusLoading.value = false;
            }
        }
    }

    return {
        processStatus,
        processStatusSteps,
        processStatusLoading,
        processStatusError,
        processOverviewLabel,
        loadStudentProcessStatus,
    };
}
