<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['student-or-instructor'],
});

usePageMeta({
    title: () => 'Moje lekcje',
    description: () => 'Terminarz zaplanowanych lekcji i wydarzen.',
});

const myLessons = useMyLessonsPage();
</script>

<template>
    <div class="flex flex-col gap-6">
        <PageHeader
            title="Moje lekcje"
            :description="myLessons.pageDescription.value"
        >
            <template #actions>
                <div
                    class="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end"
                >
                    <UiButton
                        v-if="myLessons.isStudent.value"
                        as-child
                        class="h-10 shadow-sm shadow-sky-200/60"
                    >
                        <NuxtLink to="/book-lesson">
                            <Plus class="size-4" aria-hidden="true" />
                            Dodaj jazde
                        </NuxtLink>
                    </UiButton>
                </div>
            </template>
        </PageHeader>

        <MyLessonsSchedulePanel
            v-model:schedule-view="myLessons.scheduleView.value"
            v-model:week-start="myLessons.weekStart.value"
            :cancelling-lesson-id="myLessons.cancellingLessonId.value"
            :error-message="myLessons.errorMessage.value"
            :is-loading="myLessons.isLoading.value"
            :is-student="myLessons.isStudent.value"
            :items="myLessons.items.value"
            :saving-event-id="myLessons.savingEventId.value"
            @lesson-selected="myLessons.handleRatingLessonSelected"
            @next-week="myLessons.handleNextWeek"
            @previous-week="myLessons.handlePrevWeek"
            @today="myLessons.handleToday"
            @request-cancel-lesson="myLessons.handleCancelLessonRequested"
            @event-status-change="myLessons.handleEventStatusChange"
        />

        <StudentLessonRatingsPanel
            v-if="myLessons.isStudent.value"
            :items="myLessons.items.value"
            :selected-lesson-id="myLessons.selectedRatingLessonId.value"
            :is-refreshing="myLessons.isRatingRefreshing.value"
            :is-submitting="myLessons.isRatingSubmitting.value"
            :error-message="myLessons.ratingErrorMessage.value"
            @select="myLessons.handleRatingLessonSelected"
            @submit="myLessons.handleRatingSubmit"
        />

        <StudentCancelLessonDialog
            v-model:open="myLessons.isCancelDialogOpen.value"
            :is-cancelling="myLessons.isCancelling.value"
            :pending-cancel-lesson-label="
                myLessons.pendingCancelLessonLabel.value
            "
            @cancel="myLessons.clearPendingCancelLesson"
            @confirm="myLessons.handleConfirmCancelLesson"
        />
    </div>
</template>
