<script setup lang="ts">
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
    <div
        class="border-border hidden overflow-hidden rounded-xl border md:block"
    >
        <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-muted/40 text-muted-foreground border-b">
                <tr>
                    <th scope="col" class="px-4 py-3 font-semibold">Nazwa</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Zakres</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Typ</th>
                    <th scope="col" class="px-4 py-3 font-semibold">
                        Instruktor
                    </th>
                    <th scope="col" class="px-4 py-3 font-semibold">Akcje</th>
                </tr>
            </thead>
            <tbody class="divide-border divide-y">
                <tr
                    v-for="course in props.courses"
                    :key="course.id"
                    class="hover:bg-muted/30"
                >
                    <td class="px-4 py-3">
                        <div class="min-w-0">
                            <p class="text-foreground truncate font-extrabold">
                                {{ course.name }}
                            </p>
                            <p class="text-muted-foreground mt-0.5 text-xs">
                                {{ formatCourseSubtitle(course) }}
                            </p>
                        </div>
                    </td>
                    <td class="text-muted-foreground px-4 py-3">
                        {{ props.activeSchoolName ?? course.category }}
                    </td>
                    <td class="px-4 py-3">
                        <UiBadge
                            variant="outline"
                            class="rounded-full"
                            :class="courseTypeBadgeClasses(course)"
                        >
                            {{ formatCourseKindLabel(course.type) }}
                        </UiBadge>
                    </td>
                    <td class="text-muted-foreground px-4 py-3">
                        {{ formatInstructorCell(course) }}
                    </td>
                    <td class="px-4 py-3">
                        <UiButton
                            as-child
                            variant="outline"
                            size="sm"
                            class="rounded-full"
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
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
