<script setup lang="ts">
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';
import type { StatusTone } from '~/components/app/ui/types';
import type { Vehicle } from '~/types/vehicles/vehicle';

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
                    <UiLabel for="lesson-start">Pocz¹tek</UiLabel>
                    <UiDateTimePicker
                        id="lesson-start"
                        v-model="formStartLocal"
                        placeholder="Data i godzina pocz¹tku"
                        :aria-required="true"
                        trigger-class="h-10 rounded-xl bg-background"
                    />
                </div>
                <div class="space-y-2">
                    <UiLabel for="lesson-end">Koniec</UiLabel>
                    <UiDateTimePicker
                        id="lesson-end"
                        v-model="formEndLocal"
                        placeholder="Data i godzina koñca"
                        :aria-required="true"
                        trigger-class="h-10 rounded-xl bg-background"
                    />
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
