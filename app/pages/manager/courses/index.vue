<script setup lang="ts">
import { useManagerCoursesPage } from '~/composables/courses/useManagerCoursesPage';

definePageMeta({ layout: 'app-shell', middleware: ['manager'] });
usePageMeta({
    title: () => 'Kursy',
    description: () => 'Lista kursów w wybranej szkole jazdy.',
});
const {
    schools,
    courses,
    activeSchoolId,
    isSchoolsLoading,
    isCoursesLoading,
    schoolsLoadError,
    coursesLoadError,
    handleActiveSchoolChange,
    loadSchools,
    loadCourses,
} = useManagerCoursesPage();
</script>
<template>
    <ManagerCoursesListPanel
        :schools="schools"
        :courses="courses"
        :active-school-id="activeSchoolId"
        :is-schools-loading="isSchoolsLoading"
        :is-courses-loading="isCoursesLoading"
        :schools-load-error="schoolsLoadError"
        :courses-load-error="coursesLoadError"
        @active-school-change="handleActiveSchoolChange"
        @retry-schools="loadSchools"
        @retry-courses="loadCourses"
    />
</template>
