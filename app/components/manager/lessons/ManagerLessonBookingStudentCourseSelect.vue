<script setup lang="ts">
import { formatCourseKindLabel } from '~/types/courses/course';
import type { StudentCourseWithKind } from '~/types/lessons/lessonBooking';
import {
    formatStudentCourseStatusLabel,
    formatStudentDisplayName,
    type StudentListItem,
} from '~/types/students/student';

defineProps<{
    students: readonly StudentListItem[];
    filteredCourses: readonly StudentCourseWithKind[];
    loadCoursesError: string | null;
    disabled: boolean;
}>();

const selectedStudentUserId = defineModel<string>('selectedStudentUserId', {
    required: true,
});
const selectedCourseId = defineModel<string>('selectedCourseId', {
    required: true,
});
</script>

<template>
    <div class="space-y-2">
        <label
            class="text-sm leading-none font-medium"
            for="lesson-booking-student"
        >
            Kursant
        </label>
        <UiSelect v-model="selectedStudentUserId" :disabled="disabled">
            <UiSelectTrigger
                id="lesson-booking-student"
                class="w-full"
                aria-required="true"
            >
                <UiSelectValue placeholder="â€” Wybierz kursanta â€”" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="student in students"
                        :key="student.userId"
                        :value="student.userId"
                    >
                        {{ formatStudentDisplayName(student) }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
    </div>

    <p v-if="loadCoursesError" class="text-destructive text-sm" role="alert">
        {{ loadCoursesError }}
    </p>

    <div v-if="selectedStudentUserId" class="space-y-2">
        <label
            class="text-sm leading-none font-medium"
            for="lesson-booking-course"
        >
            Kurs
        </label>
        <UiSelect
            v-model="selectedCourseId"
            :disabled="disabled || filteredCourses.length === 0"
        >
            <UiSelectTrigger
                id="lesson-booking-course"
                class="w-full"
                aria-required="true"
            >
                <UiSelectValue placeholder="â€” Wybierz kurs â€”" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="course in filteredCourses"
                        :key="course.id"
                        :value="course.id"
                        :disabled="course.status === 'FINISHED'"
                        :title="
                            course.status === 'FINISHED'
                                ? 'Kurs zakoĹ„czony â€” wybierz inny lub odznacz'
                                : undefined
                        "
                    >
                        {{ course.name }} ({{ course.category }})
                        <template v-if="course.kind">
                            â€” {{ formatCourseKindLabel(course.kind) }}
                        </template>
                        â€” {{ formatStudentCourseStatusLabel(course.status) }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <p
            v-if="
                selectedStudentUserId &&
                filteredCourses.length === 0 &&
                !loadCoursesError
            "
            class="text-muted-foreground text-xs"
            role="status"
        >
            Brak kursĂłw praktycznych lub dodatkowych dla tego kursanta.
        </p>
    </div>
</template>
