<script setup lang="ts">
import type { CurrentUserCourseItem } from '~/types/courses/course';

defineProps<{
    course: CurrentUserCourseItem;
}>();
</script>

<template>
    <div class="max-w-56 space-y-1.5">
        <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground text-xs font-medium">
                Realizacja
            </span>
            <span class="text-foreground text-xs font-semibold tabular-nums">
                {{ formatMyCoursesProgressLabel(course) }}
            </span>
        </div>
        <div
            class="bg-muted h-2 w-full overflow-hidden rounded-full"
            role="progressbar"
            :aria-valuenow="course.progress"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Postęp kursu ${course.name}`"
        >
            <div
                class="bg-primary h-full rounded-full"
                :style="{ width: formatMyCoursesProgressLabel(course) }"
            />
        </div>
    </div>
</template>
