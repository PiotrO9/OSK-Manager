<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { formatLessonRatingValue } from '~/utils/lessons/myReviews';
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
        ? isStudentRatingSelectableScheduleLesson(props.lesson, true) &&
          !props.lesson.rating
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

            <section
                v-if="lesson.rating"
                class="border-border flex flex-col gap-2 border-t pt-4"
                aria-label="Opinia o jeździe"
            >
                <div class="flex items-center justify-between gap-3">
                    <h3 class="text-sm font-semibold">Twoja ocena</h3>
                    <UiBadge variant="secondary">
                        {{ formatLessonRatingValue(lesson.rating.rating) }} na 5
                    </UiBadge>
                </div>
                <p
                    class="text-muted-foreground text-sm break-words whitespace-pre-wrap"
                >
                    {{ lesson.rating.comment?.trim() || 'Brak komentarza.' }}
                </p>
            </section>

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
