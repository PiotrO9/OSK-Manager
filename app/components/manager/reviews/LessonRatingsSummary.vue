<script setup lang="ts">
import type { LessonRatingsSummary } from '~/types/lessonRating';

const props = defineProps<{
    summary: LessonRatingsSummary;
}>();

const averageLabel = computed(() => {
    const value = props.summary.averageRating;

    if (value === null) {
        return '-';
    }

    return value.toFixed(2);
});
</script>

<template>
    <div class="grid gap-3 sm:grid-cols-2">
        <div class="border-border rounded-lg border p-4">
            <p class="text-muted-foreground text-sm">Srednia ocen</p>
            <p class="text-foreground mt-1 text-2xl font-semibold tabular-nums">
                {{ averageLabel }}
            </p>
        </div>
        <div class="border-border rounded-lg border p-4">
            <p class="text-muted-foreground text-sm">Liczba opinii</p>
            <p class="text-foreground mt-1 text-2xl font-semibold tabular-nums">
                {{ props.summary.totalCount }}
            </p>
        </div>
    </div>
</template>
