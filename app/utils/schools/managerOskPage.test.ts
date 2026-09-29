import { describe, expect, it } from 'vitest';
import {
    buildManagerOskEditFormValues,
    buildManagerOskCreateBody,
    buildManagerOskUpdateBody,
    getManagerOskBlankFormValues,
    getManagerOskErrorMessage,
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
