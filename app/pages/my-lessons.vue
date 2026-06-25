<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';

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
                    <div
                        class="border-border bg-background flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold shadow-xs"
                        :aria-label="`Zakres dat ${myLessons.dateRangeLabel.value}`"
                    >
                        <CalendarDays
                            class="text-muted-foreground size-4"
                            aria-hidden="true"
                        />
                        <span>{{ myLessons.dateRangeLabel.value }}</span>
                    </div>
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

        <div
            class="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
        >
            <MyLessonsSchedulePanel
                v-model:schedule-view="myLessons.scheduleView.value"
                v-model:week-start="myLessons.weekStart.value"
                :cancelling-lesson-id="myLessons.cancellingLessonId.value"
                :error-message="myLessons.errorMessage.value"
                :is-loading="myLessons.isLoading.value"
                :is-student="myLessons.isStudent.value"
                :items="myLessons.items.value"
                :page-description="myLessons.pageDescription.value"
                @lesson-selected="myLessons.handleRatingLessonSelected"
                @next-week="myLessons.handleNextWeek"
                @previous-week="myLessons.handlePrevWeek"
                @request-cancel-lesson="myLessons.handleCancelLessonRequested"
            />

            <MyLessonsSummaryPanel
                :summary-items="myLessons.summaryItems.value"
            />
        </div>

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
