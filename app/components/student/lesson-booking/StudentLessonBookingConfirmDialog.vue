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
    slot: SchoolAvailabilitySlot | null;
    course: CurrentUserCourseItem | null;
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    confirm: [];
    cancel: [];
}>();

function handleCancel(): void {
    emit('cancel');
}

function handleConfirm(): void {
    emit('confirm');
}

function handleOpenChange(value: boolean): void {
    emit('update:open', value);

    if (!value) {
        handleCancel();
    }
}

const dateLabel = computed(() => {
    if (!props.slot) {
        return '';
    }

    return formatStudentLessonBookingDateLabel(props.slot.date);
});

const durationLabel = computed(() => {
    if (!props.slot) {
        return '';
    }

    const hours = getStudentLessonBookingSlotDurationHours(props.slot);

    if (hours <= 0) {
        return '';
    }

    return `${hours} godz.`;
});
</script>

<template>
    <UiDialog :open="props.open" @update:open="handleOpenChange">
        <UiDialogContent class="max-w-md gap-0 p-0">
            <UiDialogHeader class="border-border space-y-2 border-b p-5">
                <UiDialogTitle>Potwierdź rezerwację jazdy</UiDialogTitle>
                <UiDialogDescription id="student-booking-confirm-description">
                    Sprawdź szczegóły terminu. Pojazd zostanie dobrany
                    automatycznie przez szkołę.
                </UiDialogDescription>
            </UiDialogHeader>

            <div
                v-if="slot && course"
                class="space-y-4 p-5"
                aria-describedby="student-booking-confirm-description"
            >
                <dl class="space-y-3 text-sm">
                    <div class="flex flex-col gap-0.5">
                        <dt class="text-muted-foreground">Kurs</dt>
                        <dd class="font-semibold">{{ course.name }}</dd>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <dt class="text-muted-foreground">Termin</dt>
                        <dd class="font-semibold capitalize">{{ dateLabel }}</dd>
                        <dd class="tabular-nums">
                            {{ slot.startTime }} – {{ slot.endTime }}
                            <span v-if="durationLabel" class="text-muted-foreground">
                                ({{ durationLabel }})
                            </span>
                        </dd>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <dt class="text-muted-foreground">Instruktor</dt>
                        <dd class="font-semibold">
                            {{ getStudentLessonBookingInstructorName(slot) }}
                        </dd>
                    </div>
                </dl>
            </div>

            <UiDialogFooter class="border-border gap-2 border-t p-4 sm:justify-end">
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
                    :disabled="isSubmitting || !slot"
                    :aria-busy="isSubmitting"
                    @click="handleConfirm"
                >
                    {{ isSubmitting ? 'Rezerwowanie…' : 'Zarezerwuj jazdę' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
