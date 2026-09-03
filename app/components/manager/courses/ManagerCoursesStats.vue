<script setup lang="ts">
import type { CourseListItem } from '~/types/courses/course';
import {
    countCoursesWithInstructor,
    countUniqueCategories,
    countUniqueCourseTypes,
} from '~/utils/courses/managerCoursesList';

const props = defineProps<{
    courses: CourseListItem[];
}>();

const uniqueCourseTypesCount = computed(() =>
    countUniqueCourseTypes(props.courses),
);

const uniqueCategoriesCount = computed(() =>
    countUniqueCategories(props.courses),
);

const coursesWithInstructorCount = computed(() =>
    countCoursesWithInstructor(props.courses),
);
</script>

<template>
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
            <p class="text-muted-foreground text-sm font-medium">Kategorie</p>
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
</template>
