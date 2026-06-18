<script setup lang="ts">
import {
    formatLessonRatingPersonName,
    type LessonRatingListItem,
} from '~/types/lessonRating';

const props = withDefaults(
    defineProps<{
        ratings: LessonRatingListItem[];
        showStudent?: boolean;
        isLoading?: boolean;
        emptyLabel?: string;
    }>(),
    {
        showStudent: true,
        isLoading: false,
        emptyLabel: 'Brak opinii',
    },
);

function formatDateTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function ratingLabel(value: number): string {
    return `${value}/5`;
}
</script>

<template>
    <div class="border-border overflow-x-auto rounded-lg border">
        <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-muted/50 text-muted-foreground border-b">
                <tr>
                    <th scope="col" class="px-4 py-3 font-medium">Ocena</th>
                    <th scope="col" class="px-4 py-3 font-medium">Komentarz</th>
                    <th scope="col" class="px-4 py-3 font-medium">
                        Instruktor
                    </th>
                    <th
                        v-if="props.showStudent"
                        scope="col"
                        class="px-4 py-3 font-medium"
                    >
                        Kursant
                    </th>
                    <th scope="col" class="px-4 py-3 font-medium">
                        Data lekcji
                    </th>
                    <th scope="col" class="px-4 py-3 font-medium">
                        Data opinii
                    </th>
                </tr>
            </thead>
            <tbody
                v-if="props.ratings.length > 0"
                class="divide-border divide-y"
            >
                <tr
                    v-for="rating in props.ratings"
                    :key="rating.id"
                    class="hover:bg-muted/30"
                >
                    <td class="px-4 py-3">
                        <UiBadge variant="secondary" class="tabular-nums">
                            {{ ratingLabel(rating.rating) }}
                        </UiBadge>
                    </td>
                    <td class="text-foreground max-w-[22rem] px-4 py-3">
                        <span v-if="rating.comment">
                            {{ rating.comment }}
                        </span>
                        <span v-else class="text-muted-foreground">-</span>
                    </td>
                    <td class="text-foreground px-4 py-3">
                        {{ formatLessonRatingPersonName(rating.instructor) }}
                    </td>
                    <td
                        v-if="props.showStudent"
                        class="text-foreground px-4 py-3"
                    >
                        {{ formatLessonRatingPersonName(rating.student) }}
                    </td>
                    <td class="text-muted-foreground px-4 py-3">
                        {{ formatDateTime(rating.lesson.startTime) }}
                    </td>
                    <td class="text-muted-foreground px-4 py-3">
                        {{ formatDateTime(rating.createdAt) }}
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
                <tr>
                    <td
                        class="text-muted-foreground px-4 py-6 text-center"
                        :colspan="props.showStudent ? 6 : 5"
                    >
                        {{
                            props.isLoading
                                ? 'Wczytywanie opinii...'
                                : props.emptyLabel
                        }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
