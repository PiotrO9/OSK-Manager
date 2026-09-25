import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, watch } from 'vue';
import type { InstructorEvent } from '~/types/events/instructorEvent';

function installVueGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
}

function instructorEvent(
    overrides: Partial<InstructorEvent> = {},
): InstructorEvent {
    return {
        id: 'event-1',
        instructorId: 'instructor-1',
        type: 'DRIVE',
        startTime: '2026-08-16T08:00:00.000Z',
        endTime: '2026-08-16T09:00:00.000Z',
        vehicleId: 'vehicle-1',
        capacity: 2,
        createdAt: '2026-08-15T10:00:00.000Z',
        ...overrides,
    };
}

describe('useManagerEventEditForm', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        installVueGlobals();
    });

    it('keeps a prefilled event clean and marks instructor changes as dirty', async () => {
        const loadedEvent = ref<InstructorEvent | null>(null);
        const { useManagerEventEditForm } =
            await import('./useManagerEventEditForm');
        const form = useManagerEventEditForm({ loadedEvent });
        const event = instructorEvent();

        loadedEvent.value = event;
        form.applyPrefill(event);

        expect(form.currentSnapshot.value).toEqual(form.baselineSnapshot.value);
        expect(form.isFormFieldsDirty.value).toBe(false);

        form.formInstructorId.value = 'instructor-2';

        expect(form.isFormFieldsDirty.value).toBe(true);
    });
});
