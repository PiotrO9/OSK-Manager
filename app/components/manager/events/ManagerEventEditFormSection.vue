<script setup lang="ts">
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { Vehicle } from '~/types/vehicles/vehicle';

defineProps<{
    eventId: string;
    eventStatus?: string;
    formType: string;
    schoolId: string;
    headerDateRangeLabel: string;
    formError: string | null;
    isSlotsLoading: boolean;
    freeWindowsUnavailable: boolean;
    isSaving: boolean;
    isDeleteLoading: boolean;
    isFormDirty: boolean;
    instructors: InstructorListItem[];
    instructorSelectLabel: string;
    isInstructorsLoading: boolean;
    instructorsError: string | null;
    vehicles: Vehicle[];
    isVehiclesLoading: boolean;
    vehiclesError: string | null;
    startDate: string;
    startHour: number;
    startMinute: number;
    endDate: string;
    endHour: number;
    endMinute: number;
    startHourOptions: number[];
    startMinuteOptions: number[];
    endHourOptions: number[];
    endMinuteOptions: number[];
    minDate?: string | null;
    maxDate?: string | null;
}>();

defineEmits<{
    submit: [];
    cancel: [];
    delete: [];
    statusPatched: [status: string];
    startDateChange: [event: Event];
    startHourChange: [event: Event];
    startMinuteChange: [event: Event];
    endDateChange: [event: Event];
    endHourChange: [event: Event];
    endMinuteChange: [event: Event];
}>();

const instructorId = defineModel<string>('instructorId', { required: true });
const vehicleId = defineModel<string>('vehicleId', { required: true });
</script>

<template>
    <FormSection
        title="Edytuj wydarzenie"
        description="Formularz podzielony na logiczne sekcje, bez zmiany walidacji i flow."
    >
        <div class="mb-4 flex justify-end">
            <UiBadge
                variant="outline"
                class="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
            >
                FormSection
            </UiBadge>
        </div>

        <div class="mb-5 max-w-sm space-y-2">
            <p class="text-muted-foreground text-xs">Status wydarzenia</p>
            <ManagerEventStatusSelect
                :event-id="eventId"
                :status="eventStatus"
                @update:status="$emit('statusPatched', $event)"
            />
        </div>

        <form
            id="event-edit-form"
            class="space-y-5"
            aria-label="Formularz edycji wydarzenia"
            :aria-busy="isSaving"
            @submit.prevent="$emit('submit')"
        >
            <ManagerEventResourceFields
                v-model:instructor-id="instructorId"
                v-model:vehicle-id="vehicleId"
                :event-type="formType"
                :school-id="schoolId"
                :instructors="instructors"
                :instructor-select-label="instructorSelectLabel"
                :is-instructors-loading="isInstructorsLoading"
                :instructors-error="instructorsError"
                :vehicles="vehicles"
                :is-vehicles-loading="isVehiclesLoading"
                :vehicles-error="vehiclesError"
                :is-saving="isSaving"
            />
            <ManagerEventTimeFields
                :start-date="startDate"
                :start-hour="startHour"
                :start-minute="startMinute"
                :end-date="endDate"
                :end-hour="endHour"
                :end-minute="endMinute"
                :start-hour-options="startHourOptions"
                :start-minute-options="startMinuteOptions"
                :end-hour-options="endHourOptions"
                :end-minute-options="endMinuteOptions"
                :min-date="minDate"
                :max-date="maxDate"
                :is-saving="isSaving"
                @start-date-change="$emit('startDateChange', $event)"
                @start-hour-change="$emit('startHourChange', $event)"
                @start-minute-change="$emit('startMinuteChange', $event)"
                @end-date-change="$emit('endDateChange', $event)"
                @end-hour-change="$emit('endHourChange', $event)"
                @end-minute-change="$emit('endMinuteChange', $event)"
            />

            <p
                v-if="isSlotsLoading"
                class="text-muted-foreground text-xs"
                role="status"
            >
                Aktualizacja dostępnych okien grafiku...
            </p>
            <p
                v-if="freeWindowsUnavailable"
                class="border-border rounded-md border border-dashed px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
                role="alert"
            >
                Instruktor nie ma dostępności w tym dniu - zmień datę lub
                instruktora, aby wybrać godziny bloku.
            </p>

            <p v-if="formError" class="text-destructive text-sm" role="alert">
                {{ formError }}
            </p>

            <ManagerEventEditActions
                :is-saving="isSaving"
                :is-delete-loading="isDeleteLoading"
                :is-form-dirty="isFormDirty"
                @cancel="$emit('cancel')"
            />
        </form>

        <template #footer>
            <ManagerEventDeleteAction
                :is-saving="isSaving"
                :is-delete-loading="isDeleteLoading"
                @delete="$emit('delete')"
            />
        </template>
    </FormSection>
</template>
