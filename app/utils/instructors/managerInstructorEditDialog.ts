import type { CourseTypeOption } from '~/types/courses/courseType';

export interface InstructorEditCourseTypeRow {
    item: CourseTypeOption;
    isUnavailable: boolean;
}

export function parseInstructorExperienceYearsInput(value: string): number {
    const trimmed = value.trim();

    if (trimmed === '') {
        return 0;
    }

    const parsed = Number.parseInt(trimmed, 10);

    return Number.isNaN(parsed) ? 0 : parsed;
}

export function normalizeInstructorCourseTypeIds(ids: string[]): string[] {
    const out: string[] = [];

    for (const raw of ids) {
        const id = raw.trim();

        if (id && !out.includes(id)) {
            out.push(id);
        }
    }

    return out;
}

export function buildInstructorEditCourseTypeRows(
    courseTypes: readonly CourseTypeOption[],
    selectedQualifiedCourseTypes: readonly CourseTypeOption[],
): InstructorEditCourseTypeRow[] {
    const rows: InstructorEditCourseTypeRow[] = courseTypes.map((item) => ({
        item,
        isUnavailable: false,
    }));
    const knownIds = new Set(rows.map((row) => row.item.id));

    for (const item of selectedQualifiedCourseTypes) {
        if (!knownIds.has(item.id)) {
            rows.push({ item, isUnavailable: true });
        }
    }

    return rows;
}

export function updateInstructorCourseTypeSelection(
    currentIds: string[],
    id: string,
    checked: boolean | 'indeterminate',
): string[] {
    const normalizedCurrent = normalizeInstructorCourseTypeIds(currentIds);
    const normalizedId = id.trim();

    if (!normalizedId) {
        return normalizedCurrent;
    }

    if (checked === true) {
        return normalizedCurrent.includes(normalizedId)
            ? normalizedCurrent
            : [...normalizedCurrent, normalizedId];
    }

    return normalizedCurrent.filter((item) => item !== normalizedId);
}
