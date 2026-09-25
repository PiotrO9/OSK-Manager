<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import { computed } from 'vue';
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import type { StatusTone } from '~/components/app/ui/types';
import type { Vehicle } from '~/types/vehicles/vehicle';
import type { ScheduleAvailabilityStatus } from '~/types/schedule/scheduleAvailability';
import {
    buildDatetimeLocal,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
} from '~/utils/date/weeklyCalendarDates';

const props = defineProps<{
    formId: string;
    loadedLesson: ManagerLessonDetail;
    studentDisplayName: string | null;
    lessonStatusLabel: string;
    lessonStatusTone: StatusTone;
    instructorsForSelect: InstructorListItem[];
    instructorSelectLabel: string;
    isInstructorsLoading: boolean;
    instructorsError: string | null;
    vehiclesForSelect: Vehicle[];
    isVehiclesLoading: boolean;
    vehiclesError: string | null;
    schoolId: string;
    formError: string | null;
    availabilityStatus: ScheduleAvailabilityStatus;
    availabilityMessage: string;
    minDurationMinutes: number | null;
    availableStartTimes?: readonly string[];
    availableEndTimes?: readonly string[];
    availableVehicleIds?: readonly string[];
    isAvailabilityOptionsLoading: boolean;
    availabilityOptionsError: string;
}>();

defineEmits<{
    submit: [];
}>();

const formStartLocal = defineModel<string>('startLocal', { required: true });
const formEndLocal = defineModel<string>('endLocal', { required: true });
const formVehicleId = defineModel<string>('vehicleId', { required: true });
const formInstructorId = defineModel<string>('instructorId', {
    required: true,
});

function datePartFromDatetimeLocal(value: string): string {
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
            : current?.date;
    const time =
        updates.time !== undefined
            ? parseTimePart(updates.time)
            : current
              ? { hour: current.hour, minute: current.minute }
              : null;

    if (!date || !time) {
        return currentValue;
    }

    return buildDatetimeLocal(date, time.hour, time.minute);
}

const lessonDateModel = computed({
    get: () =>
        datePartFromDatetimeLocal(formStartLocal.value) ||
        datePartFromDatetimeLocal(formEndLocal.value),
    set: (date: string) => {
        formStartLocal.value = mergeDatetimeLocal(formStartLocal.value, {
            date,
        });
        formEndLocal.value = mergeDatetimeLocal(formEndLocal.value, { date });
    },
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
        (props.availableVehicleIds !== undefined &&
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
            <UiSelect
                v-model="formInstructorId"
                :disabled="instructorsForSelect.length === 0"
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

        <fieldset class="space-y-3 lg:col-span-2">
            <legend class="text-foreground text-sm font-semibold">
                Termin
            </legend>
            <div class="space-y-2">
                <UiLabel for="lesson-date">Data</UiLabel>
                <UiDatePicker
                    id="lesson-date"
                    v-model="lessonDateModel"
                    placeholder="Wybierz dzień lekcji"
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
        </fieldset>

        <div
            v-if="isAvailabilityOptionsLoading"
            class="text-muted-foreground flex items-center lg:col-span-2"
            role="status"
        >
            <LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
            <span class="sr-only">Aktualizacja dostępnych godzin</span>
        </div>

        <p
            v-else-if="availabilityOptionsError"
            class="text-muted-foreground text-xs lg:col-span-2"
            role="status"
        >
            {{ availabilityOptionsError }}
        </p>

        <p
            v-else-if="availableStartTimes?.length === 0"
            class="text-destructive text-sm lg:col-span-2"
            role="alert"
        >
            Brak dostępnych godzin w wybranym dniu.
        </p>

        <p
            v-if="availabilityStatus !== 'idle'"
            :class="[
                'text-sm lg:col-span-2',
                availabilityStatus === 'unavailable'
                    ? 'text-destructive'
                    : 'text-muted-foreground',
            ]"
            :role="availabilityStatus === 'unavailable' ? 'alert' : 'status'"
        >
            {{ availabilityMessage }}
        </p>

        <p
            v-if="!schoolId"
            class="text-warning-800 bg-warning-50 border-warning-200 rounded-xl border px-3 py-2 text-sm lg:col-span-2"
            role="status"
        >
            Dodaj <code class="text-xs">?schoolId=</code> w adresie, aby wybrac
            pojazd i instruktora z list OSK.
        </p>

        <p
            v-if="formError"
            class="text-destructive text-sm lg:col-span-2"
            role="alert"
        >
            {{ formError }}
        </p>
    </form>
</template>
