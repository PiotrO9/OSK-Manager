import { describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { VehicleDetail } from '~/types/vehicles/vehicle';
import {
    displayVehicleDetailsDate,
    displayVehicleDetailsOptional,
    displayVehicleDetailsText,
    getVehicleDetailsInitials,
    useVehicleDetailsPresentation,
} from './useVehicleDetailsPresentation';

function vehicle(overrides: Partial<VehicleDetail> = {}): VehicleDetail {
    return {
        id: 'vehicle-1',
        name: 'Toyota Yaris',
        registrationNumber: 'KR 12345',
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: false,
        inspectionDate: '2026-08-20',
        insuranceDate: '2026-09-15',
        modelYear: 2020,
        mileageKm: 12345,
        photoUrl: null,
        ...overrides,
    };
}

describe('vehicle details presentation helpers', () => {
    it('formats empty text and optional numeric values', () => {
        expect(displayVehicleDetailsText(' Toyota ')).toBe('Toyota');
        expect(displayVehicleDetailsText('   ')).toBe('--');
        expect(displayVehicleDetailsOptional(null)).toBe('--');
        expect(displayVehicleDetailsOptional(12345)).toBe('12 345');
        expect(displayVehicleDetailsOptional(' KR 12345 ')).toBe('KR 12345');
    });

    it('formats dates and keeps invalid dates readable', () => {
        expect(displayVehicleDetailsDate(null)).toBe('--');
        expect(displayVehicleDetailsDate('bad-date')).toBe('bad-date');
        expect(displayVehicleDetailsDate('2026-08-20')).toBe(
            '20 sierpnia 2026',
        );
    });

    it('builds initials from vehicle name or registration number', () => {
        expect(getVehicleDetailsInitials('Toyota Yaris', 'KR123')).toBe('TY');
        expect(getVehicleDetailsInitials('', 'KR 12345')).toBe('K1');
        expect(getVehicleDetailsInitials('', '')).toBe('PO');
    });
});

describe('useVehicleDetailsPresentation', () => {
    it('builds stable view model for complete vehicle details', () => {
        vi.stubGlobal('computed', computed);

        const presentation = useVehicleDetailsPresentation({
            vehicle: ref(vehicle({ isDefault: true })),
            backToListHref: ref('/vehicles'),
            editHref: ref('/vehicles/vehicle-1/edit'),
        });

        expect(presentation.vehicleTitle.value).toBe('Toyota Yaris');
        expect(presentation.registrationNumberLabel.value).toBe('KR 12345');
        expect(presentation.profileRows.value).toEqual([
            { label: 'Status', value: 'Aktywny' },
            { label: 'Rejestracja', value: 'KR 12345' },
            { label: 'Rocznik', value: '2020' },
            { label: 'Przebieg', value: '12 345 km' },
        ]);
        expect(
            presentation.overviewItems.value.map((item) => item.badge),
        ).toEqual(['OK', 'Aktywny', 'Tak']);
        expect(presentation.relatedItems.value.map((item) => item.to)).toEqual([
            '/vehicles/vehicle-1/edit',
            '/vehicles',
        ]);
    });

    it('marks missing technical dates as warning presentation', () => {
        vi.stubGlobal('computed', computed);

        const presentation = useVehicleDetailsPresentation({
            vehicle: ref(
                vehicle({
                    inspectionDate: null,
                    insuranceDate: null,
                    modelYear: null,
                    mileageKm: null,
                }),
            ),
            backToListHref: ref('/vehicles'),
            editHref: ref('/vehicles/vehicle-1/edit'),
        });

        expect(presentation.overviewItems.value[0]).toMatchObject({
            badge: 'Uzupelnij',
            tone: 'warning',
        });
        expect(
            presentation.activityItems.value.map((item) => item.badge),
        ).toEqual(['Brak', 'Brak', 'Widoczne']);
        expect(presentation.profileRows.value.at(-1)).toEqual({
            label: 'Przebieg',
            value: '--',
        });
    });
});
