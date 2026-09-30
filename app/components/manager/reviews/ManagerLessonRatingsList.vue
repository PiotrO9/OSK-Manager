<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import ManagerLessonRatingItem from '~/components/manager/reviews/ManagerLessonRatingItem.vue';
import type { LessonRatingListItem } from '~/types/lessons/lessonRating';
import { formatLessonRatingCount } from '~/utils/lessons/myReviews';
import {
    formatManagerReviewsPeriodLabel,
    type ManagerReviewsPeriod,
} from '~/utils/lessons/managerReviews';

const props = defineProps<{
    ratings: readonly LessonRatingListItem[];
    schoolId: string;
    period: ManagerReviewsPeriod;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    isLoading: boolean;
    errorMessage: string | null;
}>();

const emit = defineEmits<{
    retry: [];
    pageChange: [page: number];
    clearFilters: [];
}>();

const periodLabel = computed(() =>
    formatManagerReviewsPeriodLabel(props.period),
);
const isFiltered = computed(() => props.period !== 'all');
</script>

<template>
    <section
        class="border-border bg-card min-w-0 overflow-hidden rounded-2xl border shadow-xs"
        aria-labelledby="manager-ratings-list-title"
        :aria-busy="props.isLoading"
    >
        <div class="border-border border-b px-4 py-4 sm:px-5">
            <h2
                id="manager-ratings-list-title"
                class="text-foreground text-lg font-bold tracking-tight text-balance"
            >
                Opinie · {{ periodLabel }}
            </h2>
            <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
                Oceny i komentarze przypisane do zakończonych jazd praktycznych.
            </p>
        </div>

        <div
            v-if="props.isLoading"
            class="space-y-3 p-4 sm:p-5"
            role="status"
            aria-live="polite"
            aria-label="Aktualizowanie listy opinii"
        >
            <div
                v-for="index in 4"
                :key="index"
                class="border-border grid gap-4 rounded-xl border p-4 2xl:grid-cols-[minmax(14rem,1.25fr)_minmax(20rem,1fr)_minmax(13rem,0.7fr)]"
            >
                <div class="space-y-3">
                    <UiSkeleton class="h-7 w-52" />
                    <UiSkeleton class="h-5 w-4/5" />
                    <UiSkeleton class="h-4 w-full" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <UiSkeleton class="h-14 w-full" />
                    <UiSkeleton class="h-14 w-full" />
                    <UiSkeleton class="h-14 w-full" />
                    <UiSkeleton class="h-14 w-full" />
                </div>
                <div class="space-y-3">
                    <UiSkeleton class="h-9 w-full" />
                    <UiSkeleton class="h-9 w-full" />
                </div>
            </div>
        </div>

        <ErrorState
            v-else-if="props.errorMessage"
            class="m-4 sm:m-5"
            title="Nie udało się wczytać opinii"
            :description="props.errorMessage"
            @retry="emit('retry')"
        />

        <EmptyState
            v-else-if="props.ratings.length === 0"
            class="m-4 sm:m-5"
            :title="
                isFiltered
                    ? 'Brak opinii w wybranym okresie'
                    : 'Brak opinii o lekcjach'
            "
            :description="
                isFiltered
                    ? 'Zmień okres albo wybierz innego instruktora.'
                    : 'Opinie pojawią się po ocenieniu zakończonych jazd przez kursantów.'
            "
        >
            <template v-if="isFiltered" #action>
                <UiButton
                    type="button"
                    variant="outline"
                    @click="emit('clearFilters')"
                >
                    Pokaż wszystkie opinie
                </UiButton>
            </template>
        </EmptyState>

        <div
            v-else
            class="bg-muted/60 sm:divide-border sm:bg-card grid gap-2 sm:block sm:divide-y"
        >
            <ManagerLessonRatingItem
                v-for="rating in props.ratings"
                :key="rating.id"
                :rating="rating"
                :school-id="props.schoolId"
            />
        </div>

        <nav
            v-if="
                !props.errorMessage &&
                props.ratings.length > 0 &&
                props.totalPages > 1
            "
            class="border-border bg-muted/20 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            aria-label="Strony opinii managera"
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
