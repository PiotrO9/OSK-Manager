<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { Vehicle } from '~/types/vehicles/vehicle';
import type { ScheduleAvailabilityStatus } from '~/types/schedule/scheduleAvailability';

defineProps<{
    eventId: string;
    eventStatus?: string;
    formType: string;
    schoolId: string;
    formError: string | null;
    eventAvailabilityStatus: ScheduleAvailabilityStatus;
    eventAvailabilityMessage: string;
    availableVehicleIds?: readonly string[];
    isAvailabilityOptionsLoading: boolean;
    availabilityOptionsError: string;
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
    date: string;
    startTime: string;
    endTime: string;
    startHourOptions: number[];
    startMinuteOptions: number[];
    endHourOptions: number[];
    endMinuteOptions: number[];
    availableStartTimes?: readonly string[];
    availableEndTimes?: readonly string[];
    minDate?: string | null;
    maxDate?: string | null;
}>();

defineEmits<{
    submit: [];
    cancel: [];
    statusPatched: [status: string];
    dateChange: [value: string];
    startTimeChange: [value: string];
    endTimeChange: [value: string];
}>();

const instructorId = defineModel<string>('instructorId', { required: true });
const vehicleId = defineModel<string>('vehicleId', { required: true });
</script>

<template>
    <FormSection>
        <form
            id="event-edit-form"
            class="space-y-5"
            aria-label="Formularz edycji wydarzenia"
            :aria-busy="isSaving"
            @submit.prevent="$emit('submit')"
        >
            <div
                class="grid max-w-5xl gap-4 md:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)]"
            >
                <div class="space-y-2">
                    <UiLabel for="edit-event-status">
                        Status wydarzenia
                    </UiLabel>
                    <ManagerEventStatusSelect
                        :event-id="eventId"
                        :status="eventStatus"
                        trigger-id="edit-event-status"
                        :show-badge="false"
                        @update:status="$emit('statusPatched', $event)"
                    />
                    <p class="text-muted-foreground text-xs">
                        Zmiana statusu zapisuje się od razu.
                    </p>
                </div>

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
                    :available-vehicle-ids="availableVehicleIds"
                    :is-vehicles-loading="isVehiclesLoading"
                    :vehicles-error="vehiclesError"
                    :is-saving="isSaving"
                />
            </div>

            <div
                v-if="isAvailabilityOptionsLoading"
                class="text-muted-foreground flex items-center"
                role="status"
            >
                <LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
                <span class="sr-only">Aktualizacja dostępnych godzin</span>
            </div>
            <p
                v-else-if="availabilityOptionsError"
                class="text-muted-foreground text-xs"
                role="status"
            >
                {{ availabilityOptionsError }}
            </p>
            <p
                v-else-if="startHourOptions.length === 0"
                class="text-destructive text-sm"
                role="alert"
            >
                Brak dostępnych godzin w wybranym dniu.
            </p>
            <ManagerEventTimeFields
                :date="date"
                :start-time="startTime"
                :end-time="endTime"
                :start-hour-options="startHourOptions"
                :start-minute-options="startMinuteOptions"
                :end-hour-options="endHourOptions"
                :end-minute-options="endMinuteOptions"
                :available-start-times="availableStartTimes"
                :available-end-times="availableEndTimes"
                :min-date="minDate"
                :max-date="maxDate"
                :is-saving="isSaving"
                :is-options-loading="isAvailabilityOptionsLoading"
                @date-change="$emit('dateChange', $event)"
                @start-time-change="$emit('startTimeChange', $event)"
                @end-time-change="$emit('endTimeChange', $event)"
            />

            <p
                v-if="eventAvailabilityStatus !== 'idle'"
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

            <p v-if="formError" class="text-destructive text-sm" role="alert">
                {{ formError }}
            </p>

            <ManagerEventEditActions
                :is-saving="isSaving"
                :is-delete-loading="isDeleteLoading"
                :is-form-dirty="isFormDirty"
                :is-availability-blocking="
                    eventAvailabilityStatus === 'checking' ||
                    eventAvailabilityStatus === 'unavailable'
                "
                @cancel="$emit('cancel')"
            />
        </form>
    </FormSection>
</template>
