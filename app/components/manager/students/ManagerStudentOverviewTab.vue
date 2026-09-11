<script setup lang="ts">
import { BookOpen, CalendarDays, CreditCard } from 'lucide-vue-next';
import type { StudentPaymentsSummary } from '~/types/payments/payment';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { StudentProcessStatusStep } from '~/types/students/student';
import {
    formatStudentPaymentAmount,
    formatStudentPaymentDate,
} from '~/utils/students/managerStudentPaymentsSection';
import {
    formatScheduleLessonDateTime,
    labelForScheduleLessonStatus,
    labelForScheduleLessonType,
} from '~/utils/schedule/managerScheduleLessonTable';

const props = defineProps<{
    processStatusSteps: readonly StudentProcessStatusStep[];
    processStatusLoading: boolean;
    processStatusError: string | null;
    paymentsSummary: StudentPaymentsSummary;
    paymentsLoading: boolean;
    paymentsError: string | null;
    scheduleItems: readonly ScheduleLessonItem[];
    scheduleLoading: boolean;
    scheduleError: string | null;
    scheduleDateFrom: string;
    scheduleDateTo: string;
}>();

const emit = defineEmits<{
    goToLessons: [];
    goToPayments: [];
}>();

const completedProcessCount = computed(
    () => props.processStatusSteps.filter((step) => step.completed).length,
);
const processTotalCount = computed(() => props.processStatusSteps.length);
const isProcessComplete = computed(
    () =>
        !props.processStatusLoading &&
        !props.processStatusError &&
        processTotalCount.value > 0 &&
        completedProcessCount.value === processTotalCount.value,
);
const incompleteProcessSteps = computed(() =>
    props.processStatusSteps.filter((step) => !step.completed),
);
const processSummary = computed(() => {
    if (props.processStatusLoading) {
        return 'Wczytywanie statusu procesu';
    }

    if (props.processStatusError) {
        return props.processStatusError;
    }

    if (processTotalCount.value === 0) {
        return 'Brak kroków procesu do wyświetlenia.';
    }

    if (isProcessComplete.value) {
        return `Proces ukończony · ${completedProcessCount.value}/${processTotalCount.value}`;
    }

    const missing = incompleteProcessSteps.value
        .map((step) => step.name.trim())
        .filter(Boolean);

    return missing.length > 0
        ? `Brakuje: ${missing.join(', ')}`
        : `Wykonano ${completedProcessCount.value}/${processTotalCount.value}`;
});

const previewLessons = computed(() =>
    [...props.scheduleItems]
        .sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime(),
        )
        .slice(0, 3),
);

function formatShortDate(value: string): string {
    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
    }).format(d);
}

function displayPerson(
    person: ScheduleLessonItem['instructor'] | undefined,
): string {
    if (!person) {
        return '-';
    }

    const name = [person.firstName, person.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' ');

    return name.length > 0 ? name : '-';
}
</script>

<template>
    <div class="space-y-5">
        <ManagerStudentProcessStatus
            v-if="!isProcessComplete"
            :steps="props.processStatusSteps"
            :is-loading="props.processStatusLoading"
            :error="props.processStatusError"
            title="Formalności"
            :description="processSummary"
            :initially-expanded="processTotalCount > 0"
        />

        <section
            class="border-border bg-card rounded-lg border shadow-xs"
            aria-labelledby="student-overview-lessons-heading"
        >
            <div
                class="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
                <div class="min-w-0 space-y-1">
                    <h2
                        id="student-overview-lessons-heading"
                        class="text-foreground text-base font-semibold"
                    >
                        Lekcje w wybranym tygodniu
                    </h2>
                    <p class="text-muted-foreground text-sm">
                        {{ formatShortDate(props.scheduleDateFrom) }} -
                        {{ formatShortDate(props.scheduleDateTo) }}
                    </p>
                </div>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="w-fit rounded-lg"
                    @click="emit('goToLessons')"
                >
                    <CalendarDays class="mr-2 size-4" aria-hidden="true" />
                    Terminarz
                </UiButton>
            </div>
            <div class="p-5">
                <p
                    v-if="props.scheduleLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie lekcji...
                </p>
                <p
                    v-else-if="props.scheduleError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ props.scheduleError }}
                </p>
                <p
                    v-else-if="previewLessons.length === 0"
                    class="text-muted-foreground text-sm"
                >
                    Brak lekcji w tym tygodniu.
                </p>
                <ul v-else class="divide-border divide-y" role="list">
                    <li
                        v-for="lesson in previewLessons"
                        :key="lesson.id"
                        class="grid gap-3 py-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,.8fr)_auto]"
                    >
                        <div class="min-w-0">
                            <p
                                class="text-foreground text-sm font-semibold wrap-break-word"
                            >
                                {{
                                    formatScheduleLessonDateTime(
                                        lesson.startTime,
                                    )
                                }}
                                -
                                {{
                                    formatScheduleLessonDateTime(lesson.endTime)
                                }}
                            </p>
                            <p class="text-muted-foreground mt-1 text-xs">
                                {{ labelForScheduleLessonType(lesson.type) }}
                            </p>
                        </div>
                        <div class="min-w-0">
                            <p class="text-muted-foreground text-xs">
                                Instruktor
                            </p>
                            <p class="text-foreground text-sm">
                                {{ displayPerson(lesson.instructor) }}
                            </p>
                        </div>
                        <StatusBadge
                            :label="labelForScheduleLessonStatus(lesson.status)"
                            tone="neutral"
                            subtle
                            class="self-start"
                        />
                    </li>
                </ul>
            </div>
        </section>

        <section
            class="border-border bg-card rounded-lg border shadow-xs"
            aria-labelledby="student-overview-payments-heading"
        >
            <div
                class="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
                <div class="min-w-0 space-y-1">
                    <h2
                        id="student-overview-payments-heading"
                        class="text-foreground text-base font-semibold"
                    >
                        Rozliczenia
                    </h2>
                    <p class="text-muted-foreground text-sm">
                        Kwoty z planów płatności kursanta.
                    </p>
                </div>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="w-fit rounded-lg"
                    @click="emit('goToPayments')"
                >
                    <CreditCard class="mr-2 size-4" aria-hidden="true" />
                    Płatności
                </UiButton>
            </div>
            <div class="p-5">
                <p
                    v-if="props.paymentsLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie płatności...
                </p>
                <p
                    v-else-if="props.paymentsError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ props.paymentsError }}
                </p>
                <dl
                    v-else
                    class="grid gap-4 sm:grid-cols-3"
                    aria-label="Podsumowanie płatności"
                >
                    <div class="min-w-0">
                        <dt class="text-muted-foreground text-sm">
                            Do zapłaty
                        </dt>
                        <dd
                            class="text-foreground mt-1 text-xl font-semibold tabular-nums"
                        >
                            {{
                                formatStudentPaymentAmount(
                                    props.paymentsSummary.unpaidAmount,
                                    props.paymentsSummary.currency,
                                )
                            }}
                        </dd>
                    </div>
                    <div class="min-w-0">
                        <dt class="text-muted-foreground text-sm">
                            Po terminie
                        </dt>
                        <dd
                            class="text-foreground mt-1 flex flex-wrap items-baseline gap-2 text-xl font-semibold tabular-nums"
                        >
                            {{
                                formatStudentPaymentAmount(
                                    props.paymentsSummary.overdueAmount,
                                    props.paymentsSummary.currency,
                                )
                            }}
                            <span
                                v-if="props.paymentsSummary.overdueCount > 0"
                                class="text-muted-foreground text-xs font-medium"
                            >
                                {{ props.paymentsSummary.overdueCount }} pozycji
                            </span>
                        </dd>
                    </div>
                    <div class="min-w-0">
                        <dt class="text-muted-foreground text-sm">
                            Następny termin
                        </dt>
                        <dd class="text-foreground mt-1 text-xl font-semibold">
                            {{
                                formatStudentPaymentDate(
                                    props.paymentsSummary.nextDueDate,
                                )
                            }}
                        </dd>
                    </div>
                </dl>
            </div>
        </section>

        <ManagerStudentProcessStatus
            v-if="isProcessComplete"
            :steps="props.processStatusSteps"
            :is-loading="props.processStatusLoading"
            :error="props.processStatusError"
            title="Formalności"
            :description="processSummary"
            :initially-expanded="false"
        >
            <template #summary-icon>
                <BookOpen class="size-4" aria-hidden="true" />
            </template>
        </ManagerStudentProcessStatus>
    </div>
</template>
