<script setup lang="ts">
import type { WeeklyDayFormRow } from '~/types/instructors/instructorAvailability';
import type { AvailabilityTimelineBar } from '~/utils/schedule/availabilityTimeline';
import {
    getInstructorAvailabilityLabel,
    getInstructorAvailabilityStatusClass,
    getInstructorAvailabilityStatusLabel,
} from '~/utils/instructors/managerInstructorAvailabilityEditor';

defineProps<{
    row: WeeklyDayFormRow;
    draftBar: AvailabilityTimelineBar | null;
    isSaving: boolean;
    error: string | null;
}>();

defineEmits<{
    toggleDay: [];
    saveRow: [];
    updateStartTime: [value: string];
    updateEndTime: [value: string];
}>();

const fieldClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 min-w-0 rounded-lg border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

function readInputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : '';
}
</script>

<template>
    <article
        class="border-border/80 bg-background rounded-xl border p-3 shadow-xs"
        role="listitem"
    >
        <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
            <div class="min-w-0 space-y-1">
                <div class="flex items-center gap-2">
                    <UiSwitch
                        :id="`availability-toggle-${row.dayOfWeek}`"
                        :checked="row.enabled"
                        :disabled="isSaving"
                        :aria-label="`Włącz dostępność: ${row.label}`"
                        @update:checked="$emit('toggleDay')"
                    />
                    <label
                        :for="`availability-toggle-${row.dayOfWeek}`"
                        class="text-foreground cursor-pointer text-sm font-bold select-none"
                    >
                        {{ row.label }}
                    </label>
                </div>
                <p class="text-muted-foreground pl-11 text-xs tabular-nums">
                    {{ getInstructorAvailabilityLabel(row) }}
                </p>
            </div>

            <span
                class="inline-flex h-7 w-fit items-center rounded-full px-3 text-xs font-bold ring-1"
                :class="getInstructorAvailabilityStatusClass(row)"
            >
                {{ getInstructorAvailabilityStatusLabel(row) }}
            </span>
        </div>

        <div class="mt-3 space-y-3">
            <div
                class="bg-muted/50 border-border/60 relative h-2.5 w-full overflow-hidden rounded-full border"
                aria-hidden="true"
            >
                <div
                    v-if="draftBar"
                    class="bg-primary absolute top-0.5 bottom-0.5 rounded-full transition-[left,width] duration-150 ease-out"
                    :style="{
                        left: draftBar.leftPct + '%',
                        width: draftBar.widthPct + '%',
                    }"
                />
            </div>

            <div
                class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
                <label class="min-w-0 space-y-1">
                    <span class="text-muted-foreground text-[11px] font-medium">
                        Od
                    </span>
                    <input
                        :id="`availability-start-${row.dayOfWeek}`"
                        :value="row.startTime"
                        type="time"
                        :disabled="!row.enabled || isSaving"
                        :aria-label="`Godzina rozpoczęcia - ${row.label}`"
                        :class="[fieldClass, 'w-full']"
                        @input="
                            $emit('updateStartTime', readInputValue($event))
                        "
                    />
                </label>

                <label class="min-w-0 space-y-1">
                    <span class="text-muted-foreground text-[11px] font-medium">
                        Do
                    </span>
                    <input
                        :id="`availability-end-${row.dayOfWeek}`"
                        :value="row.endTime"
                        type="time"
                        :disabled="!row.enabled || isSaving"
                        :aria-label="`Godzina zakończenia - ${row.label}`"
                        :class="[fieldClass, 'w-full']"
                        @input="$emit('updateEndTime', readInputValue($event))"
                    />
                </label>

                <UiButton
                    v-if="row.enabled"
                    type="button"
                    size="sm"
                    class="self-end rounded-lg"
                    :disabled="isSaving"
                    :aria-busy="isSaving"
                    :aria-label="`Zapisz dostępność: ${row.label}`"
                    @click="$emit('saveRow')"
                >
                    {{ isSaving ? 'Zapisywanie...' : 'Zapisz' }}
                </UiButton>

                <span
                    v-else
                    class="text-muted-foreground self-end pb-2 text-xs italic"
                >
                    Wyłączone
                </span>
            </div>

            <p
                v-if="error"
                class="text-destructive text-xs"
                role="alert"
                aria-live="polite"
            >
                {{ error }}
            </p>
        </div>
    </article>
</template>
