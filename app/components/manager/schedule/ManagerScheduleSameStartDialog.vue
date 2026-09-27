<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { ManagerSchoolScheduleCalendarBlockActions } from '~/types/schedule/managerSchoolScheduleCalendarComponents';
import type { ScheduleSameStartGroup } from '~/utils/schedule/managerScheduleSameStartGroups';
import { formatScheduleSameStartGroupLabel } from '~/utils/schedule/managerScheduleSameStartGroups';
import {
    displayInstructorName,
    displayPrimaryLine,
    displayVehicle,
    isoToHm,
    isTheoryLessonType,
} from '~/utils/schedule/managerScheduleCalendarUtils';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import { labelForScheduleLessonStatus } from '~/utils/schedule/managerScheduleLessonTable';
import { labelForInstructorEventStatusRaw } from '~/utils/events/instructorEventStatusDisplay';

const props = defineProps<{
    group: ScheduleSameStartGroup | null;
    blockActions: ManagerSchoolScheduleCalendarBlockActions;
    practicePrimaryLine: 'student' | 'instructor';
}>();

const emit = defineEmits<{
    close: [];
    select: [lesson: ScheduleLessonItem];
}>();

function itemType(lesson: ScheduleLessonItem): string {
    if (isScheduleInstructorEvent(lesson)) return 'Blok czasu';

    return isTheoryLessonType(lesson.type) ? 'Teoria' : 'Jazda';
}

function itemStatus(lesson: ScheduleLessonItem): string {
    return isScheduleInstructorEvent(lesson)
        ? labelForInstructorEventStatusRaw(lesson.status)
        : labelForScheduleLessonStatus(lesson.status);
}
</script>

<template>
    <UiDialog
        :open="props.group !== null"
        @update:open="!$event && emit('close')"
    >
        <UiDialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <UiDialogHeader>
                <UiDialogTitle>
                    {{
                        props.group
                            ? formatScheduleSameStartGroupLabel(props.group)
                            : ''
                    }}
                </UiDialogTitle>
                <UiDialogDescription>
                    Pozycje rozpoczynające się o tej samej godzinie.
                </UiDialogDescription>
            </UiDialogHeader>

            <div v-if="props.group" class="space-y-2">
                <button
                    v-for="lesson in props.group.items"
                    :key="lesson.id"
                    type="button"
                    class="border-border hover:bg-muted/50 focus-visible:ring-ring w-full rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none enabled:cursor-pointer disabled:cursor-default disabled:opacity-70"
                    :disabled="!props.blockActions.blockIsClickable(lesson)"
                    :aria-label="
                        props.blockActions.blockAccessibilityLabel(lesson)
                    "
                    @click="emit('select', lesson)"
                >
                    <span
                        class="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold"
                    >
                        <span>{{ itemType(lesson) }}</span>
                        <span class="tabular-nums">
                            {{ isoToHm(lesson.startTime) }}–{{
                                isoToHm(lesson.endTime)
                            }}
                        </span>
                    </span>
                    <span class="text-foreground mt-1 block text-sm">
                        {{
                            displayPrimaryLine(
                                lesson,
                                props.practicePrimaryLine,
                            )
                        }}
                    </span>
                    <span class="text-muted-foreground mt-1 block text-xs">
                        {{ itemStatus(lesson) }}
                        <template v-if="lesson.categoryCode">
                            · Kategoria {{ lesson.categoryCode }}
                        </template>
                    </span>
                    <span
                        v-if="displayInstructorName(lesson)"
                        class="text-muted-foreground mt-1 block text-xs"
                    >
                        Instruktor: {{ displayInstructorName(lesson) }}
                    </span>
                    <span
                        v-if="displayVehicle(lesson)"
                        class="text-muted-foreground block text-xs"
                    >
                        Pojazd: {{ displayVehicle(lesson) }}
                    </span>
                </button>
            </div>
        </UiDialogContent>
    </UiDialog>
</template>
