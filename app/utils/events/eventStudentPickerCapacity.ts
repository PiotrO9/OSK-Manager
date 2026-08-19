export type EventStudentPickerCapacityBadgeVariant =
    | 'default'
    | 'secondary'
    | 'destructive';

export interface EventStudentPickerCapacitySummaryInput {
    capacity: number | null | undefined;
    selectedCount: number;
}

export interface EventStudentPickerCapacitySummary {
    capacityNumber: number | null;
    isCapacityReached: boolean;
    remainingSlots: number | null;
    badgeVariant: EventStudentPickerCapacityBadgeVariant;
    badgeLabel: string;
}

export function normalizeEventStudentPickerCapacity(
    capacity: number | null | undefined,
): number | null {
    if (capacity === null || capacity === undefined) {
        return null;
    }

    if (!Number.isFinite(capacity)) {
        return null;
    }

    return Math.max(0, Math.floor(capacity));
}

export function getEventStudentPickerCapacitySummary({
    capacity,
    selectedCount,
}: EventStudentPickerCapacitySummaryInput): EventStudentPickerCapacitySummary {
    const capacityNumber = normalizeEventStudentPickerCapacity(capacity);
    const safeSelectedCount = Math.max(0, Math.floor(selectedCount));
    const isCapacityReached =
        capacityNumber !== null && safeSelectedCount >= capacityNumber;
    const remainingSlots =
        capacityNumber === null
            ? null
            : Math.max(0, capacityNumber - safeSelectedCount);

    if (capacityNumber === null) {
        return {
            capacityNumber,
            isCapacityReached,
            remainingSlots,
            badgeVariant: 'secondary',
            badgeLabel: `${safeSelectedCount} wybrano (bez limitu)`,
        };
    }

    if (capacityNumber === 0) {
        return {
            capacityNumber,
            isCapacityReached,
            remainingSlots,
            badgeVariant: 'destructive',
            badgeLabel: 'Brak miejsc',
        };
    }

    return {
        capacityNumber,
        isCapacityReached,
        remainingSlots,
        badgeVariant: isCapacityReached ? 'destructive' : 'secondary',
        badgeLabel: `${safeSelectedCount} / ${capacityNumber} miejsc zajętych`,
    };
}
