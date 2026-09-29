<script setup lang="ts">
import { ChevronLeft, ChevronRight, Star } from 'lucide-vue-next';
import type { LessonRatingListItem } from '~/types/lessons/lessonRating';
import {
    formatLessonRatingCount,
    formatLessonRatingValue,
    type MyReviewsPeriod,
} from '~/utils/lessons/myReviews';

const props = defineProps<{
    ratings: readonly LessonRatingListItem[];
    period: MyReviewsPeriod;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    isLoading: boolean;
    errorMessage: string | null;
}>();

const emit = defineEmits<{
    retry: [];
    periodChange: [period: MyReviewsPeriod];
    pageChange: [page: number];
}>();

const dateTimeFormatter = new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const isFiltered = computed(() => props.period !== 'all');
const emptyTitle = computed(() => {
    if (props.period === 'last7days') {
        return 'Brak opinii z ostatniego tygodnia';
    }

    if (props.period === 'last30days') {
        return 'Brak opinii z ostatniego miesiąca';
    }

    return 'Nie masz jeszcze opinii';
});
const emptyDescription = computed(() =>
    isFiltered.value
        ? 'Wybierz wszystkie opinie, aby zobaczyć wcześniejsze komentarze.'
        : 'Opinie pojawią się tutaj po ocenieniu zakończonych jazd przez kursantów.',
);

function formatDateTime(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? 'Termin niedostępny'
        : dateTimeFormatter.format(date);
}
</script>

<template>
    <section
        class="border-border bg-card min-w-0 overflow-hidden rounded-2xl border shadow-xs"
        aria-labelledby="my-reviews-list-title"
        :aria-busy="props.isLoading"
    >
        <div
            class="border-border flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
            <div class="min-w-0">
                <h2
                    id="my-reviews-list-title"
                    class="text-foreground text-lg font-bold tracking-tight text-balance"
                >
                    Opinie o Twoich jazdach
                </h2>
                <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
                    Komentarze są anonimowe — widzisz ocenę i termin lekcji.
                </p>
            </div>

            <div class="w-full shrink-0 sm:w-48">
                <UiLabel for="my-reviews-period" class="sr-only">
                    Okres opinii
                </UiLabel>
                <UiSelect
                    :model-value="props.period"
                    :disabled="props.isLoading"
                    @update:model-value="
                        emit('periodChange', String($event) as MyReviewsPeriod)
                    "
                >
                    <UiSelectTrigger
                        id="my-reviews-period"
                        class="bg-background h-10 w-full"
                        aria-label="Wybierz okres opinii"
                    >
                        <UiSelectValue placeholder="Wybierz okres" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectItem value="all">Wszystkie</UiSelectItem>
                        <UiSelectItem value="last7days">
                            Ostatni tydzień
                        </UiSelectItem>
                        <UiSelectItem value="last30days">
                            Ostatni miesiąc
                        </UiSelectItem>
                    </UiSelectContent>
                </UiSelect>
            </div>
        </div>

        <div class="p-4 sm:p-5">
            <div
                v-if="props.isLoading && props.ratings.length === 0"
                class="space-y-3"
                role="status"
                aria-live="polite"
                aria-label="Wczytywanie opinii"
            >
                <div
                    v-for="index in 3"
                    :key="index"
                    class="border-border space-y-3 rounded-xl border p-4"
                >
                    <UiSkeleton class="h-5 w-4/5" />
                    <UiSkeleton class="h-4 w-36" />
                </div>
            </div>

            <ErrorState
                v-else-if="props.errorMessage"
                title="Nie udało się wczytać opinii"
                :description="props.errorMessage"
                @retry="emit('retry')"
            />

            <EmptyState
                v-else-if="props.ratings.length === 0"
                :title="emptyTitle"
                :description="emptyDescription"
            >
                <template v-if="isFiltered" #action>
                    <UiButton
                        type="button"
                        variant="outline"
                        @click="emit('periodChange', 'all')"
                    >
                        Pokaż wszystkie opinie
                    </UiButton>
                </template>
            </EmptyState>

            <div v-else class="divide-border divide-y">
                <article
                    v-for="rating in props.ratings"
                    :key="rating.id"
                    class="grid min-w-0 gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
                >
                    <div class="min-w-0">
                        <p
                            class="text-foreground text-sm leading-relaxed font-semibold text-pretty break-words"
                        >
                            {{
                                rating.comment?.trim() ||
                                'Bez komentarza do tej jazdy.'
                            }}
                        </p>
                        <p class="text-muted-foreground mt-1.5 text-xs">
                            Jazda: {{ formatDateTime(rating.lesson.startTime) }}
                        </p>
                    </div>

                    <div
                        class="border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-300 flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums"
                        :aria-label="`Ocena ${formatLessonRatingValue(rating.rating)} na 5`"
                    >
                        <Star
                            class="size-3.5 fill-current"
                            aria-hidden="true"
                        />
                        <span aria-hidden="true">
                            {{ formatLessonRatingValue(rating.rating) }} / 5
                        </span>
                    </div>
                </article>
            </div>
        </div>

        <nav
            v-if="
                !props.errorMessage &&
                props.ratings.length > 0 &&
                props.totalPages > 1
            "
            class="border-border bg-muted/20 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            aria-label="Strony opinii"
        >
            <p
                class="text-muted-foreground text-sm font-medium tabular-nums"
                aria-live="polite"
            >
                Strona {{ props.currentPage }} z {{ props.totalPages }} ·
                {{ formatLessonRatingCount(props.totalCount) }}
            </p>
            <div class="flex gap-2">
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="h-11 flex-1 sm:h-9 sm:flex-none"
                    :disabled="props.currentPage <= 1 || props.isLoading"
                    @click="emit('pageChange', props.currentPage - 1)"
                >
                    <ChevronLeft class="size-4" aria-hidden="true" />
                    Poprzednia
                </UiButton>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="h-11 flex-1 sm:h-9 sm:flex-none"
                    :disabled="
                        props.currentPage >= props.totalPages || props.isLoading
                    "
                    @click="emit('pageChange', props.currentPage + 1)"
                >
                    Następna
                    <ChevronRight class="size-4" aria-hidden="true" />
                </UiButton>
            </div>
        </nav>
    </section>
</template>
