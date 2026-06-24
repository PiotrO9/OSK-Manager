<script setup lang="ts">
import {
    CalendarCheck,
    CalendarDays,
    Clock3,
    GraduationCap,
} from 'lucide-vue-next';
import {
    buildSlotIsoUTC,
    getMonday,
    weekRangeFromMonday,
} from '~/utils/weeklyCalendarDates';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    formatCourseKindLabel,
    type CurrentUserCourseItem,
} from '~/types/course';
import type { SchoolAvailabilitySlot } from '~/types/schoolAvailabilitySlots';

definePageMeta({
    layout: 'app-shell',
    middleware: ['student'],
});

usePageMeta({
    title: () => 'Rezerwuj jazdę',
    description: () => 'Samodzielna rezerwacja jazdy praktycznej.',
});

const { fetchMyCourses } = useCoursesApi();
const { fetchSlots, isLoading: isSlotsLoading } =
    useSchoolAvailabilitySlotsApi();
const { bookOwnLesson } = useStudentLessonBookingApi();
const { addToast } = useAppToast();

const courses = shallowRef<CurrentUserCourseItem[]>([]);
const selectedCourseId = shallowRef('');
const weekStart = shallowRef<Date>(getMonday(new Date()));
const slots = shallowRef<SchoolAvailabilitySlot[]>([]);
const isCoursesLoading = shallowRef(false);
const coursesErrorMessage = shallowRef<string | null>(null);
const slotsErrorMessage = shallowRef<string | null>(null);
const bookingSlotKey = shallowRef<string | null>(null);
const successMessage = shallowRef<string | null>(null);

let slotsLoadSeq = 0;

const bookableCourses = computed(() =>
    courses.value.filter(
        (course) =>
            course.status === 'ACTIVE' &&
            (course.type === 'PRACTICAL' || course.type === 'EXTRA'),
    ),
);

const selectedCourse = computed(
    () =>
        bookableCourses.value.find(
            (course) => course.id === selectedCourseId.value,
        ) ?? null,
);

const weekRange = computed(() => weekRangeFromMonday(weekStart.value));

const weekLabel = computed(() => {
    const start = weekStart.value;
    const end = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 6,
    );
    const formatter = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return `${formatter.format(start)} - ${formatter.format(end)}`;
});

const weekShortLabel = computed(() => {
    const start = weekStart.value;
    const end = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 6,
    );
    const formatter = new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
    });

    return `${formatter.format(start)} - ${formatter.format(end)}`;
});

const selectedCourseProgressLabel = computed(() => {
    const course = selectedCourse.value;

    if (!course) {
        return 'Wybierz kurs, żeby zobaczyć postęp.';
    }

    return `${course.progress} z ${course.totalHours} godzin wykorzystane`;
});

const selectedCourseTypeLabel = computed(() => {
    const course = selectedCourse.value;

    return course ? formatCourseKindLabel(course.type) : 'Brak wybranego kursu';
});

const availableSlotsLabel = computed(() => {
    if (!selectedCourse.value) {
        return 'Najpierw wybierz kurs';
    }

    if (isSlotsLoading.value) {
        return 'Wczytywanie terminów';
    }

    return `${slots.value.length} dostępnych terminów`;
});

function slotKey(slot: SchoolAvailabilitySlot): string {
    return `${slot.date}|${slot.startTime}|${slot.endTime}|${slot.instructorId}`;
}

async function loadCourses(): Promise<void> {
    isCoursesLoading.value = true;
    coursesErrorMessage.value = null;

    try {
        courses.value = await fetchMyCourses();
        const currentStillAvailable = bookableCourses.value.some(
            (course) => course.id === selectedCourseId.value,
        );

        if (!currentStillAvailable) {
            selectedCourseId.value = bookableCourses.value[0]?.id ?? '';
        }
    } catch (err: unknown) {
        courses.value = [];
        selectedCourseId.value = '';
        coursesErrorMessage.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać listy kursów.',
        );
    } finally {
        isCoursesLoading.value = false;
    }
}

async function loadSlots(): Promise<void> {
    const course = selectedCourse.value;
    const seq = ++slotsLoadSeq;

    slotsErrorMessage.value = null;
    successMessage.value = null;

    if (!course) {
        slots.value = [];

        return;
    }

    try {
        const data = await fetchSlots(
            course.schoolId,
            weekRange.value.dateFrom,
            weekRange.value.dateTo,
            {
                courseId: course.id,
                lessonType: 'PRACTICE',
                sort: 'startTime',
                limit: 200,
            },
        );

        if (seq !== slotsLoadSeq) {
            return;
        }

        slots.value = data.slots;
    } catch (err: unknown) {
        if (seq !== slotsLoadSeq) {
            return;
        }

        slots.value = [];
        slotsErrorMessage.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać wolnych terminów.',
        );
    }
}

function handlePrevWeek(): void {
    const d = new Date(weekStart.value);

    d.setDate(d.getDate() - 7);
    weekStart.value = getMonday(d);
}

function handleNextWeek(): void {
    const d = new Date(weekStart.value);

    d.setDate(d.getDate() + 7);
    weekStart.value = getMonday(d);
}

async function handleBookSlot(slot: SchoolAvailabilitySlot): Promise<void> {
    const course = selectedCourse.value;

    if (!course || bookingSlotKey.value !== null) {
        return;
    }

    const key = slotKey(slot);

    bookingSlotKey.value = key;
    successMessage.value = null;
    slotsErrorMessage.value = null;

    try {
        await bookOwnLesson({
            courseId: course.id,
            instructorId: slot.instructorId,
            startTime: buildSlotIsoUTC(slot.date, slot.startTime),
            endTime: buildSlotIsoUTC(slot.date, slot.endTime),
        });

        successMessage.value = 'Jazda zostala zarezerwowana.';
        addToast({
            title: 'Jazda zostala zarezerwowana',
            variant: 'success',
        });
        await loadSlots();
    } catch (err: unknown) {
        const message = getApiFetchErrorMessage(
            err,
            'Nie udało się zarezerwować jazdy.',
        );

        slotsErrorMessage.value = message;
        addToast({
            title: 'Nie udało się zarezerwować jazdy',
            description: message,
            variant: 'error',
        });
    } finally {
        bookingSlotKey.value = null;
    }
}

watch(
    () => [selectedCourseId.value, weekRange.value.dateFrom] as const,
    () => {
        void loadSlots();
    },
);

onMounted(() => {
    void loadCourses();
});
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Rezerwacja jazdy"
            description="Wybierz kurs, sprawdź dostępność i zarezerwuj pasujący slot."
        >
            <template #actions>
                <UiBadge
                    variant="outline"
                    class="bg-background h-10 rounded-xl px-4 text-sm font-semibold shadow-sm"
                >
                    <CalendarDays class="mr-2 size-4" aria-hidden="true" />
                    {{ weekShortLabel }}
                </UiBadge>
            </template>
        </PageHeader>

        <div
            class="grid gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.72fr)]"
        >
            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader class="border-border border-b p-5 pt-0">
                    <UiCardTitle class="text-xl font-extrabold">
                        Dostępne terminy
                    </UiCardTitle>
                    <UiCardDescription>
                        Sloty zgodne z kursem i filtrami kursanta.
                    </UiCardDescription>
                </UiCardHeader>

                <UiCardContent class="space-y-4 px-4 py-0">
                    <ErrorState
                        v-if="coursesErrorMessage"
                        title="Nie udało się wczytać kursów"
                        :description="coursesErrorMessage"
                        @retry="loadCourses"
                    />

                    <StudentLessonBookingCourseSelect
                        v-model="selectedCourseId"
                        :courses="bookableCourses"
                        :is-loading="isCoursesLoading"
                        :disabled="bookingSlotKey !== null"
                    />

                    <StudentLessonBookingWeekNav
                        :label="weekLabel"
                        :disabled="bookingSlotKey !== null"
                        @prev="handlePrevWeek"
                        @next="handleNextWeek"
                    />

                    <StudentLessonBookingSlotList
                        :slots="slots"
                        :is-loading="isSlotsLoading"
                        :error-message="slotsErrorMessage"
                        :selected-course-id="selectedCourseId"
                        :booking-slot-key="bookingSlotKey"
                        :week-start-date="weekRange.dateFrom"
                        @book="handleBookSlot"
                    />
                </UiCardContent>
            </UiCard>

            <UiCard class="self-start overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader class="border-border border-b p-5 pt-0">
                    <UiCardTitle class="text-xl font-extrabold">
                        Wybrany kurs
                    </UiCardTitle>
                    <UiCardDescription>
                        Kontekst rezerwacji przed wyborem slotu.
                    </UiCardDescription>
                </UiCardHeader>

                <UiCardContent class="space-y-3 px-4 py-0">
                    <div class="border-border rounded-xl border p-4">
                        <div class="flex items-start gap-3">
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"
                            >
                                <GraduationCap
                                    class="size-5"
                                    aria-hidden="true"
                                />
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-extrabold">
                                    {{
                                        selectedCourse?.name ??
                                        'Nie wybrano kursu'
                                    }}
                                </p>
                                <p class="text-muted-foreground text-sm">
                                    {{ selectedCourseTypeLabel }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="border-border rounded-xl border p-4">
                        <div class="flex items-start gap-3">
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                            >
                                <Clock3 class="size-5" aria-hidden="true" />
                            </div>
                            <div>
                                <p class="font-extrabold">Saldo godzin</p>
                                <p class="text-muted-foreground text-sm">
                                    {{ selectedCourseProgressLabel }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="border-border rounded-xl border p-4">
                        <div class="flex items-start gap-3">
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600"
                            >
                                <CalendarDays
                                    class="size-5"
                                    aria-hidden="true"
                                />
                            </div>
                            <div>
                                <p class="font-extrabold">Tydzień</p>
                                <p class="text-muted-foreground text-sm">
                                    {{ weekLabel }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-sky-950"
                    >
                        <p class="font-extrabold">
                            {{ availableSlotsLabel }}
                        </p>
                        <p class="text-sm text-sky-700">
                            Rezerwacja działa bezpośrednio na wybranym slocie.
                        </p>
                    </div>

                    <div
                        v-if="successMessage"
                        class="border-border bg-muted/40 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                        role="status"
                    >
                        <div class="flex min-w-0 items-center gap-3">
                            <span
                                class="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                                aria-hidden="true"
                            >
                                <CalendarCheck class="size-4" />
                            </span>
                            <p class="text-foreground text-sm font-medium">
                                {{ successMessage }}
                            </p>
                        </div>
                        <UiButton as-child size="sm" variant="outline">
                            <NuxtLink to="/my-lessons">Moje lekcje</NuxtLink>
                        </UiButton>
                    </div>
                </UiCardContent>
            </UiCard>
        </div>
    </div>
</template>
