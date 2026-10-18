<script setup lang="ts">
import { formatCourseKindLabel } from '~/types/courses/course';
import type {
    StudentCourseWithKind,
    LessonBookingEligibleStudent,
} from '~/types/lessons/lessonBooking';
import { formatStudentCourseStatusLabel } from '~/types/students/student';

defineProps<{
    students: readonly LessonBookingEligibleStudent[];
    filteredCourses: readonly StudentCourseWithKind[];
    loadCoursesError: string | null;
    disabled: boolean;
    isLoadingStudents: boolean;
    studentsError: string | null;
    hasMoreStudents: boolean;
}>();

const emit = defineEmits<{ loadMore: [] }>();
const studentSearch = defineModel<string>('studentSearch', { required: true });

const selectedStudentUserId = defineModel<string>('selectedStudentUserId', {
    required: true,
});
const selectedCourseId = defineModel<string>('selectedCourseId', {
    required: true,
});
</script>

<template>
    <ManagerLessonBookingStudentPicker
        v-model:search="studentSearch"
        v-model:selected-student-user-id="selectedStudentUserId"
        :students="students"
        :disabled="disabled"
        :is-loading="isLoadingStudents"
        :error="studentsError"
        :has-more="hasMoreStudents"
        @load-more="emit('loadMore')"
    />

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
                <UiSelectValue placeholder="— Wybierz kurs —" />
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
                                ? 'Kurs zakończony — wybierz inny lub odznacz'
                                : undefined
                        "
                    >
                        {{ course.name }} ({{ course.category }})
                        <template v-if="course.kind">
                            — {{ formatCourseKindLabel(course.kind) }}
                        </template>
                        — {{ formatStudentCourseStatusLabel(course.status) }}
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
            Brak kursów, które może prowadzić dostępny instruktor.
        </p>
    </div>
</template>
