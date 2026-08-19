export const COURSE_KINDS = ['THEORY_GROUP', 'PRACTICAL', 'EXTRA'] as const;

export type CourseKind = (typeof COURSE_KINDS)[number];

export function isCourseKind(value: unknown): value is CourseKind {
    return (
        typeof value === 'string' && COURSE_KINDS.includes(value as CourseKind)
    );
}
