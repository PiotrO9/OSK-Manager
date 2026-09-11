<script setup lang="ts">
import type { StudentListRow } from '~/types/students/studentListView';
import {
    formatStudentDisplayName,
    type StudentListItem,
} from '~/types/students/student';

interface Props {
    students: readonly StudentListItem[];
    activeSchoolId: string;
    isStudentsLoading: boolean;
    showDetailsLink?: boolean;
}
const props = withDefaults(defineProps<Props>(), { showDetailsLink: true });
const emit = defineEmits<{ assignCourse: [student: StudentListItem] }>();
const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
const rows = computed<StudentListRow[]>(() =>
    props.students.map((student) => {
        const date = new Date(student.createdAt);

        return {
            student,
            name: formatStudentDisplayName(student),
            initials:
                `${student.firstName.trim()[0] ?? ''}${student.lastName.trim()[0] ?? ''}`.toUpperCase() ||
                '—',
            dateLabel: Number.isNaN(date.getTime())
                ? 'Brak daty'
                : dateFormatter.format(date),
            detailsTo:
                props.showDetailsLink
                    ? {
                          path: `/manager/students/${student.userId}`,
                      }
                    : null,
        };
    }),
);
</script>

<template>
    <DataTableShell aria-label="Lista kursantów">
        <div class="@container">
            <ManagerStudentsDesktopTable
                :rows="rows"
                :active-school-id="activeSchoolId"
                :is-students-loading="isStudentsLoading"
                @assign-course="emit('assignCourse', $event)"
            />
            <ManagerStudentsMobileCards
                :rows="rows"
                :active-school-id="activeSchoolId"
                :is-students-loading="isStudentsLoading"
                @assign-course="emit('assignCourse', $event)"
            />
        </div>
    </DataTableShell>
</template>
