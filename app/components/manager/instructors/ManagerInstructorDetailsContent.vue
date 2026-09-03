<script setup lang="ts">
import { ArrowLeft, Pencil } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';
import type { InstructorDetail } from '~/types/instructors/instructor';
import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';

const props = defineProps<{
    instructor: InstructorDetail;
    ratingSummary: LessonRatingsSummary;
    isRatingSummaryLoading: boolean;
    isSubmitting: boolean;
    isDeleting: boolean;
    subpageQuery: Record<string, string>;
}>();

const emit = defineEmits<{
    edit: [];
    delete: [];
}>();

const {
    initials,
    categoryLabel,
    ratingAverageLabel,
    ratingsCountLabel,
    summaryItems,
    actionDisabledClass,
    relatedLinks,
    profileRows,
} = useManagerInstructorDetailsContent(props);

const displayValue = displayManagerInstructorDetailsValue;

const reviewsTo = computed<RouteLocationRaw | null>(() => {
    if (!props.subpageQuery.schoolId) {
        return null;
    }

    return {
        path: '/manager/reviews',
        query: {
            schoolId: props.subpageQuery.schoolId,
            instructorId: props.instructor.id,
        },
    };
});
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            :title="displayValue(props.instructor.name)"
            description="Szczegóły instruktora, kwalifikacje, oceny i dostępność."
            eyebrow="Instruktor"
        >
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        to="/manager/instructors"
                        aria-label="Wróć do listy instruktorów"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista
                    </NuxtLink>
                </UiButton>

                <UiButton
                    type="button"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                    :disabled="props.isDeleting"
                    aria-label="Edytuj dane instruktora"
                    @click="emit('edit')"
                >
                    <Pencil class="mr-2 size-4" aria-hidden="true" />
                    Edytuj
                </UiButton>
            </template>
        </PageHeader>

        <SummaryStrip :items="summaryItems" />

        <div class="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,360px)_1fr]">
            <ManagerInstructorProfileCard
                :initials="initials"
                :name="displayValue(props.instructor.name)"
                :category-label="categoryLabel"
                :profile-rows="profileRows"
                :has-qualified-course-types="
                    props.instructor.qualifiedCourseTypes.length > 0
                "
            />

            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader
                    class="border-border flex flex-row items-start justify-between gap-4 border-b p-5"
                >
                    <div class="min-w-0">
                        <UiCardTitle class="text-xl font-extrabold">
                            Przeglad
                        </UiCardTitle>
                        <UiCardDescription>
                            Najważniejsze dane i akcje dla tego widoku.
                        </UiCardDescription>
                    </div>
                    <StatusBadge label="Aktualne" tone="info" subtle />
                </UiCardHeader>

                <UiCardContent class="space-y-3 p-4">
                    <div
                        class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="min-w-0">
                            <p class="text-foreground font-semibold">
                                Dostepnosc tygodniowa
                            </p>
                            <p class="text-muted-foreground mt-1 text-sm">
                                Zachowana w podgladzie ponizej i w osobnym
                                panelu edycji.
                            </p>
                        </div>
                        <StatusBadge label="Aktywna" tone="success" subtle />
                    </div>

                    <div
                        class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="min-w-0">
                            <p class="text-foreground font-semibold">
                                Oceny lekcji
                            </p>
                            <p class="text-muted-foreground mt-1 text-sm">
                                {{ ratingsCountLabel }}
                            </p>
                        </div>
                        <StatusBadge
                            :label="ratingAverageLabel"
                            :tone="
                                props.ratingSummary.averageRating === null
                                    ? 'neutral'
                                    : 'info'
                            "
                            subtle
                        />
                    </div>

                    <div
                        class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="min-w-0">
                            <p class="text-foreground font-semibold">Akcje</p>
                            <p class="text-muted-foreground mt-1 text-sm">
                                Edycja, usunięcie, terminarz i dostępność.
                            </p>
                        </div>
                        <StatusBadge label="5 akcji" tone="neutral" subtle />
                    </div>
                </UiCardContent>
            </UiCard>
        </div>

        <div
            class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
        >
            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader class="border-border border-b p-5">
                    <UiCardTitle class="text-xl font-extrabold">
                        Dostepnosc
                    </UiCardTitle>
                    <UiCardDescription>
                        Tygodniowy wzorzec pracy instruktora.
                    </UiCardDescription>
                </UiCardHeader>
                <UiCardContent class="p-5">
                    <ManagerInstructorWeeklyAvailabilityPreview
                        :instructor-id="props.instructor.id"
                    />
                </UiCardContent>
            </UiCard>

            <div class="space-y-5">
                <ManagerInstructorRelatedDataCard
                    :links="relatedLinks"
                    :reviews-to="reviewsTo"
                    :action-disabled-class="actionDisabledClass"
                    :is-deleting="props.isDeleting"
                />

                <ManagerInstructorContactQualificationsCard
                    :instructor="props.instructor"
                    :is-submitting="props.isSubmitting"
                    :is-deleting="props.isDeleting"
                    @edit="emit('edit')"
                    @delete="emit('delete')"
                />
            </div>
        </div>
    </div>
</template>
