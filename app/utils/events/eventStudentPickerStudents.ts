import type { StudentListItem } from '~/types/students/student';
import { formatStudentDisplayName } from '~/types/students/student';

export function getEventStudentPickerStudentsFetchLimit(
    capacityNumber: number | null,
): number {
    if (capacityNumber === null) {
        return 100;
    }

    return Math.min(100, Math.max(1, capacityNumber));
}

export function getEventStudentPickerExcludedUserIds(
    userIds: string[] | undefined,
): Set<string> {
    const out = new Set<string>();

    for (const id of userIds ?? []) {
        const trimmed = id.trim();

        if (trimmed) {
            out.add(trimmed);
        }
    }

    return out;
}

export function filterEventStudentPickerStudents(options: {
    students: StudentListItem[];
    query: string;
    excludedUserIds: Set<string>;
}): StudentListItem[] {
    const q = options.query.trim().toLowerCase();

    return options.students.filter((student) => {
        if (options.excludedUserIds.has(student.userId.trim())) {
            return false;
        }

        if (!student.isActive) {
            return false;
        }

        if (!q) {
            return true;
        }

        const name = formatStudentDisplayName(student).toLowerCase();
        const email = student.email.toLowerCase();

        return name.includes(q) || email.includes(q);
    });
}

export function isEventStudentPickerRowSelectionBlocked(options: {
    userId: string;
    selectedUserIds: string[];
    isCapacityReached: boolean;
}): boolean {
    if (!options.isCapacityReached) {
        return false;
    }

    return !options.selectedUserIds.includes(options.userId);
}
