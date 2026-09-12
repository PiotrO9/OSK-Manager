<script setup lang="ts">
import { computed } from 'vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import type { StatusTone } from '~/components/app/ui/types';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    buildDatetimeLocal,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
} from '~/utils/date/weeklyCalendarDates';

defineProps<{
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

const startDateModel = computed({
    get: () => datePartFromDatetimeLocal(formStartLocal.value),
    set: (date: string) => {
        formStartLocal.value = mergeDatetimeLocal(formStartLocal.value, {
            date,
        });
    },
});

const startTimeModel = computed({
    get: () => timePartFromDatetimeLocal(formStartLocal.value),
    set: (time: string) => {
        formStartLocal.value = mergeDatetimeLocal(formStartLocal.value, {
            time,
        });
    },
});

const endDateModel = computed({
    get: () => datePartFromDatetimeLocal(formEndLocal.value),
    set: (date: string) => {
        formEndLocal.value = mergeDatetimeLocal(formEndLocal.value, {
            date,
        });
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

const areDatesEqual = computed(
    () =>
        startDateModel.value.length > 0 &&
        startDateModel.value === endDateModel.value,
);

const startTimeMaxExclusive = computed(() =>
    areDatesEqual.value && endTimeModel.value.length > 0
        ? endTimeModel.value
        : undefined,
);

const endTimeMinExclusive = computed(() =>
    areDatesEqual.value && startTimeModel.value.length > 0
        ? startTimeModel.value
        : undefined,
);
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
                        >
                            {{ v.name }} ({{ v.registrationNumber }})
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>

        <fieldset class="space-y-3 lg:col-span-2">
            <legend class="text-foreground text-sm font-semibold">
                Termin
            </legend>
            <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                    <UiLabel for="lesson-start-date">Początek</UiLabel>
                    <div
                        class="grid max-w-[30rem] gap-2 sm:grid-cols-[minmax(13rem,1fr)_8.75rem]"
                    >
                        <UiDatePicker
                            id="lesson-start-date"
                            v-model="startDateModel"
                            placeholder="Data początku"
                            :max="endDateModel || undefined"
                            trigger-class="h-10 max-w-none rounded-xl bg-background"
                        />
                        <UiTimePicker
                            id="lesson-start-time"
                            v-model="startTimeModel"
                            label="Godzina początku"
                            context-label="Początek"
                            :max-exclusive="startTimeMaxExclusive"
                            trigger-class="h-10 rounded-xl bg-background"
                        />
                    </div>
                </div>
                <div class="space-y-2">
                    <UiLabel for="lesson-end-date">Koniec</UiLabel>
                    <div
                        class="grid max-w-[30rem] gap-2 sm:grid-cols-[minmax(13rem,1fr)_8.75rem]"
                    >
                        <UiDatePicker
                            id="lesson-end-date"
                            v-model="endDateModel"
                            placeholder="Data końca"
                            :min="startDateModel || undefined"
                            trigger-class="h-10 max-w-none rounded-xl bg-background"
                        />
                        <UiTimePicker
                            id="lesson-end-time"
                            v-model="endTimeModel"
                            label="Godzina końca"
                            context-label="Koniec"
                            :min-exclusive="endTimeMinExclusive"
                            trigger-class="h-10 rounded-xl bg-background"
                        />
                    </div>
                </div>
            </div>
        </fieldset>

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
