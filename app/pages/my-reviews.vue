<script setup lang="ts">
import MyReviewsList from '~/components/instructor/reviews/MyReviewsList.vue';
import MyReviewsSummary from '~/components/instructor/reviews/MyReviewsSummary.vue';

definePageMeta({
    layout: 'app-shell',
    middleware: ['instructor'],
});

usePageMeta({
    title: () => 'Moje opinie',
    description: () => 'Opinie kursantów o moich zakończonych lekcjach.',
});

const reviews = useMyReviewsPage();
</script>

<template>
    <div class="mx-auto w-full max-w-[1120px] space-y-5 md:space-y-6">
        <PageHeader
            title="Moje opinie"
            description="Oceny i anonimowe komentarze po zakończonych jazdach."
        />

        <MyReviewsSummary
            :summary="reviews.summary.value"
            :is-loading="reviews.isLoading.value"
            :has-error="Boolean(reviews.errorMessage.value)"
        />

        <MyReviewsList
            :ratings="reviews.ratings.value"
            :period="reviews.period.value"
            :current-page="reviews.currentPage.value"
            :total-pages="reviews.totalPages.value"
            :total-count="reviews.summary.value.totalCount"
            :is-loading="reviews.isLoading.value"
            :error-message="reviews.errorMessage.value"
            @retry="reviews.loadRatings"
            @period-change="reviews.handlePeriodChange"
            @page-change="reviews.handlePageChange"
        />
    </div>
</template>
