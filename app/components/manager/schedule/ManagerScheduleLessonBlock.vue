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
        class="absolute inset-x-1.5 box-border overflow-hidden rounded-md border px-1.5 py-1 text-xs leading-tight shadow-sm"
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
                class="size-3 shrink-0 text-violet-700 dark:text-violet-200"
                aria-hidden="true"
            />
            <UiBadge
                variant="secondary"
                class="border-violet-500/40 bg-violet-500/20 px-1 py-0 text-[9px] font-semibold tracking-wide text-violet-950 uppercase dark:text-violet-50"
            >
                Teoria
            </UiBadge>
            <span class="ml-auto shrink-0 font-medium tabular-nums">
                {{ isoToHm(lesson.startTime) }}?{{ isoToHm(lesson.endTime) }}
            </span>
        </div>
        <span v-else class="mb-0.5 flex items-center gap-1">
            <Car
                class="size-3 shrink-0 text-emerald-800 dark:text-emerald-200"
                aria-hidden="true"
            />
            <span class="font-medium tabular-nums">
                {{ isoToHm(lesson.startTime) }}?{{ isoToHm(lesson.endTime) }}
            </span>
        </span>
        <span
            class="block truncate text-[10px] font-medium"
            :class="
                isTheoryLessonType(lesson.type)
                    ? 'text-violet-950/95 dark:text-violet-50/95'
                    : ''
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
                class="px-1 py-0 text-[9px] font-medium"
            >
                {{ labelForInstructorEventStatusRaw(lesson.status) }}
            </UiBadge>
        </span>
        <span
            v-if="
                isTheoryLessonType(lesson.type) &&
                displayInstructorSubtitle(lesson)
            "
            class="block truncate text-[10px] leading-snug text-violet-900/85 dark:text-violet-100/85"
        >
            {{ displayInstructorSubtitle(lesson) }}
        </span>
        <span
            v-if="!isTheoryLessonType(lesson.type) && displayVehicle(lesson)"
            class="block truncate text-[10px] opacity-85"
        >
            {{ displayVehicle(lesson) }}
        </span>
        <span
            v-if="
                !isTheoryLessonType(lesson.type) &&
                displayInstructorSubtitle(lesson)
            "
            class="block truncate text-[10px] leading-snug text-emerald-900/85 dark:text-emerald-100/85"
        >
            {{ displayInstructorSubtitle(lesson) }}
        </span>
    </div>
</template>
