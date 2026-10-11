import { describe, expect, it } from 'vitest';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { vehicleDeletionBlockMessage } from './deletion';

const vehicle = {
    id: 'vehicle-1',
    isDefault: false,
    deletionBlockReason: null,
} as Vehicle;

describe('vehicleDeletionBlockMessage', () => {
    it('blocks the default vehicle', () => {
        expect(
            vehicleDeletionBlockMessage({
                ...vehicle,
                isDefault: true,
                deletionBlockReason: 'DEFAULT',
            }),
        ).toContain('domyślnego');
    });

    it('allows the only default vehicle when the server reports no blocker', () => {
        expect(
            vehicleDeletionBlockMessage({ ...vehicle, isDefault: true }),
        ).toBeNull();
    });

    it('blocks a vehicle with scheduled lessons', () => {
        expect(
            vehicleDeletionBlockMessage({
                ...vehicle,
                deletionBlockReason: 'SCHEDULED_LESSONS',
            }),
        ).toContain('zaplanowanymi lekcjami');
    });

    it('allows a vehicle without blockers', () => {
        expect(vehicleDeletionBlockMessage(vehicle)).toBeNull();
    });
});
