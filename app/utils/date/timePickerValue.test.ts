import { describe, expect, it } from 'vitest';
import {
    angleForClockHour,
    clockAngleFromPoint,
    formatTimePickerValue,
    hourFromClockAngle,
    isTimePickerCandidateAllowed,
    isTimePickerHourSelectable,
    minuteFromClockAngle,
    nearestAllowedMinuteForHour,
    normalizeTimePickerValue,
    parseTimePickerValue,
    timePickerValueToMinutes,
} from './timePickerValue';

describe('timePickerValue', () => {
    it('parses strict HH:mm values', () => {
        expect(parseTimePickerValue('08:30')).toEqual({
            hour: 8,
            minute: 30,
        });
        expect(parseTimePickerValue('23:59')).toEqual({
            hour: 23,
            minute: 59,
        });
        expect(parseTimePickerValue('24:00')).toBeNull();
        expect(parseTimePickerValue('8:00')).toBeNull();
    });

    it('formats and clamps clock values', () => {
        expect(formatTimePickerValue(8, 5)).toBe('08:05');
        expect(formatTimePickerValue(99, -4)).toBe('23:00');
    });

    it('normalizes invalid input with the default availability fallback', () => {
        expect(normalizeTimePickerValue('')).toEqual({
            hour: 8,
            minute: 0,
        });
    });

    it('converts strict time values to minutes', () => {
        expect(timePickerValueToMinutes('08:15')).toBe(495);
        expect(timePickerValueToMinutes('bad')).toBeNull();
    });

    it('guards candidates with exclusive bounds', () => {
        expect(
            isTimePickerCandidateAllowed(8, 0, { minExclusive: '08:00' }),
        ).toBe(false);
        expect(
            isTimePickerCandidateAllowed(8, 1, { minExclusive: '08:00' }),
        ).toBe(true);
        expect(
            isTimePickerCandidateAllowed(16, 0, { maxExclusive: '16:00' }),
        ).toBe(false);
        expect(
            isTimePickerCandidateAllowed(15, 59, { maxExclusive: '16:00' }),
        ).toBe(true);
    });

    it('checks whether an hour has any selectable minute', () => {
        expect(isTimePickerHourSelectable(16, { maxExclusive: '16:00' })).toBe(
            false,
        );
        expect(isTimePickerHourSelectable(8, { minExclusive: '08:00' })).toBe(
            true,
        );
    });

    it('finds the nearest minute that keeps the selected hour valid', () => {
        expect(
            nearestAllowedMinuteForHour(8, 0, { minExclusive: '08:00' }),
        ).toBe(1);
        expect(
            nearestAllowedMinuteForHour(16, 59, { maxExclusive: '16:00' }),
        ).toBeNull();
    });

    it('maps pointer geometry to clock values', () => {
        expect(clockAngleFromPoint(128, 0)).toBe(0);
        expect(clockAngleFromPoint(256, 128)).toBe(90);
        expect(minuteFromClockAngle(90)).toBe(15);
        expect(hourFromClockAngle(0, 110)).toBe(12);
        expect(hourFromClockAngle(0, 70)).toBe(0);
        expect(angleForClockHour(15)).toBe(90);
    });
});
