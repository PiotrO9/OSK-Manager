<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['student'],
});

usePageMeta({
    title: () => 'Rezerwuj jazdę',
    description: () => 'Samodzielna rezerwacja jazdy praktycznej.',
});

const page = useStudentLessonBookingPage();
</script>

<template>
    <div class="w-full min-w-0 space-y-5 md:space-y-6">
        <PageHeader
            title="Rezerwacja jazdy"
            description="Wybierz kurs, sprawdź wolne terminy i zarezerwuj jazdę praktyczną."
        />

        <ErrorState
            v-if="page.coursesErrorMessage.value"
            title="Nie udało się wczytać kursów"
            :description="page.coursesErrorMessage.value"
            @retry="page.loadCourses"
        />

        <template v-else>
            <StudentLessonBookingCourseSelect
                v-if="
                    page.isCoursesLoading.value ||
                    page.bookableCourses.value.length > 0
                "
                v-model="page.selectedCourseId.value"
                :courses="page.bookableCourses.value"
                :is-loading="page.isCoursesLoading.value"
                :disabled="page.bookingSlotKey.value !== null"
            />

            <EmptyState
                v-else
                :title="page.noBookableCoursesState.value.title"
                :description="page.noBookableCoursesState.value.description"
            >
                <template #action>
                    <UiButton as-child variant="outline" size="sm">
                        <NuxtLink to="/my-courses"
                            >Przejdź do moich kursów</NuxtLink
                        >
                    </UiButton>
                </template>
            </EmptyState>

            <StudentLessonBookingFeedbackBanner
                v-if="page.bookingFeedbackMessage.value"
                :message="page.bookingFeedbackMessage.value"
                :tone="page.bookingFeedbackTone.value"
            />

            <template v-if="page.selectedCourse.value">
                <StudentLessonBookingSelectedCourseSummary
                    :selected-course="page.selectedCourse.value"
                    :selected-course-type-label="
                        page.selectedCourseTypeLabel.value
                    "
                    :remaining-course-hours="page.remainingCourseHours.value"
                />

                <StudentLessonBookingSchedulePanel
                    :slots="page.slots.value"
                    :week-start="page.weekStart.value"
                    :is-loading="page.isSlotsLoading.value"
                    :error-message="page.slotsErrorMessage.value"
                    :selected-course-id="page.selectedCourseId.value"
                    :booking-slot-key="page.bookingSlotKey.value"
                    :is-week-beyond-booking-window="
                        page.isWeekBeyondBookingWindow.value
                    "
                    :week-range-compact-label="page.weekShortLabel.value"
                    :calendar-selected="page.calendarSelected.value"
                    :calendar-open="page.isCalendarOpen.value"
                    :is-prev-week-disabled="page.isPrevWeekDisabled.value"
                    :is-next-week-disabled="page.isNextWeekDisabled.value"
                    :calendar-min="page.WEEK_PICKER_CALENDAR_MIN"
                    :calendar-max="page.WEEK_PICKER_CALENDAR_MAX"
                    :truncated-label="page.slotsTruncatedLabel.value"
                    :available-slots-label="page.availableSlotsLabel.value"
                    :remaining-course-hours="page.remainingCourseHours.value"
                    @retry="page.loadSlots"
                    @book="page.handleRequestBookSlot"
                    @prev-week="page.handlePrevWeek"
                    @next-week="page.handleNextWeek"
                    @calendar-update="page.handleCalendarUpdate"
                    @key-down-week-nav="page.handleKeyDownWeekNav"
                    @update:calendar-open="
                        (value) => {
                            page.isCalendarOpen.value = value;
                        }
                    "
                />
            </template>
        </template>

        <StudentLessonBookingConfirmDialog
            :open="page.isConfirmDialogOpen.value"
            :booking-slot="page.pendingConfirmationSlot.value"
            :course="page.selectedCourse.value"
            :is-submitting="page.bookingSlotKey.value !== null"
            @update:open="(value) => !value && page.handleCloseConfirmDialog()"
            @confirm="page.handleConfirmBookSlot"
            @cancel="page.handleCloseConfirmDialog"
        />
    </div>
</template>
