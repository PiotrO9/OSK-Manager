<script setup lang="ts">
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';

defineProps<{
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
    isSaving: boolean;
    isOptionsLoading: boolean;
}>();

defineEmits<{
    dateChange: [value: string];
    startTimeChange: [value: string];
    endTimeChange: [value: string];
}>();
</script>

<template>
    <div class="grid gap-4 md:grid-cols-3">
        <div class="space-y-2">
            <UiLabel for="edit-event-date">Data</UiLabel>
            <UiDatePicker
                id="edit-event-date"
                :model-value="date"
                :min="minDate ?? undefined"
                :max="maxDate ?? undefined"
                :disabled="isSaving"
                placeholder="Wybierz datę wydarzenia"
                trigger-class="h-10 max-w-none rounded-xl bg-background"
                @update:model-value="$emit('dateChange', $event)"
            />
        </div>

        <div class="space-y-2">
            <UiLabel for="edit-event-start-time">Początek</UiLabel>
            <UiTimePicker
                id="edit-event-start-time"
                :model-value="startTime"
                label="Godzina początku wydarzenia"
                context-label="Początek"
                :allowed-times="availableStartTimes"
                :hour-options="
                    availableStartTimes === undefined
                        ? startHourOptions
                        : undefined
                "
                :minute-options="
                    availableStartTimes === undefined
                        ? startMinuteOptions
                        : undefined
                "
                :disabled="isSaving || isOptionsLoading"
                trigger-class="h-10 max-w-none rounded-xl bg-background"
                @update:model-value="$emit('startTimeChange', $event)"
            />
        </div>

        <div class="space-y-2">
            <UiLabel for="edit-event-end-time">Koniec</UiLabel>
            <UiTimePicker
                id="edit-event-end-time"
                :model-value="endTime"
                label="Godzina końca wydarzenia"
                context-label="Koniec"
                :allowed-times="availableEndTimes"
                :hour-options="
                    availableEndTimes === undefined ? endHourOptions : undefined
                "
                :minute-options="
                    availableEndTimes === undefined
                        ? endMinuteOptions
                        : undefined
                "
                :disabled="isSaving || isOptionsLoading"
                trigger-class="h-10 max-w-none rounded-xl bg-background"
                @update:model-value="$emit('endTimeChange', $event)"
            />
        </div>
    </div>
</template>
