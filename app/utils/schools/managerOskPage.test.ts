import { describe, expect, it } from 'vitest';
import {
    buildManagerOskEditFormValues,
    buildManagerOskCreateBody,
    buildManagerOskStatsSummary,
    buildManagerOskUpdateBody,
    countManagerOskDefaultSchools,
    getManagerOskBlankFormValues,
    getManagerOskErrorMessage,
    removeManagerOskSchoolById,
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

    it('removes a school by id without mutating the source list', () => {
        const source = [
            school({ id: 'school-1' }),
            school({ id: 'school-2' }),
            school({ id: 'school-3' }),
        ];

        expect(removeManagerOskSchoolById(source, 'school-2')).toEqual([
            source[0],
            source[2],
        ]);
        expect(source).toHaveLength(3);
    });

    it('normalizes form values for blank and edit modes', () => {
        expect(getManagerOskBlankFormValues()).toEqual({
            name: '',
            city: '',
            address: '',
            asDefault: false,
        });

        expect(
            buildManagerOskEditFormValues(
                school({
                    name: 'OSK Edit',
                    city: null,
                    address: 'Krakowska 1',
                    isDefault: true,
                }),
            ),
        ).toEqual({
            name: 'OSK Edit',
            city: '',
            address: 'Krakowska 1',
            asDefault: true,
        });
    });

    it('uses error message when available and otherwise falls back', () => {
        expect(
            getManagerOskErrorMessage(
                new Error('Backend unavailable'),
                'Fallback',
            ),
        ).toBe('Backend unavailable');
        expect(getManagerOskErrorMessage('boom', 'Fallback')).toBe('Fallback');
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
