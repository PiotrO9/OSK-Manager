<script setup lang="ts">
import type { CurrentUserCourseItem } from '~/types/courses/course';
import { formatStudentLessonBookingCourseCountLabel } from '~/utils/student/studentLessonBookingPage';

const props = defineProps<{
    courses: CurrentUserCourseItem[];
    isLoading: boolean;
    disabled?: boolean;
}>();

const selectedCourseId = defineModel<string>({ required: true });

const hasCourses = computed(() => props.courses.length > 0);

const courseCountLabel = computed(() => {
    if (props.isLoading) {
        return 'Wczytywanie kursów…';
    }

    return formatStudentLessonBookingCourseCountLabel(props.courses.length);
});
</script>

<template>
    <section class="border-border bg-muted/20 rounded-xl border p-4">
        <div class="min-w-0 space-y-1.5">
            <div class="flex items-center justify-between gap-3">
                <label
                    for="student-booking-course"
                    class="text-foreground text-sm font-medium"
                >
                    Kurs
                </label>
                <span class="text-muted-foreground text-xs" aria-live="polite">
                    {{ courseCountLabel }}
                </span>
            </div>

            <UiSelect
                v-model="selectedCourseId"
                :disabled="disabled || isLoading || !hasCourses"
            >
                <UiSelectTrigger
                    id="student-booking-course"
                    class="bg-background h-11 w-full rounded-xl"
                >
                    <UiSelectValue placeholder="Wybierz kurs" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="course in courses"
                            :key="course.id"
                            :value="course.id"
                        >
                            {{ course.name }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>
    </section>
</template>
