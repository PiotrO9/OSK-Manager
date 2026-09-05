import type {
    InstructorEvent,
    TheoryEventEligibleCapacity,
    TheoryEventEligibleStudentRow,
    TheoryEventEligibleStudentsData,
} from '~/types/events/instructorEvent';
import type { StudentListItem } from '~/types/students/student';

export function sortManagerEventParticipantIds(
    ids: readonly string[],
): string[] {
    return [...ids]
        .map((s) => s.trim())
        .filter(Boolean)
        .sort();
}

export function readManagerEventStudentUserIds(
    event: InstructorEvent | null,
): string[] {
    const ids = event?.studentUserIds;

    return Array.isArray(ids)
        ? ids.map((x) => String(x).trim()).filter(Boolean)
        : [];
}

export function buildManagerEventTheoryStudentDraft(
    event: InstructorEvent | null,
): {
    baselineIds: string[];
    draftIds: string[];
} {
    if (!event) {
        return {
            baselineIds: [],
            draftIds: [],
        };
    }

    const ids = readManagerEventStudentUserIds(event);

    return {
        baselineIds: sortManagerEventParticipantIds(ids),
        draftIds: [...ids],
    };
}

export function isManagerEventTheoryEvent(
    event: InstructorEvent | null,
): boolean {
    return (
        String(event?.type ?? '')
            .trim()
            .toUpperCase() === 'THEORY'
    );
}

export function managerEventDraftIdBelongsToStudentRow(
    row: StudentListItem,
    assignedId: string,
): boolean {
    const t = assignedId.trim();

    if (!t) {
        return false;
    }

    if (t === row.userId.trim()) {
        return true;
    }

    const pid = row.id?.trim();

    return Boolean(pid && t === pid);
}

export function isManagerEventTheoryRowChecked(params: {
    row: StudentListItem;
    draftIds: readonly string[];
}): boolean {
    return params.draftIds.some((id) =>
        managerEventDraftIdBelongsToStudentRow(params.row, id),
    );
}

export function getManagerEventCanonicalParticipantUserId(
    row: StudentListItem,
): string {
    return row.userId.trim() || row.id.trim();
}

export function formatManagerEventTheoryCapacitySummary(
    data: TheoryEventEligibleStudentsData | null,
): string | null {
    if (!data) {
        return null;
    }

    const { limit, used, remaining } = data.capacity;

    if (limit === null) {
        return `Miejsca na evencie: ${used} (bez limitu)`;
    }

    const rem =
        remaining === null ? '---' : String(Math.max(0, Math.trunc(remaining)));

    return `Miejsca: ${used} / ${limit} (wolnych: ${rem})`;
}

export function isManagerEventTheoryStudentsDirty(params: {
    event: InstructorEvent | null;
    draftIds: readonly string[];
    baselineIds: readonly string[];
}): boolean {
    if (!params.event || !isManagerEventTheoryEvent(params.event)) {
        return false;
    }

    return (
        JSON.stringify(sortManagerEventParticipantIds(params.draftIds)) !==
        JSON.stringify(params.baselineIds)
    );
}

export function resolveManagerEventCapacityForStudentPicker(params: {
    parsedCapacity: number | null | false;
    eventCapacity?: number | null;
}): number | null {
    if (params.parsedCapacity === false) {
        return params.eventCapacity ?? null;
    }

    if (params.parsedCapacity !== null) {
        return params.parsedCapacity;
    }

    return params.eventCapacity ?? null;
}

export function isManagerEventEligibleRowInteractive(
    row: TheoryEventEligibleStudentRow,
): boolean {
    return row.isAssignedToEvent || row.canAssign;
}

export function getManagerEventCapacityLimitError(params: {
    nextChecked: boolean;
    capacity: number | null;
    isAlreadyChecked: boolean;
    draftCount: number;
}): string | null {
    if (
        params.nextChecked &&
        params.capacity !== null &&
        !params.isAlreadyChecked &&
        params.draftCount >= Math.trunc(params.capacity)
    ) {
        return 'Osiągnięto limit miejsc - odznacz kogoś lub zwiększ limit w danych bloku.';
    }

    return null;
}

export function getNextManagerEventTheoryStudentDraft(params: {
    row: StudentListItem;
    nextChecked: boolean;
    draftIds: readonly string[];
}): string[] {
    if (params.nextChecked) {
        const isAlreadyChecked = isManagerEventTheoryRowChecked({
            row: params.row,
            draftIds: params.draftIds,
        });

        if (isAlreadyChecked) {
            return [...params.draftIds];
        }

        const canonical = getManagerEventCanonicalParticipantUserId(params.row);

        return canonical
            ? [...params.draftIds, canonical]
            : [...params.draftIds];
    }

    return params.draftIds.filter(
        (id) => !managerEventDraftIdBelongsToStudentRow(params.row, id),
    );
}

export function readManagerEventEligibleCapacity(
    data: TheoryEventEligibleStudentsData,
): TheoryEventEligibleCapacity {
    return data.capacity;
}
