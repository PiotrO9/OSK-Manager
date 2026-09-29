<script setup lang="ts">
import { CalendarPlus, CreditCard, GraduationCap } from 'lucide-vue-next';
import DashboardNextLessonCard from './DashboardNextLessonCard.vue';
import UserDrivingSchoolsSection from './UserDrivingSchoolsSection.vue';
import type { CurrentUserCourseItem } from '~/types/courses/course';
import type { StudentPaymentsSummary } from '~/types/payments/payment';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

const props = defineProps<{
    schools: readonly DrivingSchool[];
    nextItem: ScheduleLessonItem | null;
    upcomingCount: number;
    featuredCourse: CurrentUserCourseItem | null;
    paymentSummary: StudentPaymentsSummary;
    isLoading: boolean;
    errorMessage: string | null;
}>();

const emit = defineEmits<{ retry: [] }>();

const unpaidLabel = computed(() => {
    const amount = Number.parseFloat(
        props.paymentSummary.unpaidAmount.replace(',', '.'),
    );

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: props.paymentSummary.currency || 'PLN',
        maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(Number.isFinite(amount) ? amount : 0);
});
</script>

<template>
    <div class="space-y-4 md:space-y-5">
        <div
            v-if="errorMessage"
            class="border-warning-200 bg-warning-50 text-warning-900 flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
            role="status"
        >
            <p>{{ errorMessage }} Pozostałe dane są nadal dostępne.</p>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="min-h-11 shrink-0"
                @click="emit('retry')"
            >
                Odśwież
            </UiButton>
        </div>

        <div
            class="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.5fr)]"
        >
            <DashboardNextLessonCard
                :item="nextItem"
                role="STUDENT"
                :is-loading="isLoading"
            />

            <section
                class="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl p-5 shadow-sm"
                aria-labelledby="student-booking-heading"
            >
                <div
                    class="absolute -top-10 -right-8 size-32 rounded-full bg-white/10"
                    aria-hidden="true"
                />
                <div
                    class="relative flex h-full flex-col justify-between gap-6"
                >
                    <div class="space-y-2">
                        <span
                            class="flex size-11 items-center justify-center rounded-xl bg-white/15"
                        >
                            <CalendarPlus class="size-5" aria-hidden="true" />
                        </span>
                        <h2
                            id="student-booking-heading"
                            class="text-lg font-bold"
                        >
                            Zaplanuj kolejną jazdę
                        </h2>
                        <p class="text-sm leading-relaxed text-white/75">
                            Wybierz kurs, instruktora i dostępny termin.
                        </p>
                    </div>
                    <UiButton
                        as-child
                        variant="secondary"
                        class="min-h-11 w-full"
                    >
                        <NuxtLink to="/book-lesson">Rezerwuj jazdę</NuxtLink>
                    </UiButton>
                </div>
            </section>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
            <NuxtLink
                to="/my-courses"
                class="border-border bg-card hover:border-primary/35 focus-visible:ring-primary rounded-2xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                <div class="flex items-center gap-2">
                    <GraduationCap
                        class="text-primary size-4"
                        aria-hidden="true"
                    />
                    <p class="text-muted-foreground text-sm font-semibold">
                        Postęp kursu
                    </p>
                </div>
                <p
                    class="text-foreground mt-3 text-2xl font-extrabold tabular-nums"
                >
                    {{ featuredCourse?.progress ?? 0 }}%
                </p>
                <p class="text-muted-foreground mt-1 truncate text-xs">
                    {{ featuredCourse?.name ?? 'Brak aktywnego kursu' }}
                </p>
            </NuxtLink>

            <NuxtLink
                to="/my-lessons"
                class="border-border bg-card hover:border-primary/35 focus-visible:ring-primary rounded-2xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                <p class="text-muted-foreground text-sm font-semibold">
                    Najbliższe 14 dni
                </p>
                <p
                    class="text-foreground mt-3 text-2xl font-extrabold tabular-nums"
                >
                    {{ upcomingCount }}
                </p>
                <p class="text-muted-foreground mt-1 text-xs">
                    Zaplanowane zajęcia
                </p>
            </NuxtLink>

            <NuxtLink
                to="/my-payments"
                class="border-border bg-card hover:border-primary/35 focus-visible:ring-primary rounded-2xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                <div class="flex items-center gap-2">
                    <CreditCard
                        class="text-primary size-4"
                        aria-hidden="true"
                    />
                    <p class="text-muted-foreground text-sm font-semibold">
                        Do opłacenia
                    </p>
                </div>
                <p
                    class="text-foreground mt-3 text-2xl font-extrabold tabular-nums"
                >
                    {{ unpaidLabel }}
                </p>
                <p
                    class="mt-1 text-xs"
                    :class="
                        paymentSummary.overdueCount > 0
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                    "
                >
                    {{
                        paymentSummary.overdueCount > 0
                            ? `${paymentSummary.overdueCount} zaległych płatności`
                            : 'Brak zaległości'
                    }}
                </p>
            </NuxtLink>
        </div>

        <UserDrivingSchoolsSection :schools="schools" />
    </div>
</template>
