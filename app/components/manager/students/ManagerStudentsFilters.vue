<script setup lang="ts">
import { Building2, SlidersHorizontal, X } from 'lucide-vue-next';
import type { CourseListItem } from '~/types/courses/course';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

interface Props {
    schools: readonly DrivingSchool[];
    courses: readonly CourseListItem[];
    activeSchoolId: string;
    activeCourseId: string;
    activeSchoolName: string | null;
    isStudentsLoading: boolean;
    isCoursesLoading: boolean;
}
defineProps<Props>();

const emit = defineEmits<{
    'update:activeSchoolId': [value: string];
    'update:activeCourseId': [value: string];
    schoolChange: [];
    courseChange: [];
}>();

function toSelectId(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function handleSchoolUpdate(value: unknown) {
    const id = toSelectId(value);

    if (!id) return;

    emit('update:activeSchoolId', id);
    emit('schoolChange');
}

function handleCourseUpdate(value: unknown) {
    emit('update:activeCourseId', toSelectId(value));
    emit('courseChange');
}
</script>

<template>
    <FilterBar
        title=""
        class="rounded-t-xl border-0 border-b px-4 py-4 shadow-none sm:px-5"
        :is-loading="isStudentsLoading || isCoursesLoading"
        aria-label="Filtry listy kursantów"
    >
        <div
            class="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
            <div
                v-if="schools.length > 1"
                class="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 lg:max-w-sm lg:flex-1"
            >
                <UiLabel
                    for="students-page-school"
                    class="text-muted-foreground shrink-0 text-xs"
                    >Szkoła jazdy</UiLabel
                >
                <UiSelect
                    :model-value="activeSchoolId"
                    :disabled="isStudentsLoading || isCoursesLoading"
                    @update:model-value="handleSchoolUpdate"
                >
                    <UiSelectTrigger
                        id="students-page-school"
                        class="h-11 w-full min-w-0 sm:h-9"
                        aria-label="Wybierz szkołę jazdy do podglądu listy kursantów"
                    >
                        <UiSelectValue placeholder="Wybierz szkołę" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem
                                v-for="school in schools"
                                :key="school.id"
                                :value="school.id"
                            >
                                {{ school.name
                                }}{{ school.city ? ` (${school.city})` : '' }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
            </div>
            <div v-else class="flex min-w-0 items-center gap-3">
                <span
                    class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                    ><Building2 class="size-4" aria-hidden="true"
                /></span>
                <div class="min-w-0">
                    <p class="text-muted-foreground text-xs">Szkoła jazdy</p>
                    <p
                        class="text-foreground text-sm font-semibold wrap-anywhere"
                    >
                        {{ activeSchoolName ?? 'Brak wybranej szkoły' }}
                    </p>
                </div>
            </div>
            <div
                class="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 lg:w-80 lg:shrink-0"
            >
                <UiLabel
                    for="students-page-course-filter"
                    class="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs"
                    ><SlidersHorizontal
                        class="size-3.5"
                        aria-hidden="true"
                    />Kurs</UiLabel
                >
                <div class="flex min-w-0 flex-1 items-center gap-1">
                    <UiSelect
                        :model-value="activeCourseId"
                        :disabled="
                            isStudentsLoading ||
                            isCoursesLoading ||
                            !activeSchoolId
                        "
                        @update:model-value="handleCourseUpdate"
                    >
                        <UiSelectTrigger
                            id="students-page-course-filter"
                            class="h-11 w-full min-w-0 sm:h-9"
                            aria-label="Wybierz kurs do filtrowania listy kursantów lub pozostaw wszystkie kursy"
                        >
                            <UiSelectValue placeholder="Wszystkie kursy" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="course in courses"
                                    :key="course.id"
                                    :value="course.id"
                                    >{{ course.name }} ({{
                                        course.category
                                    }})</UiSelectItem
                                >
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                    <UiButton
                        v-if="activeCourseId"
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="size-11 shrink-0 sm:size-9"
                        :disabled="isStudentsLoading || isCoursesLoading"
                        aria-label="Wyczyść filtr kursu"
                        title="Wszystkie kursy"
                        @click="handleCourseUpdate('')"
                        ><X class="size-4" aria-hidden="true"
                    /></UiButton>
                </div>
            </div>
        </div>
    </FilterBar>
</template>
