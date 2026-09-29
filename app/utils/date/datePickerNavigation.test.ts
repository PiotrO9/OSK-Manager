import { describe, expect, it } from 'vitest';
import {
    createDatePickerYearList,
    resolveDatePickerYearRange,
} from './datePickerNavigation';

describe('date picker navigation', () => {
    it('uses a compact range around the current year by default', () => {
        expect(resolveDatePickerYearRange({ currentYear: 2026 })).toEqual({
            start: 2016,
            end: 2046,
        });
    });

    it('normalizes a reversed configured range', () => {
        expect(
            resolveDatePickerYearRange({
                currentYear: 2026,
                configuredRange: { start: 2040, end: 2020 },
            }),
        ).toEqual({ start: 2020, end: 2040 });
    });

    it('keeps the selected year available in the navigation list', () => {
        expect(
            resolveDatePickerYearRange({
                currentYear: 2026,
                selectedYear: 2050,
                configuredRange: { start: 2020, end: 2040 },
            }),
        ).toEqual({ start: 2020, end: 2050 });
    });

    it('clamps navigation years to date min and max limits', () => {
        expect(
            resolveDatePickerYearRange({
                currentYear: 2026,
                minYear: 2024,
                maxYear: 2032,
                configuredRange: { start: 2020, end: 2040 },
            }),
        ).toEqual({ start: 2024, end: 2032 });
    });

    it('creates an inclusive ascending year list', () => {
        expect(createDatePickerYearList({ start: 2028, end: 2031 })).toEqual([
            2028, 2029, 2030, 2031,
        ]);
    });
});
