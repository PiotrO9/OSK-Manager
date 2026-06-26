<script setup lang="ts">
import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';

const props = defineProps<{
    summary: LessonRatingsSummary;
}>();

const averageLabel = computed(() => {
    const value = props.summary.averageRating;

    if (value === null) {
        return '-';
    }

    return value.toFixed(1);
});

const reviewCountLabel = computed(() => {
    const count = props.summary.totalCount;

    if (count === 1) {
        return 'Na podstawie 1 lekcji';
    }

    return `Na podstawie ${count} lekcji`;
});
</script>

<template>
    <section
        class="border-border bg-card flex min-h-56 flex-col rounded-xl border p-4 shadow-xs md:p-5"
        aria-labelledby="lesson-ratings-summary-title"
    >
        <UiBadge
            id="lesson-ratings-summary-title"
            variant="outline"
            class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
        >
            Srednia ocen
        </UiBadge>

        <div class="mt-6 space-y-3">
            <p
                class="text-foreground text-5xl leading-none font-bold tracking-tight tabular-nums"
            >
                {{ averageLabel }}
            </p>
            <p
                class="text-2xl leading-none tracking-[0.08em] text-amber-500"
                aria-label="Pieciogwiazdkowa prezentacja sredniej oceny"
            >
                ★★★★★
            </p>
            <p class="text-muted-foreground text-sm">
                {{ reviewCountLabel }}
            </p>
        </div>
    </section>
</template>
