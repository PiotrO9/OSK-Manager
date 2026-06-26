<script setup lang="ts">
import type {
    LessonBookingInstructorOption,
    LessonBookingSlotContext,
} from '~/types/lessons/lessonBooking';

defineProps<{
    slotCtx: LessonBookingSlotContext;
    availableInstructors: readonly LessonBookingInstructorOption[];
    instructorLabel: string;
    slotWhenLabel: string;
}>();
</script>

<template>
    <div
        class="bg-muted/40 space-y-1 rounded-lg border px-3 py-2 text-sm"
        role="status"
    >
        <p v-if="availableInstructors.length === 1">
            <span class="text-muted-foreground">Instruktor:</span>
            {{ instructorLabel }}
        </p>
        <p v-else>
            <span class="text-muted-foreground">
                Dostępnych instruktorów w tym oknie:
            </span>
            {{ availableInstructors.length }}
        </p>
        <p>
            <span class="text-muted-foreground">Termin:</span>
            {{ slotWhenLabel }}
        </p>
    </div>
</template>
