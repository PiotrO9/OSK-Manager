<script setup lang="ts">
import { ArrowLeft, CalendarDays, MessageSquare, Star } from 'lucide-vue-next';
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui';
import type { RouteLocationRaw } from 'vue-router';
import type { InstructorDetail } from '~/types/instructors/instructor';
import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';

type ManagerInstructorDetailsTab =
    | 'overview'
    | 'availability'
    | 'related'
    | 'details';

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
    actionDisabledClass,
    relatedLinks,
    profileRows,
} = useManagerInstructorDetailsContent(props);

const displayValue = displayManagerInstructorDetailsValue;

const tabs: Array<{ value: ManagerInstructorDetailsTab; label: string }> = [
    { value: 'overview', label: 'Przegląd' },
    { value: 'availability', label: 'Dostępność' },
    { value: 'related', label: 'Powiązane' },
    { value: 'details', label: 'Dane' },
];

const activeTab = shallowRef<ManagerInstructorDetailsTab>('overview');
const visitedTabs = reactive<Record<ManagerInstructorDetailsTab, boolean>>({
    overview: true,
    availability: false,
    related: false,
    details: false,
});

const backToListTo = computed<RouteLocationRaw>(() => ({
    path: '/manager/instructors',
    query: props.subpageQuery,
}));

const availabilityTo = computed<RouteLocationRaw>(() => ({
    path: `/manager/instructors/${props.instructor.id}/availability`,
    query: props.subpageQuery,
}));

const reviewsTo = computed<RouteLocationRaw | null>(() => {
    if (!props.instructor.schoolId) {
        return null;
    }

    return {
        path: '/manager/reviews',
        query: {
            ...props.subpageQuery,
            instructorId: props.instructor.id,
        },
    };
});

watch(
    () => activeTab.value,
    (tab) => {
        visitedTabs[tab] = true;
    },
    { immediate: true },
);

watch(
    () => props.instructor.id,
    () => {
        activeTab.value = 'overview';

        for (const tab of tabs) {
            visitedTabs[tab.value] = tab.value === 'overview';
        }
    },
);

function normalizeTab(value: string): ManagerInstructorDetailsTab {
    return tabs.some((tab) => tab.value === value)
        ? (value as ManagerInstructorDetailsTab)
        : 'overview';
}

function getTabTriggerId(tab: ManagerInstructorDetailsTab): string {
    return `instructor-details-tab-${tab}`;
}

function getTabPanelId(tab: ManagerInstructorDetailsTab): string {
    return `instructor-details-panel-${tab}`;
}

function isTabVisible(tab: ManagerInstructorDetailsTab): boolean {
    return activeTab.value === tab;
}

function handleTabChange(value: string | number): void {
    activeTab.value = normalizeTab(String(value));
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            :title="displayValue(props.instructor.name)"
            eyebrow="Instruktor"
        >
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="h-10 rounded-lg px-4 font-semibold shadow-xs"
                >
                    <NuxtLink
                        :to="backToListTo"
                        aria-label="Wróć do listy instruktorów"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista instruktorów
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div
            class="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]"
        >
            <aside class="min-w-0 space-y-5 xl:sticky xl:top-6 xl:self-start">
                <ManagerInstructorProfileCard
                    :initials="initials"
                    :avatar-url="props.instructor.avatarUrl"
                    :name="displayValue(props.instructor.name)"
                    :category-label="categoryLabel"
                    :profile-rows="profileRows"
                    :has-qualified-course-types="
                        props.instructor.qualifiedCourseTypes.length > 0
                    "
                />
            </aside>

            <main class="min-w-0">
                <TabsRoot
                    :model-value="activeTab"
                    class="min-w-0 space-y-5"
                    @update:model-value="handleTabChange"
                >
                    <div
                        class="border-border overflow-x-auto border-b"
                        aria-label="Sekcje kartoteki instruktora"
                    >
                        <TabsList class="flex min-w-max gap-5">
                            <TabsTrigger
                                v-for="tab in tabs"
                                :id="getTabTriggerId(tab.value)"
                                :key="tab.value"
                                :value="tab.value"
                                :aria-controls="getTabPanelId(tab.value)"
                                class="text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground focus-visible:ring-ring -mb-px cursor-pointer border-b-2 border-transparent px-1 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                {{ tab.label }}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <section
                        v-if="visitedTabs.overview"
                        :id="getTabPanelId('overview')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('overview')"
                        :hidden="!isTabVisible('overview')"
                        class="space-y-5"
                    >
                        <section
                            class="border-border bg-card rounded-lg border shadow-xs"
                            aria-labelledby="instructor-overview-availability-heading"
                        >
                            <div
                                class="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                            >
                                <div class="min-w-0 space-y-1">
                                    <h2
                                        id="instructor-overview-availability-heading"
                                        class="text-foreground text-base font-semibold"
                                    >
                                        Dostępność tygodniowa
                                    </h2>
                                    <p class="text-muted-foreground text-sm">
                                        Szybki podgląd wzorca pracy instruktora.
                                    </p>
                                </div>
                                <UiButton
                                    as-child
                                    variant="outline"
                                    size="sm"
                                    class="w-fit rounded-lg"
                                    :class="actionDisabledClass"
                                >
                                    <NuxtLink
                                        :to="availabilityTo"
                                        :tabindex="props.isDeleting ? -1 : 0"
                                        :aria-disabled="props.isDeleting"
                                    >
                                        <CalendarDays
                                            class="mr-2 size-4"
                                            aria-hidden="true"
                                        />
                                        Dostępność
                                    </NuxtLink>
                                </UiButton>
                            </div>
                            <div class="p-5">
                                <p class="text-muted-foreground text-sm">
                                    Pełny edytor dostępności oraz najbliższe
                                    sloty są w powiązanych widokach instruktora.
                                </p>
                            </div>
                        </section>

                        <section
                            class="border-border bg-card rounded-lg border shadow-xs"
                            aria-labelledby="instructor-overview-ratings-heading"
                        >
                            <div
                                class="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                            >
                                <div class="min-w-0 space-y-1">
                                    <h2
                                        id="instructor-overview-ratings-heading"
                                        class="text-foreground text-base font-semibold"
                                    >
                                        Opinie o lekcjach
                                    </h2>
                                    <p class="text-muted-foreground text-sm">
                                        Średnia i liczba ocen przypisanych do
                                        instruktora.
                                    </p>
                                </div>
                                <UiButton
                                    v-if="reviewsTo"
                                    as-child
                                    variant="outline"
                                    size="sm"
                                    class="w-fit rounded-lg"
                                    :class="actionDisabledClass"
                                >
                                    <NuxtLink
                                        :to="reviewsTo"
                                        :tabindex="props.isDeleting ? -1 : 0"
                                        :aria-disabled="props.isDeleting"
                                    >
                                        <MessageSquare
                                            class="mr-2 size-4"
                                            aria-hidden="true"
                                        />
                                        Opinie
                                    </NuxtLink>
                                </UiButton>
                            </div>
                            <div class="p-5">
                                <div class="flex items-start gap-3">
                                    <Star
                                        class="text-info-700 dark:text-info-300 mt-1 size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <div class="min-w-0">
                                        <p
                                            class="text-foreground text-xl font-semibold"
                                        >
                                            {{ ratingAverageLabel }}
                                        </p>
                                        <p
                                            class="text-muted-foreground text-sm"
                                        >
                                            {{ ratingsCountLabel }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </section>

                    <section
                        v-if="visitedTabs.availability"
                        :id="getTabPanelId('availability')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('availability')"
                        :hidden="!isTabVisible('availability')"
                    >
                        <UiCard class="overflow-hidden rounded-lg shadow-xs">
                            <UiCardHeader
                                class="border-border flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between"
                            >
                                <div>
                                    <UiCardTitle class="text-lg font-bold">
                                        Dostępność tygodniowa
                                    </UiCardTitle>
                                    <UiCardDescription class="mt-1">
                                        Szybki podgląd wzorca pracy. Pełna
                                        edycja jest w osobnym widoku.
                                    </UiCardDescription>
                                </div>
                                <UiButton
                                    as-child
                                    variant="outline"
                                    class="h-10 rounded-lg px-4 font-semibold"
                                    :class="actionDisabledClass"
                                >
                                    <NuxtLink
                                        :to="availabilityTo"
                                        :tabindex="props.isDeleting ? -1 : 0"
                                        :aria-disabled="props.isDeleting"
                                    >
                                        Edytuj dostępność
                                    </NuxtLink>
                                </UiButton>
                            </UiCardHeader>
                            <UiCardContent class="p-5">
                                <ManagerInstructorWeeklyAvailabilityPreview
                                    :instructor-id="props.instructor.id"
                                />
                            </UiCardContent>
                        </UiCard>
                    </section>

                    <section
                        v-if="visitedTabs.related"
                        :id="getTabPanelId('related')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('related')"
                        :hidden="!isTabVisible('related')"
                    >
                        <ManagerInstructorRelatedDataCard
                            :links="relatedLinks"
                            :reviews-to="reviewsTo"
                            :action-disabled-class="actionDisabledClass"
                            :is-deleting="props.isDeleting"
                        />
                    </section>

                    <section
                        v-if="visitedTabs.details"
                        :id="getTabPanelId('details')"
                        role="tabpanel"
                        :aria-labelledby="getTabTriggerId('details')"
                        :hidden="!isTabVisible('details')"
                    >
                        <ManagerInstructorContactQualificationsCard
                            :instructor="props.instructor"
                            :is-submitting="props.isSubmitting"
                            :is-deleting="props.isDeleting"
                            @edit="emit('edit')"
                            @delete="emit('delete')"
                        />
                    </section>
                </TabsRoot>
            </main>
        </div>
    </div>
</template>
