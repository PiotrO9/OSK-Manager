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
    <div class="space-y-2">
        <label
            class="text-sm leading-none font-medium"
            for="lesson-booking-student"
        >
            Kursant
        </label>
        <UiInput
            v-model="studentSearch"
            type="search"
            aria-label="Szukaj kursanta"
            placeholder="Szukaj po imieniu, nazwisku lub e-mailu"
            :disabled="disabled"
        />
        <UiSelect
            v-model="selectedStudentUserId"
            :disabled="disabled || isLoadingStudents || students.length === 0"
        >
            <UiSelectTrigger
                id="lesson-booking-student"
                class="w-full"
                aria-required="true"
            >
                <UiSelectValue placeholder="— Wybierz kursanta —" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="student in students"
                        :key="student.userId"
                        :value="student.userId"
                    >
                        {{ `${student.firstName} ${student.lastName}`.trim() }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <p v-if="studentsError" class="text-destructive text-xs" role="alert">
            {{ studentsError }}
        </p>
        <p
            v-else-if="isLoadingStudents"
            class="text-muted-foreground text-xs"
            role="status"
        >
            Wczytywanie kursantów…
        </p>
        <p
            v-else-if="students.length === 0"
            class="text-muted-foreground text-xs"
            role="status"
        >
            Brak kursantów z kursami, które może prowadzić dostępny instruktor.
        </p>
        <UiButton
            v-if="hasMoreStudents"
            type="button"
            variant="outline"
            size="sm"
            :disabled="disabled || isLoadingStudents"
            @click="emit('loadMore')"
        >
            Pokaż kolejnych kursantów
        </UiButton>
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
