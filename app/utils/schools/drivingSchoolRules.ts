import type { DrivingSchool } from '~/types/schools/drivingSchool';

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
