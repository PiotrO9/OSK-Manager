<script setup lang="ts">
import type { WeeklyDayFormRow } from '~/types/instructors/instructorAvailability';
import type { AvailabilityTimelineBar } from '~/utils/schedule/availabilityTimeline';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
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
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-8 min-w-0 rounded-md border px-2.5 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';
</script>

<template>
    <article class="bg-background min-w-0 px-3 py-2.5" role="listitem">
        <div
            class="grid min-w-0 gap-2 sm:grid-cols-[minmax(128px,1fr)_minmax(96px,104px)_minmax(96px,104px)_auto] sm:items-center"
        >
            <div class="flex min-w-0 items-center gap-2">
                <UiSwitch
                    :id="`availability-toggle-${row.dayOfWeek}`"
                    :model-value="row.enabled"
                    :disabled="isDisabled"
                    :aria-label="`Włącz dostępność: ${row.label}`"
                    @update:model-value="$emit('updateEnabled', $event)"
                />
                <div class="min-w-0">
                    <label
                        :for="`availability-toggle-${row.dayOfWeek}`"
                        class="text-foreground block cursor-pointer truncate text-sm font-bold select-none"
                    >
                        {{ row.label }}
                    </label>
                    <p class="text-muted-foreground text-xs tabular-nums">
                        {{ getInstructorAvailabilityLabel(row) }}
                    </p>
                </div>
            </div>

            <div class="min-w-0 space-y-1">
                <span class="sr-only">
                    Godzina rozpoczęcia - {{ row.label }}
                </span>
                <span
                    class="text-muted-foreground text-[11px] font-medium sm:hidden"
                >
                    Od
                </span>
                <UiTimePicker
                    :id="`availability-start-${row.dayOfWeek}`"
                    :model-value="row.startTime"
                    :disabled="!row.enabled || isDisabled"
                    :label="`Godzina rozpoczęcia - ${row.label}`"
                    :invalid="error !== null"
                    :context-label="`${row.label} · początek pracy`"
                    :max-exclusive="row.endTime"
                    :trigger-class="fieldClass"
                    @update:model-value="$emit('updateStartTime', $event)"
                />
            </div>

            <div class="min-w-0 space-y-1">
                <span class="sr-only">
                    Godzina zakończenia - {{ row.label }}
                </span>
                <span
                    class="text-muted-foreground text-[11px] font-medium sm:hidden"
                >
                    Do
                </span>
                <UiTimePicker
                    :id="`availability-end-${row.dayOfWeek}`"
                    :model-value="row.endTime"
                    :disabled="!row.enabled || isDisabled"
                    :label="`Godzina zakończenia - ${row.label}`"
                    :invalid="error !== null"
                    :context-label="`${row.label} · koniec pracy`"
                    :min-exclusive="row.startTime"
                    :trigger-class="fieldClass"
                    @update:model-value="$emit('updateEndTime', $event)"
                />
            </div>

            <span
                class="inline-flex h-7 w-fit shrink-0 items-center rounded-full px-3 text-xs font-bold ring-1 sm:justify-self-end"
                :class="getInstructorAvailabilityStatusClass(row)"
            >
                {{ getInstructorAvailabilityStatusLabel(row) }}
            </span>
        </div>

        <div
            class="bg-muted/50 border-border/60 mt-2 h-1.5 w-full overflow-hidden rounded-full border"
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
