<script setup lang="ts">
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import type { CurrentUserCourseItem } from '~/types/courses/course';
import {
    getStudentLessonBookingInstructorName,
    getStudentLessonBookingSlotDurationHours,
} from '~/utils/student/studentLessonBookingPage';
import { formatStudentLessonBookingDateLabel } from '~/composables/student/lesson-booking/useStudentLessonBookingSlotList';

const props = defineProps<{
    open: boolean;
    bookingSlot: SchoolAvailabilitySlot | null;
    course: CurrentUserCourseItem | null;
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    confirm: [];
    cancel: [];
}>();

function handleCancel(): void {
    if (props.isSubmitting) {
        return;
    }

    emit('cancel');
}

function handleConfirm(): void {
    emit('confirm');
}

function handleOpenChange(value: boolean): void {
    if (!value && props.isSubmitting) {
        return;
    }

    emit('update:open', value);
}

const dateLabel = computed(() => {
    if (!props.bookingSlot) {
        return '';
    }

    return formatStudentLessonBookingDateLabel(props.bookingSlot.date);
});

const durationLabel = computed(() => {
    if (!props.bookingSlot) {
        return '';
    }

    const hours = getStudentLessonBookingSlotDurationHours(props.bookingSlot);

    if (hours <= 0) {
        return '';
    }

    return `${hours} godz.`;
});
</script>

<template>
    <UiDialog :open="props.open" @update:open="handleOpenChange">
        <UiDialogContent
            class="max-w-md gap-0 p-0"
            :show-close-button="!isSubmitting"
            :close-on-outside-click="!isSubmitting"
            @escape-key-down="isSubmitting && $event.preventDefault()"
        >
            <UiDialogHeader class="border-border space-y-2 border-b p-5">
                <UiDialogTitle>Potwierdź rezerwację jazdy</UiDialogTitle>
                <UiDialogDescription class="sr-only">
                    Potwierdź szczegóły wybranego terminu jazdy.
                </UiDialogDescription>
            </UiDialogHeader>

            <div v-if="bookingSlot && course" class="space-y-4 p-5">
                <dl class="space-y-3 text-sm">
                    <div class="flex flex-col gap-0.5">
                        <dt class="text-muted-foreground">Kurs</dt>
                        <dd class="font-semibold">{{ course.name }}</dd>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <dt class="text-muted-foreground">Termin</dt>
                        <dd class="font-semibold">{{ dateLabel }}</dd>
                        <dd class="tabular-nums">
                            {{ bookingSlot.startTime }} –
                            {{ bookingSlot.endTime }}
                            <span
                                v-if="durationLabel"
                                class="text-muted-foreground"
                            >
                                ({{ durationLabel }})
                            </span>
                        </dd>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <dt class="text-muted-foreground">Instruktor</dt>
                        <dd class="font-semibold">
                            {{
                                getStudentLessonBookingInstructorName(
                                    bookingSlot,
                                )
                            }}
                        </dd>
                    </div>
                </dl>
            </div>

            <UiDialogFooter
                class="border-border gap-2 border-t p-4 sm:justify-end"
            >
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isSubmitting"
                    @click="handleCancel"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    type="button"
                    :disabled="isSubmitting || !bookingSlot"
                    :aria-busy="isSubmitting"
                    @click="handleConfirm"
                >
                    {{ isSubmitting ? 'Rezerwowanie…' : 'Zarezerwuj jazdę' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
