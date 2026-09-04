import { describe, expect, it } from 'vitest';
import {
    buildManagerOskCreateBody,
    buildManagerOskStatsSummary,
    buildManagerOskUpdateBody,
    countManagerOskDefaultSchools,
} from './managerOskPage';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

const school = (overrides: Partial<DrivingSchool> = {}): DrivingSchool => ({
    id: overrides.id ?? 'school-1',
    name: overrides.name ?? 'OSK Test',
    city: overrides.city ?? null,
    address: overrides.address ?? null,
    isDefault: overrides.isDefault,
});

describe('manager OSK page model', () => {
    it('counts schools marked as default', () => {
        expect(
            countManagerOskDefaultSchools([
                school({ id: 'school-1', isDefault: true }),
                school({ id: 'school-2', isDefault: false }),
                school({ id: 'school-3', isDefault: true }),
            ]),
        ).toBe(2);
    });

    it('sums fulfilled stats and reports rejected partial results', () => {
        const summary = buildManagerOskStatsSummary({
            instructorResults: [
                { status: 'fulfilled', value: 2 },
                { status: 'rejected', reason: new Error('x') },
                { status: 'fulfilled', value: 3 },
            ],
            studentResults: [
                { status: 'fulfilled', value: 10 },
                { status: 'fulfilled', value: 5 },
            ],
        });

        expect(summary).toEqual({
            instructorCount: 5,
            studentCount: 15,
            hasRejected: true,
        });
    });

    it('builds create body without empty optional fields', () => {
        expect(
            buildManagerOskCreateBody({
                name: 'OSK Test',
                city: ' ',
                address: '  Warszawa 1 ',
            }),
        ).toEqual({
            name: 'OSK Test',
            address: 'Warszawa 1',
        });
    });

    it('builds update body with nulls for empty optional fields', () => {
        expect(
            buildManagerOskUpdateBody({
                name: 'OSK Test',
                city: '  Kraków ',
                address: '',
            }),
        ).toEqual({
            name: 'OSK Test',
            city: 'Kraków',
            address: null,
        });
    });
});
