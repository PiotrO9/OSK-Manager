<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const router = useRouter();
const isEventFormOpen = ref(false);

usePageMeta({
    title: () => 'Terminarz instruktora',
    description: () => 'Tygodniowy harmonogram jazd, teorii i blokad.',
});

const {
    instructorId,
    schoolId,
    isSchoolContextLoading,
    schoolContextError,
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
    scheduleWeekLabel,
    pendingDeleteTimeLabel,
    loadSchedule,
    handleInstructorEventStatusChanged,
    handleSubmitEvent,
    handleRequestDelete,
    handleDeleteDialogCancel,
    handleDeleteDialogConfirm,
} = useManagerInstructorSchedulePage();

watch(
    () => route.query.schoolId,
    (schoolId) => {
        if (schoolId === undefined) {
            return;
        }

        void router.replace({ path: route.path, query: {} });
    },
    { immediate: true },
);

function handleOpenEventForm(): void {
    isEventFormOpen.value = true;
}

function handleScheduleWeekStartChanged(value: Date): void {
    weekStart.value = value;
}

async function handleSubmitEventFromSheet(): Promise<void> {
    const wasSaved = await handleSubmitEvent();

    if (wasSaved) {
        isEventFormOpen.value = false;
    }
}
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
                    @click="handleOpenEventForm"
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
            <ErrorState
                v-if="schoolContextError"
                title="Nie udało się ustalić szkoły instruktora"
                :description="schoolContextError"
            />

            <ManagerInstructorScheduleWeekSection
                :week-start="weekStart"
                :is-schedule-loading="isScheduleLoading"
                :schedule-error="scheduleError"
                :items="items"
                :school-id="schoolId"
                @week-start-changed="handleScheduleWeekStartChanged"
                @refresh="loadSchedule"
                @request-delete="handleRequestDelete"
                @status-changed="handleInstructorEventStatusChanged"
            />

            <UiSheet v-model:open="isEventFormOpen">
                <UiSheetContent
                    class="w-[min(100vw,34rem)] gap-0 overflow-y-auto p-0 sm:max-w-xl"
                >
                    <UiSheetHeader
                        class="border-border border-b px-5 py-4 pr-12 text-left"
                    >
                        <UiSheetTitle>Dodaj blok czasu</UiSheetTitle>
                        <UiSheetDescription>
                            Rezerwacja czasu instruktora dla teorii albo jazdy.
                        </UiSheetDescription>
                    </UiSheetHeader>

                    <div class="p-4 sm:p-5">
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
                            :is-vehicles-loading="
                                isVehiclesLoading || isSchoolContextLoading
                            "
                            :is-event-saving="isEventSaving"
                            :event-form-error="eventFormError"
                            @submit="handleSubmitEventFromSheet"
                        />
                    </div>
                </UiSheetContent>
            </UiSheet>
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
