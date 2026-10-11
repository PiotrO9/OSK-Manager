<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { isStudentRatingSelectableScheduleLesson } from '~/utils/schedule/managerSchoolScheduleCalendarInteractions';
import {
    displayStudentScheduleTimeRange,
    formatStudentScheduleDateLabel,
    getStudentScheduleDateKeyFromIso,
    getStudentScheduleStatusLabel,
    isStudentScheduleCancellableLesson,
} from '~/utils/schedule/studentScheduleGroupedList';

const props = defineProps<{
    lesson: ScheduleLessonItem | null;
}>();

const emit = defineEmits<{
    close: [];
    cancel: [lesson: ScheduleLessonItem];
    rate: [lesson: ScheduleLessonItem];
}>();

const canCancel = computed(() =>
    props.lesson
        ? isStudentScheduleCancellableLesson({
              item: props.lesson,
              studentLessonCancelEnabled: true,
          })
        : false,
);
const canRate = computed(() =>
    props.lesson
        ? isStudentRatingSelectableScheduleLesson(props.lesson, true)
        : false,
);
</script>

<template>
    <UiDialog :open="lesson !== null" @update:open="!$event && emit('close')">
        <UiDialogContent v-if="lesson" class="sm:max-w-md">
            <UiDialogHeader>
                <UiDialogTitle>Szczegóły jazdy</UiDialogTitle>
                <UiDialogDescription>
                    Informacje o wybranej jeździe praktycznej.
                </UiDialogDescription>
            </UiDialogHeader>

            <dl class="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
                <dt class="text-muted-foreground">Data</dt>
                <dd class="font-medium">
                    {{
                        formatStudentScheduleDateLabel(
                            getStudentScheduleDateKeyFromIso(lesson.startTime),
                        )
                    }}
                </dd>
                <dt class="text-muted-foreground">Godzina</dt>
                <dd class="font-medium tabular-nums">
                    {{ displayStudentScheduleTimeRange(lesson) }}
                </dd>
                <dt class="text-muted-foreground">Status</dt>
                <dd class="font-medium">
                    {{ getStudentScheduleStatusLabel(lesson.status) }}
                </dd>
                <template v-if="lesson.instructor">
                    <dt class="text-muted-foreground">Instruktor</dt>
                    <dd class="font-medium">
                        {{ lesson.instructor.firstName }}
                        {{ lesson.instructor.lastName }}
                    </dd>
                </template>
                <template v-if="lesson.vehicle">
                    <dt class="text-muted-foreground">Pojazd</dt>
                    <dd class="font-medium">
                        {{ lesson.vehicle.name }}
                        ({{ lesson.vehicle.registrationNumber }})
                    </dd>
                </template>
                <template v-if="lesson.categoryCode">
                    <dt class="text-muted-foreground">Kategoria</dt>
                    <dd class="font-medium">{{ lesson.categoryCode }}</dd>
                </template>
            </dl>

            <UiDialogFooter>
                <UiButton
                    type="button"
                    variant="outline"
                    @click="emit('close')"
                >
                    Zamknij
                </UiButton>
                <UiButton
                    v-if="canRate"
                    type="button"
                    @click="emit('rate', lesson)"
                >
                    Przejdź do oceny
                </UiButton>
                <UiButton
                    v-if="canCancel"
                    type="button"
                    variant="destructive"
                    @click="emit('cancel', lesson)"
                >
                    Anuluj rezerwację
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
