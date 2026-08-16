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
    getStudentNotesOverviewLabel,
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

function getMissingSchoolIdMessage(): string {
    return 'Brak identyfikatora szkoły w adresie strony. Wróć do listy kursantów i otwórz szczegóły ponownie.';
}

export function useManagerStudentDetailsPage() {
    const route = useRoute();
    const student = ref<StudentDetail | null>(null);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);

    const schoolId = computed((): string => {
        const raw = route.query.schoolId;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') {
            return '';
        }

        return s.trim();
    });

    const {
        processStatusSteps,
        processStatusLoading,
        processStatusError,
        processOverviewLabel,
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
        paymentsOverviewLabel,
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
        scheduleOverviewLabel,
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

    const notesOverviewLabel = computed(() => {
        return getStudentNotesOverviewLabel(student.value);
    });

    const backToListHref = computed(() => {
        const sid = schoolId.value;

        if (!sid) {
            return '/manager/students';
        }

        return {
            path: '/manager/students',
            query: { schoolId: sid },
        };
    });

    usePageMeta({
        title: () => studentDisplayName.value,
        description: () => 'Szczegóły kursanta.',
    });

    let fetchSeq = 0;

    async function loadStudent(rawUserId: unknown): Promise<void> {
        errorMessage.value = null;

        const userId = getRouteUserIdString(rawUserId);

        if (!schoolId.value) {
            student.value = null;
            errorMessage.value = getMissingSchoolIdMessage();
            isLoading.value = false;

            return;
        }

        if (!userId) {
            student.value = null;
            errorMessage.value = getNotFoundMessage();
            isLoading.value = false;

            return;
        }

        const seq = ++fetchSeq;

        isLoading.value = true;
        student.value = null;

        try {
            const qs = new URLSearchParams({ schoolId: schoolId.value });
            const data = await requestBffData<unknown>(
                'GET',
                `/api/students/${encodeURIComponent(userId)}?${qs.toString()}`,
                {
                    fallbackMessage: getGenericLoadErrorMessage(),
                },
            );
            const normalized = normalizeStudentDetail(data);

            if (seq !== fetchSeq) {
                return;
            }

            if (!normalized) {
                errorMessage.value = getNotFoundMessage();
                student.value = null;

                return;
            }

            student.value = normalized;
        } catch (err: unknown) {
            if (seq !== fetchSeq) {
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
            if (seq === fetchSeq) {
                isLoading.value = false;
            }
        }
    }

    watch(
        () => [route.params.userId, route.query.schoolId] as const,
        async ([userId]) => {
            await loadStudent(userId);
        },
        { immediate: true },
    );

    watch(
        () => [route.params.userId, route.query.schoolId] as const,
        ([userId]) => {
            void loadStudentProcessStatus(userId);
            void loadStudentPayments(userId);
        },
        { immediate: true },
    );

    watch(
        [
            () => student.value?.id,
            () => route.query.schoolId,
            studentScheduleRange,
        ],
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
        studentDisplayName,
        studentInitials,
        studentSubtitle,
        processOverviewLabel,
        notesOverviewLabel,
        paymentsOverviewLabel,
        scheduleOverviewLabel,
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
