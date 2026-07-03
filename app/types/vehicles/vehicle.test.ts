import { describe, expect, it } from 'vitest';
import { normalizeVehicle } from './vehicle';

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
});
