<script setup lang="ts">
import { MessageSquareText, Star } from 'lucide-vue-next';
import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';
import {
    formatLessonRatingCount,
    formatLessonRatingValue,
} from '~/utils/lessons/myReviews';

const props = defineProps<{
    summary: LessonRatingsSummary;
    isLoading: boolean;
    hasError: boolean;
}>();

const averageLabel = computed(() =>
    formatLessonRatingValue(props.summary.averageRating),
);
const countLabel = computed(() =>
    formatLessonRatingCount(props.summary.totalCount),
);
</script>

<template>
    <section
        class="border-border bg-card grid gap-3 rounded-2xl border p-4 shadow-xs sm:grid-cols-2 sm:p-5"
        aria-labelledby="my-reviews-summary-title"
        :aria-busy="props.isLoading"
    >
        <h2 id="my-reviews-summary-title" class="sr-only">
            Podsumowanie opinii
        </h2>

        <div
            class="border-border bg-muted/25 flex min-h-24 items-center gap-4 rounded-xl border px-4 py-3"
        >
            <span
                class="bg-warning-100 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300 flex size-11 shrink-0 items-center justify-center rounded-xl"
                aria-hidden="true"
            >
                <Star class="size-5 fill-current" />
            </span>
            <div class="min-w-0">
                <p class="text-muted-foreground text-xs font-semibold">
                    Średnia ocen
                </p>
                <UiSkeleton v-if="props.isLoading" class="mt-2 h-8 w-24" />
                <p
                    v-else
                    class="text-foreground mt-1 text-2xl font-bold tracking-tight tabular-nums"
                    :aria-label="
                        props.hasError || props.summary.averageRating === null
                            ? 'Średnia ocen niedostępna'
                            : `Średnia ocena ${averageLabel} na 5`
                    "
                >
                    {{ props.hasError ? '—' : averageLabel }}
                    <span
                        v-if="
                            !props.hasError &&
                            props.summary.averageRating !== null
                        "
                        class="text-muted-foreground text-sm font-semibold"
                        aria-hidden="true"
                    >
                        / 5
                    </span>
                </p>
            </div>
        </div>

        <div
            class="border-border bg-muted/25 flex min-h-24 items-center gap-4 rounded-xl border px-4 py-3"
        >
            <span
                class="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl"
                aria-hidden="true"
            >
                <MessageSquareText class="size-5" />
            </span>
            <div class="min-w-0">
                <p class="text-muted-foreground text-xs font-semibold">
                    Wszystkie opinie
                </p>
                <UiSkeleton v-if="props.isLoading" class="mt-2 h-8 w-28" />
                <p
                    v-else
                    class="text-foreground mt-1 text-2xl font-bold tracking-tight tabular-nums"
                >
                    {{ props.hasError ? '—' : countLabel }}
                </p>
            </div>
        </div>
    </section>
</template>
