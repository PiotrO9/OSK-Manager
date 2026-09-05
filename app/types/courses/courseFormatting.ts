import type { CourseKind, CourseParticipantStatus } from './courseModels';

const COURSE_KIND_LABELS: Record<CourseKind, string> = {
    THEORY_GROUP: 'Teoria (grupa)',
    PRACTICAL: 'Praktyka',
    EXTRA: 'Kurs dodatkowy',
};

export function formatCourseKindLabel(kind: CourseKind): string {
    return COURSE_KIND_LABELS[kind] ?? kind;
}

const COURSE_PARTICIPANT_STATUS_LABELS: Record<
    CourseParticipantStatus,
    string
> = {
    ACTIVE: 'Aktywny',
    FINISHED: 'Ukończony',
};

export function formatCourseParticipantStatusLabel(
    status: CourseParticipantStatus,
): string {
    return COURSE_PARTICIPANT_STATUS_LABELS[status] ?? status;
}
