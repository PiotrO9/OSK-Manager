<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next';
import {
    formatCourseKindLabel,
    formatCourseParticipantStatusLabel,
    type CurrentUserCourseItem,
} from '~/types/courses/course';

defineProps<{
    courses: CurrentUserCourseItem[];
    isLoading: boolean;
    errorMessage: string | null;
    visibleCoursesLabel: string;
}>();

const emit = defineEmits<{
    retry: [];
}>();
</script>

<template>
    <DataTableShell
        title="Lista kursów"
        description="Kursy przypisane do Twojego konta."
        :is-loading="isLoading"
        :error-message="errorMessage"
        empty-title="Brak kursów"
        empty-description="Nie masz jeszcze przypisanych kursów."
        @retry="emit('retry')"
    >
        <template #toolbar>
            <StatusBadge
                label="Filtry"
                tone="neutral"
                subtle
                class="hidden sm:inline-flex"
            />
            <StatusBadge :label="visibleCoursesLabel" tone="neutral" subtle />
        </template>

        <EmptyState
            v-if="courses.length === 0"
            title="Brak kursów"
            description="Nie masz jeszcze przypisanych kursów."
            class="m-4"
        />

        <table v-else class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-muted/40 text-muted-foreground border-b">
                <tr>
                    <th scope="col" class="px-4 py-3 font-semibold">Nazwa</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Typ</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Postęp</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Status</th>
                </tr>
            </thead>
            <tbody class="divide-border divide-y">
                <tr
                    v-for="course in courses"
                    :key="course.id"
                    class="hover:bg-muted/30"
                >
                    <td class="px-4 py-3">
                        <div class="flex min-w-0 items-center gap-3">
                            <span
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
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
                                    {{ course.totalHours }} h
                                </p>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
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

        <template v-if="courses.length > 0" #mobile>
            <div class="space-y-3 p-4">
                <article
                    v-for="course in courses"
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
                                {{ course.totalHours }} h
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
