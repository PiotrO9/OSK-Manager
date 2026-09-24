import { describe, expect, it } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { displayVehicle } from './managerScheduleCalendarUtils';

function scheduleItem(
    vehicle: ScheduleLessonItem['vehicle'],
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'SCHEDULED',
        startTime: '2026-09-07T10:00:00',
        endTime: '2026-09-07T11:00:00',
        vehicle,
    };
}

describe('managerScheduleCalendarUtils', () => {
    it('shows vehicle model and registration without the fleet number prefix', () => {
        expect(
            displayVehicle(
                scheduleItem({
                    id: 'vehicle-1',
                    name: 'Pojazd 3 - Skoda Fabia',
                    registrationNumber: 'DWO0003',
                }),
            ),
        ).toBe('Skoda Fabia (DWO0003)');
    });

    it('keeps regular vehicle names unchanged', () => {
        expect(
            displayVehicle(
                scheduleItem({
                    id: 'vehicle-1',
                    name: 'Toyota Yaris',
                    registrationNumber: 'DWO0004',
                }),
            ),
        ).toBe('Toyota Yaris (DWO0004)');
    });

    it('falls back to registration number when vehicle name is missing', () => {
        expect(
            displayVehicle(
                scheduleItem({
                    id: 'vehicle-1',
                    name: '',
                    registrationNumber: 'DWO0003',
                }),
            ),
        ).toBe('DWO0003');
    });
});
