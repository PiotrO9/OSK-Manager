import { describe, expect, it } from 'vitest';
import { vehicleSupportsCourseType } from './courseCompatibility';
import { normalizeVehicle } from '~/types/vehicles/vehicle';
import { vehicleToFormDraft, buildVehicleWritePayload } from './vehicleForm';
const type = { id: 'b', code: 'B', name: 'Kategoria B' };

describe('vehicle categories', () => {
    it('requires exact membership, including legacy and absent course context', () => {
        const vehicle = normalizeVehicle(
            {
                id: 'car',
                name: 'Car',
                registrationNumber: 'WA1234',
                supportedCourseTypes: [type],
            },
            0,
        )!;

        expect(vehicleSupportsCourseType(vehicle, 'b')).toBe(true);
        expect(vehicleSupportsCourseType(vehicle, 'be')).toBe(false);
        expect(vehicleSupportsCourseType(vehicle, undefined)).toBe(false);
        expect(
            vehicleSupportsCourseType(
                { ...vehicle, supportedCourseTypes: [] },
                'b',
            ),
        ).toBe(false);
    });
    it('roundtrips multi-category data through the vehicle form', () => {
        const vehicle = normalizeVehicle(
            {
                id: 'car',
                supportedCourseTypes: [
                    type,
                    { id: 'be', code: 'BE', name: 'B+E' },
                    type,
                ],
            },
            0,
        )!;
        const draft = vehicleToFormDraft('edit', vehicle);

        expect(draft.supportedCourseTypeIds).toEqual(['b', 'be']);
        expect(
            buildVehicleWritePayload(draft, null, null).supportedCourseTypeIds,
        ).toEqual(['b', 'be']);
    });
});
