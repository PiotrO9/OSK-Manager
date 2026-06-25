<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Terminarz instruktora',
    description: () => 'Tygodniowy harmonogram jazd, teorii i blokad.',
});

const {
    instructorId,
    schoolId,
    weekStart,
    items,
    isScheduleLoading,
    scheduleError,
    vehicles,
    vehiclesError,
    isVehiclesLoading,
    courses,
    coursesError,
    isCoursesLoading,
    eventType,
    eventStartLocal,
    eventEndLocal,
    eventVehicleId,
    eventCourseId,
    eventFormError,
    deleteDialogOpen,
    isEventSaving,
    isEventDeleteLoading,
    scheduleItemsCount,
    lessonItemsCount,
    blockItemsCount,
    scheduleWeekLabel,
    scheduleResultLabel,
    nextScheduledItemLabel,
    pendingDeleteTimeLabel,
    backHref,
    loadSchedule,
    handlePrevWeek,
    handleNextWeek,
    handleInstructorEventStatusChanged,
    handleFocusEventForm,
    handleSubmitEvent,
    handleRequestDelete,
    handleDeleteDialogCancel,
    handleDeleteDialogConfirm,
} = useManagerInstructorSchedulePage();
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Terminarz instruktora"
            description="Tygodniowy harmonogram jazd, teorii i blokad."
        >
            <template #actions>
                <UiButton
                    type="button"
                    variant="outline"
                    class="gap-2"
                    aria-label="Aktualny zakres tygodnia"
                >
                    <CalendarDays class="size-4" aria-hidden="true" />
                    {{ scheduleWeekLabel }}
                </UiButton>
                <UiButton
                    type="button"
                    class="shadow-primary-500/20 gap-2 shadow-lg"
                    @click="handleFocusEventForm"
                >
                    <Plus class="size-4" aria-hidden="true" />
                    Dodaj blok
                </UiButton>
            </template>
        </PageHeader>

        <ErrorState
            v-if="!instructorId"
            title="Nieprawidlowy instruktor"
            description="W adresie brakuje poprawnego identyfikatora instruktora."
        >
            <template #action>
                <UiButton as-child variant="outline" size="sm">
                    <NuxtLink to="/manager/instructors">
                        Wróć do instruktorów
                    </NuxtLink>
                </UiButton>
            </template>
        </ErrorState>

        <template v-else>
            <ManagerInstructorScheduleContextCard
                :school-id="schoolId"
                :schedule-items-count="scheduleItemsCount"
                :lesson-items-count="lessonItemsCount"
                :block-items-count="blockItemsCount"
                :next-scheduled-item-label="nextScheduledItemLabel"
            />

            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                <ManagerInstructorScheduleWeekSection
                    :week-start="weekStart"
                    :schedule-week-label="scheduleWeekLabel"
                    :schedule-result-label="scheduleResultLabel"
                    :is-schedule-loading="isScheduleLoading"
                    :schedule-error="scheduleError"
                    :items="items"
                    :school-id="schoolId"
                    @prev-week="handlePrevWeek"
                    @next-week="handleNextWeek"
                    @refresh="loadSchedule"
                    @request-delete="handleRequestDelete"
                    @status-changed="handleInstructorEventStatusChanged"
                />

                <ManagerInstructorEventFormSection
                    v-model:event-type="eventType"
                    v-model:event-start-local="eventStartLocal"
                    v-model:event-end-local="eventEndLocal"
                    v-model:event-vehicle-id="eventVehicleId"
                    v-model:event-course-id="eventCourseId"
                    :school-id="schoolId"
                    :courses="courses"
                    :courses-error="coursesError"
                    :is-courses-loading="isCoursesLoading"
                    :vehicles="vehicles"
                    :vehicles-error="vehiclesError"
                    :is-vehicles-loading="isVehiclesLoading"
                    :is-event-saving="isEventSaving"
                    :event-form-error="eventFormError"
                    :back-href="backHref"
                    @submit="handleSubmitEvent"
                />
            </div>
        </template>

        <ManagerInstructorEventDeleteDialog
            v-model:open="deleteDialogOpen"
            :time-range-label="pendingDeleteTimeLabel"
            :is-deleting="isEventDeleteLoading"
            @cancel="handleDeleteDialogCancel"
            @confirm="handleDeleteDialogConfirm"
        />
    </div>
</template>
