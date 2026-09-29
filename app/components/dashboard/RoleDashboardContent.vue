<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import InstructorDashboardContent from './InstructorDashboardContent.vue';
import StudentDashboardContent from './StudentDashboardContent.vue';

const props = defineProps<{
    role: 'STUDENT' | 'INSTRUCTOR';
    schools: readonly DrivingSchool[];
}>();

const dashboard = useRoleDashboardPage(() => props.role);
</script>

<template>
    <StudentDashboardContent
        v-if="role === 'STUDENT'"
        :schools="schools"
        :next-item="dashboard.nextItem.value"
        :upcoming-count="dashboard.upcomingItems.value.length"
        :featured-course="dashboard.featuredCourse.value"
        :payment-summary="dashboard.paymentSummary.value"
        :is-loading="dashboard.isLoading.value"
        :error-message="dashboard.errorMessage.value"
        @retry="dashboard.load"
    />

    <InstructorDashboardContent
        v-else
        :schools="schools"
        :next-item="dashboard.nextItem.value"
        :today-count="dashboard.todayItems.value.length"
        :schedule-count="dashboard.scheduleItems.value.length"
        :average-rating="dashboard.averageRating.value"
        :ratings-count="dashboard.ratings.value.length"
        :is-loading="dashboard.isLoading.value"
        :error-message="dashboard.errorMessage.value"
        @retry="dashboard.load"
    />
</template>
