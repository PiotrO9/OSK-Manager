<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { CourseListItem } from '~/types/courses/course';
import {
    countUniqueCategories,
    countUniqueCourseTypes,
    formatCoursesResultsLabel,
} from '~/utils/courses/managerCoursesList';

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

const activeSchoolModel = computed({
    get: () => props.activeSchoolId,
    set: (value: string) => emit('activeSchoolChange', value),
});

const activeSchool = computed(
    () =>
        props.schools.find((school) => school.id === props.activeSchoolId) ??
        null,
);

const createCourseTarget = computed(() => ({
    path: '/manager/courses/new',
    query: props.activeSchoolId ? { schoolId: props.activeSchoolId } : {},
}));

const uniqueCourseTypesCount = computed(() =>
    countUniqueCourseTypes(props.courses),
);

const uniqueCategoriesCount = computed(() =>
    countUniqueCategories(props.courses),
);

const resultsLabel = computed(() => {
    return formatCoursesResultsLabel(props.courses.length);
});

const isBusy = computed(() => props.isSchoolsLoading || props.isCoursesLoading);

const hasNoSchools = computed(
    () =>
        !props.isSchoolsLoading &&
        !props.schoolsLoadError &&
        props.schools.length === 0,
);
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Kursy"
            description="Oferta szkoleniowa, kategorie i aktywne grupy."
        >
            <template #actions>
                <UiButton
                    as-child
                    :disabled="!props.activeSchoolId || isBusy"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="createCourseTarget"
                        class="inline-flex items-center justify-center gap-2"
                        :class="
                            !props.activeSchoolId || isBusy
                                ? 'pointer-events-none opacity-50'
                                : ''
                        "
                        :aria-disabled="!props.activeSchoolId || isBusy"
                        aria-label="Utworz nowy kurs w wybranej szkole"
                    >
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj kurs
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <ManagerCoursesStats :courses="props.courses" />

        <section
            class="border-border bg-background overflow-hidden rounded-2xl border shadow-sm"
            :aria-busy="isBusy"
        >
            <div
                class="border-border flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
            >
                <div class="flex min-w-0 flex-wrap items-center gap-2">
                    <p class="text-foreground mr-1 text-sm font-extrabold">
                        Filtry
                    </p>

                    <UiSelect
                        v-if="props.schools.length > 1"
                        v-model="activeSchoolModel"
                        :disabled="isBusy"
                    >
                        <UiSelectTrigger
                            class="h-8 w-auto min-w-36 rounded-full border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-700"
                            aria-label="Wybierz szkole jazdy do listy kursów"
                        >
                            <UiSelectValue placeholder="Wybierz OSK" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="school in props.schools"
                                    :key="school.id"
                                    :value="school.id"
                                >
                                    {{ school.name
                                    }}{{
                                        school.city && school.city.length > 0
                                            ? ` (${school.city})`
                                            : ''
                                    }}
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                    <UiBadge
                        v-else
                        variant="outline"
                        class="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                    >
                        {{ activeSchool?.name ?? 'OSK' }}
                    </UiBadge>

                    <UiBadge
                        variant="outline"
                        class="bg-muted/40 rounded-full px-3 py-1"
                    >
                        Kategorie: {{ uniqueCategoriesCount || 'brak' }}
                    </UiBadge>
                    <UiBadge
                        variant="outline"
                        class="bg-muted/40 rounded-full px-3 py-1"
                    >
                        Typy: {{ uniqueCourseTypesCount || 'brak' }}
                    </UiBadge>
                </div>

                <p
                    class="text-muted-foreground text-sm font-semibold tabular-nums"
                    aria-live="polite"
                >
                    {{ resultsLabel }}
                </p>
            </div>

            <div class="p-4 pt-3">
                <div v-if="props.isSchoolsLoading" class="space-y-3">
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                </div>

                <ErrorState
                    v-else-if="props.schoolsLoadError"
                    title="Nie udało się wczytać szkół jazdy"
                    :description="props.schoolsLoadError"
                    @retry="emit('retrySchools')"
                />

                <EmptyState
                    v-else-if="hasNoSchools"
                    title="Brak szkół jazdy"
                    description="Dodaj OSK w panelu szkół, aby wyświetlić liste kursów."
                />

                <ErrorState
                    v-else-if="props.coursesLoadError"
                    title="Nie udało się wczytać kursów"
                    :description="props.coursesLoadError"
                    @retry="emit('retryCourses')"
                />

                <div
                    v-else-if="props.isCoursesLoading"
                    class="space-y-3"
                    role="status"
                >
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                </div>

                <EmptyState
                    v-else-if="props.courses.length === 0"
                    title="Brak kursów"
                    description="W wybranej szkole nie ma jeszcze kursów."
                />

                <template v-else>
                    <ManagerCoursesDesktopTable
                        :courses="props.courses"
                        :active-school-id="props.activeSchoolId"
                        :active-school-name="activeSchool?.name ?? null"
                    />

                    <ManagerCoursesMobileCards
                        :courses="props.courses"
                        :active-school-id="props.activeSchoolId"
                        :active-school-name="activeSchool?.name ?? null"
                    />
                </template>
            </div>
        </section>
    </div>
</template>
