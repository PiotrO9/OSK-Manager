<script setup lang="ts">
import {
    designSystemStudentProfile,
    designSystemProcessSteps,
    designSystemPayments,
    buildDesignSystemPaymentsSummary,
    designSystemReferenceDate,
} from '~/data/design-system/fixtures';
import { buildDesignSystemScheduleItems } from '~/data/design-system/scheduleDemo';
import {
    getMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
const scenario = shallowRef('data');
const weekStart = shallowRef(getMonday(new Date(2026, 8, 7)));
const range = computed(() => weekRangeFromMonday(weekStart.value));
const scheduleItems = computed(() =>
    scenario.value === 'empty'
        ? []
        : buildDesignSystemScheduleItems(weekStart.value)
              .filter((item) => item.student)
              .slice(0, 2)
              .map((item) => ({
                  ...item,
                  student: {
                      id: designSystemStudentProfile.id,
                      firstName: designSystemStudentProfile.firstName,
                      lastName: designSystemStudentProfile.lastName,
                  },
              })),
);
const isLoading = computed(() => scenario.value === 'loading');
const error = computed(() =>
    scenario.value === 'error' ? 'Nie udało się pobrać danych.' : null,
);
const payments = computed(() =>
    scenario.value === 'empty' ? [] : designSystemPayments,
);
const paymentPlans = computed(() =>
    scenario.value === 'empty'
        ? []
        : designSystemPayments.map((payment) => ({
              id: payment.paymentPlanId,
              courseId: payment.courseId,
              courseName: payment.courseName,
              currency: payment.currency,
          })),
);
const paymentsSummary = computed(() =>
    buildDesignSystemPaymentsSummary(payments.value),
);
const student = computed(() =>
    scenario.value === 'empty'
        ? { ...designSystemStudentProfile, courses: [] }
        : designSystemStudentProfile,
);

function moveWeek(days: number) {
    weekStart.value = new Date(
        weekStart.value.getFullYear(),
        weekStart.value.getMonth(),
        weekStart.value.getDate() + days,
    );
}
</script>
<template>
    <div class="space-y-5">
        <DesignSystemScenarioControls
            v-model="scenario"
            label="Scenariusz kartoteki"
            :scenarios="['data', 'empty', 'loading', 'error']"
        />
        <ManagerStudentDetailsContent
            :student="student"
            school-id="design-system"
            student-display-name="Anna Kowalska"
            student-initials="AK"
            student-subtitle="Kursantka · kat. B"
            back-to-list-href="#patterns"
            :process-status-steps="
                scenario === 'empty' ? [] : designSystemProcessSteps
            "
            :process-status-loading="isLoading"
            :process-status-error="error"
            :payments="payments"
            :payment-plans="paymentPlans"
            :payments-summary="paymentsSummary"
            :payments-loading="isLoading"
            :payments-error="error"
            :payments-reference-date="designSystemReferenceDate"
            :payments-saving="false"
            :payments-action-error="null"
            :schedule-week-start="weekStart"
            :schedule-items="scheduleItems"
            :schedule-loading="isLoading"
            :schedule-error="error"
            :student-schedule-range="range"
            @prev-schedule-week="moveWeek(-7)"
            @next-schedule-week="moveWeek(7)"
        >
            <template #header-actions
                ><UiButton variant="outline"
                    >Lista kursantów</UiButton
                ></template
            >
            <template #notes
                ><ManagerStudentNotesContent
                    :notes="designSystemStudentProfile.notes"
                    school-id="design-system"
            /></template>
        </ManagerStudentDetailsContent>
    </div>
</template>
