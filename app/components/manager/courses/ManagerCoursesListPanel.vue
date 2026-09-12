<script setup lang="ts">
import { Building2, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { CourseListItem } from '~/types/courses/course';
import { useManagerCoursesFilters } from '~/composables/courses/useManagerCoursesFilters';

const props = withDefaults(
    defineProps<{
        schools: DrivingSchool[];
        courses: CourseListItem[];
        activeSchoolId: string;
        isSchoolsLoading?: boolean;
        isCoursesLoading?: boolean;
        schoolsLoadError?: string | null;
        coursesLoadError?: string | null;
    }>(),
    {
        isSchoolsLoading: false,
        isCoursesLoading: false,
        schoolsLoadError: null,
        coursesLoadError: null,
    },
);
const emit = defineEmits<{
    activeSchoolChange: [value: string];
    retrySchools: [];
    retryCourses: [];
}>();
const activeSchool = computed(() =>
    props.schools.find((school) => school.id === props.activeSchoolId),
);
const activeSchoolModel = computed({
    get: () => props.activeSchoolId,
    set: (value: string) => emit('activeSchoolChange', value),
});
const createTarget = computed(() => ({
    path: '/manager/courses/new',
    query: { schoolId: props.activeSchoolId },
}));
const isBusy = computed(() => props.isSchoolsLoading || props.isCoursesLoading);
const unavailable = computed(
    () =>
        isBusy.value ||
        Boolean(props.schoolsLoadError || props.coursesLoadError) ||
        !props.activeSchoolId,
);
const {
    search,
    quickView,
    category,
    filters,
    draft,
    error,
    page,
    totalPages,
    categories,
    instructors,
    filteredCourses,
    visibleCourses,
    hasActiveFilters,
    startNew,
    startEdit,
    updateDraft,
    apply,
    remove,
    clearAdvanced,
    clearAll,
} = useManagerCoursesFilters(
    toRef(props, 'courses'),
    toRef(props, 'activeSchoolId'),
);
</script>

<template>
    <div class="min-w-0 space-y-5">
        <PageHeader
            title="Kursy"
            description="Oferta szkoleniowa Twojej szkoły jazdy."
        >
            <template #actions>
                <UiButton
                    v-if="activeSchoolId && !isBusy && !schoolsLoadError"
                    as-child
                    class="h-11 gap-2 sm:h-10"
                >
                    <NuxtLink :to="createTarget"
                        ><Plus class="size-4" aria-hidden="true" />Dodaj
                        kurs</NuxtLink
                    >
                </UiButton>
                <UiButton v-else disabled class="h-11 gap-2 sm:h-10"
                    ><Plus class="size-4" aria-hidden="true" />Dodaj
                    kurs</UiButton
                >
            </template>
        </PageHeader>
        <section
            class="border-border bg-card min-w-0 overflow-hidden rounded-xl border shadow-xs"
            aria-label="Baza kursów"
            :aria-busy="isBusy"
        >
            <FilterBar
                title=""
                class="rounded-t-xl border-0 border-b px-4 py-4 shadow-none sm:px-5"
                :is-loading="isBusy"
                aria-label="Szkoła jazdy"
            >
                <div
                    class="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                >
                    <div
                        v-if="schools.length > 1"
                        class="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 lg:max-w-sm lg:flex-1"
                    >
                        <UiLabel
                            for="courses-school"
                            class="text-muted-foreground shrink-0 text-xs"
                            >Szkoła jazdy</UiLabel
                        >
                        <UiSelect
                            v-model="activeSchoolModel"
                            :disabled="isSchoolsLoading"
                        >
                            <UiSelectTrigger
                                id="courses-school"
                                class="h-11 w-full min-w-0 sm:h-9"
                                ><UiSelectValue placeholder="Wybierz OSK"
                            /></UiSelectTrigger>
                            <UiSelectContent
                                ><UiSelectItem
                                    v-for="school in schools"
                                    :key="school.id"
                                    :value="school.id"
                                    >{{ school.name
                                    }}{{
                                        school.city ? ` (${school.city})` : ''
                                    }}</UiSelectItem
                                ></UiSelectContent
                            >
                        </UiSelect>
                    </div>
                    <div v-else class="flex min-w-0 items-center gap-3">
                        <span
                            class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                            ><Building2 class="size-4" aria-hidden="true"
                        /></span>
                        <div class="min-w-0">
                            <p class="text-muted-foreground text-xs">
                                Szkoła jazdy
                            </p>
                            <p
                                class="text-foreground text-sm font-semibold wrap-anywhere"
                            >
                                {{
                                    activeSchool?.name ?? 'Brak wybranej szkoły'
                                }}
                            </p>
                        </div>
                    </div>
                </div>
            </FilterBar>
            <div class="border-border space-y-3 border-b px-4 py-3 sm:px-5">
                <ManagerCoursesFilters
                    v-model:search="search"
                    v-model:quick-view="quickView"
                    v-model:category="category"
                    :categories="categories"
                    :disabled="unavailable"
                    :has-active-filters="hasActiveFilters"
                    @clear="clearAll"
                />
                <ManagerCoursesAdvancedFilters
                    :filters="filters"
                    :draft="draft"
                    :categories="categories"
                    :instructors="instructors"
                    :error="error"
                    :disabled="unavailable"
                    @start-new="startNew"
                    @start-edit="startEdit"
                    @update-draft="updateDraft"
                    @apply="apply"
                    @cancel="startNew"
                    @remove="remove"
                    @clear="clearAdvanced"
                />
            </div>
            <ManagerCoursesStats
                :courses="filteredCourses"
                :total="courses.length"
                :unavailable="unavailable"
            />
            <LoadingState
                v-if="isSchoolsLoading"
                class="m-4 border-0 shadow-none"
                title="Wczytywanie szkół jazdy"
                :show-labels="false"
            />
            <ErrorState
                v-else-if="schoolsLoadError"
                class="m-4"
                title="Nie udało się wczytać szkół jazdy"
                :description="schoolsLoadError"
                @retry="emit('retrySchools')"
            />
            <EmptyState
                v-else-if="!schools.length"
                class="m-4"
                title="Brak szkół jazdy"
                description="Brak szkoły jazdy przypisanej do konta."
            />
            <LoadingState
                v-else-if="isCoursesLoading"
                class="m-4 border-0 shadow-none"
                title="Wczytywanie kursów"
                :show-labels="false"
            />
            <ErrorState
                v-else-if="coursesLoadError"
                class="m-4"
                title="Nie udało się wczytać kursów"
                :description="coursesLoadError"
                @retry="emit('retryCourses')"
            />
            <EmptyState
                v-else-if="!activeSchoolId"
                class="m-4"
                title="Nie wybrano szkoły jazdy"
            />
            <EmptyState
                v-else-if="!filteredCourses.length"
                class="m-4"
                :title="
                    hasActiveFilters
                        ? 'Brak wyników wyszukiwania'
                        : 'Brak kursów'
                "
                :description="
                    hasActiveFilters
                        ? 'Żaden kurs nie spełnia wybranych kryteriów.'
                        : 'W wybranej szkole nie ma jeszcze kursów.'
                "
            >
                <template #action>
                    <UiButton
                        v-if="hasActiveFilters"
                        variant="outline"
                        @click="clearAll"
                        >Wyczyść filtry</UiButton
                    >
                    <UiButton v-else as-child
                        ><NuxtLink :to="createTarget"
                            >Dodaj kurs</NuxtLink
                        ></UiButton
                    >
                </template>
            </EmptyState>
            <div v-else class="@container">
                <ManagerCoursesDesktopTable
                    :courses="visibleCourses"
                    :active-school-id="activeSchoolId"
                />
                <ManagerCoursesMobileCards
                    :courses="visibleCourses"
                    :active-school-id="activeSchoolId"
                />
            </div>
            <nav
                v-if="!unavailable && totalPages > 1"
                class="border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-5"
                aria-label="Strony listy kursów"
            >
                <p
                    class="text-muted-foreground text-xs tabular-nums"
                    aria-live="polite"
                >
                    Strona {{ page }} z {{ totalPages }}
                </p>
                <div class="flex gap-2">
                    <UiButton
                        variant="outline"
                        size="icon"
                        class="size-11 sm:size-9"
                        :disabled="page <= 1"
                        aria-label="Poprzednia strona"
                        title="Poprzednia strona"
                        @click="page--"
                        ><ChevronLeft class="size-4" aria-hidden="true"
                    /></UiButton>
                    <UiButton
                        variant="outline"
                        size="icon"
                        class="size-11 sm:size-9"
                        :disabled="page >= totalPages"
                        aria-label="Następna strona"
                        title="Następna strona"
                        @click="page++"
                        ><ChevronRight class="size-4" aria-hidden="true"
                    /></UiButton>
                </div>
            </nav>
        </section>
    </div>
</template>
