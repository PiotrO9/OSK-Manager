import { describe, expect, it } from 'vitest';
import {
    getAssignStudentsToEventSuccessDescription,
    getEventStudentPickerPrimarySubmitLabel,
    isEventStudentPickerSubmitDisabled,
} from '~/utils/events/eventStudentPickerSubmit';

describe('eventStudentPickerSubmit', () => {
    it('disables submit while assigning or when capacity is zero', () => {
        expect(
            isEventStudentPickerSubmitDisabled({
                isAssigning: true,
                capacityNumber: null,
            }),
        ).toBe(true);
        expect(
            isEventStudentPickerSubmitDisabled({
                isAssigning: false,
                capacityNumber: 0,
            }),
        ).toBe(true);
        expect(
            isEventStudentPickerSubmitDisabled({
                isAssigning: false,
                capacityNumber: 1,
            }),
        ).toBe(false);
        expect(
            isEventStudentPickerSubmitDisabled({
                isAssigning: false,
                capacityNumber: null,
            }),
        ).toBe(false);
    });

    it('builds primary submit label', () => {
        expect(
            getEventStudentPickerPrimarySubmitLabel({
                isAssigning: true,
                selectedCount: 2,
            }),
        ).toBe('Zapisywanie…');
        expect(
            getEventStudentPickerPrimarySubmitLabel({
                isAssigning: false,
                selectedCount: 0,
            }),
        ).toBe('Kontynuuj bez kursantów');
        expect(
            getEventStudentPickerPrimarySubmitLabel({
                isAssigning: false,
                selectedCount: 3,
            }),
        ).toBe('Zapisz (3) kursantów');
    });

    it('builds success toast description', () => {
        expect(
            getAssignStudentsToEventSuccessDescription({
                assigned: 2,
                skipped: 0,
            }),
        ).toBe('Dopisano: 2.');
        expect(
            getAssignStudentsToEventSuccessDescription({
                assigned: 2,
                skipped: 1,
            }),
        ).toBe('Dopisano: 2. Pominięto już zapisanych: 1.');
    });
});
