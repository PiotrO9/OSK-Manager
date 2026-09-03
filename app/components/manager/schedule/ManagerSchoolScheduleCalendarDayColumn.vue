<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { ManagerSchoolScheduleCalendarBlockActions } from '~/types/schedule/managerSchoolScheduleCalendarComponents';
import type { ManagerSchoolScheduleWeekDay } from '~/utils/schedule/managerSchoolScheduleCalendarWeek';

const props = defineProps<{
    blockActions: ManagerSchoolScheduleCalendarBlockActions;
    day: ManagerSchoolScheduleWeekDay;
    displayError: string | null;
    displayLoading: boolean;
    emptyDayMessage: string;
    gridHeightPx: number;
    lessonBlockHeightPx: (
        lesson: ScheduleLessonItem,
        dateStr: string,
    ) => number;
    lessonBlockTopPx: (lesson: ScheduleLessonItem, dateStr: string) => number;
    lessons: ScheduleLessonItem[];
    practicePrimaryLine: 'student' | 'instructor';
}>();

const emit = defineEmits<{
    blockKeydown: [event: KeyboardEvent, lesson: ScheduleLessonItem];
    blockSelect: [lesson: ScheduleLessonItem];
}>();

function emitBlockKeydown(
    event: KeyboardEvent,
    lesson: ScheduleLessonItem,
): void {
    emit('blockKeydown', event, lesson);
}
</script>

<template>
    <div class="border-border flex min-w-0 flex-col border-r last:border-r-0">
        <div
            class="border-border flex h-12 shrink-0 flex-col items-center justify-center border-b px-1 text-center"
            :class="day.isToday ? 'bg-primary/10 font-semibold' : ''"
        >
            <span class="text-foreground text-xs font-medium capitalize">
                {{ day.header }}
            </span>
            <UiBadge v-if="day.isToday" variant="secondary" class="mt-1">
                dziś
            </UiBadge>
        </div>

        <div
            class="border-border relative border-b"
            :style="{ height: `${gridHeightPx}px` }"
        >
            <div
                class="pointer-events-none absolute inset-0 flex flex-col"
                aria-hidden="true"
            >
                <div
                    v-for="n in 12"
                    :key="n"
                    class="border-border/50 h-[60px] border-b border-dashed"
                />
            </div>

            <template v-for="lesson in lessons" :key="lesson.id">
                <ManagerScheduleLessonBlock
                    :lesson="lesson"
                    :top-px="lessonBlockTopPx(lesson, props.day.dateStr)"
                    :height-px="lessonBlockHeightPx(lesson, props.day.dateStr)"
                    :accessibility-label="
                        blockActions.blockAccessibilityLabel(lesson)
                    "
                    :interactive-classes="
                        blockActions.lessonBlockInteractiveClasses(lesson)
                    "
                    :is-clickable="blockActions.blockIsClickable(lesson)"
                    :practice-primary-line="practicePrimaryLine"
                    @select="emit('blockSelect', $event)"
                    @keydown="emitBlockKeydown"
                />
            </template>

            <div
                v-if="lessons.length === 0 && !displayLoading && !displayError"
                class="text-muted-foreground absolute inset-0 flex items-center justify-center p-2 text-center text-xs"
            >
                {{ emptyDayMessage }}
            </div>
        </div>
    </div>
</template>
