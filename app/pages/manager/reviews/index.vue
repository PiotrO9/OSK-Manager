<script setup lang="ts">
import ManagerLessonRatingsFilters from '~/components/manager/reviews/ManagerLessonRatingsFilters.vue';
import ManagerLessonRatingsList from '~/components/manager/reviews/ManagerLessonRatingsList.vue';
import LessonRatingsSummary from '~/components/manager/reviews/LessonRatingsSummary.vue';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Opinie',
    description: () => 'Oceny i komentarze po zakończonych jazdach.',
});

const reviews = useManagerReviewsPage();
</script>

<template>
    <div class="w-full space-y-5 md:space-y-6">
        <PageHeader
            title="Opinie o lekcjach"
            description="Oceny instruktorów i komentarze kursantów po zakończonych jazdach."
        />

        <ErrorState
            v-if="reviews.schoolsErrorMessage.value"
            title="Nie udało się wczytać szkół jazdy"
            :description="reviews.schoolsErrorMessage.value"
            @retry="reviews.initialize"
        />

        <div
            v-else-if="
                reviews.isSchoolsLoading.value &&
                reviews.schools.value.length === 0
            "
            class="grid items-start gap-5 xl:grid-cols-[20rem_minmax(0,1fr)] xl:gap-6"
            role="status"
            aria-live="polite"
            aria-label="Wczytywanie widoku opinii"
        >
            <div class="space-y-4">
                <UiSkeleton class="h-96 w-full rounded-2xl" />
                <UiSkeleton class="h-24 w-full rounded-2xl" />
                <UiSkeleton class="h-24 w-full rounded-2xl" />
            </div>
            <UiSkeleton class="h-[32rem] w-full rounded-2xl" />
        </div>

        <template v-else>
            <div
                class="grid min-w-0 items-start gap-5 xl:grid-cols-[20rem_minmax(0,1fr)] xl:gap-6 2xl:grid-cols-[22rem_minmax(0,1fr)]"
            >
                <aside
                    class="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start"
                    aria-label="Sterowanie listą opinii"
                >
                    <ManagerLessonRatingsFilters
                        :schools="reviews.schools.value"
                        :instructors="reviews.instructors.value"
                        :school-id="reviews.activeSchoolId.value"
                        :instructor-id="reviews.activeInstructorId.value"
                        :period="reviews.period.value"
                        :is-schools-loading="reviews.isSchoolsLoading.value"
                        :is-instructors-loading="
                            reviews.isInstructorsLoading.value
                        "
                        :is-ratings-loading="reviews.isRatingsLoading.value"
                        :instructors-error-message="
                            reviews.instructorsErrorMessage.value
                        "
                        @school-change="reviews.handleSchoolChange"
                        @instructor-change="reviews.handleInstructorChange"
                        @period-change="reviews.handlePeriodChange"
                        @retry-instructors="reviews.loadInstructors"
                    />

                    <LessonRatingsSummary
                        v-if="reviews.schools.value.length > 0"
                        :summary="reviews.summary.value"
                        :is-loading="reviews.isRatingsLoading.value"
                        :has-error="Boolean(reviews.ratingsErrorMessage.value)"
                    />
                </aside>

                <EmptyState
                    v-if="
                        !reviews.isSchoolsLoading.value &&
                        reviews.schools.value.length === 0
                    "
                    title="Brak szkół jazdy"
                    description="Dodaj szkołę jazdy, aby przeglądać opinie o lekcjach."
                >
                    <template #action>
                        <UiButton as-child>
                            <NuxtLink to="/manager/osk/new">
                                Dodaj szkołę jazdy
                            </NuxtLink>
                        </UiButton>
                    </template>
                </EmptyState>

                <ManagerLessonRatingsList
                    v-else
                    class="min-w-0"
                    :ratings="reviews.ratings.value"
                    :school-id="reviews.activeSchoolId.value"
                    :period="reviews.period.value"
                    :current-page="reviews.currentPage.value"
                    :total-pages="reviews.totalPages.value"
                    :total-count="reviews.summary.value.totalCount"
                    :is-loading="reviews.isRatingsLoading.value"
                    :error-message="reviews.ratingsErrorMessage.value"
                    @retry="reviews.loadRatings"
                    @page-change="reviews.handlePageChange"
                    @clear-filters="reviews.handleClearFilters"
                />
            </div>
        </template>
    </div>
</template>
