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
    isDisabled: boolean;
    error: string | null;
}>();

defineEmits<{
    updateEnabled: [value: boolean];
    updateStartTime: [value: string];
    updateEndTime: [value: string];
}>();

const fieldClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 min-w-0 rounded-md border px-2.5 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

function readInputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : '';
}
</script>

<template>
    <article
        class="border-border/80 bg-background min-w-0 rounded-lg border px-3 py-2.5 shadow-xs"
        role="listitem"
    >
        <div class="flex min-w-0 items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                    <UiSwitch
                        :id="`availability-toggle-${row.dayOfWeek}`"
                        :model-value="row.enabled"
                        :disabled="isDisabled"
                        :aria-label="`Włącz dostępność: ${row.label}`"
                        @update:model-value="$emit('updateEnabled', $event)"
                    />
                    <label
                        :for="`availability-toggle-${row.dayOfWeek}`"
                        class="text-foreground cursor-pointer text-sm font-bold select-none"
                    >
                        {{ row.label }}
                    </label>
                </div>
                <p
                    class="text-muted-foreground mt-1 pl-11 text-xs tabular-nums"
                >
                    {{ getInstructorAvailabilityLabel(row) }}
                </p>
            </div>

            <span
                class="inline-flex h-7 w-fit shrink-0 items-center rounded-full px-3 text-xs font-bold ring-1"
                :class="getInstructorAvailabilityStatusClass(row)"
            >
                {{ getInstructorAvailabilityStatusLabel(row) }}
            </span>
        </div>

        <div class="mt-2.5 grid min-w-0 grid-cols-2 gap-2">
            <label class="min-w-0 space-y-1">
                <span class="text-muted-foreground text-[11px] font-medium">
                    Od
                </span>
                <input
                    :id="`availability-start-${row.dayOfWeek}`"
                    :value="row.startTime"
                    type="time"
                    :disabled="!row.enabled || isDisabled"
                    :aria-label="`Godzina rozpoczęcia - ${row.label}`"
                    :class="[fieldClass, 'w-full']"
                    @input="$emit('updateStartTime', readInputValue($event))"
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
                    :disabled="!row.enabled || isDisabled"
                    :aria-label="`Godzina zakończenia - ${row.label}`"
                    :class="[fieldClass, 'w-full']"
                    @input="$emit('updateEndTime', readInputValue($event))"
                />
            </label>
        </div>

        <div
            class="bg-muted/50 border-border/60 mt-2.5 h-1.5 w-full overflow-hidden rounded-full border"
            aria-hidden="true"
        >
            <div
                v-if="draftBar"
                class="bg-primary h-full rounded-full transition-[margin-left,width] duration-150 ease-out"
                :style="{
                    marginLeft: draftBar.leftPct + '%',
                    width: draftBar.widthPct + '%',
                }"
            />
        </div>

        <p
            v-if="error"
            class="text-destructive mt-2 text-xs"
            role="alert"
            aria-live="polite"
        >
            {{ error }}
        </p>
    </article>
</template>
