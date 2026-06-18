<script setup lang="ts">
import { CalendarCheck } from 'lucide-vue-next';
import {
    buildSlotIsoUTC,
    getMonday,
    weekRangeFromMonday,
} from '~/utils/weeklyCalendarDates';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type { CurrentUserCourseItem } from '~/types/course';
import type { SchoolAvailabilitySlot } from '~/types/schoolAvailabilitySlots';

definePageMeta({
    layout: 'app-shell',
    middleware: ['student'],
});

usePageMeta({
    title: () => 'Rezerwuj jazde',
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
            'Nie udalo sie pobrac listy kursow.',
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
            'Nie udalo sie pobrac wolnych terminow.',
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
            'Nie udalo sie zarezerwowac jazdy.',
        );

        slotsErrorMessage.value = message;
        addToast({
            title: 'Nie udalo sie zarezerwowac jazdy',
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
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Rezerwuj jazde
            </h1>
            <p class="text-muted-foreground text-sm">
                Wybierz kurs i wolny termin jazdy praktycznej.
            </p>
        </div>

        <p
            v-if="coursesErrorMessage"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ coursesErrorMessage }}
        </p>

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

        <div
            v-if="successMessage"
            class="border-border bg-muted/40 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
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

        <StudentLessonBookingSlotList
            :slots="slots"
            :is-loading="isSlotsLoading"
            :error-message="slotsErrorMessage"
            :selected-course-id="selectedCourseId"
            :booking-slot-key="bookingSlotKey"
            @book="handleBookSlot"
        />
    </div>
</template>
