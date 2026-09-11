<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui';
import type { RouteLocationRaw } from 'vue-router';
import type {
    CreateStudentPaymentPayload,
    StudentPaymentItem,
    StudentPaymentsSummary,
    UpdateStudentPaymentPayload,
} from '~/types/payments/payment';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type {
    StudentDetail,
    StudentProcessStatusStep,
} from '~/types/students/student';
import type { ManagerStudentDetailsTab } from '~/composables/students/useManagerStudentDetailsTabs';
import { normalizeManagerStudentDetailsTab } from '~/composables/students/useManagerStudentDetailsTabs';

const props = defineProps<{
    student: StudentDetail;
    schoolId: string;
    studentDisplayName: string;
    studentInitials: string;
    studentSubtitle: string;
    backToListHref: RouteLocationRaw;
    processStatusSteps: readonly StudentProcessStatusStep[];
    processStatusLoading: boolean;
    processStatusError: string | null;
    payments: readonly StudentPaymentItem[];
    paymentsSummary: StudentPaymentsSummary;
    paymentsLoading: boolean;
    paymentsError: string | null;
    paymentsSaving: boolean;
    paymentsActionError: string | null;
    scheduleWeekStart: Date;
    scheduleItems: readonly ScheduleLessonItem[];
    scheduleLoading: boolean;
    scheduleError: string | null;
    studentScheduleRange: {
        dateFrom: string;
        dateTo: string;
    };
}>();

const emit = defineEmits<{
    updateNotes: [value: string | null];
    prevScheduleWeek: [];
    nextScheduleWeek: [];
    createPayment: [payload: CreateStudentPaymentPayload];
    updatePayment: [paymentId: string, payload: UpdateStudentPaymentPayload];
    markPaymentPaid: [paymentId: string];
    markPaymentUnpaid: [paymentId: string];
}>();

const { activeTab, setActiveTab } = useManagerStudentDetailsTabs();
const visitedTabs = reactive<Record<ManagerStudentDetailsTab, boolean>>({
    overview: false,
    lessons: false,
    payments: false,
    courses: false,
});

const tabs: Array<{ value: ManagerStudentDetailsTab; label: string }> = [
    { value: 'overview', label: 'Przegląd' },
    { value: 'lessons', label: 'Lekcje' },
    { value: 'payments', label: 'Płatności' },
    { value: 'courses', label: 'Kursy' },
];

watch(
    () => activeTab.value,
    (tab) => {
        visitedTabs[tab] = true;
    },
    { immediate: true },
);

watch(
    () => [props.student.userId, props.schoolId] as const,
    () => {
        setActiveTab('overview');

        for (const tab of tabs) {
            visitedTabs[tab.value] = tab.value === 'overview';
        }
    },
);

function getTabTriggerId(tab: ManagerStudentDetailsTab): string {
    return `student-details-tab-${tab}`;
}

function getTabPanelId(tab: ManagerStudentDetailsTab): string {
    return `student-details-panel-${tab}`;
}

function isTabVisible(tab: ManagerStudentDetailsTab): boolean {
    return activeTab.value === tab;
}

function handleTabChange(value: string | number): void {
    setActiveTab(normalizeManagerStudentDetailsTab(String(value)));
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader :title="props.studentDisplayName" eyebrow="Kursant">
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="h-10 rounded-lg px-4 font-semibold shadow-xs"
                >
                    <NuxtLink
                        :to="props.backToListHref"
                        aria-label="Wróć do listy kursantów"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista kursantów
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div
            class="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]"
        >
            <aside class="min-w-0 space-y-5 xl:sticky xl:top-6 xl:self-start">
                <ManagerStudentProfileCard
                    :initials="props.studentInitials"
                    :display-name="props.studentDisplayName"
                    :subtitle="props.studentSubtitle"
                    :email="props.student.email"
                    :pkk-number="props.student.pkkNumber"
                    :courses-count="props.student.courses.length"
                    :show-identity="false"
                />

                <ManagerStudentNotes
                    :user-id="props.student.userId"
                    :school-id="props.schoolId"
                    :initial-notes="props.student.notes"
                    @update:notes="emit('updateNotes', $event)"
                />
            </aside>

            <main class="min-w-0">
                <TabsRoot
                    :model-value="activeTab"
                    class="min-w-0 space-y-5"
                    @update:model-value="handleTabChange"
                >
                    <div
                        class="border-border overflow-x-auto border-b"
                        aria-label="Sekcje kartoteki kursanta"
                    >
                        <TabsList class="flex min-w-max gap-5">
                            <TabsTrigger
                                v-for="tab in tabs"
                                :id="getTabTriggerId(tab.value)"
                                :key="tab.value"
                                :value="tab.value"
                                :aria-controls="getTabPanelId(tab.value)"
                                class="text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground focus-visible:ring-ring -mb-px border-b-2 border-transparent px-1 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                {{ tab.label }}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <section
                        v-if="visitedTabs.overview"
                        :id="getTabPanelId('overview')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('overview')"
                        :hidden="!isTabVisible('overview')"
                    >
                        <ManagerStudentOverviewTab
                            :process-status-steps="props.processStatusSteps"
                            :process-status-loading="props.processStatusLoading"
                            :process-status-error="props.processStatusError"
                            :payments-summary="props.paymentsSummary"
                            :payments-loading="props.paymentsLoading"
                            :payments-error="props.paymentsError"
                            :schedule-items="props.scheduleItems"
                            :schedule-loading="props.scheduleLoading"
                            :schedule-error="props.scheduleError"
                            :schedule-date-from="
                                props.studentScheduleRange.dateFrom
                            "
                            :schedule-date-to="
                                props.studentScheduleRange.dateTo
                            "
                            @go-to-lessons="setActiveTab('lessons')"
                            @go-to-payments="setActiveTab('payments')"
                        />
                    </section>

                    <section
                        v-if="visitedTabs.lessons"
                        :id="getTabPanelId('lessons')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('lessons')"
                        :hidden="!isTabVisible('lessons')"
                    >
                        <ManagerStudentScheduleSection
                            :date-from="props.studentScheduleRange.dateFrom"
                            :date-to="props.studentScheduleRange.dateTo"
                            :week-start="props.scheduleWeekStart"
                            :items="props.scheduleItems"
                            :is-loading="props.scheduleLoading"
                            :error="props.scheduleError"
                            @prev-week="emit('prevScheduleWeek')"
                            @next-week="emit('nextScheduleWeek')"
                        />
                    </section>

                    <section
                        v-if="visitedTabs.payments"
                        :id="getTabPanelId('payments')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('payments')"
                        :hidden="!isTabVisible('payments')"
                    >
                        <ManagerStudentPaymentsSection
                            :payments="props.payments"
                            :summary="props.paymentsSummary"
                            :is-loading="props.paymentsLoading"
                            :error="props.paymentsError"
                            :is-saving="props.paymentsSaving"
                            :action-error="props.paymentsActionError"
                            @create="emit('createPayment', $event)"
                            @update="
                                (paymentId, payload) =>
                                    emit('updatePayment', paymentId, payload)
                            "
                            @mark-paid="emit('markPaymentPaid', $event)"
                            @mark-unpaid="emit('markPaymentUnpaid', $event)"
                        />
                    </section>

                    <section
                        v-if="visitedTabs.courses"
                        :id="getTabPanelId('courses')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('courses')"
                        :hidden="!isTabVisible('courses')"
                    >
                        <ManagerStudentCoursesSection
                            :courses="props.student.courses"
                        />
                    </section>
                </TabsRoot>
            </main>
        </div>
    </div>
</template>
