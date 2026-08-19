import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed } from 'vue';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { useVehiclesListPanelSummary } from './useVehiclesListPanelSummary';

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle {
    return {
        id: 'vehicle-1',
        name: 'Toyota Yaris',
        registrationNumber: 'KR12345',
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: false,
        inspectionDate: null,
        insuranceDate: null,
        modelYear: null,
        mileageKm: null,
        ...overrides,
    };
}

describe('useVehiclesListPanelSummary', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.stubGlobal('computed', computed);
    });

    it('counts vehicle availability and keeps create route in school context', () => {
        const summary = useVehiclesListPanelSummary({
            activePanel: 'manager',
            resolvedSchoolId: 'school-1',
            vehicles: [
                vehicle({ id: 'vehicle-1', status: 'ACTIVE', isDefault: true }),
                vehicle({ id: 'vehicle-2', status: 'UNAVAILABLE' }),
            ],
        });

        expect(summary.resultsLabel.value).toBe('2 wyniki');
        expect(summary.activePanelLabel.value).toBe('statusy');
        expect(summary.createVehicleTarget.value).toEqual({
            path: '/vehicles/new',
            query: { schoolId: 'school-1' },
        });
        expect(summary.summaryItems.value).toEqual([
            { label: 'Pojazdy', value: 2, tone: 'neutral' },
            { label: 'Dostepne', value: 1, tone: 'success' },
            { label: 'Niedostępne', value: 1, tone: 'warning' },
            { label: 'Domyslne', value: 1, tone: 'info' },
        ]);
    });
});
