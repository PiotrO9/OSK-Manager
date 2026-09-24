<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import { computed, shallowRef, watch } from 'vue';
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
import type { CourseListItem } from '~/types/courses/course';
import type { Vehicle } from '~/types/vehicles/vehicle';
import type { ManagerInstructorEventType } from '~/composables/instructors/manager/useManagerInstructorSchedulePage';
import {
    buildDatetimeLocal,
    dateValueToIsoDateString,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
} from '~/utils/date/weeklyCalendarDates';

defineProps<{
    schoolId: string;
    courses: CourseListItem[];
    coursesError: string | null;
    isCoursesLoading: boolean;
    vehicles: Vehicle[];
    vehiclesError: string | null;
    isVehiclesLoading: boolean;
    isEventSaving: boolean;
    eventFormError: string | null;
}>();

const emit = defineEmits<{
    submit: [];
}>();
const eventType = defineModel<ManagerInstructorEventType>('eventType', {
    required: true,
});
const eventStartLocal = defineModel<string>('eventStartLocal', {
    required: true,
});
const eventEndLocal = defineModel<string>('eventEndLocal', { required: true });
const eventVehicleId = defineModel<string>('eventVehicleId', {
    required: true,
});
const eventCourseId = defineModel<string>('eventCourseId', { required: true });

const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '10:00';
const MIN_DURATION_MINUTES = 60;
const LATEST_START_TIME = '23:00';

const startTime = shallowRef(DEFAULT_START_TIME);
const endTime = shallowRef(DEFAULT_END_TIME);

const eventDate = computed({
    get: () => {
        const start = parseDatetimeLocalParts(eventStartLocal.value);

        if (start) {
            return dateValueToIsoDateString(start.date);
        }

        const end = parseDatetimeLocalParts(eventEndLocal.value);

        return end ? dateValueToIsoDateString(end.date) : '';
    },
    set: (value: string) => {
        setEventDate(value);
    },
});

function setEventDate(value: string): void {
    const date = isoDateStringToCalendarDate(value);

    if (!date) {
        eventStartLocal.value = '';
        eventEndLocal.value = '';

        return;
    }

    const nextDate = dateValueToIsoDateString(date);

    updateEventDatetime('start', nextDate, startTime.value);
    updateEventDatetime('end', nextDate, endTime.value);
}

function updateEventDatetime(
    target: 'start' | 'end',
    dateValue: string,
    timeValue: string,
): void {
    const date = isoDateStringToCalendarDate(dateValue);

    if (!date) {
        return;
    }

    const [hourRaw = '9', minuteRaw = '0'] = timeValue.split(':');
    const hour = Number.parseInt(hourRaw, 10);
    const minute = Number.parseInt(minuteRaw, 10);
    const nextValue = buildDatetimeLocal(
        date,
        Number.isFinite(hour) ? hour : 9,
        Number.isFinite(minute) ? minute : 0,
    );

    if (target === 'start') {
        eventStartLocal.value = nextValue;

        return;
    }

    eventEndLocal.value = nextValue;
}

function timeToMinutes(value: string): number | null {
    const [hourRaw = '', minuteRaw = ''] = value.split(':');
    const hour = Number.parseInt(hourRaw, 10);
    const minute = Number.parseInt(minuteRaw, 10);

    if (
        !Number.isFinite(hour) ||
        !Number.isFinite(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
    ) {
        return null;
    }

    return hour * 60 + minute;
}

function minutesToTime(value: number): string {
    const normalized = Math.max(0, Math.min(value, 23 * 60 + 59));
    const hour = Math.floor(normalized / 60);
    const minute = normalized % 60;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(
        2,
        '0',
    )}`;
}

function formatVehicleOptionLabel(vehicle: Vehicle): string {
    const model = vehicle.name
        .trim()
        .replace(/^pojazd\s+\d+\s*-\s*/i, '')
        .trim();
    const registrationNumber = vehicle.registrationNumber.trim();

    if (model && registrationNumber) {
        return `${model} (${registrationNumber})`;
    }

    return model || registrationNumber || '-';
}

const endMinExclusive = computed(() => {
    const startMinutes = timeToMinutes(startTime.value);

    if (startMinutes === null) {
        return undefined;
    }

    return minutesToTime(startMinutes + MIN_DURATION_MINUTES - 1);
});

function handleStartTimeChanged(value: string): void {
    startTime.value = value;

    const startMinutes = timeToMinutes(value);
    const endMinutes = timeToMinutes(endTime.value);

    if (
        startMinutes !== null &&
        endMinutes !== null &&
        endMinutes - startMinutes < MIN_DURATION_MINUTES
    ) {
        endTime.value = minutesToTime(startMinutes + MIN_DURATION_MINUTES);
    }

    if (eventDate.value) {
        updateEventDatetime('start', eventDate.value, value);
        updateEventDatetime('end', eventDate.value, endTime.value);
    }
}

function handleEndTimeChanged(value: string): void {
    endTime.value = value;

    if (eventDate.value) {
        updateEventDatetime('end', eventDate.value, value);
    }
}

watch(
    eventStartLocal,
    (value) => {
        const parsed = parseDatetimeLocalParts(value);

        if (!parsed) {
            startTime.value = DEFAULT_START_TIME;

            return;
        }

        startTime.value = `${String(parsed.hour).padStart(2, '0')}:${String(
            parsed.minute,
        ).padStart(2, '0')}`;
    },
    { immediate: true },
);

watch(
    eventEndLocal,
    (value) => {
        const parsed = parseDatetimeLocalParts(value);

        if (!parsed) {
            endTime.value = DEFAULT_END_TIME;

            return;
        }

        endTime.value = `${String(parsed.hour).padStart(2, '0')}:${String(
            parsed.minute,
        ).padStart(2, '0')}`;
    },
    { immediate: true },
);
</script>

<template>
    <FormSection
        title="Dodaj blok czasu"
        description="Blok bez kursanta rezerwuje czas instruktora dla teorii albo jazdy."
    >
        <div id="event-block-heading" class="space-y-4">
            <div class="space-y-2">
                <UiLabel for="event-type">Typ</UiLabel>
                <UiSelect v-model="eventType">
                    <UiSelectTrigger
                        id="event-type"
                        class="w-full"
                        aria-label="Typ bloku: teoria lub jazda"
                    >
                        <UiSelectValue placeholder="Typ bloku" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem value="THEORY">Teoria</UiSelectItem>
                            <UiSelectItem value="DRIVE">Jazda</UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>

            <div v-if="eventType === 'THEORY' && schoolId" class="space-y-2">
                <UiLabel for="event-course">Kurs opcjonalnie</UiLabel>
                <p
                    v-if="isCoursesLoading"
                    class="text-muted-foreground text-xs"
                    role="status"
                >
                    Wczytywanie kursów...
                </p>
                <p
                    v-else-if="coursesError"
                    class="text-destructive text-xs"
                    role="alert"
                >
                    {{ coursesError }}
                </p>
                <UiSelect
                    v-model="eventCourseId"
                    :disabled="isCoursesLoading || isEventSaving"
                >
                    <UiSelectTrigger
                        id="event-course"
                        class="w-full"
                        aria-label="Powiązanie bloku teorii z kursem"
                    >
                        <UiSelectValue placeholder="Bez powiazania z kursem" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="c in courses"
                                :key="c.id"
                                :value="c.id"
                            >
                                {{ c.name }} ({{ c.category }})
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
                <p class="text-muted-foreground text-xs">
                    Powiązanie z kursem nie dodaje kursantów na ten blok.
                </p>
            </div>

            <div v-if="eventType === 'DRIVE'" class="space-y-2">
                <UiLabel for="event-vehicle">Pojazd</UiLabel>
                <p
                    v-if="isVehiclesLoading"
                    class="text-muted-foreground text-xs"
                    role="status"
                >
                    Wczytywanie pojazdów...
                </p>
                <p
                    v-else-if="vehiclesError"
                    class="text-destructive text-xs"
                    role="alert"
                >
                    {{ vehiclesError }}
                </p>
                <UiSelect
                    v-model="eventVehicleId"
                    :disabled="
                        !schoolId || vehicles.length === 0 || isVehiclesLoading
                    "
                >
                    <UiSelectTrigger
                        id="event-vehicle"
                        class="w-full"
                        aria-label="Pojazd dla bloku jazdy"
                    >
                        <UiSelectValue placeholder="Wybierz pojazd" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="v in vehicles"
                                :key="v.id"
                                :value="v.id"
                            >
                                {{ formatVehicleOptionLabel(v) }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>

            <div class="space-y-2">
                <UiLabel for="event-date">Data</UiLabel>
                <UiDatePicker
                    id="event-date"
                    v-model="eventDate"
                    placeholder="Wybierz dzień bloku"
                    :aria-required="true"
                />
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
                <div class="space-y-2">
                    <UiLabel for="event-start-time">Początek</UiLabel>
                    <UiTimePicker
                        id="event-start-time"
                        :model-value="startTime"
                        label="Godzina początku bloku"
                        context-label="Początek"
                        trigger-class="h-10 max-w-none"
                        :max-exclusive="LATEST_START_TIME"
                        @update:model-value="handleStartTimeChanged"
                    />
                </div>

                <div class="space-y-2">
                    <UiLabel for="event-end-time">Koniec</UiLabel>
                    <UiTimePicker
                        id="event-end-time"
                        :model-value="endTime"
                        label="Godzina końca bloku"
                        context-label="Koniec"
                        trigger-class="h-10 max-w-none"
                        :min-exclusive="endMinExclusive"
                        @update:model-value="handleEndTimeChanged"
                    />
                </div>
            </div>

            <p
                v-if="eventFormError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ eventFormError }}
            </p>
        </div>

        <template #footer>
            <ActionGroup label="Akcje bloku czasu" align="end">
                <UiButton
                    type="button"
                    :disabled="isEventSaving"
                    :aria-busy="isEventSaving"
                    class="gap-2"
                    @click="emit('submit')"
                >
                    <Plus class="size-4" aria-hidden="true" />
                    {{ isEventSaving ? 'Zapisywanie...' : 'Dodaj blok' }}
                </UiButton>
            </ActionGroup>
        </template>
    </FormSection>
</template>
