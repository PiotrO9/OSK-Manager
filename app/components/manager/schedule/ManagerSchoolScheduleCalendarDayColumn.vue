<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { ManagerSchoolScheduleCalendarBlockActions } from '~/types/schedule/managerSchoolScheduleCalendarComponents';
import type { ManagerSchoolScheduleWeekDay } from '~/utils/schedule/managerSchoolScheduleCalendarWeek';
import {
    buildScheduleSameStartGroups,
    type ScheduleSameStartGroup,
} from '~/utils/schedule/managerScheduleSameStartGroups';

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
    groupSameStart: boolean;
    practicePrimaryLine: 'student' | 'instructor';
    showInstructorSubtitle: boolean;
}>();

const emit = defineEmits<{
    blockKeydown: [event: KeyboardEvent, lesson: ScheduleLessonItem];
    blockSelect: [lesson: ScheduleLessonItem];
    groupSelect: [group: ScheduleSameStartGroup];
}>();

const groups = computed(() =>
    props.groupSameStart ? buildScheduleSameStartGroups(props.lessons) : [],
);

function emitBlockKeydown(
    event: KeyboardEvent,
    lesson: ScheduleLessonItem,
): void {
    emit('blockKeydown', event, lesson);
}
</script>

<template>
    <div class="border-border flex min-w-0 flex-col border-r last:border-r-0">
        <WeekCalendarDayHeader :label="day.header" :is-today="day.isToday" />

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

            <template v-if="groupSameStart">
                <template v-for="group in groups" :key="group.startHm">
                    <ManagerScheduleLessonBlock
                        v-if="group.items.length === 1"
                        :lesson="group.items[0]!"
                        :top-px="group.topPx"
                        :height-px="group.heightPx"
                        :accessibility-label="
                            blockActions.blockAccessibilityLabel(
                                group.items[0]!,
                            )
                        "
                        :interactive-classes="
                            blockActions.lessonBlockInteractiveClasses(
                                group.items[0]!,
                            )
                        "
                        :is-clickable="
                            blockActions.blockIsClickable(group.items[0]!)
                        "
                        :practice-primary-line="practicePrimaryLine"
                        :show-instructor-subtitle="showInstructorSubtitle"
                        @select="emit('blockSelect', $event)"
                        @keydown="emitBlockKeydown"
                    />
                    <ManagerScheduleSameStartBlock
                        v-else
                        :group="group"
                        :day-label="day.header"
                        @select="emit('groupSelect', $event)"
                    />
                </template>
            </template>

            <template
                v-for="lesson in groupSameStart ? [] : lessons"
                :key="lesson.id"
            >
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
                    :show-instructor-subtitle="showInstructorSubtitle"
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
