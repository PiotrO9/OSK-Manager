import type { CourseInstructorRef } from '~/types/courses/course';
import type { InstructorListItem } from './instructorModels';

export function formatInstructorDisplayName(item: InstructorListItem): string {
    const parts = [item.firstName, item.lastName]
        .map((namePart) => namePart.trim())
        .filter((namePart) => namePart.length > 0);

    if (parts.length === 0) {
        return '—';
    }

    return parts.join(' ');
}

export function instructorHasCourseCategoryQualification(
    instructor: InstructorListItem,
    categoryCode: string,
): boolean {
    const code = categoryCode.trim();

    if (!code) {
        return false;
    }

    return (instructor.qualifiedCourseTypes ?? []).some(
        (courseType) => courseType.code.trim() === code,
    );
}

/**
 * Wartość opcji selecta (InstructorProfile.id): dopasowanie do aktualnego
 * instruktora z GET kursu (`instructor.id` = User.id lub heurystyka po nazwie).
 */
export function resolveInstructorProfileIdForCourseSelection(
    courseInstructor: CourseInstructorRef | null | undefined,
    instructors: InstructorListItem[],
): string {
    if (!courseInstructor) {
        return '';
    }

    const userId = courseInstructor.id.trim();

    if (userId.length > 0) {
        const byUserId = instructors.find(
            (instructor) => instructor.userId === userId,
        );

        if (byUserId) {
            return byUserId.id;
        }
    }

    const name = courseInstructor.name?.trim() ?? '';

    if (name.length === 0) {
        return '';
    }

    const byName = instructors.find(
        (instructor) => formatInstructorDisplayName(instructor).trim() === name,
    );

    return byName?.id ?? '';
}
