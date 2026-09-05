import { getEventStudentPickerCapacitySummary } from '~/utils/events/eventStudentPickerCapacity';

export function useEventStudentPickerCapacityState(input: {
    capacity: () => number | null;
    selectedCount: () => number;
}) {
    const capacitySummary = computed(() =>
        getEventStudentPickerCapacitySummary({
            capacity: input.capacity(),
            selectedCount: input.selectedCount(),
        }),
    );

    const capacityNumber = computed(() => capacitySummary.value.capacityNumber);
    const isCapacityReached = computed(
        () => capacitySummary.value.isCapacityReached,
    );
    const remainingSlots = computed(() => capacitySummary.value.remainingSlots);
    const capacityBadgeVariant = computed(
        () => capacitySummary.value.badgeVariant,
    );
    const capacityBadgeLabel = computed(() => capacitySummary.value.badgeLabel);

    return {
        capacitySummary,
        capacityNumber,
        isCapacityReached,
        remainingSlots,
        capacityBadgeVariant,
        capacityBadgeLabel,
    };
}
