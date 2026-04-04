import type { DrivingSchool } from '~/types/drivingSchool';

/**
 * Jedyna szkoła na koncie i oznaczona jako domyślna — przełącznik „domyślna”
 * nie powinien pozwalać na wyłączenie.
 */
export function isOskDefaultSwitchLocked(
    schools: readonly DrivingSchool[],
    editingSchool: DrivingSchool | null,
): boolean {
    if (editingSchool === null || schools.length !== 1) {
        return false;
    }

    return editingSchool.isDefault === true;
}

export function getOskClearDefaultBlockedMessage(schoolCount: number): string {
    if (schoolCount === 1) {
        return 'Przy jednej szkole jazdy na koncie nie można wyłączyć statusu domyślnej.';
    }

    return 'Aby wyłączyć status domyślnej dla tej szkoły, najpierw ustaw inną szkołę jako domyślną i zapisz zmiany.';
}
