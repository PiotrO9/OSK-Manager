<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';
import type { LessonRatingListItem } from '~/types/lessons/lessonRating';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['instructor'],
});

usePageMeta({
    title: () => 'Moje opinie',
    description: () => 'Opinie kursantów o moich zakończonych lekcjach.',
});

const { fetchOwnInstructorRatings } = useLessonRatingsListApi();

const ratings = ref<LessonRatingListItem[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

const summary = computed(() => {
    const totalCount = ratings.value.length;

    if (totalCount === 0) {
        return {
            averageRating: null,
            totalCount,
        };
    }

    const total = ratings.value.reduce((sum, item) => sum + item.rating, 0);

    return {
        averageRating: total / totalCount,
        totalCount,
    };
});

function formatCurrentWeekLabel(): string {
    const today = new Date();
    const day = today.getDay();
    const offsetToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);

    monday.setDate(today.getDate() + offsetToMonday);

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    const monthLabel = new Intl.DateTimeFormat('pl-PL', {
        month: 'long',
    }).format(sunday);

    return `${monday.getDate()}-${sunday.getDate()} ${monthLabel}`;
}

async function loadRatings(): Promise<void> {
    isLoading.value = true;
    errorMessage.value = null;

    try {
        const payload = await fetchOwnInstructorRatings();

        ratings.value = payload.ratings;
    } catch (err) {
        ratings.value = [];
        errorMessage.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać opinii.',
        );
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    void loadRatings();
});
</script>

<template>
    <div class="space-y-5">
        <div
            class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >
            <div class="space-y-1.5">
                <h1
                    class="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-3xl"
                >
                    Moje opinie
                </h1>
                <p class="text-muted-foreground text-sm">
                    Oceny i komentarze po zakończonych lekcjach.
                </p>
            </div>

            <div class="flex flex-wrap gap-2">
                <UiButton
                    type="button"
                    variant="outline"
                    class="bg-card h-10 rounded-xl px-4 font-semibold shadow-xs"
                >
                    <CalendarDays class="size-4" aria-hidden="true" />
                    {{ formatCurrentWeekLabel() }}
                </UiButton>

                <UiButton as-child class="h-10 rounded-xl px-4 shadow-lg">
                    <NuxtLink to="/events" aria-label="Przejdz do wydarzen">
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj jazde
                    </NuxtLink>
                </UiButton>
            </div>
        </div>

        <p
            v-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ errorMessage }}
        </p>

        <div class="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <LessonRatingsSummary :summary="summary" />

            <LessonRatingsTable
                :ratings="ratings"
                :show-student="true"
                :show-instructor-meta="false"
                :is-loading="isLoading"
                empty-label="Nie masz jeszcze opinii"
            />
        </div>
    </div>
</template>
