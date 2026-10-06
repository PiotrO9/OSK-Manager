<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import {
    buildDesignSystemBookingSlots,
    designSystemBookingCourses,
} from '~/data/design-system/fixtures';
import {
    getMonday,
    weekCalendarDatesFromMonday,
    WEEK_PICKER_CALENDAR_MIN,
    WEEK_PICKER_CALENDAR_MAX,
} from '~/utils/date/weeklyCalendarDates';

const scenario = shallowRef('data');
const selectedCourseId = shallowRef('course-1');
const weekStart = shallowRef(getMonday(new Date(2026, 8, 7)));
const calendarOpen = shallowRef(false);
const isConfirmOpen = shallowRef(false);
const course = computed(
    () =>
        designSystemBookingCourses.find(
            (item) => item.id === selectedCourseId.value,
        ) ?? null,
);
const demoSlots = computed(() =>
    buildDesignSystemBookingSlots(weekStart.value),
);
const slots = computed(() =>
    scenario.value === 'empty' ? [] : demoSlots.value,
);
const selectedDays = computed(() =>
    weekCalendarDatesFromMonday(weekStart.value),
);
const weekLabel = computed(() =>
    new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(weekStart.value),
);
const options = [
    { value: 'data', label: 'Terminy' },
    { value: 'empty', label: 'Brak terminów' },
    { value: 'loading', label: 'Ładowanie' },
    { value: 'error', label: 'Błąd' },
    { value: 'confirmation', label: 'Potwierdzenie' },
    { value: 'success', label: 'Wynik rezerwacji' },
];

watch(scenario, (value) => {
    isConfirmOpen.value = value === 'confirmation';
});
function moveWeek(days: number) {
    weekStart.value = new Date(
        weekStart.value.getFullYear(),
        weekStart.value.getMonth(),
        weekStart.value.getDate() + days,
    );
}

function selectWeek(value: DateValue | DateValue[] | undefined) {
    const date = Array.isArray(value) ? value[0] : value;

    if (date) weekStart.value = getMonday(toDate(date));

    calendarOpen.value = false;
}
</script>

<template>
    <div class="min-w-0 space-y-5">
        <DesignSystemScenarioControls
            v-model="scenario"
            label="Scenariusz rezerwacji kursanta"
            :options="options"
        />
        <PageHeader
            title="Rezerwacja jazdy"
            description="Wybierz kurs, sprawdź wolne terminy i zarezerwuj jazdę praktyczną."
        />
        <StudentLessonBookingCourseSelect
            v-model="selectedCourseId"
            :courses="designSystemBookingCourses"
            :is-loading="false"
        />
        <StudentLessonBookingFeedbackBanner
            v-if="scenario === 'success'"
            tone="success"
            message="Zarezerwowano jazdę na wybrany termin."
        >
            <template #action
                ><UiButton variant="outline" size="sm"
                    >Moje lekcje</UiButton
                ></template
            >
        </StudentLessonBookingFeedbackBanner>
        <StudentLessonBookingSelectedCourseSummary
            :selected-course="course"
            selected-course-type-label="Praktyka"
            :remaining-course-hours="12"
        />
        <StudentLessonBookingSchedulePanel
            :slots="slots"
            :week-start="weekStart"
            :is-loading="scenario === 'loading'"
            :error-message="
                scenario === 'error' ? 'Nie udało się pobrać terminów.' : null
            "
            :selected-course-id="selectedCourseId"
            :booking-slot-key="null"
            :is-week-beyond-booking-window="false"
            :week-range-compact-label="weekLabel"
            :calendar-selected="selectedDays"
            :calendar-open="calendarOpen"
            :is-prev-week-disabled="false"
            :is-next-week-disabled="false"
            :calendar-min="WEEK_PICKER_CALENDAR_MIN"
            :calendar-max="WEEK_PICKER_CALENDAR_MAX"
            :truncated-label="null"
            :available-slots-label="`${slots.length} wolne terminy`"
            :remaining-course-hours="12"
            @prev-week="moveWeek(-7)"
            @next-week="moveWeek(7)"
            @calendar-update="selectWeek"
            @update:calendar-open="calendarOpen = $event"
            @retry="scenario = 'data'"
        />
        <StudentLessonBookingConfirmDialog
            :open="isConfirmOpen"
            :booking-slot="demoSlots[0] ?? null"
            :course="course"
            :is-submitting="false"
            @update:open="isConfirmOpen = $event"
            @cancel="isConfirmOpen = false"
        />
    </div>
</template>
