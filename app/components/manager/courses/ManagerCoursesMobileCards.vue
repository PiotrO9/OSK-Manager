<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';
import AppListAvatar from '~/components/app/AppListAvatar.vue';
import {
    formatCourseKindLabel,
    type CourseListItem,
} from '~/types/courses/course';
import {
    formatInstructorCell,
    getCourseInstructorInitials,
} from '~/utils/courses/managerCoursesList';
defineProps<{ courses: CourseListItem[]; activeSchoolId: string }>();
</script>
<template>
    <div class="divide-border divide-y @3xl:hidden">
        <article
            v-for="course in courses"
            :key="course.id"
            class="space-y-4 px-4 py-4 sm:px-5"
        >
            <NuxtLink
                :to="{
                    path: `/manager/courses/${course.id}`,
                    query: { schoolId: activeSchoolId },
                }"
                class="hover:text-primary focus-visible:ring-ring block rounded-sm font-semibold wrap-anywhere outline-none hover:underline focus-visible:ring-2"
                >{{ course.name }}</NuxtLink
            >
            <div class="flex flex-wrap items-center gap-2">
                <StatusBadge
                    :label="`Kat. ${course.category}`"
                    tone="neutral"
                    subtle
                />
                <StatusBadge
                    :label="formatCourseKindLabel(course.type)"
                    :tone="
                        course.type === 'PRACTICAL'
                            ? 'info'
                            : course.type === 'THEORY_GROUP'
                              ? 'warning'
                              : 'success'
                    "
                    subtle
                />
                <span class="text-muted-foreground text-sm tabular-nums"
                    >{{ course.totalHours }} h</span
                >
            </div>
            <div class="flex min-w-0 items-center gap-2">
                <AppListAvatar
                    v-if="course.instructor"
                    :src="course.instructor.avatarUrl"
                    :initials="getCourseInstructorInitials(course)"
                    :size="32"
                />
                <span
                    class="text-muted-foreground min-w-0 text-sm wrap-anywhere"
                    >{{ formatInstructorCell(course) }}</span
                >
            </div>
            <UiButton as-child variant="outline" class="h-11 w-full gap-2">
                <NuxtLink
                    :to="{
                        path: `/manager/courses/${course.id}`,
                        query: { schoolId: activeSchoolId },
                    }"
                    :aria-label="`Szczegóły kursu: ${course.name}`"
                    >Szczegóły kursu<ArrowUpRight
                        class="size-4"
                        aria-hidden="true"
                /></NuxtLink>
            </UiButton>
        </article>
    </div>
</template>
