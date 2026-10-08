import {
    normalizeStudentDetail,
    type StudentDetail,
} from '~/types/students/student';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getStudentDetailsDisplayName,
    getStudentDetailsInitials,
    getStudentDetailsRouteUserIdString,
    getStudentDetailsSubtitle,
} from '~/utils/students/studentDetailsPage';
import { useManagerStudentPayments } from './useManagerStudentPayments';
import { useManagerStudentProcessStatus } from './useManagerStudentProcessStatus';
import { useManagerStudentSchedule } from './useManagerStudentSchedule';

export function getRouteUserIdString(rawId: unknown): string {
    return getStudentDetailsRouteUserIdString(rawId);
}

function getNotFoundMessage(): string {
    return 'Nie znaleziono kursanta.';
}

function getGenericLoadErrorMessage(): string {
    return 'Nie udało się wczytać danych kursanta.';
}

type StudentDetailData = StudentDetail | null;

export function useManagerStudentDetailsPage() {
    const route = useRoute();
    const router = useRouter();
    const student = ref<StudentDetail | null>(null);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);

    const schoolId = computed(() => student.value?.schoolId ?? '');

    const {
        processStatusSteps,
        processStatusLoading,
        processStatusError,
        loadStudentProcessStatus,
    } = useManagerStudentProcessStatus({
        schoolId,
    });

    const {
        payments,
        paymentsSummary,
        paymentsLoading,
        paymentsError,
        paymentsSaving,
        paymentsActionError,
        paymentCreateSuccessVersion,
        loadStudentPayments,
        handleCreateStudentPayment,
        handleUpdateStudentPayment,
        handleMarkStudentPaymentPaid,
        handleMarkStudentPaymentUnpaid,
    } = useManagerStudentPayments({
        schoolId,
        getUserId: () => route.params.userId,
    });

    const {
        scheduleWeekStart,
        scheduleItems,
        scheduleLoading,
        scheduleError,
        studentScheduleRange,
        loadStudentSchedule,
        handlePrevScheduleWeek,
        handleNextScheduleWeek,
    } = useManagerStudentSchedule({
        student,
        schoolId,
    });

    const studentDisplayName = computed(() => {
        return getStudentDetailsDisplayName(student.value);
    });

    const studentInitials = computed(() => {
        return getStudentDetailsInitials(student.value);
    });

    const studentSubtitle = computed(() => {
        return getStudentDetailsSubtitle(student.value);
    });

    const backToListHref = computed(() => {
        const schoolIdForRoute = schoolId.value;

        if (!schoolIdForRoute) {
            return '/manager/students';
        }

        return {
            path: '/manager/students',
            query: { schoolId: schoolIdForRoute },
        };
    });

    usePageMeta({
        title: () => studentDisplayName.value,
        description: () => 'Szczegóły kursanta.',
    });

    let fetchSequence = 0;

    async function loadStudent(rawUserId: unknown): Promise<void> {
        errorMessage.value = null;

        const userId = getRouteUserIdString(rawUserId);

        if (!userId) {
            student.value = null;
            errorMessage.value = getNotFoundMessage();
            isLoading.value = false;

            return;
        }

        const requestSequence = ++fetchSequence;

        isLoading.value = true;
        student.value = null;

        try {
            const data = await requestBffData<StudentDetailData>(
                'GET',
                `/api/students/${encodeURIComponent(userId)}`,
                {
                    fallbackMessage: getGenericLoadErrorMessage(),
                },
            );
            const normalized = normalizeStudentDetail(data);

            if (requestSequence !== fetchSequence) {
                return;
            }

            if (!normalized) {
                errorMessage.value = getNotFoundMessage();
                student.value = null;

                return;
            }

            student.value = normalized;
        } catch (err: unknown) {
            if (requestSequence !== fetchSequence) {
                return;
            }

            const status = getApiErrorStatusCode(err);

            if (status === 404 || status === 400) {
                errorMessage.value = getNotFoundMessage();
            } else {
                errorMessage.value = getApiFetchErrorMessage(
                    err,
                    getGenericLoadErrorMessage(),
                );
            }

            student.value = null;
        } finally {
            if (requestSequence === fetchSequence) {
                isLoading.value = false;
            }
        }
    }

    watch(
        () => [route.params.userId, route.query.schoolId] as const,
        ([, querySchoolId]) => {
            if (querySchoolId === undefined) {
                return;
            }

            void router.replace({ path: route.path, query: {} });
        },
        { immediate: true },
    );

    watch(
        () => route.params.userId,
        async (userId) => {
            await loadStudent(userId);
        },
        { immediate: true },
    );

    watch(
        () => [route.params.userId, schoolId.value] as const,
        ([userId]) => {
            void loadStudentProcessStatus(userId);
            void loadStudentPayments(userId);
        },
        { immediate: true },
    );

    watch(
        [() => student.value?.id, schoolId, studentScheduleRange],
        () => {
            void loadStudentSchedule();
        },
        { immediate: true },
    );

    function handleStudentNotesUpdate(notes: string | null): void {
        const s = student.value;

        if (!s) {
            return;
        }

        s.notes = notes;
    }

    return {
        student,
        isLoading,
        errorMessage,
        schoolId,
        processStatusSteps,
        processStatusLoading,
        processStatusError,
        payments,
        paymentsSummary,
        paymentsLoading,
        paymentsError,
        paymentsSaving,
        paymentsActionError,
        paymentCreateSuccessVersion,
        studentDisplayName,
        studentInitials,
        studentSubtitle,
        backToListHref,
        scheduleWeekStart,
        scheduleItems,
        scheduleLoading,
        scheduleError,
        studentScheduleRange,
        handleStudentNotesUpdate,
        handlePrevScheduleWeek,
        handleNextScheduleWeek,
        handleCreateStudentPayment,
        handleUpdateStudentPayment,
        handleMarkStudentPaymentPaid,
        handleMarkStudentPaymentUnpaid,
    };
}
