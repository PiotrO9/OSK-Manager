<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next';
import {
    formatCourseKindLabel,
    type CourseListItem,
} from '~/types/courses/course';
import {
    courseTypeBadgeClasses,
    formatCourseSubtitle,
    formatInstructorCell,
} from '~/utils/courses/managerCoursesList';

const props = defineProps<{
    courses: CourseListItem[];
    activeSchoolId: string;
    activeSchoolName: string | null;
}>();
</script>

<template>
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
                    <BookOpen class="size-4" aria-hidden="true" />
                </div>
                <div class="min-w-0 flex-1">
                    <p class="truncate font-extrabold">
                        {{ course.name }}
                    </p>
                    <p class="text-muted-foreground mt-1 text-sm">
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
                <UiBadge variant="outline" class="bg-muted/40 rounded-full">
                    {{ props.activeSchoolName ?? course.category }}
                </UiBadge>
                <UiBadge variant="outline" class="bg-muted/40 rounded-full">
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
                    :aria-label="`Szczegóły kursu: ${course.name}`"
                >
                    Szczegóły
                </NuxtLink>
            </UiButton>
        </article>
    </div>
</template>
