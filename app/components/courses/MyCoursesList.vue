<script setup lang="ts">
import MyCoursesProgressBar from '~/components/courses/MyCoursesProgressBar.vue';
import { BookOpen } from 'lucide-vue-next';
import type { MyCoursesEmptyState } from '~/composables/courses/useMyCoursesPage';
import {
    formatCourseKindLabel,
    formatCourseParticipantStatusLabel,
    type CurrentUserCourseItem,
} from '~/types/courses/course';
import {
    formatMyCoursesHoursLabel,
    getMyCoursesStatusTone,
} from '~/utils/courses/myCoursesPage';

const props = defineProps<{
    courses: readonly CurrentUserCourseItem[];
    emptyState: MyCoursesEmptyState;
    isLoading: boolean;
    errorMessage: string | null;
}>();

const emit = defineEmits<{
    retry: [];
    showAll: [];
}>();

const hasCourses = computed(() => props.courses.length > 0);
</script>

<template>
    <DataTableShell
        title="Lista kursów"
        :is-loading="props.isLoading"
        :error-message="props.errorMessage"
        :empty-title="props.emptyState.title"
        :empty-description="props.emptyState.description"
        @retry="emit('retry')"
    >
        <template v-if="props.emptyState.canResetFilter" #empty-action>
            <UiButton variant="outline" @click="emit('showAll')">
                Pokaż wszystkie kursy
            </UiButton>
        </template>

        <template v-if="hasCourses" #default>
            <table class="w-full text-left text-sm">
                <thead class="bg-muted/40 text-muted-foreground border-b">
                    <tr>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Kurs
                        </th>
                        <th scope="col" class="px-4 py-3 font-semibold">Typ</th>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Postęp
                        </th>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-border divide-y">
                    <tr
                        v-for="course in props.courses"
                        :key="course.id"
                        class="hover:bg-muted/30"
                    >
                        <td class="px-4 py-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <span
                                    class="bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200 flex size-10 shrink-0 items-center justify-center rounded-xl"
                                    aria-hidden="true"
                                >
                                    <BookOpen class="size-4" />
                                </span>
                                <div class="min-w-0">
                                    <p class="truncate font-extrabold">
                                        {{ course.name }}
                                    </p>
                                    <p
                                        class="text-muted-foreground text-xs tabular-nums"
                                    >
                                        {{ formatMyCoursesHoursLabel(course) }}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap">
                            {{ formatCourseKindLabel(course.type) }}
                        </td>
                        <td class="px-4 py-3">
                            <MyCoursesProgressBar :course="course" />
                        </td>
                        <td class="px-4 py-3">
                            <StatusBadge
                                :label="
                                    formatCourseParticipantStatusLabel(
                                        course.status,
                                    )
                                "
                                :tone="getMyCoursesStatusTone(course.status)"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>

        <template v-if="hasCourses" #mobile>
            <div class="space-y-3 p-4">
                <article
                    v-for="course in props.courses"
                    :key="course.id"
                    class="border-border rounded-2xl border p-4"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0 space-y-1">
                            <p class="truncate font-extrabold">
                                {{ course.name }}
                            </p>
                            <p class="text-muted-foreground text-sm">
                                {{ formatCourseKindLabel(course.type) }} ·
                                {{ formatMyCoursesHoursLabel(course) }}
                            </p>
                        </div>
                        <StatusBadge
                            :label="
                                formatCourseParticipantStatusLabel(
                                    course.status,
                                )
                            "
                            :tone="getMyCoursesStatusTone(course.status)"
                            class="shrink-0"
                        />
                    </div>

                    <MyCoursesProgressBar :course="course" class="mt-4" />
                </article>
            </div>
        </template>
    </DataTableShell>
</template>
