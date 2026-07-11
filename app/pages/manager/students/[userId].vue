<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const {
    student,
    isLoading,
    errorMessage,
    schoolId,
    processStatusSteps,
    processStatusLoading,
    processStatusError,
    payments,
    paymentsSummary,
    paymentsLoading,
    paymentsError,
    paymentsSaving,
    paymentsActionError,
    studentDisplayName,
    studentInitials,
    studentSubtitle,
    processOverviewLabel,
    notesOverviewLabel,
    paymentsOverviewLabel,
    scheduleOverviewLabel,
    backToListHref,
    scheduleWeekStart,
    scheduleItems,
    scheduleLoading,
    scheduleError,
    studentScheduleRange,
    handleStudentNotesUpdate,
    handlePrevScheduleWeek,
    handleNextScheduleWeek,
    handleCreateStudentPayment,
    handleUpdateStudentPayment,
    handleMarkStudentPaymentPaid,
    handleMarkStudentPaymentUnpaid,
} = useManagerStudentDetailsPage();
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            :title="studentDisplayName"
            description="Profil kursanta, status procesu, płatności i najbliższe jazdy."
        >
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="backToListHref"
                        aria-label="Wróć do listy kursantów"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista kursantów
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div v-if="isLoading" class="space-y-4" role="status">
            <UiSkeleton class="h-28 rounded-2xl" />
            <UiSkeleton class="h-56 rounded-2xl" />
        </div>

        <ErrorState
            v-else-if="errorMessage"
            title="Nie udało się wczytać kursanta"
            :description="errorMessage"
        />

        <template v-else-if="student !== null">
            <div class="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <ManagerStudentProfileCard
                    :initials="studentInitials"
                    :display-name="studentDisplayName"
                    :subtitle="studentSubtitle"
                    :email="student.email"
                    :pkk-number="student.pkkNumber"
                    :courses-count="student.courses.length"
                />

                <ManagerStudentOverviewCard
                    :process-label="processOverviewLabel"
                    :notes-label="notesOverviewLabel"
                    :payments-label="paymentsOverviewLabel"
                    :schedule-label="scheduleOverviewLabel"
                />
            </div>

            <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <ManagerStudentProcessStatus
                    class="min-w-0"
                    :steps="processStatusSteps"
                    :is-loading="processStatusLoading"
                    :error="processStatusError"
                />

                <ManagerStudentNotes
                    class="min-w-0"
                    :user-id="student.userId"
                    :school-id="schoolId"
                    :initial-notes="student.notes"
                    @update:notes="handleStudentNotesUpdate"
                />

                <ManagerStudentScheduleSection
                    :date-from="studentScheduleRange.dateFrom"
                    :date-to="studentScheduleRange.dateTo"
                    :week-start="scheduleWeekStart"
                    :items="scheduleItems"
                    :is-loading="scheduleLoading"
                    :error="scheduleError"
                    @prev-week="handlePrevScheduleWeek"
                    @next-week="handleNextScheduleWeek"
                />

                <ManagerStudentPaymentsSection
                    :payments="payments"
                    :summary="paymentsSummary"
                    :is-loading="paymentsLoading"
                    :error="paymentsError"
                    :is-saving="paymentsSaving"
                    :action-error="paymentsActionError"
                    @create="handleCreateStudentPayment"
                    @update="handleUpdateStudentPayment"
                    @mark-paid="handleMarkStudentPaymentPaid"
                    @mark-unpaid="handleMarkStudentPaymentUnpaid"
                />

                <ManagerStudentCoursesSection :courses="student.courses" />
            </div>
        </template>
    </div>
</template>
