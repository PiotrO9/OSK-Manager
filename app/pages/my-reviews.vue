<script setup lang="ts">
import type { LessonRatingListItem } from '~/types/lessonRating';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['instructor'],
});

usePageMeta({
    title: () => 'Moje opinie',
    description: () => 'Opinie kursantow o moich zakonczonych lekcjach.',
});

const { fetchOwnInstructorRatings } = useLessonRatingsListApi();

const ratings = ref<LessonRatingListItem[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

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
            'Nie udalo sie pobrac opinii.',
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
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Moje opinie
            </h1>
            <p class="text-muted-foreground text-sm">
                Lista opinii po Twoich zakonczonych jazdach praktycznych.
            </p>
        </div>

        <p
            v-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ errorMessage }}
        </p>

        <LessonRatingsTable
            :ratings="ratings"
            :show-student="false"
            :is-loading="isLoading"
            empty-label="Nie masz jeszcze opinii"
        />
    </div>
</template>
