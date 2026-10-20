<script setup lang="ts">
import { appPaths } from '~~/shared/routing/appPaths';
import { ArrowUpRight, Trash2 } from '@lucide/vue';
import AppUserIdentity from '~/components/app/AppUserIdentity.vue';
import ManagerCourseCategoryBadge from './ManagerCourseCategoryBadge.vue';
import {
    formatCourseKindLabel,
    type CourseListItem,
} from '~/types/courses/course';
import {
    formatInstructorCell,
    getCourseInstructorInitials,
} from '~/utils/courses/managerCoursesList';
defineProps<{ courses: CourseListItem[] }>();
const emit = defineEmits<{ requestDelete: [course: CourseListItem] }>();
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
                    path: appPaths.managerCourse(course.id),
                }"
                class="hover:text-primary focus-visible:ring-ring block rounded-sm font-semibold wrap-anywhere outline-none hover:underline focus-visible:ring-2"
                >{{ course.name }}</NuxtLink
            >
            <div class="flex flex-wrap items-center gap-2">
                <ManagerCourseCategoryBadge
                    :category="course.category"
                    :course-type="course.courseType"
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
            <div>
                <AppUserIdentity
                    v-if="course.instructor"
                    :avatar-src="course.instructor.avatarUrl"
                    :initials="getCourseInstructorInitials(course)"
                    :avatar-size="32"
                    :name="formatInstructorCell(course)"
                />
                <span
                    v-else
                    class="text-muted-foreground min-w-0 text-sm wrap-anywhere"
                    >{{ formatInstructorCell(course) }}</span
                >
            </div>
            <div class="flex gap-2">
                <UiButton as-child variant="outline" class="h-11 flex-1 gap-2">
                    <NuxtLink
                        :to="{
                            path: appPaths.managerCourse(course.id),
                        }"
                        :aria-label="`Szczegóły kursu: ${course.name}`"
                        >Szczegóły kursu<ArrowUpRight
                            class="size-4"
                            aria-hidden="true"
                    /></NuxtLink>
                </UiButton>
                <UiButton as-child variant="outline" class="h-11 flex-1">
                    <NuxtLink :to="appPaths.managerCourseEdit(course.id)"
                        >Edytuj kurs</NuxtLink
                    >
                </UiButton>
            </div>
            <UiButton
                variant="outline"
                class="text-destructive hover:text-destructive h-11 w-full gap-2"
                :aria-label="`Usuń kurs: ${course.name}`"
                @click="emit('requestDelete', course)"
            >
                <Trash2 class="size-4" aria-hidden="true" />Usuń kurs
            </UiButton>
        </article>
    </div>
</template>
