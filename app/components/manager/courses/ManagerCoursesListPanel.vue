<script setup lang="ts">
import { BookOpen, Plus } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/drivingSchool';
import { formatCourseKindLabel, type CourseListItem } from '~/types/course';

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

const uniqueCourseTypesCount = computed(
    () => new Set(props.courses.map((course) => course.type)).size,
);

const uniqueCategoriesCount = computed(
    () => new Set(props.courses.map((course) => course.category)).size,
);

const coursesWithInstructorCount = computed(
    () => props.courses.filter((course) => course.instructor !== null).length,
);

const resultsLabel = computed(() => {
    const count = props.courses.length;

    if (count === 1) {
        return '1 wynik';
    }

    if (count > 1 && count < 5) {
        return `${count} wyniki`;
    }

    return `${count} wynikow`;
});

const isBusy = computed(() => props.isSchoolsLoading || props.isCoursesLoading);

const hasNoSchools = computed(
    () =>
        !props.isSchoolsLoading &&
        !props.schoolsLoadError &&
        props.schools.length === 0,
);

function formatCourseSubtitle(course: CourseListItem): string {
    return `${course.totalHours} h - ${formatCourseKindLabel(course.type)}`;
}

function formatInstructorCell(course: CourseListItem): string {
    const name = course.instructor?.name?.trim();

    if (name && name.length > 0) {
        return name;
    }

    return 'Brak instruktora';
}

function courseTypeBadgeClasses(course: CourseListItem): string {
    if (course.type === 'PRACTICAL') {
        return 'border-sky-200 bg-sky-50 text-sky-700';
    }

    if (course.type === 'THEORY_GROUP') {
        return 'border-amber-200 bg-amber-50 text-amber-700';
    }

    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}
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

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">Kursy</p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ props.courses.length }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">Typy</p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ uniqueCourseTypesCount }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Kategorie
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ uniqueCategoriesCount }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Z instruktorem
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ coursesWithInstructorCount }}
                </p>
            </div>
        </div>

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
                            aria-label="Wybierz szkole jazdy do listy kursow"
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
                    title="Nie udalo sie wczytac szkol jazdy"
                    :description="props.schoolsLoadError"
                    @retry="emit('retrySchools')"
                />

                <EmptyState
                    v-else-if="hasNoSchools"
                    title="Brak szkol jazdy"
                    description="Dodaj OSK w panelu szkol, aby wyswietlic liste kursow."
                />

                <ErrorState
                    v-else-if="props.coursesLoadError"
                    title="Nie udalo sie wczytac kursow"
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
                    title="Brak kursow"
                    description="W wybranej szkole nie ma jeszcze kursow."
                />

                <template v-else>
                    <div
                        class="border-border hidden overflow-hidden rounded-xl border md:block"
                    >
                        <table class="w-full min-w-[760px] text-left text-sm">
                            <thead
                                class="bg-muted/40 text-muted-foreground border-b"
                            >
                                <tr>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Nazwa
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Zakres
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Typ
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Instruktor
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Akcje
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-border divide-y">
                                <tr
                                    v-for="course in props.courses"
                                    :key="course.id"
                                    class="hover:bg-muted/30"
                                >
                                    <td class="px-4 py-3">
                                        <div class="min-w-0">
                                            <p
                                                class="text-foreground truncate font-extrabold"
                                            >
                                                {{ course.name }}
                                            </p>
                                            <p
                                                class="text-muted-foreground mt-0.5 text-xs"
                                            >
                                                {{
                                                    formatCourseSubtitle(course)
                                                }}
                                            </p>
                                        </div>
                                    </td>
                                    <td class="text-muted-foreground px-4 py-3">
                                        {{
                                            activeSchool?.name ??
                                            course.category
                                        }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <UiBadge
                                            variant="outline"
                                            class="rounded-full"
                                            :class="
                                                courseTypeBadgeClasses(course)
                                            "
                                        >
                                            {{
                                                formatCourseKindLabel(
                                                    course.type,
                                                )
                                            }}
                                        </UiBadge>
                                    </td>
                                    <td class="text-muted-foreground px-4 py-3">
                                        {{ formatInstructorCell(course) }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <UiButton
                                            as-child
                                            variant="outline"
                                            size="sm"
                                            class="rounded-full"
                                        >
                                            <NuxtLink
                                                :to="{
                                                    path: `/manager/courses/${course.id}`,
                                                    query: props.activeSchoolId
                                                        ? {
                                                              schoolId:
                                                                  props.activeSchoolId,
                                                          }
                                                        : undefined,
                                                }"
                                                :aria-label="`Szczegoly kursu: ${course.name}`"
                                            >
                                                Szczegoly
                                            </NuxtLink>
                                        </UiButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="space-y-3 md:hidden">
                        <article
                            v-for="course in props.courses"
                            :key="course.id"
                            class="border-border rounded-2xl border p-4"
                        >
                            <div class="flex items-start gap-3">
                                <div
                                    class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                                >
                                    <BookOpen
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p class="truncate font-extrabold">
                                        {{ course.name }}
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-1 text-sm"
                                    >
                                        {{ formatCourseSubtitle(course) }}
                                    </p>
                                </div>
                            </div>

                            <div class="mt-3 flex flex-wrap gap-2">
                                <UiBadge
                                    variant="outline"
                                    class="rounded-full"
                                    :class="courseTypeBadgeClasses(course)"
                                >
                                    {{ formatCourseKindLabel(course.type) }}
                                </UiBadge>
                                <UiBadge
                                    variant="outline"
                                    class="bg-muted/40 rounded-full"
                                >
                                    {{ activeSchool?.name ?? course.category }}
                                </UiBadge>
                                <UiBadge
                                    variant="outline"
                                    class="bg-muted/40 rounded-full"
                                >
                                    {{ formatInstructorCell(course) }}
                                </UiBadge>
                            </div>

                            <UiButton
                                as-child
                                variant="outline"
                                size="sm"
                                class="mt-4 w-full rounded-xl"
                            >
                                <NuxtLink
                                    :to="{
                                        path: `/manager/courses/${course.id}`,
                                        query: props.activeSchoolId
                                            ? { schoolId: props.activeSchoolId }
                                            : undefined,
                                    }"
                                    :aria-label="`Szczegoly kursu: ${course.name}`"
                                >
                                    Szczegoly
                                </NuxtLink>
                            </UiButton>
                        </article>
                    </div>
                </template>
            </div>
        </section>
    </div>
</template>
