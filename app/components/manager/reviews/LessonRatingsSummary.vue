<script setup lang="ts">
import { Star } from 'lucide-vue-next';
import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';
import { formatLessonRatingValue } from '~/utils/lessons/myReviews';

const props = defineProps<{
    summary: LessonRatingsSummary;
    isLoading: boolean;
    hasError: boolean;
}>();

const averageLabel = computed(() =>
    formatLessonRatingValue(props.summary.averageRating),
);
</script>

<template>
    <section
        class="grid gap-3"
        aria-labelledby="lesson-ratings-summary-title"
        :aria-busy="props.isLoading"
    >
        <h2 id="lesson-ratings-summary-title" class="sr-only">
            Podsumowanie opinii
        </h2>

        <div
            class="border-border bg-card flex min-h-24 items-center gap-4 rounded-2xl border px-4 py-4 shadow-xs sm:px-5"
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
    </section>
</template>
