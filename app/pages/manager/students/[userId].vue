<script setup lang="ts">
import ManagerStudentDetailsContent from '~/components/manager/students/ManagerStudentDetailsContent.vue';

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
    <div class="space-y-6">
        <LoadingState
            v-if="isLoading"
            title="Wczytywanie kursanta"
            description="Pobieram profil, proces, płatności i terminarz."
        />

        <ErrorState
            v-else-if="errorMessage"
            title="Nie udało się wczytać kursanta"
            :description="errorMessage"
        />

        <ManagerStudentDetailsContent
            v-else-if="student !== null"
            :student="student"
            :school-id="schoolId"
            :student-display-name="studentDisplayName"
            :student-initials="studentInitials"
            :student-subtitle="studentSubtitle"
            :back-to-list-href="backToListHref"
            :process-status-steps="processStatusSteps"
            :process-status-loading="processStatusLoading"
            :process-status-error="processStatusError"
            :payments="payments"
            :payments-summary="paymentsSummary"
            :payments-loading="paymentsLoading"
            :payments-error="paymentsError"
            :payments-saving="paymentsSaving"
            :payments-action-error="paymentsActionError"
            :schedule-week-start="scheduleWeekStart"
            :schedule-items="scheduleItems"
            :schedule-loading="scheduleLoading"
            :schedule-error="scheduleError"
            :student-schedule-range="studentScheduleRange"
            @update-notes="handleStudentNotesUpdate"
            @prev-schedule-week="handlePrevScheduleWeek"
            @next-schedule-week="handleNextScheduleWeek"
            @create-payment="handleCreateStudentPayment"
            @update-payment="handleUpdateStudentPayment"
            @mark-payment-paid="handleMarkStudentPaymentPaid"
            @mark-payment-unpaid="handleMarkStudentPaymentUnpaid"
        />
    </div>
</template>
