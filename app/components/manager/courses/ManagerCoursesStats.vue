<script setup lang="ts">
import type { CourseListItem } from '~/types/courses/course';
import {
    countUniqueCategories,
    countCoursesWithInstructor,
} from '~/utils/courses/managerCoursesList';
const props = defineProps<{
    courses: CourseListItem[];
    total: number;
    unavailable: boolean;
}>();
const categoryCount = computed(() => countUniqueCategories(props.courses));
const unassignedCount = computed(
    () => props.courses.length - countCoursesWithInstructor(props.courses),
);
</script>
<template>
    <div
        class="border-border text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 border-b px-4 py-3 text-xs sm:px-5"
        aria-live="polite"
    >
        <span class="text-foreground font-semibold tabular-nums"
            >{{ unavailable ? '—' : courses.length }} z
            {{ unavailable ? '—' : total }} kursów</span
        >
        <span>W wynikach:</span>
        <span
            >Kategorie
            <strong class="text-foreground ml-1 font-semibold tabular-nums">{{
                unavailable ? '—' : categoryCount
            }}</strong></span
        >
        <span
            >Bez instruktora
            <strong class="text-foreground ml-1 font-semibold tabular-nums">{{
                unavailable ? '—' : unassignedCount
            }}</strong></span
        >
    </div>
</template>
