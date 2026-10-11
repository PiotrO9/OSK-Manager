<script setup lang="ts">
import type { CourseListItem } from '~/types/courses/course';
import type { LessonBookingSlotContext } from '~/types/lessons/lessonBooking';

const props = defineProps<{
    slotCtx: LessonBookingSlotContext | null;
    schoolCourses: readonly CourseListItem[];
    showBack?: boolean;
}>();

const emit = defineEmits<{
    booked: [];
    back: [];
}>();

const open = defineModel<boolean>('open', { required: true });
const DESCRIPTION_ID = 'lesson-booking-dialog-desc';

const {
    students,
    studentSearch,
    studentPage,
    studentTotalPages,
    isLoadingStudents,
    studentsError,
    loadMoreStudents,
    vehicles,
    availableVehicleIds,
    selectedInstructorId,
    isInstructorFixed,
    bookingInstructorId,
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
    defaultInstructorId,
    instructorOptionsStatus,
    instructorOptionsMessage,
    reloadInstructorOptions,
    instructorLabel,
    slotWhenLabel,
    lessonAvailabilityStatus,
    lessonAvailabilityMessage,
    handleClose,
    handleSubmit,
} = useManagerLessonBookingDialog({
    open,
    slotCtx: toRef(props, 'slotCtx'),
    schoolCourses: toRef(props, 'schoolCourses'),
    emitBooked: () => emit('booked'),
});

function handleBack(): void {
    handleClose();
    emit('back');
}
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="!isCreating"
            :close-on-outside-click="!isCreating"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Rezerwuj lekcję</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    {{
                        isInstructorFixed
                            ? 'Wybierz kursanta, kurs praktyczny lub dodatkowy i pojazd, aby zarezerwować jazdę.'
                            : 'Wybierz kursanta, kurs praktyczny lub dodatkowy, pojazd i instruktora, aby zarezerwować jazdę.'
                    }}
                    Lekcje teoretyczne planuje się osobno.
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
                <p
                    class="border-primary/30 bg-primary/5 text-primary rounded-md border px-3 py-2 text-xs"
                    role="note"
                >
                    Ta rezerwacja dotyczy wyłącznie jazdy praktycznej — lekcja
                    zostanie zaliczona do kursu praktycznego lub dodatkowego
                    kursanta.
                </p>

                <ManagerLessonBookingStudentCourseSelect
                    v-model:student-search="studentSearch"
                    v-model:selected-student-user-id="selectedStudentUserId"
                    v-model:selected-course-id="selectedCourseId"
                    :students="students"
                    :is-loading-students="isLoadingStudents"
                    :students-error="studentsError"
                    :has-more-students="studentPage < studentTotalPages"
                    :filtered-courses="filteredCourses"
                    :load-courses-error="loadCoursesError"
                    :disabled="isCreating"
                    @load-more="loadMoreStudents"
                />

                <ManagerLessonBookingVehicleSelect
                    v-model:selected-vehicle-id="selectedVehicleId"
                    :vehicles="vehicles"
                    :available-vehicle-ids="availableVehicleIds"
                    :disabled="isCreating"
                />

                <ManagerLessonBookingInstructorSelect
                    v-if="!isInstructorFixed"
                    v-model:selected-instructor-id="selectedInstructorId"
                    :instructors="filteredAvailableInstructors"
                    :default-instructor-id="defaultInstructorId"
                    :disabled="
                        isCreating ||
                        instructorOptionsStatus !== 'success' ||
                        !filteredAvailableInstructors.length
                    "
                />

                <p
                    v-if="!isInstructorFixed && instructorOptionsMessage"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    {{ instructorOptionsMessage }}
                </p>
                <UiButton
                    v-if="
                        !isInstructorFixed &&
                        instructorOptionsStatus === 'error'
                    "
                    type="button"
                    variant="outline"
                    :disabled="isCreating"
                    @click="reloadInstructorOptions()"
                >
                    Sprawdź instruktorów ponownie
                </UiButton>

                <p
                    v-if="lessonAvailabilityStatus !== 'idle'"
                    :class="[
                        'text-sm',
                        lessonAvailabilityStatus === 'unavailable'
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                    ]"
                    :role="
                        lessonAvailabilityStatus === 'unavailable'
                            ? 'alert'
                            : 'status'
                    "
                >
                    {{ lessonAvailabilityMessage }}
                </p>

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
                        @click="props.showBack ? handleBack() : handleClose()"
                    >
                        {{ props.showBack ? 'Wstecz' : 'Anuluj' }}
                    </UiButton>
                    <UiButton
                        type="submit"
                        :disabled="
                            isCreating ||
                            !bookingInstructorId ||
                            !selectedStudentUserId ||
                            !selectedCourseId ||
                            !selectedVehicleId ||
                            (!isInstructorFixed &&
                                instructorOptionsStatus !== 'success') ||
                            lessonAvailabilityStatus === 'checking' ||
                            lessonAvailabilityStatus === 'unavailable'
                        "
                    >
                        {{ isCreating ? 'Zapisywanie…' : 'Zarezerwuj lekcję' }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
