import {
    normalizeStudentDetail,
    type StudentDetail,
    type StudentProcessStatus,
} from '~/types/students/student';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type {
    CreateStudentPaymentPayload,
    StudentPaymentItem,
    StudentPaymentsSummary,
    UpdateStudentPaymentPayload,
} from '~/types/payments/payment';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';

export function getRouteUserIdString(rawId: unknown): string {
    if (typeof rawId === 'string') {
        return rawId.trim();
    }

    if (Array.isArray(rawId)) {
        return String(rawId[0] ?? '').trim();
    }

    return '';
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
    const { fetchScheduleForStudent } = useScheduleApi();
    const { fetchProcessStatus } = useStudentsApi();
    const {
        createStudentPayment,
        fetchStudentPayments,
        markStudentPaymentPaid,
        markStudentPaymentUnpaid,
        updateStudentPayment,
    } = usePaymentsApi();

    const student = ref<StudentDetail | null>(null);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);
    const processStatus = ref<StudentProcessStatus | null>(null);
    const processStatusLoading = ref(false);
    const processStatusError = ref<string | null>(null);
    const payments = ref<StudentPaymentItem[]>([]);
    const paymentsSummary = ref<StudentPaymentsSummary>({
        paidAmount: '0.00',
        unpaidAmount: '0.00',
        overdueAmount: '0.00',
        overdueCount: 0,
        nextDueDate: null,
        currency: 'PLN',
    });
    const paymentsLoading = ref(false);
    const paymentsError = ref<string | null>(null);
    const paymentsSaving = ref(false);
    const paymentsActionError = ref<string | null>(null);
    const scheduleWeekStart = ref<Date>(getMonday(new Date()));
    const scheduleItems = ref<ScheduleLessonItem[]>([]);
    const scheduleLoading = ref(false);
    const scheduleError = ref<string | null>(null);

    const schoolId = computed((): string => {
        const raw = route.query.schoolId;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') {
            return '';
        }

        return s.trim();
    });

    const processStatusSteps = computed(() => processStatus.value?.steps ?? []);

    const studentDisplayName = computed(() => {
        const s = student.value;

        if (!s) {
            return 'Kursant';
        }

        const name = [s.firstName, s.lastName]
            .map((part) => part.trim())
            .filter((part) => part.length > 0)
            .join(' ');

        return name.length > 0 ? name : 'Kursant';
    });

    const studentInitials = computed(() => {
        const s = student.value;

        if (!s) {
            return 'K';
        }

        const first = s.firstName.trim().charAt(0);
        const last = s.lastName.trim().charAt(0);
        const initials = `${first}${last}`.trim();

        return initials.length > 0 ? initials.toUpperCase() : 'K';
    });

    const primaryCourse = computed(() => student.value?.courses[0] ?? null);

    const studentSubtitle = computed(() => {
        const category = primaryCourse.value?.category?.trim();

        if (category) {
            return `Kursant - Kat. ${category}`;
        }

        return 'Kursant';
    });

    const processCompletedCount = computed(
        () => processStatusSteps.value.filter((step) => step.completed).length,
    );

    const processOverviewLabel = computed(() => {
        const total = processStatusSteps.value.length;

        if (processStatusLoading.value) {
            return 'Wczytywanie';
        }

        if (processStatusError.value) {
            return 'Błąd';
        }

        if (total === 0) {
            return 'Brak kroków';
        }

        return `${processCompletedCount.value}/${total}`;
    });

    const notesOverviewLabel = computed(() => {
        const notes = student.value?.notes?.trim();

        return notes && notes.length > 0 ? 'Dodano' : 'Brak notatki';
    });

    const paymentsOverviewLabel = computed(() => {
        if (paymentsLoading.value) {
            return 'Wczytywanie';
        }

        if (paymentsError.value) {
            return 'Błąd';
        }

        return `${payments.value.length}`;
    });

    const scheduleOverviewLabel = computed(() => {
        if (scheduleLoading.value) {
            return 'Wczytywanie';
        }

        if (scheduleError.value) {
            return 'Błąd';
        }

        return `${scheduleItems.value.length}`;
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

    const studentScheduleRange = computed(() =>
        weekRangeFromMonday(scheduleWeekStart.value),
    );

    usePageMeta({
        title: () => studentDisplayName.value,
        description: () => 'Szczegóły kursanta.',
    });

    let fetchSeq = 0;
    let processStatusFetchSeq = 0;
    let paymentsFetchSeq = 0;
    let scheduleFetchSeq = 0;

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

    async function loadStudentProcessStatus(rawUserId: unknown): Promise<void> {
        const userId = getRouteUserIdString(rawUserId);

        processStatus.value = null;
        processStatusError.value = null;

        if (!userId || !schoolId.value) {
            processStatusLoading.value = false;

            return;
        }

        const seq = ++processStatusFetchSeq;

        processStatusLoading.value = true;

        try {
            const status = await fetchProcessStatus({
                userId,
                schoolId: schoolId.value,
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

    async function loadStudentPayments(rawUserId: unknown): Promise<void> {
        const userId = getRouteUserIdString(rawUserId);

        payments.value = [];
        paymentsError.value = null;

        if (!userId || !schoolId.value) {
            paymentsLoading.value = false;

            return;
        }

        const seq = ++paymentsFetchSeq;

        paymentsLoading.value = true;

        try {
            const data = await fetchStudentPayments(userId, schoolId.value);

            if (seq !== paymentsFetchSeq) {
                return;
            }

            payments.value = data.payments;
            paymentsSummary.value = data.summary;
        } catch (err: unknown) {
            if (seq !== paymentsFetchSeq) {
                return;
            }

            payments.value = [];
            paymentsSummary.value = {
                paidAmount: '0.00',
                unpaidAmount: '0.00',
                overdueAmount: '0.00',
                overdueCount: 0,
                nextDueDate: null,
                currency: 'PLN',
            };
            paymentsError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać opłat kursanta.',
            );
        } finally {
            if (seq === paymentsFetchSeq) {
                paymentsLoading.value = false;
            }
        }
    }

    async function loadStudentSchedule(): Promise<void> {
        const s = student.value;

        if (!s?.id || !schoolId.value) {
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
                schoolId.value,
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

    async function handleCreateStudentPayment(
        payload: CreateStudentPaymentPayload,
    ): Promise<void> {
        await handleStudentPaymentAction(() =>
            createStudentPayment(
                getRouteUserIdString(route.params.userId),
                schoolId.value,
                payload,
            ),
        );
    }

    async function handleUpdateStudentPayment(
        paymentId: string,
        payload: UpdateStudentPaymentPayload,
    ): Promise<void> {
        await handleStudentPaymentAction(() =>
            updateStudentPayment(
                getRouteUserIdString(route.params.userId),
                schoolId.value,
                paymentId,
                payload,
            ),
        );
    }

    async function handleMarkStudentPaymentPaid(
        paymentId: string,
    ): Promise<void> {
        await handleStudentPaymentAction(() =>
            markStudentPaymentPaid(
                getRouteUserIdString(route.params.userId),
                schoolId.value,
                paymentId,
            ),
        );
    }

    async function handleMarkStudentPaymentUnpaid(
        paymentId: string,
    ): Promise<void> {
        await handleStudentPaymentAction(() =>
            markStudentPaymentUnpaid(
                getRouteUserIdString(route.params.userId),
                schoolId.value,
                paymentId,
            ),
        );
    }

    async function handleStudentPaymentAction(
        action: () => ReturnType<typeof createStudentPayment>,
    ): Promise<void> {
        paymentsActionError.value = null;

        if (!schoolId.value) {
            paymentsActionError.value = getMissingSchoolIdMessage();

            return;
        }

        paymentsSaving.value = true;

        try {
            const data = await action();

            payments.value = data.payments;
            paymentsSummary.value = data.summary;
        } catch (err: unknown) {
            paymentsActionError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać płatności kursanta.',
            );
        } finally {
            paymentsSaving.value = false;
        }
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
