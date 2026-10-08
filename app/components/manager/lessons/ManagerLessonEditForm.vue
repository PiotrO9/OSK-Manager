<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import { computed } from 'vue';
import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import {
    dateValueToIsoDateString,
    buildDatetimeLocal,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
    isoInstantToDatetimeLocalString,
} from '~/utils/date/weeklyCalendarDates';
import { isManagerLessonDateDisabled } from '~/utils/lessons/managerLessonDatePolicy';
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type {
    AssignedCourseInstructor,
    ManagerLessonDetail,
} from '~/types/lessons/managerLesson';
import type { StatusTone } from '~/components/app/ui/types';
import type { Vehicle } from '~/types/vehicles/vehicle';
import type { ScheduleAvailabilityStatus } from '~/types/schedule/scheduleAvailability';

const props = defineProps<{
    formId: string;
    loadedLesson: ManagerLessonDetail;
    studentDisplayName: string | null;
    lessonStatusLabel: string;
    lessonStatusTone: StatusTone;
    instructorsForSelect: InstructorListItem[];
    instructorSelectLabel: string;
    assignedCourseInstructor: AssignedCourseInstructor | null;
    isInstructorsLoading: boolean;
    instructorsError: string | null;
    instructorOptionsError: string | null;
    hasAvailableInstructors: boolean;
    canChangeInstructor: boolean;
    vehiclesForSelect: Vehicle[];
    isVehiclesLoading: boolean;
    vehiclesError: string | null;
    formError: string | null;
    availabilityStatus: ScheduleAvailabilityStatus;
    availabilityMessage: string;
    minDurationMinutes: number | null;
    availableStartTimes?: readonly string[];
    availableEndTimes?: readonly string[];
    availableVehicleIds?: readonly string[];
    isAvailabilityOptionsLoading: boolean;
    availabilityOptionsError: string;
    noHoursMessage: string;
    nextAvailableDay: { date: string; startTime: string } | null;
    nextAvailableStatus: 'idle' | 'loading' | 'found' | 'none' | 'error';
    bookingMaxDaysAhead?: number;
    schoolWorkingDaysMask?: number;
    workingWeekdays?: readonly number[];
    dayOffDates?: readonly string[];
    workingExceptionDates?: readonly string[];
}>();

defineEmits<{
    submit: [];
    findNextAvailable: [];
}>();

const formStartLocal = defineModel<string>('startLocal', { required: true });
const formEndLocal = defineModel<string>('endLocal', { required: true });
const formVehicleId = defineModel<string>('vehicleId', { required: true });
const formInstructorId = defineModel<string>('instructorId', {
    required: true,
});
const isOriginalSchedule = computed(
    () =>
        formStartLocal.value ===
            isoInstantToDatetimeLocalString(props.loadedLesson.startTime) &&
        formEndLocal.value ===
            isoInstantToDatetimeLocalString(props.loadedLesson.endTime),
);

function datePartFromDatetimeLocal(value: string): string {
    const dateOnly = /^(\d{4}-\d{2}-\d{2})T$/.exec(value);

    if (dateOnly && isoDateStringToCalendarDate(dateOnly[1] ?? '')) {
        return dateOnly[1] ?? '';
    }

    const parsed = parseDatetimeLocalParts(value);

    if (!parsed) {
        return '';
    }

    return [
        String(parsed.date.year),
        String(parsed.date.month).padStart(2, '0'),
        String(parsed.date.day).padStart(2, '0'),
    ].join('-');
}

function timePartFromDatetimeLocal(value: string): string {
    const parsed = parseDatetimeLocalParts(value);

    if (!parsed) {
        return '';
    }

    return `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`;
}

function parseTimePart(value: string): { hour: number; minute: number } | null {
    const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

    if (!match) {
        return null;
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return null;
    }

    return { hour, minute };
}

function timeToMinutes(value: string): number | null {
    const time = parseTimePart(value);

    return time ? time.hour * 60 + time.minute : null;
}

function minutesToTime(value: number): string {
    const normalized = Math.max(0, Math.min(value, 23 * 60 + 59));
    const hour = Math.floor(normalized / 60);
    const minute = normalized % 60;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function mergeDatetimeLocal(
    currentValue: string,
    updates: { date?: string; time?: string },
): string {
    const current = parseDatetimeLocalParts(currentValue);
    const date =
        updates.date !== undefined
            ? isoDateStringToCalendarDate(updates.date)
            : (current?.date ??
              isoDateStringToCalendarDate(
                  datePartFromDatetimeLocal(currentValue),
              ));
    const time =
        updates.time !== undefined
            ? parseTimePart(updates.time)
            : current
              ? { hour: current.hour, minute: current.minute }
              : null;

    if (!date) {
        return currentValue;
    }

    if (!time) return `${dateValueToIsoDateString(date)}T`;

    return buildDatetimeLocal(date, time.hour, time.minute);
}

const lessonDateModel = computed({
    get: () =>
        datePartFromDatetimeLocal(formStartLocal.value) ||
        datePartFromDatetimeLocal(formEndLocal.value),
    set: (date: string) => {
        if (date === lessonDateModel.value) return;

        formStartLocal.value = `${date}T`;
        formEndLocal.value = `${date}T`;
    },
});

const todayDate = today(getLocalTimeZone());
const minLessonDate = dateValueToIsoDateString(todayDate);
const maxLessonDate = computed(() =>
    dateValueToIsoDateString(
        todayDate.add({ days: props.bookingMaxDaysAhead ?? 30 }),
    ),
);

function isLessonDateDisabled(date: DateValue): boolean {
    return isManagerLessonDateDisabled(date, props);
}

const nextAvailableLabel = computed(() => {
    if (!props.nextAvailableDay) return '';

    const formattedDate = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
    }).format(
        parseDate(props.nextAvailableDay.date).toDate(getLocalTimeZone()),
    );

    return `${formattedDate}, od ${props.nextAvailableDay.startTime}`;
});

const startTimeModel = computed({
    get: () => timePartFromDatetimeLocal(formStartLocal.value),
    set: (time: string) => {
        formStartLocal.value = mergeDatetimeLocal(formStartLocal.value, {
            time,
        });

        const startMinutes = timeToMinutes(time);
        const endMinutes = timeToMinutes(
            timePartFromDatetimeLocal(formEndLocal.value),
        );

        if (
            props.minDurationMinutes !== null &&
            startMinutes !== null &&
            endMinutes !== null &&
            endMinutes - startMinutes < props.minDurationMinutes
        ) {
            formEndLocal.value = mergeDatetimeLocal(formEndLocal.value, {
                time: minutesToTime(startMinutes + props.minDurationMinutes),
            });
        }
    },
});

const endTimeModel = computed({
    get: () => timePartFromDatetimeLocal(formEndLocal.value),
    set: (time: string) => {
        formEndLocal.value = mergeDatetimeLocal(formEndLocal.value, {
            time,
        });
    },
});

const startTimeMaxExclusive = computed(() =>
    lessonDateModel.value && endTimeModel.value.length > 0
        ? endTimeModel.value
        : undefined,
);

const endTimeMinExclusive = computed(() => {
    if (!lessonDateModel.value || !startTimeModel.value) {
        return undefined;
    }

    const startMinutes = timeToMinutes(startTimeModel.value);

    if (startMinutes === null || props.minDurationMinutes === null) {
        return startTimeModel.value;
    }

    return minutesToTime(startMinutes + props.minDurationMinutes - 1);
});

function formatVehicleOptionLabel(vehicle: Vehicle): string {
    const model = vehicle.name
        .trim()
        .replace(/^pojazd\s+\d+\s*-\s*/i, '')
        .trim();
    const base = `${model || '-'} (${vehicle.registrationNumber.trim()})`;

    return isVehicleDisabled(vehicle)
        ? `${base} - niedostępny w tym dniu`
        : base;
}

function isVehicleDisabled(vehicle: Vehicle): boolean {
    return (
        vehicle.status === 'UNAVAILABLE' ||
        (!isOriginalSchedule.value &&
            props.availableVehicleIds !== undefined &&
            !props.availableVehicleIds.includes(vehicle.id))
    );
}
</script>

<template>
    <form
        :id="formId"
        class="grid gap-4 lg:grid-cols-2"
        @submit.prevent="$emit('submit')"
    >
        <p
            v-if="formError"
            class="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-3 py-2 text-sm lg:col-span-2"
            role="alert"
        >
            {{ formError }}
        </p>

        <div class="space-y-2">
            <UiLabel for="lesson-student">Kursant</UiLabel>
            <UiInput
                id="lesson-student"
                :model-value="
                    studentDisplayName ??
                    `${loadedLesson.studentId.slice(0, 8)}...`
                "
                disabled
            />
        </div>

        <div class="space-y-2">
            <UiLabel for="lesson-status">Status</UiLabel>
            <div class="flex min-h-9 items-center">
                <StatusBadge
                    :label="lessonStatusLabel"
                    :tone="lessonStatusTone"
                />
            </div>
        </div>

        <div class="space-y-2">
            <UiLabel for="lesson-instructor">Instruktor</UiLabel>
            <p
                v-if="isInstructorsLoading"
                class="text-muted-foreground text-xs"
                role="status"
            >
                Wczytywanie instruktorów...
            </p>
            <p
                v-else-if="instructorsError"
                class="text-destructive text-xs"
                role="alert"
            >
                {{ instructorsError }}
            </p>
            <p
                v-else-if="instructorOptionsError"
                class="text-destructive text-xs"
                role="alert"
            >
                {{ instructorOptionsError }}
            </p>
            <p
                v-else-if="hasAvailableInstructors && canChangeInstructor"
                class="text-muted-foreground text-xs"
            >
                Brak dostępnych zastępców w tym terminie.
            </p>
            <UiSelect
                v-model="formInstructorId"
                :disabled="
                    !canChangeInstructor ||
                    isInstructorsLoading ||
                    Boolean(instructorOptionsError) ||
                    instructorsForSelect.length <= 1
                "
            >
                <UiSelectTrigger
                    id="lesson-instructor"
                    class="bg-background h-10 w-full rounded-xl"
                    :aria-label="`Instruktor: ${instructorSelectLabel}`"
                >
                    <UiSelectValue placeholder="- Wybierz instruktora -" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="ins in instructorsForSelect"
                            :key="ins.id"
                            :value="ins.id"
                        >
                            {{ formatInstructorDisplayName(ins) }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
            <p class="text-muted-foreground text-xs">
                <template v-if="assignedCourseInstructor">
                    Prowadzący kurs: {{ assignedCourseInstructor.name }}.
                </template>
                Zmiana instruktora dotyczy tylko tej jazdy.
            </p>
            <p
                v-if="!canChangeInstructor"
                class="text-muted-foreground text-xs"
            >
                Jazda już się rozpoczęła. Nie można zmienić instruktora.
            </p>
        </div>

        <div class="space-y-2">
            <UiLabel for="lesson-vehicle">Pojazd</UiLabel>
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
                v-model="formVehicleId"
                :disabled="vehiclesForSelect.length === 0"
            >
                <UiSelectTrigger
                    id="lesson-vehicle"
                    class="bg-background h-10 w-full rounded-xl"
                    aria-label="Pojazd dla jazdy praktycznej"
                >
                    <UiSelectValue placeholder="- Wybierz pojazd -" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="v in vehiclesForSelect"
                            :key="v.id"
                            :value="v.id"
                            :disabled="isVehicleDisabled(v)"
                        >
                            {{ formatVehicleOptionLabel(v) }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>

        <fieldset class="relative space-y-3 lg:col-span-2">
            <legend class="text-foreground text-sm font-semibold">
                Termin
            </legend>
            <div
                v-if="isAvailabilityOptionsLoading"
                class="text-muted-foreground absolute top-0 right-0 flex items-center gap-1.5 text-xs"
                role="status"
            >
                <LoaderCircle
                    class="size-3.5 animate-spin"
                    aria-hidden="true"
                />
                <span>Sprawdzam godziny...</span>
            </div>
            <div class="space-y-2">
                <UiLabel for="lesson-date">Data</UiLabel>
                <UiDatePicker
                    id="lesson-date"
                    v-model="lessonDateModel"
                    placeholder="Wybierz dzień lekcji"
                    :min="minLessonDate"
                    :max="maxLessonDate"
                    :is-date-disabled="isLessonDateDisabled"
                    trigger-class="h-10 max-w-none rounded-xl bg-background"
                />
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                    <UiLabel for="lesson-start-time">Początek</UiLabel>
                    <UiTimePicker
                        id="lesson-start-time"
                        v-model="startTimeModel"
                        label="Godzina początku"
                        context-label="Początek"
                        :max-exclusive="startTimeMaxExclusive"
                        :allowed-times="availableStartTimes"
                        :disabled="isAvailabilityOptionsLoading"
                        trigger-class="h-10 max-w-none rounded-xl bg-background"
                    />
                </div>
                <div class="space-y-2">
                    <UiLabel for="lesson-end-time">Koniec</UiLabel>
                    <UiTimePicker
                        id="lesson-end-time"
                        v-model="endTimeModel"
                        label="Godzina końca"
                        context-label="Koniec"
                        :min-exclusive="endTimeMinExclusive"
                        :allowed-times="availableEndTimes"
                        :disabled="isAvailabilityOptionsLoading"
                        trigger-class="h-10 max-w-none rounded-xl bg-background"
                    />
                </div>
            </div>
            <p
                v-if="!isAvailabilityOptionsLoading && availabilityOptionsError"
                class="text-muted-foreground text-xs"
                role="status"
            >
                {{ availabilityOptionsError }}
            </p>
            <p
                v-else-if="
                    !isAvailabilityOptionsLoading &&
                    availableStartTimes?.length === 0
                "
                class="text-destructive text-sm"
                role="alert"
            >
                {{ noHoursMessage }}
            </p>

            <div
                v-if="
                    !isAvailabilityOptionsLoading &&
                    availableStartTimes?.length === 0 &&
                    formVehicleId
                "
                class="flex flex-wrap items-center gap-2"
            >
                <UiButton
                    v-if="
                        nextAvailableStatus === 'idle' ||
                        nextAvailableStatus === 'error'
                    "
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="$emit('findNextAvailable')"
                >
                    Znajdź najbliższy wolny dzień
                </UiButton>
                <p
                    v-if="nextAvailableStatus === 'loading'"
                    class="text-muted-foreground text-xs"
                    role="status"
                >
                    Szukam wolnego terminu...
                </p>
                <p
                    v-if="nextAvailableStatus === 'none'"
                    class="text-muted-foreground text-xs"
                    role="status"
                >
                    Nie znaleziono terminu w kolejnych 14 dniach lub przed
                    końcem okna rezerwacji.
                </p>
                <p
                    v-if="nextAvailableStatus === 'error'"
                    class="text-destructive text-xs"
                    role="alert"
                >
                    Nie udało się sprawdzić kolejnych dni. Spróbuj ponownie.
                </p>
                <UiButton
                    v-if="nextAvailableStatus === 'found' && nextAvailableDay"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="lessonDateModel = nextAvailableDay.date"
                >
                    Sprawdź {{ nextAvailableLabel }}
                </UiButton>
            </div>

            <p
                v-if="availabilityStatus === 'unavailable'"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ availabilityMessage }}
            </p>
        </fieldset>
    </form>
</template>
