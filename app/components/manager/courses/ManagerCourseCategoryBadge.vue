<script setup lang="ts">
import AppCourseTypeBadges from '~/components/app/AppCourseTypeBadges.vue';
import type { CourseTypeOption } from '~/types/courses/courseType';

const props = defineProps<{
    category: string;
    courseType: CourseTypeOption | null;
}>();

const categoryBadge = computed<CourseTypeOption[]>(() => [
    {
        id: props.courseType?.id ?? props.category,
        code: props.category,
        name:
            props.courseType?.code.toUpperCase() ===
            props.category.toUpperCase()
                ? props.courseType.name
                : props.category,
    },
]);
</script>

<template>
    <AppCourseTypeBadges
        :course-types="categoryBadge"
        group-label="Kategoria kursu"
        empty-label="Brak kategorii"
    />
</template>
