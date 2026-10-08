import { describe, expect, it } from 'vitest';
import { normalizeVehicle, normalizeVehicleDetail } from './vehicle';

describe('normalizeVehicle', () => {
    it('normalizes unavailableUntil from camel case payloads', () => {
        expect(
            normalizeVehicle(
                {
                    id: 'vehicle-1',
                    name: 'Toyota',
                    registrationNumber: 'KR 12345',
                    status: 'UNAVAILABLE',
                    unavailableUntil: '2026-07-10',
                },
                0,
            ),
        ).toMatchObject({
            unavailableUntil: '2026-07-10',
        });
    });

    it('normalizes unavailableUntil from snake case payloads', () => {
        expect(
            normalizeVehicle(
                {
                    id: 'vehicle-1',
                    name: 'Toyota',
                    registrationNumber: 'KR 12345',
                    status: 'UNAVAILABLE',
                    unavailable_until: '2026-07-10T00:00:00.000Z',
                },
                0,
            ),
        ).toMatchObject({
            unavailableUntil: '2026-07-10',
        });
    });

    it('preserves the vehicle data contract across alternate API field names', () => {
        expect(
            normalizeVehicleDetail(
                {
                    id: 'vehicle-2',
                    label: 'Skoda',
                    registration_number: 'WA 12345',
                    isActive: false,
                    is_default: true,
                    inspection_date: '2026-08-01T10:00:00.000Z',
                    insurance_date: '2026-09-01',
                    model_year: '2020',
                    mileage_km: '45000',
                    photo_url: ' /vehicle.jpg ',
                },
                1,
            ),
        ).toEqual({
            id: 'vehicle-2',
            name: 'Skoda',
            registrationNumber: 'WA 12345',
            status: 'UNAVAILABLE',
            unavailableUntil: null,
            isDefault: true,
            inspectionDate: '2026-08-01',
            insuranceDate: '2026-09-01',
            modelYear: 2020,
            mileageKm: 45000,
            updatedAt: null,
            photoUrl: '/vehicle.jpg',
        });
    });

    it('normalizes valid timestamps and rejects dates without a time zone', () => {
        expect(
            normalizeVehicle({ updated_at: '2026-10-08T14:32:00+02:00' }, 0)
                ?.updatedAt,
        ).toBe('2026-10-08T12:32:00.000Z');
        expect(
            normalizeVehicle({ updatedAt: '2026-10-08T14:32:00' }, 0)
                ?.updatedAt,
        ).toBeNull();
    });
});
