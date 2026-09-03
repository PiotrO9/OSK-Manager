import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { InstructorEvent } from '~/types/events/instructorEvent';

import { useManagerEventEditActionLabels } from './useManagerEventEditActionLabels';

function installVueGlobals() {
    vi.stubGlobal('computed', computed);
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

function setupLabels(
    options: {
        loadedEvent?: InstructorEvent | null;
        schoolId?: string;
        formStartLocal?: string;
        formEndLocal?: string;
        formInstructorId?: string;
    } = {},
) {
    return useManagerEventEditActionLabels({
        schoolId: computed(() => options.schoolId ?? 'school-1'),
        loadedEvent: ref(options.loadedEvent ?? instructorEvent()),
        formStartLocal: ref(options.formStartLocal ?? '2026-08-16T10:00'),
        formEndLocal: ref(options.formEndLocal ?? '2026-08-16T11:00'),
        formInstructorId: ref(options.formInstructorId ?? 'instructor-1'),
    });
}

describe('useManagerEventEditActionLabels', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        installVueGlobals();
    });

    it('builds schedule back route with selected instructor and school id', () => {
        const labels = setupLabels({
            schoolId: 'school-1',
            formInstructorId: ' instructor-2 ',
            loadedEvent: instructorEvent({ instructorId: 'instructor-1' }),
        });

        expect(labels.scheduleBackHref.value).toEqual({
            path: '/manager/instructors/instructor-2/schedule',
            query: { schoolId: 'school-1' },
        });
    });

    it('falls back to loaded event instructor and plain path without school id', () => {
        const labels = setupLabels({
            schoolId: '',
            formInstructorId: '',
            loadedEvent: instructorEvent({ instructorId: 'instructor-1' }),
        });

        expect(labels.scheduleBackHref.value).toBe(
            '/manager/instructors/instructor-1/schedule',
        );
    });

    it('falls back to instructors list when instructor is missing', () => {
        const labels = setupLabels({
            formInstructorId: '',
            loadedEvent: instructorEvent({ instructorId: '' }),
        });

        expect(labels.scheduleBackHref.value).toBe('/manager/instructors');
    });

    it('formats delete dialog time label and header range labels', () => {
        const sameDay = setupLabels({
            formStartLocal: '2026-08-16T10:00',
            formEndLocal: '2026-08-16T11:00',
        });

        expect(sameDay.deleteDialogTimeLabel.value).toContain('10:00');
        expect(sameDay.deleteDialogTimeLabel.value).toContain('11:00');
        expect(sameDay.headerDateRangeLabel.value).toContain('16');

        const sameMonth = setupLabels({
            formStartLocal: '2026-08-16T10:00',
            formEndLocal: '2026-08-18T11:00',
        });

        expect(sameMonth.headerDateRangeLabel.value).toContain('16-18');

        const differentMonth = setupLabels({
            formStartLocal: '2026-08-31T10:00',
            formEndLocal: '2026-09-02T11:00',
        });

        expect(differentMonth.headerDateRangeLabel.value).toContain('-');
    });

    it('returns empty/default labels for invalid dates', () => {
        const labels = setupLabels({
            formStartLocal: 'invalid',
            formEndLocal: '2026-08-16T11:00',
        });

        expect(labels.deleteDialogTimeLabel.value).toBe('');
        expect(labels.headerDateRangeLabel.value).toBe('Termin');
    });
});
