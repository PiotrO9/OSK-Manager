<script setup lang="ts">
import { LoaderCircle, Plus } from 'lucide-vue-next';
import { computed, shallowRef, watch } from 'vue';
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
import type { CourseListItem } from '~/types/courses/course';
import type { Vehicle } from '~/types/vehicles/vehicle';
import type { ManagerInstructorEventType } from '~/composables/instructors/manager/useManagerInstructorSchedulePage';
import type { ScheduleAvailabilityStatus } from '~/types/schedule/scheduleAvailability';
import {
    buildDatetimeLocal,
    dateValueToIsoDateString,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
} from '~/utils/date/weeklyCalendarDates';

const props = defineProps<{
    schoolId: string;
    courses: CourseListItem[];
    coursesError: string | null;
    isCoursesLoading: boolean;
    vehicles: Vehicle[];
    vehiclesError: string | null;
    isVehiclesLoading: boolean;
    isEventSaving: boolean;
    eventFormError: string | null;
    eventAvailabilityStatus: ScheduleAvailabilityStatus;
    eventAvailabilityMessage: string;
    isEventSubmitReady: boolean;
    minDurationMinutes: number;
    availableVehicleIds?: readonly string[];
    availableStartTimes?: readonly string[];
    availableEndTimes?: readonly string[];
    isAvailabilityOptionsLoading: boolean;
    availabilityOptionsError: string;
}>();

const emit = defineEmits<{
    submit: [];
}>();
const eventType = defineModel<ManagerInstructorEventType>('eventType', {
    required: true,
});
const eventDateLocal = defineModel<string>('eventDateLocal', {
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

const LATEST_START_TIME = '23:00';

const startTime = shallowRef('');
const endTime = shallowRef('');

const eventDate = computed({
    get: () => eventDateLocal.value,
    set: (value: string) => {
        setEventDate(value);
    },
});

const areTimePrerequisitesComplete = computed(
    () =>
        Boolean(eventDate.value) &&
        (eventType.value !== 'DRIVE' || Boolean(eventVehicleId.value.trim())),
);

function setEventDate(value: string): void {
    const date = isoDateStringToCalendarDate(value);

    if (!date) {
        eventDateLocal.value = '';
        eventStartLocal.value = '';
        eventEndLocal.value = '';

        return;
    }

    const nextDate = dateValueToIsoDateString(date);

    eventDateLocal.value = nextDate;
    eventStartLocal.value = '';
    eventEndLocal.value = '';
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
        return `${model} (${registrationNumber})${vehicleAvailabilitySuffix(
            vehicle,
        )}`;
    }

    const label = model || registrationNumber || '-';

    return `${label}${vehicleAvailabilitySuffix(vehicle)}`;
}

function isVehicleUnavailableForDate(vehicle: Vehicle): boolean {
    if (vehicle.status === 'UNAVAILABLE') return true;

    return (
        Boolean(eventDate.value) &&
        props.availableVehicleIds !== undefined &&
        !props.availableVehicleIds.includes(vehicle.id)
    );
}

function vehicleAvailabilitySuffix(vehicle: Vehicle): string {
    if (vehicle.status === 'UNAVAILABLE') return ' - niedostępny';

    return isVehicleUnavailableForDate(vehicle)
        ? ' - brak wolnych terminów'
        : '';
}

const endMinExclusive = computed(() => {
    const startMinutes = timeToMinutes(startTime.value);

    if (startMinutes === null) {
        return undefined;
    }

    return minutesToTime(startMinutes + props.minDurationMinutes - 1);
});

function handleStartTimeChanged(value: string): void {
    startTime.value = value;

    const startMinutes = timeToMinutes(value);
    const endMinutes = timeToMinutes(endTime.value);

    if (
        startMinutes !== null &&
        endMinutes !== null &&
        endMinutes - startMinutes < props.minDurationMinutes
    ) {
        endTime.value = minutesToTime(startMinutes + props.minDurationMinutes);
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
            startTime.value = '';

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
            endTime.value = '';

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
                                :disabled="isVehicleUnavailableForDate(v)"
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
                        placeholder="Wybierz godzinę"
                        trigger-class="h-10 max-w-none"
                        :max-exclusive="LATEST_START_TIME"
                        :allowed-times="availableStartTimes"
                        :disabled="
                            !areTimePrerequisitesComplete ||
                            isAvailabilityOptionsLoading
                        "
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
                        placeholder="Wybierz godzinę"
                        trigger-class="h-10 max-w-none"
                        :min-exclusive="endMinExclusive"
                        :allowed-times="availableEndTimes"
                        :disabled="
                            !areTimePrerequisitesComplete ||
                            isAvailabilityOptionsLoading
                        "
                        @update:model-value="handleEndTimeChanged"
                    />
                </div>
            </div>

            <p
                v-if="isAvailabilityOptionsLoading"
                class="text-muted-foreground text-xs"
                role="status"
            >
                Pobieranie dostępnych godzin...
            </p>

            <p
                v-else-if="availabilityOptionsError"
                class="text-muted-foreground text-xs"
                role="status"
            >
                {{ availabilityOptionsError }}
            </p>

            <p
                v-else-if="
                    areTimePrerequisitesComplete &&
                    availableStartTimes?.length === 0
                "
                class="text-destructive text-sm"
                role="alert"
            >
                Brak dostępnych godzin w wybranym dniu.
            </p>

            <div
                v-if="eventAvailabilityStatus === 'checking'"
                class="text-muted-foreground flex items-center"
                role="status"
            >
                <LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
                <span class="sr-only">Sprawdzanie dostępności terminu</span>
            </div>

            <p
                v-if="
                    eventAvailabilityStatus === 'unavailable' ||
                    eventAvailabilityStatus === 'error'
                "
                :class="[
                    'text-sm',
                    eventAvailabilityStatus === 'unavailable'
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                ]"
                :role="
                    eventAvailabilityStatus === 'unavailable'
                        ? 'alert'
                        : 'status'
                "
            >
                {{ eventAvailabilityMessage }}
            </p>

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
                    :disabled="
                        isEventSaving ||
                        !isEventSubmitReady ||
                        eventAvailabilityStatus === 'checking' ||
                        eventAvailabilityStatus === 'unavailable'
                    "
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
