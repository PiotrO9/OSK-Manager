import type { BadgeVariants } from '~/components/shadcn/badge';
import type { StudentListItem } from './studentModels';

/** Znane statusy uczestnictwa — etykiety UI; nieznany kod → „Nieznany”. */
export const STUDENT_COURSE_STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Aktywny',
    FINISHED: 'Zakończony',
    UNKNOWN: 'Nieznany',
};

export function formatStudentCourseStatusLabel(status: string): string {
    const key = status.trim().toUpperCase();

    if (!key) {
        return 'Nieznany';
    }

    return STUDENT_COURSE_STATUS_LABELS[key] ?? 'Nieznany';
}

type BadgeVariant = NonNullable<BadgeVariants['variant']>;

export function getStudentCourseStatusVariant(status: string): BadgeVariant {
    const key = status.trim().toUpperCase();

    if (key === 'ACTIVE') return 'default';

    if (key === 'FINISHED') return 'secondary';

    return 'outline';
}

export function formatStudentDisplayName(student: StudentListItem): string {
    const parts = [student.firstName, student.lastName]
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    if (parts.length === 0) {
        return '—';
    }

    return parts.join(' ');
}
