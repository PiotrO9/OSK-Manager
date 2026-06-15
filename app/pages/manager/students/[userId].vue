<script setup lang="ts">
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

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { fetchScheduleForStudent } = useScheduleApi();
const { fetchProcessStatus } = useStudentsApi();

const student = ref<StudentDetail | null>(null);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const processStatus = ref<StudentProcessStatus | null>(null);
const processStatusLoading = ref(false);
const processStatusError = ref<string | null>(null);
const processStatusSteps = computed(() => processStatus.value?.steps ?? []);

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

    return t.length > 0 ? t : '—';
}

function displayPkkNumber(value: string | null): string {
    if (value === null || value === undefined) {
        return 'Brak PKK';
    }

    const t = value.trim();

    return t.length > 0 ? t : 'Brak PKK';
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

    if (!s?.id) {
        scheduleItems.value = [];

        return;
    }

    const seq = ++scheduleFetchSeq;

    scheduleError.value = null;
    scheduleLoading.value = true;

    const { dateFrom, dateTo } = studentScheduleRange.value;

    try {
        const data = await fetchScheduleForStudent(s.id, dateFrom, dateTo);

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
    [() => student.value?.id, studentScheduleRange],
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
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Szczegóły kursanta
            </h1>
            <p class="text-muted-foreground text-sm">
                Dane podstawowe, notatka i przypisane kursy w wybranej szkole.
            </p>
        </div>

        <p
            v-if="isLoading"
            class="text-muted-foreground text-sm"
            role="status"
            aria-live="polite"
        >
            Wczytywanie danych kursanta…
        </p>

        <p
            v-else-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ errorMessage }}
        </p>

        <template v-else-if="student !== null">
            <div
                class="grid w-full max-w-7xl gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]"
            >
                <div
                    class="border-border bg-card min-w-0 space-y-8 rounded-xl border p-6 shadow-sm"
                >
                    <section aria-labelledby="student-basic-heading">
                        <h2
                            id="student-basic-heading"
                            class="text-foreground mb-4 text-lg font-semibold"
                        >
                            Dane podstawowe
                        </h2>
                        <dl
                            class="border-border grid gap-4 border-t pt-4 sm:grid-cols-2"
                        >
                            <div>
                                <dt
                                    class="text-muted-foreground text-xs font-medium"
                                >
                                    Imię
                                </dt>
                                <dd
                                    class="text-foreground mt-1 text-sm font-medium"
                                >
                                    {{ displayText(student.firstName) }}
                                </dd>
                            </div>
                            <div>
                                <dt
                                    class="text-muted-foreground text-xs font-medium"
                                >
                                    Nazwisko
                                </dt>
                                <dd
                                    class="text-foreground mt-1 text-sm font-medium"
                                >
                                    {{ displayText(student.lastName) }}
                                </dd>
                            </div>
                            <div class="sm:col-span-2">
                                <dt
                                    class="text-muted-foreground text-xs font-medium"
                                >
                                    E-mail
                                </dt>
                                <dd
                                    class="text-foreground mt-1 text-sm font-medium break-all"
                                >
                                    {{ displayText(student.email) }}
                                </dd>
                            </div>
                            <div class="sm:col-span-2">
                                <dt
                                    class="text-muted-foreground text-xs font-medium"
                                >
                                    Numer PKK
                                </dt>
                                <dd
                                    class="text-foreground mt-1 text-sm font-medium"
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
                        </dl>
                    </section>

                    <ManagerStudentNotes
                        :user-id="student.userId"
                        :school-id="readSchoolIdFromQuery()"
                        :initial-notes="student.notes"
                        @update:notes="handleStudentNotesUpdate"
                    />
                </div>

                <ManagerStudentProcessStatus
                    class="min-w-0 self-start"
                    :steps="processStatusSteps"
                    :is-loading="processStatusLoading"
                    :error="processStatusError"
                />

                <section
                    aria-labelledby="student-schedule-heading"
                    class="border-border bg-card min-w-0 rounded-xl border p-6 shadow-sm xl:col-span-2"
                >
                    <h2
                        id="student-schedule-heading"
                        class="text-foreground mb-4 text-lg font-semibold"
                    >
                        Terminarz lekcji
                    </h2>
                    <p class="text-muted-foreground mb-4 text-sm">
                        Lekcje przypisane do kursanta w wybranym tygodniu (widok
                        biura).
                    </p>
                    <div
                        class="mb-4 flex flex-wrap items-center gap-2"
                        role="group"
                        aria-label="Nawigacja tygodnia terminarza"
                    >
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Poprzedni tydzień"
                            @click="handlePrevScheduleWeek"
                        >
                            ← Poprzedni
                        </UiButton>
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Następny tydzień"
                            @click="handleNextScheduleWeek"
                        >
                            Następny →
                        </UiButton>
                        <span class="text-muted-foreground text-sm">
                            Tydzień od
                            {{ formatScheduleWeekLabel(scheduleWeekStart) }}
                        </span>
                    </div>
                    <p
                        v-if="scheduleLoading"
                        class="text-muted-foreground text-sm"
                        role="status"
                    >
                        Wczytywanie lekcji…
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
                    aria-labelledby="student-courses-heading"
                    class="border-border bg-card min-w-0 rounded-xl border p-6 shadow-sm xl:col-span-2"
                >
                    <h2
                        id="student-courses-heading"
                        class="text-foreground mb-4 text-lg font-semibold"
                    >
                        Kursy w szkole
                    </h2>

                    <p
                        v-if="student.courses.length === 0"
                        class="text-muted-foreground border-border border-t pt-4 text-sm"
                        role="status"
                    >
                        Kursant nie jest przypisany do żadnego kursu w tej
                        szkole.
                    </p>

                    <ul
                        v-else
                        class="border-border divide-border divide-y rounded-lg border"
                        role="list"
                    >
                        <li
                            v-for="course in student.courses"
                            :key="course.id"
                            class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div class="min-w-0">
                                <p
                                    class="text-foreground text-sm font-medium wrap-break-word"
                                >
                                    {{ displayText(course.name) }}
                                </p>
                                <p class="text-muted-foreground text-xs">
                                    Kategoria:
                                    {{
                                        course.category.trim().length > 0
                                            ? course.category
                                            : '—'
                                    }}
                                </p>
                            </div>
                            <UiBadge
                                :variant="
                                    getStudentCourseStatusVariant(course.status)
                                "
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

        <NuxtLink
            :to="backToListHref"
            class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Wróć do listy kursantów"
        >
            Wróć do listy kursantów
        </NuxtLink>
    </div>
</template>
