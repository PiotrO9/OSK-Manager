<script setup lang="ts">
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    ClipboardList,
    CreditCard,
    IdCard,
    Mail,
} from 'lucide-vue-next';
import {
    formatStudentCourseStatusLabel,
    getStudentCourseStatusVariant,
    normalizeStudentDetail,
    type StudentDetail,
    type StudentProcessStatus,
} from '~/types/student';
import {
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { getMonday, weekRangeFromMonday } from '~/utils/weeklyCalendarDates';
import type { ScheduleLessonItem } from '~/types/schedule';
import type { StudentPaymentItem } from '~/types/payment';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { fetchScheduleForStudent } = useScheduleApi();
const { fetchProcessStatus } = useStudentsApi();
const { fetchStudentPayments } = usePaymentsApi();

const student = ref<StudentDetail | null>(null);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const processStatus = ref<StudentProcessStatus | null>(null);
const processStatusLoading = ref(false);
const processStatusError = ref<string | null>(null);
const processStatusSteps = computed(() => processStatus.value?.steps ?? []);
const payments = ref<StudentPaymentItem[]>([]);
const paymentsLoading = ref(false);
const paymentsError = ref<string | null>(null);

usePageMeta({
    title: () => {
        const s = student.value;

        if (!s) {
            return 'Kursant';
        }

        const name = [s.firstName, s.lastName]
            .map((x) => x.trim())
            .filter((x) => x.length > 0)
            .join(' ');

        return name.length > 0 ? name : 'Kursant';
    },
    description: () => 'Szczegóły kursanta.',
});

let fetchSeq = 0;

function getRouteUserIdString(rawId: unknown): string {
    if (typeof rawId === 'string') {
        return rawId.trim();
    }

    if (Array.isArray(rawId)) {
        return String(rawId[0] ?? '').trim();
    }

    return '';
}

function readSchoolIdFromQuery(): string {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') {
        return '';
    }

    return s.trim();
}

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '--';
}

function displayPkkNumber(value: string | null): string {
    if (value === null || value === undefined) {
        return 'Brak PKK';
    }

    const t = value.trim();

    return t.length > 0 ? t : 'Brak PKK';
}

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
    const course = primaryCourse.value;
    const category = course?.category?.trim();

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
        return 'Blad';
    }

    if (total === 0) {
        return 'Brak krokow';
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
        return 'Blad';
    }

    return `${payments.value.length}`;
});

const scheduleOverviewLabel = computed(() => {
    if (scheduleLoading.value) {
        return 'Wczytywanie';
    }

    if (scheduleError.value) {
        return 'Blad';
    }

    return `${scheduleItems.value.length}`;
});

function formatShortDate(value: string): string {
    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
    }).format(d);
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

async function loadStudent(rawUserId: unknown) {
    errorMessage.value = null;

    const userId = getRouteUserIdString(rawUserId);
    const schoolId = readSchoolIdFromQuery();

    if (!schoolId) {
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
        const qs = new URLSearchParams({ schoolId });
        const url = resolveBffEndpoint(
            `/api/students/${encodeURIComponent(userId)}?${qs.toString()}`,
        );

        const raw = await $fetch<unknown>(url, { credentials: 'include' });
        const data = unwrapApiSuccessData<unknown>(raw);
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

let processStatusFetchSeq = 0;

async function loadStudentProcessStatus(rawUserId: unknown): Promise<void> {
    const userId = getRouteUserIdString(rawUserId);
    const schoolId = readSchoolIdFromQuery();

    processStatus.value = null;
    processStatusError.value = null;

    if (!userId || !schoolId) {
        processStatusLoading.value = false;

        return;
    }

    const seq = ++processStatusFetchSeq;

    processStatusLoading.value = true;

    try {
        const status = await fetchProcessStatus({ userId, schoolId });

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

watch(
    () => [route.params.userId, route.query.schoolId] as const,
    ([userId]) => {
        void loadStudentProcessStatus(userId);
    },
    { immediate: true },
);

let paymentsFetchSeq = 0;

async function loadStudentPayments(rawUserId: unknown): Promise<void> {
    const userId = getRouteUserIdString(rawUserId);
    const schoolId = readSchoolIdFromQuery();

    payments.value = [];
    paymentsError.value = null;

    if (!userId || !schoolId) {
        paymentsLoading.value = false;

        return;
    }

    const seq = ++paymentsFetchSeq;

    paymentsLoading.value = true;

    try {
        const data = await fetchStudentPayments(userId, schoolId);

        if (seq !== paymentsFetchSeq) {
            return;
        }

        payments.value = data;
    } catch (err: unknown) {
        if (seq !== paymentsFetchSeq) {
            return;
        }

        payments.value = [];
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

watch(
    () => [route.params.userId, route.query.schoolId] as const,
    ([userId]) => {
        void loadStudentPayments(userId);
    },
    { immediate: true },
);

const backToListHref = computed(() => {
    const sid = readSchoolIdFromQuery();

    if (!sid) {
        return '/manager/students';
    }

    return {
        path: '/manager/students',
        query: { schoolId: sid },
    };
});

function handleStudentNotesUpdate(notes: string | null) {
    const s = student.value;

    if (!s) {
        return;
    }

    s.notes = notes;
}

const scheduleWeekStart = ref<Date>(getMonday(new Date()));
const scheduleItems = ref<ScheduleLessonItem[]>([]);
const scheduleLoading = ref(false);
const scheduleError = ref<string | null>(null);

const studentScheduleRange = computed(() =>
    weekRangeFromMonday(scheduleWeekStart.value),
);

let scheduleFetchSeq = 0;

async function loadStudentSchedule(): Promise<void> {
    const s = student.value;
    const schoolId = readSchoolIdFromQuery();

    if (!s?.id || !schoolId) {
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
            schoolId,
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
    [() => student.value?.id, () => route.query.schoolId, studentScheduleRange],
    () => {
        void loadStudentSchedule();
    },
    { immediate: true },
);

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

function formatScheduleWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            :title="studentDisplayName"
            description="Profil kursanta, status procesu, platnosci i najblizsze jazdy."
        >
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="backToListHref"
                        aria-label="Wróć do listy kursantów"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista kursantów
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div v-if="isLoading" class="space-y-4" role="status">
            <UiSkeleton class="h-28 rounded-2xl" />
            <UiSkeleton class="h-56 rounded-2xl" />
        </div>

        <ErrorState
            v-else-if="errorMessage"
            title="Nie udało się wczytać kursanta"
            :description="errorMessage"
        />

        <template v-else-if="student !== null">
            <div class="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                    <UiCardContent class="space-y-5 p-5">
                        <div class="flex items-start gap-4 xl:flex-col">
                            <div
                                class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xl font-extrabold text-sky-700"
                                aria-hidden="true"
                            >
                                {{ studentInitials }}
                            </div>
                            <div class="min-w-0">
                                <h2
                                    class="text-foreground truncate text-xl font-extrabold"
                                >
                                    {{ studentDisplayName }}
                                </h2>
                                <p class="text-muted-foreground mt-1 text-sm">
                                    {{ studentSubtitle }}
                                </p>
                            </div>
                        </div>

                        <dl class="divide-border divide-y">
                            <div
                                class="flex items-center justify-between gap-4 py-3"
                            >
                                <dt
                                    class="text-muted-foreground flex items-center gap-2 text-sm"
                                >
                                    <Mail class="size-4" aria-hidden="true" />
                                    Email
                                </dt>
                                <dd
                                    class="max-w-[180px] truncate text-right text-sm font-bold"
                                >
                                    {{ displayText(student.email) }}
                                </dd>
                            </div>
                            <div
                                class="flex items-center justify-between gap-4 py-3"
                            >
                                <dt
                                    class="text-muted-foreground flex items-center gap-2 text-sm"
                                >
                                    <IdCard class="size-4" aria-hidden="true" />
                                    Numer PKK
                                </dt>
                                <dd
                                    class="text-right text-sm font-bold"
                                    :class="{
                                        'text-muted-foreground':
                                            !student.pkkNumber ||
                                            student.pkkNumber.trim().length ===
                                                0,
                                    }"
                                >
                                    {{ displayPkkNumber(student.pkkNumber) }}
                                </dd>
                            </div>
                            <div
                                class="flex items-center justify-between gap-4 py-3"
                            >
                                <dt
                                    class="text-muted-foreground flex items-center gap-2 text-sm"
                                >
                                    <BookOpen
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                    Kursy
                                </dt>
                                <dd class="text-sm font-bold">
                                    {{ student.courses.length }}
                                </dd>
                            </div>
                        </dl>
                    </UiCardContent>
                </UiCard>

                <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                    <UiCardHeader class="border-border border-b p-5 pt-0">
                        <div
                            class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                        >
                            <div class="space-y-1">
                                <UiCardTitle class="text-xl font-extrabold">
                                    Przeglad
                                </UiCardTitle>
                                <UiCardDescription>
                                    Najwazniejsze dane i sekcje tego widoku.
                                </UiCardDescription>
                            </div>
                            <UiBadge
                                variant="outline"
                                class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                            >
                                Aktualne
                            </UiBadge>
                        </div>
                    </UiCardHeader>
                    <UiCardContent class="grid gap-3 p-4 sm:grid-cols-2">
                        <div
                            class="border-border rounded-2xl border p-4"
                            aria-label="Status procesu"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="font-extrabold">Status procesu</p>
                                    <p
                                        class="text-muted-foreground mt-1 text-sm"
                                    >
                                        PKK, teoria, praktyka i platnosci.
                                    </p>
                                </div>
                                <UiBadge
                                    variant="outline"
                                    class="shrink-0 rounded-full bg-sky-50 text-sky-700"
                                >
                                    {{ processOverviewLabel }}
                                </UiBadge>
                            </div>
                        </div>

                        <div
                            class="border-border rounded-2xl border p-4"
                            aria-label="Notatki managera"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="font-extrabold">
                                        Notatki managera
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-1 text-sm"
                                    >
                                        Dane zachowane w profilu kursanta.
                                    </p>
                                </div>
                                <UiBadge
                                    variant="outline"
                                    class="shrink-0 rounded-full"
                                >
                                    {{ notesOverviewLabel }}
                                </UiBadge>
                            </div>
                        </div>

                        <div
                            class="border-border rounded-2xl border p-4"
                            aria-label="Platnosci"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="font-extrabold">Platnosci</p>
                                    <p
                                        class="text-muted-foreground mt-1 text-sm"
                                    >
                                        Historia opłat w wybranej szkole.
                                    </p>
                                </div>
                                <UiBadge
                                    variant="outline"
                                    class="shrink-0 rounded-full"
                                >
                                    {{ paymentsOverviewLabel }}
                                </UiBadge>
                            </div>
                        </div>

                        <div
                            class="border-border rounded-2xl border p-4"
                            aria-label="Lekcje tygodniowe"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="font-extrabold">
                                        Lekcje tygodniowe
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-1 text-sm"
                                    >
                                        Terminarz dla aktualnego tygodnia.
                                    </p>
                                </div>
                                <UiBadge
                                    variant="outline"
                                    class="shrink-0 rounded-full"
                                >
                                    {{ scheduleOverviewLabel }}
                                </UiBadge>
                            </div>
                        </div>
                    </UiCardContent>
                </UiCard>
            </div>

            <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <ManagerStudentProcessStatus
                    class="min-w-0"
                    :steps="processStatusSteps"
                    :is-loading="processStatusLoading"
                    :error="processStatusError"
                />

                <ManagerStudentNotes
                    class="min-w-0"
                    :user-id="student.userId"
                    :school-id="readSchoolIdFromQuery()"
                    :initial-notes="student.notes"
                    @update:notes="handleStudentNotesUpdate"
                />

                <section
                    aria-labelledby="student-schedule-heading"
                    class="border-border bg-card min-w-0 rounded-2xl border p-5 shadow-sm xl:col-span-2"
                >
                    <div
                        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                        <div class="space-y-1">
                            <h2
                                id="student-schedule-heading"
                                class="text-foreground text-xl font-extrabold"
                            >
                                Terminarz lekcji
                            </h2>
                            <p class="text-muted-foreground text-sm">
                                Lekcje przypisane do kursanta w wybranym
                                tygodniu.
                            </p>
                        </div>
                        <UiBadge
                            variant="outline"
                            class="w-fit rounded-full px-3 py-1"
                        >
                            <CalendarDays
                                class="mr-1.5 size-3.5"
                                aria-hidden="true"
                            />
                            {{ formatShortDate(studentScheduleRange.dateFrom) }}
                            -
                            {{ formatShortDate(studentScheduleRange.dateTo) }}
                        </UiBadge>
                    </div>
                    <div
                        class="mb-4 flex flex-wrap items-center gap-2"
                        role="group"
                        aria-label="Nawigacja tygodnia terminarza"
                    >
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            class="rounded-xl"
                            aria-label="Poprzedni tydzien"
                            @click="handlePrevScheduleWeek"
                        >
                            Poprzedni
                        </UiButton>
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            class="rounded-xl"
                            aria-label="Nastepny tydzien"
                            @click="handleNextScheduleWeek"
                        >
                            Nastepny
                        </UiButton>
                        <span class="text-muted-foreground text-sm">
                            Tydzien od
                            {{ formatScheduleWeekLabel(scheduleWeekStart) }}
                        </span>
                    </div>
                    <p
                        v-if="scheduleLoading"
                        class="text-muted-foreground text-sm"
                        role="status"
                    >
                        Wczytywanie lekcji...
                    </p>
                    <p
                        v-else-if="scheduleError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ scheduleError }}
                    </p>
                    <ManagerScheduleLessonTable v-else :items="scheduleItems" />
                </section>

                <section
                    aria-labelledby="student-payments-heading"
                    class="border-border bg-card min-w-0 rounded-2xl border p-5 shadow-sm"
                >
                    <div class="mb-4 flex items-start justify-between gap-3">
                        <div class="space-y-1">
                            <h2
                                id="student-payments-heading"
                                class="text-foreground text-xl font-extrabold"
                            >
                                Platnosci
                            </h2>
                            <p class="text-muted-foreground text-sm">
                                Historia opłat kursanta w wybranej szkole.
                            </p>
                        </div>
                        <CreditCard
                            class="text-muted-foreground size-5 shrink-0"
                            aria-hidden="true"
                        />
                    </div>
                    <StudentPaymentsList
                        :payments="payments"
                        :is-loading="paymentsLoading"
                        :error="paymentsError"
                    />
                </section>

                <section
                    aria-labelledby="student-courses-heading"
                    class="border-border bg-card min-w-0 rounded-2xl border p-5 shadow-sm"
                >
                    <div class="mb-4 flex items-start justify-between gap-3">
                        <div class="space-y-1">
                            <h2
                                id="student-courses-heading"
                                class="text-foreground text-xl font-extrabold"
                            >
                                Kursy w szkole
                            </h2>
                            <p class="text-muted-foreground text-sm">
                                Przypisania kursanta do kursów w tej OSK.
                            </p>
                        </div>
                        <ClipboardList
                            class="text-muted-foreground size-5 shrink-0"
                            aria-hidden="true"
                        />
                    </div>

                    <EmptyState
                        v-if="student.courses.length === 0"
                        title="Brak kursów"
                        description="Kursant nie jest przypisany do żadnego kursu w tej szkole."
                    />

                    <ul v-else class="space-y-3" role="list">
                        <li
                            v-for="course in student.courses"
                            :key="course.id"
                            class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div class="min-w-0">
                                <p
                                    class="text-foreground text-sm font-extrabold wrap-break-word"
                                >
                                    {{ displayText(course.name) }}
                                </p>
                                <p class="text-muted-foreground mt-1 text-xs">
                                    Kategoria:
                                    {{
                                        course.category.trim().length > 0
                                            ? course.category
                                            : '--'
                                    }}
                                </p>
                            </div>
                            <UiBadge
                                :variant="
                                    getStudentCourseStatusVariant(course.status)
                                "
                                class="w-fit shrink-0 rounded-full"
                                :aria-label="`Status w kursie: ${formatStudentCourseStatusLabel(course.status)}`"
                            >
                                {{
                                    formatStudentCourseStatusLabel(
                                        course.status,
                                    )
                                }}
                            </UiBadge>
                        </li>
                    </ul>
                </section>
            </div>
        </template>
    </div>
</template>
