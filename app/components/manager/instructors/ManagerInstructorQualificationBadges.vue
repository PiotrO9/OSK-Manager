<script setup lang="ts">
import AppCourseTypeBadges from '~/components/app/AppCourseTypeBadges.vue';
import type { CourseTypeOption } from '~/types/courses/courseType';

const props = defineProps<{
    qualifications: readonly CourseTypeOption[];
}>();
</script>

<template>
    <AppCourseTypeBadges
        :course-types="props.qualifications"
        group-label="Kwalifikacje instruktora"
        empty-label="Brak kwalifikacji"
    />
</template>
