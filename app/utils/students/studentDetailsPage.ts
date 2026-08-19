import type { StudentDetail } from '~/types/students/student';

export function getStudentDetailsRouteUserIdString(rawId: unknown): string {
    if (typeof rawId === 'string') {
        return rawId.trim();
    }

    if (Array.isArray(rawId)) {
        return String(rawId[0] ?? '').trim();
    }

    return '';
}

export function getStudentDetailsDisplayName(
    student: StudentDetail | null,
): string {
    if (!student) {
        return 'Kursant';
    }

    const name = [student.firstName, student.lastName]
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .join(' ');

    return name.length > 0 ? name : 'Kursant';
}

export function getStudentDetailsInitials(
    student: StudentDetail | null,
): string {
    if (!student) {
        return 'K';
    }

    const first = student.firstName.trim().charAt(0);
    const last = student.lastName.trim().charAt(0);
    const initials = `${first}${last}`.trim();

    return initials.length > 0 ? initials.toUpperCase() : 'K';
}

export function getStudentDetailsSubtitle(
    student: StudentDetail | null,
): string {
    const category = student?.courses[0]?.category?.trim();

    if (category) {
        return `Kursant - Kat. ${category}`;
    }

    return 'Kursant';
}

export function getStudentNotesOverviewLabel(
    student: StudentDetail | null,
): string {
    const notes = student?.notes?.trim();

    return notes && notes.length > 0 ? 'Dodano' : 'Brak notatki';
}

export function getStudentProcessOverviewLabel(input: {
    isLoading: boolean;
    hasError: boolean;
    total: number;
    completed: number;
}): string {
    if (input.isLoading) {
        return 'Wczytywanie';
    }

    if (input.hasError) {
        return 'Błąd';
    }

    if (input.total === 0) {
        return 'Brak kroków';
    }

    return `${input.completed}/${input.total}`;
}

export function getStudentCountOverviewLabel(input: {
    isLoading: boolean;
    hasError: boolean;
    count: number;
}): string {
    if (input.isLoading) {
        return 'Wczytywanie';
    }

    if (input.hasError) {
        return 'Błąd';
    }

    return `${input.count}`;
}
