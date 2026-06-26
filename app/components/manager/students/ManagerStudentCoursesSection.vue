<script setup lang="ts">
import { ClipboardList } from 'lucide-vue-next';
import {
    formatStudentCourseStatusLabel,
    getStudentCourseStatusVariant,
    type StudentCourseItem,
} from '~/types/students/student';

defineProps<{
    courses: readonly StudentCourseItem[];
}>();

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '--';
}
</script>

<template>
    <section
        aria-labelledby="student-courses-heading"
        class="border-border bg-card min-w-0 rounded-2xl border p-5 shadow-sm"
    >
        <div class="mb-4 flex items-start justify-between gap-3">
            <div class="space-y-1">
                <h2
                    id="student-courses-heading"
                    class="text-foreground text-xl font-extrabold"
                >
                    Kursy w szkole
                </h2>
                <p class="text-muted-foreground text-sm">
                    Przypisania kursanta do kursĂłw w tej OSK.
                </p>
            </div>
            <ClipboardList
                class="text-muted-foreground size-5 shrink-0"
                aria-hidden="true"
            />
        </div>

        <EmptyState
            v-if="courses.length === 0"
            title="Brak kursĂłw"
            description="Kursant nie jest przypisany do ĹĽadnego kursu w tej szkole."
        />

        <ul v-else class="space-y-3" role="list">
            <li
                v-for="course in courses"
                :key="course.id"
                class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div class="min-w-0">
                    <p
                        class="text-foreground text-sm font-extrabold wrap-break-word"
                    >
                        {{ displayText(course.name) }}
                    </p>
                    <p class="text-muted-foreground mt-1 text-xs">
                        Kategoria:
                        {{
                            course.category.trim().length > 0
                                ? course.category
                                : '--'
                        }}
                    </p>
                </div>
                <UiBadge
                    :variant="getStudentCourseStatusVariant(course.status)"
                    class="w-fit shrink-0 rounded-full"
                    :aria-label="`Status w kursie: ${formatStudentCourseStatusLabel(course.status)}`"
                >
                    {{ formatStudentCourseStatusLabel(course.status) }}
                </UiBadge>
            </li>
        </ul>
    </section>
</template>
