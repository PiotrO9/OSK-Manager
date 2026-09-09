<script setup lang="ts">
import { BookOpen, Car } from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    displayInstructorSubtitle,
    displayPrimaryLine,
    displayVehicle,
    isoToHm,
    isTheoryLessonType,
    lessonBlockClasses,
} from '~/utils/schedule/managerScheduleCalendarUtils';
import {
    instructorEventStatusBadgeVariant,
    labelForInstructorEventStatusRaw,
    normalizeInstructorEventStatus,
} from '~/utils/events/instructorEventStatusDisplay';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';

defineProps<{
    lesson: ScheduleLessonItem;
    topPx: number;
    heightPx: number;
    accessibilityLabel: string;
    interactiveClasses: string;
    isClickable: boolean;
    practicePrimaryLine: 'student' | 'instructor';
}>();

const emit = defineEmits<{
    select: [lesson: ScheduleLessonItem];
    keydown: [event: KeyboardEvent, lesson: ScheduleLessonItem];
}>();
</script>

<template>
    <div
        class="absolute inset-x-1.5 box-border overflow-hidden rounded-md border px-2 py-1.5 text-xs leading-tight shadow-sm"
        :class="[lessonBlockClasses(lesson.type), interactiveClasses]"
        :style="{
            top: `${topPx}px`,
            height: `${heightPx}px`,
        }"
        :title="accessibilityLabel"
        :role="isClickable ? 'button' : 'group'"
        :aria-label="accessibilityLabel"
        :tabindex="isClickable ? 0 : undefined"
        @click="emit('select', lesson)"
        @keydown="emit('keydown', $event, lesson)"
    >
        <div
            v-if="isTheoryLessonType(lesson.type)"
            class="mb-0.5 flex items-center gap-1"
        >
            <BookOpen
                class="text-warning-700 size-3 shrink-0"
                aria-hidden="true"
            />
            <UiBadge
                variant="secondary"
                class="border-warning-500/40 bg-warning-500/20 text-warning-950 px-1 py-0 text-[11px] font-semibold"
            >
                Teoria
            </UiBadge>
            <span class="ml-auto shrink-0 font-medium tabular-nums">
                {{ isoToHm(lesson.startTime) }}-{{ isoToHm(lesson.endTime) }}
            </span>
        </div>
        <span v-else class="mb-0.5 flex items-center gap-1">
            <Car class="text-primary-700 size-3 shrink-0" aria-hidden="true" />
            <span class="font-medium tabular-nums">
                {{ isoToHm(lesson.startTime) }}-{{ isoToHm(lesson.endTime) }}
            </span>
        </span>
        <span
            class="block truncate text-xs font-medium"
            :class="
                isTheoryLessonType(lesson.type) ? 'text-warning-950/95' : ''
            "
        >
            {{ displayPrimaryLine(lesson, practicePrimaryLine) }}
        </span>
        <span v-if="isScheduleInstructorEvent(lesson)" class="mt-0.5 block">
            <UiBadge
                :variant="
                    instructorEventStatusBadgeVariant(
                        normalizeInstructorEventStatus(lesson.status),
                    )
                "
                class="px-1 py-0 text-[11px] font-medium"
            >
                {{ labelForInstructorEventStatusRaw(lesson.status) }}
            </UiBadge>
        </span>
        <span
            v-if="
                isTheoryLessonType(lesson.type) &&
                displayInstructorSubtitle(lesson)
            "
            class="text-warning-900 block truncate text-[11px] leading-snug"
        >
            {{ displayInstructorSubtitle(lesson) }}
        </span>
        <span
            v-if="!isTheoryLessonType(lesson.type) && displayVehicle(lesson)"
            class="block truncate text-[11px] opacity-85"
        >
            {{ displayVehicle(lesson) }}
        </span>
        <span
            v-if="
                !isTheoryLessonType(lesson.type) &&
                displayInstructorSubtitle(lesson)
            "
            class="text-primary-900 block truncate text-[11px] leading-snug"
        >
            {{ displayInstructorSubtitle(lesson) }}
        </span>
    </div>
</template>
