<script setup lang="ts">
import type { CourseListItem } from '~/types/courses/course';
import type { LessonBookingSlotContext } from '~/types/lessons/lessonBooking';

const props = defineProps<{
    slotCtx: LessonBookingSlotContext | null;
    schoolCourses: readonly CourseListItem[];
}>();

const emit = defineEmits<{
    booked: [];
}>();

const open = defineModel<boolean>('open', { required: true });
const DESCRIPTION_ID = 'lesson-booking-dialog-desc';

const {
    students,
    vehicles,
    selectedInstructorId,
    selectedStudentUserId,
    selectedCourseId,
    selectedVehicleId,
    formError,
    loadCoursesError,
    isLoadingModalData,
    isCreating,
    loadModalError,
    filteredCourses,
    filteredAvailableInstructors,
    instructorLabel,
    slotWhenLabel,
    handleClose,
    handleSubmit,
} = useManagerLessonBookingDialog({
    open,
    slotCtx: toRef(props, 'slotCtx'),
    schoolCourses: toRef(props, 'schoolCourses'),
    emitBooked: () => emit('booked'),
});
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="!isCreating"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Rezerwuj lekcję</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Utworzenie jazdy praktycznej przez
                    <span class="font-mono">POST /api/lessons</span>. Wybierz
                    kursanta, kurs praktyczny lub dodatkowy oraz pojazd. Lekcji
                    teoretycznych nie planuje się w tym oknie — są grupowe.
                </UiDialogDescription>
            </UiDialogHeader>

            <ManagerLessonBookingSlotSummary
                v-if="slotCtx"
                :slot-ctx="slotCtx"
                :available-instructors="filteredAvailableInstructors"
                :instructor-label="instructorLabel"
                :slot-when-label="slotWhenLabel"
            />

            <div
                v-if="isLoadingModalData"
                class="space-y-2"
                role="status"
                aria-live="polite"
            >
                <UiSkeleton class="h-9 w-full" />
                <UiSkeleton class="h-9 w-full" />
                <UiSkeleton class="h-9 w-full" />
            </div>

            <p
                v-else-if="loadModalError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ loadModalError }}
            </p>

            <form
                v-else-if="slotCtx"
                class="space-y-4"
                aria-label="Formularz rezerwacji lekcji"
                :aria-busy="isCreating"
                @submit.prevent="handleSubmit"
            >
                <ManagerLessonBookingInstructorSelect
                    v-if="filteredAvailableInstructors.length > 1"
                    v-model:selected-instructor-id="selectedInstructorId"
                    :instructors="filteredAvailableInstructors"
                    :disabled="isCreating"
                />

                <p
                    class="border-primary/30 bg-primary/5 text-primary rounded-md border px-3 py-2 text-xs"
                    role="note"
                >
                    Ta rezerwacja dotyczy wyłącznie jazdy praktycznej — lekcja
                    zostanie zaliczona do kursu praktycznego lub dodatkowego
                    kursanta.
                </p>

                <ManagerLessonBookingStudentCourseSelect
                    v-model:selected-student-user-id="selectedStudentUserId"
                    v-model:selected-course-id="selectedCourseId"
                    :students="students"
                    :filtered-courses="filteredCourses"
                    :load-courses-error="loadCoursesError"
                    :disabled="isCreating"
                />

                <ManagerLessonBookingVehicleSelect
                    v-model:selected-vehicle-id="selectedVehicleId"
                    :vehicles="vehicles"
                    :disabled="isCreating"
                />

                <p
                    v-if="formError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ formError }}
                </p>

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isCreating"
                        @click="handleClose"
                    >
                        Anuluj
                    </UiButton>
                    <UiButton type="submit" :disabled="isCreating">
                        {{ isCreating ? 'Zapisywanie…' : 'Zarezerwuj lekcję' }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
