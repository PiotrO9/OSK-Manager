<script setup lang="ts">
import {
    CalendarDays,
    MessageSquareText,
    Star,
    UserRoundCheck,
} from 'lucide-vue-next';
import DashboardNextLessonCard from './DashboardNextLessonCard.vue';
import UserDrivingSchoolsSection from './UserDrivingSchoolsSection.vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

defineProps<{
    schools: readonly DrivingSchool[];
    nextItem: ScheduleLessonItem | null;
    todayCount: number;
    scheduleCount: number;
    averageRating: number | null;
    ratingsCount: number;
    isLoading: boolean;
    errorMessage: string | null;
}>();

const emit = defineEmits<{ retry: [] }>();
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
                role="INSTRUCTOR"
                :is-loading="isLoading"
            />

            <section
                class="border-border bg-card rounded-2xl border p-5 shadow-sm"
                aria-labelledby="instructor-actions-heading"
            >
                <h2
                    id="instructor-actions-heading"
                    class="text-foreground text-lg font-bold"
                >
                    Szybki dostęp
                </h2>
                <div class="mt-4 grid gap-2">
                    <UiButton as-child class="min-h-11 justify-start">
                        <NuxtLink to="/my-lessons">
                            <CalendarDays class="size-4" aria-hidden="true" />
                            Mój terminarz
                        </NuxtLink>
                    </UiButton>
                    <UiButton
                        as-child
                        variant="outline"
                        class="min-h-11 justify-start"
                    >
                        <NuxtLink to="/my-reviews">
                            <MessageSquareText
                                class="size-4"
                                aria-hidden="true"
                            />
                            Moje opinie
                        </NuxtLink>
                    </UiButton>
                </div>
            </section>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
            <NuxtLink
                to="/my-lessons"
                class="border-border bg-card hover:border-primary/35 focus-visible:ring-primary rounded-2xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                <div class="flex items-center gap-2">
                    <UserRoundCheck
                        class="text-primary size-4"
                        aria-hidden="true"
                    />
                    <p class="text-muted-foreground text-sm font-semibold">
                        Dzisiaj
                    </p>
                </div>
                <p
                    class="text-foreground mt-3 text-2xl font-extrabold tabular-nums"
                >
                    {{ todayCount }}
                </p>
                <p class="text-muted-foreground mt-1 text-xs">
                    Lekcje i wydarzenia
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
                    {{ scheduleCount }}
                </p>
                <p class="text-muted-foreground mt-1 text-xs">
                    Pozycje w terminarzu
                </p>
            </NuxtLink>

            <NuxtLink
                to="/my-reviews"
                class="border-border bg-card hover:border-primary/35 focus-visible:ring-primary rounded-2xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                <div class="flex items-center gap-2">
                    <Star class="text-warning-600 size-4" aria-hidden="true" />
                    <p class="text-muted-foreground text-sm font-semibold">
                        Średnia ocen
                    </p>
                </div>
                <p
                    class="text-foreground mt-3 text-2xl font-extrabold tabular-nums"
                >
                    {{
                        averageRating === null ? '—' : averageRating.toFixed(1)
                    }}
                </p>
                <p class="text-muted-foreground mt-1 text-xs">
                    {{ ratingsCount }} opinii
                </p>
            </NuxtLink>
        </div>

        <UserDrivingSchoolsSection :schools="schools" />
    </div>
</template>
