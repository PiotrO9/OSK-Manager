<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['student'],
});

usePageMeta({
    title: () => 'Rezerwuj jazdÄ™',
    description: () => 'Samodzielna rezerwacja jazdy praktycznej.',
});

const {
    selectedCourseId,
    slots,
    isCoursesLoading,
    coursesErrorMessage,
    slotsErrorMessage,
    bookingSlotKey,
    successMessage,
    isSlotsLoading,
    bookableCourses,
    selectedCourse,
    weekRange,
    weekLabel,
    weekShortLabel,
    selectedCourseProgressLabel,
    selectedCourseTypeLabel,
    availableSlotsLabel,
    loadCourses,
    handlePrevWeek,
    handleNextWeek,
    handleBookSlot,
} = useStudentLessonBookingPage();
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Rezerwacja jazdy"
            description="Wybierz kurs, sprawdĹş dostÄ™pnoĹ›Ä‡ i zarezerwuj pasujÄ…cy slot."
        >
            <template #actions>
                <UiBadge
                    variant="outline"
                    class="bg-background h-10 rounded-xl px-4 text-sm font-semibold shadow-sm"
                >
                    <CalendarDays class="mr-2 size-4" aria-hidden="true" />
                    {{ weekShortLabel }}
                </UiBadge>
            </template>
        </PageHeader>

        <div
            class="grid gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.72fr)]"
        >
            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader class="border-border border-b p-5 pt-0">
                    <UiCardTitle class="text-xl font-extrabold">
                        DostÄ™pne terminy
                    </UiCardTitle>
                    <UiCardDescription>
                        Sloty zgodne z kursem i filtrami kursanta.
                    </UiCardDescription>
                </UiCardHeader>

                <UiCardContent class="space-y-4 px-4 py-0">
                    <ErrorState
                        v-if="coursesErrorMessage"
                        title="Nie udaĹ‚o siÄ™ wczytaÄ‡ kursĂłw"
                        :description="coursesErrorMessage"
                        @retry="loadCourses"
                    />

                    <StudentLessonBookingCourseSelect
                        v-model="selectedCourseId"
                        :courses="bookableCourses"
                        :is-loading="isCoursesLoading"
                        :disabled="bookingSlotKey !== null"
                    />

                    <StudentLessonBookingWeekNav
                        :label="weekLabel"
                        :disabled="bookingSlotKey !== null"
                        @prev="handlePrevWeek"
                        @next="handleNextWeek"
                    />

                    <StudentLessonBookingSlotList
                        :slots="slots"
                        :is-loading="isSlotsLoading"
                        :error-message="slotsErrorMessage"
                        :selected-course-id="selectedCourseId"
                        :booking-slot-key="bookingSlotKey"
                        :week-start-date="weekRange.dateFrom"
                        @book="handleBookSlot"
                    />
                </UiCardContent>
            </UiCard>

            <StudentLessonBookingSelectedCourseSummary
                :selected-course="selectedCourse"
                :selected-course-type-label="selectedCourseTypeLabel"
                :selected-course-progress-label="selectedCourseProgressLabel"
                :week-label="weekLabel"
                :available-slots-label="availableSlotsLabel"
                :success-message="successMessage"
            />
        </div>
    </div>
</template>
