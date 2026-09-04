import type { AssignStudentsToEventResponse } from '~/types/events/event';

export function isEventStudentPickerSubmitDisabled(options: {
    isAssigning: boolean;
    capacityNumber: number | null;
}): boolean {
    if (options.isAssigning) {
        return true;
    }

    return options.capacityNumber === 0;
}

export function getEventStudentPickerPrimarySubmitLabel(options: {
    isAssigning: boolean;
    selectedCount: number;
}): string {
    if (options.isAssigning) {
        return 'Zapisywanie…';
    }

    if (options.selectedCount === 0) {
        return 'Kontynuuj bez kursantów';
    }

    return `Zapisz (${options.selectedCount}) kursantów`;
}

export function getAssignStudentsToEventSuccessDescription(
    result: AssignStudentsToEventResponse,
): string {
    const parts: string[] = [`Dopisano: ${result.assigned}.`];

    if (result.skipped > 0) {
        parts.push(`Pominięto już zapisanych: ${result.skipped}.`);
    }

    return parts.join(' ');
}
