<script setup lang="ts">
defineProps<{
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
    isSaving: boolean;
}>();

defineEmits<{
    startDateChange: [event: Event];
    startHourChange: [event: Event];
    startMinuteChange: [event: Event];
    endDateChange: [event: Event];
    endHourChange: [event: Event];
    endMinuteChange: [event: Event];
}>();
</script>

<template>
    <div class="grid gap-4 lg:grid-cols-2">
        <div class="space-y-2">
            <UiLabel for="edit-event-start-date">Początek</UiLabel>
            <div class="space-y-2">
                <div class="space-y-1">
                    <label
                        class="text-muted-foreground text-xs font-medium"
                        for="edit-event-start-date"
                    >
                        Data
                    </label>
                    <input
                        id="edit-event-start-date"
                        type="date"
                        :value="startDate"
                        :disabled="isSaving"
                        :min="minDate ?? undefined"
                        :max="maxDate ?? undefined"
                        class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Data początku"
                        aria-required="true"
                        @change="$emit('startDateChange', $event)"
                    />
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                        <label
                            class="text-muted-foreground text-xs font-medium"
                            for="edit-event-start-hour"
                        >
                            Godz.
                        </label>
                        <select
                            id="edit-event-start-hour"
                            :value="startHour"
                            :disabled="isSaving"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Godzina początku"
                            @change="$emit('startHourChange', $event)"
                        >
                            <option
                                v-for="h in startHourOptions"
                                :key="`sh-${h}`"
                                :value="h"
                            >
                                {{ String(h).padStart(2, '0') }}
                            </option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label
                            class="text-muted-foreground text-xs font-medium"
                            for="edit-event-start-minute"
                        >
                            Min.
                        </label>
                        <select
                            id="edit-event-start-minute"
                            :value="startMinute"
                            :disabled="isSaving"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Minuta początku"
                            @change="$emit('startMinuteChange', $event)"
                        >
                            <option
                                v-for="m in startMinuteOptions"
                                :key="`sm-${m}`"
                                :value="m"
                            >
                                {{ String(m).padStart(2, '0') }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-2">
            <UiLabel for="edit-event-end-date">Koniec</UiLabel>
            <div class="space-y-2">
                <div class="space-y-1">
                    <label
                        class="text-muted-foreground text-xs font-medium"
                        for="edit-event-end-date"
                    >
                        Data
                    </label>
                    <input
                        id="edit-event-end-date"
                        type="date"
                        :value="endDate"
                        :disabled="isSaving"
                        :min="minDate ?? undefined"
                        :max="maxDate ?? undefined"
                        class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Data końca"
                        aria-required="true"
                        @change="$emit('endDateChange', $event)"
                    />
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                        <label
                            class="text-muted-foreground text-xs font-medium"
                            for="edit-event-end-hour"
                        >
                            Godz.
                        </label>
                        <select
                            id="edit-event-end-hour"
                            :value="endHour"
                            :disabled="isSaving"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Godzina końca"
                            @change="$emit('endHourChange', $event)"
                        >
                            <option
                                v-for="h in endHourOptions"
                                :key="`eh-${h}`"
                                :value="h"
                            >
                                {{ String(h).padStart(2, '0') }}
                            </option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label
                            class="text-muted-foreground text-xs font-medium"
                            for="edit-event-end-minute"
                        >
                            Min.
                        </label>
                        <select
                            id="edit-event-end-minute"
                            :value="endMinute"
                            :disabled="isSaving"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Minuta końca"
                            @change="$emit('endMinuteChange', $event)"
                        >
                            <option
                                v-for="m in endMinuteOptions"
                                :key="`em-${m}`"
                                :value="m"
                            >
                                {{ String(m).padStart(2, '0') }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
